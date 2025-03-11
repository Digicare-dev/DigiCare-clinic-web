import axiosInstance from "../utils/axiosInstance";

// Fetch appointments
export const fetchAppointments = async (cabinId, slot) => {
  try {
    const response = await axiosInstance.get(
      `/queueinfo/appointment-list/${cabinId}/${slot}`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching appointments:", error);
    throw error;
  }
};

// Add appointment
export const addAppointment = async (payload) => {
  try {
    const response = await axiosInstance.post(
      "/queueinfo/appointment-add/",
      payload,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding appointment:", error);
    throw error;
  }
};

// Fetch patients
export const fetchPatients = async (cabinId, slot) => {
  try {
    const response = await axiosInstance.get(
      `/queueinfo/queue-list/${cabinId}/${slot}`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching patients:", error);
    throw error;
  }
};

// Fetch current position
export const fetchCurrentPosition = async (cabinId, slot) => {
  try {
    const response = await axiosInstance.get(
      `/queueinfo/current-position/${cabinId}/${slot}`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching current position:", error);
    throw error;
  }
};

// Mark patient as done
export const markPatientAsDone = async (appointmentId) => {
  try {
    const response = await axiosInstance.put(
      "/queueinfo/done-checkup/",
      { appointment_id: appointmentId },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error("Error marking patient as done:", error);
    throw error;
  }
};

// Mark patient as late
export const markPatientAsLate = async (appointmentId) => {
  try {
    const response = await axiosInstance.put(
      "/queueinfo/mark-late",
      { appointment_id: appointmentId },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error("Error marking patient as late:", error);
    throw error;
  }
};

// Shuffle patient position
export const shufflePatientPosition = async (payload) => {
  try {
    const response = await axiosInstance.put(
      "/queueinfo/shuffle-position/",
      payload,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error("Error shuffling patient position:", error);
    throw error;
  }
};

// Add doctor's remark
export const addDoctorsRemark = async (payload) => {
  try {
    const response = await axiosInstance.put(
      "/queueinfo/add-remarks/",
      payload,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding doctor's remark:", error);
    throw error;
  }
};

// Update appointment details
export const updateAppointmentDetails = async (payload) => {
  try {
    const response = await axiosInstance.patch(
      "/queueinfo/appointment-edit/",
      payload,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating appointment details:", error);
    throw error;
  }
};

//Delete appointment

export const removeAppointment = async (payload) => {
  try {
    const response = await axiosInstance.put(
      "/queueinfo/remove-appointment/",
      payload,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding appointment:", error);
    throw error;
  }
};

// Search patients by name or phone
export const searchPatients = async (cabinId, slot, searchTerm) => {
  try {
    // First fetch all appointments for the slot
    const appointments = await fetchAppointments(cabinId, slot);
    
    // Then filter locally based on search term
    if (!searchTerm) return appointments;
    
    const term = searchTerm.toLowerCase();
    return appointments.filter(appointment => 
      appointment.name.toLowerCase().includes(term) || 
      (appointment.patient?.phone_number && appointment.patient.phone_number.includes(term))
    );
  } catch (error) {
    console.error("Error searching patients:", error);
    throw error;
  }
};


export const getAppointmentDetails = async (appointmentId) => {
  try {
    const response = await axiosInstance.get(
      `/queueinfo/appointments/${appointmentId}/details/`,
      { withCredentials: true }
    )
    debugger;
    return response.data;
  } catch (error) {
    console.error("Error fetching appointment details:", error);
    throw error;
  }
};

export const getPatientDetails = async (patientId) => {
  try {
    const response = await axiosInstance.get(
      `/userinfo/patients/details/`,
      { patient_id: patientId },
      { withCredentials: true } 
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching patient details:", error);
    throw error;
  }
};

export const getPrescription = async (appointmentId) => {
  try {
    const response = await axiosInstance.get(
      `/prescriptions/${appointmentId}`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching prescription:", error);
    throw error;
  }
};

export const getPastPrescriptions = async (patient_id, cabin_id) => {
  try {
    const response = await axiosInstance.post(
      `/prescriptions/list/`,
      { patient_id: patient_id, cabin_id: cabin_id },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching past prescriptions:", error);
    throw error;
  }
};
