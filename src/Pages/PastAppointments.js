import * as React from "react";
import { useEffect, useState } from "react";
import "./PastAppointments.css";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import {
  Box,
  Typography,
  TextField,
  CircularProgress,
  Checkbox,
  Button,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { fetchAppointments } from "../services/api";

import { useNavigate, useLocation } from "react-router-dom";

// Dummy data generator
const generateDummyData = (date) => {
  const baseDate = new Date(date);
  return Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    token: i + 1,
    appointment_id: `APP-${baseDate.getDate()}${i + 1}`,
    firstName: `Patient${i + 1}`,
    lastName: `Last${i + 1}`,
    checkin: Math.random() > 0.2,
    paid: Math.random() > 0.3,
    status: ["pending", "done_checkup", "cancelled"][i % 3],
    disease: ["Flu", "Fever", "Injury"][i % 3],
    age: 20 + (i % 40),
    phone_number: `98765432${10 + i}`,
    location: ["City A", "City B", "City C"][i % 3],
    sex: ["M", "F", "O"][i % 3],
    guardian: i % 4 === 0 ? "Guardian Name" : "",
    appointment_type: ["New", "Follow-up", "Emergency"][i % 3],
    mode: ["cash", "online"][i % 2],
    fees_paid: [250, 300, 200][i % 3],
    date: baseDate.toISOString(),
  }));
};

const columns = [
  { field: "token", headerName: "Token", width: 90 },
  { field: "firstName", headerName: "First Name", width: 150 },
  { field: "lastName", headerName: "Last Name", width: 150 },
  { field: "age", headerName: "Age", width: 70 },
  { field: "phone_number", headerName: "Mobile", width: 130 },
  { field: "location", headerName: "Place", width: 150 },
  {
    field: "checkin",
    headerName: "Present",
    width: 100,
    renderCell: (params) => <Checkbox checked={params.value} disabled />,
  },
  {
    field: "paid",
    headerName: "Paid",
    width: 80,
    renderCell: (params) => <Checkbox checked={params.value} disabled />,
  },
  { field: "mode", headerName: "Mode", width: 100 },
  { field: "fees_paid", headerName: "Fees", width: 100 },
  { field: "appointment_type", headerName: "Type", width: 150 },
  { field: "status", headerName: "Status", width: 100 },
];

export default function PastAppointments() {
  const user = JSON.parse(localStorage.getItem("user"));
  const cabinId = user?.checkupcabindata?.[0]?.id;
  const cabinSlots = user?.checkupcabindata?.[0]?.cabin_slots || [];

  const navigate = useNavigate();
  const location = useLocation();

  const [selectedDate, setSelectedDate] = useState(
    location.state?.selectedDate || new Date()
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [rows, setRows] = useState(location.state?.rows || []);
  const [loading, setLoading] = useState(false);
  const [matchingSlots, setMatchingSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(
    location.state?.selectedSlot || null
  );
  useEffect(() => {
    if (!selectedDate) return;

    // Find matching slots for the selected date
    const selectedDateString = selectedDate.toISOString().split("T")[0]; // Get date in YYYY-MM-DD format
    const slots = cabinSlots
      .filter((slot) => slot.startsWith(selectedDateString))
      .sort((a, b) => a.localeCompare(b));
    setMatchingSlots(slots);
    slots ? setSelectedSlot(slots[0]) : setSelectedSlot(null);
    setRows([]);
  }, [selectedDate]);

  useEffect(() => {
    if (selectedSlot) {
      getAppointments(selectedSlot); // Fetch appointments for the selected slot
    }
  }, [selectedSlot]);

  // Handle slot selection
  const handleSlotClick = (slot) => {
    setSelectedSlot(slot);
    getAppointments(slot); // Fetch appointments for the selected slot
  };

  const handleRowClick = (params) => {
    navigate("/appointment-details", {
      state: {
        appointment: params.row,
        selectedDate,
        selectedSlot,
        rows,
      },
    });
  };

  const getAppointments = async (dateTime) => {
    setLoading(true);
    try {
      const data = await fetchAppointments(cabinId, dateTime);
      if (data.length !== 0) {
        const formattedData = data.map((item) => {
          const [firstName, ...lastNameParts] = item.name.split(" ");
          return {
            id: item.token,
            token: item.token,
            appointment_id: item.appointment_id,
            firstName: firstName || "",
            lastName: lastNameParts.join(" ") || "",
            checkin: item.checkin,
            paid: item.paid,
            status: item.status,
            disease: item.disease !== null ? item.disease : "",
            age: item.patient ? item.patient.age : "",
            phone_number: item.patient ? item.patient.phone_number : "",
            location: item.patient ? item.patient.location : "",
            sex: item.patient?.gender || "",
            guardian: item.patient ? item.patient.guardian : "",
            appointment_type:
              item.appointment_type?.charAt(0).toUpperCase() +
              item.appointment_type?.slice(1).toLowerCase(),
            mode: item.mode || "",
            fees_paid: item.fees_paid || 0,
          };
        });
        setRows(formattedData.sort((a, b) => a.token - b.token));
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   const fetchData = async () => {
  //     setLoading(true);
  //     try {
  //       await new Promise((resolve) => setTimeout(resolve, 500));
  //       const dummyData = generateDummyData(selectedDate);
  //       setRows(dummyData);
  //     } catch (error) {
  //       console.error("Error loading appointments:", error);
  //     }
  //     setLoading(false);
  //   };

  //   fetchData();
  // }, [selectedDate]);

  // Filter rows based on search query
  const filteredRows = rows.filter((row) =>
    Object.keys(row).some((field) => {
      const value = row[field]?.toString().toLowerCase();
      return value?.includes(searchQuery.toLowerCase());
    })
  );

  // Summary calculations
  const totals = React.useMemo(
    () => ({
      totalCollection: rows.reduce((sum, row) => sum + (row.fees_paid || 0), 0),
      totalPatients: rows.length,
      totalCheckedIn: rows.filter((row) => row.checkin).length,
      totalPending: rows.filter((row) => row.status === "pending").length,
      totalCompleted: rows.filter((row) => row.status === "done_checkup")
        .length,
      cashTotal: rows
        .filter((row) => row.mode === "cash")
        .reduce((sum, row) => sum + (row.fees_paid || 0), 0),
      onlineTotal: rows
        .filter((row) => row.mode === "online")
        .reduce((sum, row) => sum + (row.fees_paid || 0), 0),
    }),
    [rows]
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div
        style={{
          height: "90vh",
          width: "96%",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header Section */}
        <Box
          sx={{
            mb: 2,
            p: 2,
            border: "1px solid #e0e0e0",
            borderRadius: 1,
            backgroundColor: "#fafafa",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 4,
          }}
        >
          {/* Summary Section - Left Side */}
          <Box
            sx={{
              flex: 2,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                Total Patients
              </Typography>
              <Typography variant="h6">{totals.totalPatients}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                Pending
              </Typography>
              <Typography variant="h6">{totals.totalPending}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                Total Collection
              </Typography>
              <Typography variant="h6">₹{totals.totalCollection}</Typography>
            </Box>
          </Box>

          {/* Search and Date Picker - Right Side */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              alignItems: "center",
              flex: 1,
              justifyContent: "flex-end",
            }}
          >
            <TextField
              label="Search Patients"
              variant="outlined"
              size="small"
              sx={{ width: 250 }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <DatePicker
              label="Select Date"
              value={selectedDate}
              onChange={(newDate) => setSelectedDate(newDate)}
              maxDate={new Date()}
              renderInput={(params) => (
                <TextField {...params} size="small" sx={{ width: 200 }} />
              )}
            />
            {loading && <CircularProgress size={24} />}
          </Box>
          {matchingSlots.length > 0 && (
            <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
              {matchingSlots.map((slot, index) => (
                <Button
                  key={slot}
                  variant={selectedSlot === slot ? "contained" : "outlined"}
                  onClick={() => handleSlotClick(slot)}
                >
                  Slot {index + 1}
                </Button>
              ))}
            </Box>
          )}
        </Box>

        {/* Data Grid Container */}
        <div style={{ flex: 1, minHeight: 0 }}>
          <DataGrid
            rows={filteredRows}
            columns={columns}
            loading={loading}
            components={{
              Toolbar: GridToolbar,
            }}
            onRowClick={handleRowClick}
            sx={{
              "& .MuiDataGrid-virtualScroller": {
                overflow: "auto",
                minHeight: "200px",
              },
              "& .MuiDataGrid-columnHeaders": {
                position: "sticky",
                top: 0,
                backgroundColor: "#f5f5f5",
                zIndex: 1,
              },
              height: "100%",
              cursor: "pointer",
            }}
            getRowClassName={(params) => {
              if (params.row.status === "cancelled") return "cancelled-row";
              if (params.row.status === "done_checkup")
                return "done-checkup-row";
              return "";
            }}
          />
        </div>
      </div>
    </LocalizationProvider>
  );
}
