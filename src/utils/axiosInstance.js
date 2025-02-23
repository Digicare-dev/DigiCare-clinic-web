import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const REFRESH_TOKEN_URL = process.env.REACT_APP_REFRESH_TOKEN_URL;

// Axios Instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // Ensure cookies are sent with every request
});

// Variables to manage token refresh state
let isRefreshing = false; // Flag to check if a token refresh is in progress
let failedRequestsQueue = []; // Queue to hold failed requests while refreshing

// Function to refresh token
const refreshAccessToken = async () => {
  try {
    const response = await axios.post(
      REFRESH_TOKEN_URL,
      {},
      { withCredentials: true }
    );
    return response.data; // Return the new tokens if needed
  } catch (error) {
    console.error("Refresh token failed. Redirecting to login.");
    // Clear user data and redirect to login
    localStorage.removeItem("user");
    window.location.replace("/login");
    throw error;
  }
};

// Response Interceptor: Handle Token Expiration
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if the error is due to an expired token (401 Unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If a token refresh is already in progress, queue the failed request
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({ resolve, reject });
        })
          .then(() => {
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      // Mark the request as retried
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Refresh the token
        await refreshAccessToken();

        // Retry the original request
        const response = await axiosInstance(originalRequest);

        // Resolve all queued requests
        failedRequestsQueue.forEach(({ resolve }) => resolve());
        failedRequestsQueue = [];

        return response;
      } catch (refreshError) {
        // If token refresh fails, reject all queued requests
        failedRequestsQueue.forEach(({ reject }) => reject(refreshError));
        failedRequestsQueue = [];

        // Redirect to login
        localStorage.removeItem("user");
        window.location.replace("/login");
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // For other errors, reject the request
    return Promise.reject(error);
  }
);

export default axiosInstance;
