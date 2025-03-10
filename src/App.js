import React,  { useContext, useEffect, useState, useCallback, createContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Box } from "@mui/material";
import { AuthContext } from "./context/AuthContext";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import BottomNavigator from "./components/BottomNavigator";
import Home from "./Pages/Home";
import AddAppointment from "./Pages/AddAppointment";
import PatientDetails from "./Pages/PatientDetails";
import Login from "./Pages/Login";
import PrivateRoute from "./components/PrivateRoute";
import Help from "./Pages/Help";
import RoleBasedRoute from "./components/RolebasedRoute";
import AppointmentTable from "./Pages/AppointmentTable";
import PrescriptionPage from "./Pages/PrescriptionPage";
import { EventSource } from "eventsource";
import AddAppointmentMobile from "./Pages/AddAppointmentMobile";
import MobileAppointmentTable from "./Pages/MobileAppointmentTable";
import PastAppointmentsPage from "./Pages/PastAppointments";
import { Navigate } from "react-router-dom";

import PrescriptionTablePage from "./Pages/Prescriptiondemo";

import AppointmentDetails from "./Pages/AppointmentDetails";

import {
  fetchPatients,
  fetchCurrentPosition,
  markPatientAsDone,
  markPatientAsLate,
  shufflePatientPosition,
  addAppointment,
} from "./services/api";

import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme/theme';
import Dashboard from './Pages/Dashboard';
import { getLatestCabinSlot } from './utils/dateUtils';
import PatientInfoPage from './Pages/PatientInfoPage';
import ConsultationPage from './Pages/ConsultationPage';
import DemoBanner from './components/DemoBanner';
import PDFViewer from './components/PDFViewer';
import usePDFViewer from './hooks/usePDFViewer';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const App = () => {
  const { user } = useContext(AuthContext);
  const isMobile = window.innerWidth <= 768;
  const [currentPosition, setCurrentPosition] = useState(1);
  const [patients, setPatients] = useState([]);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentCabinSlot, setCurrentCabinSlot] = useState("2024-03-10T09:00:00.000Z");
  const { pdfViewerState, openPdfViewer, closePdfViewer } = usePDFViewer();

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        // Import dummy data service dynamically to avoid circular dependencies
        const { fetchDummyPatients, fetchDummyCurrentPosition } = await import('./services/dummyDataService');
        
        // Fetch dummy patients
        const dummyPatients = await fetchDummyPatients();
        setPatients(dummyPatients);
        
        // Fetch dummy current position
        const { current_number } = await fetchDummyCurrentPosition();
        setCurrentPosition(current_number);
      } catch (error) {
        console.error("Error loading dummy data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchInitialData();
    }
  }, [user]);

  useEffect(() => {
    if (patients.length > 0 && currentPosition !== null) {
      const current = patients.find((p) => p.position === currentPosition);
      setCurrentPatient(current || null);
    }
  }, [patients, currentPosition]);

  useEffect(() => {
    if (!user) return;
    
    // Simulate real-time updates every 30 seconds
    const updateInterval = setInterval(() => {
      // Randomly update a patient's status (e.g., check-in status)
      if (patients.length > 0) {
        const randomIndex = Math.floor(Math.random() * patients.length);
        const updatedPatients = [...patients];
        
        // Toggle checkin status for a random patient
        updatedPatients[randomIndex] = {
          ...updatedPatients[randomIndex],
          checkin: !updatedPatients[randomIndex].checkin
        };
        
        setPatients(updatedPatients);
      }
    }, 30000); // 30 seconds
    
    return () => clearInterval(updateInterval);
  }, [user, patients]);

  const fetchPatientsData = useCallback(async () => {
    setLoading(true);
    try {
      // Import dummy data service
      const { fetchDummyPatients } = await import('./services/dummyDataService');
      
      // Fetch dummy patients
      const dummyPatients = await fetchDummyPatients();
      setPatients(dummyPatients);
    } catch (error) {
      console.error("Error fetching dummy patients:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCurrentPositionData = useCallback(async () => {
    setLoading(true);
    try {
      // Import dummy data service
      const { fetchDummyCurrentPosition } = await import('./services/dummyDataService');
      
      // Fetch dummy current position
      const { current_number } = await fetchDummyCurrentPosition();
      setCurrentPosition(current_number);
      return current_number;
    } catch (error) {
      console.error("Error fetching dummy current position:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleNextPatient = async (id) => {
    // Import dummy data service
    const { dummyMarkPatientAsDone } = await import('./services/dummyDataService');
    
    // Mark patient as done
    const result = await dummyMarkPatientAsDone(id);
    
    // Update local state
    if (result.success) {
      // Find the patient with the given appointment ID
      const patientIndex = patients.findIndex(p => p.appointment.appointment_id === id);
      
      if (patientIndex !== -1) {
        const updatedPatients = [...patients];
        updatedPatients[patientIndex] = {
          ...updatedPatients[patientIndex],
          status: "done_checkup"
        };
        
        setPatients(updatedPatients);
        
        // Move to next patient
        if (currentPosition < patients.length) {
          setCurrentPosition(currentPosition + 1);
        }
      }
    }
    
    return result;
  };

  const handleLatePatient = async (id) => {
    // Import dummy data service
    const { dummyMarkPatientAsLate } = await import('./services/dummyDataService');
    
    // Mark patient as late
    const result = await dummyMarkPatientAsLate(id);
    
    // Update local state
    if (result.success) {
      // Find the patient with the given appointment ID
      const patientIndex = patients.findIndex(p => p.appointment.appointment_id === id);
      
      if (patientIndex !== -1) {
        const updatedPatients = [...patients];
        updatedPatients[patientIndex] = {
          ...updatedPatients[patientIndex],
          status: "late"
        };
        
        setPatients(updatedPatients);
      }
    }
    
    return result;
  };

  const shufflePosition = async (payload) => {
    // Import dummy data service
    const { dummyShufflePatientPosition } = await import('./services/dummyDataService');
    
    // Shuffle patient position
    const result = await dummyShufflePatientPosition(payload);
    
    // Update local state
    if (result.success) {
      // Find the patient with the given appointment ID
      const patientIndex = patients.findIndex(p => p.appointment.appointment_id === payload.appointment_id);
      const targetPosition = payload.new_position;
      
      if (patientIndex !== -1) {
        const updatedPatients = [...patients];
        
        // Update positions
        const oldPosition = updatedPatients[patientIndex].position;
        
        // Update all patients' positions accordingly
        updatedPatients.forEach(patient => {
          if (oldPosition < targetPosition && patient.position > oldPosition && patient.position <= targetPosition) {
            patient.position--;
          } else if (oldPosition > targetPosition && patient.position < oldPosition && patient.position >= targetPosition) {
            patient.position++;
          }
        });
        
        // Update the moved patient's position
        updatedPatients[patientIndex].position = targetPosition;
        
        // Sort by position
        updatedPatients.sort((a, b) => a.position - b.position);
        
        setPatients(updatedPatients);
      }
    }
  };

  const addNewAppointment = async (pid, disease, appointmentType) => {
    // Import dummy data service
    const { dummyAddAppointment } = await import('./services/dummyDataService');
    
    // Add new appointment
    const result = await dummyAddAppointment({
      patientId: pid,
      disease: disease,
      appointment_type: appointmentType
    });
    
    // Update local state
    if (result.success && result.appointment) {
      const newPatient = {
        appointment: result.appointment,
        paid: false,
        checkin: false,
        status: "pending",
        position: patients.length + 1,
        patient: {
          age: Math.floor(20 + Math.random() * 50),
          gender: Math.random() > 0.5 ? "M" : "F",
          phone_number: `9${Math.floor(Math.random() * 1000000000)}`,
          location: "Demo City",
          guardian: "NULL"
        }
      };
      
      setPatients([...patients, newPatient]);
    }
    
    return result;
  };

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
          {user !== null && (
            <Header 
              patients={patients || []} 
              closeEventSource={() => {}} 
            />
          )}
          <Box
            sx={{
              display: "flex",
              flex: 1,
              overflow: "hidden",
            }}
          >
            {!isMobile && user !== null && <Sidebar />}
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                padding: "6px",
                height: "100%",
                width: "100%",
                overflowY: "auto",
                marginBottom: "200px",
              }}
            >
              <Routes>
                <Route
                  path="/login"
                  element={user ? <Navigate to="/" replace /> : <Login />}
                />
                <Route
                  path="/"
                  element={
                    <PrivateRoute>
                      <Dashboard 
                        patients={patients}
                        setPatients={setPatients}
                        currentPosition={currentPosition}
                        loading={loading}
                        handleNextPatient={handleNextPatient}
                        handleLatePatient={handleLatePatient}
                        shufflePosition={shufflePosition}
                        fetchPatientsData={fetchPatientsData}
                      />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/appointments"
                  element={
                    <PrivateRoute>
                      <AppointmentTable 
                        fetchPatientsData={fetchPatientsData}
                        currentCabinSlot={currentCabinSlot}
                      />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/past-appointments"
                  element={
                    <PrivateRoute>{<PastAppointmentsPage />}</PrivateRoute>
                  }
                />
                <Route
                  path="/prescription"
                  element={
                    <PrivateRoute>
                      {/* <PrescriptionTablePage /> */}
                      <PrescriptionPage />
                    </PrivateRoute>
                  }
                />

<Route
                  path="/patient-info"
                  element={
                    <PrivateRoute>
                      <PatientInfoPage />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/appointment-details"
                  element={
                    <PrivateRoute>
                      <AppointmentDetails />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/help"
                  element={
                    <PrivateRoute>
                      <Help />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/add-appointment"
                  element={
                    <PrivateRoute>
                      <AddAppointmentMobile patients={patients} />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/mobile-appointments"
                  element={
                    <PrivateRoute>
                      <MobileAppointmentTable />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/queue"
                  element={
                    <PrivateRoute>
                      <Home
                        currentPosition={currentPosition}
                        setCurrentPosition={setCurrentPosition}
                        patients={patients}
                        setPatients={(patients) => setPatients(patients)}
                        handleNextPatient={handleNextPatient}
                        handleLatePatient={(id, pos) => handleLatePatient(id, pos)}
                        shufflePosition={(payload) => shufflePosition(payload)}
                        loading={loading}
                        fetchPatientsData={fetchPatientsData}
                      />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/consultation"
                  element={
                    <PrivateRoute>
                      <ConsultationPage />
                    </PrivateRoute>
                  }
                />
                
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </Box>
          </Box>
          {user !== null && isMobile && <BottomNavigator />}
          
          {/* Add Demo Banner */}
          <DemoBanner />
          
          {/* Add PDF Viewer */}
          <PDFViewer 
            open={pdfViewerState.open}
            onClose={closePdfViewer}
            pdfUrl={pdfViewerState.pdfUrl}
            title={pdfViewerState.title}
          />
        </Box>
      </Router>
    </ThemeProvider>
  );
};

// Export the PDF viewer context to make it available throughout the app
export const PDFViewerContext = React.createContext({
  openPdfViewer: () => {},
  closePdfViewer: () => {}
});

// Create a PDF viewer provider component
export const PDFViewerProvider = ({ children }) => {
  const pdfViewerHook = usePDFViewer();
  
  return (
    <PDFViewerContext.Provider value={pdfViewerHook}>
      {children}
      <PDFViewer 
        open={pdfViewerHook.pdfViewerState.open}
        onClose={pdfViewerHook.closePdfViewer}
        pdfUrl={pdfViewerHook.pdfViewerState.pdfUrl}
        title={pdfViewerHook.pdfViewerState.title}
      />
    </PDFViewerContext.Provider>
  );
};

export default App;
