import React, { useEffect, useState } from "react";
import { 
  Box, 
  Typography, 
  Container,
  useMediaQuery,
  CircularProgress,
  Divider
} from "@mui/material";
import QueueContainer from "../components/QueueContainer";
import BottomNavigator from "../components/BottomNavigator";
import { 
  fetchPatients, 
  fetchCurrentPosition,
  markPatientAsDone,
  markPatientAsLate,
  shufflePatientPosition
} from "../services/api";

const MobileQueuePage = () => {
  const [patients, setPatients] = useState([]);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const patientsData = await fetchPatients();
      const currentPositionData = await fetchCurrentPosition();
      
      setPatients(patientsData);
      setCurrentPosition(currentPositionData.position);
    } catch (error) {
      console.error("Error fetching initial data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNextPatient = async (id) => {
    try {
      await markPatientAsDone(id);
      fetchInitialData(); // Refresh data after marking patient as done
    } catch (error) {
      console.error("Error marking patient as done:", error);
    }
  };

  const handleLatePatient = async (id) => {
    try {
      await markPatientAsLate(id);
      fetchInitialData(); // Refresh data after marking patient as late
    } catch (error) {
      console.error("Error marking patient as late:", error);
    }
  };

  const shufflePosition = async (payload) => {
    try {
      await shufflePatientPosition(payload);
      fetchInitialData(); // Refresh data after shuffling position
    } catch (error) {
      console.error("Error shuffling position:", error);
    }
  };

  return (
    <Box sx={{ pb: 7 }}>
      {/* Mobile-specific Header */}
      <Box sx={{ 
        p: 2, 
        backgroundColor: "#f5f5f5", 
        position: "sticky", 
        top: 0, 
        zIndex: 10,
        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)"
      }}>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Patient Queue
        </Typography>
        {currentPosition !== null && (
          <Typography variant="body2" color="text.secondary">
            Current Position: {currentPosition}
          </Typography>
        )}
      </Box>
      
      <Divider />

      <Container maxWidth="sm" sx={{ pt: 2, height: "calc(100vh - 120px)" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", pt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <QueueContainer
            loading={loading}
            patients={patients}
            setPatients={setPatients}
            currentPosition={currentPosition}
            handleNextPatient={handleNextPatient}
            handleLatePatient={handleLatePatient}
            shufflePosition={shufflePosition}
          />
        )}
      </Container>

      {/* Fixed Bottom Navigator */}
      <BottomNavigator />
    </Box>
  );
};

export default MobileQueuePage; 