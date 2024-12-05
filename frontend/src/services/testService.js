import api from "./api"; // Assuming an existing api.js file for axios configuration

const TestService = {
  // Create a new test
  createTest: async (testData) => {
    try {
      console.log("testData in service", testData);
      const response = await api.post("/tests", testData);
      return response.data;
    } catch (error) {
      console.error("Error creating test:", error);
      throw error;
    }
  },

  // Get all tests
  getAllTests: async () => {
    try {
      const response = await api.get("/tests");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching tests:", error);
      throw error;
    }
  },

  // Get test by ID
  getTestById: async (testId) => {
    try {
      console.log("testId in service", testId);
      const response = await api.get(`/tests/${testId}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching test ${testId}:`, error);
      throw error;
    }
  },

  // Update test
  updateTest: async (testId, testData) => {
    try {
      const response = await api.put(`/tests/${testId}`, testData);
      return response.data;
    } catch (error) {
      console.error(`Error updating test ${testId}:`, error);
      throw error;
    }
  },

  // Delete test
  deleteTest: async (testId) => {
    try {
      const response = await api.delete(`/tests/${testId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting test ${testId}:`, error);
      throw error;
    }
  },

  // Add questions to a test
  addQuestionsToTest: async (testId, questions) => {
    try {
      const response = await api.post(`/tests/${testId}/questions`, {
        questions,
      });
      return response.data;
    } catch (error) {
      console.error(`Error adding questions to test ${testId}:`, error);
      throw error;
    }
  },
};

export default TestService;
