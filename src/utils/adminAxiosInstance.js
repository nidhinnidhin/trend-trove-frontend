import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:9090/api/admin", 
  withCredentials: true, 
});

export default axiosInstance;
