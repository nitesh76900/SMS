import api from "./api";

export class VehicleHistoryService {
  static async addVehicleHistory(historyData) {
    try {
      const response = await api.post("/vehicle-history", {
        vehicleId: historyData.vehicleId,
        driverId: historyData.driverId,
        routeId: historyData.routeId,
        date: historyData.date,
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  static async updateVehicleHistoryStop(updateData) {
    try {
      const response = await api.put("/vehicle-history", {
        historyId: updateData.id,
        stopName: updateData.stopName,
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  static async getVehicleHistories(params = {}) {
    try {
      const queryParams = new URLSearchParams();

      // Add pagination parameters
      if (params.page) queryParams.append("page", params.page);
      if (params.limit) queryParams.append("limit", params.limit);

      // Add filters
      if (params.id) queryParams.append("id", params.id);
      if (params.stopName) queryParams.append("stopName", params.stopName);
      if (params.startDate) queryParams.append("startDate", params.startDate);
      if (params.endDate) queryParams.append("endDate", params.endDate);
      if (params.vehicle) queryParams.append("vehicle", params.vehicle);
      if (params.driver) queryParams.append("driver", params.driver);
      if (params.route) queryParams.append("route", params.route);
      // if (params.completed !== undefined) queryParams.append('completed', params.completed);

      const response = await api.get(
        `/vehicle-history?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  static async getVehicleHistoryById(id) {
    try {
      const response = await this.getVehicleHistories({ id });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  static handleError(error) {
    if (error.response) {
      if (error.response.status === 403) {
        throw new Error("You are not authorized to perform this action");
      }
      if (error.response.status === 404) {
        throw new Error(error.response.data.message || "Resource not found");
      }
      if (error.response.status === 400) {
        throw new Error(error.response.data.message || "Invalid request");
      }

      const message =
        error.response.data.error ||
        error.response.data.message ||
        "An error occurred";
      throw new Error(message);
    } else if (error.request) {
      throw new Error("No response from server");
    } else {
      throw new Error("Error setting up request");
    }
  }
}
