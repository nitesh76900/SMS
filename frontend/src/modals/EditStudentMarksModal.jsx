import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { studentMarksService } from "../services/studentMarksServices";
import { getClassById } from "../services/classService";

const EditStudentMarksModal = () => {
  const { studentId } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [studentMarks, setStudentMarks] = useState({
    studentId: "",
    subjects: [],
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudentMarks = async () => {
      setLoading(true);
      try {
        const response = await studentMarksService.getAllStudentMarks();
        const studentData = response.find((mark) => mark._id === studentId);

        if (studentData) {
          // Get class subjects from the student's class
          const classResponse = await getClassById(
            studentData.studentId.class._id
          );
          const classSubjects = classResponse.data.subjects || [];

          // Map existing marks to class subjects
          const initializedSubjects = classSubjects.map((subject) => {
            const existingMark = studentData.marks.find(
              (mark) => mark.subject === subject.subjectName
            );
            return {
              subject: subject.subjectName,
              mark: existingMark ? existingMark.mark.toString() : "",
            };
          });

          setStudentMarks({
            studentId,
            subjects: initializedSubjects,
          });
        }
      } catch (err) {
        setError("Failed to fetch student marks");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentMarks();
  }, [studentId]);

  const handleMarkChange = (index, value) => {
    const newSubjects = [...studentMarks.subjects];
    newSubjects[index].mark = value;
    setStudentMarks((prev) => ({
      ...prev,
      subjects: newSubjects,
    }));
  };

  const validateForm = () => {
    studentMarks.subjects.forEach((subject) => {
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
      const formattedData = studentMarksService.formatMarksData(studentMarks);
      console.log("studentId", studentId);
      await studentMarksService.updateStudentMarks(studentId, formattedData);
      navigate(-1);
    } catch (err) {
      setError(err.message || "An error occurred while updating marks");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Edit Student Marks</h2>
            <button
              onClick={() => navigate(-1)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {studentMarks.subjects.map((subject, index) => (
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

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Updating...</span>
                    </div>
                  ) : (
                    "Update Marks"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditStudentMarksModal;
