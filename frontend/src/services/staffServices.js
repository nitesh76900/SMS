import api from "./api";

class StaffService {
  // Add a new department
  static async addDepartment(name) {
    try {
      console.log("NAme:", name);
      const response = await api.post("/staff/department", name);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || "Failed to add department";
    }
  }

  // Get staff by department ID
  static async getStaffByDepartment(departmentId) {
    try {
      const response = await api.get(`/department/${departmentId}`);
      return response.data;
    } catch (error) {
      throw (
        error.response?.data?.error || "Failed to fetch staff by department"
      );
    }
  }

  // Get all staff members
  static async getAllStaff() {
    try {
      const response = await api.get("/staff");
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || "Failed to fetch all staff";
    }
  }

  // Get staff member by ID
  static async getStaff(staffId) {
    try {
      console.log("Staff Id:", staffId);
      const response = await api.get(`/staff/${staffId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || "Failed to fetch staff member";
    }
  }

  // Add a new staff member
  static async addStaff(staffData) {
    try {
      console.log("staffData:", staffData);
      const response = await api.post("/staff", staffData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || "Failed to add staff member";
    }
  }

  // Change staff role
  static async changeRole(staffId, departmentId, position) {
    try {
      const response = await api.put(`/staff/department/${staffId}`, {
        department: departmentId,
        position,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || "Failed to change staff role";
    }
  }

  // Update staff member
  static async updateStaff(staffId, updatedData) {
    try {
      const response = await api.put(`/${staffId}`, updatedData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || "Failed to update staff member";
    }
  }

  // Delete staff member
  static async deleteStaff(staffId) {
    try {
      const response = await api.delete(`/staff/${staffId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || "Failed to delete staff member";
    }
  }
}

export default StaffService;
