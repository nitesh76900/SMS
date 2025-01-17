import api from "./api";

class TimeTableService {
  // Add a new timetable
  static async addTimeTable(timeTableData) {
    try {
      const response = await api.post("/time-table", timeTableData);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Get all timetables
  static async getAllTimeTables() {
    try {
      const response = await api.get("/time-table");
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Get timetable for a specific class
  static async getClassTimeTable(classId) {
    try {
      const response = await api.get(`/time-table/class/${classId}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Get timetable by id
  static async getTimetableById(id) {
    try {
      const response = await api.get(`/time-table/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Update an existing timetable
  static async updateTimeTable(id, updateData) {
    try {
      const response = await api.put(`/time-table/${id}`, updateData);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Delete a timetable
  static async deleteTimeTable(id) {
    try {
      const response = await api.delete(`/time-table/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Get timetable for a specific teacher
  static async getTeacherTimeTable(teacherId) {
    try {
      const response = await api.get(`/time-table/teacher/${teacherId}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Get today's timetable
  static async getTodayTimeTable() {
    try {
      const response = await api.get(`/time-table/today`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  static async getFindFreeTeacher(day, periodNumber) {
    console.log("day", day);
    console.log("periodNumber", periodNumber);
    try {
      const response = await api.post("/time-table/find-free-teacher", {
        day,
        periodNumber,
      });
      return response.data; // Response includes { message, freeTeachers }
    } catch (error) {
      console.error("Error fetching free teachers:", error);
      throw (
        error.response?.data || {
          error: "An error occurred while fetching free teachers.",
        }
      );
    }
  }

  // Error handling method with more detailed error management
  static handleError(error) {
    if (error.response) {
      console.error("Server Error:", error.response.data);
      throw new Error(
        error.response.data.message ||
          error.response.data.error ||
          "An unexpected error occurred"
      );
    } else if (error.request) {
      console.error("Network Error:", error.request);
      throw new Error(
        "No response received from server. Please check your network connection."
      );
    } else {
      console.error("Error:", error.message);
      throw new Error("Error setting up the request");
    }
  }
}

export default TimeTableService;
