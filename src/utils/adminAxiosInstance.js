import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:9090/api/admin", 
  withCredentials: true, 
});

// Add request interceptor to handle CSRF token
axiosInstance.interceptors.request.use(
  async (config) => {
    // Only fetch CSRF token for non-GET requests
    if (config.method !== 'get') {
      try {
        const response = await axios.get("http://localhost:9090/api/csrf-token", {
          withCredentials: true,
        });
        config.headers["x-csrf-token"] = response.data.csrfToken;
      } catch (error) {
        console.error("Error fetching CSRF token:", error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
