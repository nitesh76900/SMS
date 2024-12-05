import React, { useState, useEffect } from "react";
import { FaArrowLeft, FaSearch, FaSave } from "react-icons/fa";
import { useToast } from "../context/ToastContext";

const Clock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-xl font-mono bg-white shadow-md rounded-lg px-4 py-2">
      {time.toLocaleTimeString()}
    </div>
  );
};

const StudentList = ({ setCurrentView }) => {
  const showToast = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState([
    { id: 1, name: "Alice Johnson", present: true },
    { id: 2, name: "Bob Smith", present: true },
    { id: 3, name: "Charlie Brown", present: true },
    { id: 4, name: "Diana Ross", present: true },
  ]);

  // Custom Button Component
  const CustomButton = ({
    children,
    onClick,
    variant = "default",
    size = "md",
    className = "",
  }) => {
    const baseStyles =
      "rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2";

    const variants = {
      default: "bg-blue-600 hover:bg-blue-700 text-white",
      secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
      success: "bg-green-600 hover:bg-green-700 text-white",
      destructive: "bg-red-600 hover:bg-red-700 text-white",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2",
      lg: "px-6 py-3 text-lg",
    };

    return (
      <button
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        onClick={onClick}
      >
        {children}
      </button>
    );
  };

  // Custom Card Component
  const CustomCard = ({ children, className = "" }) => {
    return (
      <div className={`bg-white rounded-xl shadow-md ${className}`}>
        {children}
      </div>
    );
  };

  // Search Input Component
  const SearchInput = ({ value, onChange }) => {
    return (
      <div className="relative">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder="Search..."
          className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
        />
      </div>
    );
  };

  const handleAttendanceChange = (studentId, value) => {
    setStudents(
      students.map((student) =>
        student.id === studentId ? { ...student, present: value } : student
      )
    );
    showToast(`Student marked ${value ? 'present' : 'absent'}`, "success");
  };

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    console.log("Saving attendance:", students);
    showToast("Attendance saved successfully", "success");
    setCurrentView("classList");
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = students.filter((student) =>
      student.name.toLowerCase().includes(term)
    );
    if (filtered.length === 0) {
      showToast("No students found matching search criteria", "info");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <CustomButton
              variant="secondary"
              onClick={() => window.history.back()}
            >
              <FaArrowLeft /> Back
            </CustomButton>
            <h1 className="text-2xl font-bold">Class 1-A Attendance</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Clock />
            <CustomButton variant="success" onClick={handleSave}>
              <FaSave /> Save Attendance
            </CustomButton>
          </div>
        </div>

        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <CustomCard className="p-4">
          <div className="space-y-4">
            {filteredStudents.map((student) => (
              <div
                key={student.id}
                className="flex justify-between items-center py-2 border-b"
              >
                <span className="font-medium">{student.name}</span>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name={`attendance-${student.id}`}
                      checked={student.present}
                      onChange={() => handleAttendanceChange(student.id, true)}
                      className="form-radio h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2">Present</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name={`attendance-${student.id}`}
                      checked={!student.present}
                      onChange={() => handleAttendanceChange(student.id, false)}
                      className="form-radio h-4 w-4 text-red-600"
                    />
                    <span className="ml-2">Absent</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </CustomCard>
      </div>
    </div>
  );
};

export default StudentList;
