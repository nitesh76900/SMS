import React from 'react';

export const MultipleChoiceOptions = ({
  options,
  questionType,
  onOptionChange,
  onRemoveOption,
  onAddOption,
}) => (
  <div className="space-y-4">
    {options.map((option, index) => (
      <div key={index} className="flex items-center space-x-3">
        <input
          type="text"
          value={option.text}
          onChange={(e) => onOptionChange(index, "text", e.target.value)}
          placeholder={`Option ${index + 1}`}
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        />
        <div className="flex items-center space-x-2">
          <input
            type={questionType === "SINGLE_CHOICE" ? "radio" : "checkbox"}
            name="correctOption"
            checked={option.isCorrect}
            onChange={(e) => onOptionChange(index, "isCorrect", e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
          />
          <span className="text-sm text-gray-600">Correct</span>
        </div>
        {options.length > 2 && (
          <button
            type="button"
            onClick={() => onRemoveOption(index)}
            className="p-2 text-red-600 hover:text-red-800 transition-colors"
          >
            Remove
          </button>
        )}
      </div>
    ))}
    {options.length < 6 && (
      <button
        type="button"
        onClick={onAddOption}
        className="w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
      >
        Add Option
      </button>
    )}
  </div>
);

export const TrueFalseOptions = ({ options, onOptionChange }) => (
  <div className="space-y-4">
    {options.map((option, index) => (
      <div key={index} className="flex items-center space-x-3">
        <span className="flex-1 px-4 py-2">{option.text}</span>
        <div className="flex items-center space-x-2">
          <input
            type="radio"
            name="correctOption"
            checked={option.isCorrect}
            onChange={(e) => onOptionChange(index, "isCorrect", e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
          />
          <span className="text-sm text-gray-600">Correct</span>
        </div>
      </div>
    ))}
  </div>
);

export const ShortAnswerInput = ({ value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Correct Answer
    </label>
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder="Enter the correct answer"
      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
    />
  </div>
);