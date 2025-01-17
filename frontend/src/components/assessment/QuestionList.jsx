import React from 'react';

const QuestionList = ({ questions, onEdit, onDelete }) => (
  <div className="space-y-4">
    {questions.map((question, index) => (
      <div key={index} className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-medium text-lg">Question {index + 1}</h3>
            <p className="mt-2 text-gray-700">{question.questionText}</p>
            <div className="mt-4 space-y-2">
              {question.questionType !== "SHORT_ANSWER" ? (
                question.options.map((option, optIndex) => (
                  <div key={optIndex} className="flex items-center space-x-2">
                    <span
                      className={`w-4 h-4 inline-block rounded ${
                        option.isCorrect ? "bg-green-500" : "bg-gray-200"
                      }`}
                    ></span>
                    <span className={option.isCorrect ? "font-medium" : ""}>
                      {option.text}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-gray-700">
                  <span className="font-medium">Correct Answer: </span>
                  {question.correctAnswer}
                </div>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(index)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(index)}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default QuestionList;