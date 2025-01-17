import api from './api'; // Import your API configuration file

const TeacherAttendanceService = {
  /**
   * Add teacher attendance
   * @param {Object} attendanceData - The attendance details to add
   * @returns {Promise<Object>} - Response from the API
   */
  addTeacherAttendance: async (attendanceData) => {
    try {
      const response = await api.post('/teacher-attendance', attendanceData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  /**
   * Get attendance records for a specific teacher
   * @param {string} teacherId - The ID of the teacher
   * @returns {Promise<Object>} - Response from the API
   */
  getTeacherAttendance: async (teacherId) => {
    try {
      const response = await api.get(`/teacher-attendance/${teacherId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  /**
   * Get all teacher attendance records
   * @returns {Promise<Object>} - Response from the API
   */
  getAllTeacherAttendance: async () => {
    try {
      const response = await api.get('/teacher-attendance');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  /**
   * Update teacher attendance record
   * @param {string} id - The attendance record ID
   * @param {Object} attendanceData - The updated attendance details
   * @returns {Promise<Object>} - Response from the API
   */
  updateTeacherAttendance: async (id, attendanceData) => {
    try {
      const response = await api.put(`/teacher-attendance/${id}`, attendanceData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};

export default TeacherAttendanceService;
