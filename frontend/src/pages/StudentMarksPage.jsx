import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { studentMarksService } from "../services/studentMarksServices";
import ResultModal from "../modals/ResultModal";
import { useToast } from "../context/ToastContext";
import Loader from "../components/Loader/Loader";
import { selectUser } from "../store/slices/userSlice";
import { useSelector } from "react-redux";
const StudentMarksPage = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState("all");
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const showToast = useToast();
  const user = useSelector(selectUser);

  // Get unique classes from students
  const getUniqueClasses = (students) => {
    const classes = new Set(
      students.map((student) => student.studentId?.class.name)
    );
    return Array.from(classes).sort((a, b) => parseInt(a) - parseInt(b));
  };
  const calculatePercentage = (student) => {
    console.log("student in calculatePercentage", student);
    const totalMarks = student.marks.reduce((acc, mark) => acc + mark.mark, 0);
    const maxMarks = student.marks.length * 100; // Assuming max marks is 100 for each subject
    return ((totalMarks / maxMarks) * 100).toFixed(2);
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await studentMarksService.getAllStudentMarks();
        console.log("response in StudentMarksPage", response);
        setStudents(response);
        setFilteredStudents(response);
        showToast("Student marks loaded successfully", "success");
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch student data");
        showToast("Failed to fetch student data", "error");
        setLoading(false);
      }
    };
    fetchData();
  }, [showToast]);

  const handleClassFilter = (className) => {
    setSelectedClass(className);
    if (className === "all") {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(
        (student) => student.studentId?.class.name === className
      );
      setFilteredStudents(filtered);
    }
  };

  if (loading) return <Loader />;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Student Marks Management</h1>
          <p className="text-gray-600">View and manage student results</p>
        </div>
        {user?.role === "teacher" && (
          <button
            onClick={() => navigate("/add-student-marks")}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add New Result
          </button>
        )}
      </div>

      <div className="mb-6">
        <select
          value={selectedClass}
          onChange={(e) => handleClassFilter(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="all">All Classes</option>
          {getUniqueClasses(students).map((className) => (
            <option key={className} value={className}>
              Class {className}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 border-b">
                Name
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 border-b">
                Registration No.
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 border-b">
                Class
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 border-b">
                Persentage
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 border-b">
                Result
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 border-b">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredStudents.map((student) => (
              <tr key={student._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{student.studentId?.name}</td>
                <td className="px-6 py-4">
                  {student.studentId?.registrationNumber}
                </td>
                <td className="px-6 py-4">
                  {student.studentId?.class.name}-
                  {student.studentId?.class.section}
                </td>
                <td className="px-6 py-4">{calculatePercentage(student)} %</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded ${
                      student.result
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {student.result ? "Pass" : "Fail"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => {
                      setSelectedStudent(student);
                      setShowResultModal(true);
                    }}
                    className="text-blue-500 hover:text-blue-700 mr-3"
                  >
                    View Result
                  </button>
                  {user?.role === "teacher" && (
                    <button
                      onClick={() => navigate(`/edit-marks/${student._id}`)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showResultModal && (
        <ResultModal
          student={selectedStudent}
          onClose={() => {
            setShowResultModal(false);
            setSelectedStudent(null);
          }}
        />
      )}
    </div>
  );
};

export default StudentMarksPage;
