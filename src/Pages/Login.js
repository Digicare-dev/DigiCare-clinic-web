import React, { useState, useContext, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { login as loginService } from "../services/authService";
import {
  TextField,
  Button,
  CircularProgress,
  Typography,
  FormControl,
  OutlinedInput,
  InputLabel,
  InputAdornment,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LockIcon from "@mui/icons-material/Lock";
import { Snackbar, Alert } from "@mui/material";
import "./Login.css";

const Login = () => {
  const isMobile = useMediaQuery("(max-width:768px)");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setUser } = useContext(AuthContext);
  const [credential, setCredential] = useState({
    username: "",
    password: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "error",
  });
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      // Clear timeout when component unmounts
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const navigate = useNavigate();

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredential((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await loginService(credential.username, credential.password);
      if (data) {
        localStorage.setItem("user", JSON.stringify(data));
        setUser(data);
        navigate("/");
      }
    } catch (error) {
      // Clear any existing timeout
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        setSnackbar((prev) => ({ ...prev, open: false }));
      }, 5000);

      let errorMessage = "Login failed. Please try again.";

      if (error.response) {
        switch (error.response.status) {
          case 401:
            errorMessage = "Invalid username or password";
            break;
          case 403:
            errorMessage = "Account locked. Contact support";
            break;
          case 500:
            errorMessage = "Server error. Please try again later";
            break;
        }
      } else if (error.message.includes("Network Error")) {
        errorMessage = "Network error. Check your connection";
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
        {/* <img
          src="login-illustration.svg"
          alt="Secure login"
          className="login-illustration"
        /> */}
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
                borderRadius: "12px",
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
                    onMouseDown={handleMouseDownPassword}
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
                borderRadius: "12px",
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
            sx={{
              py: 1.5,
              borderRadius: "12px",
              fontSize: "1rem",
              fontWeight: 600,
              textTransform: "none",
              bgcolor: "#1976d2",
              boxShadow: "0 4px 6px rgba(50, 50, 93, 0.11)",
              transition: "all 0.3s ease",
              "&:hover": {
                bgcolor: "#1565c0",
                transform: "translateY(-2px)",
                boxShadow: "0 7px 14px rgba(50, 50, 93, 0.2)",
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
