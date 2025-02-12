import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/login/`, {
      username,
      password,
    });

    if (!response.data.access || !response.data.refresh) {
      throw new Error("Invalid response structure");
    }

    localStorage.setItem("accessToken", response.data.access);
    localStorage.setItem("refreshToken", response.data.refresh);

    return response.data;
  } catch (error) {
    console.error(
      "Login failed:",
      error.response ? error.response.data : error
    );
    throw error;
  }
};
