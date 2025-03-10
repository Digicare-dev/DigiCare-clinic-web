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
// Using dummy data instead of API
// import { fetchAppointments } from "../services/api";

import { useNavigate, useLocation } from "react-router-dom";

// Dummy data generator for fallback
const generateDummyData = (date) => {
  const baseDate = new Date(date);
  return Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    token: (i + 1).toString(),
    appointment_id: `APP-${baseDate.getDate()}${i + 1}`,
    firstName: `Patient${i + 1}`,
    lastName: `Last${i + 1}`,
    checkin: true,
    paid: true,
    status: "done_checkup",
    disease: ["Flu", "Fever", "Injury"][i % 3],
    age: 20 + (i % 40),
    phone_number: `98765432${10 + i}`,
    location: ["City A", "City B", "City C"][i % 3],
    sex: ["M", "F", "O"][i % 3],
    guardian: i % 4 === 0 ? "Guardian Name" : "",
    appointment_type: ["New", "Follow-up", "Emergency"][i % 3],
    mode: ["cash", "online"][i % 2],
    fees_paid: [250, 300, 200][i % 3],
    date: baseDate.toISOString().split('T')[0],
    time: `${9 + Math.floor(i / 2)}:${i % 2 === 0 ? '00' : '30'} AM`,
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

// Key for storing state in sessionStorage
const PAST_APPOINTMENTS_STATE_KEY = 'pastAppointmentsState';

export default function PastAppointments() {
  const user = JSON.parse(localStorage.getItem("user"));
  const cabinId = user?.checkupcabindata?.[0]?.id;
  const cabinSlots = user?.checkupcabindata?.[0]?.cabin_slots || [];

  const navigate = useNavigate();
  const location = useLocation();

  // Initialize state from sessionStorage or defaults
  const [selectedDate, setSelectedDate] = useState(() => {
    const savedState = sessionStorage.getItem(PAST_APPOINTMENTS_STATE_KEY);
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      return parsedState.selectedDate ? new Date(parsedState.selectedDate) : new Date();
    }
    return new Date();
  });
  
  const [searchQuery, setSearchQuery] = useState(() => {
    const savedState = sessionStorage.getItem(PAST_APPOINTMENTS_STATE_KEY);
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      return parsedState.searchQuery || "";
    }
    return "";
  });
  
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [matchingSlots, setMatchingSlots] = useState([]);
  
  const [selectedSlot, setSelectedSlot] = useState(() => {
    const savedState = sessionStorage.getItem(PAST_APPOINTMENTS_STATE_KEY);
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      return parsedState.selectedSlot || null;
    }
    return null;
  });

  // Save state to sessionStorage whenever relevant state changes
  useEffect(() => {
    const stateToSave = {
      selectedDate: selectedDate ? selectedDate.toISOString() : null,
      selectedSlot,
      searchQuery
    };
    sessionStorage.setItem(PAST_APPOINTMENTS_STATE_KEY, JSON.stringify(stateToSave));
  }, [selectedDate, selectedSlot, searchQuery]);

  useEffect(() => {
    if (!selectedDate) return;

    // Find matching slots for the selected date
    const selectedDateString = selectedDate.toISOString().split("T")[0]; // Get date in YYYY-MM-DD format
    
    // For demo, create dummy slots for the selected date
    const dummySlots = [
      `${selectedDateString}T09:00:00.000Z`,
      `${selectedDateString}T14:00:00.000Z`
    ];
    
    setMatchingSlots(dummySlots);
    
    // Only set the selected slot if it's not already set or if it doesn't match the current date
    if (!selectedSlot || !selectedSlot.includes(selectedDateString)) {
      setSelectedSlot(dummySlots[0]); // Always select the first slot
      // Directly fetch appointments for the selected date
      getAppointments(dummySlots[0]);
    } else {
      // If the slot is already set and matches the date, use it
      getAppointments(selectedSlot);
    }
  }, [selectedDate]);

  // Handle date change
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    // The slots and data will be updated by the useEffect that depends on selectedDate
  };

  // Handle search query change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle slot selection
  const handleSlotClick = (slot) => {
    setSelectedSlot(slot);
    getAppointments(slot); // Fetch appointments for the selected slot
  };

  const handleRowClick = (params) => {
    console.log('Row clicked:', params.row);
    // Use the handleAppointmentClick function to format the data correctly
    handleAppointmentClick(params.row);
  };

  const getAppointments = async (dateTime) => {
    setLoading(true);
    try {
      // Import dummy data service dynamically
      const { fetchDummyPastAppointments } = await import('../services/dummyDataService');
      
      // Format date from dateTime string
      const date = new Date(dateTime).toISOString().split('T')[0];
      
      console.log("Fetching past appointments for date:", date); // Debug log
      
      // Fetch dummy past appointments
      const data = await fetchDummyPastAppointments(date);
      
      if (data && data.length !== 0) {
        console.log("Received past appointments data:", data); // Debug log
        
        const formattedData = data.map((item) => {
          const [firstName, ...lastNameParts] = item.name.split(" ");
          return {
            id: item.token,
            token: item.token,
            appointment_id: item.appointment_id,
            firstName: firstName || "",
            lastName: lastNameParts.join(" ") || "",
            checkin: true, // Past appointments were checked in
            paid: true, // Past appointments were paid
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
            date: item.date,
            time: item.time
          };
        });
        
        console.log("Formatted past appointments data:", formattedData); // Debug log
        setRows(formattedData);
      } else {
        console.log("No past appointments data received or empty data array"); // Debug log
        
        // If no data for the selected date, generate some dummy data
        const dummyData = generateDummyData(selectedDate);
        console.log("Generated dummy data:", dummyData); // Debug log
        setRows(dummyData);
      }
    } catch (error) {
      console.error("Error fetching past appointments:", error);
      // If error, generate some dummy data
      const dummyData = generateDummyData(selectedDate);
      console.log("Generated dummy data due to error:", dummyData); // Debug log
      setRows(dummyData);
    } finally {
      setLoading(false);
    }
  };

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

  // Function to handle clicking on an appointment
  const handleAppointmentClick = (appointment) => {
    console.log('Handling appointment click:', appointment);
    
    // Create patient information from the appointment data
    const patientInfo = {
      id: appointment.id,
      name: `${appointment.firstName} ${appointment.lastName}`.trim(),
      age: appointment.age || '',
      gender: appointment.sex === 'M' ? 'Male' : 
              appointment.sex === 'F' ? 'Female' : 'Other',
      phone: appointment.phone_number || '',
      location: appointment.location || 'Not specified',
      guardianName: appointment.guardian !== 'NULL' ? appointment.guardian : '',
      // Add default values for potentially missing fields
      email: '',  // Not in the API data
      bloodGroup: '',  // Not in the API data
    };
    
    // Format appointment information
    const appointmentInfo = {
      id: appointment.appointment_id,
      date: appointment.date || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      time: appointment.time || '09:00 AM',
      status: appointment.status === 'done_checkup' ? 'Completed' : 
              appointment.status === 'pending' ? 'Pending' : 
              appointment.status === 'cancelled' ? 'Cancelled' : 'Unknown',
      type: appointment.appointment_type || 'Consultation',
      reason: appointment.disease || 'Not specified',
      doctor: 'Current Doctor',
      token: appointment.token,
      department: 'General',
      fees: appointment.fees_paid || 0,
      paymentMode: appointment.mode || 'cash',
      paid: appointment.paid === true,
      checkin: appointment.checkin === true,
      notes: appointment.notes || '',
    };
    
    console.log('Navigating to appointment details with:', { appointmentInfo, patientInfo });
    
    // Navigate to appointment details with this data
    navigate('/appointment-details', {
      state: {
        appointmentInfo,
        patientInfo,
        fromPastAppointments: true,
      }
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div
        style={{
          height: "90vh",
          width: "96%",
          margin: "0 auto",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header with Title, Stats, Search, and Date Picker */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            mb: 3,
            gap: 2,
          }}
        >
          {/* Title and Stats - Left Side */}
          <Box>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Past Appointments
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 4,
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
              onChange={handleSearchChange}
            />
            <DatePicker
              label="Select Date"
              value={selectedDate}
              onChange={handleDateChange}
              maxDate={new Date()}
              slotProps={{ textField: { size: 'small', sx: { width: 200 } } }}
            />
            {loading && <CircularProgress size={24} />}
          </Box>
          
          {/* Slot selector */}
          {matchingSlots.length > 0 && (
            <Box sx={{ mb: 2, display: "flex", gap: 2, width: '100%' }}>
              {matchingSlots.map((slot, index) => {
                // Format the time for display
                const slotDate = new Date(slot);
                const timeStr = slotDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                return (
                  <Button
                    key={slot}
                    variant={selectedSlot === slot ? "contained" : "outlined"}
                    onClick={() => handleSlotClick(slot)}
                  >
                    {timeStr}
                  </Button>
                );
              })}
            </Box>
          )}
        </Box>

        {/* DataGrid */}
        <div style={{ flexGrow: 1, width: "100%" }}>
          <DataGrid
            rows={filteredRows}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10, page: 0 },
              },
            }}
            pageSizeOptions={[10, 25, 50]}
            checkboxSelection={false}
            disableRowSelectionOnClick
            onRowClick={handleRowClick}
            loading={loading}
            components={{
              Toolbar: GridToolbar,
            }}
            sx={{
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#f5f5f5",
                borderBottom: "2px solid #e0e0e0",
                fontWeight: "bold",
                fontSize: "0.875rem",
              },
              "& .MuiDataGrid-cell:focus": { outline: "none" },
              "& .MuiDataGrid-columnHeader:focus": { outline: "none" },
              "& .MuiDataGrid-cell": {
                borderBottom: "1px solid #f0f0f0",
                whiteSpace: "normal !important",
                wordWrap: "break-word",
                cursor: "pointer",
              },
            }}
          />
        </div>
      </div>
    </LocalizationProvider>
  );
}
