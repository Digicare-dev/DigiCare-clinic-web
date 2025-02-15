import React from "react";
import { Card, CardContent, Typography, Box, ListItem } from "@mui/material";
import { useState, useEffect } from "react";
import Skeleton from "@mui/material/Skeleton";
import "./StatisticCard.css";

export default function StatisticsCard({ patients, currentPatient, loading }) {
  const [stats, setStats] = useState({
    totalPatientsToday: 0,
    patientsMarkedLate: [],
    patientsDoneTillNow: [],
    averageCheckupTime: "12 mins",
    patientsWaiting: 6,
    estimatedClosingTime: "5:30 PM",
    mostCommonIssue: "Flu",
    doctorAvailability: 3,
  });

  useEffect(() => {
    const checkCurrentPatientLateStatus = () => {
      if (currentPatient) {
        return currentPatient.late ? 1 : 0;
      }
    };

    const updatedStats = {
      totalPatientsToday: patients.length,
      patientsMarkedLate:
        patients.length !== 0
          ? patients.filter((p) => {
              return p.late === true && p.done_checkup === false;
            }).length - checkCurrentPatientLateStatus()
          : 0,
      patientsDoneTillNow: patients.filter((p) => p.done_checkup === true)
        .length,
      averageCheckupTime: "12 mins",
      patientsWaiting:
        patients.length !== 0
          ? patients.length -
            (patients.filter((p) => p.done_checkup === true).length + 1)
          : 0,
      estimatedClosingTime: "5:30 PM",
      mostCommonIssue: "Flu",
      doctorAvailability: 3,
    };

    setStats(updatedStats);
  }, [currentPatient, patients]);

  return (
    <Card sx={styles.card}>
      <CardContent>
        <Typography variant="h6" color="primary" sx={styles.title}>
          Clinic Statistics
        </Typography>

        {/* Statistics Grid */}
        {loading ? (
          [...Array(5)].map((_, index) => (
            <ListItem key={index}>
              <Skeleton variant="text" width="80%" height={60} margin={0} />
            </ListItem>
          ))
        ) : (
          <Box sx={styles.grid}>
            <StatItem
              label="Total Patients Count"
              value={stats.totalPatientsToday}
            />
            <StatItem
              label="Late Patients Count"
              value={stats.patientsMarkedLate}
            />
            <StatItem
              label="Patients Done Till Now"
              value={stats.patientsDoneTillNow}
            />
            {/* <StatItem
            label="Average Checkup Time"
            value={stats.averageCheckupTime}
          /> */}
            <StatItem
              label="Patients Remaining"
              value={stats.patientsWaiting}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

// Reusable component for each statistic item
function StatItem({ label, value }) {
  return (
    <Box sx={styles.statItem}>
      <Typography variant="body2" color="textSecondary">
        {label}
      </Typography>
      <Typography variant="h6" sx={styles.statValue}>
        {value}
      </Typography>
    </Box>
  );
}

const styles = {
  card: {
    marginBottom: "20px",
    marginTop: "0px",
    padding: "0 20px",
    boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.12)",
    borderRadius: "12px",
    background: "linear-gradient(145deg, #ffffff, #f0f0f0)",
    flexGrow: 1,
    margin: "20px 20px 0px 20px",
  },
  title: {
    fontWeight: "bold",
    marginBottom: "16px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
  },
  statItem: {
    textAlign: "center",
    padding: "12px",
    borderRadius: "8px",
    backgroundColor: "#f9f9f9",
    boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.1)",
  },
  statValue: {
    fontWeight: "bold",
    marginTop: "8px",
    color: "#1976d2",
  },
};
