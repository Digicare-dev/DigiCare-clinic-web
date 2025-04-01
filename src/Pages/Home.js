import React, { useEffect, useState, useRef } from "react";
import { useMediaQuery, ListItem, Typography } from "@mui/material";
import Skeleton from "@mui/material/Skeleton";
import QueueContainer from "../components/QueueContainer";
import { keyframes } from "@emotion/react";
import StatisticsCard from "./StatisticsCard";
import DoctorHeader from "./DoctorHeader";
import { getCabinInfo } from "../utils/dateUtils";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

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
  const [eventSource, setEventSource] = useState(null);

  useEffect(() => {
    console.log('home received patients:', patients);
  }, [patients]);

  useEffect(() => {
    if (patients.length > 0 && currentPosition !== null) {
      const sorted = [...patients].sort((a, b) => a.position - b.position);
      setPatients(sorted);
    }
  }, [currentPosition]);

  // Function to establish SSE connection
  const establishSSEConnection = () => {
    // Get user information
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;
    
    const { cabinId, selectedSlot } = getCabinInfo(user);
    if (!cabinId || !selectedSlot) return;
    
    // Create formatted date for the SSE URL
    const date = new Date(selectedSlot);
    const formattedDate = date
      .toISOString()
      .replace(".000", "")
      .replace("T", " ")
      .replace("Z", "+00:00");
    const encodedDate = encodeURIComponent(formattedDate);
    const sseUrl = `${API_BASE_URL}/doctorinfo/queue_updates/${cabinId}/${formattedDate}`;
    
    // Close existing connection if any
    if (eventSource) {
      eventSource.close();
    }
    
    // Create new connection
    console.log('Establishing SSE connection in Home component');
    const newEventSource = new EventSource(sseUrl, { withCredentials: true });
    setEventSource(newEventSource);
    
    newEventSource.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        
        if (parsedData.queue) {
          // Update the patients array with the new patient data
          setPatients((prevPatients) => {
            const updatedPatient = {
              position: parsedData.queue.position,
              late: parsedData.queue.late || false,
              status: parsedData.queue.status || "pending",
              paid: parsedData.queue.paid || false,
              checkin: parsedData.queue.checkin || false,
              appointment: parsedData.queue.appointment
            };

            // Find if the patient already exists
            const existingIndex = prevPatients.findIndex(
              (p) => p.appointment.appointment_id === parsedData.queue.appointment.appointment_id
            );

            const newPatients = [...prevPatients];
            if (existingIndex !== -1) {
              newPatients[existingIndex] = updatedPatient;
            } else {
              newPatients.push(updatedPatient);
            }
            return newPatients.sort((a, b) => a.position - b.position);
          });
        } else if (parsedData.cabinslot) {
          setCurrentPosition(parsedData.cabinslot.current_number);
        }
      } catch (error) {
        // console.error("Error parsing SSE data:", error);
      }
    };
    
    newEventSource.onerror = (error) => {
      // console.error("EventSource failed:", error);
      newEventSource.close();
    };
    
    return newEventSource;
  };

  // Establish SSE connection when component mounts
  useEffect(() => {
    const newEventSource = establishSSEConnection();
    
    // Clean up function
    return () => {
      if (newEventSource) {
        newEventSource.close();
        console.log("SSE connection closed in Home component");
      }
    };
  }, []); // Empty dependency array means this runs once when component mounts

  // Re-establish SSE connection when the page becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Tab is now visible, checking SSE connection state in Home component');
        // Only establish a new connection if we don't have an active one
        if (!eventSource || eventSource.readyState === EventSource.CLOSED) {
          console.log('Establishing new SSE connection in Home component');
          establishSSEConnection();
        } else {
          console.log('SSE connection is already active in Home component');
        }
      }
    };
    
    // Listen for visibility change events
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Clean up event listener on unmount
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 300px",
        gap: "10px",
        height: "100%",
      }}
    >
      {!loading && patients.length === 0 ? (
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
          <QueueContainer
            loading={loading}
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
