import api from "./api";

// Get all live sessions
export const getAllLiveSessions = async () => {
  console.log("Fetching all live sessions...");
  try {
    const response = await api.get("/live-sessions");
    console.log("All live sessions fetched successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching all live sessions:",
      error.response?.data?.message || error.message
    );
    throw new Error(error.response?.data?.message || "Something went wrong");
  }
};

// Get live session by ID
export const getLiveSessionById = async (sessionId) => {
  console.log(`Fetching live session with ID: ${sessionId}`);
  try {
    const response = await api.get(`/live-sessions/${sessionId}`);
    console.log(
      `Live session fetched successfully (ID: ${sessionId}):`,
      response.data
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching live session (ID: ${sessionId}):`,
      error.response?.data?.message || error.message
    );
    throw new Error(error.response?.data?.message || "Something went wrong");
  }
};

// Create new live session
export const createLiveSession = async (sessionData) => {
  console.log("Creating a new live session with data:", sessionData);
  try {
    const response = await api.post("/live-sessions", sessionData);
    console.log("New live session created successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error creating new live session:",
      error.response?.data?.message || error.message
    );
    throw new Error(error.response?.data?.message || "Something went wrong");
  }
};

// Update live session
export const updateLiveSession = async (sessionId, updateData) => {
  console.log(
    `Updating live session (ID: ${sessionId}) with data:`,
    updateData
  );
  try {
    const response = await api.put(`/live-sessions/${sessionId}`, updateData);
    console.log(
      `Live session (ID: ${sessionId}) updated successfully:`,
      response.data
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error updating live session (ID: ${sessionId}):`,
      error.response?.data?.message || error.message
    );
    throw new Error(error.response?.data?.message || "Something went wrong");
  }
};

// Update session status
export const updateSessionStatus = async (sessionId, status) => {
  console.log(`Updating status of live session (ID: ${sessionId}) to:`, status);
  try {
    const response = await api.patch(`/live-sessions/status/${sessionId}`, {
      status,
    });
    console.log(
      `Live session status (ID: ${sessionId}) updated successfully:`,
      response.data
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error updating live session status (ID: ${sessionId}):`,
      error.response?.data?.message || error.message
    );
    throw new Error(error.response?.data?.message || "Something went wrong");
  }
};

// Delete live session
export const deleteLiveSession = async (sessionId) => {
  console.log(`Deleting live session (ID: ${sessionId})...`);
  try {
    console.log("sessionId", sessionId);
    const response = await api.delete(`/live-sessions/${sessionId}`);
    console.log(
      `Live session (ID: ${sessionId}) deleted successfully:`,
      response.data
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error deleting live session (ID: ${sessionId}):`,
      error.response?.data?.message || error.message
    );
    throw new Error(error.response?.data?.message || "Something went wrong");
  }
};
