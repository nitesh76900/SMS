import React, { useState, useEffect } from "react";
import {
  FaCalendarAlt,
  FaClock,
  FaSearch,
  FaDownload,
  FaUsers,
  FaCheckCircle,
  FaTimesCircle,
  FaHistory,
  FaFilter,
} from "react-icons/fa";
import StaffService from "../services/staffServices";
import StaffAttendanceService from "../services/staffAttendanceService";
import DigitalClock from "../components/DigitalClock";
import { useToast } from "../context/ToastContext";

const StaffAttendance = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [staff, setStaff] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const showToast = useToast();

  // Fetch staff and attendance data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const staffResponse = await StaffService.getAllStaff();
        console.log("staffResponse", staffResponse.data);
        setStaff(staffResponse.data);

        // Extract unique departments from staff data
        const uniqueDepartments = [
          ...new Set(staffResponse.data.map((staff) => staff?.name)),
        ].filter(Boolean);
        setDepartments(uniqueDepartments);

        const attendanceResponse = await StaffAttendanceService.getAttendance(
          selectedDate
        );

        if (!attendanceResponse.success) {
          throw new Error("Failed to fetch attendance");
        }

        setAttendanceData(attendanceResponse.data);
        filterStaffData(
          attendanceResponse.data,
          selectedDepartment,
          searchTerm
        );
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedDate]);

  // Filter staff data based on department and search term
  const filterStaffData = (data, department, search) => {
    let filtered = [...data];

    // Filter by department
    if (department !== "all") {
      filtered = filtered.filter(
        (member) =>
          member.staffId.department?.name.toLowerCase() ===
          department.toLowerCase()
      );
    }

    // Filter by search term
    if (search) {
      filtered = filtered.filter(
        (member) =>
          member.staffId.name.toLowerCase().includes(search.toLowerCase()) ||
          member.staffId.department?.name
            .toLowerCase()
            .includes(search.toLowerCase())
      );
    }

    setFilteredStaff(filtered);
  };

  // Handle department filter change
  useEffect(() => {
    filterStaffData(attendanceData, selectedDepartment, searchTerm);
  }, [selectedDepartment, searchTerm, attendanceData]);

  const updateAttendance = async (staffId, newStatus) => {
    try {
      const time = new Date().toString();
      const attendanceData = {
        staffId: staffId,
        date: selectedDate,
        status: newStatus,
        entryTime: time,
      };

      const response = await StaffAttendanceService.updateAttendance(
        attendanceData
      );

      if (!response.success) {
        throw new Error(response.message || "Failed to update attendance");
      }

      setFilteredStaff((prev) =>
        prev.map((record) =>
          record.staffId._id === staffId
            ? {
                ...record,
                entryTime:
                  newStatus === "present" ? response.data.entryTime : "-",
                status: newStatus,
              }
            : record
        )
      );
      showToast(`Attendance marked ${newStatus} successfully`, "success");
    } catch (error) {
      console.error("Error updating attendance:", error);
      setError(error.message);
      showToast(`Error updating attendance: ${error.message}`, "error");
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

  const exportToCSV = () => {
    const headers = ["Date", "Name", "Department", "Entry Time", "Status"];
    const csvData = filteredStaff.map((member) => [
      selectedDate,
      member.staffId.name,
      member.staffId.department?.name || "N/A",
      member.entryTime ? new Date(member.entryTime).toLocaleTimeString() : "-",
      member.status,
    ]);

    csvData.unshift(headers);
    const csvString = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `staff_attendance_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Attendance report exported successfully", "success");
  };

  // Calculate stats for filtered staff
  const stats = {
    total: filteredStaff.length,
    present: filteredStaff.filter((t) => t.status === "present").length,
    absent: filteredStaff.filter((t) => t.status === "absent").length,
    pending: filteredStaff.filter((t) => t.status === "pending").length,
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            Error: {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Staff Attendance</h1>
          <DigitalClock />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            icon={FaUsers}
            title="Total Staff"
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

        {/* Search and Controls */}
        <CustomCard className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center">
              <FaCalendarAlt className="w-4 h-4 mr-2 text-gray-500" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                max={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or department..."
                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center">
              <FaFilter className="w-4 h-4 mr-2 text-gray-500" />
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="all">All Departments</option>
                {departments.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaDownload className="w-4 h-4" />
              Export Attendance
            </button>
          </div>
        </CustomCard>

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
                        Staff Member
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Entry Time
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
                    {filteredStaff.map((member) => {
                      const currentDate = new Date();
                      const selectedDateObj = new Date(selectedDate);
                      const isPastDate =
                        (currentDate - selectedDateObj) /
                          (1000 * 60 * 60 * 24) >
                        1;

                      const adjustedStatus =
                        isPastDate && member.status === "pending"
                          ? "absent"
                          : member.status;

                      return (
                        <tr key={member._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">
                              {member.staffId.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {member.staffId.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                            {member.staffId.department?.name || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                            {adjustedStatus === "present"
                              ? member.entryTime
                              : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                adjustedStatus
                              )}`}
                            >
                              {adjustedStatus.charAt(0).toUpperCase() +
                                adjustedStatus.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-3">
                              {(adjustedStatus === "present" ||
                                adjustedStatus === "pending") && (
                                <button
                                  onClick={() =>
                                    updateAttendance(
                                      member.staffId._id,
                                      "present"
                                    )
                                  }
                                  className={`p-2 rounded-full transition-colors ${
                                    adjustedStatus === "present"
                                      ? "bg-green-100 text-green-600"
                                      : "hover:bg-green-100 text-gray-400"
                                  }`}
                                  title="Mark Present"
                                  disabled={
                                    selectedDate !==
                                    new Date().toISOString().split("T")[0]
                                  }
                                >
                                  <FaCheckCircle className="w-4 h-4" />
                                </button>
                              )}
                              {(adjustedStatus === "absent" ||
                                adjustedStatus === "pending") && (
                                <button
                                  onClick={() =>
                                    updateAttendance(
                                      member.staffId._id,
                                      "absent"
                                    )
                                  }
                                  className={`p-2 rounded-full transition-colors ${
                                    adjustedStatus === "absent"
                                      ? "bg-red-100 text-red-600"
                                      : "hover:bg-red-100 text-gray-400"
                                  }`}
                                  title="Mark Absent"
                                  disabled={
                                    selectedDate !==
                                    new Date().toISOString().split("T")[0]
                                  }
                                >
                                  <FaTimesCircle className="w-4 h-4" />
                                </button>
                              )}
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
              Showing {filteredStaff.length} of {staff.length} staff members
              {selectedDepartment !== "all" &&
                ` (filtered by ${selectedDepartment} department)`}{" "}
              for{" "}
              {new Date(selectedDate).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </>
        )}

        {/* Error Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* No Results Message */}
        {!isLoading && filteredStaff.length === 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center text-gray-500">
            <FaUsers className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No staff members found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedDepartment !== "all"
                ? "Try adjusting your search terms or filters"
                : "No staff members are registered in the system"}
            </p>
          </div>
        )}

        {/* Search Results */}
        {(searchTerm || selectedDepartment !== "all") &&
          filteredStaff.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800">
              Found {filteredStaff.length} staff members
              {searchTerm && ` matching "${searchTerm}"`}
              {selectedDepartment !== "all" &&
                ` in ${selectedDepartment} department`}
            </div>
          )}
      </div>
    </div>
  );
};

export default StaffAttendance;
