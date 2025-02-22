import { useContext, useEffect, useState } from "react";
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
import AppointmentTable from "./Pages/AppointmentTable";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const App = () => {
  const { user } = useContext(AuthContext);

  const isMobile = window.innerWidth <= 768;

  const [currentPosition, setCurrentPosition] = useState(2);
  const [patients, setPatients] = useState([
    {
      first_name: "DEV",
      last_name: "KUMAR",
      guardian: "no",
      token: 46,
      position: 31,
      appointment_id: "6265762025-02-17 05:50:22.100939",
      late: false,
      done_checkup: false,
      paid: false,
      type: "P",
      age: 42,
      disease: "",
    },
    {
      first_name: "GORDHANLAL",
      last_name: "JI",
      guardian: "no",
      token: 54,
      position: 2,
      appointment_id: "6487182025-02-17 05:55:28.628687",
      late: false,
      done_checkup: false,
      paid: false,
      type: "P",
      age: 70,
      disease: "",
    },
    {
      first_name: "LEELARAM",
      last_name: "JI",
      guardian: "no",
      token: 48,
      position: 5,
      appointment_id: "3528262025-02-17 05:52:30.208234",
      late: false,
      done_checkup: false,
      paid: false,
      type: "P",
      age: 70,
      disease: "",
    },
    {
      first_name: "KRISHAN",
      last_name: "KUMAR",
      guardian: "no",
      token: 49,
      position: 6,
      appointment_id: "9020332025-02-17 05:53:23.784987",
      late: false,
      done_checkup: false,
      paid: false,
      type: "P",
      age: 54,
      disease: "",
    },
    {
      first_name: "BHUDHARLAL",
      last_name: "JI",
      guardian: "no",
      token: 51,
      position: 7,
      appointment_id: "1911952025-02-17 05:54:10.854964",
      late: false,
      done_checkup: false,
      paid: false,
      type: "P",
      age: 77,
      disease: "",
    },
    {
      first_name: "HARE KISHAN",
      last_name: "RAY",
      guardian: "no",
      token: 45,
      position: 8,
      appointment_id: "1478722025-02-17 05:49:51.251936",
      late: false,
      done_checkup: false,
      paid: false,
      type: "P",
      age: 69,
      disease: "",
    },
    {
      first_name: "RAMDAS",
      last_name: "SAINI",
      guardian: "no",
      token: 47,
      position: 9,
      appointment_id: "9325122025-02-17 05:51:06.636976",
      late: false,
      done_checkup: false,
      paid: false,
      type: "P",
      age: 45,
      disease: "",
    },
    {
      first_name: "fateh",
      last_name: "singh",
      guardian: "solo",
      token: 36,
      position: 36,
      appointment_id: "3914222025-02-17 05:39:17.179905",
      late: false,
      done_checkup: false,
      paid: false,
      type: "P",
      age: 43,
      disease: "",
    },
    {
      first_name: "Manish",
      last_name: "Kumar",
      guardian: "No",
      token: 40,
      position: 35,
      appointment_id: "3225522025-02-17 05:45:11.116919",
      late: false,
      done_checkup: false,
      paid: false,
      type: "P",
      age: 43,
      disease: "",
    },
    {
      first_name: "Suresh",
      last_name: "Chand",
      guardian: "No",
      token: 39,
      position: 34,
      appointment_id: "5096402025-02-17 05:44:38.309943",
      late: false,
      done_checkup: false,
      paid: false,
      type: "P",
      age: 43,
      disease: "\n",
    },
    {
      first_name: "PARAMJEET",
      last_name: "KAUR",
      guardian: "no",
      token: 44,
      position: 14,
      appointment_id: "6028992025-02-17 05:49:11.886624",
      late: false,
      done_checkup: false,
      paid: false,
      type: "P",
      age: 40,
      disease: "",
    },
    {
      first_name: "SUNIL",
      last_name: "JI",
      guardian: "no",
      token: 50,
      position: 15,
      appointment_id: "4652982025-02-17 05:53:44.906087",
      late: false,
      done_checkup: false,
      paid: false,
      type: "P",
      age: 45,
      disease: "",
    },
    {
      first_name: "HARNEK",
      last_name: "SINGH",
      guardian: "no",
      token: 55,
      position: 16,
      appointment_id: "6949622025-02-17 05:55:52.858614",
      late: false,
      done_checkup: false,
      paid: false,
      type: "P",
      age: 32,
      disease: "",
    },
    {
      first_name: "SUSHIL",
      last_name: "JI",
      guardian: "no",
      token: 56,
      position: 17,
      appointment_id: "5953352025-02-17 05:56:12.913432",
      late: false,
      done_checkup: false,
      paid: false,
      type: "P",
      age: 42,
      disease: "",
    },
    {
      first_name: "PRAHLAD",
      last_name: "JI",
      guardian: "no",
      token: 57,
      position: 18,
      appointment_id: "2322552025-02-17 05:56:44.660275",
      late: false,
      done_checkup: false,
      paid: false,
      type: "P",
      age: 75,
      disease: "",
    },
  ]);
  const [currentPatient, setCurrentPatient] = useState(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    debugger;
    console.log(user);
  }, []);

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchPatients();
      // fetchCurrentPosition();
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
      const result = await axios.get(
        `${API_BASE_URL}/queueinfo/queue-list/${user.checkupcabindata[0].id}/${user.checkupcabindata[0].cabin_slots[0]}`,
        {
          withCredentials: true,
        }
      );
      result.sort((a, b) => a.position - b.position);

      const remainingPatients = result.filter((p) => p.done_checkup === false);
      if (remainingPatients.length !== 0) {
        setPatients(remainingPatients);
        setTimeout(() => {
          setLoading(false);
        }, 300);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  const fetchCurrentPosition = async () => {
    const { current_number } = await getData(
      `queueinfo/current-position/${user.checkupcabindata[0].id}/${user.checkupcabindata[0].cabin_slots[0]}`
    );
    setCurrentPosition(current_number);
    return current_number;
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
    const result = await putData("queueinfo/done-checkup/", payload);
    markCurrentPatientAsDone();
    return result;
  };

  const handleLatePatient = async (id, pos) => {
    const payload = {
      appointment_id: id,
    };
    const result = await putData("queueinfo/mark-late", payload);
    fetchPatients();
    return result;
  };

  const shufflePosition = async (payload) => {
    return await putData("queueinfo/shuffle-position/", payload);
    // fetchPatients();
  };

  const addAppointment = async (pid, disease, appointmentType) => {
    const payload = {
      cabinId: user.checkupcabindata[0].id,
      patientId: pid,
      paid: "False",
      disease: disease,
      slot: user.checkupcabindata[0].cabin_slots[0],
      username: "amitmittal",
      appointment_type: appointmentType,
    };
    const result = await postData("queueinfo/appointment-add/", payload);
    fetchPatients();
    fetchCurrentPosition();
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
                    {/* <RoleBasedRoute allowedRoles={["doctor"]}> */}
                    <PatientDetails
                      currentPatient={currentPatient}
                      handleNextPatient={handleNextPatient}
                    />
                    {/* </RoleBasedRoute> */}
                  </PrivateRoute>
                }
              />
              <Route
                path="/appointments"
                element={
                  <PrivateRoute>
                    <AppointmentTable />
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
