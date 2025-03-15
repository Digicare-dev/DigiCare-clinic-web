import React from "react";
import { Snackbar, Alert } from "@mui/material";

const CustomSnackbar = ({ open, message, severity, onClose }) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={2000}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      components={{
        Root: (props) => {
          const { ownerState, ...other } = props;
          return <div {...other} />;
        }
      }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
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
          {message}
        </span>
      </Alert>
    </Snackbar>
  );
};

export default CustomSnackbar;
