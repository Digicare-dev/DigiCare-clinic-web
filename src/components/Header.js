import React, { useContext, useState } from "react";
import { logout } from "../services/authService";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import logo from "../assets/DigiCare__logo.png";
import "./Header.module.css";

function Header() {
  const isMobile = window.innerWidth <= 768;
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleLogout = () => {
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

      {!isMobile && (
        <div className="logout-button">
          <Button variant="contained" color="primary" onClick={handleClickOpen}>
            Logout
          </Button>
          <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              {"Confirm Logout"}
            </DialogTitle>
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
        </div>
      )}
    </header>
  );
}

export default Header;
