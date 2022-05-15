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

  console.log(time);

  let question = questions[questionNumber];
  return (
    <div>
      <div className="flex flex-col space-y-4">
        <div>
          <label
            className="block form-input-label"
            htmlFor="submission_proficient_in_local_languages"
          >
            {question.title}
          </label>
        </div>
        {question.answers.map((answer, index) => {
          return (
            <div key={index} className="form-radio-wrapper">
              <label>
                <input
                  type="radio"
                  name="answer"
                  className="form-radio-wrapper"
                  value={index}
                  id={index}
                  checked={answerIndex === index}
                  onChange={(_) => setAnswerIndex(index)}
                />
                <label className="collection_radio_buttons" htmlFor={index}>
                  {answer.title}
                </label>
              </label>
            </div>
          );
        })}
      </div>
      <div className="mt-4">
        <button
          className="flex items-center justify-center w-full md:w-auto text-center text-base font-medium px-6 py-3 bg-gradient-to-br from-yellow-300 to-yellow-600 text-secondary-900 rounded-md shadow-lg hover:shadow-xl hover:from-yellow-400 hover:to-yellow-700 transition"
          disabled={time < 4}
          onClick={() =>
            updateAnswer(setAnswerIndex, updateAnswerCB, answerIndex, setTime)
          }
        >
          {questions.length == questionNumber + 1
            ? "Complete Quiz "
            : "Next Question "}

          {time < 4 && <span> in {4 - time} seconds</span>}
        </button>
      </div>
    </div>
  );
};

export default Questions;
