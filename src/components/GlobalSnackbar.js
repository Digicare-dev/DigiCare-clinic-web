import React from "react";
import { Snackbar, Alert } from "@mui/material";
import { useNotification } from "../context/NotificationContext";

const GlobalSnackbar = () => {
  const { notification, hideNotification } = useNotification();

  return (
    <Snackbar
      open={notification.open}
      autoHideDuration={notification.autoHideDuration}
      onClose={hideNotification}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert
        onClose={hideNotification}
        severity={notification.severity}
        sx={{
          width: "100%",
          boxShadow: 3,
          alignItems: "center",
          ".MuiAlert-icon": {
            alignItems: "center",
          },
        }}
      >
        <span
          style={{ fontSize: "0.95rem", display: "flex", alignItems: "center" }}
        >
          {notification.message}
        </span>
      </Alert>
    </Snackbar>
  );
};

export default GlobalSnackbar; 