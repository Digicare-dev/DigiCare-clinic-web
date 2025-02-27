import React, { useContext, useState } from "react";
import { logout } from "../services/authService";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
} from "@mui/material";
import logo from "../assets/DigiCare__logo.png";
import LogoutIcon from "@mui/icons-material/Logout"; // Import logout icon
import "./Header.module.css";

function Header({ closeEventSource }) {
  const isMobile = window.innerWidth <= 768;
  const [open, setOpen] = useState(false);
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    logout();
    handleClose();
  };

  return (
    <header>
      <img
        src={logo}
        alt="DigiCare"
        style={{ width: "150px", height: "40px" }}
      />

      {/* Mobile Logout Button */}
      {isMobile && (
        <IconButton
          color="primary"
          onClick={handleClickOpen}
          sx={{ marginLeft: "auto" }} // Push to the right
        >
          <LogoutIcon />
        </IconButton>
      )}

      {/* Desktop Logout Button */}
      {!isMobile && (
        <div className="logout-button">
          <Button variant="contained" color="primary" onClick={handleClickOpen}>
            Logout
          </Button>
        </div>
      )}

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Logout"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to logout?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleLogout} color="primary" autoFocus>
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </header>
  );
}

export default Header;
