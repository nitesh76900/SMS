import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StudentService from "../services/studentServices";
import * as ClassService from "../services/classService";
import { useToast } from "../context/ToastContext";
import { selectUser } from "../store/slices/userSlice";
import { useSelector } from "react-redux";

const Student = () => {
  const navigate = useNavigate();
  const showToast = useToast();
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = useSelector(selectUser);

  // Filters and pagination
  const [selectedClass, setSelectedClass] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;

  // Modals
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [studentsResponse, classesResponse] = await Promise.all([
          StudentService.getAllStudents(),
          ClassService.getAllClasses(),
        ]);
        console.log("studentsResponse.data", studentsResponse.data);
        setStudents(studentsResponse.data);
        setClasses(classesResponse.data);
        console.log(studentsResponse.data)
        console.log(classesResponse.data)
        showToast("Student Loaded successfully", "success");
      } catch (err) {
        setError(err.message || "Failed to fetch data");
        showToast("Failed to fetch data", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [showToast]);

  // Filter students
  const filteredStudents = students.filter((student) => {
    const matchesClass =
      selectedClass === "all" || student.class === selectedClass;
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.registrationNumber
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    return matchesClass && matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / entriesPerPage);
  const currentStudents = filteredStudents.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  const handleDelete = async () => {
    try {
      setIsDeleteLoading(true);
      await StudentService.deleteStudent(studentToDelete._id);
      const updatedStudents = await StudentService.getAllStudents();
      setStudents(updatedStudents.data);
      setStudentToDelete(null);
      showToast("Student deleted successfully", "success");
    } catch (err) {
      setError(err.message || "Failed to delete student");
      showToast("Failed to delete student", "error");
    } finally {
      setIsDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-12 h-12 border-4 border-t-blue-600 border-blue-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Students</h1>
        {(user?.role === "admin" || user?.role === "superAdmin") && (
          <button
            onClick={() => navigate("/addmission-form")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
          >
            <span className="text-xl">+</span> Add new student
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex gap-4 mb-6">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 border rounded hover:border-blue-500 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Classes</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name}-{cls.section}
                </option>
              ))}
            </select>

            <div className="relative flex-1 max-w-xs">
              <input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 pl-10 border rounded hover:border-blue-500 focus:border-blue-500 focus:outline-none"
              />
              <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-y">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                    Class
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                    Batch
                  </th>
                  {(user?.role === "admin" || user?.role === "superAdmin") && (
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {currentStudents.map((student) => (
                  <tr key={student._id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">{student.registrationNumber}</td>
                    <td className="px-6 py-4">{student.name}</td>
                    <td className="px-6 py-4">
                      {classes.find((c) => c._id === student.class)
                        ? `${
                            classes.find((c) => c._id === student.class).name
                          } - ${
                            classes.find((c) => c._id === student.class).section
                          }`
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4">{student.batch}</td>
                    {(user?.role === "admin" ||
                      user?.role === "superAdmin") && (
                      <td className="px-6 py-4 relative">
                        <div className="flex">
                          <button
                            onClick={() =>
                              navigate(`/edit-student/${student._id}`)
                            }
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 text-blue-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setStudentToDelete(student);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 text-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600">
              Showing {(currentPage - 1) * entriesPerPage + 1} to{" "}
              {Math.min(currentPage * entriesPerPage, filteredStudents.length)}{" "}
              of {filteredStudents.length} entries
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this student? This action cannot
              be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setStudentToDelete(null)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleteLoading}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleteLoading && (
                  <div className="w-4 h-4 border-2 border-t-white border-white/30 rounded-full animate-spin"></div>
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Student;
