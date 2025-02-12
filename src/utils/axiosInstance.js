import axios from "axios";

// Load API URLs from environment variables
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const REFRESH_TOKEN_URL = process.env.REACT_APP_REFRESH_TOKEN_URL;

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Track refresh state to prevent multiple refresh calls
let isRefreshing = false;
let refreshQueue = [];

// Request Interceptor: Attach Authorization Header
axiosInstance.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Response Interceptor: Handle 401 Errors (Token Expired)
axiosInstance.interceptors.response.use(
  (response) => response, // Return response if no error
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 (Unauthorized) and the request has not been retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(axiosInstance(originalRequest));
          });
        });
      }

      isRefreshing = true;
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token available");

        // Request a new access token
        const { data } = await axios.post(REFRESH_TOKEN_URL, {
          refresh: refreshToken,
        });

        // Update tokens in localStorage
        localStorage.setItem("accessToken", data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem("refreshToken", data.refreshToken);
        }

        // Update axios defaults with the new token
        axiosInstance.defaults.headers.Authorization = `Bearer ${data.accessToken}`;

        // Resolve pending requests with the new token
        refreshQueue.forEach((callback) => callback(data.accessToken));
        refreshQueue = [];

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("Session expired. Redirecting to login.");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        // Use window.location.replace() to prevent infinite loops
        window.location.replace("/login");
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
