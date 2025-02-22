import * as React from "react";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "./AppointmentTable.module.css";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import Tooltip from "@mui/material/Tooltip";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const initialRows = [
  {
    id: 1,
    token: 1,
    firstName: "John",
    lastName: "Doe",
    age: 25,
    mobile: "1234567890",
    place: "New York",
    payment: false,
    status: "waiting",
  },
];

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
        token,
        isPlaceholder: true,
        firstName: "",
        lastName: "",
        age: "",
        mobile: "",
        place: "",
        sex: "",
        checkedIn: false,
        disease: "",
        guardian: "",
        appointmentType: "New",
      }
    );
  });
}

export default function AppointmentTable() {
  const { user } = useContext(AuthContext);

  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState("");
  const [newAppointment, setNewAppointment] = React.useState({
    token: "",
    firstName: "",
    lastName: "",
    age: "",
    mobile: "",
    place: "",
    sex: "",
    checkedIn: false,
    disease: "",
    guardian: "",
    appointmentType: "New",
    payment: false,
    status: "waiting",
  });
  const [suggestedToken, setSuggestedToken] = React.useState();
  const [editConfirmationOpen, setEditConfirmationOpen] = React.useState(false);
  const [pendingRow, setPendingRow] = React.useState(null);
  const [originalRow, setOriginalRow] = React.useState(null);
  const [cancelConfirmationOpen, setCancelConfirmationOpen] =
    React.useState(false);
  const [rowToCancel, setRowToCancel] = React.useState(null);

  const displayedRows = React.useMemo(() => generateDisplayRows(rows), [rows]);

  React.useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${API_BASE_URL}/queueinfo/appointment-list/${user.checkupcabindata[0].id}/${user.checkupcabindata[0].cabin_slots[0]}`,
          { withCredentials: true }
        );
        setRows(response.data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchAppointments();

    setTimeout(() => {
      setRows(initialRows);
      setLoading(false);
    }, 300);
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
      token: "",
      firstName: "",
      lastName: "",
      age: "",
      mobile: "",
      place: "",
      sex: "",
      checkedIn: false,
      disease: "",
      guardian: "",
      appointmentType: "New",
      payment: false,
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
      headerName: "Full Name",
      width: 200,
      renderCell: (params) => {
        if (params.row.isPlaceholder)
          return (
            <span style={{ color: "#666", fontStyle: "italic" }}>
              Empty Slot
            </span>
          );
        const firstName = params?.row?.firstName?.trim() || "";
        const lastName = params?.row?.lastName?.trim() || "";
        return <span>{`${firstName} ${lastName}`.trim() || "N/A"}</span>;
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
      field: "mobile",
      headerName: "Mobile",
      width: 120,
      editable: true,
      renderCell: (params) =>
        params.row.isPlaceholder ? (
          <span style={{ color: "#999", fontStyle: "italic" }}>N/A</span>
        ) : (
          params.value
        ),
    },
    {
      field: "place",
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
      headerName: "Sex",
      width: 100,
      type: "singleSelect",
      valueOptions: ["male", "female", "other"],
      editable: true,
      renderCell: (params) =>
        params.row.isPlaceholder ? (
          <span style={{ color: "#999", fontStyle: "italic" }}>N/A</span>
        ) : (
          <span style={{ color: "#1976d2", fontWeight: 600 }}>
            {params?.value?.toUpperCase() || ""}
          </span>
        ),
    },
    {
      field: "checkedIn",
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
      field: "appointmentType",
      headerName: "Type",
      width: 100,
      type: "singleSelect",
      valueOptions: ["New", "Follow-up", "Emergency", "Routine"],
      editable: true,
      renderCell: (params) =>
        params.row.isPlaceholder ? (
          <span style={{ color: "#999", fontStyle: "italic" }}>N/A</span>
        ) : (
          params.value
        ),
    },
    {
      field: "payment",
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
      field: "action",
      headerName: "Action",
      width: 100,
      renderCell: (params) => (
        <Tooltip title="Cancel Appointment">
          <DeleteIcon
            style={{ cursor: "pointer", color: "#d32f2f" }}
            onClick={() => {
              handleCancelAppointment(params.row);
            }}
          />
        </Tooltip>
      ),
    },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
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
        cabinId: 1,
        slot: "2025-02-26 18:00:00",
        name: `${newEntry.firstName} ${newEntry.lastName}`,
        token: newEntry.token,
      };

      if (newEntry.age) payload.age = newEntry.age;
      if (newEntry.mobile) payload.phone_number = newEntry.mobile;
      if (newEntry.place) payload.location = newEntry.place;
      if (newEntry.appointmentType)
        payload.appointment_type = newEntry.appointmentType;
      if (newEntry.disease) payload.disease = newEntry.disease;
      if (newEntry.guardian) payload.guardian = newEntry.guardian;
      if (newEntry.sex) payload.gender = newEntry.sex;
      if (newEntry.checkedIn) payload.checkin = newEntry.checkedIn;
      if (newEntry.payment) payload.paid = newEntry.payment;

      await axios.post(`${API_BASE_URL}/queueinfo/appointment-add/`, payload);
    } catch (error) {
      console.error(error);
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
    if (newAppointment.mobile && !/^\d{10}$/.test(newAppointment.mobile)) {
      setError("Invalid mobile number (10 digits required)");
      return;
    }

    const newEntry = {
      id: parseInt(newAppointment.token),
      ...newAppointment,
      firstName: trimmedFirstName,
      lastName: trimmedLastName,
      token: parseInt(newAppointment.token),
      age: newAppointment.age || null,
      mobile: newAppointment.mobile || null,
      place: newAppointment.place || null,
      payment: newAppointment.payment,
      status: newAppointment.status,
    };

    setRows((prev) => [...prev, newEntry].sort((a, b) => a.token - b.token));

    AddAppointmentApi(newEntry);

    handleClose();
  };

  const processRowUpdate = React.useCallback(
    (newRow, originalRow) => {
      return new Promise((resolve, reject) => {
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

  const handleConfirmEdit = () => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === pendingRow.id ? { ...pendingRow, id: pendingRow.token } : row
      )
    );
    pendingRow.resolve(pendingRow);
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

  return (
    <div
      style={{
        height: "80vh",
        width: "95%",
        padding: "8px",
        overflow: "auto !important",
      }}
    >
      <Button onClick={handleOpen} variant="contained" sx={{ mb: 2 }}>
        New Appointment
      </Button>

      {!loading && (
        <div
          style={{
            width: "100%",
            height: "100%",
          }}
        >
          <DataGrid
            rows={displayedRows}
            columns={columnsWithPlaceholders}
            slots={{ toolbar: GridToolbar }}
            editMode="row"
            processRowUpdate={processRowUpdate}
            experimentalFeatures={{ newEditingApi: true }}
            getRowClassName={(params) =>
              params.row.isPlaceholder
                ? "placeholder-row"
                : params.row.status === "cancelled"
                ? "cancelled-row"
                : "data-row"
            }
            sortModel={[{ field: "token", sort: "asc" }]}
            sx={{
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#f5f5f5",
                borderBottom: "2px solid #e0e0e0",
                fontWeight: "bold",
                fontSize: "0.875rem",
              },
              "& .MuiDataGrid-columnHeaderTitle": {
                fontWeight: 600,
              },
              "& .placeholder-row": {
                backgroundColor: "#fafafa",
                color: "#666",
                fontStyle: "italic",
                borderBottom: "1px dashed #e0e0e0",
                "&:hover": {
                  backgroundColor: "#f5f5f5",
                },
              },
              "& .data-row": {
                backgroundColor: "#fff",
                "&:hover": {
                  backgroundColor: "#f5f5f5",
                },
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
            loading={loading}
            autoPageSize
            density="compact"
          />
        </div>
      )}

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
          >
            Confirm
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
            onClick={() => {
              setRows((prev) =>
                prev.map((row) =>
                  row.id === rowToCancel.id
                    ? { ...row, status: "cancelled" }
                    : row
                )
              );
              setCancelConfirmationOpen(false);
            }}
            color="primary"
            variant="contained"
          >
            Yes
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
                value={newAppointment.appointmentType}
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
              label="Age"
              name="age"
              type="number"
              value={newAppointment.age}
              onChange={handleInputChange}
            />

            <TextField
              label="Mobile"
              name="mobile"
              value={newAppointment.mobile}
              onChange={handleInputChange}
              inputProps={{ maxLength: 10 }}
            />

            <FormControl component="fieldset">
              <ToggleButtonGroup
                value={newAppointment.sex}
                exclusive
                onChange={handleSexChange}
                aria-label="sex"
              >
                <ToggleButton value="male" color="primary">
                  Male
                </ToggleButton>
                <ToggleButton value="female" color="secondary">
                  Female
                </ToggleButton>
                <ToggleButton value="other">Other</ToggleButton>
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
            />

            {/* Place TextField moved here */}
            <TextField
              label="Place"
              name="place"
              value={newAppointment.place}
              onChange={handleInputChange}
            />

            <Box sx={{ display: "flex", alignItems: "center" }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newAppointment.checkedIn}
                    onChange={(e) =>
                      setNewAppointment((prev) => ({
                        ...prev,
                        checkedIn: e.target.checked,
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
                    checked={newAppointment.payment}
                    onChange={(e) =>
                      setNewAppointment((prev) => ({
                        ...prev,
                        payment: e.target.checked,
                      }))
                    }
                  />
                }
                label="Payment"
                sx={{ display: "block", mb: 2 }}
              />
            </Box>
          </div>

          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={handleClose} sx={{ mr: 2 }}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleAddAppointment}>
              Add Appointment
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
}
