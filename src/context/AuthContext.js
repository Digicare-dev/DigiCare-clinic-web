import React, { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
      try {
        const decodedToken = jwtDecode(accessToken);
        setUser({ accessToken, ...decodedToken });
      } catch (error) {
        console.error("Failed to decode token:", error);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }
    }
  }, []);

  const login = (accessToken, refreshToken) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    const decodedToken = jwtDecode(accessToken);
    setUser({ accessToken, ...decodedToken });
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
