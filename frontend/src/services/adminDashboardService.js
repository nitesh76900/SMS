import api from './api'; // Assuming this is the base API configuration

const AdminDashboardService = {
  // Fetch dashboard stats
  getDashboardStats: async () => {
    try {
      const response = await api.get('/dashboard/stats');
      console.log('response', response)
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Update dashboard stats
  updateDashboardStats: async (statsData) => {
    try {
      const response = await api.post('/dashboard/stats/update', statsData);
      return response.data;
    } catch (error) {
      console.error('Error updating dashboard stats:', error);
      throw error;
    }
  }
};

export default AdminDashboardService;
