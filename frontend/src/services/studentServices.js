import api from "./api";

const StudentService = {
  // Get all students
  async getAllStudents() {
    try {
      const response = await api.get("/students");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get student by ID
  async getStudentById(id) {
    try {
      console.log("id", id);
      const response = await api.get(`/students/${id}`);
      console.log("response.data", response.data.data);
      return response.data.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get students by class
  async getStudentByClass(classId) {
    try {
      console.log("classId", classId);
      const response = await api.get(`/students/student-by-class/${classId}`);
      console.log("Class Students:", response.data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update student by ID
  async updateStudent(id, studentData) {
    try {
      const response = await api.put(`/students/${id}`, studentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete student by ID
  async deleteStudent(id) {
    try {
      const response = await api.delete(`/students/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Add fee payment
  async addFeePayment(paymentData) {
    try {
      const response = await api.post("/students/fee-payment", paymentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all receipts
  async getAllReceipts() {
    try {
      const response = await api.get("/students/receipt");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get receipt by ID
  async getReceiptById(id) {
    try {
      const response = await api.get(`/students/receipt/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all receipts by student ID
  async getReceiptsByStudent(studentId) {
    try {
      const response = await api.get(`/students/receipt/student/${studentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Send fee reminder email
  async sendFeeReminderEmail(studentId) {
    try {
      const response = await api.get(
        `/students/fee/reminder-by-email/${studentId}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default StudentService;
