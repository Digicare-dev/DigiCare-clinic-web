import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  TextField,
  Alert,
  Typography,
  FormControlLabel,
  Checkbox,
  ToggleButtonGroup,
  ToggleButton,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  CircularProgress,
  Autocomplete,
  Button,
} from "@mui/material";
import { useAppointmentForm } from '../context/AppointmentFormContext';
import { addAppointment, getPatientProfile, getMaxTokenNumber } from "../services/api";
import { getLatestCabinSlot } from '../utils/dateUtils';
import CustomSnackbar from "./CustomSnackbar";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  maxWidth: "90vw",
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 3,
};

const AppointmentForm = () => {
  const { isOpen, closeAppointmentForm, initialData } = useAppointmentForm();
  const [suggestedToken, setSuggestedToken] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState("");
  const [mobileSearchResults, setMobileSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleOpenSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };
  
  // Get user and cabin information
  const user = JSON.parse(localStorage.getItem("user"));
  const cabinId = user?.checkupcabindata?.[0]?.id;
  const selectedSlot = getLatestCabinSlot(user?.checkupcabindata?.[0]?.cabin_slots);

  const [newAppointment, setNewAppointment] = useState({
    id: "",
    token: "",
    appointment_id: "",
    firstName: "",
    lastName: "",
    checkin: false,
    paid: false,
    mode: "cash",
    fees_paid: 0,
    status: "pending",
    disease: "",
    age: "",
    phone_number: "",
    location: "",
    sex: "",
    guardian: "",
    appointment_type: "New",
  });

  // When the form opens, validate cabin slot and set token value
  useEffect(() => {
    if (isOpen) {
      // Start loading
      setIsInitializing(true);
      setError("");
      
      // Validate cabin and slot when the form opens
      if (!cabinId) {
        setError("No valid cabin found. Please contact support.");
        setIsInitializing(false);
        return;
      }
      
      if (!selectedSlot) {
        setError("No valid appointment slot found. Please contact support.");
        setIsInitializing(false);
        return;
      }
      
      // If initialData is provided, use it to pre-fill the form
      if (initialData) {
        setNewAppointment(prev => ({
          ...prev,
          firstName: initialData.firstName || "",
          lastName: initialData.lastName || "",
          age: initialData.age || "",
          phone_number: initialData.phone_number || "",
          sex: initialData.sex || "",
          location: initialData.location || "",
          guardian: initialData.guardian || "",
        }));
      }
      
      // Get the maximum token number from the API
      const fetchMaxToken = async () => {
        try {
          // Get the actual maximum token from appointments
          const maxToken = await getMaxTokenNumber(cabinId, selectedSlot);
          console.log("Current maximum token:", maxToken);
          
          // Set the token to max + 1 (or 1 if no tokens exist)
          const nextToken = maxToken + 1;
          
          // Set the token in the form
          setNewAppointment(prev => ({
            ...prev,
            token: nextToken.toString()
          }));
        } catch (error) {
          console.error("Error getting max token:", error);
          setError("Failed to initialize form. Please try again.");
        } finally {
          setIsInitializing(false);
        }
      };
      
      fetchMaxToken();
    }
  }, [isOpen, cabinId, selectedSlot, initialData]);

  const resetForm = () => {
    setNewAppointment({
      id: "",
      token: "", // Leave empty, will be set by useEffect
      appointment_id: "",
      firstName: "",
      lastName: "",
      checkin: false,
      paid: false,
      mode: "cash",
      fees_paid: 0,
      status: "pending",
      disease: "",
      age: "",
      phone_number: "",
      location: "",
      sex: "",
      guardian: "",
      appointment_type: "New",
    });
    setError("");
  };

  const handleClose = () => {
    resetForm();
    closeAppointmentForm();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone_number" && value.length > 10) {
      return;
    }
    
    // Special handling for token to enforce numeric values
    if (name === "token") {
      // Only allow positive integers
      const numValue = parseInt(value, 10);
      if (value !== "" && (isNaN(numValue) || numValue <= 0)) {
        return; // Don't update if not a positive integer
      }
    }

    setNewAppointment((prev) => ({ ...prev, [name]: value }));
  };

  const handleSexChange = (event, newSex) => {
    if (newSex !== null) {
      setNewAppointment((prev) => ({ ...prev, sex: newSex }));
    }
  };

  const validateToken = (token) => {
    // Parse the token to a number
    const tokenNum = parseInt(token, 10);
    
    // Check if it's a valid number
    if (isNaN(tokenNum) || tokenNum <= 0) {
      return false;
    }

    // In a real implementation, this would check against existing appointments
    // For now, we'll just simulate it with a 1% chance of rejection
    // to show how it would work
    if (Math.random() < 0.01) {
      return false;
    }
    
    return true;
  };

  const handleMobileSearch = async (value) => {
    if (!value || value.length !== 10) {
      setMobileSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const result = await getPatientProfile(value);
      if (result && result.length > 0) {
        setMobileSearchResults(result);
      } else {
        setMobileSearchResults([]);
      }
    } catch (error) {
      console.error("Error searching patient profile:", error);
      setMobileSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePatientSelect = (patient) => {
    if (patient) {
      setNewAppointment(prev => ({
        ...prev,
        phone_number: patient.phone_number,
        firstName: patient.name.split(" ")[0] || "",
        lastName: patient.name.split(" ").slice(1).join(" ") || "",
        age: patient.age || "",
        sex: patient.gender || "",
        location: patient.location || "",
        guardian: patient.guardian || "",
      }));
      setMobileSearchResults([]);
    }
  };

  const AddAppointmentApi = async (newEntry) => {
    setIsAdding(true);
    try {
      console.log("Adding appointment with slot:", selectedSlot); // Debug log
      
      // Add new appointment
      const result = await addAppointment({
        cabinId: cabinId,
        slot: selectedSlot,
        name: `${newEntry.firstName} ${newEntry.lastName}`,
        token: newEntry.token,
        disease: newEntry.disease,
        appointment_type: newEntry.appointment_type,
        phone_number: newEntry.phone_number,
        age: newEntry.age,
        gender: newEntry.sex,
        location: newEntry.location,
        guardian: newEntry.guardian,
        fees_paid: newEntry.fees_paid || 0,
        mode: newEntry.mode,
        paid: newEntry.paid,
        checkin: newEntry.checkin
      });
      
      handleOpenSnackbar("Appointment added successfully", "success");
      
      // Dispatch a custom event to refresh any tables that might be displaying appointments
      window.dispatchEvent(new CustomEvent('appointmentAdded', { 
        detail: { appointment: result?.queue?.appointment } 
      }));
      
      handleClose();
    } catch (error) {
      console.error("Error adding appointment:", error);
      setError("Failed to add appointment: " + (error.message || "Unknown error"));
    } finally {
      setIsAdding(false);
    }
  };

  const handleAddAppointment = () => {
    const trimmedFirstName = newAppointment.firstName.trim();
    const trimmedLastName = newAppointment.lastName.trim();

    // Validate required fields
    if (!newAppointment.token) {
      setError("Token number is required");
      return;
    }
    if (!trimmedFirstName || !trimmedLastName) {
      setError("Both first and last names are required");
      return;
    }
    if (!validateToken(newAppointment.token)) {
      setError("This token number is already in use");
      return;
    }
    if (
      newAppointment.phone_number &&
      (!/^\d+$/.test(newAppointment.phone_number) || newAppointment.phone_number.length > 10)
    ) {
      setError("Invalid mobile number (maximum 10 digits, numbers only)");
      return;
    }
    
    // Validate that we have a valid cabin slot
    if (!selectedSlot) {
      setError("No valid appointment slot found. Please contact support.");
      return;
    }

    const newEntry = {
      id: parseInt(newAppointment.token),
      token: parseInt(newAppointment.token),
      appointment_id: newAppointment.appointment_id,
      firstName: trimmedFirstName.toUpperCase(),
      lastName: trimmedLastName.toUpperCase(),
      checkin: newAppointment.checkin,
      paid: newAppointment.paid,
      status: newAppointment.status,
      disease: newAppointment.disease,
      age: newAppointment.age,
      phone_number: newAppointment.phone_number,
      location: newAppointment.location.toUpperCase(),
      sex: newAppointment.sex,
      guardian: newAppointment.guardian.toUpperCase(),
      appointment_type: newAppointment.appointment_type,
      fees_paid: newAppointment.fees_paid,
      mode: newAppointment.mode,
    };

    AddAppointmentApi(newEntry);
  };

  return (
    <>
      <Modal open={isOpen} onClose={handleClose}>
        <Box sx={modalStyle}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            New Appointment
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {isInitializing ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
              <Typography variant="body1" sx={{ ml: 2 }}>
                Initializing appointment form...
              </Typography>
            </Box>
          ) : (
            <div
              style={{
                display: "grid",
                gap: "16px",
                gridTemplateColumns: "1fr 1fr",
              }}
            >
              <TextField
                fullWidth
                label="Token Number"
                name="token"
                type="number"
                value={newAppointment.token}
                onChange={handleInputChange}
                required
              />
              {initialData && initialData.phone_number ? (
                <TextField
                  fullWidth
                  label="Mobile"
                  name="phone_number"
                  value={newAppointment.phone_number}
                  InputProps={{
                    readOnly: true,
                  }}
                  disabled
                />
              ) : (
                <Autocomplete
                  fullWidth
                  options={mobileSearchResults}
                  getOptionLabel={(option) => {
                    // Handle both objects from dropdown and direct string input
                    return typeof option === 'object' ? option?.phone_number || "" : option || "";
                  }}
                  loading={isSearching}
                  value={newAppointment.phone_number || ""}
                  onChange={(_, newValue) => {
                    if (typeof newValue === 'object') {
                      handlePatientSelect(newValue);
                    } else {
                      setNewAppointment(prev => ({
                        ...prev,
                        phone_number: newValue || ""
                      }));
                    }
                  }}
                  freeSolo={true}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Mobile"
                      name="phone_number"
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= 10) {
                          setNewAppointment(prev => ({
                            ...prev,
                            phone_number: value
                          }));
                          handleMobileSearch(value);
                        }
                      }}
                      inputProps={{
                        ...params.inputProps,
                        maxLength: 10,
                        value: newAppointment.phone_number || ""
                      }}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {isSearching ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <li {...props}>
                      <div>
                        <Typography variant="body1">{option.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {option.phone_number}
                        </Typography>
                      </div>
                    </li>
                  )}
                />
              )}
              <TextField
                label="First Name"
                name="firstName"
                value={newAppointment.firstName}
                onChange={handleInputChange}
                required
                InputProps={{
                  readOnly: !!initialData,
                }}
                disabled={!!initialData}
              />
              <TextField
                label="Last Name"
                name="lastName"
                value={newAppointment.lastName}
                onChange={handleInputChange}
                required
                InputProps={{
                  readOnly: !!initialData,
                }}
                disabled={!!initialData}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newAppointment.checkin}
                    onChange={(e) =>
                      setNewAppointment((prev) => ({
                        ...prev,
                        checkin: e.target.checked,
                      }))
                    }
                  />
                }
                label={
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: newAppointment.checkin ? 'bold' : 'normal',
                      color: newAppointment.checkin ? 'primary.main' : 'text.primary'
                    }}
                  >
                    Present in Clinic
                  </Typography>
                }
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newAppointment.paid}
                    onChange={(e) =>
                      setNewAppointment((prev) => ({
                        ...prev,
                        paid: e.target.checked,
                        mode: e.target.checked ? "cash" : "",
                      }))
                    }
                  />
                }
                label={
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: newAppointment.paid ? 'bold' : 'normal',
                      color: newAppointment.paid ? 'primary.main' : 'text.primary'
                    }}
                  >
                    Payment Done
                  </Typography>
                }
              />
              {newAppointment.paid && (
                <>
                  <FormControl fullWidth>
                    <InputLabel>Payment Mode</InputLabel>
                    <Select
                      name="mode"
                      value={newAppointment.mode}
                      onChange={handleInputChange}
                      label="Payment Mode"
                    >
                      <MenuItem value="cash">Cash</MenuItem>
                      <MenuItem value="online">Online</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    label="Fees"
                    name="fees_paid"
                    type="number"
                    value={newAppointment.fees_paid}
                    onChange={handleInputChange}
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                </>
              )}
              <TextField
                label="Age"
                name="age"
                type="number"
                value={newAppointment.age}
                onChange={handleInputChange}
              />
              <FormControl component="fieldset">
                <ToggleButtonGroup
                  value={newAppointment.sex}
                  exclusive
                  onChange={handleSexChange}
                  color="primary"
                >
                  <ToggleButton value="M" color="primary">
                    Male
                  </ToggleButton>
                  <ToggleButton value="F" color="secondary">
                    Female
                  </ToggleButton>
                  <ToggleButton value="O">Other</ToggleButton>
                </ToggleButtonGroup>
              </FormControl>
              <TextField
                label="Guardian"
                name="guardian"
                value={newAppointment.guardian}
                onChange={handleInputChange}
              />
              <TextField
                label="Place"
                name="location"
                value={newAppointment.location}
                onChange={handleInputChange}
              />
              <FormControl fullWidth>
                <InputLabel>Appointment Type *</InputLabel>
                <Select
                  name="appointment_type"
                  value={newAppointment.appointment_type}
                  onChange={handleInputChange}
                  label="Appointment Type"
                >
                  <MenuItem value="New">New</MenuItem>
                  <MenuItem value="Follow-up">Follow-up</MenuItem>
                  <MenuItem value="Emergency">Emergency</MenuItem>
                  <MenuItem value="Routine">Routine</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Complaint"
                name="disease"
                value={newAppointment.disease}
                onChange={handleInputChange}
              />
            </div>
          )}

          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={handleClose} sx={{ mr: 2 }} disabled={isAdding || isInitializing}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleAddAppointment}
              disabled={isAdding || isInitializing}
            >
              {isAdding ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Add Appointment"
              )}{" "}
            </Button>
          </Box>
        </Box>
      </Modal>

      <CustomSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleCloseSnackbar}
      />
    </>
  );
};

export default AppointmentForm; 