import api from "./api";

class DriverService {
  // Add a new driver
  static async addDriver(driverData) {
    console.log("Adding driver...");
    console.log("Logging FormData fields individually:");
    for (const [key, value] of driverData.entries()) {
      console.log(
        `${key}:`,
        value instanceof File ? `File: ${value.name}` : value
      );
    }

    try {
      const response = await api.post("/driver", driverData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error adding driver:", error);
      throw this.handleError(error);
    }
  }

  // Update driver details
  static async updateDriver(id, updateData) {
    try {
      const response = await api.put(`/driver/${id}`, updateData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get single driver details
  static async getDriver(id) {
    try {
      const response = await api.get(`/driver/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get all drivers
  static async getAllDrivers() {
    try {
      const response = await api.get("/driver");
      // console.log("getAllDrivers", response.data.data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Delete a driver
  static async deleteDriver(id) {
    try {
      const response = await api.delete(`/driver/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Helper method to handle errors
  static handleError(error) {
    if (error.response) {
      // Server responded with error
      const errorData = {
        status: error.response.status,
        message: error.response.data.message || "An error occurred",
        error: error.response.data.error,
      };
      throw errorData;
    } else if (error.request) {
      // Request was made but no response received
      throw {
        status: 503,
        message: "Service unavailable",
        error: "No response received from server",
      };
    } else {
      // Error in request setup
      throw {
        status: 500,
        message: "Request failed",
        error: error.message,
      };
    }
  }
}

export default DriverService;
