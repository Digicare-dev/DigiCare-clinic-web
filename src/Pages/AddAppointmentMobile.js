import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  ToggleButtonGroup,
  ToggleButton,
  Box,
  Snackbar,
} from "@mui/material";
import { addAppointment, fetchAppointments } from "../services/api";

export default function AddAppointmentMobile({ patients }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestedToken, setSuggestedToken] = useState(1);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const [formData, setFormData] = useState({
    token: "",
    firstName: "",
    lastName: "",
    age: "",
    phone_number: "",
    location: "",
    sex: "",
    disease: "",
    guardian: "",
    appointment_type: "New",
    checkin: false,
    paid: false,
    status: "pending",
    mode: "",
    fees_paid: 0,
  });

  const fetchSuggestedToken = () => {
    if (patients.length > 0) {
      try {
        let maxToken = 0;
        maxToken =
          patients.length > 0
            ? Math.max(...patients.map((p) => p.appointment.token))
            : 0;
        setSuggestedToken(maxToken + 1);
        setFormData((prev) => ({ ...prev, token: maxToken + 1 }));
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    }
  };

  useEffect(() => {
    fetchSuggestedToken();
  }, [patients]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSexChange = (event, newSex) => {
    if (newSex !== null) {
      setFormData((prev) => ({ ...prev, sex: newSex }));
    }
  };

  const handlePaidCheckboxChange = (e) => {
    const paid = e.target.checked;
    setFormData((prev) => ({
      ...prev,
      paid,
      mode: paid ? "cash" : "",
      fees_paid: paid ? 250 : 0,
    }));
  };

  const validateToken = (token) => {
    return !isNaN(token) && token > 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!validateToken(formData.token)) {
      setError("Please enter a valid token number");
      setLoading(false);
      return;
    }

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError("First name and last name are required");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        cabinId: user.checkupcabindata[0].id,
        slot: user.checkupcabindata[0].cabin_slots[0],
        name: `${formData.firstName} ${formData.lastName}`.trim().toUpperCase(),
        token: formData.token,
        paid: formData.paid,
        checkin: formData.checkin,
        age: formData.age,
        phone_number: formData.phone_number,
        location: `${formData.location}`.toUpperCase(),
        gender: formData.sex,
        guardian: `${formData.guardian}`.toUpperCase(),
        disease: formData.disease,
        appointment_type: formData.appointment_type,
        mode: formData.mode || "",
        fees_paid: formData.fees_paid || 0,
      };

      await addAppointment(payload);

      // Reset form fields
      setFormData({
        ...formData,
        firstName: "",
        lastName: "",
        age: "",
        phone_number: "",
        location: "",
        sex: "",
        disease: "",
        guardian: "",
        checkin: false,
        paid: false,
        mode: "",
        fees_paid: 0,
      });

      // Refresh token suggestion
      fetchSuggestedToken();
      setError("");
      setOpenSnackbar(true);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to add appointment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "16px",
        height: "100vh",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        New Appointment
      </Typography>

      <form
        onSubmit={handleSubmit}
        style={{
          flex: 1,
          paddingBottom: "350px", // Space for fixed button
        }}
      >
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        {/* Token Input */}
        <TextField
          fullWidth
          label="Token Number"
          name="token"
          type="number"
          value={formData.token}
          onChange={handleInputChange}
          required
          sx={{ mb: 2 }}
          helperText={`Suggested token: ${suggestedToken}`}
          InputProps={{ inputProps: { min: 1 } }}
        />

        {/* Name Row */}
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            label="First Name"
            name="firstName"
            value={formData.firstName.toUpperCase()}
            onChange={handleInputChange}
            required
          />
          <TextField
            fullWidth
            label="Last Name"
            name="lastName"
            value={formData.lastName.toUpperCase()}
            onChange={handleInputChange}
            required
          />
        </Box>

        {/* Check-in/Payment Row */}
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.checkin}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    checkin: e.target.checked,
                  }))
                }
              />
            }
            label="Check-in"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.paid}
                onChange={handlePaidCheckboxChange}
              />
            }
            label="Payment"
          />
        </Box>

        {formData.paid && (
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Payment Mode</InputLabel>
              <Select
                name="mode"
                value={formData.mode}
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
              value={formData.fees_paid}
              onChange={handleInputChange}
              InputProps={{ inputProps: { min: 0 } }}
              placeholder="250"
            />
          </Box>
        )}

        {/* Age & Mobile Row */}
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            label="Mobile"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleInputChange}
            inputProps={{ maxLength: 10 }}
            helperText="Will enable fields"
          />
          <TextField
            fullWidth
            label="Age"
            name="age"
            type="number"
            value={formData.age}
            onChange={handleInputChange}
            InputProps={{ inputProps: { min: 0, max: 120 } }}
            disabled={!formData.phone_number}
          />
        </Box>

        {/* Gender Toggle Group */}
        <ToggleButtonGroup
          value={formData.sex}
          exclusive
          onChange={handleSexChange}
          color="primary"
          fullWidth
          sx={{ mb: 2 }}
          disabled={!formData.phone_number}
        >
          <ToggleButton value="M">Male</ToggleButton>
          <ToggleButton value="F">Female</ToggleButton>
          <ToggleButton value="O">Other</ToggleButton>
        </ToggleButtonGroup>

        {/* Guardian & Location Row */}
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            label="Guardian"
            name="guardian"
            value={formData.guardian.toUpperCase()}
            onChange={handleInputChange}
            disabled={!formData.phone_number}
          />
          <TextField
            fullWidth
            label="Location"
            name="location"
            value={formData.location.toUpperCase()}
            onChange={handleInputChange}
            disabled={!formData.phone_number}
          />
        </Box>

        {/* Disease and Appointment Type */}
        <TextField
          fullWidth
          label="Disease"
          name="disease"
          value={formData.disease}
          onChange={handleInputChange}
          sx={{ mb: 2 }}
        />

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Appointment Type</InputLabel>
          <Select
            name="appointment_type"
            value={formData.appointment_type}
            onChange={handleInputChange}
            label="Appointment Type"
          >
            <MenuItem value="New">New</MenuItem>
            <MenuItem value="Follow-up">Follow-up</MenuItem>
            <MenuItem value="Emergency">Emergency</MenuItem>
            <MenuItem value="Routine">Routine</MenuItem>
          </Select>
        </FormControl>
      </form>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        message="Appointment added successfully!"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />

      {/* Fixed Submit Button */}
      <Box
        sx={{
          position: "fixed",
          bottom: "56px", // Adjust based on your BottomNavigator height
          left: 0,
          right: 0,
          backgroundColor: "white",
          padding: "16px",
          borderTop: "1px solid #eee",
          zIndex: 2,
        }}
      >
        <Button
          // type="submit"
          onClick={handleSubmit}
          fullWidth
          variant="contained"
          disabled={loading}
          sx={{
            py: 1.5,
            borderRadius: "12px",
            fontSize: "1rem",
            backgroundColor: "#1976d2",
            "&:hover": {
              backgroundColor: "#1565c0",
            },
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Add Appointment"
          )}
        </Button>
      </Box>
    </div>
  );
}
