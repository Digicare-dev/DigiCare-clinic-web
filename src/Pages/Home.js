import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
  Button,
  useMediaQuery,
} from "@mui/material";
import QueueContainer from "../components/QueueContainer";
import { keyframes } from "@emotion/react";
import StatisticsCard from "./StatisticsCard";

const fadeIn = keyframes(`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }`);

export default function Home({
  patients,
  currentPosition,
  setCurrentPosition,
  handleNextPatient,
  setPatients,
  handleLatePatient,
  shufflePosition,
}) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const currentPatient = patients[currentPosition - 1];

  const handleMarkLate = () => {
    alert(`Patient ${currentPatient} has been marked as late.`);
  };

  return (
    <div style={styles.container}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <QueueContainer
          patients={patients}
          currentPosition={currentPosition}
          setCurrentPosition={setCurrentPosition}
          handleNextPatient={handleNextPatient}
          setPatients={setPatients}
          handleLatePatient={handleLatePatient}
          shufflePosition={shufflePosition}
        />
        {!isMobile && <StatisticsCard patients={patients} />}
      </div>
    </div>
  );
}

const styles = {
  container: {
    // margin: "auto",
    // marginTop: "20px",
  },
  card: {
    // marginBottom: "20px",
    // width: "80%",
    // margin: "20px auto",
    padding: "10px",
    boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.15)",
    borderRadius: "12px",
    background: "linear-gradient(145deg, #ffffff, #f0f0f0)",
    animation: `${fadeIn} 0.5s ease-in-out`,
  },
  header: {
    display: "flex",
    alignItems: "center",
    marginBottom: "16px",
  },
  avatar: {
    backgroundColor: "#1976d2",
    width: "30px",
    height: "30px",
    marginRight: "12px",
  },
  title: {
    fontWeight: "bold",
  },
  patientName: {
    // fontWeight: "bold",
    marginBottom: "8px",
    color: "#333",
  },
  position: {
    fontSize: "0.875rem",
    color: "#666",
  },
  buttonContainer: {
    display: "flex",
    gap: "16px", // Adds spacing between buttons
    marginTop: "16px",
  },
  button: {
    flex: 1, // Ensures both buttons take equal space
  },
};
