import axios from 'axios';

export const setupAxios = () => {
  // Set default configs
  axios.defaults.withCredentials = true;
  axios.defaults.baseURL = 'http://13.126.18.175:9090/api/';
  
  // Add global request interceptor
  axios.interceptors.request.use(
    async (config) => {
      if (config.method !== 'get') {
        try {
          const response = await axios.get('/csrf-token', {
            withCredentials: true
          });
          config.headers["x-csrf-token"] = response.data.csrfToken;
        } catch (error) {
          console.error('Error fetching CSRF token:', error);
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Add global response interceptor
  axios.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error)
  );
}; 