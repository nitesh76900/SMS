import React, { useState, useEffect } from "react";
import { BsCalendar3, BsClock, BsSearch } from "react-icons/bs";
import { MdVideoCall, MdDelete, MdAdd } from "react-icons/md";
import {
  getAllLiveSessions,
  updateLiveSession,
  createLiveSession,
  deleteLiveSession,
  updateSessionStatus,
} from "../services/liveSessionServices";
import { getAllClasses } from "../services/classService";
import teacherService from "../services/teacherService";
import getStudentByClass from "../services/studentServices";
import { useToast } from "../context/ToastContext";
import AddLiveSessionModal from "../modals/AddLiveSessionModal";
import Loader from "../components/Loader/Loader";
import { selectUser } from "../store/slices/userSlice";
import { useSelector } from "react-redux";

const LiveSessionManagement = () => {
  const [sessions, setSessions] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [classStudents, setClassStudents] = useState([]);

  const initialFormState = {
    title: "",
    description: "",
    sessionLink: "",
    teacher: "",
    students: [],
    class: "",
    startFrom: "",
    duration: 60,
    status: "scheduled",
  };

  const [formData, setFormData] = useState(initialFormState);

  const showToast = useToast();
  const user = useSelector(selectUser);
  console.log("User", user);

  // Fetch initial data
  useEffect(() => {
    fetchAllData();
  }, []);

  // Fetch class students when class is selected
  useEffect(() => {
    if (formData.class) {
      fetchClassStudents(formData.class);
    }
  }, [formData.class]);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([fetchSessions(), fetchClasses(), fetchTeachers()]);
      setError(null);
      showToast("Live session data loaded successfully", "success");
    } catch (err) {
      setError(err.message);
      showToast("Failed to load live session data", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSessions = async () => {
    const data = await getAllLiveSessions();
    console.log("data.sessions", data.sessions);
    setSessions(data.sessions);
  };

  const fetchClasses = async () => {
    const response = await getAllClasses();
    if (response && response.data) {
      setClasses(response.data);
    }
  };

  const fetchTeachers = async () => {
    const data = await teacherService.getAllTeachers();
    console.log("teacherData:", data.data);
    setTeachers(data.data);
  };

  const fetchClassStudents = async (classId) => {
    try {
      console.log("Class Id:", classId);
      const data = await getStudentByClass.getStudentByClass(classId);
      console.log("Fetched students:", data.data); // Debugging
      setClassStudents(data.data.student);
    } catch (err) {
      setError("Failed to fetch class students");
      console.error("Error:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStudentSelection = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(
      (option) => option.value
    );
    setFormData((prev) => ({ ...prev, students: selectedOptions }));
  };

  const handleStatusChange = async (sessionId, status) => {
    try {
      await updateSessionStatus(sessionId, status);
      showToast("Session status updated successfully", "success");
      fetchSessions(); // Refresh the sessions list
    } catch (err) {
      setError(err.message);
      showToast("Failed to update session status", "error");
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const sessionData = {
        ...formData,
        status: "scheduled",
      };

      if (selectedSession) {
        await updateLiveSession(selectedSession._id, sessionData);
        showToast("Live session updated successfully", "success");
      } else {
        await createLiveSession(sessionData);
        showToast("New live session created", "success");
      }
      fetchSessions();
      handleCloseModal();
    } catch (err) {
      setError(err.message);
      showToast(err.message || "Failed to save live session", "error");
    }
  };

  const handleDelete = async () => {
    if (selectedSession) {
      try {
        await deleteLiveSession(selectedSession._id);
        showToast("Live session deleted successfully", "success");
        fetchSessions();
        setShowDeleteModal(false);
        setSelectedSession(null);
      } catch (err) {
        setError(err.message);
        showToast("Failed to delete live session", "error");
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedSession(null);
    setFormData(initialFormState);
    setClassStudents([]);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "scheduled":
        return "bg-yellow-100 text-yellow-800";
      case "ongoing":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredSessions = sessions
    .filter((session) => {
      if (user?.role === "teacher") {
        return session.teacher._id === user._id; // Show sessions for the logged-in teacher
      }
      if (user?.role === "student") {
        return session.students.includes(user._id); // Show sessions for the logged-in student
      }
      return true; // For admin or other roles, show all sessions
    })
    .filter(
      (session) =>
        session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Live Sessions</h1>
        <p className="text-gray-600">Manage your virtual classroom sessions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-500">Total Sessions</p>
              <p className="text-2xl font-semibold">{sessions.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <MdVideoCall className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-500">Active Now</p>
              <p className="text-2xl font-semibold">
                {sessions.filter((s) => s.status === "ongoing").length}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <BsClock className="text-green-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between">
            <div>
              <p className="text-gray-500">Upcoming</p>
              <p className="text-2xl font-semibold">
                {sessions.filter((s) => s.status === "scheduled").length}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <BsCalendar3 className="text-purple-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            {["all", "ongoing", "scheduled", "completed"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg ${
                  activeTab === tab
                    ? "bg-blue-100 text-blue-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search sessions..."
                className="pl-10 pr-4 py-2 border rounded-lg w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <BsSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            {user?.role === "teacher" && (
              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <MdAdd /> New Session
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="bg-white rounded-lg shadow">
        {filteredSessions.map((session) => (
          <div key={session._id} className="p-6 border-b last:border-b-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <MdVideoCall className="text-blue-600 text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold">{session.title}</h3>
                  <p className="text-gray-600 text-sm">{session.description}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-sm text-gray-500">
                      {formatDate(session.startFrom)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {session.duration} min
                    </span>
                    <span className="text-sm text-gray-500">
                      {session.teacher.name || "Unknown Teacher"}
                    </span>
                    <span className="text-sm text-gray-500">
                      {session.class.name || "Unknown Class"}-
                      {session.class.section || "Unknown Section"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <select
                  value={session.status}
                  onChange={(e) =>
                    handleStatusChange(session._id, e.target.value)
                  }
                  className={`px-3 py-1 rounded-lg text-sm border ${getStatusColor(
                    session.status
                  )}`}
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <div className="flex gap-2">
                  <button
                    onClick={() => window.open(session.sessionLink, "_blank")}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <MdVideoCall className="text-xl" />
                  </button>
                  {user?.role === "teacher" && (
                    <button
                      onClick={() => {
                        setSelectedSession(session);
                        setShowDeleteModal(true);
                      }}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      <MdDelete className="text-xl" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredSessions.length === 0 && (
          <div className="p-8 text-center text-gray-500">No sessions found</div>
        )}
      </div>

      {showModal && (
        <AddLiveSessionModal
          showModal={showModal}
          onClose={() => setShowModal(false)}
          selectedSession={selectedSession}
          formData={formData}
          handleInputChange={handleInputChange}
          handleStudentSelection={handleStudentSelection}
          handleSubmit={handleSubmit}
          teachers={teachers}
          classes={classes}
          classStudents={classStudents}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this session? This action cannot
              be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveSessionManagement;
