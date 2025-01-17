// Import the api instance that handles axios configuration
import api from "./api";

export class VehicleService {

  static async addVehicle(vehicleData) {
    try {
      const response = await api.post("/vehicle", vehicleData);
      return response.data;
    } catch (error) {
      console.log(error)
      this.handleError(error);
    }
  }

  static async updateVehicle(id, updateData) {
    try {
      const response = await api.put(`/vehicle/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.log(error)
      this.handleError(error);
    }
  }

  static async getVehicle(id) {
    try {
      const response = await api.get(`/vehicle/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  static async getAllVehicles() {
    try {
      const response = await api.get("/vehicle");
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  static async deleteVehicle(id) {
    try {
      const response = await api.delete(`/vehicle/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  static handleError(error) {
    if (error.response) {
      // Server responded with error status
      const message =
        error.response.data.error ||
        error.response.data.message ||
        "An error occurred";
      throw new Error(message);
    } else if (error.request) {
      // Request made but no response received
      throw new Error("No response from server");
    } else {
      // Error in request setup
      throw new Error("Error setting up request");
    }
  }
}

export default VehicleService;
