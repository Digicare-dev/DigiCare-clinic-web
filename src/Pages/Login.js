import React, { useState, useContext, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { login as loginService } from "../services/authService";
import { TextField } from "@mui/material";
import "./Login.css";
import EastIcon from "@mui/icons-material/East";
import CircleIcon from "@mui/icons-material/Circle";

const Login = () => {
  const [credential, setCredential] = useState({
    username: "",
    password: "",
  });
  const { login } = useContext(AuthContext);
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

  const handleLogin = async () => {
    try {
      const data = await loginService(credential.username, credential.password);
      login(data.access, data.refresh);
      navigate("/");
    } catch (error) {
      console.log(error);
      alert("Invalid credentials");
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
      <div className="login-page-info">
        <h1
          style={{
            fontSize: "80px",
            opacity: "0.8",
          }}
        >
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
      <div className="login-container">
        <TextField
          name="username"
          label="Username"
          value={credential.username}
          onChange={handleChange}
          fullWidth
          required
          sx={{ marginBottom: "40px" }}
        />
        <TextField
          name="password"
          label="Password"
          value={credential.password}
          onChange={handleChange}
          fullWidth
          required
          sx={{ marginBottom: "40px" }}
        />

        <button className="custom-button" type="submit" onClick={handleLogin}>
          Submit
        </button>
      </div>
    </div>
  );
};

export default Login;
