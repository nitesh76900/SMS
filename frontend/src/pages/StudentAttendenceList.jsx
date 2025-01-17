import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  FaCalendarAlt,
  FaSearch,
  FaDownload,
  FaUsers,
  FaCheckCircle,
  FaTimesCircle,
  FaHistory,
} from "react-icons/fa";
import StudentService from "../services/studentServices";
import StudentAttendanceService from "../services/StudentAttendanceService";
import { useToast } from "../context/ToastContext";

const StudentAttendance = ({ setCurrentView }) => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const showToast = useToast();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [className, setClassName] = useState("");
  const [classSection, setClassSection] = useState("");

  // Fetch students and attendance data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Format the selected date to ISO string for consistent comparison
        const formattedDate = selectedDate.toISOString().split("T")[0];

        // Fetch students for the specific class
        const studentsResponse = await StudentService.getStudentByClass(
          classId
        );
        console.log("studentsResponse", studentsResponse);
        setClassName(studentsResponse.data.class.name);
        setClassSection(studentsResponse.data.class.section);

        // Fetch attendance data for the class
        const attendanceResponse =
          await StudentAttendanceService.getAllClassStudentAttendance(classId);
        console.log("attendanceResponse", attendanceResponse);
        // Merge student data with attendance records
        const mergedStudentData = await getMergedStudentData(
          studentsResponse.data.student,
          attendanceResponse.data,
          formattedDate
        );
        console.log("mergedStudentData", mergedStudentData);
        // Set students and filtered students
        setStudents(mergedStudentData);
        setFilteredStudents(mergedStudentData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (classId) {
      fetchData();
    }
  }, [classId, selectedDate]);

  // Merge student data with attendance records
  const getMergedStudentData = async (studentsData, attendanceData, selectedDate) => {
    // Use Promise.all to properly handle async operations inside map
    const data = await Promise.all(
      studentsData.map(async (student) => {
        // Find attendance record matching the student and selected date
        const attendanceRecord = attendanceData.find(
          (record) =>
            record.student._id === student._id &&
            new Date(record.date).toISOString().split("T")[0] === selectedDate
        );
  
        // Prepare the per-student data
        return {
          id: student._id,
          name: student.name,
          email: student.email,
          rollNumber: student.rollNumber,
          status: attendanceRecord ? attendanceRecord.status : "pending",
          entryTime: attendanceRecord?.entryTime || null,
          attendanceRecord: attendanceRecord || null,
          attendanceId: attendanceRecord?._id || null,
        };
      })
    );
  
    return data;
  };

  // Update attendance for a student
  const updateAttendance = async (studentId, newStatus) => {
    try {
      const attendanceData = {
        student: studentId,
        date: selectedDate,
        status: newStatus,
        entryTime: newStatus === "present" ? new Date().toISOString() : null,
      };

      // Create or update attendance record
      const response = await StudentAttendanceService.addStudentAttendance(
        attendanceData
      );

      // Update local state
      setFilteredStudents((prev) =>
        prev.map((student) =>
          student.id === studentId
            ? {
                ...student,
                status: newStatus,
                entryTime:
                  newStatus === "present" ? attendanceData.entryTime : null,
                attendanceRecord: response.data,
              }
            : student
        )
      );
      showToast(`Student marked ${newStatus} successfully`, "success");
    } catch (error) {
      console.error("Error updating attendance:", error);
      setError(error.message);
      showToast(`Failed to update attendance: ${error.message}`, "error");
    }
  };

  // Export to CSV functionality
  const exportToCSV = () => {
    const headers = ["Date", "Name", "Roll Number", "Status", "Entry Time"];
    const csvData = filteredStudents.map((student) => [
      selectedDate.toLocaleDateString(),
      student.name,
      student.rollNumber,
      student.status,
      student.entryTime
        ? new Date(student.entryTime).toLocaleTimeString()
        : "-",
    ]);

    csvData.unshift(headers);
    const csvString = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `student_attendance_${selectedDate.toLocaleDateString()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Attendance report exported successfully", "success");
  };

  // Calculate stats
  const stats = {
    total: filteredStudents.length,
    present: filteredStudents.filter((s) => s.status === "present").length,
    absent: filteredStudents.filter((s) => s.status === "absent").length,
    pending: filteredStudents.filter((s) => s.status === "pending").length,
  };

  // Status color mapping
  const getStatusColor = (status) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800";
      case "absent":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Custom Card Component
  const CustomCard = ({ children, className = "" }) => (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      {children}
    </div>
  );

  // Stats Card Component
  const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm mb-1">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
        <div className={`${color} opacity-80`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );

  // Custom Calendar Input
  const CalendarInput = ({ value, onClick }) => (
    <div className="relative">
      <button
        onClick={onClick}
        className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <FaCalendarAlt className="mr-2 text-gray-500" />
        {value}
      </button>
    </div>
  );

  // Search filter
  const handleSearchChange = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = students.filter(
      (student) =>
        student.name.toLowerCase().includes(term) ||
        student.rollNumber.toLowerCase().includes(term)
    );
    setFilteredStudents(filtered);
    if (filtered.length === 0) {
      showToast("No students found matching search criteria", "info");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Date Picker and Search */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Student Attendance - Class {className}-{classSection}
            </h1>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              customInput={<CalendarInput />}
              maxDate={new Date()}
              dateFormat="MMMM d, yyyy"
            />
            <div className="relative">
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <FaSearch className="absolute left-2 top-3 text-gray-400" />
            </div>
            <button
              onClick={exportToCSV}
              className="flex items-center bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              <FaDownload className="mr-2" /> Export CSV
            </button>
          </div>
          <button
            onClick={() => setCurrentView("dashboard")}
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            icon={FaUsers}
            title="Total Students"
            value={stats.total}
            color="text-blue-600"
          />
          <StatCard
            icon={FaCheckCircle}
            title="Present Today"
            value={stats.present}
            color="text-green-600"
          />
          <StatCard
            icon={FaTimesCircle}
            title="Absent Today"
            value={stats.absent}
            color="text-red-600"
          />
          <StatCard
            icon={FaHistory}
            title="Pending"
            value={stats.pending}
            color="text-yellow-600"
          />
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Attendance Table */}
            <CustomCard>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStudents.map((student) => {
                      const isCurrentDate =
                        selectedDate.toISOString().split("T")[0] ===
                        new Date().toISOString().split("T")[0];

                      return (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">
                              {student.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {student.rollNumber}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                student.status
                              )}`}
                            >
                              {student?.status?.charAt(0).toUpperCase() +
                                student?.status?.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-3">
                              {/* Only show Present button for current date or if student is not already absent */}
                              {(isCurrentDate ||
                                student.status !== "absent") && (
                                <button
                                  onClick={() =>
                                    updateAttendance(student.id, "present")
                                  }
                                  className={`${
                                    student.status === "absent" && "hidden"
                                  }  p-2 rounded-full transition-colors ${
                                    student.status === "present"
                                      ? "bg-green-100 text-green-600"
                                      : "hover:bg-green-100 text-gray-400"
                                  }`}
                                  title="Mark Present"
                                  disabled={!isCurrentDate}
                                >
                                  <FaCheckCircle className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() =>
                                  updateAttendance(student.id, "absent")
                                }
                                className={`${
                                  student.status === "present" && "hidden"
                                } p-2 rounded-full transition-colors ${
                                  student.status === "absent"
                                    ? "bg-red-100 text-red-600"
                                    : "hover:bg-red-100 text-gray-400"
                                }`}
                                title="Mark Absent"
                                disabled={!isCurrentDate}
                              >
                                <FaTimesCircle className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CustomCard>

            {/* Results Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800">
              Showing {filteredStudents.length} of {students.length} students
              for{" "}
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </>
        )}

        {/* No Results Message */}
        {!isLoading && students.length === 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center text-gray-500">
            <FaUsers className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No students found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              There are no students registered in this class
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAttendance;
