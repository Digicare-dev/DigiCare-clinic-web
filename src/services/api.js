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
    return response.data;
  } catch (error) {
    console.error("Error fetching appointment details:", error);
    throw error;
  }
};

export const getPatientDetails = async (patientId) => {
  try {
    const response = await axiosInstance.get(
      `/userinfo/patients/details/${patientId}`,
      { withCredentials: true } 
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching patient details:", error);
    throw error;
  }
};

export const getPrescriptions = async (appointmentId) => {
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

export const getCurrentPrescription = async (appointment_id) => {
  try {
    const response = await axiosInstance.get(
      `/prescriptions/${appointment_id}`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching current prescription:", error);
    throw error;
  }
};

export const savePrescription = async (payload) => {
  try {
    const response = await axiosInstance.post(
      `/prescriptions/save/`,
      payload,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error("Error saving prescription:", error);
    throw error;
  }
};

export const getPastPrescriptions = async (patient_id, cabin_id) => {
  try {
    const response = await axiosInstance.get(
      `/prescriptions/list/${cabin_id}/${patient_id}/`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching past prescriptions:", error);
    throw error;
  }
};


export const getTemplates = async (template_type, cabin_id) => {
  let templateType;
  switch(template_type) {
    case 'medications':
      templateType = 'medicines';
      break;
    case 'diagnoses':
      templateType = 'diagnosis';
      break;
    case 'complaints':
      templateType = 'complaints';
      break;
  }
  try {
    const response = await axiosInstance.get(
      `/prescriptions/templates/${templateType}/${cabin_id}/`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching complaints templates:", error);
    throw error;
  }
};

export const saveTemplate = async (template_type, cabin_id, payload ) => {
  try {
    const response = await axiosInstance.post(
      `/prescriptions/templates/${template_type}/${cabin_id}/save/`,
      payload,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error("Error saving complaints template:", error);
    throw error;
  }
};

export const deleteTemplate = async (template_type, template_name, cabin_id) => {
  try {
    const response = await axiosInstance.delete(
      `/templates/${template_type}/${template_name}/${cabin_id}/delete/`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting complaints template:", error);
    throw error;
  }
};

export const editTemplate = async (template_type, template_name, cabin_id, payload) => {
  try {
    const response = await axiosInstance.put(
      `/prescriptions/templates/${template_type}/${template_name}/${cabin_id}/edit`,
      payload,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error("Error editing complaints template:", error);
    throw error;
  }
};

export const getVitals = async(appointment_id) => {
  try {
    const response = await axiosInstance.get(
      `prescriptions/vitals/${appointment_id}`,
      {withCredentials:true}
    );
    return response.data;
  } catch(error) {
    console.error("Error fetching vitals:", error);
    throw error;
  }
};

export const manageVitals = async(payload) => {
  try {
    const response = await axiosInstance.post(
      "prescriptions/vitals/manage/",
      payload,
      {withCredentials:true}
    );
    return response.data;
  } catch(error) {
    console.error("Error managing vitals", error);
    throw error;
  }  
};

export const getAttachments = async(appointment_id) => {
  try {
    const response = await axiosInstance.get(
      `prescriptions/attachments/${appointment_id}`,
      {withCredentials:true}
    );
    return response.data;
  } catch(error) {
    console.error("Error managing vitals", error);
    throw error;
  }  
}

export const uploadAttachment = async(formData) => {
  try {
    const response = await axiosInstance.post(
      "prescriptions/attachments/upload/",
      formData,
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  } catch(error) {
    console.error("Error uploading attachment:", error);
    throw error;
  }  
}

export const deleteAttachment = async(attachment_id) => {
  try {
    const response = await axiosInstance.delete(
      `prescriptions/attachments/delete/${attachment_id}/`,
      {withCredentials:true}
    );
    return response.data;
  } catch(error) {
    console.error("Error managing vitals", error);
    throw error;
  }  
}


export const getPatientProfile = async(phone_number) => {
  try {
    const response = await axiosInstance.post(
      `userinfo/patients/profiles/`,
      {phone_number: phone_number},
      {withCredentials: true}
    );
    return response.data;
  } catch(error) {
    console.error("Error searching patient profile:", error);
    throw error;
  }
}


export const suggestMedicine = async(query) => {
  try {
    const response = await axiosInstance.get(
      `prescriptions/medicines/suggest/${query}`,
      {withCredentials:true}
    );
    return response.data;
  } catch(error) {
    console.error("Error suggesting medications:", error);
    throw error;
  }
}

export const getMaxTokenNumber = async(cabinId, slot) => {
  try {
    // First fetch all appointments for the slot
    const appointmentsData = await fetchAppointments(cabinId, slot);
    
    // If there are no appointments, return 0 (so first token will be 1)
    if (!appointmentsData || !appointmentsData.length) {
      return 0;
    }
    
    // Find the maximum token number
    const tokens = appointmentsData.map(appointment => 
      parseInt(appointment.token, 10)
    ).filter(token => !isNaN(token));
    
    return tokens.length ? Math.max(...tokens) : 0;
  } catch (error) {
    console.error("Error calculating max token number:", error);
    throw error;
  }
}