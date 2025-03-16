import React, { useEffect, useState } from "react";
import { 
  Box, 
  Typography, 
  Container,
  useMediaQuery,
  CircularProgress,
  Divider,
  IconButton,
  Tooltip
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import QueueContainer from "../components/QueueContainer";
import BottomNavigator from "../components/BottomNavigator";
import { 
  markPatientAsDone,
  markPatientAsLate,
  shufflePatientPosition
} from "../services/api";
import "./MobileQueuePage.css";
import { getCabinInfo } from "../utils/dateUtils";
import fixMobilePatientItems from "../components/MobilePatientItemFix";

const MobileQueuePage = ({ patientsData, currentPositionData, onDataChange }) => {
  const [patients, setPatients] = useState([]);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const user = JSON.parse(localStorage.getItem("user"));
  const {cabinId, selectedSlot} = getCabinInfo(user);
  
  // Update local state when props change
  useEffect(() => {
    if (patientsData) {
      setPatients(patientsData);
      
      // Only set dataLoaded to true if we actually have patients data
      if (patientsData.length > 0) {
        setDataLoaded(true);
        setLoading(false);
      }
    }
    
    if (currentPositionData !== undefined) {
      setCurrentPosition(currentPositionData);
    }
    
    // Fix mobile patient items when data is updated
    if (patientsData && patientsData.length > 0) {
      setTimeout(fixMobilePatientItems, 300);
    }
  }, [patientsData, currentPositionData]);

  // Handle initial loading state
  useEffect(() => {
    // Set a timeout to hide loader after a minimum display time
    // even if patients array is empty (to avoid infinite loading)
    const timer = setTimeout(() => {
      if (patients.length === 0 && loading && !dataLoaded) {
        setLoading(false);
      }
    }, 5000); // Show loader for at least 5 seconds
    
    return () => clearTimeout(timer);
  }, [loading, patients, dataLoaded]);
  
  // Apply mobile layout fix on mount and window resize
  useEffect(() => {
    fixMobilePatientItems();
    
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setTimeout(fixMobilePatientItems, 300);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNextPatient = async (id) => {
    try {
      setLoading(true);
      await markPatientAsDone(id);
      // Notify parent component to refresh data
      if (onDataChange) onDataChange();
    } catch (error) {
      console.error("Error marking patient as done:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLatePatient = async (id) => {
    try {
      setLoading(true);
      await markPatientAsLate(id);
      // Notify parent component to refresh data
      if (onDataChange) onDataChange();
    } catch (error) {
      console.error("Error marking patient as late:", error);
    } finally {
      setLoading(false);
    }
  };

  const shufflePosition = async (payload) => {
    try {
      setLoading(true);
      await shufflePatientPosition(payload);
      // Notify parent component to refresh data
      if (onDataChange) onDataChange();
    } catch (error) {
      console.error("Error shuffling position:", error);
    } finally {
      setLoading(false);
    }
  };

  // If not mobile, display a message suggesting to use desktop view
  if (!isMobile) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        p: 3,
        textAlign: 'center'
      }}>
        <Typography variant="h5">
          This page is optimized for mobile devices. Please use a mobile device or resize your browser window.
        </Typography>
      </Box>
    );
  }

  // Determine if we should show the loader
  const showLoader = loading || (!dataLoaded && patients.length === 0);

  return (
    <Box sx={{ pb: 6, width: '100%', maxWidth: '100%' }} className="mobile-queue-page">
      {/* Mobile-specific Header */}
      {/* <Box sx={{ 
        p: 2, 
        backgroundColor: "#f5f5f5", 
        position: "sticky", 
        top: 0, 
        zIndex: 10,
        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%'
      }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: '1rem' }}>
            Patient Queue
          </Typography>
          {currentPosition !== null && (
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              Current Position: {currentPosition}
            </Typography>
          )}
        </Box>
        
        <Tooltip title="Refresh Queue">
          <IconButton 
            onClick={onDataChange}
            color="primary"
            disabled={loading}
            size="small"
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box> */}
      
      <Divider />

      <Container 
        maxWidth={false} 
        disableGutters
        sx={{ 
          pt: 1, 
          height: "calc(100vh - 110px)",
          px: 1,
          width: '100%',
        }}
        className="mobile-container"
      >
        {showLoader ? (
          <Box className="loader-container">
            <CircularProgress size={40} />
            <Typography className="loader-text" variant="body1">
              Loading patient queue...
            </Typography>
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