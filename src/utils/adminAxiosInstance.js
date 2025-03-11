import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://www.trendrove.shop/api/admin", 
  withCredentials: true,  // Important for sending/receiving cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to handle CSRF token
axiosInstance.interceptors.request.use(
  async (config) => {
    // Only fetch CSRF token for non-GET requests
    if (config.method !== 'get') {
      try {
        const response = await axios.get("https://www.trendrove.shop/api/csrf-token", {
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

// Add response interceptor to handle authentication errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Redirect to admin login page if unauthorized
      window.location.href = '/admin/authentication/login';
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

// Add a method to check if admin is authenticated
axiosInstance.isAuthenticated = async () => {
  try {
    await axiosInstance.get('/check-auth');
    return true;
  } catch (error) {
    return false;
  }
};

export default axiosInstance;
