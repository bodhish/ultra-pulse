import React from "react";

const average = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

const message = (max) => {
  if (max > 140 || max < 65) {
    return "It Looks like you haven't placed your finger correctly, Try again 🙃";
  }
  if (max < 100) {
    return "You heart rate is well in range, you seem pretty chill with the elon-twitter deal. 🥳";
  }
  if (max < 125) {
    return "You heart rate is a little high, damn, the elon-twitter deal seems to be worrying you. 😟";
  }
  return "You heart rate is high, you're taking elon-twitter deal a bit too seriously. 🤕";
};
const Result = ({ bpm }) => {
  let array = [].concat.apply([], Object.values(bpm));
  let possibleValues = array.filter((value) => value > 50 && value < 150);

  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-800 text-center">
        Your Hear Rate is {Math.round(average(possibleValues))}bpm
      </h1>
      <div className="my-4">
        <div className="text-gray-800 mt-6 text-lg text-center px-10">
          <div>{message(Math.max(...possibleValues))}</div>
        </div>
      </div>
      <div className="w-full px-4">
        <a className="flex flex-col font-bold btn w-full border-2 border-gray-800 bg-white hover:bg-gray-900 hover:text-white focus:text-white focus:bg-gray-900 button-xl mt-4 md:mt-5">
          <span>Get more health insights</span>
        </a>
      </div>
      <div className="text-xs text-gray-800 hidden">
        For Debug (Should be deleted before shipping)
        <div className="flex flex-wrap mt-2">
          {Object.keys(bpm).map((key, index) => {
            return (
              <div key={index} className="border m-1 p-1">
                <div>Question: {index + 1}</div>
                <div> Min: {Math.min(...bpm[key])}</div>
                <div> Max: {Math.max(...bpm[key])}</div>
                <div> Avg: {Math.round(average(bpm[key]))}</div>
              </div>
            );
          })}
          <div className="border m-1 p-1">
            <div>Total</div>
            <div>Min: {Math.min(...array)}</div>
            <div>Max: {Math.max(...array)}</div>
            <div>
              Avg:
              {Math.round(average(array))}
            </div>
          </div>
          <div className="border m-1 p-1">
            <div>optimized</div>
            <div>Min: {Math.min(...possibleValues)}</div>
            <div>Max: {Math.max(...possibleValues)}</div>
            <div>
              Avg:
              {Math.round(average(possibleValues))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Result;
