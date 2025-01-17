import api from "./api";

class RouteService {
  // Create a new route
  static async createRoute(routeData) {
    try {
      const response = await api.post("/vehicle-route", routeData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update route
  static async updateRoute(id, updateData) {
    try {
      const response = await api.put(`/vehicle-route/${id}`, updateData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get single route details
  static async getRoute(id) {
    try {
      const response = await api.get(`/vehicle-route/${id}`);
      console.log("response", response);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get all routes
  static async getAllRoutes() {
    try {
      const response = await api.get("/vehicle-route");
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Validate stops data
  static validateStops(stops) {
    if (!Array.isArray(stops) || stops.length === 0) {
      throw new Error("Stops must be a non-empty array");
    }

    stops.forEach((stop, index) => {
      if (!stop.stop || !stop.lng || !stop.lat || !stop.sequence) {
        throw new Error(
          `Invalid stop data at index ${index}. All stops must have stop name, longitude, latitude, and sequence.`
        );
      }
    });

    return true;
  }

  // Helper method to handle errors
  static handleError(error) {
    if (error.response) {
      return {
        status: error.response.status,
        message:
          error.response.data.message ||
          error.response.data.error ||
          "An error occurred",
        error: error.response.data.error,
      };
    } else if (error.request) {
      return {
        status: 503,
        message: "Service unavailable",
        error: "No response received from server",
      };
    } else {
      return {
        status: 500,
        message: "Request failed",
        error: error.message,
      };
    }
  }

  // Get routes for dropdown
  static async getRoutesForDropdown() {
    try {
      const response = await api.get("/vehicle-route");
      // console.log("response.data.data", response.data.data);
      return response.data.data.map((route) => ({
        value: route._id,
        label: route.name || `Route ${route._id}`,
      }));
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

export default RouteService;
