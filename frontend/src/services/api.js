import axios from "axios";

// Create an Axios instance with base URL
const api = axios.create({
  // baseURL: "http://localhost:3000/api",
  baseURL: "https://sms-hp9f.onrender.com/api",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.log("error", error);
      // if (window.location.pathname !== "/") {
      //   window.location.href = "/";
      // }
    }
    return Promise.reject(error);
  }
);
export default api;
