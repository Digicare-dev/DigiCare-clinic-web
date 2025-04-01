import React, { createContext, useState, useContext } from "react";

export const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "info", // 'error', 'warning', 'info', 'success'
    autoHideDuration: 6000,
    position: { vertical: "top", horizontal: "center" }, // Default position
    title: "", // For alerts with titles
  });

  // Main notification function that can be used for all notification types
  const showNotification = (
    message, 
    severity = "info", 
    autoHideDuration = 6000,
    position = { vertical: "top", horizontal: "center" },
    title = ""
  ) => {
    setNotification({
      open: true,
      message,
      severity,
      autoHideDuration,
      position,
      title,
    });
  };

  // Shorthand functions for common notification types with default bottom-right position
  const showSuccessSnackbar = (message, duration = 2000) => {
    showNotification(
      message, 
      "success", 
      duration,
      { vertical: "bottom", horizontal: "right" }
    );
  };

  const showErrorSnackbar = (message, duration = 2000) => {
    showNotification(
      message, 
      "error", 
      duration,
      { vertical: "bottom", horizontal: "right" }
    );
  };

  const showInfoSnackbar = (message, duration = 2000) => {
    showNotification(
      message, 
      "info", 
      duration,
      { vertical: "bottom", horizontal: "right" }
    );
  };

  const showWarningSnackbar = (message, duration = 2000) => {
    showNotification(
      message, 
      "warning", 
      duration,
      { vertical: "bottom", horizontal: "right" }
    );
  };

  // A fullscreen success alert (similar to SuccessAlert)
  const showSuccessAlert = (title, message) => {
    showNotification(
      message,
      "success",
      null, // No auto-hide for alerts
      { vertical: "center", horizontal: "center" },
      title
    );
  };

  const hideNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  return (
    <NotificationContext.Provider
      value={{
        notification,
        showNotification,
        hideNotification,
        showSuccessSnackbar,
        showErrorSnackbar,
        showInfoSnackbar,
        showWarningSnackbar,
        showSuccessAlert
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider; 