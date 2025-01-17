import api from "./api";

// get all classes
export const getAllClasses = async () => {
  try {
    const response = await api.get("/class");
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

// get class by ID
export const getClassById = async (id) => {
  try {
    const response = await api.get(`/class/${id}`);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

// add new class
export const addClass = async (classData) => {
  console.log(classData);
  try {
    const response = await api.post("/admin/add-class", classData);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

// update class
export const updateClass = async (id, updateData) => {
  try {
    const response = await api.put(`/class/${id}`, updateData);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

// delete class
export const deleteClass = async (id) => {
  try {
    const response = await api.delete(`/class/${id}`);
    return response.data;
  } catch (error) {
    console.log(error);
  }
};
