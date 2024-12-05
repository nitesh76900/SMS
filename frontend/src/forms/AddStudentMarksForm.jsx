import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { studentMarksService } from "../services/studentMarksServices";
import { getAllClasses, getClassById } from "../services/classService";
import StudentService from "../services/studentServices";
import { useToast } from "../context/ToastContext";
const AddStudentMarksForm = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
  
    // Data states
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
  
    const [formData, setFormData] = useState({
      classId: "",
      studentId: "",
      subjects: [],
    });
  
    const showToast = useToast();
  
    // Fetch all classes on component mount
    useEffect(() => {
      const fetchClasses = async () => {
        try {
          const classesData = await getAllClasses();
          console.log("classesData:", classesData);
          setClasses(classesData.data);
          showToast("Classes loaded successfully", "success");
        } catch (err) {
          setError("Failed to fetch classes");
          showToast("Failed to fetch classes", "error");
        }
      };
      fetchClasses();
    }, [showToast]);
  
    // Fetch students when class is selected
    const handleClassChange = async (classId) => {
      setFormData((prev) => ({ ...prev, classId, studentId: "" }));
      setLoading(true);
  
      try {
        const studentsData = await StudentService.getStudentByClass(classId);
        console.log("studentsData", studentsData);
        setStudents(studentsData.data.student);
        showToast("Students loaded successfully", "success");
      } catch (err) {
        setError("Failed to fetch students");
        showToast("Failed to fetch students", "error");
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };
  
    // Fetch student details and subjects when student is selected
    const handleStudentChange = async (studentId) => {
      setFormData((prev) => ({ ...prev, studentId }));
      setLoading(true);
  
      try {
        const classResponse = await getClassById(formData.classId);
        console.log("classResponse", classResponse.data.subjects);
        const classSubjects = classResponse.data.subjects || [];
  
        const initializedSubjects = classSubjects.map((subject) => ({
          subject: subject.subjectName,
          mark: "",
        }));
        console.log("initializedSubjects", initializedSubjects);
        setFormData((prev) => ({
          ...prev,
          subjects: initializedSubjects,
        }));
      } catch (err) {
        setError("Failed to fetch student details");
      } finally {
        setLoading(false);
      }
    };
  
    // Fixed handleMarkChange function
    const handleMarkChange = (index, value) => {
      const newSubjects = [...formData.subjects];
      newSubjects[index].mark = value;
      setFormData((prev) => ({
        ...prev,
        subjects: newSubjects,
      }));
    };
  
    const validateForm = () => {
      if (!formData.classId) {
        throw new Error("Please select a class");
      }
  
      if (!formData.studentId) {
        throw new Error("Please select a student");
      }
  
      formData.subjects.forEach((subject) => {
        const mark = parseFloat(subject.mark);
        if (isNaN(mark)) {
          throw new Error(`${subject.subject} mark must be a number`);
        }
        if (mark < 0 || mark > 100) {
          throw new Error(`${subject.subject} mark must be between 0 and 100`);
        }
      });
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError(null);
  
      try {
        validateForm();
        const formattedData = studentMarksService.formatMarksData(formData);
        await studentMarksService.addStudentMarks(formattedData);
        showToast("Student marks added successfully", "success");
        navigate(-1);
      } catch (err) {
        setError(err.message || "An error occurred while saving marks");
        showToast(err.message || "An error occurred while saving marks", "error");
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded shadow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Add Student Marks</h2>
          <button
            onClick={() => navigate(-1)}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Back
          </button>
        </div>
  
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
  
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Class Selection */}
          <div>
            <label htmlFor="classSelect" className="block mb-2 font-medium">
              Select Class
            </label>
            <select
              id="classSelect"
              value={formData.classId}
              onChange={(e) => handleClassChange(e.target.value)}
              required
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              disabled={loading}
            >
              <option value="">Select a class</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name} {cls.section}
                </option>
              ))}
            </select>
          </div>
  
          {/* Student Selection */}
          {students.length > 0 && (
            <div>
              <label htmlFor="studentSelect" className="block mb-2 font-medium">
                Select Student
              </label>
              <select
                id="studentSelect"
                value={formData.studentId}
                onChange={(e) => handleStudentChange(e.target.value)}
                required
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                disabled={loading}
              >
                <option value="">Select a student</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.name} ({student.registrationNumber})
                  </option>
                ))}
              </select>
            </div>
          )}
  
          {/* Subject Marks */}
          {formData.subjects.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Subject Marks</h3>
              {formData.subjects.map((subject, index) => (
                <div key={index} className="flex items-center gap-4">
                  <label className="w-1/2 font-medium">{subject.subject}</label>
                  <input
                    type="number"
                    value={subject.mark}
                    onChange={(e) => handleMarkChange(index, e.target.value)}
                    required
                    min={0}
                    max={100}
                    className="w-1/2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    disabled={loading}
                  />
                </div>
              ))}
            </div>
          )}
  
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Submitting...</span>
              </div>
            ) : (
              "Submit Marks"
            )}
          </button>
        </form>
      </div>
    );
  };
  export default AddStudentMarksForm