import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import QuestionForm from "../components/assessment/QuestionForm";
import QuestionList from "../components/assessment/QuestionList";
import TestService from "../services/testService";
import { getAllClasses } from "../services/classService";

const TestDetailsForm = ({
  test,
  onChange,
  onSubmit,
  isLoading,
  classes,
  subjects,
  onClassChange,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <form onSubmit={onSubmit} className="space-y-8 p-8">
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
                onChange={onChange}
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
                onChange={onChange}
                placeholder="Enter test description"
                maxLength={500}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors min-h-[120px]"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="class"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Class
                </label>
                <select
                  id="class"
                  name="class"
                  value={test.class}
                  onChange={(e) => {
                    onChange(e);
                    onClassChange(e.target.value);
                  }}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Select Class</option>
                  {classes.map((classItem) => (
                    <option key={classItem._id} value={classItem._id}>
                      {classItem.name} - {classItem.section}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={test.subject}
                  onChange={onChange}
                  required
                  disabled={!test.class}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:opacity-50"
                >
                  <option value="">
                    {test.class ? "Select Subject" : "Select Class First"}
                  </option>
                  {subjects.map((subject) => (
                    <option key={subject._id} value={subject.subjectName}>
                      {subject.subjectName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Existing Configuration and Schedule Sections Remain the Same */}
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
                onChange={onChange}
                min={1}
                max={180}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label
                htmlFor="passingPercentage"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Passing Percentage
              </label>
              <input
                id="passingPercentage"
                name="passingPercentage"
                type="number"
                value={test.passingPercentage}
                onChange={onChange}
                min={0}
                max={100}
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
                onChange={onChange}
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
                onChange={onChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Saving..." : "Save Test Details"}
          </button>
        </div>
      </form>
    </div>
  );
};

const TestForm = () => {
  const navigate = useNavigate();
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

  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [testSaved, setTestSaved] = useState(false);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchClasses = async () => {
    try {
      const response = await getAllClasses();
      if (response && response.data) {
        setClasses(response.data);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      showToast("Failed to fetch classes", "error");
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleClassChange = (classId) => {
    const selectedClass = classes.find((c) => c._id === classId);
    if (selectedClass) {
      setSubjects(selectedClass.subjects);

      // Reset subject when class changes
      setTest((prev) => ({
        ...prev,
        subject: "",
      }));
    } else {
      setSubjects([]);
    }
  };

  const handleTestChange = (e) => {
    const { name, value } = e.target;
    setTest((prev) => ({ ...prev, [name]: value }));
  };

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

  // Rest of the component remains the same as in the previous implementation...
  const handleQuestionSave = (questionData) => {
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

  const handleEditQuestion = (index) => {
    setEditingIndex(index);
    setIsAddingQuestion(true);
  };

  const handleDeleteQuestion = (index) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      const updatedQuestions = questions.filter((_, i) => i !== index);
      setQuestions(updatedQuestions);
    }
  };

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
            onClick={() => navigate(-1)}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Back
          </button>
          {questions.length > 0 && (
            <button
              onClick={handleFinalSubmit}
              disabled={isLoading}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              Finalize Test
            </button>
          )}
        </div>

        <div className="space-y-8">
          {!testSaved ? (
            <TestDetailsForm
              test={test}
              onChange={handleTestChange}
              onSubmit={handleTestSubmit}
              isLoading={isLoading}
              classes={classes}
              subjects={subjects}
              onClassChange={handleClassChange}
            />
          ) : (
            <div className="space-y-8">
              {/* Questions Section */}
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

              {/* Question Form */}
              {isAddingQuestion && (
                <QuestionForm
                  onSave={handleQuestionSave}
                  onCancel={() => {
                    setIsAddingQuestion(false);
                    setEditingIndex(null);
                  }}
                  initialData={
                    editingIndex !== null ? questions[editingIndex] : null
                  }
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestForm;
