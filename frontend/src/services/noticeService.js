import api from "./api";

// Create a new notice
export const createNotice = async (noticeData) => {
  try {
    const response = await api.post("/notices", noticeData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get all notices with optional audience filter
export const getAllNotices = async (audience = "") => {
  try {
    const response = await api.get("/notices", {
      params: audience ? { audience } : {},
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get a specific notice by ID
export const getNoticeById = async (noticeId) => {
  try {
    const response = await api.get(`/notices/${noticeId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update a notice
export const updateNotice = async (noticeId, updateData) => {
  try {
    const response = await api.put(`/notices/${noticeId}`, updateData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Delete a notice
export const deleteNotice = async (noticeId) => {
  try {
    const response = await api.delete(`/notices/${noticeId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};