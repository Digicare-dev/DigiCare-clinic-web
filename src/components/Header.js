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
  TextField,
  Box,
  CircularProgress,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import logo from "../assets/DigiCare__logo.png";
import LogoutIcon from "@mui/icons-material/Logout";
import SearchIcon from "@mui/icons-material/Search";
import "./Header.module.css";
import { getPatientProfile, getPatientDetails } from "../services/api";

function Header({ closeEventSource }) {
  const isMobile = window.innerWidth <= 768;
  const [open, setOpen] = useState(false);
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [patients, setPatients] = useState([]);
  const [showPatientList, setShowPatientList] = useState(false);

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

  const handlePatientSelect = async (patient) => {
    try {
      setLoading(true);
      
      // Get complete patient details using getPatientDetails API
      const detailsResponse = await getPatientDetails(patient.patient_id);
      console.log('Patient details response:', detailsResponse);
      
      if (detailsResponse && detailsResponse.patient) {
        // Prepare the current appointment data if it exists
        const currentAppointment = detailsResponse.current_appointment ? {
          id: detailsResponse.current_appointment.appointment_id,
          token: detailsResponse.current_appointment.token,
          type: detailsResponse.current_appointment.appointment_type,
          status: detailsResponse.current_appointment.status,
          disease: detailsResponse.current_appointment.disease,
          fees: detailsResponse.current_appointment.fees_paid,
          paymentMode: detailsResponse.current_appointment.mode,
          paid: detailsResponse.current_appointment.paid,
          checkin: detailsResponse.current_appointment.checkin
        } : undefined;

        // Navigate to patient info page with the complete patient data
        navigate('/patient-info', { 
          state: { 
            patientInfo: {
              id: patient.patient_id,
              name: patient.name,
              age: patient.age,
              gender: patient.gender === 'M' ? 'Male' : patient.gender === 'F' ? 'Female' : patient.gender,
              phone: patient.phone_number,
              email: detailsResponse.patient.email,
              address: patient.location,
              bloodGroup: detailsResponse.patient.blood_group,
              allergies: detailsResponse.patient.allergies,
              chronicConditions: detailsResponse.patient.chronic_conditions,
              guardian: patient.guardian
            },
            appointmentInfo: currentAppointment,
            vitalsInfo: detailsResponse.vitals || {
              bloodPressure: '',
              heartRate: '',
              temperature: '',
              respiratoryRate: '',
              spO2: '',
              height: '',
              weight: '',
            },
            otherAppointments: detailsResponse.other_appointments || [] // Include past appointments
          } 
        });
      }
    } catch (error) {
      console.error('Error fetching patient details:', error);
      setError("Failed to load complete patient details. Please try again.");
    } finally {
      setLoading(false);
      // Clear the search results
      setPatients([]);
      setShowPatientList(false);
      setSearchQuery("");
    }
  };

  const handleSearch = async (event) => {
    if (event.key === 'Enter') {
      try {
        setLoading(true);
        setError(null);
        setPatients([]);
        setShowPatientList(false);
        
        // Only search if query is a 10-digit phone number
        const isPhoneNumber = /^\d{10}$/.test(searchQuery.trim());
        
        if (!isPhoneNumber) {
          setError("Please enter a valid 10-digit phone number");
          return;
        }
        
        const response = await getPatientProfile(searchQuery.trim());
        console.log('Search response:', response);
        
        if (Array.isArray(response) && response.length > 0) {
          setPatients(response);
          setShowPatientList(true);
        } else {
          setError("No patient found with the provided phone number");
        }
      } catch (error) {
        console.error('Error searching patient:', error);
        setError("Failed to search patient. Please try again.");
      } finally {
        setLoading(false);
      }
    }
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
          position: 'relative'
        }}
      >
        <TextField
          placeholder="Enter 10-digit phone number to search patient..."
          variant="outlined"
          size="small"
          fullWidth
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setError(null);
          }}
          onKeyPress={handleSearch}
          disabled={loading}
          error={!!error}
          helperText={error}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: loading && (
              <InputAdornment position="end">
                <CircularProgress size={20} />
              </InputAdornment>
            ),
          }}
        />

        {/* Patient List Dropdown */}
        {showPatientList && patients.length > 0 && (
          <Box
            sx={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 1000,
              mt: 1,
              bgcolor: 'background.paper',
              borderRadius: 1,
              boxShadow: 3,
              maxHeight: '300px',
              overflowY: 'auto',
            }}
          >
            <List>
              {patients.map((patient, index) => (
                <ListItem
                  key={patient.patient_id}
                  button
                  onClick={() => handlePatientSelect(patient)}
                  divider={index < patients.length - 1}
                  sx={{
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" component="div">
                        {patient.name}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        {`${patient.age || 'N/A'} years • ${patient.gender || 'N/A'} • ${patient.phone_number}`}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
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
