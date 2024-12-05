import React, { useState } from "react";
import TestService from "../services/testService";
import { useToast } from "../context/ToastContext";
import { useNavigate } from "react-router-dom";
const TestForm = () => {
  const showToast = useToast();

  const [test, setTest] = useState({
    title: "",
    description: "",
    duration: 60,
    totalMarks: 0,
    startTime: "",
    endTime: "",
    subject: "",
    class: "",
    passingPercentage: 40,
    isPublished: false,
  });

  // State for questions
  const [questions, setQuestions] = useState([]);
  const navigate = useNavigate();
  // State for managing form stages and editing
  const [testSaved, setTestSaved] = useState(false);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handler for test details change
  const handleTestChange = (e) => {
    const { name, value } = e.target;
    setTest((prev) => ({ ...prev, [name]: value }));
  };

  // Handler for test details submission
  const handleTestSubmit = async (e) => {
    e?.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const startTime = new Date(test.startTime);
      const endTime = new Date(test.endTime);

      if (startTime <= new Date()) {
        showToast("Start time must be in the future", "error");
        throw new Error("Start time must be in the future");
      }

      if (endTime <= startTime) {
        showToast("End time must be after start time", "error");
        throw new Error("End time must be after start time");
      }

      setTestSaved(true);
      showToast("Test details saved successfully", "success");
    } catch (err) {
      setError(err.message);
      showToast(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Question form state and handlers
  const handleQuestionFormState = (questionData) => {
    if (editingIndex !== null) {
      const updatedQuestions = [...questions];
      updatedQuestions[editingIndex] = questionData;
      setQuestions(updatedQuestions);
      setEditingIndex(null);
    } else {
      setQuestions([...questions, questionData]);
    }
    setIsAddingQuestion(false);
  };

  // Edit question handler
  const handleEditQuestion = (index) => {
    setEditingIndex(index);
    setIsAddingQuestion(true);
  };

  // Delete question handler
  const handleDeleteQuestion = (index) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      const updatedQuestions = questions.filter((_, i) => i !== index);
      setQuestions(updatedQuestions);
    }
  };

  // Cancel question addition/editing
  const handleCancel = () => {
    setIsAddingQuestion(false);
    setEditingIndex(null);
  };

  // Final test submission
  const handleFinalSubmit = async () => {
    if (questions.length === 0) {
      showToast("Please add at least one question to the test", "error");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const finalTestData = {
        ...test,
        questions,
        totalQuestions: questions.length,
        totalMarks: questions.reduce((sum, q) => sum + q.marks, 0),
      };

      await TestService.createTest(finalTestData);
      showToast("Test created successfully!", "success");
      navigate("/assesments");
    } catch (err) {
      setError(err.message || "Failed to create test");
      showToast(err.message || "Failed to create test", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Render question form component
  const renderQuestionForm = () => {
    const initialQuestionData = {
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
    };

    return (
      <QuestionForm
        onSave={handleQuestionFormState}
        onCancel={handleCancel}
        initialData={
          editingIndex !== null ? questions[editingIndex] : initialQuestionData
        }
      />
    );
  };

  // Render question list component
  const renderQuestionList = () => {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Questions ({questions.length})
          </h2>
          <button
            onClick={() => setIsAddingQuestion(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Question
          </button>
        </div>

        {questions.length > 0 ? (
          <QuestionList
            questions={questions}
            onEdit={handleEditQuestion}
            onDelete={handleDeleteQuestion}
          />
        ) : !isAddingQuestion ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No questions added yet</p>
            <button
              onClick={() => setIsAddingQuestion(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Your First Question
            </button>
          </div>
        ) : null}
      </div>
    );
  };

  // Main render method
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
            role="alert"
          >
            {error}
          </div>
        )}

        {isLoading && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-blue-500"></div>
          </div>
        )}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => window.history.back()}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Back
          </button>
          {questions.length > 0 && (
            <button
              onClick={handleFinalSubmit}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Finalize Test
            </button>
          )}
        </div>

        <div className="space-y-8">
          {/* Test Creation Form */}
          {!testSaved ? (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <form onSubmit={handleTestSubmit} className="space-y-8 p-8">
                {/* Basic Info Section */}
                <div className="border-b border-gray-200 pb-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">
                    Basic Information
                  </h2>
                  <div className="space-y-6">
                    <div>
                      <label
                        htmlFor="title"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Test Title
                      </label>
                      <input
                        id="title"
                        name="title"
                        type="text"
                        value={test.title}
                        onChange={handleTestChange}
                        placeholder="Enter test title"
                        maxLength={100}
                        required
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={test.description}
                        onChange={handleTestChange}
                        placeholder="Enter test description"
                        maxLength={500}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors min-h-[120px]"
                      />
                    </div>
                  </div>
                </div>

                {/* Test Configuration Section */}
                <div className="border-b border-gray-200 pb-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">
                    Test Configuration
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="duration"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Duration (minutes)
                      </label>
                      <input
                        id="duration"
                        name="duration"
                        type="number"
                        value={test.duration}
                        onChange={handleTestChange}
                        min={1}
                        max={180}
                        required
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="totalMarks"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Total Marks
                      </label>
                      <input
                        id="totalMarks"
                        name="totalMarks"
                        type="number"
                        value={test.totalMarks}
                        onChange={handleTestChange}
                        min={1}
                        required
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Schedule Section */}
                <div className="border-b border-gray-200 pb-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">
                    Test Schedule
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="startTime"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Start Time
                      </label>
                      <input
                        id="startTime"
                        name="startTime"
                        type="datetime-local"
                        value={test.startTime}
                        onChange={handleTestChange}
                        required
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="endTime"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        End Time
                      </label>
                      <input
                        id="endTime"
                        name="endTime"
                        type="datetime-local"
                        value={test.endTime}
                        onChange={handleTestChange}
                        required
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="submit"
                    className="inline-flex justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Save Test Details
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Questions Section */}
              {renderQuestionList()}

              {/* Question Form */}
              {isAddingQuestion && renderQuestionForm()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// QuestionForm Component (Inline)
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
    if (
      question.questionText &&
      question.options.some((opt) => opt.isCorrect)
    ) {
      onSave(question);
    } else {
      alert(
        "Please complete all required fields and mark at least one option as correct."
      );
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {initialData ? "Edit Question" : "Add Question"}
        </h2>

        <div className="space-y-8">
          <div>
            <label
              htmlFor="questionText"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Question Text
            </label>
            <textarea
              id="questionText"
              value={question.questionText}
              onChange={(e) =>
                setQuestion((prev) => ({
                  ...prev,
                  questionText: e.target.value,
                }))
              }
              placeholder="Enter your question"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors min-h-[120px]"
              maxLength={1000}
              required
            />
          </div>

          <div>
            <label
              htmlFor="questionType"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Question Type
            </label>
            <select
              id="questionType"
              value={question.questionType}
              onChange={(e) =>
                setQuestion((prev) => ({
                  ...prev,
                  questionType: e.target.value,
                }))
              }
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="SINGLE_CHOICE">Single Choice</option>
              <option value="MULTIPLE_CHOICE">Multiple Choice</option>
              <option value="TRUE_FALSE">True/False</option>
              <option value="SHORT_ANSWER">Short Answer</option>
            </select>
          </div>

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
              value={question.marks}
              onChange={(e) =>
                setQuestion((prev) => ({
                  ...prev,
                  marks: parseInt(e.target.value),
                }))
              }
              min={1}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="space-y-4">
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-3">
                <input
                  type="text"
                  value={option.text}
                  onChange={(e) =>
                    handleOptionChange(index, "text", e.target.value)
                  }
                  placeholder={`Option ${index + 1}`}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={option.isCorrect}
                    onChange={(e) =>
                      handleOptionChange(index, "isCorrect", e.target.checked)
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-600">Correct</span>
                </div>
                {question.options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="p-2 text-red-600 hover:text-red-800 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            {question.options.length < 6 && (
              <button
                type="button"
                onClick={addOption}
                className="w-full py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Add Option
              </button>
            )}
          </div>

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

// QuestionList Component (Inline)
const QuestionList = ({ questions, onEdit, onDelete }) => {
  return (
    <div className="space-y-4">
      {questions.map((question, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-medium text-lg">Question {index + 1}</h3>
              <p className="mt-2 text-gray-700">{question.questionText}</p>
              <div className="mt-4 space-y-2">
                {question.options.map((option, optIndex) => (
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
                ))}
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
};

export default TestForm;
