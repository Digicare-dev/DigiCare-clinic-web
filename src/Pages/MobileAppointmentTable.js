import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import { fetchAppointments } from "../services/api";
import "./MobileAppointmentTable.css";

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
        service: "",
        status: "empty",
      }
    );
  });
};

const MobileAppointmentTable = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [appointments, setAppointments] = useState([]);
  const isMobile = useMediaQuery("(max-width:768px)");
  const user = JSON.parse(localStorage.getItem("user"));

  const getStatusColor = (status) => {
    switch (status) {
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
        service: item.appointment_type,
        status: item.status,
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

  const displayedRows = generateDisplayRows(appointments);

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
    <Box p={1} sx={{ paddingBottom: "50px" }}>
      <Box
        sx={{
          height: "80vh", // Adjust the height as needed
          overflowY: "auto", // Enable vertical scrolling
        }}
      >
        <TableContainer component={Paper}>
          <Table size="small" className="mobile-table">
            <TableHead>
              <TableRow>
                <TableCell>Token</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>Service</TableCell>
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
                  <TableCell>{row.isPlaceholder ? "-" : row.service}</TableCell>
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
