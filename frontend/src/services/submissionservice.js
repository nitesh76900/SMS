import api from "./api";

class SubmissionService {
  // Start a new test attempt
  static async startTest(testId) {
    try {
      const response = await api.post(`/submission/start/${testId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Submit test answers
  static async submitTest(submissionId, answers) {
    try {
      const response = await api.post(`/submission/submit/${submissionId}`, {
        answers: answers.map((answer) => ({
          questionId: answer.questionId,
          selectedOptions: answer.selectedOptions,
        })),
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get test details by ID
  static async getTestById(testId) {
    try {
      const response = await api.get(`/tests/${testId}`);
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get submission details by ID
  static async getSubmissionById(submissionId) {
    try {
      const response = await api.get(`/submission/${submissionId}`);
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get all submissions for a student
  static async getStudentSubmissions(studentId) {
    try {
      const response = await api.get(`/submission/${studentId}`);
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  static async getTestSubmissions(testId) {
    try {
      const response = await api.get(`/submission/all/${testId}`);
      return response.data.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  // Error handler
  static handleError(error) {
    const errorMessage =
      error.response?.data?.error || error.message || "An error occurred";
    console.error("Assessment Service Error:", errorMessage);
    throw new Error(errorMessage);
  }
}

export default SubmissionService;
