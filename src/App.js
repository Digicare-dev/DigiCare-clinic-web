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
import { Navigate } from "react-router-dom";

import {
  fetchPatients,
  fetchCurrentPosition,
  markPatientAsDone,
  markPatientAsLate,
  shufflePatientPosition,
  addAppointment,
} from "./services/api";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const App = () => {
  const { user } = useContext(AuthContext);
  const isMobile = window.innerWidth <= 768;
  const [currentPosition, setCurrentPosition] = useState(null);
  const [patients, setPatients] = useState([]);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      // Only fetch if user exists and has required data
      if (user?.checkupcabindata?.[0]?.id) {
        setLoading(true);
        try {
          setPatients([]);
          setCurrentPosition(null);

          await fetchPatientsData();
          await fetchCurrentPositionData();
        } catch (error) {
          console.error("Initial data fetch error:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    // Use a timeout to ensure localStorage is populated
    const timeoutId = setTimeout(fetchInitialData, 100);

    return () => clearTimeout(timeoutId);
  }, [user?.checkupcabindata?.[0]?.id]);

  let eventSource;

  useEffect(() => {
    if (!user?.checkupcabindata?.[0]?.id || loading) return;

    const doctorId = user.checkupcabindata[0].id;
    const slotTime = user.checkupcabindata[0].cabin_slots[0];
    const date = new Date(slotTime);
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

        // console.log("SSE Data:", parsedData);

        if (parsedData.queue) {
          // Assuming the update is the whole patients array
          setPatients((prevPatients) => {
            // Find if the patient already exists
            const existingIndex = prevPatients.findIndex(
              (p) =>
                p.appointment.appointment_id ===
                parsedData.queue.appointment.appointment_id
            );

            // Create updated patient object with defaults
            const updatedPatient = {
              ...parsedData.queue,
              paid: parsedData.queue.paid || false,
              checkin: parsedData.queue.checkin || false,
              status: parsedData.queue.status || "pending",
              position: parsedData.queue.position,
            };

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

  const fetchPatientsData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchPatients(
        user.checkupcabindata[0].id,
        user.checkupcabindata[0].cabin_slots[0]
      );

      const processedData = data.map((patient) => ({
        ...patient,
        paid: patient.paid || false, // Default to false if not provided
        checkin: patient.checkin || false, // Default to false if not provided
        status: patient.status || "pending",
      }));

      processedData.sort((a, b) => a.position - b.position);
      // console.log(processedData);
      setPatients(processedData);
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  }, [user]);

  const fetchCurrentPositionData = useCallback(async () => {
    try {
      setLoading(true);
      const { current_number } = await fetchCurrentPosition(
        user.checkupcabindata[0].id,
        user.checkupcabindata[0].cabin_slots[0]
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
  }, [user, setCurrentPosition, setLoading]);

  const fetchPatientsDataWithoutLoader = async () => {
    try {
      const data = await fetchPatients(
        user.checkupcabindata[0].id,
        user.checkupcabindata[0].cabin_slots[0]
      );

      const processedData = data.map((patient) => ({
        ...patient,
        paid: patient.paid || false, // Default to false if not provided
        checkin: patient.checkin || false, // Default to false if not provided
        status: patient.status || "pending", // Default status
      }));

      processedData.sort((a, b) => a.position - b.position);
      setPatients(processedData);
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  const fetchCurrentPositionDataWithoutLoader = async () => {
    try {
      const { current_number } = await fetchCurrentPosition(
        user.checkupcabindata[0].id,
        user.checkupcabindata[0].cabin_slots[0]
      );

      setCurrentPosition(current_number);
      return current_number;
    } catch (error) {
      console.error("Error fetching current position:", error);
    }
  };

  const markCurrentPatientAsDone = () => {
    const newpatients = patients.map((p) => {
      if (p.position === currentPosition) {
        const newp = { ...p, done_checkup: true };
        return newp;
      } else {
        return p;
      }
    });
    fetchPatientsData();
  };

  const handleNextPatient = async (id) => {
    const result = await markPatientAsDone(id);
    return result;
  };

  const handleLatePatient = async (id, pos) => {
    const result = await markPatientAsLate(id);
    // await fetchPatientsDataWithoutLoader();
    // await fetchCurrentPositionDataWithoutLoader();
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
      slot: user.checkupcabindata[0].cabin_slots[0],
      username: user.username,
      appointment_type: appointmentType,
    };
    const result = await addAppointment(payload);
    await fetchPatientsData();
    await fetchCurrentPositionData();
    return result;
  };

  return (
    <Router>
      <div className="App" style={{ height: "100vh", overflow: "hidden" }}>
        {user !== null && <Header />}
        <Box sx={{ display: "flex", height: "100%" }}>
          {!isMobile && user !== null && <Sidebar />}
          <Box
            component="main"
            sx={{ flexGrow: 1, padding: "6px", height: "100%", width: "100%" }}
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
                    <Home
                      currentPosition={currentPosition}
                      setCurrentPosition={setCurrentPosition}
                      patients={patients}
                      setPatients={(patients) => setPatients(patients)}
                      handleNextPatient={handleNextPatient}
                      handleLatePatient={(id, pos) =>
                        handleLatePatient(id, pos)
                      }
                      shufflePosition={(payload) => shufflePosition(payload)}
                      loading={loading}
                      fetchPatientsData={fetchPatientsData}
                      fetchPatientsDataWithoutLoader={
                        fetchPatientsDataWithoutLoader
                      }
                      fetchCurrentPositionDataWithoutLoader={
                        fetchCurrentPositionDataWithoutLoader
                      }
                    />
                  </PrivateRoute>
                }
              />
              {/* <Route
                path="/add-appointment"
                element={
                  <PrivateRoute>
                    <AddAppointment
                      addNewAppointment={(pid, disease, appointmentType) =>
                        addNewAppointment(pid, disease, appointmentType)
                      }
                    />
                  </PrivateRoute>
                }
              /> */}
              {/* <Route
                path="/patient-details"
                element={
                  <PrivateRoute>
                    <RoleBasedRoute allowedRoles={["doctor"]}>
                    <PatientDetails
                      currentPatient={currentPatient}
                      handleNextPatient={handleNextPatient}
                    />
                    </RoleBasedRoute>
                  </PrivateRoute>
                }
              /> */}
              <Route
                path="/appointments"
                element={
                  <PrivateRoute>
                    {<AppointmentTable fetchPatientsData={fetchPatientsData} />}
                  </PrivateRoute>
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
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Box>
        </Box>
        {user !== null && isMobile && <BottomNavigator />}
      </div>
    </Router>
  );
};

export default App;
