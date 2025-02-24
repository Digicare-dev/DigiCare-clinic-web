import React, { useEffect } from "react";
import { useMediaQuery, ListItem, Typography } from "@mui/material";
import Skeleton from "@mui/material/Skeleton";
import QueueContainer from "../components/QueueContainer";
import { keyframes } from "@emotion/react";
import StatisticsCard from "./StatisticsCard";
import DoctorHeader from "./DoctorHeader";
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
  loading,
  fetchPatientsData,
}) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const currentPatient = patients.find((p) => p.position === currentPosition);

  useEffect(() => {
    if (patients.length > 0 && currentPosition !== null) {
      const needsSorting = patients.some((p, index) =>
        index === 0
          ? p.position !== currentPosition
          : p.position <= patients[index - 1].position
      );

      if (needsSorting) {
        const sorted = [...patients].sort((a, b) => a.position - b.position);
        setPatients(sorted);
      }
    }
  }, [currentPosition]);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 300px", // Fixed width for stats card
        gap: "10px",
        height: "100%",
      }}
    >
      {loading ? (
        <div className="queue-container">
          {[...Array(6)].map((_, index) => (
            <ListItem key={index}>
              <Skeleton
                variant="text"
                width="100%"
                height={100}
                sx={{ margin: "-20px" }}
              />
            </ListItem>
          ))}
        </div>
      ) : patients.length === 0 ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            width: "100%",
          }}
        >
          <Typography variant="h6">Currently no patients</Typography>
        </div>
      ) : (
        <div
          style={{ display: "flex", flexDirection: "column", flexGrow: "3" }}
        >
          {!isMobile && <DoctorHeader doctorName="Dr. Amit Mittal" />}{" "}
          {/* Add the DoctorHeader component */}
          <QueueContainer
            patients={patients}
            currentPosition={currentPosition}
            setCurrentPosition={setCurrentPosition}
            handleNextPatient={handleNextPatient}
            setPatients={setPatients}
            handleLatePatient={handleLatePatient}
            shufflePosition={shufflePosition}
            fetchPatientsData={fetchPatientsData}
          />
        </div>
      )}
      {!isMobile && (
        <StatisticsCard
          patients={patients}
          currentPatient={currentPatient}
          loading={loading}
        />
      )}
    </div>
  );
}

const styles = {
  container: {
    // margin: "auto",
    // marginTop: "20px",
    height: "80%",
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
