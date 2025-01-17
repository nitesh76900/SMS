// services/studentMarksService.js
import api from "./api";

export const studentMarksService = {
  // Add marks for a student
  addStudentMarks: async (marksData) => {
    console.log('marksData in addStudentMarks', marksData)
    try {
      const response = await api.post("/student-marks", marksData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all students' marks (for teachers)
  getAllStudentMarks: async () => {
    try {
      const response = await api.get("/student-marks");
      console.log("response.data", response.data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get marks for a specific student by registration number and DOB
  getStudentMarksByRegistration: async (registrationNumber, dob) => {
    try {
      const response = await api.get(
        `/student-marks/student/${registrationNumber}/${dob}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update marks for a specific student
  updateStudentMarks: async (studentId, marksData) => {
    try {
      // console.log('studentId', studentId)
      const response = await api.put(`/student-marks/${studentId}`, marksData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Format marks data for API submission
  formatMarksData: (formData) => {
    console.log('format marks data called formData', formData)
    return {
      marks: formData.subjects.map((subject) => ({
        subject: subject.subject,
        mark: parseFloat(subject.mark),
      })),
      studentId: formData.studentId,
    };
  },

  // Process marks data for class view
  processMarksData: (marksData) => {
    console.log("Processing marks data:", marksData);

    // Group marks by class and section
    const groupedData = marksData.reduce((acc, mark) => {
      const student = mark.studentId;
      console.log("Processing student:", student);
      const key = `${student.class}-${student.section}`;

      if (!acc[key]) {
        acc[key] = {
          id: key,
          className: student.class,
          section: student.section,
          totalStudents: 0,
          marksUploaded: 0,
          marksPending: 0,
        };
      }

      acc[key].totalStudents++;
      if (mark.marks && mark.marks.length > 0) {
        acc[key].marksUploaded++;
      } else {
        acc[key].marksPending++;
      }

      return acc;
    }, {});

    const result = Object.values(groupedData);
    console.log("Processed result:", result);
    return result;
  },

  // Calculate student result
  calculateStudentResult: (marks) => {
    const totalMarks = marks.reduce((sum, mark) => sum + mark.mark, 0);
    const percentage = (totalMarks / (marks.length * 100)) * 100;
    return {
      totalMarks: totalMarks.toFixed(2),
      percentage: percentage.toFixed(2),
      result: percentage >= 40 ? "Pass" : "Fail",
    };
  },
};
