// import axiosInstance from "../utils/axiosInstance";
// import axios from "axios";
// const API_BASE_URL = "192.168.192.5:8000";

// // Fetch data (GET request)
// export const getData = async (endpoint) => {
//   try {
//     const response = await axios.get(`${API_BASE_URL}/${endpoint}`);
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching data:", error);
//     throw error;
//   }
// };

// // Create new data (POST request)
// export const postData = async (endpoint, data) => {
//   try {
//     const response = await axios.post(`${API_BASE_URL}/${endpoint}`, data);
//     return response.data;
//   } catch (error) {
//     console.error("Error creating data:", error);
//     throw error;
//   }
// };

// // Update data (PUT request)
// export const putData = async (endpoint, data) => {
//   try {
//     const response = await axios.put(`${API_BASE_URL}/${endpoint}`, data);
//     return response.data;
//   } catch (error) {
//     console.error("Error updating data:", error);
//     throw error;
//   }
// };

// // Delete data (DELETE request)
// export const deleteData = async (endpoint) => {
//   try {
//     const response = await axios.delete(`${API_BASE_URL}/${endpoint}`);
//     return response.data;
//   } catch (error) {
//     console.error("Error deleting data:", error);
//     throw error;
//   }
// };

const API_BASE_URL = "http://192.168.192.5:8000"; // Ensure HTTP is included

// Helper function to handle fetch responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Something went wrong");
  }
  return response.json();
};

// Fetch data (GET request)
export const getData = async (endpoint) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return handleResponse(response);
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

// Create new data (POST request)
export const postData = async (endpoint, data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  } catch (error) {
    console.error("Error creating data:", error);
    throw error;
  }
};

// Update data (PUT request)
export const putData = async (endpoint, data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  } catch (error) {
    console.error("Error updating data:", error);
    throw error;
  }
};

// Delete data (DELETE request)
export const deleteData = async (endpoint) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return handleResponse(response);
  } catch (error) {
    console.error("Error deleting data:", error);
    throw error;
  }
};
