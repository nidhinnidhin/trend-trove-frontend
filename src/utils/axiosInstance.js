import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:9090/api/", 
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("usertoken"); 
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.log("Token expired or invalid. Please log in again.");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
