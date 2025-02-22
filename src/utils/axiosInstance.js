import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const REFRESH_TOKEN_URL = process.env.REACT_APP_REFRESH_TOKEN_URL;

// Axios Instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // Ensure cookies are sent with every request
});

// Function to refresh token (if needed)
const refreshAccessToken = async () => {
  try {
    const response = await axios.post(
      REFRESH_TOKEN_URL,
      {},
      { withCredentials: true }
    );
    return response.data; // This will contain the new tokens if needed
  } catch (error) {
    console.error("Session expired. Redirecting to login.");
    // Handle session expiration (e.g., redirect to login)
    window.location.replace("/login");
    throw error;
  }
};

// Request Interceptor: Optional, if you want to handle specific logic before requests
axiosInstance.interceptors.request.use((config) => {
  // You can add any custom logic here if necessary
  return config;
});

// Response Interceptor: Handle Token Expiration
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If unauthorized (401), attempt to refresh the access token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await refreshAccessToken(); // Refresh token logic
        return axiosInstance(originalRequest); // Retry original request
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
