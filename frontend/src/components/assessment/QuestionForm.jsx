import React, { useState } from 'react';
import {
  QuestionTextField,
  QuestionTypeSelect,
  MarksInput,
} from './QuestionFormFields';
import {
  MultipleChoiceOptions,
  TrueFalseOptions,
  ShortAnswerInput,
} from './AnswerOptions';

const QuestionForm = ({ onSave, onCancel, initialData }) => {
  const [question, setQuestion] = useState(
    initialData || {
      questionText: "",
      questionType: "SINGLE_CHOICE",
      options: [
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ],
      marks: 1,
      explanation: "",
      difficultyLevel: "MEDIUM",
      isRequired: true,
      orderIndex: 0,
      correctAnswer: "",
    }
  );

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...question.options];
    newOptions[index] = { ...newOptions[index], [field]: value };

    if (
      field === "isCorrect" &&
      value &&
      question.questionType === "SINGLE_CHOICE"
    ) {
      newOptions.forEach((opt, i) => {
        if (i !== index) opt.isCorrect = false;
      });
    }

    setQuestion((prev) => ({ ...prev, options: newOptions }));
  };

  const handleQuestionTypeChange = (e) => {
    const newType = e.target.value;
    let updatedQuestion = {
      ...question,
      questionType: newType,
      options: [],
    };

    switch (newType) {
      case "SINGLE_CHOICE":
      case "MULTIPLE_CHOICE":
        updatedQuestion.options = [
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
        ];
        break;
      case "TRUE_FALSE":
        updatedQuestion.options = [
          { text: "True", isCorrect: false },
          { text: "False", isCorrect: false },
        ];
        break;
      case "SHORT_ANSWER":
        updatedQuestion.correctAnswer = "";
        break;
      default:
        break;
    }

    setQuestion(updatedQuestion);
  };

  const addOption = () => {
    if (question.options.length < 6) {
      setQuestion((prev) => ({
        ...prev,
        options: [...prev.options, { text: "", isCorrect: false }],
      }));
    }
  };

  const removeOption = (index) => {
    if (question.options.length > 2) {
      const newOptions = question.options.filter((_, i) => i !== index);
      setQuestion((prev) => ({ ...prev, options: newOptions }));
    }
  };

  const handleSave = () => {
    let isValid = question.questionText.trim() !== "";

    switch (question.questionType) {
      case "SINGLE_CHOICE":
      case "MULTIPLE_CHOICE":
        isValid = isValid && question.options.some((opt) => opt.isCorrect);
        break;
      case "TRUE_FALSE":
        isValid = isValid && question.options.some((opt) => opt.isCorrect);
        break;
      case "SHORT_ANSWER":
        isValid = isValid && question.correctAnswer.trim() !== "";
        break;
    }

    if (isValid) {
      onSave(question);
    } else {
      alert(
        "Please complete all required fields and ensure correct answer(s) are marked."
      );
    }
  };

  const renderAnswerFields = () => {
    switch (question.questionType) {
      case "SINGLE_CHOICE":
      case "MULTIPLE_CHOICE":
        return (
          <MultipleChoiceOptions
            options={question.options}
            questionType={question.questionType}
            onOptionChange={handleOptionChange}
            onRemoveOption={removeOption}
            onAddOption={addOption}
          />
        );
      case "TRUE_FALSE":
        return (
          <TrueFalseOptions
            options={question.options}
            onOptionChange={handleOptionChange}
          />
        );
      case "SHORT_ANSWER":
        return (
          <ShortAnswerInput
            value={question.correctAnswer}
            onChange={(e) =>
              setQuestion((prev) => ({
                ...prev,
                correctAnswer: e.target.value,
              }))
            }
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {initialData ? "Edit Question" : "Add Question"}
        </h2>

        <div className="space-y-8">
          <QuestionTextField
            value={question.questionText}
            onChange={(e) =>
              setQuestion((prev) => ({
                ...prev,
                questionText: e.target.value,
              }))
            }
          />

          <QuestionTypeSelect
            value={question.questionType}
            onChange={handleQuestionTypeChange}
          />

          <MarksInput
            value={question.marks}
            onChange={(e) =>
              setQuestion((prev) => ({
                ...prev,
                marks: parseInt(e.target.value),
              }))
            }
          />

          {renderAnswerFields()}

          <div className="flex space-x-4">
            <button
              onClick={handleSave}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
            >
              {initialData ? "Update Question" : "Add Question"}
            </button>
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionForm;