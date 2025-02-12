import "./AddAppointment.css";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { useState } from "react";
import SuccessAlert from "../components/SuccessAlert";
import { postData } from "../services/apiService";

export default function AddAppointment({ addAppointment }) {
  const [otp, setOtp] = useState("");
  const [sentOtp, setSentOtp] = useState(false);
  const [alert, setAlert] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    sex: "",
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
    const payload = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      dob: formData.dob,
      gender: formData.sex,
      phone_number: formData.mobileNumber,
    };
    const response = await postData("userinfo/add-patient/", payload);
    // const result = addAppointment(
    //   response.patient_id,
    //   formData.diseaseDescription
    // );
    setAlert(true);
    setTimeout(() => setAlert(false), 3000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addPatient();
    setFormData({
      firstName: "",
      lastName: "",
      dob: "",
      sex: "",
      mobileNumber: "",
      diseaseDescription: "",
    });
  };

  return (
    <div className="add-appointment-container">
      {alert && (
        <SuccessAlert
          title={"Success"}
          message={"Appointment added successfuly!"}
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
              {/* Date of Birth Field */}
              <TextField
                name="dob"
                label="Date of Birth"
                type="date"
                value={formData.dob}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }} // Keeps label above when date is selected
                style={{ flex: 1, marginRight: "10px" }}
                required
              />
              <FormControl>
                <InputLabel>Sex</InputLabel>
                <Select
                  name="sex"
                  label="Sex"
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
                fullWidth
                required
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
                rows={4}
              />
            </div>

            <button className="custom-button" type="submit">
              Submit
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
