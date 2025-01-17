import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertCircle,
} from "lucide-react";
import SubmissionService from "../services/submissionservice";
import { useToast } from "../context/ToastContext";
import Loader from "../components/Loader/Loader";

const CustomButton = ({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  className = "",
}) => {
  const baseStyles =
    "px-4 py-2 rounded-lg transition-all duration-200 font-medium flex items-center gap-2 shadow-sm hover:shadow-md";
  const variants = {
    primary:
      "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 disabled:from-blue-300 disabled:to-blue-400",
    secondary:
      "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:bg-gray-50",
    success:
      "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 disabled:from-emerald-300 disabled:to-emerald-400",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${
        disabled ? "cursor-not-allowed opacity-60" : ""
      } ${className}`}
    >
      {children}
    </button>
  );
};

const CustomRadio = ({ id, value, checked, onChange, label }) => {
  return (
    <div className="flex items-center space-x-3 mb-3 group">
      <div className="relative">
        <input
          type="radio"
          id={id}
          value={value}
          checked={checked}
          onChange={onChange}
          className="w-5 h-5 opacity-0 absolute"
        />
        <div
          className={`w-5 h-5 border-2 rounded-full transition-all duration-200 ${
            checked
              ? "border-blue-500 after:content-[''] after:absolute after:w-3 after:h-3 after:bg-blue-500 after:rounded-full after:top-1 after:left-1 group-hover:border-blue-600 group-hover:after:bg-blue-600"
              : "border-gray-300 group-hover:border-gray-400"
          }`}
        />
      </div>
      <label
        htmlFor={id}
        className="text-gray-700 cursor-pointer text-base group-hover:text-gray-900"
      >
        {label}
      </label>
    </div>
  );
};

const CustomCheckbox = ({ id, checked, onChange, label }) => {
  return (
    <div className="flex items-center space-x-3 mb-3 group">
      <div className="relative">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={onChange}
          className="w-5 h-5 opacity-0 absolute"
        />
        <div
          className={`w-5 h-5 border-2 rounded-md transition-all duration-200 ${
            checked
              ? "border-blue-500 bg-blue-500 after:content-[''] after:absolute after:w-2.5 after:h-1.5 after:border-white after:border-b-2 after:border-r-2 after:transform after:rotate-45 after:top-0.5 after:left-1 group-hover:bg-blue-600 group-hover:border-blue-600"
              : "border-gray-300 group-hover:border-gray-400"
          }`}
        />
      </div>
      <label
        htmlFor={id}
        className="text-gray-700 cursor-pointer text-base group-hover:text-gray-900"
      >
        {label}
      </label>
    </div>
  );
};

const CustomCard = ({ children, className = "" }) => {
  return (
    <div
      className={`bg-white rounded-xl shadow-lg p-6 border border-gray-100 ${className}`}
    >
      {children}
    </div>
  );
};

const AssessmentQuestions = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [testData, setTestData] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const showToast = useToast();

  useEffect(() => {
    const fetchTestData = async () => {
      try {
        setLoading(true);
        setError(null);
        const startResponse = await SubmissionService.startTest(testId);
        const testResponse = await SubmissionService.getTestById(testId);
        setSubmission(startResponse.data);
        setTestData(testResponse);
        setTimeLeft(testResponse.duration * 60);
        showToast("Test started successfully", "success");
      } catch (error) {
        setError(error.message);
        showToast(error.message, "error");
      } finally {
        setLoading(false);
      }
    };
    fetchTestData();
  }, [testId, showToast]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit("TIMED_OUT");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleAnswer = (questionId, selectedOptions) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: selectedOptions,
    }));

    setSubmission((prev) => ({
      ...prev,
      answers: prev.answers.some((a) => a.questionId === questionId)
        ? prev.answers.map((a) =>
            a.questionId === questionId ? { ...a, selectedOptions } : a
          )
        : [...prev.answers, { questionId, selectedOptions }],
    }));
  };

  const handleSubmit = async (status = "SUBMITTED") => {
    try {
      setError(null);
      const response = await SubmissionService.submitTest(
        submission._id,
        submission.answers
      );
      showToast("Test submitted successfully", "success");
      navigate(`/assesments-result/${response.data._id}`);
    } catch (error) {
      setError(error.message);
      showToast(`Error submitting test: ${error.message}`, "error");
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-2 text-red-600">
          <AlertCircle className="h-4 w-4" />
          <div>{error}</div>
        </div>
      </div>
    );
  }

  if (!testData || !submission) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <CustomCard>
          <div className="text-center py-8">No test data available</div>
        </CustomCard>
      </div>
    );
  }

  const currentQ = testData.questions[currentQuestion];
  const isMultipleChoice = currentQ?.questionType === "MULTIPLE_CHOICE";
  const timeWarning = timeLeft < 300; // 5 minutes warning

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <CustomCard className="mb-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {testData.title}
            </h1>
            <div className="text-sm text-gray-500">
              Question {currentQuestion + 1} of {testData.totalQuestions} •{" "}
              {currentQ.marks} mark{currentQ.marks > 1 ? "s" : ""}
            </div>
          </div>
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              timeWarning
                ? "bg-red-50 text-red-600"
                : "bg-blue-50 text-blue-600"
            }`}
          >
            <Clock className="w-5 h-5" />
            <span className="font-semibold">{formatTime(timeLeft)}</span>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">
            {currentQ.questionText}
          </h2>

          <div className="space-y-2 pl-2">
            {isMultipleChoice
              ? currentQ.options.map((option, index) => (
                  <CustomCheckbox
                    key={option._id}
                    id={`option-${option._id}`}
                    checked={
                      answers[currentQ._id]?.includes(option._id) || false
                    }
                    onChange={(e) => {
                      const currentAnswers = answers[currentQ._id] || [];
                      const newAnswers = e.target.checked
                        ? [...currentAnswers, option._id]
                        : currentAnswers.filter((id) => id !== option._id);
                      handleAnswer(currentQ._id, newAnswers);
                    }}
                    label={option.text}
                  />
                ))
              : currentQ.options.map((option) => (
                  <CustomRadio
                    key={option._id}
                    id={`option-${option._id}`}
                    value={option._id}
                    checked={answers[currentQ._id]?.[0] === option._id}
                    onChange={() => handleAnswer(currentQ._id, [option._id])}
                    label={option.text}
                  />
                ))}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <CustomButton
            onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
            variant="secondary"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </CustomButton>

          {currentQuestion < testData.totalQuestions - 1 ? (
            <CustomButton
              onClick={() =>
                setCurrentQuestion((prev) =>
                  Math.min(testData.totalQuestions - 1, prev + 1)
                )
              }
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </CustomButton>
          ) : (
            <CustomButton
              onClick={() => handleSubmit()}
              variant="success"
              disabled={Object.keys(answers).length !== testData.totalQuestions}
            >
              <Check className="w-4 h-4" />
              Submit Test
            </CustomButton>
          )}
        </div>
      </CustomCard>

      <CustomCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Question Navigation
          </h3>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span className="text-gray-600">Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">Current</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-8 gap-2">
          {testData.questions.map((question, index) => (
            <button
              key={question._id}
              onClick={() => setCurrentQuestion(index)}
              className={`h-10 w-10 rounded-lg font-medium transition-all duration-200 ${
                answers[question._id]
                  ? "bg-emerald-500 text-white hover:bg-emerald-600"
                  : currentQuestion === index
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </CustomCard>
    </div>
  );
};

export default AssessmentQuestions;
