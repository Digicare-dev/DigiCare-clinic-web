import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const REFRESH_TOKEN_URL = process.env.REACT_APP_REFRESH_TOKEN_URL;

// Axios Instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Flag to prevent multiple token refresh requests
let isRefreshing = false;
let refreshSubscribers = [];

// Function to refresh token
const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    // if (!refreshToken) throw new Error("No refresh token");

    const { data } = await axios.post(REFRESH_TOKEN_URL, {
      refresh: refreshToken,
    });

    localStorage.setItem("accessToken", data.access);
    localStorage.setItem("refreshToken", data.refresh);

    refreshSubscribers.forEach((callback) => callback(data.access));
    refreshSubscribers = [];
    return data.access;
  } catch (error) {
    console.error("Session expired. Redirecting to login.");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.replace("/login");
    throw error;
  }
};

// Request Interceptor: Attach Authorization Header
axiosInstance.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Response Interceptor: Handle Token Expiration
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          await refreshAccessToken();
          isRefreshing = false;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          isRefreshing = false;
          return Promise.reject(refreshError);
        }
      }

      return new Promise((resolve) => {
        refreshSubscribers.push((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(axiosInstance(originalRequest));
        });
      });
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
