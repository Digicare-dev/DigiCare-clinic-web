import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./PatientItem.css";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button as MuiButton,
  CircularProgress,
  Tooltip,
  Chip,
  IconButton,
  Box,
  Typography,
} from "@mui/material";
import {
  Paid,
  CheckCircle,
  PendingActions,
  AccessTime,
  MedicalServices,
  Lock,
  LockOpen,
  Person,
  LocalHospital,
  SupervisorAccount,
  MeetingRoom,
  DoneAll,
  Schedule,
} from "@mui/icons-material";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import ReportLink from '../components/ReportLink';

// Add custom styles for clickable elements
const clickableStyle = {
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
};

const PatientItem = ({
  position,
  appointment,
  late,
  currentPosition,
  handleNextPatient,
  handleLatePatient,
  paid,
  checkin,
  status,
}) => {
  const navigate = useNavigate();
  const [confirmAction, setConfirmAction] = useState(null);
  const [loadingType, setLoadingType] = useState(null);

  // Determine if this is the current patient based on position
  const isCurrent = position === currentPosition;
  const isLate = late || status === "late";
  const isDone = status === "done_checkup" || status === "done";
  
  // Log the data structure for debugging
  useEffect(() => {
    console.log('PatientItem received data:', {
      position,
      appointment,
      late,
      currentPosition,
      paid,
      checkin,
      status
    });
  }, [position, appointment, late, currentPosition, paid, checkin, status]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: appointment.appointment_id,
  });

  // Add a function to handle clicking on the patient item
  const handlePatientClick = (e) => {
    // Prevent click if we're dragging
    if (isDragging) return;
    
    // Prevent click if we clicked on a button inside the item
    if (e.target.closest('button') || e.target.closest('.MuiIconButton-root')) {
      return;
    }
    
    // Extract patient name parts (assuming format is "FIRST LAST")
    const nameParts = (appointment.name || appointment.patient_name || "").split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";
    
    // Log the appointment data to see what's available
    console.log('Appointment data for patient click:', appointment);
    console.log('Available fields in appointment:', Object.keys(appointment));
    
    // Extract all available patient data to pass to the PatientInfoPage
    const patientData = {
      name: appointment.name || appointment.patient_name || "Unknown Patient",
      firstName: firstName,
      lastName: lastName,
      // Try to extract age from all possible fields
      age: appointment.age || appointment.patient_age || "",
      gender: appointment.gender || appointment.sex || appointment.patient_gender || "Male",
      // Try to extract phone from all possible fields
      phone: appointment.phone_number || appointment.mobile || appointment.phone || appointment.contact || "",
      email: appointment.email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      id: appointment.patient_id || appointment.id || `PT${Math.floor(Math.random() * 10000)}`,
      bloodGroup: appointment.blood_group || "O+",
      allergies: appointment.allergies || ["None"],
      chronicConditions: appointment.chronic_conditions || [],
      guardianName: appointment.guardian_name || appointment.guardian || "",
    };
    
    // Extract all available appointment data
    const appointmentData = {
      date: appointment.date || new Date().toISOString().split('T')[0],
      time: appointment.time || "10:00 AM",
      doctor: appointment.doctor || "Dr. Smith", // Default if not available
      type: appointment.appointment_type || "General Checkup", // Default if not available
      status: status || "pending",
      id: appointment.appointment_id,
      reason: appointment.reason || appointment.disease || "General Checkup",
      department: appointment.department || "General",
      token: appointment.token || position,
      disease: appointment.disease || "",
      fees: appointment.fees_paid || 0,
      paymentMode: appointment.mode || "cash",
      paid: paid,
      checkin: checkin,
    };
    
    // Create vitals data with default values
    const vitalsData = {
      bloodPressure: "120/80",
      heartRate: "72",
      temperature: "98.6",
      respiratoryRate: "16",
      spO2: "98",
      height: "175",
      weight: "70",
    };
    
    // Create complaints based on disease if available
    const complaintsData = [];
    if (appointment.disease) {
      complaintsData.push({
        complaint: appointment.disease,
        severity: "Moderate",
        duration: "3 days",
        isEditing: false
      });
    }
    
    // Navigate to the patient info page with the patient data
    navigate('/patient-info', { 
      state: { 
        patientId: patientData.id,
        appointmentId: appointmentData.id,
        patientInfo: patientData,
        appointmentInfo: appointmentData,
        vitalsInfo: vitalsData,
        complaintsData: complaintsData,
        position: position,
        late: late,
        status: status,
      } 
    });
  };

  const handleConfirm = async () => {
    if (confirmAction === "next") {
      setLoadingType("next");
      try {
          await handleNextPatient(appointment.appointment_id);
      } catch (error) {
        console.error("Error marking patient as done:", error);
      } finally {
        setLoadingType(null);
        setConfirmAction(null);
      }
    } else if (confirmAction === "late") {
      setLoadingType("late");
      try {
        await handleLatePatient(appointment.appointment_id, position);
      } catch (error) {
        console.error("Error marking patient as late:", error);
    } finally {
      setLoadingType(null);
        setConfirmAction(null);
      }
    }
  };

  return (
    <>
    <div
      ref={setNodeRef}
        style={{
          transform: CSS.Transform.toString(transform),
          transition,
          opacity: isDragging ? 0.5 : 1,
          cursor: 'pointer', // Add cursor pointer to indicate clickable
        }}
        className={`patient-item ${isCurrent ? "current" : ""} ${isLate ? "late" : ""} ${
          isDone ? "done" : ""
        }`}
        onClick={handlePatientClick} // Add the click handler
    >
      <div className="patient-content">
          <div className={`token-badge ${isCurrent ? "current-token" : ""} ${isLate ? "late-token" : ""}`}>
            <span>#{appointment.token || position}</span>
          </div>

          <div className="patient-details">
            <div className="patient-header">
              <Typography variant="h6" component="h3">
                {appointment.name || "Unknown Patient"}
              </Typography>
              
              <div className="status-tags">
                {status === "pending" && (
                  <Chip
                    icon={<PendingActions fontSize="small" />}
                    label="Pending"
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
                {isLate && (
                  <Chip
                    icon={<AccessTime fontSize="small" />}
                    label="Late"
                    size="small"
                    color="error"
                    variant="outlined"
                  />
                )}
                {isDone && (
                  <Chip
                    icon={<CheckCircle fontSize="small" />}
                    label="Done"
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                )}
                {isCurrent && (
                  <Chip
                    icon={<MedicalServices fontSize="small" />}
                    label="Current"
                    size="small"
                    color="secondary"
                    variant="outlined"
                  />
                )}
              </div>
            </div>

            {/* Guardian name if available */}
            {appointment.guardian_name && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, color: 'text.secondary' }}>
                <SupervisorAccount fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="body2">
                  Guardian: {appointment.guardian_name}
                </Typography>
              </Box>
              )}

            <div className="appointment-meta">
              <div className="meta-item">
                <ReportLink 
                  type="blood-test" 
                  variant="text" 
                />
              </div>
              <div className="meta-item">
                <ReportLink 
                  type="ecg-test" 
                  variant="text" 
                />
              </div>
            </div>
          </div>
          
          <div className="action-buttons">
            {/* Mark Done button - show for all patients that aren't already done */}
            {!isDone && (
              <Tooltip title="Mark as Done">
                <MuiButton
                  variant={isCurrent ? "contained" : "outlined"}
                  color="primary"
                  size="small"
                  startIcon={<DoneAll />}
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmAction("next");
                  }}
                  disabled={loadingType === "next" || isDone}
                  sx={{ mr: 1 }}
                >
                  {loadingType === "next" ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    "Done"
                  )}
                </MuiButton>
              </Tooltip>
            )}
            
            {/* Mark Late button - show for all patients that aren't already late or done */}
            {!isLate && !isDone && (
              <Tooltip title="Mark as Late">
                <MuiButton
                  variant="outlined"
                  color="secondary"
                  size="small"
                  startIcon={<Schedule />}
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmAction("late");
                  }}
                  disabled={loadingType === "late" || isLate || isDone}
                >
                  {loadingType === "late" ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    "Late"
                  )}
                </MuiButton>
              </Tooltip>
            )}
          </div>
          
          <div className="drag-handle" {...attributes} {...listeners}>
            <DragHandleIcon />
          </div>
        </div>
      </div>

      <Dialog open={!!confirmAction} onClose={() => setConfirmAction(null)}>
        <DialogTitle>
          {confirmAction === "next"
            ? "Mark Patient as Done"
            : "Mark Patient as Late"}
        </DialogTitle>
        <DialogContent>
          {confirmAction === "next"
            ? `Are you sure you want to mark ${appointment.name} as done?`
            : `Are you sure you want to mark ${appointment.name} as late?`}
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setConfirmAction(null)}>Cancel</MuiButton>
          <MuiButton
            onClick={handleConfirm}
            color="primary"
            variant="contained"
            disabled={loadingType}
          >
            {loadingType ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Confirm"
            )}
          </MuiButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PatientItem;
