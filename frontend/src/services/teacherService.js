// Import the api instance (assuming it's configured with base URL and interceptors)
import api from "./api";

const teacherService = {
  // Get all teachers
  getAllTeachers: async () => {
    console.log("Fetching all teachers");
    try {
      const response = await api.get("/teachers");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get teacher by ID
  getTeacherById: async (id) => {
    console.log("Fetching teacher with ID:", id);
    try {
      const response = await api.get(`/teachers/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get teacher by ID for editing
//   getTeacherForEdit: async (id) => {
//     try {
//       const response = await api.get(`/teachers/${id}/edit`);
//       return response.data;
//     } catch (error) {
//       throw error.response?.data || error.message;
//     }
//   },

  // Update teacher
  updateTeacher: async (id, teacherData) => {
    try {
      const response = await api.put(`/teachers/${id}`, teacherData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default teacherService;
