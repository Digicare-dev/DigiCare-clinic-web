import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Chip,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  Autocomplete,
  Alert,
  Skeleton,
} from "@mui/material";
import {
  fetchAppointments,
  updateAppointmentDetails,
  removeAppointment,
  getPatientProfile,
} from "../services/api";
import "./MobileAppointmentTable.css";
import SearchIcon from "@mui/icons-material/Search";
import { CheckCircle, Cancel, Edit } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import { getCabinInfo } from "../utils/dateUtils";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Function to generate display rows
const generateDisplayRows = (actualRows) => {
  if (actualRows.length === 0) return [];

  const tokens = actualRows.map((row) => row.token);
  const minToken = Math.min(...tokens);
  const maxToken = Math.max(...tokens);

  return Array.from({ length: maxToken - minToken + 1 }, (_, i) => {
    const token = minToken + i;
    const existing = actualRows.find((row) => row.token === token);
    return (
      existing || {
        id: token,
        token,
        isPlaceholder: true,
        patientName: "",
        checkin: false,
        paid: false,
        status: "empty",
        guardian: "",
        appointment_id: "",
      }
    );
  });
};

// Function to get status color
const getStatusColor = (status) => {
  switch (status) {
    case "done":
    case "done_checkup":
      return "success";
    case "cancelled":
      return "error";
    case "pending":
      return "info";
    default:
      return "default";
  }
};

const MobileAppointmentTable = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [appointments, setAppointments] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const [searchQuery, setSearchQuery] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [cancelConfirmationOpen, setCancelConfirmationOpen] = useState(false);
  const [rowToCancel, setRowToCancel] = useState(null);
  const [editMobileSearchResults, setEditMobileSearchResults] = useState([]);
  const [isEditSearching, setIsEditSearching] = useState(false);
  const [eventSource, setEventSource] = useState(null);

  // Memoize cabin info to prevent unnecessary recalculations
  const { cabinId, selectedSlot } = useMemo(() => getCabinInfo(user), [user]);

  // Use generateDisplayRows to include empty slots
  const displayRows = useMemo(() => {
    // First get the filtered appointments based on search
    let filtered = searchQuery ? 
      appointments.filter((apt) => apt.patientName.toLowerCase().includes(searchQuery.toLowerCase())) :
      appointments;
    
    // Then generate display rows to include empty slots
    return generateDisplayRows(filtered).sort((a, b) => Number(a.token) - Number(b.token));
  }, [appointments, searchQuery]);

  // Keep the original filtered appointments logic for backward compatibility
  const filteredAppointments = useMemo(() => {
    if (!searchQuery) {
      // Sort appointments by token number (converting to number for proper numeric sort)
      return [...appointments].sort((a, b) => Number(a.token) - Number(b.token));
    }
    
    const query = searchQuery.toLowerCase();
    return appointments
      .filter((apt) => apt.patientName.toLowerCase().includes(query))
      .sort((a, b) => Number(a.token) - Number(b.token)); // Sort filtered results too
  }, [appointments, searchQuery]);

  const handleEditClick = (appointment) => {
    // Format the appointment to match the expected structure in the edit form
    const formattedAppointment = {
      ...appointment,
      firstName: appointment.patientName.split(" ")[0] || "",
      lastName: appointment.patientName.split(" ").slice(1).join(" ") || "",
    };
    
    setSelectedAppointment(formattedAppointment);
    setEditModalOpen(true);
    
    // Clear any previous search results
    setEditMobileSearchResults([]);
  };

  const handleEditModalClose = () => {
    setEditModalOpen(false);
    setSelectedAppointment(null);
  };

  const handleEditMobileSearch = async (value) => {
    if (!value || value.length !== 10) {
      setEditMobileSearchResults([]);
      return;
    }

    setIsEditSearching(true);
    try {
      const result = await getPatientProfile(value);
      if (result && result.length > 0) {
        setEditMobileSearchResults(result);
      } else {
        setEditMobileSearchResults([]);
      }
    } catch (error) {
      console.error("Error searching patient profile:", error);
      setEditMobileSearchResults([]);
    } finally {
      setIsEditSearching(false);
    }
  };

  const handleEditPatientSelect = (patient) => {
    if (patient) {
      setSelectedAppointment(prev => ({
        ...prev,
        phone_number: patient.phone_number,
        firstName: patient.name.split(" ")[0] || "",
        lastName: patient.name.split(" ").slice(1).join(" ") || "",
        age: patient.age || "",
        sex: patient.gender || "",
        location: patient.location || "",
        guardian: patient.guardian || "",
      }));
      setEditMobileSearchResults([]);
    }
  };

  const handleConfirmEdit = async () => {
    if (!selectedAppointment) return;

    setIsUpdating(true);
    try {
      const fullName = `${selectedAppointment.firstName} ${selectedAppointment.lastName}`.trim();
      
      const payload = {
        token: selectedAppointment.token,
        appointment_id: selectedAppointment.appointment_id,
        name: fullName.toUpperCase(),
        guardian: `${selectedAppointment.guardian || ""}`.toUpperCase(),
        checkin: selectedAppointment.checkin,
        paid: selectedAppointment.paid,
        mode: selectedAppointment.mode || "",
        fees_paid: selectedAppointment.fees_paid || 0,
        disease: selectedAppointment.disease || null,
        appointment_type: selectedAppointment.appointment_type || "New",
        phone_number: selectedAppointment.phone_number || "",
        age: selectedAppointment.age || "",
        gender: selectedAppointment.sex || "",
        location: selectedAppointment.location || "",
      };

      const response = await updateAppointmentDetails(payload);
      console.log("Update response:", response);

      
      handleEditModalClose();
    } catch (error) {
      console.error("Failed to update appointment:", error);
      
      // Add better error handling
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Server error:", error.response.data);
        setError(`Update failed: ${error.response.data.message || 'Server error'}`);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
        setError("Update failed: No response from server");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error message:", error.message);
        setError(`Update failed: ${error.message}`);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!rowToCancel) return;
    
    setIsCanceling(true);
    try {
      await removeAppointment({
        appointment_id: rowToCancel.appointment_id,
      });

      setAppointments((prev) =>
        prev.filter((apt) => apt.token !== rowToCancel.token)
      );

      setCancelConfirmationOpen(false);
      handleEditModalClose();
      
    } catch (error) {
      console.error("Failed to cancel appointment:", error);
      
      // Enhanced error handling
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Server error:", error.response.data);
        setError(`Cancellation failed: ${error.response.data.message || 'Server error'}`);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
        setError("Cancellation failed: No response from server");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error message:", error.message);
        setError(`Cancellation failed: ${error.message}`);
      }
      
      // Keep the modal open so the user can see the error
      setCancelConfirmationOpen(false);
    } finally {
      setIsCanceling(false);
      setRowToCancel(null);
    }
  };

  const fetchAppointmentsData = async () => {
    try {
      setLoading(true);
      let data;
              // Use the real API for production mode
        data = await fetchAppointments(cabinId, selectedSlot);
      
      if (data && data.length > 0) {
        console.log("Received appointment data:", data);
        
        // Debug log for diagnosing paid status
        data.forEach(item => {
          console.log(`Appointment ${item.token} - ${item.name} - Paid: ${item.paid} - Status: ${item.status}`);
        });
        
        const formatted = data.map((item) => ({
          id: item.token,
          token: item.token,
          patientName: item.name || '',
          checkin: item.checkin,
          // Only force paid = true if status is done_checkup AND paid is true in the API response
          paid: item.paid === true,
          status: item.status,
          guardian: item?.patient?.guardian || "",
          isPlaceholder: false,
          appointment_id: item.appointment_id,
          mode: item.mode || "cash",
          fees_paid: item.fees_paid || 0,
          disease: item.disease || null,
          appointment_type: item.appointment_type,
          phone_number: item?.patient?.phone_number || "",
          age: item?.patient?.age || "",
          sex: item?.patient?.gender || "",
          location: item?.patient?.location || "",
        }));

        // Debug log for diagnosing formatted appointments
        formatted.forEach(item => {
          console.log(`Formatted ${item.token} - ${item.patientName} - Paid: ${item.paid}`);
        });

        setAppointments(formatted);
      } else {
        console.log("No appointment data received or empty data array");
        setAppointments([]);
      }
    } catch (err) {
      console.error("Failed to load appointments:", err);
      setError("Failed to load appointments");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  // Add SSE for real-time appointment updates
  useEffect(() => {
    if (!cabinId || !selectedSlot) return;

    let reconnectAttempt = 0;
    let reconnectTimer = null;

    const connectEventSource = () => {
      // Create formatted date for the SSE URL
      const date = new Date(selectedSlot);
      const formattedDate = date
        .toISOString()
        .replace(".000", "")
        .replace("T", " ")
        .replace("Z", "+00:00");
      const sseUrl = `${API_BASE_URL}/doctorinfo/queue_updates/${cabinId}/${formattedDate}`;

      // Close existing connection if any
      if (eventSource) {
        eventSource.close();
      }

      // Create new connection
      const newEventSource = new EventSource(sseUrl, { withCredentials: true });
      setEventSource(newEventSource);

      // Handle incoming messages
      newEventSource.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("SSE Update received:", data);

          if (data.appointment) {
            setAppointments(prevAppointments => {
              const updatedAppointment = {
                id: data.appointment.token,
                token: data.appointment.token,
                patientName: data.appointment.name || '',
                checkin: data.appointment.checkin,
                paid: data.appointment.paid === true,
                status: data.appointment.status,
                guardian: data.appointment?.patient?.guardian || "",
                isPlaceholder: false,
                appointment_id: data.appointment.appointment_id,
                mode: data.appointment.mode || "cash",
                fees_paid: data.appointment.fees_paid || 0,
                disease: data.appointment.disease || null,
                appointment_type: data.appointment.appointment_type,
                phone_number: data.appointment?.patient?.phone_number || "",
                age: data.appointment?.patient?.age || "",
                sex: data.appointment?.patient?.gender || "",
                location: data.appointment?.patient?.location || "",
              };

              // Find if this appointment already exists
              const existingIndex = prevAppointments.findIndex(
                apt => apt.appointment_id === updatedAppointment.appointment_id
              );

              if (existingIndex !== -1) {
                // Update existing appointment
                const newAppointments = [...prevAppointments];
                newAppointments[existingIndex] = updatedAppointment;
                return newAppointments;
              } else {
                // Add new appointment
                return [...prevAppointments, updatedAppointment]
                  .sort((a, b) => Number(a.token) - Number(b.token));
              }
            });
          }
        } catch (error) {
          console.error("Error processing SSE update:", error);
        }
      };

      // Handle connection errors with reconnection logic
      newEventSource.onerror = (error) => {
        console.error("SSE connection error:", error);
        newEventSource.close();
        
        // Calculate delay with exponential backoff, capped at 30 seconds
        const delay = Math.min(1000 * (2 ** reconnectAttempt), 30000);
        reconnectAttempt++;
        
        console.log(`Attempting to reconnect in ${delay/1000} seconds...`);
        reconnectTimer = setTimeout(() => {
          console.log('Reconnecting to SSE...');
          connectEventSource();
        }, delay);
      };

      return newEventSource;
    };

    // Initial connection
    const newEventSource = connectEventSource();

    // Handle visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Tab is now visible, checking SSE connection state in MobileAppointmentTable');
        // Only reconnect if the connection is closed or in an error state
        if (!newEventSource || newEventSource.readyState === EventSource.CLOSED) {
          console.log('Re-establishing SSE connection in MobileAppointmentTable');
          reconnectAttempt = 0; // Reset reconnection attempt counter
          connectEventSource();
        } else {
          console.log('SSE connection is already active in MobileAppointmentTable');
        }
      }
    };

    // Listen for visibility change events
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup on unmount
    return () => {
      if (newEventSource) {
        newEventSource.close();
        console.log("SSE connection closed");
      }
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [cabinId, selectedSlot]);

  useEffect(() => {
    fetchAppointmentsData();
  }, []);

  // Render functions
  const renderEditModal = () => (
    <Dialog
      open={editModalOpen}
      onClose={handleEditModalClose}
      fullWidth
      maxWidth="lg"
      PaperProps={{
        sx: {
          width: { xs: "98vw", sm: "95vw" },
          maxWidth: { xs: "98vw", sm: "95vw" },
          borderRadius: 2,
          p: { xs: 1.5, sm: 2 },
          m: 0,
          overflowY: "auto"
        }
      }}
    >
      <DialogTitle sx={{ 
        position: "relative", 
        p: 0, 
        pb: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
          Edit Appointment
        </Typography>
        <IconButton
          aria-label="close"
          onClick={handleEditModalClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
            padding: '4px',
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0, pt: 1 }}>
        {selectedAppointment && (
          <Box
            sx={{
              display: "grid",
              gap: { xs: "8px", sm: "12px" },
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              width: "100%"
            }}
          >
            <Box sx={{ 
              display: "grid", 
              gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr" },
              gap: { xs: "8px", sm: "12px" }
            }}>
              <TextField
                fullWidth
                label="Token Number"
                type="number"
                disabled={true}
                value={selectedAppointment.token}
                InputProps={{ 
                  readOnly: true,
                  style: { fontSize: '0.85rem' } 
                }}
                InputLabelProps={{ 
                  style: { fontSize: '0.85rem' } 
                }}
                size="small"
              />
              <Autocomplete
                fullWidth
                options={editMobileSearchResults}
                getOptionLabel={(option) => {
                  // Handle both objects from dropdown and direct string input
                  return typeof option === 'object' ? option?.phone_number || "" : option || "";
                }}
                loading={isEditSearching}
                value={selectedAppointment.phone_number || ""}
                onChange={(_, newValue) => {
                  if (typeof newValue === 'object') {
                    handleEditPatientSelect(newValue);
                  } else {
                    setSelectedAppointment(prev => ({
                      ...prev,
                      phone_number: newValue || ""
                    }));
                  }
                }}
                freeSolo={true}
                size="small"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Mobile"
                    onChange={(e) => {
                      const value = e.target.value;
                      setSelectedAppointment(prev => ({
                        ...prev,
                        phone_number: value
                      }));
                      handleEditMobileSearch(value);
                    }}
                    inputProps={{
                      ...params.inputProps,
                      maxLength: 10,
                      value: selectedAppointment.phone_number || "",
                      style: { fontSize: '0.85rem' }
                    }}
                    InputLabelProps={{ 
                      style: { fontSize: '0.85rem' } 
                    }}
                    InputProps={{
                      ...params.InputProps,
                      style: { fontSize: '0.85rem' },
                      endAdornment: (
                        <>
                          {isEditSearching ? "Searching..." : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                    size="small"
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props} style={{ fontSize: '0.85rem' }}>
                    <div>
                      <Typography variant="body2" style={{ fontSize: '0.85rem' }}>{option.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.phone_number}
                      </Typography>
                    </div>
                  </li>
                )}
              />
            </Box>

            <Box sx={{ 
              display: "grid", 
              gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr" },
              gap: { xs: "8px", sm: "12px" }
            }}>
              <TextField
                fullWidth
                label="First Name"
                value={selectedAppointment.firstName || ""}
                onChange={(e) =>
                  setSelectedAppointment((prev) => ({
                    ...prev,
                    firstName: e.target.value,
                  }))
                }
                InputProps={{ style: { fontSize: '0.85rem' } }}
                InputLabelProps={{ style: { fontSize: '0.85rem' } }}
                size="small"
              />
              <TextField
                fullWidth
                label="Last Name"
                value={selectedAppointment.lastName || ""}
                onChange={(e) =>
                  setSelectedAppointment((prev) => ({
                    ...prev,
                    lastName: e.target.value,
                  }))
                }
                InputProps={{ style: { fontSize: '0.85rem' } }}
                InputLabelProps={{ style: { fontSize: '0.85rem' } }}
                size="small"
              />
            </Box>

            <Box sx={{ 
              display: "grid", 
              gridTemplateColumns: "1fr 1fr",
              gap: { xs: "8px", sm: "12px" },
              gridColumn: { xs: "1", sm: "span 2" }
            }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedAppointment.checkin}
                    onChange={(e) =>
                      setSelectedAppointment((prev) => ({
                        ...prev,
                        checkin: e.target.checked,
                      }))
                    }
                    size="small"
                  />
                }
                label={
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: selectedAppointment.checkin ? 'bold' : 'normal',
                      color: selectedAppointment.checkin ? 'primary.main' : 'text.primary',
                      fontSize: '0.85rem'
                    }}
                  >
                    Present
                  </Typography>
                }
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedAppointment.paid}
                    onChange={(e) =>
                      setSelectedAppointment((prev) => ({
                        ...prev,
                        paid: e.target.checked,
                        mode: e.target.checked ? prev.mode || "cash" : "",
                        fees_paid: e.target.checked ? prev.fees_paid || 250 : 0,
                      }))
                    }
                    size="small"
                  />
                }
                label={
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: selectedAppointment.paid ? 'bold' : 'normal',
                      color: selectedAppointment.paid ? 'primary.main' : 'text.primary',
                      fontSize: '0.85rem'
                    }}
                  >
                    Payment
                  </Typography>
                }
              />
            </Box>

            {selectedAppointment.paid && (
              <Box sx={{ 
                display: "grid", 
                gridTemplateColumns: "1fr 1fr",
                gap: { xs: "8px", sm: "12px" },
                gridColumn: { xs: "1", sm: "span 2" }
              }}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ fontSize: '0.85rem' }}>Mode</InputLabel>
                  <Select
                    value={selectedAppointment.mode || "cash"}
                    onChange={(e) =>
                      setSelectedAppointment((prev) => ({
                        ...prev,
                        mode: e.target.value,
                      }))
                    }
                    label="Payment Mode"
                    sx={{ fontSize: '0.85rem' }}
                  >
                    <MenuItem value="cash" sx={{ fontSize: '0.85rem' }}>Cash</MenuItem>
                    <MenuItem value="online" sx={{ fontSize: '0.85rem' }}>Online</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="Fees"
                  type="number"
                  value={selectedAppointment.fees_paid || 0}
                  onChange={(e) =>
                    setSelectedAppointment((prev) => ({
                      ...prev,
                      fees_paid: Number(e.target.value),
                    }))
                  }
                  InputProps={{ style: { fontSize: '0.85rem' } }}
                  InputLabelProps={{ style: { fontSize: '0.85rem' } }}
                  size="small"
                />
              </Box>
            )}

            <Box sx={{ 
              display: "grid", 
              gridTemplateColumns: "1fr 1fr",
              gap: { xs: "8px", sm: "12px" },
              gridColumn: { xs: "1", sm: "span 2" }
            }}>
              <TextField
                fullWidth
                label="Age"
                type="number"
                value={selectedAppointment.age || ""}
                onChange={(e) =>
                  setSelectedAppointment((prev) => ({
                    ...prev,
                    age: e.target.value,
                  }))
                }
                InputProps={{ style: { fontSize: '0.85rem' } }}
                InputLabelProps={{ style: { fontSize: '0.85rem' } }}
                size="small"
              />
              <FormControl component="fieldset">
                <ToggleButtonGroup
                  value={selectedAppointment.sex || ""}
                  exclusive
                  onChange={(_, newValue) =>
                    setSelectedAppointment((prev) => ({
                      ...prev,
                      sex: newValue || "",
                    }))
                  }
                  color="primary"
                  size="small"
                  sx={{ height: '36px' }}
                >
                  <ToggleButton value="M" color="primary" sx={{ fontSize: '0.75rem', py: 0 }}>
                    Male
                  </ToggleButton>
                  <ToggleButton value="F" color="secondary" sx={{ fontSize: '0.75rem', py: 0 }}>
                    Female
                  </ToggleButton>
                  <ToggleButton value="O" sx={{ fontSize: '0.75rem', py: 0 }}>
                    Other
                  </ToggleButton>
                </ToggleButtonGroup>
              </FormControl>
            </Box>

            <Box sx={{ 
              display: "grid", 
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: { xs: "8px", sm: "12px" },
              gridColumn: { xs: "1", sm: "span 2" }
            }}>
              <TextField
                fullWidth
                label="Guardian"
                value={selectedAppointment.guardian || ""}
                onChange={(e) =>
                  setSelectedAppointment((prev) => ({
                    ...prev,
                    guardian: e.target.value,
                  }))
                }
                InputProps={{ style: { fontSize: '0.85rem' } }}
                InputLabelProps={{ style: { fontSize: '0.85rem' } }}
                size="small"
              />
              <TextField
                fullWidth
                label="Place"
                value={selectedAppointment.location || ""}
                onChange={(e) =>
                  setSelectedAppointment((prev) => ({
                    ...prev,
                    location: e.target.value,
                  }))
                }
                InputProps={{ style: { fontSize: '0.85rem' } }}
                InputLabelProps={{ style: { fontSize: '0.85rem' } }}
                size="small"
              />
            </Box>

            <Box sx={{ 
              display: "grid", 
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: { xs: "8px", sm: "12px" },
              gridColumn: { xs: "1", sm: "span 2" }
            }}>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ fontSize: '0.85rem' }}>Appointment Type</InputLabel>
                <Select
                  value={selectedAppointment.appointment_type || "New"}
                  onChange={(e) =>
                    setSelectedAppointment((prev) => ({
                      ...prev,
                      appointment_type: e.target.value,
                    }))
                  }
                  label="Appointment Type"
                  sx={{ fontSize: '0.85rem' }}
                >
                  <MenuItem value="New" sx={{ fontSize: '0.85rem' }}>New</MenuItem>
                  <MenuItem value="Follow-up" sx={{ fontSize: '0.85rem' }}>Follow-up</MenuItem>
                  <MenuItem value="Emergency" sx={{ fontSize: '0.85rem' }}>Emergency</MenuItem>
                  <MenuItem value="Routine" sx={{ fontSize: '0.85rem' }}>Routine</MenuItem>
                  <MenuItem value="Cancelled" sx={{ fontSize: '0.85rem' }}>Cancelled</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Complaint"
                value={selectedAppointment.disease || ""}
                onChange={(e) =>
                  setSelectedAppointment((prev) => ({
                    ...prev,
                    disease: e.target.value,
                  }))
                }
                InputProps={{ style: { fontSize: '0.85rem' } }}
                InputLabelProps={{ style: { fontSize: '0.85rem' } }}
                size="small"
              />
            </Box>
          </Box>
        )}
      </DialogContent>
      <Box sx={{ 
        mt: 2, 
        display: "flex", 
        justifyContent: "space-between",
        px: { xs: 0.5, sm: 1 }
      }}>
        <Button
          onClick={() => {
            setRowToCancel(selectedAppointment);
            setCancelConfirmationOpen(true);
          }}
          color="error"
          variant="outlined"
          sx={{ 
            borderWidth: "1px",
            fontSize: '0.75rem',
            py: 0.5,
            px: 1,
            minWidth: '36px',
            '&:hover': {
              borderWidth: "1px"
            }
          }}
          disabled={isCanceling}
          size="small"
        >
          {isCanceling ? <CircularProgress size={16} /> : "Cancel"}
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirmEdit}
          disabled={isUpdating}
          sx={{ 
            fontSize: '0.75rem',
            py: 0.5,
            px: 1.5,
            minWidth: '40px'
          }}
          size="small"
        >
          {isUpdating ? <CircularProgress size={16} /> : "Update"}
        </Button>
      </Box>
    </Dialog>
  );

  // Confirmation dialog for cancelling an appointment
  const renderCancelConfirmationDialog = () => (
    <Dialog 
      open={cancelConfirmationOpen} 
      onClose={() => setCancelConfirmationOpen(false)}
      PaperProps={{
        sx: {
          width: { xs: "90vw", sm: "85vw" },
          maxWidth: { xs: "90vw", sm: "85vw" },
          borderRadius: 2,
        }
      }}
    >
      <DialogTitle sx={{ fontSize: '1rem', pt: 2, pb: 1 }}>Confirm Cancellation</DialogTitle>
      <DialogContent sx={{ pt: 0, px: 2, pb: 1 }}>
        <Typography sx={{ fontSize: '0.85rem' }}>
          Are you sure you want to cancel this appointment for {rowToCancel?.patientName || rowToCancel?.firstName + ' ' + rowToCancel?.lastName}?
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 1.5 }}>
        <Button 
          onClick={() => setCancelConfirmationOpen(false)} 
          size="small"
          sx={{ fontSize: '0.75rem', minWidth: '36px', px: 1 }}
        >
          No
        </Button>
        <Button 
          onClick={handleCancelAppointment} 
          color="error" 
          autoFocus 
          size="small"
          sx={{ fontSize: '0.75rem', minWidth: '36px', px: 1 }}
        >
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box sx={{ 
      padding: { xs: '6px 0px 80px 0px', sm: 2 },
      width: '100%',
      maxWidth: '100%',
      overflowX: 'hidden'
    }}>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search patients..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        margin="normal"
        size="small"
        sx={{ px: { xs: 1.5, sm: 0 }, m: 0, width: "95%", height: "1rem", mt: 0 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
          style: { fontSize: '0.9rem' }
        }}
      />

      {loading ? (
        <Box sx={{ px: { xs: 1.5, sm: 0 }, mt: 2 }}>
          {/* Table-like skeleton structure that matches the real content */}
          <Paper sx={{ borderRadius: { xs: 0, sm: '4px' }, boxShadow: { xs: 'none', sm: 1 }, overflow: 'hidden' }}>
            {/* Table header skeleton */}
            <Box sx={{ 
              display: 'flex', 
              backgroundColor: '#f5f5f5', 
              borderBottom: '1px solid #e0e0e0',
              py: 1
            }}>
              <Box sx={{ width: '20%', px: { xs: 1, sm: 2 } }}>
                <Skeleton variant="text" width="70%" height={24} />
              </Box>
              <Box sx={{ width: '50%', px: { xs: 1, sm: 2 } }}>
                <Skeleton variant="text" width="60%" height={24} />
              </Box>
              <Box sx={{ width: '30%', px: { xs: 1, sm: 2 } }}>
                <Skeleton variant="text" width="80%" height={24} />
              </Box>
            </Box>

            {/* Table rows skeletons */}
            {[...Array(10)].map((_, index) => (
              <Box 
                key={index}
                sx={{ 
                  display: 'flex',
                  py: 1,
                  borderBottom: '1px solid #f0f0f0',
                  backgroundColor: index % 2 === 0 ? '#ffffff' : '#fafafa'
                }}
              >
                {/* Token number cell */}
                <Box sx={{ width: '20%', px: { xs: 1, sm: 2 } }}>
                  <Skeleton variant="text" width="40%" height={24} />
                </Box>
                
                {/* Patient name cell */}
                <Box sx={{ width: '50%', px: { xs: 1, sm: 2 } }}>
                  <Skeleton variant="text" width="85%" height={24} />
                </Box>
                
                {/* Status cell with multiple status indicators */}
                <Box sx={{ width: '30%', px: { xs: 1, sm: 2 }, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Skeleton variant="rectangular" width="70%" height={18} sx={{ borderRadius: '4px' }} />
                  <Skeleton variant="rectangular" width="60%" height={18} sx={{ borderRadius: '4px' }} />
                  {index % 3 === 0 && (
                    <Skeleton variant="rectangular" width="75%" height={18} sx={{ borderRadius: '4px' }} />
                  )}
                </Box>
              </Box>
            ))}
          </Paper>
        </Box>
      ) : error ? (
        <Typography color="error" align="center" sx={{ mt: 2 }}>
          {error}
        </Typography>
      ) : filteredAppointments.length === 0 ? (
        <Typography align="center" sx={{ mt: 2 }}>
          No appointments found
        </Typography>
      ) : (
        <TableContainer 
          component={Paper} 
          sx={{ 
            mt: 2,
            width: '100%',
            maxWidth: '100%',
            borderRadius: { xs: 0, sm: '4px' },
            boxShadow: { xs: 'none', sm: 1 }
          }}
        >
          <Table size="small" className="mobile-table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ py: 1, px: { xs: 1, sm: 2 }, width: '20%' }}>Token</TableCell>
                <TableCell sx={{ py: 1, px: { xs: 1, sm: 2 }, width: '50%' }}>Patient</TableCell>
                <TableCell sx={{ py: 1, px: { xs: 1, sm: 2 }, width: '30%' }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayRows.map((appointment) => (
                <TableRow 
                  key={appointment.token}
                  onClick={() => !appointment.isPlaceholder && handleEditClick(appointment)}
                  hover={!appointment.isPlaceholder}
                  sx={{ 
                    cursor: appointment.isPlaceholder ? 'default' : 'pointer',
                    backgroundColor: appointment.isPlaceholder ? '#f9f9f9' : 'inherit'
                  }}
                >
                  <TableCell sx={{ py: 1, px: { xs: 1, sm: 2 } }}>#{appointment.token}</TableCell>
                  <TableCell sx={{ py: 1, px: { xs: 1, sm: 2 } }}>
                    {appointment.isPlaceholder ? (
                      <Typography variant="body2" sx={{ color: '#999', fontStyle: 'italic' }}>
                        Empty Slot
                      </Typography>
                    ) : (
                      <Typography variant="body1">
                        {appointment.patientName}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ py: 1, px: { xs: 1, sm: 2 } }}>
                    {appointment.isPlaceholder ? (
                      <Typography variant="body2" sx={{ color: '#999', fontStyle: 'italic' }}>
                        Available
                      </Typography>
                    ) : (
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.3 }}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          backgroundColor: getStatusColor(appointment.status) === 'success' ? '#e7f7e7' : 
                                          getStatusColor(appointment.status) === 'error' ? '#ffeaea' : 
                                          getStatusColor(appointment.status) === 'info' ? '#e3f2fd' : '#f5f5f5',
                          borderRadius: '4px',
                          py: 0.2,
                          px: 0.5,
                          width: 'fit-content'
                        }}>
                          <Box sx={{ 
                            width: '6px', 
                            height: '6px', 
                            borderRadius: '50%',
                            mr: 0.5, 
                            backgroundColor: getStatusColor(appointment.status) === 'success' ? 'success.main' : 
                                            getStatusColor(appointment.status) === 'error' ? 'error.main' : 
                                            getStatusColor(appointment.status) === 'info' ? 'info.main' : 'grey.500',
                          }} />
                          <Typography sx={{ fontSize: '0.65rem', fontWeight: 500 }}>
                            {appointment.status === "done" || appointment.status === "done_checkup" ? "Completed" : 
                             appointment.status === "cancelled" ? "Cancelled" : "Pending"}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          backgroundColor: appointment.checkin ? '#e7f7e7' : '#f5f5f5',
                          borderRadius: '4px',
                          py: 0.2,
                          px: 0.5,
                          width: 'fit-content'
                        }}>
                          <Box sx={{ 
                            width: '6px', 
                            height: '6px', 
                            borderRadius: '50%',
                            mr: 0.5, 
                            backgroundColor: appointment.checkin ? 'success.main' : 'grey.400',
                          }} />
                          <Typography sx={{ fontSize: '0.65rem', fontWeight: 500 }}>
                            {appointment.checkin ? "Present" : "Absent"}
                          </Typography>
                        </Box>
                        
                        {appointment.paid && (
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            backgroundColor: '#e7f7e7',
                            borderRadius: '4px',
                            py: 0.2,
                            px: 0.5,
                            width: 'fit-content'
                          }}>
                            <Box sx={{ 
                              width: '6px', 
                              height: '6px', 
                              borderRadius: '50%',
                              mr: 0.5, 
                              backgroundColor: 'success.main',
                            }} />
                            <Typography sx={{ fontSize: '0.65rem', fontWeight: 500 }}>
                              Paid ({appointment.mode || 'cash'})
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Edit Modal */}
      {renderEditModal()}
      
      {/* Cancel Confirmation Dialog */}
      {renderCancelConfirmationDialog()}
    </Box>
  );
};

export default MobileAppointmentTable;
