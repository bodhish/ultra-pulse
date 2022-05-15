import Head from "next/head";
import React, { useState, useEffect, useRef } from "react";

export default function Home() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const graphCanvasRef = useRef(null);
  const [readings, setReadings] = useState([]);
  const [bpm, setBpm] = useState(0);
  let maxSamples = 60 * 5;

  useEffect(() => {
    getVideo();
  }, [videoRef]);

  useEffect(() => {
    const interval = setInterval(() => {
      monitorLoop();
    }, 16.66);
    return () => clearInterval(interval);
  });

  const getVideo = () => {
    navigator.mediaDevices
      .getUserMedia({
        video: {
          width: 300,
          facingMode: "environment",
          whiteBalanceMode: "manual",
          exposureMode: "manual",
          focusMode: "manual",
        },
      })
      .then((stream) => {
        let video = videoRef.current;
        video.srcObject = stream;
        video.play();
      })
      .catch((err) => {
        console.error("error:", err);
      });
  };

  const averageBrightness = (canvas, context) => {
    // 1d array of r, g, b, a pixel data values
    const pixelData = context.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    ).data;
    let sum = 0;

    // Only use the red and green channels as that combination gives the best readings
    for (let i = 0; i < pixelData.length; i += 4) {
      sum = sum + pixelData[i] + pixelData[i + 1];
    }

    // Since we only process two channels out of four we scale the data length to half
    const avg = sum / (pixelData.length * 0.5);

    // Scale to 0 ... 1
    return avg / 255;
  };

  const handleResize = () => {
    log("handleResize", GRAPH_CANVAS.clientWidth, GRAPH_CANVAS.clientHeight);
    GRAPH_CANVAS.width = GRAPH_CANVAS.clientWidth;
    GRAPH_CANVAS.height = GRAPH_CANVAS.clientHeight;
  };

  const monitorLoop = () => {
    let samplingCanvas = canvasRef.current;
    let samplingContext = samplingCanvas.getContext("2d");

    samplingContext.drawImage(
      videoRef.current,
      0,
      0,
      videoRef.current.videoWidth,
      videoRef.current.videoHeight
    );

    const value = averageBrightness(samplingCanvas, samplingContext);
    const time = Date.now();
    if (readings.length > maxSamples) {
      readings.shift();
    }
    readings.push({ value, time });
    setReadings(readings);

    const dataStats = analyzeData(readings);
    const bpmValue = calculateBpm(dataStats.crossings);

    if (bpmValue) {
      setBpm(Math.round(bpmValue));
    }

    drawGraph(dataStats, readings);
  };

  const analyzeData = (samples) => {
    // Get the mean average value of the samples
    const average =
      samples.map((sample) => sample.value).reduce((a, c) => a + c) /
      samples.length;

    // Find the lowest and highest sample values in the data
    // Used for both calculating bpm and fitting the graph in the canvas
    let min = samples[0].value;
    let max = samples[0].value;
    samples.forEach((sample) => {
      if (sample.value > max) {
        max = sample.value;
      }
      if (sample.value < min) {
        min = sample.value;
      }
    });

    // The range of the change in values
    // For a good measurement it should be between  ~ 0.002 - 0.02
    const range = max - min;

    const crossings = getAverageCrossings(samples, average);
    return {
      average,
      min,
      max,
      range,
      crossings,
    };
  };

  const getAverageCrossings = (samples, average) => {
    // Get each sample at points where the graph has crossed below the average level
    // These are visible as the rising edges that pass the midpoint of the graph
    const crossingsSamples = [];
    let previousSample = samples[0]; // Avoid if statement in loop

    samples.forEach(function (currentSample) {
      // Check if next sample has gone below average.
      if (currentSample.value < average && previousSample.value > average) {
        crossingsSamples.push(currentSample);
      }

      previousSample = currentSample;
    });

    return crossingsSamples;
  };

  const calculateBpm = (samples) => {
    if (samples.length < 2) {
      return;
    }

    const averageInterval =
      (samples[samples.length - 1].time - samples[0].time) /
      (samples.length - 1);
    return 60000 / averageInterval;
  };

  const paintToCanvas = () => {
    setTimeout(async () => {
      console.log("Starting mainloop...");
      monitorLoop();
    }, 10);

    // let video = videoRef.current;
    // let photo = photoRef.current;
    // let ctx = photo.getContext("2d");

    // const width = 320;
    // const height = 240;
    // photo.width = width;
    // photo.height = height;

    // return setInterval(() => {
    //   let color = colorRef.current;

    //   ctx.drawImage(video, 0, 0, width, height);
    //   let pixels = ctx.getImageData(0, 0, width, height);

    //   color.style.backgroundColor = `rgb(${pixels.data[0]},${pixels.data[1]},${pixels.data[2]})`;
    //   color.style.borderColor = `rgb(${pixels.data[0]},${pixels.data[1]},${pixels.data[2]})`;
    // }, 200);
  };

  const drawGraph = (dataStats, readings) => {
    let graphCanvas = graphCanvasRef.current;
    let graphCanvasWidth = graphCanvas.clientWidth;
    let graphContext = graphCanvas.getContext("2d");
    // Scaling of sample window to the graph width

    const xScaling = graphCanvasWidth / maxSamples;

    // Set offset based on number of samples, so the graph runs from the right edge to the left
    const xOffset = (maxSamples - readings.length) * xScaling;

    console.log("readings.length", readings.length);
    console.log("xScaling", xScaling);

    graphContext.lineWidth = "1.5";
    graphContext.strokeStyle = "#f76";
    graphContext.lineCap = "round";
    graphContext.lineJoin = "round";

    graphContext.clearRect(0, 0, graphCanvasWidth, 100);
    graphContext.beginPath();

    // Avoid drawing too close to the graph edges due to the line thickness getting cut off
    const maxHeight = 100;
    let previousY = 0;
    readings.forEach((sample, i) => {
      const x = xScaling * i + xOffset;

      let y = graphContext.lineWidth;

      if (sample.value !== 0) {
        y =
          (maxHeight * (sample.value - dataStats.min)) /
            (dataStats.max - dataStats.min) +
          graphContext.lineWidth;
      }

      if (y != previousY) {
        graphContext.lineTo(x, y);
      }

      previousY = y;
    });

    graphContext.stroke();
  };

  return (
    <div className="flex flex-col min-h-screen bg-secondary-900 font-inter">
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="w-full md:max-w-screen-sm mx-auto mt-4 px-4">
        <div className="space-y-4 border border-secondary-700 shadow-lg bg-gradient-to-br from-secondary-800 to-secondary-900 p-4 lg:p-6 rounded-lg">
          <h1 className="text-3xl font-bold text-white">Ultra Pulse!</h1>
          <div className="flex items-center justify-center">
            <video
              onCanPlay={() => paintToCanvas()}
              ref={videoRef}
              className="h-60 w-80"
              playsInline
              muted
            />
          </div>
          <code className="text-white">
            Values are computed based on the difference in the last 2 minutes
          </code>
          <div className="flex items-center justify-center w-full md:w-auto text-center text-base font-medium px-6 py-3 bg-gradient-to-br from-yellow-300 to-yellow-600 text-secondary-900 rounded-md shadow-lg hover:shadow-xl hover:from-yellow-400 hover:to-yellow-700 transition">
            {bpm}
          </div>
          <div className="hidden">
            <canvas
              id="sampling-canvas"
              ref={canvasRef}
              width="400"
              height="400"
            ></canvas>
          </div>
        </div>
        <section id="graph-container w-full" className="w-full max-w-5xl">
          <canvas
            className="w-full"
            ref={graphCanvasRef}
            height="100"
            id="graph-canvas"
          ></canvas>
        </section>
      </main>

      <footer className="bg-secondary-800 w-full border-t border-secondary-700 mt-auto py-2 text-center">
        <a
          href="./"
          target="_blank"
          rel="noopener noreferrer"
          className="text-secondary-400"
        >
          Ultra Pulse
        </a>
      </footer>
    </div>
  );
}
