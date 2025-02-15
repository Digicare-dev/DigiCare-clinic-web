import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Box,
  Paper,
} from "@mui/material";
import { putData } from "../services/apiService";
import styles from "./PatientDetails.module.css";

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

export default function PatientDetails({ currentPatient, handleNextPatient }) {
  const [doctorsRemark, setDoctorsRemark] = useState("");
  const [showNextPatientMessage, setShowNextPatientMessage] = useState(false);

  useEffect(() => {
    if (currentPatient) {
      setShowNextPatientMessage(false);
    }
  }, [currentPatient]);

  const addDoctorsRemark = async () => {
    const payload = {
      appointment_id: currentPatient.appointment_id,
      remarks: doctorsRemark,
    };
    await putData("queueinfo/add-remarks/", payload);
    setDoctorsRemark("");
    setShowNextPatientMessage(true);
  };

  return (
    <Box className={styles.patientDetailsContainer}>
      {currentPatient != null && (
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
                  <strong>Age:</strong> {currentPatient.age}
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
                <Button
                  variant="contained"
                  color="primary"
                  onClick={addDoctorsRemark}
                  fullWidth
                  className={styles.nextButton}
                >
                  Add Remarks
                </Button>
              </div>
            </div>
            {showNextPatientMessage && (
              <Typography
                variant="body1"
                color="textSecondary"
                align="center"
                style={{ marginTop: "20px" }}
              >
                The next patient will enter shortly.
              </Typography>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
