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
} from "@mui/material";
import logo from "../assets/DigiCare__logo.png";
import LogoutIcon from "@mui/icons-material/Logout";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import "./Header.module.css";

function Header({ closeEventSource, patients = [] }) {
  const isMobile = window.innerWidth <= 768;
  const [open, setOpen] = useState(false);
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Log patients when they change
  useEffect(() => {
    console.log('Header received patients:', patients);
  }, [patients]);
  
  // Format patients data for search
  const formattedPatients = useMemo(() => {
    console.log('Formatting patients for search:', patients);
    
    if (!Array.isArray(patients)) {
      console.error('Patients is not an array:', patients);
      return [];
    }
    
    return patients.filter(item => {
      // Check if item has appointment with name
      return item && (
        (item.name) || 
        (item.appointment && item.appointment.name)
      );
    }).map((item) => {
      // Get the name from either the item directly or from the appointment property
      const name = item.name || (item.appointment && item.appointment.name) || '';
      const [firstName, ...lastNameParts] = name.split(" ");
      
      // Get appointment data from either the item directly or from the appointment property
      const appointmentData = item.appointment || item;
      
      return {
        id: item.token || appointmentData.token,
        token: item.token || appointmentData.token,
        appointment_id: appointmentData.appointment_id,
        firstName: firstName || "",
        lastName: lastNameParts.join(" ") || "",
        fullName: name,
        checkin: item.checkin || false,
        paid: item.paid || false,
        status: item.status || '',
        disease: appointmentData.disease !== null ? appointmentData.disease : "",
        age: item.patient ? item.patient.age : "",
        phone_number: item.patient ? item.patient.phone_number : "",
        location: item.patient ? item.patient.location : "",
        sex: item.patient?.gender || "",
        guardian: item.patient ? item.patient.guardian : "",
        appointment_type: appointmentData.appointment_type?.charAt(0).toUpperCase() +
          appointmentData.appointment_type?.slice(1).toLowerCase() || '',
        mode: appointmentData.mode || "",
        fees_paid: appointmentData.fees_paid || 0,
        position: item.position || 0,
        patient: item.patient || null,
      };
    });
  }, [patients]);

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

  // Handle patient selection
  const handlePatientSelect = (event, patient) => {
    if (!patient) {
      console.error('Invalid patient data:', patient);
      return;
    }
    
    try {
      // Format patient information for PatientInfoPage
      const patientInfo = {
        name: `${patient.firstName} ${patient.lastName}`.trim(),
        age: patient.age || '',
        gender: patient.sex === 'M' ? 'Male' : 
                patient.sex === 'F' ? 'Female' : 'Other',
        phone: patient.phone_number || '',
        email: '',
        location: patient.location || 'Not specified',
        guardianName: patient.guardian !== 'NULL' ? patient.guardian : '',
        id: patient.id || patient.token,
        bloodGroup: '',
        allergies: [],
        chronicConditions: [],
      };
      
      // Extract date and time from appointment_id
      const appointmentId = patient.appointment_id;
      console.log('Processing appointment ID:', appointmentId);
      
      // Handle different appointment_id formats
      let date = '';
      let time = '';
      
      if (appointmentId && appointmentId.includes(' ')) {
        // Format: "8059842025-03-08 14:20:18.281977"
        const [datePart, timePart] = appointmentId.split(' ');
        
        if (datePart && datePart.includes('-')) {
          const dateComponents = datePart.split('-');
          if (dateComponents.length >= 3) {
            // Format: YYYY-MM-DD
            date = `${dateComponents[0]}-${dateComponents[1]}-${dateComponents[2]}`;
          }
        }
        
        if (timePart) {
          const timeComponents = timePart.split(':');
          if (timeComponents.length >= 2) {
            // Format: HH:MM
            time = `${timeComponents[0]}:${timeComponents[1]}`;
          }
        }
      } else if (appointmentId && appointmentId.includes('_')) {
        // Format: "YYYYMMDD_HHMM"
        const datePart = appointmentId.split('_')[0] || '';
        const timePart = appointmentId.split('_')[1] || '';
        
        if (datePart && datePart.length >= 8) {
          date = `${datePart.substring(0, 4)}-${datePart.substring(4, 6)}-${datePart.substring(6, 8)}`;
        }
        
        if (timePart && timePart.length >= 4) {
          time = `${timePart.substring(0, 2)}:${timePart.substring(2, 4)}`;
        }
      }
      
      console.log('Extracted date and time:', { date, time });
      
      const appointmentInfo = {
        id: patient.appointment_id,
        date: date,
        time: time,
        doctor: 'Current Doctor',
        status: patient.status === 'pending' ? 'Pending' : 
                patient.status === 'done_checkup' ? 'Completed' : 
                patient.status === 'cancelled' ? 'Cancelled' : 
                patient.status === 'late' ? 'Late' : patient.status,
        type: patient.appointment_type || 'Consultation',
        reason: patient.disease || 'Not specified',
        department: 'General',
        token: patient.token,
        disease: patient.disease || '',
        fees: patient.fees_paid || 0,
        paymentMode: patient.mode || 'cash',
        paid: patient.paid === true,
        checkin: patient.checkin === true,
        position: patient.position || 0,
      };
      
      console.log('Navigating to patient info page with:', { patientInfo, appointmentInfo });
      
      // Navigate to patient info page
      navigate('/patient-info', {
        state: {
          patientInfo,
          appointmentInfo,
          fromSearch: true,
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
      
      // Search by token
      const tokenMatch = option.token && 
                         option.token.toString() === searchTerm;
      
      return nameMatch || phoneMatch || tokenMatch;
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
          options={formattedPatients}
          getOptionLabel={(option) => option.fullName || ''}
          filterOptions={filterOptions}
          onChange={handlePatientSelect}
          loading={loading}
          noOptionsText="No patients found"
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Search patients by name or phone..."
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
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        ml: 'auto', 
                        bgcolor: option.status === 'pending' ? 'warning.light' : 
                                 option.status === 'done_checkup' ? 'success.light' : 
                                 option.status === 'cancelled' ? 'error.light' : 'info.light',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1
                      }}
                    >
                      Token #{option.token}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <PhoneIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      {option.phone_number || 'No phone'}
                    </Typography>
                    <PersonIcon fontSize="small" sx={{ ml: 2, mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      {option.age ? `${option.age} yrs` : ''} {option.sex || ''}
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
