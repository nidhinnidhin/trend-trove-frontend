import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://13.126.18.175/api";

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});
// csrf
const fetchCSRFToken = async () => {
  try {
    const response = await axios.get('http://13.126.18.175/api/csrf-token', {
      withCredentials: true
    });
    return response.data.csrfToken;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    return null;
  }
};

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("usertoken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    if (config.method !== 'get') {
      const csrfToken = await fetchCSRFToken();
      if (csrfToken) {
        config.headers["x-csrf-token"] = csrfToken;
      }
    }

    return config;
  },
  
  (error) => {
    return Promise.reject(error);
  }

);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 403 && 
        error.response?.data?.message?.includes('CSRF') && 
        !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const csrfToken = await fetchCSRFToken();
        if (csrfToken) {
          originalRequest.headers["x-csrf-token"] = csrfToken;
          return axiosInstance(originalRequest);
        }
      } catch (retryError) {
        return Promise.reject(retryError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
