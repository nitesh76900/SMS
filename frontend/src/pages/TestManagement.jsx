import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TestService from "../services/testService";
import { useToast } from "../context/ToastContext";
import Loader from "../components/Loader/Loader";
import { selectUser } from "../store/slices/userSlice";
import { useSelector } from "react-redux";

const TestManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const showToast = useToast();
  const user = useSelector(selectUser);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await TestService.getAllTests();
        console.log("response.data", response);
        setTests(response);
        setLoading(false);
        showToast("Tests loaded successfully", "success");
      } catch (error) {
        setError(error.message);
        showToast(`Error loading tests: ${error.message}`, "error");
      }
    };
    fetchTests();
  }, [showToast]);

  const getTestStatus = (test) => {
    if (!test.startTime || !test.endTime) return "Draft";

    const currentTime = new Date();
    const startTime = new Date(test.startTime);
    const endTime = new Date(test.endTime);

    if (currentTime < startTime) return "Upcoming";
    if (currentTime > endTime) return "Completed";
    return "Active";
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      Draft: "bg-gray-100 text-gray-800",
      Upcoming: "bg-yellow-100 text-yellow-800",
      Active: "bg-green-100 text-green-800",
      Completed: "bg-blue-100 text-blue-800",
    };
    return `px-2 py-1 rounded-full text-xs font-medium ${
      statusClasses[status] || "bg-gray-100 text-gray-800"
    }`;
  };

  const filteredTests = tests.filter((test) => {
    // Admin and SuperAdmin can see all tests
    if (user?.role === "admin" || user?.role === "superAdmin") {
      return true;
    }

    // Check if the test's class matches the user's classes or created by user
    const isUserClassTest =
      test.class?._id === user.leadClass || // Check if user is the class teacher
      user.assignedClass?.includes(test.class?._id) || // Check if user is assigned to this class
      test.createdBy === user._id || // Check if user created the test
      test.class?.students?.includes(user._id); // Check if user is a student of the class

    // Search and filter conditions
    const matchesSearch =
      test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.subject.toLowerCase().includes(searchTerm.toLowerCase());

    const testStatus = getTestStatus(test);
    const matchesFilter =
      selectedFilter === "all" ||
      (selectedFilter === "active" && testStatus === "Active") ||
      (selectedFilter === "draft" && testStatus === "Upcoming") ||
      (selectedFilter === "completed" && testStatus === "Completed");

    return isUserClassTest && matchesSearch && matchesFilter;
  });
  const isTestActive = (test) => {
    return getTestStatus(test) === "Active";
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "Not specified";

    const dateTime = new Date(dateTimeString);
    return dateTime.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleCreateTest = () => {
    navigate("/test-form");
    showToast("Starting new test creation", "info");
  };

  const handleTestClick = (test) => {
    if (
      user?.role === "admin" ||
      user?.role === "superAdmin" ||
      user?.role === "teacher"
    ) {
      navigate(`/submission/all/${test._id}`);
    } else {
      navigate(`/assesments/${test._id}`);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{error}</h2>
          <p className="text-gray-600 mb-6">
            Something went wrong while fetching your tests.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8 border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                Test Management
              </h1>
              <p className="mt-2 text-gray-600">
                Create, manage and monitor all your tests in one place
              </p>
            </div>
            <button
              onClick={handleCreateTest}
              className="inline-flex items-center px-6 py-3 text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create New Test
            </button>
          </div>

          {/* Search and Filter Section */}
          <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search tests by title, description or subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 placeholder-gray-400"
                />
                <svg
                  className="absolute right-4 top-3.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-5 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 text-gray-700 cursor-pointer hover:bg-gray-100"
            >
              <option value="all">All Tests</option>
              <option value="active">Active</option>
              <option value="draft">Upcoming</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Tests Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTests.map((test) => {
            const testStatus = getTestStatus(test);
            return (
              <div
                key={test._id}
                onClick={() => handleTestClick(test)}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100 hover:border-gray-200"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between space-x-3 mb-2">
                        <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {test.title}
                        </h2>
                        <span className={getStatusBadgeClass(testStatus)}>
                          {testStatus}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 font-medium">
                        {test?.class?.name}-{test?.class?.section} (
                        {test.subject})
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-gray-600 text-sm line-clamp-2">
                    {test.description}
                  </p>
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-xl">
                      <p className="text-xs text-gray-500 font-medium">
                        Start Time
                      </p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        {formatDateTime(test.startTime)}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl">
                      <p className="text-xs text-gray-500 font-medium">
                        End Time
                      </p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        {formatDateTime(test.endTime)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-xl">
                      <p className="text-xs text-gray-500 font-medium">
                        Duration
                      </p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        {test.duration} minutes
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl">
                      <p className="text-xs text-gray-500 font-medium">
                        Total Marks
                      </p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        {test.totalMarks}
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end items-center pr-2">
                    {isTestActive(test) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent parent onClick from firing
                          navigate(`/assesments/${test._id}`);
                        }}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                      >
                        Start Test
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredTests.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No tests found
            </h3>
            <p className="text-gray-600 mb-6">
              Get started by creating a new test using the button above.
            </p>
            <button
              onClick={handleCreateTest}
              className="inline-flex items-center px-6 py-3 text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 shadow-sm mx-auto"
            >
              Create Your First Test
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestManagement;
