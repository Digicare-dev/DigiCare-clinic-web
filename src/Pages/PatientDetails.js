import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Box,
  Paper,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { putData } from "../services/apiService";
import styles from "./PatientDetails.module.css";

// Utility function to capitalize the first letter of a string
const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

export default function PatientDetails({ currentPatient, handleNextPatient }) {
  const [doctorsRemark, setDoctorsRemark] = useState("");
  const [showNextPatientMessage, setShowNextPatientMessage] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentPatient) {
      setShowNextPatientMessage(false);
    }
  }, [currentPatient]);

  const addDoctorsRemark = async () => {
    setLoading(true);
    const payload = {
      appointment_id: currentPatient.appointment_id,
      remarks: doctorsRemark,
    };
    await putData("queueinfo/add-remarks/", payload);
    setDoctorsRemark("");
    setShowNextPatientMessage(true);
    setSnackbarOpen(true); // Show the success message
    setLoading(false);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const getAge = (dob) => {
    const date = new Date(dob);
    const diffMs = Date.now() - date.getTime();
    const ageDt = new Date(diffMs);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
  };

  return (
    <Box className={styles.patientDetailsContainer}>
      {!showNextPatientMessage && currentPatient ? (
        <Card className={styles.patientDetailsCard}>
          <CardContent>
            <Typography variant="h5" component="div" gutterBottom>
              Patient Details
            </Typography>
            <div className={styles.flexContainer}>
              <Paper className={styles.flexItem}>
                <Typography variant="body1">
                  <strong>Name:</strong>{" "}
                  {capitalizeFirstLetter(currentPatient.first_name)}{" "}
                  {capitalizeFirstLetter(currentPatient.last_name)}
                </Typography>
              </Paper>
              <Paper className={styles.flexItem}>
                <Typography variant="body1">
                  <strong>Guardian:</strong>{" "}
                  {capitalizeFirstLetter(currentPatient.guardian)}
                </Typography>
              </Paper>
              <Paper className={styles.flexItem}>
                <Typography variant="body1">
                  <strong>Age:</strong> {getAge(currentPatient.dob)}
                </Typography>
              </Paper>
              <Paper className={styles.flexItemFullWidth}>
                <Typography variant="body1">
                  <strong>Disease Description:</strong>{" "}
                  {currentPatient.diseaseDescription}
                </Typography>
              </Paper>
              <div className={styles.flexItemFullWidth}>
                <TextField
                  label="Doctor's Remark"
                  value={doctorsRemark}
                  onChange={(e) => setDoctorsRemark(e.target.value)}
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                />
              </div>
              <div className={styles.flexItemFullWidth}>
                {showNextPatientMessage ? (
                  <Typography
                    variant="body1"
                    color="textSecondary"
                    align="center"
                    style={{ marginTop: "20px" }}
                  >
                    The next patient will enter shortly.
                  </Typography>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={addDoctorsRemark}
                    fullWidth
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
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Add Remarks"
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className={styles.patientDetailsCard}>
          <Typography
            variant="body1"
            color="textSecondary"
            align="center"
            style={{ marginTop: "20px" }}
          >
            The next patient will enter shortly.
          </Typography>
        </Card>
      )}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }} // Position the Snackbar
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          sx={{ width: "100%" }}
        >
          Remark added successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
}
