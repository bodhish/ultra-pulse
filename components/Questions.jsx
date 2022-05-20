import React, { useState, useEffect } from "react";
let updateAnswer = (setAnswerIndex, updateAnswerCB, answerIndex, setTime) => {
  setAnswerIndex(null);
  updateAnswerCB(answerIndex);
  setTime(0);
};

const Questions = ({ questions, questionNumber, updateAnswerCB }) => {
  let [answerIndex, setAnswerIndex] = useState(null);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTime((oldtime) => oldtime + 1), 1000);

    return () => {
      clearInterval(id);
    };
  }, []);

  let answerButtonClasses = (bool) => {
    let c = bool
      ? "bg-gray-900 hover:bg-gray-900 text-white focus:text-white focus:bg-gray-900"
      : "bg-white hover:bg-gray-900 hover:text-white focus:text-white focus:bg-gray-900";
    return `btn border-2 border-gray-900  button-xl mt-3 w-full ${c}`;
  };

  let question = questions[questionNumber];
  return (
    <div>
      <div className="flex flex-col">
        <div>
          <div className="inline-flex leading-tight text-sm text-orange-800 font-semibold bg-orange-200 py-1 px-1 rounded">
            <p className="mr-1">{questionNumber + 1} of 4 -</p>
            <p>Ultra Pulse</p>
          </div>
        </div>
        <div>
          <h1 className="font-bold pt-1 pb-2 leading-tight break-words">
            {question.title}
          </h1>
        </div>
        {question.answers.map((answer, index) => {
          return (
            <div key={index}>
              <div
                className={answerButtonClasses(answerIndex === index)}
                onClick={(_) => setAnswerIndex(index)}
              >
                {answer.title}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-8">
        <button
          className="btn border-2 border-gray-800 bg-white hover:bg-gray-900 hover:text-white focus:text-white focus:bg-gray-900 button-xl w-full"
          disabled={answerIndex == null || time < 4}
          onClick={() =>
            updateAnswer(setAnswerIndex, updateAnswerCB, answerIndex, setTime)
          }
        >
          {questions.length == questionNumber + 1
            ? "Complete Quiz"
            : "Next Question"}

          {time < 4 && answerIndex && (
            <span className="ml-1">in {4 - time} seconds</span>
          )}
          <span className="ml-2">
            <svg
              className="w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M19.92 12.38a1 1 0 0 0 0-.76 1 1 0 0 0-.21-.33l-7-7a1 1 0 0 0-1.42 1.42l5.3 5.3H5a1 1 0 0 0 0 2h11.6l-5.3 5.3a1 1 0 1 0 1.42 1.42l7-7a1 1 0 0 0 .21-.33z"
              />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
};

export default Questions;
