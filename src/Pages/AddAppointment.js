import "./AddAppointment.css";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useState } from "react";
import SuccessAlert from "../components/SuccessAlert";
import { postData } from "../services/apiService";

export default function AddAppointment({ addAppointment }) {
  const [alert, setAlert] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dob: null,
    sex: "",
    guardian: "",
    appointmentType: "P",
    mobileNumber: "",
    diseaseDescription: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const addPatient = async () => {
    setLoading(true);
    const payload = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      dob: formData.dob ? dayjs(formData.dob).format("YYYY-MM-DD") : "",
      gender: formData.sex,
      phone_number: formData.mobileNumber,
      guardian: formData.guardian,
    };
    try {
      const response = await postData("userinfo/add-patient/", payload);
      addAppointment(
        response.patient_id,
        formData.diseaseDescription,
        formData.appointmentType
      );
      setAlert(true);
      setTimeout(() => setAlert(false), 1000);
    } catch (error) {
      console.error("Error adding patient:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addPatient();
    setFormData({
      firstName: "",
      lastName: "",
      dob: null,
      sex: "",
      mobileNumber: "",
      diseaseDescription: "",
      guardian: "",
      appointmentType: "P",
    });
  };

  return (
    <div className="add-appointment-container">
      {alert && (
        <SuccessAlert
          title={"Success"}
          message={"Appointment added successfully!"}
        />
      )}
      {!alert && (
        <div className="form-container">
          <form className="form" onSubmit={handleSubmit}>
            <div className="input-row">
              <TextField
                name="firstName"
                label="First Name"
                value={formData.firstName}
                onChange={handleChange}
                fullWidth
                required
              />
              <TextField
                name="lastName"
                label="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                fullWidth
                required
              />
            </div>

            <div className="input-row">
              <TextField
                name="guardian"
                label="Guardian"
                value={formData.guardian}
                onChange={handleChange}
                fullWidth
                required
              />
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-helper-label">
                  Appointment Type
                </InputLabel>
                <Select
                  name="appointmentType"
                  value={formData.appointmentType}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="P">Patient</MenuItem>
                  <MenuItem value="E">Emergency</MenuItem>
                  <MenuItem value="S">Staff</MenuItem>
                </Select>
              </FormControl>
            </div>

            <div className="input-row">
              {/* Date Picker for Date of Birth */}
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Date of Birth"
                  value={formData.dob}
                  onChange={(newValue) =>
                    setFormData((prev) => ({ ...prev, dob: newValue }))
                  }
                  format="DD-MM-YYYY"
                  required
                />
              </LocalizationProvider>

              {/* Sex Selector with better alignment */}
              {/* <FormControl>
                <InputLabel>Sex</InputLabel>
                <Select
                  name="sex"
                  value={formData.sex}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="M">Male</MenuItem>
                  <MenuItem value="F">Female</MenuItem>
                  <MenuItem value="O">Others</MenuItem>
                </Select>
              </FormControl> */}

              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-helper-label">
                  Sex
                </InputLabel>
                <Select
                  name="sex"
                  value={formData.sex}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="M">Male</MenuItem>
                  <MenuItem value="F">Female</MenuItem>
                  <MenuItem value="O">Others</MenuItem>
                </Select>
              </FormControl>
            </div>

            <div className="input-row">
              <TextField
                name="mobileNumber"
                label="Mobile Number"
                type="tel"
                value={formData.mobileNumber}
                onChange={handleChange}
                required
                inputProps={{ maxLength: 10 }}
              />
            </div>

            <div className="input-row">
              <TextField
                name="diseaseDescription"
                label="Disease Description"
                value={formData.diseaseDescription}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
              />
            </div>

            <div style={{ flex: "1 1 100%" }}>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                sx={{
                  backgroundColor: "#007bff",
                  color: "white",
                  height: "50px",
                  "&:hover": {
                    backgroundColor: "#0066cc",
                  },
                  "&.Mui-disabled": {
                    backgroundColor: "#007bff",
                    color: "white",
                  },
                }}
                disabled={loading}
                fullWidth
              >
                {loading ? (
                  <CircularProgress size={24} color="white" />
                ) : (
                  "Submit"
                )}{" "}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
