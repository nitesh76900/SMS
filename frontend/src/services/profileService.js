// services/profileService.js
import api from "./api";

const ProfileService = {
  // Get user profile
  async getProfile() {
    console.log('get profile called')
    try {
      const response = await api.get("/profile/");
      console.log('response in get profile', response)
      console.log(response)
      return response.data;
    } catch (error) {
      console.log(error)
      throw this.handleError(error);
    }
  },

  // Change password
  async changePassword(oldPassword, newPassword) {
    try {
      const response = await api.put("/profile/change-password", {
        oldPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // Error handler
  handleError(error) {
    if (error.response) {
      throw {
        message: error.response.data.error || "An error occurred",
        status: error.response.status,
      };
    } else if (error.request) {
      throw {
        message: "No response from server",
        status: 503,
      };
    } else {
      throw {
        message: error.message || "An error occurred",
        status: 500,
      };
    }
  },
};

export default ProfileService;
