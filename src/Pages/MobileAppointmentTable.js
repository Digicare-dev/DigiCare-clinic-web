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
} from "@mui/material";
import {
  fetchAppointments,
  updateAppointmentDetails,
  removeAppointment,
} from "../services/api";
import "./MobileAppointmentTable.css";
import SearchIcon from "@mui/icons-material/Search";
import { CheckCircle, Cancel, Edit } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";

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

  const filteredAppointments = useMemo(() => {
    if (!searchQuery) return appointments;
    const query = searchQuery.toLowerCase();
    return appointments.filter((apt) =>
      apt.patientName.toLowerCase().includes(query)
    );
  }, [appointments, searchQuery]);

  useEffect(() => {
    console.log(appointments);
  }, [appointments]);

  const handleEditClick = (appointment) => {
    console.log(appointment);
    setSelectedAppointment(appointment);
    setEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setEditModalOpen(false);
    setSelectedAppointment(null);
  };

  const handleUpdateAppointment = async () => {
    if (!selectedAppointment) return;

    setIsUpdating(true);
    try {
      const payload = {
        token: selectedAppointment.token,
        appointment_id: selectedAppointment.appointment_id,
        name: `${selectedAppointment.patientName}`.toUpperCase(),
        guardian: `${selectedAppointment.guardian}`.toUpperCase(),
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

      await updateAppointmentDetails(payload);

      setAppointments((prev) =>
        prev.map((apt) =>
          apt.token === selectedAppointment.token ? selectedAppointment : apt
        )
      );

      handleEditModalClose();
    } catch (error) {
      console.error("Failed to update appointment:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCheckinChange = (event) => {
    setSelectedAppointment((prev) => ({
      ...prev,
      checkin: event.target.checked,
    }));
  };

  const handlePaymentChange = (event) => {
    const checked = event.target.checked;

    setSelectedAppointment((prev) => ({
      ...prev,
      paid: checked,
      mode: checked ? prev.mode || "cash" : "",
      fees_paid: checked ? prev.fees_paid || 250 : 0,
    }));
  };

  const handleSexChange = (event, newSex) => {
    if (newSex !== null) {
      setSelectedAppointment((prev) => ({
        ...prev,
        sex: newSex,
      }));
    }
  };

  const fetchAppointmentsData = async () => {
    try {
      const data = await fetchAppointments(
        user.checkupcabindata[0].id,
        user.checkupcabindata[0].cabin_slots[0]
      );
      const formatted = data.map((item) => ({
        id: item.token,
        token: item.token,
        patientName: item.name,
        checkin: item.checkin || false,
        paid: item.paid || false,
        status: item.status === "done_checkup" ? "done" : item.status,
        guardian: item?.patient?.guardian || "N/A",
        isPlaceholder: false,
        appointment_id: item.appointment_id,
        mode: item.mode || "",
        fees_paid: item.fees_paid || 0,
        disease: item.disease || null,
        appointment_type: item.appointment_type || "New",
        phone_number: item?.patient?.phone_number || "",
        age: item?.patient?.age || "",
        sex: item?.patient?.gender || "",
        location: item?.patient?.location || "",
      }));

      setAppointments(formatted);
      setLoading(false);
    } catch (err) {
      console.log(err);
      setError("Failed to load appointments");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointmentsData();

    // Set up SSE connection
    if (!user?.checkupcabindata?.[0]?.id) return;

    const doctorId = user.checkupcabindata[0].id;
    const slotTime = user.checkupcabindata[0].cabin_slots[0];

    // Format date for SSE URL
    const date = new Date(slotTime);
    const formattedDate = date
      .toISOString()
      .replace(".000", "")
      .replace("T", " ")
      .replace("Z", "+00:00");
    const encodedDate = encodeURIComponent(formattedDate);

    const sseUrl = `${API_BASE_URL}/doctorinfo/queue_updates/${doctorId}/${encodedDate}`;

    const eventSource = new EventSource(sseUrl, { withCredentials: true });

    eventSource.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);

        if (parsedData.appointment) {
          // Update appointments state optimistically
          setAppointments((prev) => {
            const existingIndex = prev.findIndex(
              (a) => a.token === parsedData.appointment.token
            );

            const updatedAppointment = {
              id: parsedData.appointment.token,
              token: parsedData.appointment.token,
              patientName: parsedData.appointment.name,
              checkin: parsedData.appointment.checkin || false,
              paid: parsedData.appointment.paid || false,
              status:
                parsedData.appointment.status === "done_checkup"
                  ? "done"
                  : parsedData.appointment.status,
              guardian: parsedData?.patient?.guardian || "N/A",
              isPlaceholder: false,
              appointment_id: parsedData.appointment.appointment_id,
              disease: parsedData.appointment.disease || null,
              appointment_type:
                parsedData.appointment.appointment_type || "New",
              phone_number: parsedData.appointment.phone_number || "",
              age: parsedData.appointment.age || "",
              sex: parsedData.appointment.sex || "",
              location: parsedData.appointment.location || "",
            };

            if (existingIndex !== -1) {
              const newApps = [...prev];
              newApps[existingIndex] = updatedAppointment;
              return newApps;
            }
            return [...prev, updatedAppointment];
          });
        }
      } catch (error) {
        console.error("Error parsing SSE data:", error);
      }
    };

    eventSource.onerror = (error) => {
      // console.error("SSE error:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const displayedRows = generateDisplayRows(filteredAppointments);

  const handleDeleteAppointment = async () => {
    if (!selectedAppointment) return;

    setIsDeleting(true);
    try {
      const payload = {
        appointment_id: selectedAppointment.appointment_id,
      };

      await removeAppointment(payload); // Call the delete API

      handleEditModalClose(); // Close the edit modal
    } catch (error) {
      console.error("Failed to delete appointment:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress size={24} />
        <Typography variant="body2" sx={{ ml: 2 }}>
          Loading appointments...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box p={1} sx={{ paddingBottom: "100px" }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search patients..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 1 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
      <Box
        sx={{
          height: "calc(90vh - 180px)",
          overflowY: "auto",
          pb: 4,
        }}
      >
        <TableContainer component={Paper}>
          <Table size="small" className="mobile-table">
            <TableHead>
              <TableRow>
                <TableCell>Token</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>Guardian</TableCell>
                <TableCell align="center">Check-In</TableCell>
                <TableCell align="center">Payment</TableCell>
                <TableCell align="center">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedRows.map((row) => (
                <TableRow
                  key={row.token}
                  className={row.isPlaceholder ? "placeholder-row" : ""}
                  onClick={() => !row.isPlaceholder && handleEditClick(row)}
                  onDoubleClick={() =>
                    !row.isPlaceholder && handleEditClick(row)
                  }
                  role="button"
                  tabIndex={0}
                  style={{ cursor: row.isPlaceholder ? "default" : "pointer" }}
                >
                  <TableCell>#{row.token}</TableCell>
                  <TableCell>
                    {row.isPlaceholder ? (
                      <Typography variant="caption" color="textSecondary">
                        Empty Slot
                      </Typography>
                    ) : (
                      row.patientName
                    )}
                  </TableCell>
                  <TableCell>
                    {row.isPlaceholder ? "-" : row.guardian || "N/A"}
                  </TableCell>
                  <TableCell align="center">
                    {row.isPlaceholder ? (
                      "-"
                    ) : row.checkin ? (
                      <CheckCircle fontSize="small" color="success" />
                    ) : (
                      <Cancel fontSize="small" color="error" />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {row.isPlaceholder ? (
                      "-"
                    ) : row.paid ? (
                      <Chip
                        label="Paid"
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    ) : (
                      <Chip
                        label="Not Paid"
                        size="small"
                        color="error"
                        variant="outlined"
                      />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={row.status}
                      size="small"
                      className="status-chip"
                      color={getStatusColor(row.status)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      {/* Edit Modal */}
      <Dialog open={editModalOpen} onClose={handleEditModalClose}>
        <DialogTitle sx={{ position: "relative", pr: 6 }}>
          Edit Appointment
          <IconButton
            aria-label="close"
            onClick={handleEditModalClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>{" "}
        <DialogContent>
          {/* Patient Name */}
          <TextField
            fullWidth
            label="Patient Name"
            value={selectedAppointment?.patientName || ""}
            onChange={(e) =>
              setSelectedAppointment((prev) => ({
                ...prev,
                patientName: e.target.value,
              }))
            }
            margin="dense"
          />

          {/* Check-in and Payment Row */}
          <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedAppointment?.checkin || false}
                  onChange={handleCheckinChange}
                />
              }
              label="Checked In"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedAppointment?.paid || false}
                  onChange={handlePaymentChange}
                />
              }
              label="Payment"
            />
          </Box>

          {/* Payment Mode and Fees Paid Row */}
          {selectedAppointment?.paid && (
            <Box sx={{ display: "flex", gap: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Payment Mode</InputLabel>
                <Select
                  value={selectedAppointment?.mode || "cash"}
                  onChange={(e) =>
                    setSelectedAppointment((prev) => ({
                      ...prev,
                      mode: e.target.value,
                    }))
                  }
                  label="Payment Mode"
                >
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="online">Online</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Fees Paid"
                type="number"
                value={selectedAppointment?.fees_paid || 0}
                onChange={(e) =>
                  setSelectedAppointment((prev) => ({
                    ...prev,
                    fees_paid: Number(e.target.value),
                  }))
                }
              />
            </Box>
          )}
          {/* Mobile and Age Row */}
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              fullWidth
              label="Mobile"
              slotProps={{ input: { maxLength: 10 } }}
              value={selectedAppointment?.phone_number || ""}
              onChange={(e) => {
                if (e.target.value.length > 10) {
                  return;
                }
                setSelectedAppointment((prev) => ({
                  ...prev,
                  phone_number: e.target.value,
                }));
              }}
              margin="dense"
            />
            <TextField
              fullWidth
              label="Age"
              value={selectedAppointment?.age || ""}
              onChange={(e) =>
                setSelectedAppointment((prev) => ({
                  ...prev,
                  age: e.target.value,
                }))
              }
              margin="dense"
            />
          </Box>
          <TextField
            fullWidth
            label="Guardian"
            value={selectedAppointment?.guardian || ""}
            onChange={(e) =>
              setSelectedAppointment((prev) => ({
                ...prev,
                guardian: e.target.value,
              }))
            }
            margin="dense"
          />

          {/* Gender Toggle Group */}
          <ToggleButtonGroup
            value={selectedAppointment?.sex || ""}
            exclusive
            onChange={handleSexChange}
            color="primary"
            fullWidth
            sx={{ mb: 1.5 }}
          >
            <ToggleButton value="M">Male</ToggleButton>
            <ToggleButton value="F">Female</ToggleButton>
            <ToggleButton value="O">Other</ToggleButton>
          </ToggleButtonGroup>

          {/* Location and Appointment Type Row */}
          <Box
            sx={{
              display: "flex",
              gap: 1,
              mb: 1,
              alignItems: "center",
            }}
          >
            <TextField
              fullWidth
              label="Location"
              value={selectedAppointment?.location || ""}
              onChange={(e) =>
                setSelectedAppointment((prev) => ({
                  ...prev,
                  location: e.target.value,
                }))
              }
              margin="dense"
              sx={{ marginBottom: "0" }}
            />
            <FormControl fullWidth>
              <InputLabel sx={{ mt: 1 }}>Appointment Type</InputLabel>
              <Select
                value={selectedAppointment?.appointment_type || "New"}
                onChange={(e) =>
                  setSelectedAppointment((prev) => ({
                    ...prev,
                    appointment_type: e.target.value,
                  }))
                }
                label="Appointment Type"
                sx={{ mt: 1 }}
              >
                <MenuItem value="New">New</MenuItem>
                <MenuItem value="Follow-up">Follow-up</MenuItem>
                <MenuItem value="Emergency">Emergency</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Disease */}
          <TextField
            fullWidth
            label="Disease"
            value={selectedAppointment?.disease || ""}
            onChange={(e) =>
              setSelectedAppointment((prev) => ({
                ...prev,
                disease: e.target.value,
              }))
            }
            margin="dense"
            sx={{ mb: 0 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDeleteAppointment}
            color="error"
            variant="contained"
            disabled={isDeleting}
            sx={{ mx: 1, mb: 2 }}
          >
            {isDeleting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Delete"
            )}
          </Button>
          <Button
            onClick={handleUpdateAppointment}
            color="primary"
            variant="contained"
            disabled={isUpdating}
            sx={{ mx: 1, mb: 2 }}
          >
            {isUpdating ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Update"
            )}
          </Button>
        </DialogActions>
      </Dialog>{" "}
    </Box>
  );
};

export default MobileAppointmentTable;
