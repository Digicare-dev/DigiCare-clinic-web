import * as React from "react";
import { useEffect } from "react";
import "./AppointmentTable.css";
import {
  DataGrid,
  GridToolbar,
  GridEditInputCell,
  GridEditSingleSelectCell,
} from "@mui/x-data-grid";
import {
  Button,
  Modal,
  Box,
  TextField,
  Alert,
  Typography,
  FormControlLabel,
  Checkbox,
  ToggleButtonGroup,
  ToggleButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  CircularProgress,
  Autocomplete,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import Tooltip from "@mui/material/Tooltip";
import {
  fetchAppointments,
  addAppointment,
  updateAppointmentDetails,
  removeAppointment,
} from "../services/api";

import CustomSnackbar from "../components/CustomSnackbar";

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

const CustomNoRowsOverlay = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
    }}
  >
    <Typography variant="h6">Currently no patients</Typography>
  </div>
);

function generateDisplayRows(actualRows) {
  if (actualRows.length === 0) return [];

  const tokens = actualRows.map((row) => row.token);
  const minToken = Math.min(...tokens);
  const maxToken = Math.max(...tokens);

  const allTokens = Array.from(
    { length: maxToken - minToken + 1 },
    (_, i) => minToken + i
  );

  const tokenMap = new Map(actualRows.map((row) => [row.token, row]));

  return allTokens.map((token) => {
    const existing = tokenMap.get(token);
    return (
      existing || {
        id: token,
        token: token,
        appointment_id: "",
        firstName: "",
        lastName: "",
        checkin: false,
        paid: false,
        status: "",
        disease: "",
        age: "",
        phone_number: "",
        location: "",
        sex: "",
        guardian: "",
        appointment_type: "",
        isPlaceholder: true,
      }
    );
  });
}

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function AppointmentTable() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [isAdding, setIsAdding] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState("");
  const [newAppointment, setNewAppointment] = React.useState({
    id: "",
    token: "",
    appointment_id: "",
    firstName: "",
    lastName: "",
    checkin: false,
    paid: false,
    status: "pending",
    disease: "",
    age: "",
    phone_number: "",
    location: "",
    sex: "",
    guardian: "",
    appointment_type: "New",
  });

  const [showCollectionDetails, setShowCollectionDetails] =
    React.useState(false);

  const totalCollection = React.useMemo(
    () =>
      rows
        .filter((row) => row.paid)
        .reduce((sum, row) => sum + (row.fees_paid || 0), 0),
    [rows]
  );

  const totalPatients = React.useMemo(
    () => rows.filter((row) => !row.isPlaceholder).length,
    [rows]
  );

  const totalCheckedIn = React.useMemo(
    () => rows.filter((row) => row.checkin && !row.isPlaceholder).length,
    [rows]
  );

  const totalPending = React.useMemo(
    () =>
      rows.filter((row) => row.status === "pending" && !row.isPlaceholder)
        .length,
    [rows]
  );

  const totalCompleted = React.useMemo(
    () =>
      rows.filter((row) => row.status === "done_checkup" && !row.isPlaceholder)
        .length,
    [rows]
  );

  const cashTotal = React.useMemo(
    () =>
      rows
        .filter((row) => row.paid && row.mode === "cash")
        .reduce((sum, row) => sum + (row.fees_paid || 0), 0),
    [rows]
  );

  const onlineTotal = React.useMemo(
    () =>
      rows
        .filter((row) => row.paid && row.mode === "online")
        .reduce((sum, row) => sum + (row.fees_paid || 0), 0),
    [rows]
  );

  const genderOptions = [
    { value: "M", label: "Male" },
    { value: "F", label: "Female" },
    { value: "O", label: "Other" },
  ];

  const [suggestedToken, setSuggestedToken] = React.useState();
  const [editConfirmationOpen, setEditConfirmationOpen] = React.useState(false);
  const [pendingRow, setPendingRow] = React.useState(null);
  const [originalRow, setOriginalRow] = React.useState(null);
  const [cancelConfirmationOpen, setCancelConfirmationOpen] =
    React.useState(false);
  const [rowToCancel, setRowToCancel] = React.useState(null);

  const [isUpdating, setIsUpdating] = React.useState(false);
  const [isCanceling, setIsCanceling] = React.useState(false);

  const [paginationModel, setPaginationModel] = React.useState({
    page: 0,
    pageSize: 50,
  });

  const [snackbar, setSnackbar] = React.useState({
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

  const displayedRows = React.useMemo(() => generateDisplayRows(rows), [rows]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    const doctorId = user.checkupcabindata[0].id;
    const slotTime = user.checkupcabindata[0].cabin_slots[0];
    const date = new Date(slotTime);
    const formattedDate = date
      .toISOString()
      .replace(".000", "")
      .replace("T", " ")
      .replace("Z", "+00:00");
    const encodedDate = encodeURIComponent(formattedDate);
    const sseUrl = `${API_BASE_URL}/doctorinfo/queue_updates/${doctorId}/${encodedDate}`;

    const eventSource = new EventSource(sseUrl, { withCredentials: true });

    eventSource.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.appointment) {
          setRows((prevRows) => {
            // Handle null patient data safely
            const patientData = data.appointment.patient || {};
            const formattedAppointment = {
              id: data.appointment.token,
              token: data.appointment.token,
              appointment_id: data.appointment.appointment_id,
              firstName: data.appointment.name.split(" ")[0] || "",
              lastName:
                data.appointment.name.split(" ").slice(1).join(" ") || "",
              checkin: data.appointment.checkin,
              paid: data.appointment.paid,
              status: data.appointment.status,
              disease: data.appointment.disease || "",
              age: patientData.age || "",
              phone_number: patientData.phone_number || "",
              location: patientData.location || "",
              sex: patientData.gender || "",
              guardian: patientData.guardian || "",
              appointment_type: data.appointment.appointment_type,
              mode: data.appointment.mode || "",
              fees_paid: data.appointment.fees_paid || 0,
            };

            const existingIndex = prevRows.findIndex(
              (r) => r.appointment_id === data.appointment.appointment_id
            );

            if (existingIndex !== -1) {
              const newRows = [...prevRows];
              newRows[existingIndex] = formattedAppointment;
              return newRows;
            }

            return [...prevRows, formattedAppointment].sort(
              (a, b) => a.token - b.token
            );
          });
        }
      } catch (error) {
        // console.error("Error processing appointment update:", error);
      }
    };

    return () => eventSource.close();
  }, []);

  const getAppointments = async () => {
    setLoading(true);
    try {
      const data = await fetchAppointments(
        user.checkupcabindata[0].id,
        user.checkupcabindata[0].cabin_slots[0]
      );
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

        setRows(formattedData);
        setLoading(false);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  React.useEffect(() => {
    getAppointments();
  }, []);

  React.useEffect(() => {
    if (rows.length > 0) {
      const maxToken = Math.max(...rows.map((r) => r.token));
      setSuggestedToken(maxToken + 1);
    } else {
      setSuggestedToken(1);
    }
  }, [rows]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setError("");
    resetForm();
  };

  const resetForm = () => {
    setNewAppointment({
      id: "",
      token: "",
      appointment_id: "",
      firstName: "",
      lastName: "",
      checkin: false,
      paid: false,
      mode: "cash",
      fee_paids: 0,
      status: "pending",
      disease: "",
      age: "",
      phone_number: "",
      location: "",
      sex: "",
      guardian: "",
      appointment_type: "New",
    });
  };

  const columns = [
    {
      field: "token",
      headerName: "Token",
      width: 90,
      editable: false,
      renderCell: (params) => (
        <div
          style={{
            fontWeight: params.row.isPlaceholder ? 300 : 600,
            color: params.row.isPlaceholder ? "#666" : "#1976d2",
          }}
        >
          #{params?.row?.token || ""}
        </div>
      ),
    },
    {
      field: "firstName",
      headerName: "First Name",
      width: 100,
      editable: true,
      renderCell: (params) => {
        if (params.row.isPlaceholder)
          return (
            <span style={{ color: "#666", fontStyle: "italic" }}>
              Empty Slot
            </span>
          );
        return <span>{params.value || "N/A"}</span>;
      },
    },
    {
      field: "lastName",
      headerName: "Last Name",
      width: 100,
      editable: true,
      renderCell: (params) => {
        if (params.row.isPlaceholder)
          return (
            <span style={{ color: "#666", fontStyle: "italic" }}>
              Empty Slot
            </span>
          );
        return <span>{params.value || "N/A"}</span>;
      },
    },
    {
      field: "age",
      headerName: "Age",
      width: 70,
      editable: true,
      renderCell: (params) =>
        params.row.isPlaceholder ? (
          <span style={{ color: "#999", fontStyle: "italic" }}>N/A</span>
        ) : (
          params.value
        ),
    },
    {
      field: "phone_number",
      headerName: "Mobile",
      width: 120,
      editable: true,
      renderEditCell: (params) => (
        <GridEditInputCell
          {...params}
          slotProps={{
            input: {
              maxLength: 10,
              type: "tel",
              pattern: "[0-9]{10}",
              inputMode: "numeric",
              style: { padding: "8px" },
            },
          }}
        />
      ),
      renderCell: (params) =>
        params.row.isPlaceholder ? (
          <span style={{ color: "#999", fontStyle: "italic" }}>N/A</span>
        ) : (
          params.value
        ),
    },
    {
      field: "location",
      headerName: "Place",
      width: 150,
      editable: true,
      renderCell: (params) =>
        params.row.isPlaceholder ? (
          <span style={{ color: "#999", fontStyle: "italic" }}>N/A</span>
        ) : (
          params.value
        ),
    },
    {
      field: "sex",
      headerName: "Gender",
      editable: true,
      valueFormatter: ({ value }) =>
        genderOptions.find((opt) => opt.value === value)?.label || value,
      renderEditCell: (params) => (
        <Autocomplete
          options={genderOptions}
          getOptionLabel={(option) => option.label}
          value={
            genderOptions.find((opt) => opt.value === params.value) || null
          }
          onChange={(_, newValue) =>
            params.api.setEditCellValue({
              id: params.id,
              field: params.field,
              value: newValue?.value,
            })
          }
          renderInput={(params) => <TextField {...params} variant="outlined" />}
        />
      ),
    },
    {
      field: "checkin",
      headerName: "Check-in",
      width: 80,
      type: "boolean",
      editable: true,
      renderCell: (params) =>
        params.row.isPlaceholder ? (
          <span style={{ color: "#999", fontStyle: "italic" }}>N/A</span>
        ) : (
          <Checkbox checked={params?.value} disabled />
        ),
    },
    {
      field: "disease",
      headerName: "Disease",
      width: 150,
      editable: true,
      renderCell: (params) =>
        params.row.isPlaceholder ? (
          <span style={{ color: "#999", fontStyle: "italic" }}>N/A</span>
        ) : (
          params.value
        ),
    },
    {
      field: "guardian",
      headerName: "Guardian",
      width: 150,
      editable: true,
      renderCell: (params) =>
        params.row.isPlaceholder ? (
          <span style={{ color: "#999", fontStyle: "italic" }}>N/A</span>
        ) : (
          params.value
        ),
    },
    {
      field: "appointment_type",
      headerName: "Type",
      width: 100,
      type: "singleSelect",
      valueOptions: ["New", "Follow-up", "Emergency", "Routine"],
      editable: true,
      valueFormatter: ({ value }) =>
        value
          ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
          : "",
      renderCell: (params) =>
        params.row.isPlaceholder ? (
          <span style={{ color: "#999", fontStyle: "italic" }}>N/A</span>
        ) : (
          params.value
        ),
    },
    {
      field: "paid",
      headerName: "Payment",
      width: 80,
      type: "boolean",
      editable: true,
      renderCell: (params) =>
        params.row.isPlaceholder ? (
          <span style={{ color: "#999", fontStyle: "italic" }}>N/A</span>
        ) : (
          <Checkbox checked={params?.value} disabled />
        ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 100,
      editable: true,
      renderCell: (params) =>
        params.row.isPlaceholder ? (
          <span style={{ color: "#999", fontStyle: "italic" }}>N/A</span>
        ) : (
          params.value
        ),
    },
    {
      field: "fees_paid",
      headerName: "Fees",
      width: 100,
      editable: true,
      type: "number",
      renderCell: (params) => {
        if (params.row.isPlaceholder) return "N/A";
        return params.value;
      },
    },
    {
      field: "mode",
      headerName: "Payment Mode",
      width: 130,
      editable: true,
      type: "singleSelect",
      valueOptions: ["cash", "online"],
      renderCell: (params) => {
        if (params.row.isPlaceholder) return "N/A";
        return params.value
          ? params.value.charAt(0).toUpperCase() + params.value.slice(1)
          : "";
      },
    },

    {
      field: "action",
      headerName: "Action",
      width: 80,
      renderCell: (params) => {
        if (
          params.row.status === "cancelled" ||
          params.row.status === "done_checkup" ||
          params.row.isPlaceholder
        ) {
          return null;
        }
        return (
          <Tooltip title="Cancel Appointment">
            <DeleteIcon
              style={{ cursor: "pointer", color: "#d32f2f" }}
              onClick={() => handleCancelAppointment(params.row)}
            />
          </Tooltip>
        );
      },
    },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone_number" && value.length > 10) {
      return;
    }

    setNewAppointment((prev) => ({ ...prev, [name]: value }));
  };

  const handleSexChange = (event, newSex) => {
    if (newSex !== null) {
      setNewAppointment((prev) => ({ ...prev, sex: newSex }));
    }
  };

  const validateToken = (token) => {
    return !rows.some((row) => row.token === parseInt(token));
  };

  const AddAppointmentApi = async (newEntry) => {
    try {
      const payload = {
        cabinId: user.checkupcabindata[0].id,
        slot: user.checkupcabindata[0].cabin_slots[0],
        name: `${newEntry.firstName} ${newEntry.lastName}`.trim(),
        token: newEntry.token,
        paid: newEntry.paid,
        checkin: newEntry.checkin,
        mode: newEntry.mode || "",
        fees_paid: newEntry.fees_paid || 0,
      };

      if (newEntry.age) payload.age = newEntry.age;
      if (newEntry.phone_number) payload.phone_number = newEntry.phone_number;
      if (newEntry.location) payload.location = newEntry.location;
      if (newEntry.appointment_type)
        payload.appointment_type = newEntry.appointment_type;
      if (newEntry.disease) payload.disease = newEntry.disease;
      if (newEntry.guardian) payload.guardian = newEntry.guardian;
      if (newEntry.sex) payload.gender = newEntry.sex || null;

      await addAppointment(payload);
      await getAppointments();
      const itemsPerPage = paginationModel.pageSize;
      const newPage = Math.floor((newEntry.token - 1) / itemsPerPage);

      setPaginationModel((prev) => ({
        ...prev,
        page: newPage,
      }));
    } catch (error) {
      console.error(error);
    }
  };

  const updateAppointmentApi = async (newData) => {
    try {
      const payload = {
        token: newData.token,
        appointment_id: newData.appointment_id,
        name: `${newData.firstName} ${newData.lastName}`.trim().toUpperCase(),
        checkin: newData.checkin,
        paid: newData.paid,
        status: newData.status,
        disease: newData.disease,
        age: newData.age,
        phone_number: newData.phone_number,
        location: newData.location,
        gender: newData.sex || null,
        guardian: `${newData.guardian}`.toUpperCase(),
        appointment_type: newData.appointment_type,
        mode: newData.mode || "",
        fees_paid: newData.fees_paid || 0,
      };

      await updateAppointmentDetails(payload);
    } catch (error) {
      console.error("Failed to update appointment:", error);
      throw error;
    }
  };

  const handleAddAppointment = () => {
    const trimmedFirstName = newAppointment.firstName.trim();
    const trimmedLastName = newAppointment.lastName.trim();

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
      !/^\d{10}$/.test(newAppointment.phone_number)
    ) {
      setError("Invalid mobile number (10 digits required)");
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

    setRows((prev) => [...prev, newEntry].sort((a, b) => a.token - b.token));

    setIsAdding(true);
    AddAppointmentApi(newEntry)
      .then(() => {
        handleOpenSnackbar("Appointment added successfully");
        handleClose();
      })
      .catch(() => {
        handleOpenSnackbar("Failed to add appointment", "error");
      })
      .finally(() => {
        setIsAdding(false);
      });
  };

  const processRowUpdate = React.useCallback(
    (newRow, originalRow) => {
      return new Promise((resolve, reject) => {
        if (newRow.sex && !["M", "F", "O"].includes(newRow.sex)) {
          reject(new Error("Invalid gender value"));
          return;
        }

        // Validate mobile number format

        if (newRow.phone_number?.toString().length > 10) {
          reject(new Error("Mobile number cannot exceed 10 digits"));
          return;
        }

        if (newRow.phone_number && !/^\d+$/.test(newRow.phone_number)) {
          return;
        }

        const changed = JSON.stringify(newRow) !== JSON.stringify(originalRow);
        if (changed) {
          setPendingRow(newRow);
          setOriginalRow(originalRow);
          setEditConfirmationOpen(true);

          setPendingRow((prev) => ({
            ...prev,
            resolve: (value) => {
              resolve(value);
              setEditConfirmationOpen(false);
            },
            reject: (error) => {
              reject(error);
              setEditConfirmationOpen(false);
            },
          }));
        } else {
          resolve(originalRow);
        }
      });
    },
    [rows]
  );

  const handleConfirmEdit = async () => {
    setIsUpdating(true);
    try {
      await updateAppointmentApi(pendingRow);
      handleOpenSnackbar("Appointment updated successfully");

      // Update local state
      setRows((prev) =>
        prev.map((row) =>
          row.id === pendingRow.id
            ? { ...pendingRow, id: pendingRow.token }
            : row
        )
      );

      pendingRow.resolve(pendingRow);
    } catch (error) {
      // Revert changes on error
      setRows((prev) =>
        prev.map((row) => (row.id === originalRow.id ? originalRow : row))
      );
      pendingRow.reject(originalRow);
      handleOpenSnackbar("Failed to update appointment", "error");
    } finally {
      setIsUpdating(false);
      setEditConfirmationOpen(false);
    }
  };

  const handleCancelEdit = () => {
    pendingRow.reject(originalRow);
  };

  const columnsWithPlaceholders = React.useMemo(
    () =>
      columns.map((col) => ({
        ...col,
        editable: col.editable ? (params) => !params.row.isPlaceholder : false,
      })),
    []
  );

  const handleCancelAppointment = (row) => {
    setRowToCancel(row);
    setCancelConfirmationOpen(true);
  };

  const cancelAppointment = async () => {
    setIsCanceling(true);
    try {
      const payload = {
        appointment_id: rowToCancel.appointment_id,
      };
      const response = await removeAppointment(payload);
      await getAppointments();
      const removedId = response.removed_appointment_id;
      if (removedId) {
        const updatedRows = rows.map((r) => {
          if (r.appointment_id === removedId) {
            return { ...r, status: "cancelled" };
          }
          return r;
        });
        setRows(updatedRows);
        setCancelConfirmationOpen(false);
        handleOpenSnackbar("Appointment cancelled successfully");
      }
    } catch (error) {
      handleOpenSnackbar("Failed to cancel appointment", "error");
      throw error;
    } finally {
      setIsCanceling(false);
    }
  };

  const isCellEditable = (params) => {
    return true;
  };

  const getRowClassName = (params) => {
    if (params.row.isPlaceholder) {
      return "placeholder-row";
    }
    if (params.row.status === "cancelled") {
      return "cancelled-row";
    }
    if (params.row.status === "done_checkup") {
      return "done-checkup-row";
    }
    return "data-row";
  };

  return (
    <div
      style={{
        height: "80vh",
        width: "95%",
        padding: "8px",
        minWidth: "600px",
        maxWidth: "95%",
      }}
    >
      <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
        <Button onClick={handleOpen} variant="contained">
          New Appointment
        </Button>

        <Button
          variant="outlined"
          onClick={() => setShowCollectionDetails(!showCollectionDetails)}
          sx={{
            ml: 2,
            backgroundColor: showCollectionDetails ? "#f0f0f0" : "transparent",
            "&:hover": { backgroundColor: "#f5f5f5" },
          }}
        >
          <Typography variant="subtitle1" fontWeight="600">
            Summary
          </Typography>
        </Button>
      </Box>

      {showCollectionDetails && (
        <Box
          sx={{
            mb: 2,
            p: 2,
            border: "1px solid #e0e0e0",
            borderRadius: 1,
            backgroundColor: "#fafafa",
            display: "flex",
            gap: 4,
            flexWrap: "wrap",
          }}
        >
          {/* Payment Breakdown */}
          <Box>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Payment Breakdown
            </Typography>
            <Typography variant="body1">
              Total Collection: ₹{totalCollection}
            </Typography>
            <Typography variant="body1">Cash: ₹{cashTotal}</Typography>
            <Typography variant="body1">Online: ₹{onlineTotal}</Typography>
          </Box>

          {/* Appointment Statistics */}
          <Box>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Appointment Statistics
            </Typography>
            <Typography variant="body1">
              Total Patients: {totalPatients}
            </Typography>
            <Typography variant="body1">
              Checked-In: {totalCheckedIn}
            </Typography>
            <Typography variant="body1">Pending: {totalPending}</Typography>
            <Typography variant="body1">Completed: {totalCompleted}</Typography>
          </Box>

          {/* Additional Metrics (Optional) */}
          <Box>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Additional Metrics
            </Typography>
            <Typography variant="body1">
              New Appointments:{" "}
              {rows.filter((row) => row.appointment_type === "New").length}
            </Typography>
            <Typography variant="body1">
              Follow-ups:{" "}
              {
                rows.filter((row) => row.appointment_type === "Follow-up")
                  .length
              }
            </Typography>
            <Typography variant="body1">
              Emergencies:{" "}
              {
                rows.filter((row) => row.appointment_type === "Emergency")
                  .length
              }
            </Typography>
          </Box>
        </Box>
      )}

      <div
        style={{
          width: "100%",
          height: "100%",
          overflowY: "auto",
          overflowX: "auto",
        }}
      >
        <DataGrid
          onProcessRowUpdateError={(error) => {
            alert(error.message);
          }}
          rows={displayedRows}
          columns={columnsWithPlaceholders}
          isCellEditable={isCellEditable}
          slots={{ toolbar: GridToolbar, noRowsOverlay: CustomNoRowsOverlay }}
          editMode="row"
          processRowUpdate={processRowUpdate}
          experimentalFeatures={{ newEditingApi: true }}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50]}
          getRowClassName={(params) => {
            const classes = getRowClassName(params);
            return classes;
          }}
          sortModel={[{ field: "token", sort: "asc" }]}
          loading={loading}
          sx={{
            // height: 600,
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#f5f5f5",
              borderBottom: "2px solid #e0e0e0",
              fontWeight: "bold",
              fontSize: "0.875rem",
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: 600,
            },
            "& .MuiDataGrid-cell:focus": { outline: "none" },
            "& .MuiDataGrid-columnHeader:focus": { outline: "none" },
            "& .MuiDataGrid-cell": {
              borderBottom: "1px solid #f0f0f0",
              whiteSpace: "normal !important",
              wordWrap: "break-word",
            },
            "& .MuiDataGrid-columnHeader": {
              maxWidth: "100% !important",
            },
            "& .MuiDataGrid-row": {
              maxWidth: "100% !important",
            },
          }}
          // density="compact"
        />
      </div>

      <Dialog open={editConfirmationOpen} onClose={handleCancelEdit}>
        <DialogTitle>Confirm Changes</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to update this patient's details?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelEdit}>Cancel</Button>
          <Button
            onClick={handleConfirmEdit}
            color="primary"
            variant="contained"
            disabled={isUpdating}
          >
            {isUpdating ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Confirm"
            )}{" "}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={cancelConfirmationOpen}
        onClose={() => setCancelConfirmationOpen(false)}
      >
        <DialogTitle>Cancel Appointment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this appointment?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelConfirmationOpen(false)}>No</Button>
          <Button
            onClick={cancelAppointment}
            color="primary"
            variant="contained"
            disabled={isCanceling}
          >
            {isCanceling ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Yes"
            )}{" "}
          </Button>
        </DialogActions>
      </Dialog>

      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            New Appointment
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

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
              helperText={`Suggested token: ${suggestedToken}`}
            />
            <FormControl fullWidth>
              <InputLabel>Appointment Type *</InputLabel>
              <Select
                name="appointmentType"
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
              label="First Name"
              name="firstName"
              value={newAppointment.firstName}
              onChange={handleInputChange}
              required
            />
            <TextField
              label="Last Name"
              name="lastName"
              value={newAppointment.lastName}
              onChange={handleInputChange}
              required
            />
            <TextField
              label="Mobile"
              name="phone_number"
              value={newAppointment.phone_number}
              onChange={handleInputChange}
              slotProps={{ input: { maxLength: 10 } }}
              fullWidth
              helperText="Enter mobile number to enable additional fields"
            />
            <TextField
              label="Age"
              name="age"
              type="number"
              value={newAppointment.age}
              onChange={handleInputChange}
              disabled={!newAppointment.phone_number}
            />
            <FormControl component="fieldset">
              <ToggleButtonGroup
                value={newAppointment.sex}
                exclusive
                onChange={handleSexChange}
                color="primary"
                disabled={!newAppointment.phone_number}
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
              label="Disease"
              name="disease"
              value={newAppointment.disease}
              onChange={handleInputChange}
            />
            <TextField
              label="Guardian"
              name="guardian"
              value={newAppointment.guardian}
              onChange={handleInputChange}
              disabled={!newAppointment.phone_number}
            />
            {/* Place TextField moved here */}
            <TextField
              label="Place"
              name="location"
              value={newAppointment.location}
              onChange={handleInputChange}
            />
            <Box sx={{ display: "flex", alignItems: "center" }}>
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
                label="Check-in"
                sx={{ display: "block", mb: 2 }}
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
                        fees_paid: e.target.checked ? 250 : 0,
                      }))
                    }
                  />
                }
                label="Payment"
                sx={{ display: "block", mb: 2 }}
              />
            </Box>{" "}
            {newAppointment.paid && (
              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
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
              </Box>
            )}
          </div>

          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={handleClose} sx={{ mr: 2 }} disabled={isAdding}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleAddAppointment}
              disabled={isAdding}
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
    </div>
  );
}
