import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { login as loginService } from "../services/authService";
import { getAutoLogoutMessage } from "../utils/authUtils";
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
  const user = JSON.parse(localStorage.getItem("user"));
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const isMobile = window.innerWidth <= 768;
  //

  const [credential, setCredential] = useState({
    username: "",
    password: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "error",
  });
  const [error, setError] = useState("");

  // Check for auto logout message on component mount
  useEffect(() => {
    const autoLogoutInfo = getAutoLogoutMessage();
    if (autoLogoutInfo) {
      setSnackbar({
        open: true,
        message: autoLogoutInfo.message,
        severity: autoLogoutInfo.severity,
      });
    }
  }, []);

  if (user) {
    return <Navigate to={isMobile ? "/mobile-queue" : "/"} replace />;
  }

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredential((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Import dummy login service
      const { dummyLogin } = await import('../services/dummyDataService');
      
      // Attempt login with dummy credentials
      const response = await loginService( credential.username, credential.password );
      console.log(response);
      if (response.username) {
        // Store user in localStorage
        localStorage.setItem("user", JSON.stringify(response));

        
        // Update context
        setUser(response);
        
        // Redirect based on device type
        const isMobileDevice = window.innerWidth <= 768;
        navigate(isMobileDevice ? "/mobile-queue" : "/");
      } else {
        setError(response.message || "Login failed. Please try again.");
        setSnackbar({
          open: true,
          message: response.message || "Login failed. Please try again.",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred during login. Please try again.");
      setSnackbar({
        open: true,
        message: "An error occurred during login. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-background">
      <div style={{marginTop: "-150px", display:"flex", justifyContent:"center", alignItems:"center", flexDirection:"column"}}>

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

          <FormControl fullWidth sx={{ mb: 4 , mt: 2 }}>
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
              mt: 4,
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
    </div>
  );
};

export default Login;
