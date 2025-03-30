import React, { useEffect, useState } from "react";
import { 
  Box, 
  Typography, 
  Container,
  useMediaQuery,
  CircularProgress,
  Divider,
  IconButton,
  Tooltip,
  Paper
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

const MobileQueuePage = ({ patientsData, currentPositionData, onDataChange, loading }) => {
  const [patients, setPatients] = useState([]);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [localLoading, setLocalLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const user = JSON.parse(localStorage.getItem("user"));
  const {cabinId, selectedSlot} = getCabinInfo(user);
  
  // Update local state when props change
  useEffect(() => {
    if (patientsData) {
      setPatients(patientsData);
      
      // Mark data as loaded regardless of whether there are patients or not
      setDataLoaded(true);
      setLocalLoading(false);
    }
    
    if (currentPositionData !== undefined) {
      setCurrentPosition(currentPositionData);
    }
    
    // Fix mobile patient items when data is updated
    if (patientsData && patientsData.length > 0) {
      setTimeout(fixMobilePatientItems, 300);
    }
  }, [patientsData, currentPositionData]);

  // Handle initial loading state - Add a backup timeout to ensure loading screen doesn't persist
  useEffect(() => {
    // Set a timeout to hide loader after a maximum time
    // This ensures loading won't stay forever if there's an issue
    const timer = setTimeout(() => {
      if (localLoading) {
        setLocalLoading(false);
        setDataLoaded(true);
      }
    }, 3000); // Max loading time of 3 seconds
    
    return () => clearTimeout(timer);
  }, [localLoading]);
  
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
      setLocalLoading(true);
      await markPatientAsDone(id);
      // Notify parent component to refresh data
      if (onDataChange) onDataChange();
    } catch (error) {
      console.error("Error marking patient as done:", error);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleLatePatient = async (id) => {
    try {
      setLocalLoading(true);
      await markPatientAsLate(id);
      // Notify parent component to refresh data
      if (onDataChange) onDataChange();
    } catch (error) {
      console.error("Error marking patient as late:", error);
    } finally {
      setLocalLoading(false);
    }
  };

  const shufflePosition = async (payload) => {
    try {
      setLocalLoading(true);
      await shufflePatientPosition(payload);
      // Notify parent component to refresh data
      if (onDataChange) onDataChange();
    } catch (error) {
      console.error("Error shuffling position:", error);
    } finally {
      setLocalLoading(false);
    }
  };

  // Calculate queue summary stats
  const queueStats = {
    total: patients.length,
    pending: patients.filter(p => p.status === "pending").length,
    checkedIn: patients.filter(p=> p.status === "pending").filter(p => p.checkin).length,
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

  // Combine prop loading state with local loading state
  const showLoader = loading || localLoading;

  return (
    <Box sx={{ pb: 6, width: '100%', maxWidth: '100%' }} className="mobile-queue-page">
      {/* Queue Summary Section */}
      <Paper elevation={0} sx={{ 
        p: 1.5, 
        m: 1, 
        mb: 0.5, 
        borderRadius: 2,
        background: "transparent",
        display: 'flex',
        flexDirection: 'column',
      }} className="queue-summary">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#475569" }}>
            Queue Summary
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
          <Box sx={{ textAlign: 'center', px: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              Total Today
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
              {loading ? "-" : queueStats.total}
            </Typography>
          </Box>
          
          <Divider orientation="vertical" flexItem />
          
          <Box sx={{ textAlign: 'center', px: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              Pending
            </Typography>
            <Typography variant="body1" color="primary" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
              {loading ? "-" : queueStats.pending}
            </Typography>
          </Box>
          
          <Divider orientation="vertical" flexItem />
          
          <Box sx={{ textAlign: 'center', px: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              Present
            </Typography>
            <Typography variant="body1" color="info.main" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
              {loading ? "-" : queueStats.checkedIn}
            </Typography>
          </Box>
        </Box>
      </Paper>
      
      <Container 
        maxWidth={false} 
        disableGutters
        sx={{ 
          pt: 0.5,
          height: "calc(100vh - 140px)",
          width: '100%',
          overflow: 'hidden',
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
            loading={localLoading}
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