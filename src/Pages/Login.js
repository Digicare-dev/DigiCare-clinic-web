import React, { useState, useContext, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { login as loginService } from "../services/authService";
import { TextField, Button, CircularProgress } from "@mui/material";
import "./Login.css";
import EastIcon from "@mui/icons-material/East";
import CircleIcon from "@mui/icons-material/Circle";

import IconButton from "@mui/material/IconButton";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const Login = () => {
  const isMobile = window.innerWidth <= 768;
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { setUser } = useContext(AuthContext);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleMouseUpPassword = (event) => {
    event.preventDefault();
  };

  const [credential, setCredential] = useState({
    username: "",
    password: "",
  });
  const navigate = useNavigate();
  const dotsContainerRef = useRef(null);
  const [numberOfDots, setNumberOfDots] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredential((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await loginService(credential.username, credential.password);
      if (data) {
        localStorage.setItem("user", JSON.stringify(data));
        setUser(data);
        setLoading(false);
        navigate("/");
      }
    } catch (error) {
      setLoading(false);
    }
  };

  // Calculate the number of dots that fit in the container
  useEffect(() => {
    const calculateDots = () => {
      if (dotsContainerRef.current) {
        const containerWidth = dotsContainerRef.current.offsetWidth;
        const dotWidth = 40;
        const dots = Math.floor(containerWidth / dotWidth);
        setNumberOfDots(dots);
      }
    };

    calculateDots();
    window.addEventListener("resize", calculateDots);
    return () => window.removeEventListener("resize", calculateDots);
  }, []);

  // Generate dots dynamically
  const dots = Array.from({ length: numberOfDots }, (_, index) => (
    <CircleIcon
      key={index}
      sx={{ fontSize: "20px", color: "#007bff", marginRight: "12px" }}
    />
  ));

  return (
    <div className="login-page-background">
      {!isMobile && (
        <div className="login-page-info">
          <h1>
            Portal to simplify managing the clinic is on the way{" "}
            <div
              ref={dotsContainerRef}
              style={{
                display: "flex",
                alignItems: "center",
                overflow: "hidden",
              }}
            >
              {dots}
              <EastIcon sx={{ fontSize: "100px", color: "#007bff" }} />
            </div>
          </h1>
        </div>
      )}
      <div className="login-container">
        <form onSubmit={handleLogin}>
          <TextField
            name="username"
            label="Username"
            value={credential.username}
            onChange={handleChange}
            fullWidth
            required
            sx={{ marginBottom: "30px" }}
            InputLabelProps={{ required: false }}
          />
          <FormControl
            sx={{ width: "100%", marginBottom: "50px" }}
            variant="outlined"
          >
            <InputLabel htmlFor="outlined-adornment-password">
              Password
            </InputLabel>
            <OutlinedInput
              required
              name="password"
              onChange={handleChange}
              value={credential.password}
              id="outlined-adornment-password"
              type={showPassword ? "text" : "password"}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label={
                      showPassword
                        ? "hide the password"
                        : "display the password"
                    }
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    onMouseUp={handleMouseUpPassword}
                    edge="end"
                  >
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              }
              label="Password"
            />
          </FormControl>

          <Button
            type="submit"
            variant="outlined"
            sx={{
              backgroundColor: "#007bff",
              color: "white",
              height: "40px",
              width: "100px",
              "&:hover": {
                backgroundColor: "#0066cc",
              },
              "&.Mui-disabled": {
                backgroundColor: "#007bff",
                color: "white",
              },
            }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="white" /> : "Submit"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
