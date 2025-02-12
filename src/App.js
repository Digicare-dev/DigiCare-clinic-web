import React, { useContext, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Box } from "@mui/material";
import AuthProvider, { AuthContext } from "./context/AuthContext";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import BottomNavigator from "./components/BottomNavigator";
import Home from "./Pages/Home";
import AddAppointment from "./Pages/AddAppointment";
import PatientDetails from "./Pages/PatientDetails";
import Login from "./Pages/Login";
import PrivateRoute from "./components/PrivateRoute";
import { getData, postData, putData } from "./services/apiService";
import axios from "axios";
import { login as loginService } from "./services/authService";

const App = () => {
  // const user = useContext(AuthContext);
  const user = true;
  const isMobile = window.innerWidth <= 768;

  const [currentPosition, setCurrentPosition] = React.useState(null);
  const [patients, setPatients] = React.useState([]);
  const [currentPatient, setCurrentPatient] = React.useState(null);

  useEffect(() => {
    console.log(user);
    if (user) {
      // handleLogin();
      fetchPatients();
      fetchCurrentPosition();
    }
  }, []);

  const handleLogin = async () => {
    const response = await axios.post(
      `https://backendtokenapp-production.up.railway.app/api/login/`,
      {
        username: "amitmittal",
        password: "amitmittaldigicare1234",
      }
    );

    localStorage.setItem("accessToken", response.data.access);
    localStorage.setItem("refreshToken", response.data.refresh);
  };

  useEffect(() => {
    fetchCurrentPatient();
  }, [patients, currentPosition]);

  const fetchPatients = async () => {
    const slot = encodeURIComponent("2025-02-07 18:00:00");
    const cabin = "1";
    const result = await getData(`queueinfo/queue-list/${cabin}/${slot}`);
    result.sort((a, b) => a.position - b.position);
    setPatients(result);
  };

  const fetchCurrentPosition = async () => {
    const slot = encodeURIComponent("2025-02-07 18:00:00");
    const cabin = "1";
    const { current_number } = await getData(
      `queueinfo/current-position/${cabin}/${slot}`
    );
    setCurrentPosition(current_number);
  };

  const fetchCurrentPatient = () => {
    const current = patients.find((p) => p.position === currentPosition);
    setCurrentPatient(current);
  };

  const handleNextPatient = (id) => {
    const payload = {
      appointment_id: id,
    };
    putData("queueinfo/done-checkup/", payload);
    setCurrentPosition((prev) => prev + 1);
  };

  const handleLatePatient = async (id, pos) => {
    console.log(id, pos);
    const payload = {
      appointment_id: id,
      new_position: pos + 5,
    };
    await putData("queueinfo/shuffle-position/", payload);
    fetchPatients();
  };

  const shufflePosition = async (payload) => {
    await putData("queueinfo/shuffle-position/", payload);
    fetchPatients();
  };

  const addAppointment = (pid, disease) => {
    const payload = {
      cabinId: "1",
      patientId: pid,
      paid: "False",
      disease: disease,
      slot: "2025-02-10 18:00:00",
      username: "amitmittal",
    };
    postData("queueinfo/appointment-add/", payload);
  };

  return (
    <Router>
      <div className="App">
        <Header />
        <Box sx={{ display: "flex" }}>
          {!isMobile && <Sidebar />}
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
                    />
                  </PrivateRoute>
                }
              />
              <Route
                path="/add-appointment"
                element={
                  <PrivateRoute>
                    <AddAppointment
                      addAppointment={(pid, disease) =>
                        addAppointment(pid, disease)
                      }
                    />
                  </PrivateRoute>
                }
              />
              <Route
                path="/patient-details"
                element={
                  <PrivateRoute>
                    <PatientDetails
                      currentPatient={currentPatient}
                      handleNextPatient={handleNextPatient}
                    />
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
