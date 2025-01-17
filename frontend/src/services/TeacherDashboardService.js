import api from "./api";

class TeacherDashboardService {
  // Get all dashboard statistics
  static async getDashboardStats() {
    try {
      const response = await api.get("/teacher-dashboard");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error;
    }
  }

  // Additional helper methods to process data
  static processAttendanceTrends(data) {
    return data.map((item) => ({
      month: item.month,
      attendance: parseFloat(item.attendance.toFixed(1)),
      absent: parseFloat(item.absent.toFixed(1)),
    }));
  }

  static processClassPerformance(data) {
    return data.map((item) => ({
      subject: item.subject,
      average: parseFloat(item.average.toFixed(1)),
    }));
  }

  static formatSchedule(data) {
    return data.map((item) => ({
      time: item.time,
      subject: item.subject,
      class: item.class,
    }));
  }
}

export default TeacherDashboardService;
