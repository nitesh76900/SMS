import React, { useState } from "react";
import { FaCalendarAlt, FaPrint, FaTrashAlt, FaPlus } from "react-icons/fa";
import { useToast } from "../context/ToastContext";

const StudentAttendance = () => {
  const showToast = useToast();

  // State management
  const [selectedMonth, setSelectedMonth] = useState("August");
  const [selectedYear, setSelectedYear] = useState("2023");
  const [selectedClass, setSelectedClass] = useState("Class Six");
  const [selectedSection, setSelectedSection] = useState("A");
  const [attendanceData, setAttendanceData] = useState([
    { id: "64b93a7b4b1e9c11a1e4a10a", date: "2023-11-01", present: true },
    { id: "64b93a7b4b1e9c11a1e4a10b", date: "2023-11-02", present: true },
    { id: "64b93a7b4b1e9c11a1e4a10c", date: "2023-11-03", present: true },
    { id: "64b93a7b4b1e9c11a1e4a10d", date: "2023-11-04", present: true },
  ]);

  // Handler functions
  const handleFilter = () => {
    // In a real app, this would fetch data based on selected filters
    console.log("Filtering with:", {
      selectedMonth,
      selectedYear,
      selectedClass,
      selectedSection,
    });
    showToast("Attendance filtered successfully", "success");
  };

  const handleAddAttendance = () => {
    const newAttendance = {
      id: `student-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      present: true,
    };
    setAttendanceData([...attendanceData, newAttendance]);
    showToast("New attendance record added", "success");
  };

  const handleDelete = (id) => {
    setAttendanceData(attendanceData.filter((item) => item.id !== id));
    showToast("Attendance record deleted", "success");
  };

  const handlePrint = () => {
    window.print();
    showToast("Printing attendance report", "info");
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Daily Attendance</h1>
        <div className="flex items-center gap-2">
          <FaCalendarAlt className="w-5 h-5 text-primary" />
          <span className="text-muted-foreground">
            {new Date().toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="border rounded p-2 bg-background"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {["August", "September", "October"].map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>

          <select
            className="border rounded p-2 bg-background"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            {["2023", "2024"].map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          <select
            className="border rounded p-2 bg-background"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="Class Six">Class Six (0)</option>
            <option value="Class Seven">Class Seven (0)</option>
          </select>

          <select
            className="border rounded p-2 bg-background"
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
          >
            <option value="A">Section A</option>
            <option value="B">Section B</option>
          </select>

          <button
            onClick={handleFilter}
            className="bg-primary text-primary-foreground hover:bg-primary/80 px-4 py-2 rounded transition flex items-center gap-2"
          >
            Filter
          </button>
        </div>

        <button
          onClick={handleAddAttendance}
          className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded transition flex items-center gap-2"
        >
          <FaPlus className="w-4 h-4" />
          Add Attendance
        </button>
      </div>

      <div className="bg-card rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-2">Attendance Report</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Class</p>
            <p className="font-medium">{selectedClass}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Section</p>
            <p className="font-medium">{selectedSection}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Last Updated</p>
            <p className="font-medium">{new Date().toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Time</p>
            <p className="font-medium">{new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto mb-6">
        <table className="w-full border-collapse border">
          <thead className="bg-muted">
            <tr>
              <th className="border p-2 text-left">Student ID</th>
              <th className="border p-2 text-left">Date</th>
              <th className="border p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {attendanceData.map((student) => (
              <tr key={student.id} className="hover:bg-muted/50">
                <td className="border p-2">{student.id}</td>
                <td className="border p-2">{student.date}</td>
                <td className="border p-2 text-center">
                  <button
                    onClick={() => handleDelete(student.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/80 p-2 rounded inline-flex items-center gap-2 transition"
                  >
                    <FaTrashAlt className="w-4 h-4" />
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={handlePrint}
        className="bg-primary text-primary-foreground hover:bg-primary/80 px-4 py-2 rounded transition inline-flex items-center gap-2"
      >
        <FaPrint className="w-4 h-4" />
        Print Report
      </button>
    </div>
  );
};

export default StudentAttendance;
