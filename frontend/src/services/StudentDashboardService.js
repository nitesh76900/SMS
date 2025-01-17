import api from './api';

class StudentDashboardService {
  static async getDashboardData() {
    try {
      const response = await api.get('/student-dashboard');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }
}

export default StudentDashboardService;