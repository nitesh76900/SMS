import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  ArrowLeft,
  Trophy,
  Clock,
  Target,
  BookOpen,
} from "lucide-react";
import SubmissionService from "../services/submissionservice";
import { useToast } from "../context/ToastContext";
import Loader from "../components/Loader/Loader";

const AssessmentResult = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const showToast = useToast();

  useEffect(() => {
    fetchAssessmentResults();
  }, [submissionId]);

  const fetchAssessmentResults = async () => {
    try {
      setLoading(true);
      const submissionData = await SubmissionService.getSubmissionById(
        submissionId
      );

      // Transform the data to match the component's structure
      const transformedResults = {
        totalQuestions: submissionData.answers.length,
        correctAnswers: submissionData.answers.filter(
          (answer) => answer.marks > 0
        ).length,
        totalMarks: submissionData.testId.totalMarks,
        scoredMarks: submissionData.totalMarks,
        timeTaken: calculateTimeTaken(
          submissionData.startTime,
          submissionData.submissionTime
        ),
        questions: submissionData.answers.map((answer) => ({
          id: answer.questionId._id,
          questionText: answer.questionId.questionText,
          userAnswers: extractSelectedOptions(
            answer.questionId,
            answer.selectedOptions
          ),
          correctAnswers: extractCorrectOptions(answer.questionId),
          marks: answer.questionId.marks,
          scoredMarks: answer.marks,
          explanation:
            answer.questionId.explanation || "No explanation provided",
          isCorrect: answer.marks > 0,
        })),
      };

      setResults(transformedResults);
      showToast("Results loaded successfully", "success");
    } catch (err) {
      setError(err.message);
      showToast(`Error loading results: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const calculateTimeTaken = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffInMinutes = Math.floor((end - start) / (1000 * 60));
    const minutes = Math.floor(diffInMinutes);
    const seconds = Math.floor(((end - start) % (1000 * 60)) / 1000);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const extractSelectedOptions = (question, selectedOptionIds) => {
    return selectedOptionIds.map((optionId) => {
      const option = question.options.find(
        (opt) => opt._id.toString() === optionId.toString()
      );
      return option ? option.text : "";
    });
  };

  const extractCorrectOptions = (question) => {
    return question.options
      .filter((option) => option.isCorrect)
      .map((option) => option.text);
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-xl text-red-600 mb-4">Error: {error}</div>
        <button
          onClick={() => navigate("/assessments")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Return to Assessments
        </button>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">No results found</div>
      </div>
    );
  }

  const percentage = (results.scoredMarks / results.totalMarks) * 100;
  const isPassed = percentage >= 60;

  const StatCard = ({ icon: Icon, label, value, className = "" }) => (
    <div
      className={`bg-white rounded-xl p-4 flex items-center gap-4 shadow-md border border-gray-100 ${className}`}
    >
      <div className="rounded-lg p-3 bg-blue-50">
        <Icon className="w-6 h-6 text-blue-600" />
      </div>
      <div>
        <div className="text-sm text-gray-500">{label}</div>
        <div className="text-xl font-semibold text-gray-800">{value}</div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/assesments")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Tests
          </button>
          <div className="text-sm text-gray-500">
            Submission #{submissionId}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Assessment Results
            </h1>
            <p className="text-gray-500">
              Completed on {new Date().toLocaleDateString()}
            </p>
          </div>
          <div className="text-center">
            <div
              className={`text-4xl font-bold mb-1 ${
                isPassed ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {percentage.toFixed(1)}%
            </div>
            <div
              className={`text-sm font-medium ${
                isPassed ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {isPassed ? "PASSED" : "FAILED"}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={Trophy}
          label="Total Score"
          value={`${results.scoredMarks}/${results.totalMarks}`}
        />
        <StatCard
          icon={Target}
          label="Correct Answers"
          value={`${results.correctAnswers}/${results.totalQuestions}`}
        />
        <StatCard icon={Clock} label="Time Taken" value={results.timeTaken} />
        <StatCard
          icon={BookOpen}
          label="Questions"
          value={results.totalQuestions}
        />
      </div>

      {/* Detailed Results */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Detailed Analysis
        </h2>

        <div className="space-y-6">
          {results.questions.map((question, index) => (
            <div
              key={question.id}
              className={`p-6 rounded-lg border ${
                question.isCorrect
                  ? "bg-emerald-50 border-emerald-100"
                  : "bg-red-50 border-red-100"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  {question.isCorrect ? (
                    <CheckCircle className="w-6 h-6 text-emerald-500" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-800">
                      Question {index + 1}
                    </h3>
                    <div className="text-sm font-medium">
                      Score: {question.scoredMarks}/{question.marks}
                    </div>
                  </div>

                  <p className="text-gray-800 mb-4">{question.questionText}</p>

                  <div className="space-y-3 mb-4">
                    <div>
                      <div className="text-sm font-medium text-gray-600 mb-1">
                        Your Answer:
                      </div>
                      <div className="text-gray-800">
                        {question.userAnswers.join(", ")}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-gray-600 mb-1">
                        Correct Answer:
                      </div>
                      <div className="text-gray-800">
                        {question.correctAnswers.join(", ")}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white bg-opacity-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-600 mb-1">
                      Explanation:
                    </div>
                    <div className="text-gray-800">{question.explanation}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssessmentResult;
