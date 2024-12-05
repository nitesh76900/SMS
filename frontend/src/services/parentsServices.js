import api from "./api";

// Get all parents
export const getAllParents = async () => {
  console.log("Fetching all parents...");
  try {
    const response = await api.get("/parents");
    console.log("Successfully fetched parents:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error getting parents:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

// Get parent by parentId
export const getParentById = async (id) => {
  console.log("Fetching parent with ID:", id);
  try {
    const response = await api.get(`/parents/${id}`);
    console.log("Successfully fetched parent:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error getting parent:", {
      id,
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

// Get parent by studentID
export const getParentByStudentId = async (id) => {
  console.log("Fetching parent with ID:", id);
  try {
    const response = await api.get(`/parents/student/${id}`);
    console.log("Successfully fetched parent:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error getting parent:", {
      id,
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};

// Update parent
export const updateParent = async (id, updateData) => {
  console.log("Updating parent with ID:", id);
  console.log("Update data:", updateData);
  try {
    const response = await api.put(`/parents/${id}`, updateData);
    console.log("Successfully updated parent:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating parent:", {
      id,
      updateData,
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};
