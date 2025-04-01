import React,  { useContext, useEffect, useState, useCallback, createContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Box } from "@mui/material";
import { AuthContext } from "./context/AuthContext";
import { AppointmentFormProvider } from "./context/AppointmentFormContext";
import NotificationProvider from "./context/NotificationContext";
import GlobalSnackbar from "./components/GlobalSnackbar";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import BottomNavigator from "./components/BottomNavigator";
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import PrivateRoute from "./components/PrivateRoute";
import Help from "./Pages/Help";
import RoleBasedRoute from "./components/RolebasedRoute";
import AppointmentTable from "./Pages/AppointmentTable";
import PrescriptionPage from "./Pages/PrescriptionPage";
import { EventSource } from "eventsource";
import AddAppointmentMobile from "./Pages/AddAppointmentMobile";
import MobileAppointmentTable from "./Pages/MobileAppointmentTable";
import MobileQueuePage from "./Pages/MobileQueuePage";
import PastAppointmentsPage from "./Pages/PastAppointments";
import { Navigate } from "react-router-dom";
import AppointmentForm from "./components/AppointmentForm";
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
import { getLatestCabinSlot, getCabinInfoFromUser } from './utils/dateUtils';
import PatientInfoPage from './Pages/PatientInfoPage';
import ConsultationPage from './Pages/ConsultationPage';
import PDFViewer from './components/PDFViewer';
import usePDFViewer from './hooks/usePDFViewer';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const App = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  
  // Extract cabin information using the new utility function
  const { cabinId, selectedSlot } = getCabinInfoFromUser(user);
  
  const isMobile = window.innerWidth <= 768;
  const [currentPosition, setCurrentPosition] = useState(1);
  const [patients, setPatients] = useState([]);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentCabinSlot, setCurrentCabinSlot] = useState("2024-03-10T09:00:00.000Z");
  const { pdfViewerState, openPdfViewer, closePdfViewer } = usePDFViewer();
  
  // Get user from AuthContext instead of localStorage to ensure re-renders
  const { user: authUser } = useContext(AuthContext);
  
  // Use authUser for conditional rendering
  const currentUser = authUser || user;

  // Declare eventSource at component level
  let eventSource;

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {        
        const patients = await fetchPatients(cabinId, selectedSlot);
        console.log(patients);
        setPatients(patients);
        
        const { current_number } = await fetchCurrentPosition(cabinId, selectedSlot);
        setCurrentPosition(current_number);
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (cabinId && selectedSlot) {
      fetchInitialData();
    }
  }, [cabinId, selectedSlot, currentUser]);

  useEffect(() => {
    if (patients.length > 0 && currentPosition !== null) {
      const current = patients.find((p) => p.position === currentPosition);
      setCurrentPatient(current || null);
    }
  }, [patients, currentPosition]);


  // Add SSE for real-time queue updates
  useEffect(() => {
    if (!cabinId || loading) return;

    const date = new Date(selectedSlot);
    const formattedDate = date
      .toISOString()
      .replace(".000", "")
      .replace("T", " ")
      .replace("Z", "+00:00");
    const encodedDate = encodeURIComponent(formattedDate);
    const sseUrl = `${API_BASE_URL}/doctorinfo/queue_updates/${cabinId}/${encodedDate}`;

    let reconnectAttempt = 0;
    let reconnectTimer = null;
    let eventSource = null;
    
    const connectEventSource = () => {
      // Close existing connection if any
      if (eventSource) {
        eventSource.close();
      }
      
      eventSource = new EventSource(sseUrl, { withCredentials: true });

      eventSource.onmessage = (event) => {
        try {
          const parsedData = JSON.parse(event.data);

          // console.log("SSE Data:", parsedData);
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
          console.error("Error processing SSE data:", error);
        }
      };

      eventSource.onerror = (error) => {
        console.error("SSE connection error:", error);
        eventSource.close();
        
        // Calculate delay with exponential backoff, capped at 30 seconds
        const delay = Math.min(1000 * (2 ** reconnectAttempt), 30000);
        reconnectAttempt++;
        
        console.log(`Attempting to reconnect in ${delay/1000} seconds...`);
        reconnectTimer = setTimeout(() => {
          console.log('Reconnecting to SSE...');
          connectEventSource();
        }, delay);
      };

      return eventSource;
    };
    
    // Initial connection
    eventSource = connectEventSource();

    // Handle visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Tab is now visible, checking SSE connection state');
        // Only reconnect if the connection is closed or in an error state
        if (!eventSource || eventSource.readyState === EventSource.CLOSED) {
          console.log('SSE connection needs to be re-established');
          reconnectAttempt = 0; // Reset reconnection attempt counter
          eventSource = connectEventSource();
        } else {
          console.log('SSE connection is already active, no need to reconnect');
        }
      }
    };

    // Listen for visibility change events
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup on unmount
    return () => {
      if (eventSource) {
        eventSource.close();
        console.log("SSE connection cleaned up");
      }
      
      // Clear any pending reconnect timer on unmount
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [cabinId, selectedSlot, currentUser]);

  const handleNextPatient = async (id) => {    
      const result = await markPatientAsDone(id);
      return result;
  };

  const handleLatePatient = async (id) => {
    const result = await markPatientAsLate(id);
    return result;
  };

  const shufflePosition = async (payload) => {
    
    const result = await shufflePatientPosition(payload);
    return result;
  };

  // const addNewAppointment = async (pid, disease, appointmentType) => {
    
    
  //   const result = await dummyAddAppointment({
  //     patientId: pid,
  //     patientName: patientProfile ? patientProfile.fullName : "Unknown Patient",
  //     disease: disease,
  //     appointment_type: appointmentType,
  //     phone_number: patientProfile ? patientProfile.phone_number : "",
  //     age: patientProfile ? patientProfile.age : "",
  //     gender: patientProfile ? patientProfile.gender : "",
  //     location: patientProfile ? patientProfile.address : "",
  //     guardian: patientProfile ? patientProfile.emergencyContact : ""
  //   });
    
  //   // Update local state with the latest patients from dummyPatients
  //   if (result.success && result.appointment) {
  //     // Get the latest patients from the dummyPatients array
  //     setPatients([...dummyPatients]);
  //     return result;
  //   }
    
  //   return { success: false };
  // };

  return (
    <AppointmentFormProvider>
      <NotificationProvider>
        <ThemeProvider theme={theme}>
          <Router>
            <AppointmentForm />
            <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
              {currentUser !== null && (
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
                {!isMobile && currentUser !== null && <Sidebar />}
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
                      element={currentUser ? (
                        isMobile ? 
                          <Navigate to="/mobile-queue" replace /> : 
                          <Navigate to="/" replace />
                      ) : <Login />}
                    />
                    <Route
                      path="/"
                      element={
                        <PrivateRoute>
                          {isMobile ? (
                            <Navigate to="/mobile-queue" replace />
                          ) : (
                            // <Dashboard 
                            //   patients={patients}
                            //   setPatients={setPatients}
                            //   currentPosition={currentPosition}
                            //   loading={loading}
                            //   handleNextPatient={handleNextPatient}
                            //   handleLatePatient={handleLatePatient}
                            //   shufflePosition={shufflePosition}
                            // />
                            <Navigate to="/queue" replace />
                          )}
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/appointments"
                      element={
                        <PrivateRoute>
                          <AppointmentTable 
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
                    <Route
                      path="/mobile-queue"
                      element={
                        <PrivateRoute>
                          <MobileQueuePage 
                            patientsData={patients} 
                            currentPositionData={currentPosition} 
                            loading={loading}
                          />
                        </PrivateRoute>
                      }
                    />
                    
                    <Route path="*" element={<Navigate to="/login" replace />} />
                  </Routes>
                </Box>
              </Box>
              {currentUser !== null && isMobile && <BottomNavigator />}
              
              {/* Global appointment form - available from anywhere */}
              <AppointmentForm />
              
              {/* PDF Viewer for reports/prescriptions */}
              {pdfViewerState.isOpen && (
                <PDFViewer
                  url={pdfViewerState.pdfUrl}
                  onClose={closePdfViewer}
                  title={pdfViewerState.title}
                />
              )}
            </Box>
            <GlobalSnackbar />
          </Router>
        </ThemeProvider>
      </NotificationProvider>
    </AppointmentFormProvider>
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
