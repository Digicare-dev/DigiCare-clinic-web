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
import { EventSource } from "eventsource";

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
    if (user) {
      // setLoading(true);
      // const eventSource = new EventSource(
      //   `${API_BASE_URL}/doctorinfo/queue_updates/${user.checkupcabindata[0].id}/${user.checkupcabindata[0].cabin_slots[0]}`,
      //   {
      //     withCredentials: true,
      //   }
      // );
      // fetch(
      //   `${API_BASE_URL}/doctorinfo/queue_updates/${user.checkupcabindata[0].id}/${user.checkupcabindata[0].cabin_slots[0]}`,
      //   {
      //     credentials: "include",
      //   }
      // )
      //   .then((response) => response.text())
      //   .then((data) => console.log(data))
      //   .catch((error) => console.error(error));
      // eventSource.onmessage = (event) => {
      //   debugger;
      //   console.log(event.data);
      //   // const data = JSON.parse(event.data);
      //   // if (data.type === "patient") {
      //   //   setPatients(data.patients);
      //   // } else if (data.type === "appointment") {
      //   //   setAppointments(data.appointments);
      //   // } else if (data.type === "currentPosition") {
      //   //   setCurrentPosition(data.currentPosition);
      //   // }
      //   setLoading(false);
      // };
      // eventSource.onerror = (error) => {
      //   console.error("EventSource failed:", error);
      //   eventSource.close();
      // };
      // return () => {
      //   eventSource.close();
      // };
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchPatientsData();
      fetchCurrentPositionData();
    }
  }, [user, window.location.pathname]);

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
        status: patient.status || "pending", // Default status
      }));

      processedData.sort((a, b) => a.position - b.position);
      const remainingPatients = data.filter(
        (p) => p.appointment.appointment_type !== "done"
      );
      setPatients(remainingPatients);
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
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
      setLoading(false);
    }
  }, [user, setCurrentPosition, setLoading]);

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
    await fetchPatientsData();
    await fetchCurrentPositionData();
    return result;
  };

  const handleLatePatient = async (id, pos) => {
    const result = await markPatientAsLate(id);
    await fetchPatientsData();
    await fetchCurrentPositionData();
    return result;
  };

  const shufflePosition = async (payload) => {
    await shufflePatientPosition(payload);
    await fetchPatientsData();
    await fetchCurrentPositionData();
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
              <Route path="/login" element={<Login />} />
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
                    {
                      <AppointmentTable
                        key={window.location.pathname}
                        fetchPatientsData={fetchPatientsData}
                      />
                    }
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
            </Routes>
          </Box>
        </Box>
        {isMobile && <BottomNavigator />}
      </div>
    </Router>
  );
};

export default App;
