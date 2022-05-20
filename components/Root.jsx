import React, { useState, useEffect, useRef } from "react";
import Questions from "../components/Questions";
import Result from "../components/Result";
import data from "/data/questions.json";

export default function Root() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const graphCanvasRef = useRef(null);
  const [readings, setReadings] = useState([]);
  const [state, setState] = useState({
    questionNumber: -1,
    page: "home",
    answers: [],
    ready: false,
  });
  const [bpm, setBpm] = useState({});
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

    if (bpmValue && state.questionNumber !== -1) {
      let newBPM = bpm;
      bpm[state.questionNumber]
        ? newBPM[state.questionNumber].push(Math.round(bpmValue))
        : (newBPM = { ...bpm, [state.questionNumber]: [Math.round(bpmValue)] });
      setBpm(newBPM);
    }
    if (state.page != "results") {
      drawGraph(dataStats, readings);
    }
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
      // monitorLoop();
    }, 10);
  };

  const drawGraph = (dataStats, readings) => {
    let graphCanvas = graphCanvasRef.current;
    let graphCanvasWidth = graphCanvas.clientWidth;
    let graphContext = graphCanvas.getContext("2d");
    // Scaling of sample window to the graph width

    const xScaling = graphCanvasWidth / maxSamples;

    // Set offset based on number of samples, so the graph runs from the right edge to the left
    const xOffset = (maxSamples - readings.length) * xScaling;

    graphContext.lineWidth = "1.5";
    graphContext.strokeStyle = "#1F2937";
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

  let updateAnswer = (state, setState, answerIndex) => {
    data.questions.length == state.questionNumber + 1
      ? setState((previousState) => ({
          ...previousState,
          answers: state.answers.concat([answerIndex]),
          page: "results",
        }))
      : setState((previousState) => ({
          ...previousState,
          answers: state.answers.concat([answerIndex]),
          questionNumber: state.questionNumber + 1,
        }));
  };

  let hiddenIf = (bool, classes) => {
    return bool ? "hidden" : classes;
  };

  return (
    <div className="main">
      <div className="w-full md:mt-6 mt-4">
        <div className="home__container flex flex-col justify-between h-auto md:h-full border-2 border-gray-800 rounded-lg bg-orange-50 py-6">
          {state.page != "result" && (
            <section id="graph-container w-full" className="w-full max-w-5xl">
              <canvas
                className="w-full"
                ref={graphCanvasRef}
                height="100"
                id="graph-canvas"
              ></canvas>
            </section>
          )}
          <div className="px-4 md:px-6">
            <div>
              <div className="flex items-center justify-center video-mask mt-2">
                <div className="border rounded-lg overflow-hidden shadow aspect-auto">
                  <video
                    onCanPlay={() => paintToCanvas()}
                    ref={videoRef}
                    className={hiddenIf(state.page !== "home")}
                    playsInline
                    muted
                  />
                </div>
              </div>
              <div className="mt-4">
                {state.page == "home" && (
                  <div>
                    <p className="text-gray-800 text-xs text-center my-4">
                      Wait for the graph to stabilize
                    </p>
                    <div className="w-full">
                      <button
                        className="btn w-full border-2 border-gray-800 bg-white hover:bg-gray-900 hover:text-white focus:text-white focus:bg-gray-900 button-xl mt-4 md:mt-5"
                        onClick={() =>
                          setState((previousState) => ({
                            ...state,
                            page: "quiz",
                            questionNumber: 0,
                          }))
                        }
                      >
                        Start Quiz
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {state.page == "quiz" && (
                <div>
                  <Questions
                    questionNumber={state.questionNumber}
                    questions={data.questions}
                    updateAnswerCB={(answerIndex) =>
                      updateAnswer(state, setState, answerIndex)
                    }
                  />
                </div>
              )}

              {state.page == "results" && (
                <div>
                  <Result bpm={bpm} />
                </div>
              )}
              <div className="hidden">
                <canvas
                  id="sampling-canvas"
                  ref={canvasRef}
                  width="400"
                  height="400"
                ></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
