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
  useMediaQuery,
  Box,
  TextField,
  InputAdornment,
} from "@mui/material";
import { fetchAppointments } from "../services/api";
import "./MobileAppointmentTable.css";
import SearchIcon from "@mui/icons-material/Search";
import { CheckCircle, Cancel } from "@mui/icons-material"; // Add icons

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

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
      }
    );
  });
};

const MobileAppointmentTable = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [appointments, setAppointments] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const [searchQuery, setSearchQuery] = useState("");

  const [eventSource, setEventSource] = useState(null);

  const filteredAppointments = useMemo(() => {
    if (!searchQuery) return appointments;
    const query = searchQuery.toLowerCase();
    return appointments.filter((apt) =>
      apt.patientName.toLowerCase().includes(query)
    );
  }, [appointments, searchQuery]);

  useEffect(() => {
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

    const newEventSource = new EventSource(sseUrl);
    setEventSource(newEventSource);

    newEventSource.onmessage = (event) => {
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
              service: parsedData.appointment.appointment_type,
              status: parsedData.appointment.status,
              guardian: parsedData?.patient?.guardian || "",
              isPlaceholder: false,
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

    newEventSource.onerror = (error) => {
      console.error("SSE error:", error);
      newEventSource.close();
    };

    return () => {
      newEventSource.close();
    };
  }, []);

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
          height: "calc(90vh - 180px)", // Adjust the height as needed
          overflowY: "auto", // Enable vertical scrolling
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
                <TableCell align="center">Payment</TableCell>{" "}
                <TableCell align="center">Status</TableCell>
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
                  {/* Check-in Status */}
                  <TableCell align="center">
                    {row.isPlaceholder ? (
                      "-"
                    ) : row.checkin ? (
                      <CheckCircle fontSize="small" color="success" />
                    ) : (
                      <Cancel fontSize="small" color="error" />
                    )}
                  </TableCell>
                  {/* Payment Status */}
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
                  </TableCell>{" "}
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
    </Box>
  );
};

export default MobileAppointmentTable;
