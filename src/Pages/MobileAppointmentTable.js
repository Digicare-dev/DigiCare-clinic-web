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
} from "@mui/material";
import { fetchAppointments, updateAppointmentDetails } from "../services/api";
import "./MobileAppointmentTable.css";
import SearchIcon from "@mui/icons-material/Search";
import { CheckCircle, Cancel, Edit } from "@mui/icons-material";

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

  const filteredAppointments = useMemo(() => {
    if (!searchQuery) return appointments;
    const query = searchQuery.toLowerCase();
    return appointments.filter((apt) =>
      apt.patientName.toLowerCase().includes(query)
    );
  }, [appointments, searchQuery]);

  const handleEditClick = (appointment) => {
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
        checkin: selectedAppointment.checkin,
        paid: selectedAppointment.paid,
      };

      // Call the API to update the appointment
      await updateAppointmentDetails(payload);

      // Update local state
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
    setSelectedAppointment((prev) => ({
      ...prev,
      paid: event.target.checked,
    }));
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
      }));

      setAppointments(formatted);
      setLoading(false);
    } catch (err) {
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

    const eventSource = new EventSource(sseUrl);

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
      console.error("SSE error:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const displayedRows = generateDisplayRows(filteredAppointments);

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
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedRows.map((row) => (
                <TableRow
                  key={row.token}
                  className={row.isPlaceholder ? "placeholder-row" : ""}
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
                  <TableCell align="center">
                    {!row.isPlaceholder && (
                      <IconButton
                        size="small"
                        onClick={() => handleEditClick(row)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onClose={handleEditModalClose}>
        <DialogTitle>Edit Appointment</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedAppointment?.checkin || false}
                  onChange={handleCheckinChange}
                />
              }
              label="Check-in"
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditModalClose}>Cancel</Button>
          <Button
            onClick={handleUpdateAppointment}
            color="primary"
            variant="contained"
            disabled={isUpdating}
          >
            {isUpdating ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Update"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MobileAppointmentTable;
