import React, { useContext, useState, useEffect, useMemo } from "react";
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
  Autocomplete,
  TextField,
  Box,
  Typography,
  Avatar,
  Chip,
} from "@mui/material";
import logo from "../assets/DigiCare__logo.png";
import LogoutIcon from "@mui/icons-material/Logout";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import EventIcon from "@mui/icons-material/Event";
import "./Header.module.css";
import { patientProfiles } from "../services/dummyDataService";

function Header({ closeEventSource, patients = [] }) {
  const isMobile = window.innerWidth <= 768;
  const [open, setOpen] = useState(false);
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Use the patientProfiles database instead of the current patients
  const patientDatabase = useMemo(() => {
    console.log('Using patient profiles database for search');
    return patientProfiles;
  }, []);

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

  const handlePatientSelect = (event, patient) => {
    if (!patient) return;
    
    try {
      console.log('Selected patient:', patient);
      
      // Navigate to patient info page with the selected patient data
      navigate('/patient-info', { 
        state: { 
          patientInfo: {
            id: patient.id,
            name: patient.fullName,
            age: patient.age,
            gender: patient.gender,
            phone: patient.phone_number,
            email: patient.email,
            address: patient.address,
            bloodGroup: patient.bloodGroup
          },
          appointmentInfo: undefined // Explicitly set to undefined to indicate no current appointment
        } 
      });
    } catch (error) {
      console.error('Error processing patient selection:', error);
    }
  };

  // Filter function for Autocomplete
  const filterOptions = (options, { inputValue }) => {
    if (!inputValue) return options;
    
    const searchTerm = inputValue.toLowerCase().trim();
    console.log('Filtering with search term:', searchTerm);
    
    return options.filter(option => {
      // Check if the option has the required properties
      if (!option || !option.fullName) return false;
      
      // Search by name
      const nameMatch = option.fullName.toLowerCase().includes(searchTerm);
      
      // Search by phone number
      const phoneMatch = option.phone_number && 
                         option.phone_number.toString().includes(searchTerm);
      
      // Search by ID
      const idMatch = option.id && 
                      option.id.toString().toLowerCase().includes(searchTerm);
      
      // Search by email
      const emailMatch = option.email && 
                         option.email.toLowerCase().includes(searchTerm);
      
      return nameMatch || phoneMatch || idMatch || emailMatch;
    });
  };

  return (
    <header>
      <img
        src={logo}
        alt="DigiCare"
        style={{ width: "150px", height: "40px" }}
      />

      {/* Patient Search Bar - Center */}
      <Box 
        sx={{ 
          flex: 1, 
          maxWidth: '500px', 
          mx: 'auto',
        }}
      >
        <Autocomplete
          id="patient-search"
          options={patientDatabase}
          getOptionLabel={(option) => option.fullName || ''}
          filterOptions={filterOptions}
          onChange={handlePatientSelect}
          loading={loading}
          noOptionsText="No patients found"
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Search patients by name, ID, phone or email..."
              variant="outlined"
              size="small"
              fullWidth
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <SearchIcon color="action" sx={{ mr: 1 }} />
                ),
              }}
            />
          )}
          renderOption={(props, option) => {
            if (!option || !option.firstName) {
              return null;
            }
            return (
              <li {...props}>
                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: 'primary.main' }}>
                      {option.firstName.charAt(0)}
                    </Avatar>
                    <Typography variant="body1">{option.fullName}</Typography>
                    <Chip 
                      label={option.id}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ ml: 'auto' }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <PhoneIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>
                      {option.phone_number || 'No phone'}
                    </Typography>
                    <EmailIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      {option.email || 'No email'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <PersonIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>
                      {option.age} yrs, {option.gender}
                    </Typography>
                    <LocalHospitalIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>
                      {option.bloodGroup}
                    </Typography>
                    <EventIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      Last visit: {option.lastVisit}
                    </Typography>
                  </Box>
                </Box>
              </li>
            );
          }}
        />
      </Box>

      {/* Mobile Logout Button */}
      {isMobile && (
        <IconButton
          color="primary"
          onClick={handleClickOpen}
          sx={{ marginLeft: "auto" }}
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
