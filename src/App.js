import { useContext, useEffect, useState, useCallback } from "react";
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
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const App = () => {
  const { user } = useContext(AuthContext);
  const isMobile = window.innerWidth <= 768;
  const [currentPosition, setCurrentPosition] = useState(null);
  const [patients, setPatients] = useState([]);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentCabinSlot, setCurrentCabinSlot] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (user?.checkupcabindata?.[0]?.id && currentCabinSlot) {
        console.log('starting')
        setLoading(true);
        try {
          setPatients([]);
          setCurrentPosition(null);

          await fetchPatientsData();
          await fetchCurrentPositionData();
          console.log('apicallscomplete')
        } catch (error) {
          console.error("Initial data fetch error:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchInitialData();
  }, [user?.checkupcabindata?.[0]?.id, currentCabinSlot]);

  let eventSource;

  useEffect(() => {
    if (!user?.checkupcabindata?.[0]?.id || loading) return;

    const doctorId = user.checkupcabindata[0].id;
    const date = new Date(currentCabinSlot);
    const formattedDate = date
      .toISOString()
      .replace(".000", "")
      .replace("T", " ")
      .replace("Z", "+00:00");
    const encodedDate = encodeURIComponent(formattedDate);
    const sseUrl = `${API_BASE_URL}/doctorinfo/queue_updates/${doctorId}/${encodedDate}`;

    eventSource = new EventSource(sseUrl, { withCredentials: true });

    eventSource.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        console.log("SSE Data received:", parsedData);

        if (parsedData.queue) {
          setPatients((prevPatients) => {
            const updatedPatient = {
              appointment: parsedData.queue.appointment,
              paid: parsedData.queue.paid || false,
              checkin: parsedData.queue.checkin || false,
              status: parsedData.queue.status || "pending",
              position: parsedData.queue.position,
            };

            const existingIndex = prevPatients.findIndex(
              (p) => p.appointment.appointment_id === updatedPatient.appointment.appointment_id
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
      // console.error("EventSource failed:", error);
      eventSource.close();
    };

    return () => {
      if (eventSource) {
        eventSource.close();
        // console.log("SSE connection cleaned up");
      }
    };
  }, [user?.checkupcabindata, loading]);

  useEffect(() => {
    if (patients.length > 0 && currentPosition !== null) {
      const current = patients.find((p) => p.position === currentPosition);
      setCurrentPatient(current || null);
    }
  }, [patients, currentPosition]);

  useEffect(() => {
    if (user?.checkupcabindata?.[0]?.cabin_slots) {
      const latestSlot = getLatestCabinSlot(user.checkupcabindata[0].cabin_slots);
      setCurrentCabinSlot(latestSlot);
    }
  }, [user?.checkupcabindata]);

  const fetchPatientsData = useCallback(async () => {
    if (!currentCabinSlot) return;
    
    try {
      setLoading(true);
      console.log('Fetching patients data');
      const data = await fetchPatients(
        user.checkupcabindata[0].id,
        currentCabinSlot
      );
      console.log('Raw patient data:', data);

      if (Array.isArray(data)) {
        data.sort((a, b) => a.position - b.position);
        setPatients(data);
      } else {
        console.error('Received non-array patient data:', data);
        setPatients([]);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }, [user, currentCabinSlot]);

  const fetchCurrentPositionData = useCallback(async () => {
    if (!currentCabinSlot) return;
    
    try {
      setLoading(true);
      const { current_number } = await fetchCurrentPosition(
        user.checkupcabindata[0].id,
        currentCabinSlot
      );

      setCurrentPosition(current_number);
      return current_number;
    } catch (error) {
      console.error("Error fetching current position:", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 200);
    }
  }, [user, currentCabinSlot]);

  const handleNextPatient = async (id) => {
    const result = await markPatientAsDone(id);
    return result;
  };

  const handleLatePatient = async (id) => {
    const result = await markPatientAsLate(id);
    return result;
  };

  const shufflePosition = async (payload) => {
    await shufflePatientPosition(payload);
  };

  const addNewAppointment = async (pid, disease, appointmentType) => {
    const payload = {
      cabinId: user.checkupcabindata[0].id,
      patientId: pid,
      paid: "False",
      disease: disease,
      slot: currentCabinSlot,
      username: user.username,
      appointment_type: appointmentType,
    };
    const result = await addAppointment(payload);
    return result;
  };

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
          {user !== null && (
            <Header 
              patients={patients || []} 
              closeEventSource={() => {
                if (eventSource) {
                  eventSource.close();
                }
              }} 
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
        </Box>
      </Router>
    </ThemeProvider>
  );
};

export default App;
