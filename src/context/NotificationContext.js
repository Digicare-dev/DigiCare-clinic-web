import React, { createContext, useState, useContext } from "react";

export const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "info", // 'error', 'warning', 'info', 'success'
    autoHideDuration: 6000,
  });

  const showNotification = (message, severity = "info", autoHideDuration = 6000) => {
    setNotification({
      open: true,
      message,
      severity,
      autoHideDuration,
    });
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
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider; 