import api from './api'; // Assuming this is the base API configuration

const StudentAttendanceService = {
  // Get all students attendance for a specific class
  getAllClassStudentAttendance: async (classID) => {
    try {
      const response = await api.get(`/student-attendance/attendance/${classID}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching class student attendance:', error);
      throw error;
    }
  },

  // Get a specific student's attendance
  getStudentAttendance: async (studentId) => {
    try {
      const response = await api.get(`/student-attendance/${studentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching student attendance:', error);
      throw error;
    }
  },

  // Add student attendance
  addStudentAttendance: async (attendanceData) => {
    try {
      const response = await api.post('/student-attendance', attendanceData);
      return response.data;
    } catch (error) {
      console.error('Error adding student attendance:', error);
      throw error;
    }
  },

  // Update student attendance
  updateStudentAttendance: async (id, attendanceData) => {
    try {
      const response = await api.put(`/student-attendance/${id}`, attendanceData);
      return response.data;
    } catch (error) {
      console.error('Error updating student attendance:', error);
      throw error;
    }
  },

  // Get monthly attendance
  getMonthlyAttendance: async (year, month) => {
    try {
      const response = await api.get(`/student-attendance/monthly/${year}/${month}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching monthly attendance:', error);
      throw error;
    }
  },

  // Get monthly attendance by class
  getMonthlyAttendanceByClass: async (year, month, classId) => {
    try {
      const response = await api.get(`/student-attendance/monthly-class/${year}/${month}/${classId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching monthly attendance by class:', error);
      throw error;
    }
  }
};

export default StudentAttendanceService;