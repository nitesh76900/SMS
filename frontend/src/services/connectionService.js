import api from "./api";

//add connection
export const addConnection = async (connectionData) => {
  try {
    const response = await api.post("/connections", connectionData);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

//get all connections
export const getAllConnections = async () => {
  try {
    const response = await api.get("/connections");
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

//get connection using ID
export const getConnectionById = async (id) => {
  try {
    const response = await api.get(`/connections/${id}`);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

//update connection
export const updateConnection = async (id, updateData) => {
  console.log("Id:", id);
  console.log("ConneData:", updateData);
  try {
    const response = await api.put(`/connections/${id}`, updateData);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

//delete connection
export const deleteConnection = async (id) => {
  try {
    const response = await api.delete(`/connections/${id}`);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};
