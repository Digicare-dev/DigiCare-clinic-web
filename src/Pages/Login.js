import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { login as loginService } from "../services/authService";
import {
  TextField,
  Button,
  CircularProgress,
  FormControl,
  OutlinedInput,
  InputLabel,
  InputAdornment,
  IconButton,
  Typography,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LockIcon from "@mui/icons-material/Lock";
import { Snackbar, Alert } from "@mui/material";
import { Navigate } from "react-router-dom";

import "./Login.css";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [credential, setCredential] = useState({
    username: "",
    password: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "error",
  });

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredential((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await loginService(credential.username, credential.password);
      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);

      await new Promise((resolve) => setTimeout(resolve, 50));

      navigate("/", { state: { freshLogin: true } }, { replace: true });
    } catch (error) {
      let errorMessage = "Login failed. Please try again.";

      if (error.response) {
        switch (error.response.status) {
          case 401:
            errorMessage = "Invalid credentials";
            break;
          case 403:
            errorMessage = "Account locked";
            break;
          case 500:
            errorMessage = "Server error";
            break;
        }
      } else if (error.message.includes("Network Error")) {
        errorMessage = "Network error";
      }

      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-background">
      <div className="desktop-content">
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            color: "#1976d2",
            mt: 4,
            marginBottom: "50px",
          }}
        >
          Welcome Back!
        </Typography>
      </div>

      <div className="login-container">
        <div className="mobile-header">
          <Typography
            variant="body2"
            sx={{
              color: "#666",
              mb: 4,
              fontSize: "0.9rem",
            }}
          >
            Sign in to continue
          </Typography>
        </div>

        <form onSubmit={handleLogin}>
          <TextField
            name="username"
            label="Username"
            variant="outlined"
            fullWidth
            required
            value={credential.username}
            onChange={handleChange}
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                backgroundColor: "#f8f9fa",
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonOutlineIcon sx={{ color: "#1976d2" }} />
                </InputAdornment>
              ),
            }}
            InputLabelProps={{
              style: { color: "#666" },
              shrink: true,
            }}
          />

          <FormControl fullWidth sx={{ mb: 4 }}>
            <InputLabel style={{ color: "#666" }}>Password</InputLabel>
            <OutlinedInput
              required
              name="password"
              value={credential.password}
              onChange={handleChange}
              type={showPassword ? "text" : "password"}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleClickShowPassword}
                    onMouseDown={(e) => e.preventDefault()}
                    edge="end"
                  >
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              }
              startAdornment={
                <InputAdornment position="start">
                  <LockIcon sx={{ color: "#1976d2" }} />
                </InputAdornment>
              }
              sx={{
                borderRadius: "8px",
                backgroundColor: "#f8f9fa",
                "&:hover fieldset": {
                  borderColor: "#1976d2 !important",
                },
              }}
              label="Password"
            />
          </FormControl>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            className="custom-button"
            sx={{
              py: 1.5,
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: 600,
              textTransform: "none",
              bgcolor: "#1976d2",
              "&:hover": {
                bgcolor: "#1565c0",
              },
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Login;
