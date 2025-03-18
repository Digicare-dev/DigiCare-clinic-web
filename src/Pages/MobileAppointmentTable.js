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
  Alert
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

  const { cabinId, selectedSlot } = getCabinInfo(user);

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

      console.log("Sending update payload:", payload);
      const response = await updateAppointmentDetails(payload);
      console.log("Update response:", response);

      // Refresh appointments data to get updated data from the server
      await fetchAppointmentsData();
      
      handleEditModalClose();
    } catch (error) {
      console.error("Failed to update appointment:", error);
      setError("Failed to update appointment. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelAppointment = () => {
    // Implement the logic to cancel the appointment
    console.log("Cancel appointment");
    setIsCanceling(false);
    setRowToCancel(null);
  };

  const handleFetchAppointmentsData = async () => {
    // Implement the logic to fetch appointments data
    console.log("Fetching appointments data");
  };

  // Render functions
  const renderEditModal = () => (
    <Dialog
      open={editModalOpen}
      onClose={handleEditModalClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          width: "95vw",
          maxWidth: "95vw",
          borderRadius: 2,
          p: 2,
        }
      }}
    >
      <DialogTitle sx={{ position: "relative", pr: 6, p: 0, mb: 2 }}>
        <Typography variant="h6" sx={{ fontSize: '1.1rem' }}>Edit Appointment</Typography>
        <IconButton
          aria-label="close"
          onClick={handleEditModalClose}
          sx={{
            position: "absolute",
            right: 0,
            top: 0,
            color: (theme) => theme.palette.grey[500],
            padding: '4px',
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0, pt: 1 }}>
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 2, fontSize: '0.85rem' }}
            onClose={() => setError("")}
          >
            {error}
          </Alert>
        )}
        {selectedAppointment && (
          <div
            style={{
              display: "grid",
              gap: "12px",
              gridTemplateColumns: "1fr 1fr",
              paddingTop: "8px"
            }}
          >
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
                  }))
                }
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
                    {isEditSearching ? <CircularProgress color="inherit" size={16} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
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
                  Payment Done
                </Typography>
              }
            />
            {selectedAppointment.paid && (
              <>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ fontSize: '0.85rem' }}>Payment Mode</InputLabel>
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
              </>
            )}
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
          </div>
        )}
      </DialogContent>
      <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
        <Button
          onClick={() => {
            setRowToCancel(selectedAppointment);
            setCancelConfirmationOpen(true);
          }}
          color="error"
          variant="outlined"
          sx={{ 
            mr: 2,
            borderWidth: "1px",
            fontSize: '0.75rem',
            py: 0.5,
            px: 1.5,
            '&:hover': {
              borderWidth: "1px"
            }
          }}
          disabled={isCanceling}
          size="small"
        >
          {isCanceling ? <CircularProgress size={16} /> : "Cancel Appointment"}
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirmEdit}
          disabled={isUpdating}
          sx={{ 
            fontSize: '0.75rem',
            py: 0.5,
            px: 1.5
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
          width: "85vw",
          maxWidth: "85vw",
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
          sx={{ fontSize: '0.75rem' }}
        >
          No
        </Button>
        <Button 
          onClick={handleCancelAppointment} 
          color="error" 
          autoFocus 
          size="small"
          sx={{ fontSize: '0.75rem' }}
        >
          Yes, Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Box sx={{ 
      padding: { xs: '16px 0px 72px 0px', sm: 2 },
      width: '100%',
      maxWidth: '100%',
      overflowX: 'hidden'
    }}>
      <Typography variant="h5" sx={{ px: { xs: 1.5, sm: 0 } }} gutterBottom>
        Appointments
      </Typography>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search patients..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        margin="normal"
        size="small"
        sx={{ px: { xs: 1.5, sm: 0 } }}
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
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "200px",
          }}
        >
          <CircularProgress />
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
                <TableCell sx={{ py: 1, px: { xs: 1, sm: 2 }, width: '15%' }}>Token</TableCell>
                <TableCell sx={{ py: 1, px: { xs: 1, sm: 2 }, width: '45%' }}>Patient</TableCell>
                <TableCell sx={{ py: 1, px: { xs: 1, sm: 2 }, width: '40%' }}>Status</TableCell>
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
                  <TableCell sx={{ py: 1, px: { xs: 1, sm: 2 } }}>{appointment.token}</TableCell>
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
