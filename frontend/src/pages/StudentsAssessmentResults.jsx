import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  ArrowLeft,
  Trophy,
  Clock,
  Target,
  BookOpen,
  Search,
  ChevronDown,
  ChevronUp,
  Loader,
} from "lucide-react";
import SubmissionService from "../services/submissionservice"; // Adjust the import path
import { useParams } from "react-router-dom";
import { useToast } from "../context/ToastContext";

const StudentAssessmentResults = () => {
  const [studentsResults, setStudentsResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { testId } = useParams();
  const showToast = useToast();

  useEffect(() => {
    fetchSubmissions();
  }, [testId]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const submissions = await SubmissionService.getTestSubmissions(testId);
      console.log("submissions", submissions);

      // Transform the backend data to match the frontend structure
      const transformedData = submissions.map((submission) => ({
        studentId: submission.studentId._id,
        studentName: submission.studentId.name,
        registrationNumber: submission.studentId.registrationNumber,
        status: submission.status,
        testId: submission.testId,
        results: {
          totalQuestions: submission.answers.length,
          correctAnswers: submission.answers.filter(
            (answer) => answer.marks > 0
          ).length,
          totalMarks: submission.totalMarks,
          scoredMarks: submission.answers.reduce(
            (total, answer) => total + (answer.marks || 0),
            0
          ),
          timeTaken: submission.submissionTime
            ? calculateTimeTaken(
                submission.startTime,
                submission.submissionTime
              )
            : "In Progress",
          startTime: new Date(submission.startTime).toLocaleString(),
          submissionTime: submission.submissionTime
            ? new Date(submission.submissionTime).toLocaleString()
            : "Not submitted",
          questions: submission.answers.map((answer) => ({
            id: answer.questionId,
            questionText: answer.questionText || "Question text not available",
            userAnswers: answer.selectedOptions || [],
            correctAnswers: answer.correctOptions || [],
            marks: answer.maxMarks || 0,
            scoredMarks: answer.marks || 0,
            explanation: answer.explanation || "Explanation not available",
            isCorrect: answer.marks > 0,
          })),
        },
      }));
      console.log("transformedData", transformedData);

      setStudentsResults(transformedData);
      showToast("Assessment results loaded successfully", "success");
      setError(null);
    } catch (err) {
      setError("Failed to fetch assessment results. Please try again later.");
      showToast("Failed to fetch assessment results", "error");
      console.error("Error fetching submissions:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateTimeTaken = (startTime, submissionTime) => {
    const start = new Date(startTime);
    const end = new Date(submissionTime);
    const diffInMinutes = Math.floor((end - start) / (1000 * 60));
    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  const StatCard = ({ icon: Icon, label, value }) => (
    <div className="bg-white rounded-xl p-4 flex items-center gap-4 shadow-md border border-gray-100">
      <div className="rounded-lg p-3 bg-blue-50">
        <Icon className="w-6 h-6 text-blue-600" />
      </div>
      <div>
        <div className="text-sm text-gray-500">{label}</div>
        <div className="text-md font-semibold text-gray-800">{value}</div>
      </div>
    </div>
  );

  const filteredStudents = studentsResults.filter(
    (student) =>
      student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.registrationNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-8">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-xl shadow-lg p-8 mb-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <button
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <div className="text-sm text-gray-500">Assessment Results</div>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="Search by student name or registration number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredStudents.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No results found for your search.
          </div>
        ) : (
          filteredStudents.map((student) => {
            const isEvaluated = student.status === "EVALUATED";
            const percentage = isEvaluated
              ? (student.results.scoredMarks / student.results.totalMarks) * 100
              : 0;
            const isPassed = percentage >= 60;
            const isExpanded = expandedStudent === student.studentId;

            return (
              <div
                key={student.studentId}
                className="bg-white rounded-xl shadow-lg border border-gray-100"
              >
                <div
                  className="p-6 cursor-pointer"
                  // onClick={() =>
                  //   setExpandedStudent(isExpanded ? null : student.studentId)
                  // }
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">
                        {student.studentName}
                      </h2>
                      <p className="text-gray-500">
                        Registration Number: {student.registrationNumber}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        {isEvaluated ? (
                          <div className="flex gap-3 items-center">
                            <div
                              className={`text-2xl font-bold ${
                                isPassed ? "text-emerald-600" : "text-red-600"
                              }`}
                            >
                              {student.results.totalMarks}
                            </div>
                            <div
                              className={`text-sm font-medium ${
                                isPassed ? "text-emerald-600" : "text-red-600"
                              }`}
                            >
                              {isPassed ? "PASSED" : "FAILED"}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm font-medium text-blue-600">
                            IN PROGRESS
                          </div>
                        )}
                      </div>
                      {/* {isExpanded ? (
                        <ChevronUp className="w-6 h-6" />
                      ) : (
                        <ChevronDown className="w-6 h-6" />
                      )} */}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                      icon={Trophy}
                      label="Status"
                      value={student.status}
                    />
                    <StatCard
                      icon={Clock}
                      label="Start Time"
                      value={student.results.startTime}
                    />
                    <StatCard
                      icon={Target}
                      label="Submission Time"
                      value={student.results.submissionTime}
                    />
                    <StatCard
                      icon={BookOpen}
                      label="Questions"
                      value={student.results.totalQuestions}
                    />
                  </div>
                </div>
                {/* 
                {isExpanded && isEvaluated && (
                  <div className="border-t border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Detailed Analysis
                    </h3>
                    <div className="space-y-4">
                      {student.results.questions.map((question, index) => (
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
                                <h4 className="font-medium text-gray-800">
                                  Question {index + 1}
                                </h4>
                                <div className="text-sm font-medium">
                                  Score: {question.scoredMarks}/{question.marks}
                                </div>
                              </div>

                              <p className="text-gray-800 mb-4">
                                {question.questionText}
                              </p>

                              <div className="space-y-3 mb-4">
                                <div>
                                  <div className="text-sm font-medium text-gray-600 mb-1">
                                    Student's Answer:
                                  </div>
                                  <div className="text-gray-800">
                                    {question.userAnswers.join(", ") || "No answer provided"}
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

                              {question.explanation && (
                                <div className="bg-white bg-opacity-50 rounded-lg p-4">
                                  <div className="text-sm font-medium text-gray-600 mb-1">
                                    Explanation:
                                  </div>
                                  <div className="text-gray-800">
                                    {question.explanation}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )} */}

                {isExpanded && !isEvaluated && (
                  <div className="border-t border-gray-100 p-6">
                    <div className="text-center text-gray-500">
                      Test is still in progress. Results will be available after
                      submission and evaluation.
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StudentAssessmentResults;
