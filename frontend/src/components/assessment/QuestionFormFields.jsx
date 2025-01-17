import React from 'react';

export const QuestionTextField = ({ value, onChange }) => (
  <div>
    <label
      htmlFor="questionText"
      className="block text-sm font-medium text-gray-700 mb-2"
    >
      Question Text
    </label>
    <textarea
      id="questionText"
      value={value}
      onChange={onChange}
      placeholder="Enter your question"
      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors min-h-[120px]"
      maxLength={1000}
      required
    />
  </div>
);

export const QuestionTypeSelect = ({ value, onChange }) => (
  <div>
    <label
      htmlFor="questionType"
      className="block text-sm font-medium text-gray-700 mb-2"
    >
      Question Type
    </label>
    <select
      id="questionType"
      value={value}
      onChange={onChange}
      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
    >
      <option value="SINGLE_CHOICE">Single Choice</option>
      <option value="MULTIPLE_CHOICE">Multiple Choice</option>
      <option value="TRUE_FALSE">True/False</option>
      <option value="SHORT_ANSWER">Short Answer</option>
    </select>
  </div>
);

export const MarksInput = ({ value, onChange }) => (
  <div>
    <label
      htmlFor="marks"
      className="block text-sm font-medium text-gray-700 mb-2"
    >
      Marks
    </label>
    <input
      type="number"
      id="marks"
      value={value}
      onChange={onChange}
      min={1}
      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
    />
  </div>
);