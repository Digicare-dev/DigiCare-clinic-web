import React, { useContext, useEffect, useState } from "react";
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
import { getData, postData, putData } from "./services/apiService";
import Help from "./Pages/Help";
import RoleBasedRoute from "./components/RolebasedRoute";

const App = () => {
  const { user } = useContext(AuthContext);

  const isMobile = window.innerWidth <= 768;

  const [currentPosition, setCurrentPosition] = useState(null);
  const [patients, setPatients] = useState([]);
  const [currentPatient, setCurrentPatient] = useState(null);
  const slot = encodeURIComponent("2025-02-11 18:00:00");
  const cabin = "1";

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchPatients();
      fetchCurrentPosition();
    }
  }, [user]);

  useEffect(() => {
    if (patients.length > 0 && currentPosition !== null) {
      const current = patients.find((p) => p.position === currentPosition);
      setCurrentPatient(current || null);
    }
  }, [patients, currentPosition]);

  const fetchPatients = async () => {
    try {
      const result = await getData(`queueinfo/queue-list/${cabin}/${slot}`);
      result.sort((a, b) => a.position - b.position);
      if (result.length !== 0) {
        setPatients(result);
        setTimeout(() => {
          setLoading(false);
        }, 500);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  const fetchCurrentPosition = async () => {
    const { current_number } = await getData(
      `queueinfo/current-position/${cabin}/${slot}`
    );
    setCurrentPosition(current_number);
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
    setPatients(newpatients);
    setCurrentPosition((prev) => prev + 1);
  };

  const handleNextPatient = async (id) => {
    const payload = {
      appointment_id: id,
    };
    await putData("queueinfo/done-checkup/", payload);
    markCurrentPatientAsDone();
  };

  const handleLatePatient = async (id, pos) => {
    console.log(id, pos);
    const payload = {
      appointment_id: id,
    };
    await putData("queueinfo/mark-late", payload);
    fetchPatients();
  };

  const shufflePosition = async (payload) => {
    await putData("queueinfo/shuffle-position/", payload);
    fetchPatients();
  };

  const addAppointment = async (pid, disease, appointmentType) => {
    const payload = {
      cabinId: cabin,
      patientId: pid,
      paid: "False",
      disease: disease,
      slot: "2025-02-11 18:00:00",
      username: "amitmittal",
      appointment_type: appointmentType,
    };
    await postData("queueinfo/appointment-add/", payload);
    fetchPatients();
    fetchCurrentPosition();
  };

  return (
    <Router>
      <div className="App">
        {user !== null && <Header />}
        <Box sx={{ display: "flex" }}>
          {!isMobile && user !== null && <Sidebar />}
          <Box component="main" sx={{ flexGrow: 1, padding: "6px" }}>
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
                    />
                  </PrivateRoute>
                }
              />
              <Route
                path="/add-appointment"
                element={
                  <PrivateRoute>
                    <AddAppointment
                      addAppointment={(pid, disease, appointmentType) =>
                        addAppointment(pid, disease, appointmentType)
                      }
                    />
                  </PrivateRoute>
                }
              />
              <Route
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
