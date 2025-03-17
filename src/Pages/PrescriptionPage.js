import React, { useState, useRef, useEffect, useCallback, forwardRef } from "react";
import {
  TextField,
  Button,
  Typography,
  Container,
  Grid,
  FormControlLabel,
  Checkbox,
  Divider,
  IconButton, 
  InputAdornment,
  Autocomplete,
  MenuItem,
  Chip,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Box,
  Modal,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Backdrop,
} from "@mui/material";
import {
  RemoveCircleOutline,
  AddCircleOutline,
  Cancel as CancelIcon,
  CheckCircle,
  MedicalInformation as MedicalInformationIcon,
  History as HistoryIcon,
  ContentCopy as ContentCopyIcon,
  ExpandMore as ExpandMoreIcon,
  Edit,
  Search,
  Add as AddIcon,
  CalendarToday,
  Delete as DeleteIcon,
  Print,
  RestartAlt,
} from "@mui/icons-material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "./PrescriptionPage.css";
import { useNavigate, useParams } from 'react-router-dom';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import SaveIcon from '@mui/icons-material/Save';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { 
  saveTemplate,
  getTemplates,
  deleteTemplate,
  editTemplate,
  getCurrentPrescription,
  suggestMedicine,
  suggestDiagnosis,
  getPatientProfile,
  getPatientDetails,
  savePrescription,
  addAppointment,
  getMaxTokenNumber
} from "../services/api";
import { getCabinInfo } from "../utils/dateUtils";
import { printPrescription } from "../utils/prescriptionUtils";

// Add this with your other dummy data arrays at the top of the file

const commonComplaints = [
  "Headache",
  "Fever",
  "Cough",
  "Body Pain",
  "Stomach Pain",
  "Vomiting",
  "Diarrhea",
  "Chest Pain",
  "Breathlessness",
  "Dizziness",
];

// Dummy databases
const dummyMedicines = [
  {
    label: "Paracetamol",
    doses: ["1 tablet", "1/2 tablet", "1/4 tablet"],
    frequency: ["OD (Morning)", "BD (Morning & Night)", "TDS (After meals)"],
    duration: ["3 days", "5 days", "7 days"],
    type: "Analgesic",
  },
  {
    label: "Amoxicillin",
    doses: ["1 tablet", "1/2 tablet", "1/4 tablet"],
    frequency: ["BD (Every 12 hours)", "TDS (Every 8 hours)"],
    duration: ["5 days", "7 days", "10 days"],
    type: "Antibiotic",
  },
  {
    label: "Omeprazole",
    dosage: ["1 tablet", "1/2 tablet", "1/4 tablet"],
    frequency: ["OD (Before breakfast)"],
    duration: ["14 days", "30 days"],
    type: "PPI",
  },
  {
    label: "Cetirizine",
    dosage: ["1 tablet", "1/2 tablet", "1/4 tablet"],
    frequency: ["OD (Night)"],
    duration: ["5 days", "7 days"],
    type: "Antihistamine",
  },
  {
    label: "Atorvastatin",
    dosage: ["1 tablet", "1/2 tablet", "1/4 tablet"],
    frequency: ["OD (Night)"],
    duration: ["30 days"],
    type: "Statin",
  },
  {
    label: "Metformin",
    dosage: ["1 tablet", "1/2 tablet", "1/4 tablet"],
    frequency: ["BD (With meals)"],
    duration: ["30 days"],
    type: "Antidiabetic",
  },
];

const dummyTests = [
  "Complete Blood Count (CBC) with ESR",
  "Comprehensive Metabolic Panel (CMP)",
  "Lipid Profile (Cholesterol, Triglycerides)",
  "Thyroid Function Test (T3, T4, TSH)",
  "Liver Function Test (ALT, AST, Bilirubin)",
  "Renal Function Test (Creatinine, BUN)",
  "HbA1c (Glycated Hemoglobin)",
  "Urine Routine & Microscopy",
  "ECG (12 Lead Electrocardiogram)",
  "Chest X-ray PA View",
  "Ultrasound Abdomen & Pelvis",
  "MRI Brain (With Contrast)",
  "Vitamin D3 (25-OH) Levels",
  "Serum Iron Studies (Ferritin, TIBC)",
  "CRP (C-Reactive Protein) Quantitative",
  "D-Dimer (Quantitative)",
  "PSA (Prostate Specific Antigen)",
  "PAP Smear (Cervical Cytology)",
  "Stool Routine & Occult Blood",
];

const frequencyOptions = [
  "OD (Once daily)",
  "BD (Twice daily)",
  "TDS (Thrice daily)",
  "QID (Four times daily)",
  "SOS (As needed)",
  "Weekly",
  "Monthly",
];

const durationOptions = [
  "3 days",
  "5 days",
  "7 days",
  "10 days",
  "14 days",
  "21 days",
  "30 days",
  "45 days",
  "60 days",
];

const severityLevels = [
  "Mild",
  "Moderate",
  "Severe",
  "Very Severe",
  "Unbearable"
];

const durationSuggestions = [
  "1 day",
  "2-3 days",
  "1 week",
  "2 weeks",
  "1 month",
  "3 months",
  "6 months",
  "> 1 year"
];

// Add this with the other suggestion arrays
const complaintFrequencySuggestions = [
  "Continuous",
  "Intermittent",
  "Daily",
  "Weekly",
  "Monthly",
  "On and off",
  "During activity",
  "At rest",
  "At night",
  "In the morning"
];

// Add a constant for the localStorage key
const PRESCRIPTION_FORM_STATE_KEY = "prescriptionFormState";

// Change from a page to a reusable component with forwardRef
export const PrescriptionForm = forwardRef(({ 
  initialData , 
  initialize = false,
  appointmentId = null,
  onSubmit,
  readOnly = false,
  showPrintButton = true,
  showSubmitButton = true,
  hidePatientDetails = false,
  patientInfo = null
}, ref) => {
  // Initialize state with saved data or empty values
  const [prescription, setPrescription] = useState(() => {
    // Try to load saved state from localStorage
    const savedState = localStorage.getItem(PRESCRIPTION_FORM_STATE_KEY);
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        console.log("Restored prescription form state from localStorage");
        return parsedState.prescription || {
    patientName: "",
    age: "",
    gender: "",
    weight: "",
    vitals: {
      bloodPressure: "",
      heartRate: "",
      temperature: "",
      spO2: "",
      weight: "",
      height: "",
      bloodSugar: ""
    },
    medications: [
      { medicine: '', dose: '', timing: '', frequency: '', duration: '', notes: '', isEditing: false }
    ],
    complaints: [
      { complaint: '', severity: '', frequency: '', duration: '', notes: '', isEditing: false }
    ],
    diagnoses: [
      { diagnosis: '', duration: '', notes: '', isEditing: false }
    ],
    tests: [],
    instructions: "",
          followUp: null,
          signature: ""
        };
      } catch (error) {
        console.error("Error parsing saved prescription form state:", error);
        // Fall back to default initialData or empty state
      }
    }
    
    // Use initialData if provided or default to empty state
    return initialData || {
      patientName: "",
      age: "",
      gender: "",
      weight: "",
      vitals: {
        bloodPressure: "",
        heartRate: "",
        temperature: "",
        spO2: "",
        weight: "",
        height: "",
        bloodSugar: ""
      },
      medications: [
        { medicine: '', dose: '', timing: '', frequency: '', duration: '', notes: '', isEditing: false }
      ],
      complaints: [
        { complaint: '', severity: '', frequency: '', duration: '', notes: '', isEditing: false }
      ],
      diagnoses: [
        { diagnosis: '', duration: '', notes: '', isEditing: false }
      ],
      tests: [],
      instructions: "",
      followUp: null,
      signature: ""
    };
  });
  
  // Add states for mobile number search functionality
  const [mobileNumber, setMobileNumber] = useState(() => {
    // Try to load saved state from localStorage
    const savedState = localStorage.getItem(PRESCRIPTION_FORM_STATE_KEY);
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        return parsedState.mobileNumber || "";
      } catch (error) {
        return "";
      }
    }
    return "";
  });
  const [isSearching, setIsSearching] = useState(false);
  const [patientSearchResults, setPatientSearchResults] = useState(() => {
    // Try to load saved state from localStorage
    const savedState = localStorage.getItem(PRESCRIPTION_FORM_STATE_KEY);
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        return parsedState.patientSearchResults || [];
      } catch (error) {
        return [];
      }
    }
    return [];
  });
  const [searchError, setSearchError] = useState("");
  const [isPatientFromSearch, setIsPatientFromSearch] = useState(() => {
    // Try to load saved state from localStorage
    const savedState = localStorage.getItem(PRESCRIPTION_FORM_STATE_KEY);
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        return parsedState.isPatientFromSearch || false;
      } catch (error) {
        return false;
      }
    }
    return false;
  });
  
  // Add a state variable to store the complete patient details from API
  const [selectedPatientDetails, setSelectedPatientDetails] = useState(() => {
    // Try to load saved state from localStorage
    const savedState = localStorage.getItem(PRESCRIPTION_FORM_STATE_KEY);
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        return parsedState.selectedPatientDetails || null;
      } catch (error) {
        return null;
      }
    }
    return null;
  });
  
  const user = JSON.parse(localStorage.getItem("user"));
  
  // Extract cabin information using the standardized function
  const { cabinId, selectedSlot } = getCabinInfo(user);

  const [newTest, setNewTest] = useState("");
  const [signature, setSignature] = useState(() => {
    const savedState = localStorage.getItem(PRESCRIPTION_FORM_STATE_KEY);
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        return parsedState.signature || initialData.signature || "";
      } catch (error) {
        return initialData.signature || "";
      }
    }
    return initialData.signature || "";
  });
 
  console.log(initialData);

  // Initialize complaints with saved state, initialData, or default
  const [complaints, setComplaints] = useState(() => {
    // First try to get from localStorage
    const savedState = localStorage.getItem(PRESCRIPTION_FORM_STATE_KEY);
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        if (parsedState.complaints && Array.isArray(parsedState.complaints) && parsedState.complaints.length > 0) {
          return parsedState.complaints;
        }
      } catch (error) {
        console.error("Error parsing complaints from localStorage:", error);
      }
    }
    
    // If not in localStorage, use initialData or default
    return (initialData && initialData.complaints && Array.isArray(initialData.complaints) && initialData.complaints.length > 0) ?
    initialData.complaints :
      [{ complaint: '', severity: '', frequency: '', duration: '', notes: '', isEditing: false }];
  });

  // Add these dummy data arrays near your other dummy data
  const diagnosisDurationSuggestions = [
    "Acute",
    "Chronic",
    "1 month",
    "6 months",
    "1 year",
    "> 2 years",
    "Lifelong"
  ];

  const medicineDosePatterns = [
    "1-0-1",
    "1-1-1",
    "1-0-0",
    "0-0-1",
    "1/2-0-1/2",
    "1/2-0-0",
    "2-2-2",
    "SOS"
  ];

  const medicineTimings = [
    "Before breakfast",
    "After breakfast",
    "Before lunch",
    "After lunch",
    "Before dinner",
    "After dinner",
    "Empty stomach",
    "With meals",
    "SOS"
  ];

  const medicineFrequency = [
    "Daily",
    "Alternate days",
    "Weekly once",
    "Weekly twice",
    "Monthly once",
    "Every 6 hours",
    "Every 8 hours",
    "SOS"
  ];

  const medicineDuration = [
    "1 day",
    "3 days",
    "5 days",
    "1 week",
    "2 weeks",
    "1 month",
    "3 months",
    "6 months",
    "Lifelong"
  ];

  // Initialize diagnoses with saved state, initialData, or default
  const [diagnoses, setDiagnoses] = useState(() => {
    // First try to get from localStorage
    const savedState = localStorage.getItem(PRESCRIPTION_FORM_STATE_KEY);
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        if (parsedState.diagnoses && Array.isArray(parsedState.diagnoses) && parsedState.diagnoses.length > 0) {
          return parsedState.diagnoses;
        }
      } catch (error) {
        console.error("Error parsing diagnoses from localStorage:", error);
      }
    }
    
    // If not in localStorage, use initialData or default
    return (initialData && initialData.diagnoses && Array.isArray(initialData.diagnoses) && initialData.diagnoses.length > 0) ?
    initialData.diagnoses :
      [{ diagnosis: '', duration: '', notes: '', isEditing: false }];
  });

  // Initialize medications with saved state, initialData, or default
  const [medications, setMedications] = useState(() => {
    // First try to get from localStorage
    const savedState = localStorage.getItem(PRESCRIPTION_FORM_STATE_KEY);
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        if (parsedState.medications && Array.isArray(parsedState.medications) && parsedState.medications.length > 0) {
          return parsedState.medications;
        }
      } catch (error) {
        console.error("Error parsing medications from localStorage:", error);
      }
    }
    
    // If not in localStorage, use initialData or default
    return (initialData && initialData.medications && Array.isArray(initialData.medications) && initialData.medications.length > 0) ?
    initialData.medications :
      [{ medicine: '', dose: '', timing: '', frequency: '', duration: '', notes: '', isEditing: false }];
  });

  // Ensure all rows have isEditing property and other required fields
  useEffect(() => {
    // Check if any medication is missing the isEditing property or other required fields
    const needsUpdate = medications.some(med => 
      med.isEditing === undefined || 
      med.medicine === undefined || 
      med.dose === undefined || 
      med.timing === undefined || 
      med.frequency === undefined || 
      med.duration === undefined || 
      med.notes === undefined
    );
    
    if (needsUpdate) {
      console.log("Fixing medications state to ensure all properties exist");
      const updatedMedications = medications.map(med => ({
        medicine: med.medicine || '',
        dose: med.dose || '',
        timing: med.timing || '',
        frequency: med.frequency || '',
        duration: med.duration || '',
        notes: med.notes || '',
        isEditing: med.isEditing || false
      }));
      setMedications(updatedMedications);
    }
  }, [medications]);

  // Add new state variables for past prescriptions
  const [pastPrescriptionsOpen, setPastPrescriptionsOpen] = useState(false);
  const [pastPrescriptions, setPastPrescriptions] = useState([]);
  const [isLoadingPrescriptions, setIsLoadingPrescriptions] = useState(false);

  // Template management states
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const [loadTemplateOpen, setLoadTemplateOpen] = useState(false);
  const [currentTemplateType, setCurrentTemplateType] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [availableTemplates, setAvailableTemplates] = useState([]);
  const [searchTemplate, setSearchTemplate] = useState('');
  const [editTemplateOpen, setEditTemplateOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  
  // Temporary states for editing template data
  const [tempMedications, setTempMedications] = useState([]);
  const [tempDiagnoses, setTempDiagnoses] = useState([]);
  const [tempComplaints, setTempComplaints] = useState([]);
  
  // Notification state
  const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });
  
  // Add state for suggested medicines
  const [suggestedMedicines, setSuggestedMedicines] = useState([]);
  const [medicineSearchQuery, setMedicineSearchQuery] = useState('');
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [loadingMedicineRows, setLoadingMedicineRows] = useState([]);

  // Add state for suggested diagnoses
  const [suggestedDiagnoses, setSuggestedDiagnoses] = useState([]);
  const [diagnosisSearchQuery, setDiagnosisSearchQuery] = useState('');
  const [isLoadingDiagnosisSuggestions, setIsLoadingDiagnosisSuggestions] = useState(false);  
  const [diagnosisSuggestions, setDiagnosisSuggestions] = useState([]);
  
  // Add state to track if a selection is in progress
  const [selectionInProgress, setSelectionInProgress] = useState(false);
  
  // Function to show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ open: true, message, type });
    setTimeout(() => {
      setNotification({ ...notification, open: false });
    }, 3000);
  };

  // Initialize templates on component mount
  // useEffect(() => {
  //   const initializeTemplates = async () => {
  //     try {
  //       // Get user and cabin info
  //       const user = JSON.parse(localStorage.getItem("user"));
  //       const { cabinId } = getCabinInfo(user);
        
  //       // Fetch templates for each type
  //       const [medicationTemplates, diagnosisTemplates, complaintTemplates] = await Promise.all([
  //         getTemplates('medicines', cabinId),
  //         getTemplates('diagnosis', cabinId),
  //         getTemplates('complaints', cabinId)
  //       ]);
        
  //       // Log the fetched templates
  //       console.log('Fetched templates:', {
  //         medications: medicationTemplates,
  //         diagnoses: diagnosisTemplates,
  //         complaints: complaintTemplates
  //       });
  //     } catch (error) {
  //       console.error('Error initializing templates:', error);
  //       showNotification('Failed to load templates', 'error');
  //     }
  //   };

  //   initializeTemplates();
  // }, []);

  // Expose form data to parent component via ref
  useEffect(() => {
    if (ref) {
      ref.current = {
        getFormData: () => {
          const formData = {
            complaints,
            diagnoses,
            medications,
            tests: prescription.tests || [],
            instructions: prescription.instructions || "",
            vitals: prescription.vitals || {},
          };
          console.log('Form data being exposed to parent:', JSON.stringify(formData));
          return formData;
        },
        submitForm: () => {
          
          const formData = {
            ...prescription,
            complaints,
            diagnoses,
            medications,
            signature
          };
          console.log('Form data being submitted via ref:', JSON.stringify(formData));
          
          if (onSubmit) {
            onSubmit(formData);
          }
        }
      };
    }
  }, [ref, prescription, complaints, diagnoses, medications, signature, onSubmit]);
  
  // Sync medications with prescription.medications
  useEffect(() => {
    if (prescription.medications && prescription.medications.length > 0) {
      // Check if they're different
      if (JSON.stringify(prescription.medications) !== JSON.stringify(medications)) {
        setMedications(prescription.medications);
      }
    }
  }, [prescription.medications]);
  
  // Add an effect to save the state to localStorage whenever it changes
  useEffect(() => {
    if (!readOnly) {  // Don't save if in read-only mode
      // Create a state object with all the form data
      const stateToSave = {
        prescription,
        complaints,
        diagnoses,
        medications,
        signature,
        mobileNumber,
        patientSearchResults,
        isPatientFromSearch,
        selectedPatientDetails
      };
      
      // Save to localStorage
      localStorage.setItem(PRESCRIPTION_FORM_STATE_KEY, JSON.stringify(stateToSave));
      console.log("Saved prescription form state to localStorage");
    }
  }, [prescription, complaints, diagnoses, medications, signature, mobileNumber, 
      patientSearchResults, isPatientFromSearch, selectedPatientDetails, readOnly]);
  
  // Add a cleanup function to clear localStorage when form is submitted successfully
  const clearSavedFormState = () => {
    localStorage.removeItem(PRESCRIPTION_FORM_STATE_KEY);
    console.log("Cleared saved prescription form state");
  };
  
  // Add a state for isSubmitting (for the submit button loader)
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add a state for prefillLoading (for the backdrop when loading patient details)
  const [prefillLoading, setPrefillLoading] = useState(false);
  
  // Update handleSubmit to use selectedPatientDetails for API calls
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Set submitting state to show loader
    setIsSubmitting(true);
    
    // Debug output for medications
    console.log('Medications state before submission:', JSON.stringify(medications));
    
    // Prepare the complete data to send to parent component
    const formData = {
      ...prescription,
      complaints,
      diagnoses,
      medications,
      signature
    };
    
    console.log('Form data being submitted:', JSON.stringify(formData));
    
    try {
      // Get user and cabin information
      const user = JSON.parse(localStorage.getItem("user"));
      const { cabinId, selectedSlot } = getCabinInfo(user);
      
      if (!cabinId || !selectedSlot) {
        showNotification("Unable to retrieve cabin information", "error");
        return;
      }
      
      let appointmentId = null;
      let patientId = null;
      
      // First check if we have patient info (meaning a patient was selected from search)
      if (selectedPatientDetails) {
        console.log("Using stored patient details for patient ID:", patientId);
        
        // STEP 1: Check the current_appointment field from getPatientDetails
        if (selectedPatientDetails.current_appointment) {
          // STEP 2: Patient has a current appointment, use it directly
          appointmentId = selectedPatientDetails.current_appointment.appointment_id;
          console.log(`Using existing current appointment: ${appointmentId} - Skipping addAppointment API`);
        } 
        // STEP 3: Patient does NOT have a current appointment, create a new one
        else {
          console.log("Current appointment is NULL, creating new appointment with addAppointment API");
          
          if (prescription.patientName && mobileNumber) {
            try {
              // Get max token for the appointment
              const maxToken = await getMaxTokenNumber(cabinId, selectedSlot);
              const tokenNumber = maxToken + 1;
              
              console.log(`Creating new appointment with token: ${tokenNumber}`);
              
              // Create new appointment using addAppointment API
              const appointmentResult = await addAppointment({
                cabinId: cabinId,
                slot: selectedSlot,
                name: prescription.patientName,
                token: tokenNumber,
                disease: "",
                appointment_type: "New",
                phone_number: mobileNumber,
                age: prescription.age,
                gender: prescription.gender === "Male" ? "M" : prescription.gender === "Female" ? "F" : "O",
                location: selectedPatientDetails.patient.location || "",
                guardian: selectedPatientDetails.patient.guardian || "",
                fees_paid: 0,
                mode: "",
                paid: false,
                checkin: true
              });
              
              console.log("Appointment created response:", appointmentResult);
              
              // Extract appointment_id from the addAppointment response
              if (appointmentResult && appointmentResult.appointment_id) {
                appointmentId = appointmentResult.appointment_id;
                console.log(`Created new appointment: ${appointmentId} for patient: ${patientId}`);
                
                // Notify the user about the new appointment
                const tokenNumber = appointmentResult.queue?.appointment?.token || "Unknown";
                showNotification(`New appointment created with token: ${tokenNumber}`, "success");
              } else {
                throw new Error("Failed to get appointment ID from response");
              }
            } catch (error) {
              console.error("Error creating appointment:", error);
              showNotification(`Failed to create appointment: ${error.message}`, "error");
              return;
            }
          } else {
            showNotification("Patient information is incomplete. Please fill name and mobile number.", "error");
            return;
          }
        }
      } else {debugger;
        console.log("Current appointment is NULL, creating new appointment with addAppointment API");
          
        if (prescription.patientName && mobileNumber) {
          try {
            // Get max token for the appointment
            const maxToken = await getMaxTokenNumber(cabinId, selectedSlot);
            const tokenNumber = maxToken + 1;
            
            console.log(`Creating new appointment with token: ${tokenNumber}`);
            
            // Create new appointment using addAppointment API
            const appointmentResult = await addAppointment({
              cabinId: cabinId,
              slot: selectedSlot,
              name: prescription.patientName,
              token: tokenNumber,
              disease: "",
              appointment_type: "New",
              phone_number: mobileNumber,
              age: prescription.age,
              gender: prescription.gender === "Male" ? "M" : prescription.gender === "Female" ? "F" : "O",
              fees_paid: 0,
              mode: "",
              paid: false,
              checkin: true
            });
            
            console.log("Appointment created response:", appointmentResult);
            
            // Extract appointment_id from the addAppointment response
            if (appointmentResult && appointmentResult.appointment_id) {
              appointmentId = appointmentResult.appointment_id;
              console.log(`Created new appointment: ${appointmentId} for patient: ${patientId}`);
              
              // Notify the user about the new appointment
              const tokenNumber = appointmentResult.queue?.appointment?.token || "Unknown";
              showNotification(`New appointment created with token: ${tokenNumber}`, "success");
            } else {
              throw new Error("Failed to get appointment ID from response");
            }
          } catch (error) {
            console.error("Error creating appointment:", error);
            showNotification(`Failed to create appointment: ${error.message}`, "error");
            return;
          }
        } else {
          showNotification("Patient information is incomplete. Please fill name and mobile number.", "error");
          return;
        }       
      }
      
      // STEP 4: Now save the prescription using the appointment ID (either from current_appointment or newly created)
      if (appointmentId) {
        console.log(`Using appointment ID: ${appointmentId} to save prescription`);
        
        // Prepare prescription payload
        const prescriptionPayload = {
          appointment_id: appointmentId,
          cabin_id: cabinId,
          complaints: complaints.filter(c => c.complaint).map(c => ({
            name: c.complaint,
            severity: c.severity,
            frequency: c.frequency,
            duration: c.duration,
            notes: c.notes
          })),
          diagnosis: diagnoses.filter(d => d.diagnosis).map(d => ({
            name: d.diagnosis,
            duration: d.duration,
            notes: d.notes
          })),
          medicines: medications.filter(m => m.medicine).map(m => ({
            name: m.medicine,
            dose: m.dose,
            when: m.timing,
            frequency: m.frequency,
            duration: m.duration,
            notes: m.notes
          })),
          vitals: {
            pulse_rate: prescription.vitals.heartRate,
            blood_pressure: prescription.vitals.bloodPressure,
            temperature: prescription.vitals.temperature,
            spo2: prescription.vitals.spO2,
            weight: prescription.vitals.weight || prescription.weight,
            height: prescription.vitals.height,
            blood_sugar: prescription.vitals.bloodSugar
          },
          // Send tests as a direct array without wrapping in object
          tests: prescription.tests,
          // Send advice as a direct string without wrapping in array of objects
          advice: prescription.instructions || "",
          signature: signature
        };
        
        console.log("Saving prescription:", JSON.stringify(prescriptionPayload, null, 2));
        
        try {
          const savedPrescription = await savePrescription(prescriptionPayload);
          console.log("Prescription saved successfully:", savedPrescription);
          showNotification("Prescription saved successfully", "success");
          
          // Clear the saved form state since submission was successful
          localStorage.removeItem(PRESCRIPTION_FORM_STATE_KEY);
          
          // Reset the form 
          resetPrescription();
          
        } catch (error) {
          console.error("Error saving prescription:", error);
          showNotification(`Failed to save prescription: ${error.message}`, "error");
          return;
        }
      } else {
        showNotification("No appointment ID. Cannot save prescription.", "error");
        return;
      }
      
      // Call the onSubmit function passed as prop if available
    if (onSubmit) {
      onSubmit(formData);
      }
    } catch (error) {
      console.error("Error in submission process:", error);
      showNotification(`Submission failed: ${error.message}`, "error");
    } finally {
      // Always set submitting to false when done
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPrescription({ ...prescription, [name]: value });
  };

  const handleMedicineChange = (value, index) => {
    const meds = [...prescription.medications];
    meds[index].medicine = value?.label || value;

    const selectedMedicine = dummyMedicines.find((m) => m.label === value?.label);
    if (selectedMedicine) {
      meds[index].dose = selectedMedicine.doses[0];
      meds[index].frequency = selectedMedicine.frequency[0];
      meds[index].duration = selectedMedicine.duration[0];
    }

    setPrescription({ ...prescription, medications: meds });
  };

  useEffect(()=>{
    console.log(prescription);
    console.log(complaints);
    console.log(medications);
    console.log(diagnoses);
  
  },[prescription, complaints, medications, diagnoses,])

  const handleCheckboxChange = (index) => {
    const meds = [...prescription.medications];
    meds[index].withFood = !meds[index].withFood;
    setPrescription({ ...prescription, medications: meds });
  };

  const addMedication = () => {
    if (readOnly) return;
    
    setPrescription({
      ...prescription,
      medications: [
        ...prescription.medications,
        { medicine: "", dose: "", frequency: "", duration: "", withFood: false },
      ],
    });
  };

  const removeMedication = (index) => {
    if (readOnly) return;
    
    const meds = [...prescription.medications];
    meds.splice(index, 1);
    setPrescription({ ...prescription, medications: meds });
  };

  const handleTestChange = (value) => {
    setNewTest(value);
  };

  const addTest = (value) => {
    if (readOnly) return;
    
    if (value && !prescription.tests.includes(value)) {
      setPrescription({
        ...prescription,
        tests: [...prescription.tests, value],
      });
    }
  };

  const removeTest = (index) => {
    if (readOnly) return;
    
    const updatedTests = [...prescription.tests];
    updatedTests.splice(index, 1);
    setPrescription({ ...prescription, tests: updatedTests });
  };

  const handleFollowUpChange = (date) => {
    setPrescription({
      ...prescription,
      followUp: date ? date.format("YYYY-MM-DD") : "",
    });
  };

  // Add this function near your other handlers
  const handleClickAway = (index) => {
    // Debug point 1: When clicking away from a complaint field
    console.log('Clicking away from complaint row:', index);
    
    const updatedComplaints = [...complaints];
    
    // Add safety check to ensure the element at index exists
    if (updatedComplaints[index]) {
      // Only update isEditing, preserve all other data
      updatedComplaints[index] = {
        ...updatedComplaints[index],
        isEditing: false
      };
      
      console.log('Updated complaints after click away:', updatedComplaints);
      // Update both states
      setComplaints(updatedComplaints);
      setPrescription(prev => ({
        ...prev,
        complaints: updatedComplaints
      }));
    }
  };

  // Also modify the handleComplaintChange function to include the auto-close behavior
  const handleComplaintChange = (index, field, value) => {
    const updatedComplaints = [...complaints];
    
    // Add safety check to ensure the element at index exists
    if (!updatedComplaints[index]) {
      updatedComplaints[index] = { complaint: '', severity: '', frequency: '', duration: '', notes: '', isEditing: false };
    }
    
    updatedComplaints[index][field] = value;
    
    // Check if all main fields in the current row have values
    const currentRow = updatedComplaints[index];
    const hasAllMainFields = currentRow.complaint && currentRow.severity && currentRow.duration;

    // If all main fields are filled and this is the last row, add a new row
    if (hasAllMainFields && index === complaints.length - 1) {
      // Add a small delay to ensure the current row's state is updated
      setTimeout(() => {
        const newComplaints = [
          ...updatedComplaints,
          {
            complaint: '',
            severity: '',
            frequency: '',
            duration: '',
            notes: '',
            isEditing: false
          }
        ];
        
        setComplaints(newComplaints);
        setPrescription(prev => ({
          ...prev,
          complaints: newComplaints
        }));
      }, 10);
    } else {
      // Update the current row without adding a new one
      setComplaints(updatedComplaints);
      setPrescription(prev => ({
        ...prev,
        complaints: updatedComplaints
      }));
    }
  };

  // Modify addNewComplaintRow to prevent auto-opening dropdown
  const addNewComplaintRow = () => {
    if (readOnly) return;
    
    // Debug point 6: Start of adding new complaint row
    console.log('Adding new complaint row');
    
    // Use the standalone complaints state 
    const updatedComplaints = [...complaints];
    
    // Add safety check to ensure the last element exists
    if (updatedComplaints.length > 0) {
      updatedComplaints[updatedComplaints.length - 1].isEditing = false;
    }
    
    setTimeout(() => {
      // Debug point 7: Before setting state with new empty row
      const newComplaints = [
        ...updatedComplaints,
        { 
          complaint: '', 
          severity: '', 
          frequency: '',
          duration: '', 
          notes: '', 
          isEditing: false 
        }
      ];
      
      console.log('New complaints state to be set:', newComplaints);
      
      // Update both states
      setComplaints(newComplaints);
      setPrescription(prev => ({
        ...prev,
        complaints: newComplaints
      }));
      
      const newIndex = complaints.length;
      const element = document.querySelector(`#complaint-${newIndex}`);
      if (element && element.querySelector('input')) {
        element.querySelector('input').focus();
      }
    }, 200);
  };

  // Add useEffect to monitor complaints state changes
  useEffect(() => {
     // Debug point 8: Whenever complaints state changes
    console.log('Complaints state updated:', prescription.complaints);
  }, [prescription.complaints]);

  // Add these handler functions
  const handleDiagnosisChange = (index, field, value) => {
    console.log('Diagnosis change:', { index, field, value });
    // Set selection in progress first
    handleSelectionStart();
    
    // Update the diagnosis
    const updatedDiagnoses = [...diagnoses];
    updatedDiagnoses[index] = {
      ...updatedDiagnoses[index],
      [field]: value
    };
    
    // If we're updating the diagnosis field, set isEditing to false
    if (field === 'diagnosis') {
      updatedDiagnoses[index].isEditing = false;
    }
    
    // Delay clearing suggestions to ensure selection is processed
      setTimeout(() => {
      setSuggestedDiagnoses(prev => {
        const newSuggestions = [...prev];
        newSuggestions[index] = [];
        return newSuggestions;
      });
      setDiagnosisSearchQuery('');
      }, 10);
    
    // Update both state variables
      setDiagnoses(updatedDiagnoses);
    setPrescription(prev => ({
      ...prev,
      diagnoses: updatedDiagnoses
    }));
  };

  const handleMedicationChange = (index, field, value) => {
    console.log('Medication change:', { index, field, value });
    // Set selection in progress first
    handleSelectionStart();
    
     // Debug point 1: When medication field is changed
    console.log('Before update - medications state:', JSON.stringify(medications));
    
    // Update the medication
    const updatedMedications = [...medications];
    updatedMedications[index] = {
      ...updatedMedications[index],
      [field]: value
    };
    
    // If we're updating the medicine field, set isEditing to false
    if (field === 'medicine') {
      updatedMedications[index].isEditing = false;
    }
    console.log(medications);
    
    console.log('After update - updatedMedications:', JSON.stringify(updatedMedications));
    
    // Delay clearing suggestions to ensure selection is processed
    setTimeout(() => {
      setSuggestedMedicines(prev => {
        const newSuggestions = [...prev];
        newSuggestions[index] = [];
        return newSuggestions;
      });
      setMedicineSearchQuery('');
    }, 100);
    
    // Update both state variables
    setMedications(updatedMedications);
    setPrescription(prev => ({
      ...prev,
      medications: updatedMedications
    }));
    
     // Debug point 2: After medications state is updated
    console.log('Final medications state after update:', JSON.stringify(updatedMedications));
  };

  const handleMedicationClickAway = (index) => {
    console.log(`Handling medication click away for row ${index}`);
    const updatedMedications = [...medications];
    updatedMedications[index] = {
      ...updatedMedications[index],
      isEditing: false
    };
    
    // Update both state variables
    setMedications(updatedMedications);
    setPrescription(prev => ({
      ...prev,
      medications: updatedMedications
    }));
    
    // Ensure we clear suggestions and search query
    setSuggestedMedicines([]);
    setMedicineSearchQuery('');
  };

  // Modify addNewDiagnosisRow to update both state variables
  const addNewDiagnosisRow = () => {
    if (readOnly) return;
    
    // Use the standalone diagnoses state
    const updatedDiagnoses = [...diagnoses];
    // Add safety check to ensure the last element exists
    if (updatedDiagnoses.length > 0) {
      updatedDiagnoses[updatedDiagnoses.length - 1].isEditing = false; // Close the current row
    }
    
    // Update diagnoses state to close dropdown
    setDiagnoses(updatedDiagnoses);

    setTimeout(() => {
      // Create the new row
      const newRow = { diagnosis: '', duration: '', notes: '', isEditing: false };
      const finalDiagnoses = [...updatedDiagnoses, newRow];
      
      // Update both state variables
      setDiagnoses(finalDiagnoses);
      setPrescription(prev => ({
        ...prev,
        diagnoses: finalDiagnoses
      }));
      
      // Focus the new row
        const newIndex = diagnoses.length;
        const element = document.querySelector(`#diagnosis-${newIndex}`);
        if (element && element.querySelector('input')) {
            element.querySelector('input').focus();
        }
    }, 200);
  };

  // Modify addNewMedicationRow to update both state variables
  const addNewMedicationRow = () => {
    // Create the new row
    const newRow = { medicine: '', dose: '', timing: '', frequency: '', duration: '', notes: '', isEditing: false };
    const updatedMedications = [...medications, newRow];
    
    // Update both state variables
    setMedications(updatedMedications);
    setPrescription(prev => ({
      ...prev,
      medications: updatedMedications
    }));
  };

  // Add these click-away handlers
  const handleDiagnosisClickAway = (index) => {
    // Close the dropdown for the specific row, regardless of field completion
    const updatedDiagnoses = [...diagnoses];
    if (updatedDiagnoses[index]) {
      updatedDiagnoses[index].isEditing = false;
      setDiagnoses(updatedDiagnoses);
      
      // Also update the prescription state
      setPrescription(prev => ({
        ...prev,
        diagnoses: updatedDiagnoses
      }));
    }
  };

  // Function to load past prescriptions
  const loadPastPrescriptions = async () => {
    try {
      // Get cabinId from user
      const { cabinId } = getCabinInfo(user);
      
      console.log("Loading prescriptions for patient:", patientInfo);
      
      setIsLoadingPrescriptions(true);
      try {
        // Import the fetchPastPrescriptions function from the fixed service
        const { getPastPrescriptions  } = await import('../services/api');
        
        // Fetch past prescriptions for the patient
        
        console.log("Calling fetchPastPrescriptions with ID:", patientInfo.id);
        const response = await getPastPrescriptions(patientInfo.id, cabinId);
        console.log("Fetched prescriptions response:", response);
        
        // Handle the new response structure
        let prescriptions = [];
        
        if (!response) {
          console.warn("No response received from fetchPastPrescriptions");
          showNotification("No past prescriptions data available", "warning");
        } else if (response.prescription && Array.isArray(response.prescription)) {
          // Map the new structure to match the expected format
          prescriptions = response.prescription.map((item, index) => ({
            id: index, // Generate an id if not present
            date: new Date().toISOString(), // Use current date if not present
            medications: item.medicines && item.medicines.length > 0 ? 
              // Map medicines to the expected format
              item.medicines.map(med => ({
                medicine: med.name || '',
                dose: med.dose || '',
                timing: med.when || '',
                frequency: med.frequency || '',
                duration: med.duration || '',
                notes: med.notes || ''
              })) : []
          }));
          
          // Filter out prescriptions with no medications
        }
        
        // Set the past prescriptions state
        setPastPrescriptions(prescriptions);
        
        // Open the modal to display past prescriptions
        setPastPrescriptionsOpen(true);
        
      } catch (error) {
        console.error("Error fetching past prescriptions:", error);
        showNotification("Failed to load past prescriptions", "error");
      } finally {
        setIsLoadingPrescriptions(false);
      }
    } catch (error) {
      console.error("Error in loadPastPrescriptions:", error);
    }

    if (!patientInfo || !patientInfo.id) {
      console.warn("No patient information available", patientInfo);
      showNotification("No patient information available", "warning");
      return;
    }
  };
  
  // Function to copy medications from a past prescription
  const copyMedicationsFromPast = (pastMedications) => {
    if (!pastMedications || pastMedications.length === 0) {
      showNotification('No medications to copy', 'warning');
      return;
    }

    console.log('Copying medications from past prescription:', pastMedications);

    // Create a new array with existing medications plus the past ones
    const newMedications = [...medications];
    
    // Add each past medication to the current medications list
    pastMedications.forEach(med => {
      if (med.medicine && med.medicine.trim()) {
        newMedications.push({
          medicine: med.medicine || '',
          dose: med.dose || '',
          timing: med.timing || '',
          frequency: med.frequency || '',
          duration: med.duration || '',
          notes: med.notes || '',
          isChecked: false
        });
      }
    });

    // Update the medications state
    setMedications(newMedications);
    
    // Show success notification
    showNotification('Medications copied successfully', 'success');
  };

  // Function to load a template
  const handleLoadTemplate = (template) => {
    let itemCount = 0;
    
    switch (currentTemplateType) {
      case 'medications':
        // Transform API format to component format
        const medicationsData = template.data.map(item => ({
          medicine: item.medicine || item.name || '',
            dose: item.dose || '',
          timing: item.timing || item.when || '',
            frequency: item.frequency || '',
            duration: item.duration || '',
            notes: item.notes || '',
            isEditing: false
        }));
        
        itemCount = medicationsData.length;
        
        // Add empty row at the end
        medicationsData.push({
          medicine: '',
          dose: '',
          timing: '',
          frequency: '',
          duration: '',
          notes: '',
            isEditing: false
          });
        
        setMedications(medicationsData);
        break;

      case 'diagnoses':
        // Transform API format to component format
        const diagnosesData = template.data.map(item => ({
          diagnosis: item.diagnosis || item.name || '',
            duration: item.duration || '',
            notes: item.notes || '',
            isEditing: false
        }));
        
        itemCount = diagnosesData.length;
        
        // Add empty row at the end
        diagnosesData.push({
          diagnosis: '',
          duration: '',
          notes: '',
            isEditing: false
          });
        
        setDiagnoses(diagnosesData);
        break;

      case 'complaints':
        // Transform API format to component format
        const complaintsData = template.complaints.map(item => ({
            complaint: item.name || '',
            severity: item.severity || '',
            frequency: item.frequency || '',
          duration: item.duration || '',
            notes: item.notes || '',
            isEditing: false
        }));
        
        itemCount = complaintsData.length;
        
        // Add empty row at the end
        complaintsData.push({
            complaint: '',
            severity: '',
            frequency: '',
          duration: '',
            notes: '',
            isEditing: false
          });
        
        // Update both states
        setComplaints(complaintsData);
        setPrescription(prev => ({
          ...prev,
          complaints: complaintsData
        }));
        break;
    }
    
    handleLoadTemplateClose();
    showNotification(`Successfully loaded ${itemCount} items from "${template.name}" template`);
  };

  // Function to delete a template
  const handleDeleteTemplate = async (templateName) => {
    if (window.confirm(`Are you sure you want to delete the template "${templateName}"?`)) {
      try {
        // Get user and cabin info
        const user = JSON.parse(localStorage.getItem("user"));
        const { cabinId } = getCabinInfo(user);
        
        // Determine the API template type
        let templateType;
        switch (currentTemplateType) {
          case 'medications':
            templateType = 'medicines';
            break;
          case 'diagnoses':
            templateType = 'diagnosis';
            break;
          case 'complaints':
            templateType = 'complaints';
            break;
          default:
            templateType = currentTemplateType;
        }
        
        // Delete the template using the API
        await deleteTemplate(templateType, templateName, cabinId);
        console.log(`Template "${templateName}" deleted successfully from API`);
        
        // Refresh the templates list
        const updatedTemplates = await getTemplates(templateType, cabinId);
        setAvailableTemplates(transformTemplates(updatedTemplates, currentTemplateType));
        
        // Show success notification
        showNotification(`Template "${templateName}" deleted successfully`);
      } catch (error) {
        console.error('Error deleting template:', error);
        showNotification(`Failed to delete template: ${error.message}`, 'error');
      }
    }
  };

  // Function to open edit template dialog
  const handleEditTemplateOpen = (e, template) => {
    e.stopPropagation(); // Prevent triggering the accordion or loading the template
    
    // Clone the template to avoid direct mutation of the original template data
    const templateCopy = {
      ...template,
      data: JSON.parse(JSON.stringify(template.data)) // Deep clone the data array
    };
    
    setEditingTemplate(templateCopy);
    setTemplateName(template.name);
    
    // Based on the template type, prepare temporary state for editing
    switch (currentTemplateType) {
      case 'medications':
        setTempMedications(templateCopy.data);
        break;
      case 'diagnoses':
        setTempDiagnoses(templateCopy.data);
        break;
      case 'complaints':
        setTempComplaints(templateCopy.data);
        break;
    }
    
    setEditTemplateOpen(true);
  };

  // Function to close edit template dialog
  const handleEditTemplateClose = () => {
    setEditingTemplate(null);
    setTemplateName('');
    setTempMedications([]);
    setTempDiagnoses([]);
    setTempComplaints([]);
    setEditTemplateOpen(false);
  };

  // Function to save edited template
  const handleSaveEditedTemplate = async () => {
    if (!templateName.trim()) {
      alert('Please enter a template name');
      return;
    }

    // Get the edited data based on template type
    let updatedData;
    switch (currentTemplateType) {
      case 'medications':
        updatedData = tempMedications.filter(med => med.medicine && med.medicine.trim());
        break;
      case 'diagnoses':
        updatedData = tempDiagnoses.filter(diag => diag.diagnosis && diag.diagnosis.trim());
        break;
      case 'complaints':
        updatedData = tempComplaints.filter(comp => comp.complaint && comp.complaint.trim());
        break;
      default:
        updatedData = [];
    }

    if (updatedData.length === 0) {
      alert('Template must contain at least one item');
      return;
    }

    // Get user and cabin info
    const user = JSON.parse(localStorage.getItem("user"));
    const { cabinId } = getCabinInfo(user);

    // Determine the API template type
    let templateType;
    switch (currentTemplateType) {
      case 'medications':
        templateType = 'medicines';
        break;
      case 'diagnoses':
        templateType = 'diagnosis';
        break;
      case 'complaints':
        templateType = 'complaints';
        break;
      default:
        templateType = currentTemplateType;
    }

    // Prepare the payload based on template type
    let payload;
    switch (currentTemplateType) {
      case 'medications':
        payload = {
          name: templateName,
          items: updatedData.map(med => ({
            name: med.medicine,
            dose: med.dose,
            when: med.timing,
            frequency: med.frequency,
            duration: med.duration,
            notes: med.notes
          }))
        };
        break;
      case 'diagnoses':
        payload = {
          name: templateName,
          items: updatedData.map(diag => ({
            name: diag.diagnosis,
            duration: diag.duration,
            notes: diag.notes
          }))
        };
        break;
      case 'complaints':
        payload = {
          name: templateName,
          items: updatedData.map(complaint => ({
            name: complaint.complaint,
            severity: complaint.severity,
            frequency: complaint.frequency,
            duration: complaint.duration,
            notes: complaint.notes
          }))
        };
        break;
    }

    try {
      // If the name changed, we need to delete the old template first
      if (templateName !== editingTemplate.name) {
        try {
          await deleteTemplate(templateType, editingTemplate.name, cabinId);
          console.log(`Old template "${editingTemplate.name}" deleted from API`);
          } catch (error) {
          console.error(`Error deleting old template "${editingTemplate.name}":`, error);
        }
      }

      // Save the edited template
      await editTemplate(templateType, templateName, cabinId, payload);
        console.log(`Template "${templateName}" updated in API`);
      
      // Refresh the templates list
      const apiTemplates = await getTemplates(templateType, cabinId);
      setAvailableTemplates(transformTemplates(apiTemplates, currentTemplateType));
      
      // Close the edit dialog and show notification
      handleEditTemplateClose();
      showNotification(`Template "${templateName}" has been updated successfully!`);
    } catch (error) {
      console.error(`Error editing template:`, error);
      showNotification(`Failed to update template: ${error.message}`, 'error');
    }
  };

  // Function to fetch medicine suggestions
  const fetchMedicineSuggestions = async (query) => {
     // Debug point 25: Start of fetchMedicineSuggestions
    // Ensure query is trimmed and not empty
    if (!query || query.trim().length === 0) return [];
    
    try {
      console.log('Fetching medicine suggestions for query:', query);
       // Debug point 26: Before calling suggestMedicine API
      const suggestions = await suggestMedicine(query);
       // Debug point 27: After receiving suggestions from API
      console.log('API response for medicine suggestions:', JSON.stringify(suggestions, null, 2));
      
      const mappedSuggestions = suggestions.map(medicine => {
         // Debug point 28: Processing each medicine suggestion
        console.log('Processing medicine suggestion:', JSON.stringify(medicine, null, 2));
        return {
          value: medicine.name, // This is what gets displayed in the input after selection
          label: (
            <div>
              <div style={{ fontWeight: 'bold' }}>{medicine.name}</div>
              {medicine.generic_name && (
                <div style={{ fontSize: '0.8em', color: '#666' }}>
                  {medicine.generic_name}
                </div>
              )}
              {medicine.dose && (
                <div style={{ fontSize: '0.8em', color: '#666' }}>
                  {medicine.dose} | {medicine.when} | {medicine.frequency} | {medicine.duration}
                </div>
              )}
            </div>
          ),
          data: medicine // Store the full medicine object for use later
        };
      });
      
       // Debug point 29: Final mapped suggestions
      console.log('Final mapped suggestions:', JSON.stringify(mappedSuggestions, null, 2));
      return mappedSuggestions;
    } catch (error) {
      console.error('Error fetching medicine suggestions:', error);
      return [];
    }
  };

  // Function to fetch diagnosis suggestions
  const fetchDiagnosisSuggestions = async (query) => {
    // Ensure query is trimmed and not empty
    if (!query || query.trim().length === 0) {
      setDiagnosisSuggestions([]);
      setIsLoadingDiagnosisSuggestions(false);
      return [];
    }
    
    try {
      setIsLoadingDiagnosisSuggestions(true);
      console.log('Fetching diagnosis suggestions for query:', query);
      const suggestions = await suggestDiagnosis(query);
      console.log('API response for diagnosis suggestions:', JSON.stringify(suggestions, null, 2));
      
      const mappedSuggestions = suggestions.map(diagnosis => {
        console.log('Processing diagnosis suggestion:', JSON.stringify(diagnosis, null, 2));
        return {
          value: diagnosis.name, // This is what gets displayed in the input after selection
          label: (
            <div>
              <div style={{ fontWeight: 'bold' }}>{diagnosis.name}</div>
              {diagnosis.description && (
                <div style={{ fontSize: '0.8em', color: '#666' }}>
                  {diagnosis.description}
                </div>
              )}
            </div>
          ),
          data: diagnosis // Store the full diagnosis object for use later
        };
      });
      
      console.log('Final mapped suggestions:', JSON.stringify(mappedSuggestions, null, 2));
      setDiagnosisSuggestions(mappedSuggestions);
      setIsLoadingDiagnosisSuggestions(false);
      return mappedSuggestions;
    } catch (error) {
      console.error('Error fetching diagnosis suggestions:', error);
      setIsLoadingDiagnosisSuggestions(false);
      setDiagnosisSuggestions([]);
      return [];
    }
  };

  // Debounce the medicine search to avoid too many API calls
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (medicineSearchQuery && medicineSearchQuery.length > 0) {
        fetchMedicineSuggestions(medicineSearchQuery);
      }
    }, 300); // 300ms debounce time
    
    return () => clearTimeout(debounceTimer);
  }, [medicineSearchQuery]);

  // Debounce the diagnosis search to avoid too many API calls
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (diagnosisSearchQuery && diagnosisSearchQuery.length > 0) {
        setIsLoadingDiagnosisSuggestions(true);
        fetchDiagnosisSuggestions(diagnosisSearchQuery);
      } else {
        setDiagnosisSuggestions([]);
      }
    }, 300); // 300ms debounce time
    
    return () => clearTimeout(debounceTimer);
  }, [diagnosisSearchQuery]);

  // Effect to handle template changes
  useEffect(() => {
    // ... existing code ...
  }, [currentTemplateType, templateName, availableTemplates, searchTemplate, editTemplateOpen, editingTemplate, tempMedications, tempDiagnoses, tempComplaints]);

  console.log("PrescriptionForm initialData:", initialData);

  // Add this useEffect to update state when initialData changes
  //
  // Add useEffect for initialization
  useEffect(() => {
    const initializePrescription = async () => {
      if (initialize && appointmentId) {
        try {
          const response = await getCurrentPrescription(appointmentId);
          console.log("Current prescription data:", response);

          // Create a new prescription object with the API response data
          const newPrescription = {
            ...prescription,
            vitals: {
              bloodPressure: response.vitals?.blood_pressure || "",
              heartRate: response.vitals?.pulse_rate || "",
              temperature: response.vitals?.temperature || "",
              spO2: response.vitals?.spo2 || "",
              weight: response.vitals?.weight || "",
              height: response.vitals?.height || "",
              bloodSugar: response.vitals?.blood_sugar || ""
            },
            complaints: [
              ...(response.complaints?.length > 0 
                ? response.complaints.map(complaint => ({
                    complaint: complaint.name || "",
                    severity: complaint.severity || "",
                    frequency: complaint.frequency || "",
                    duration: complaint.duration || "",
                    notes: complaint.notes || "",
                    isEditing: false
                  }))
                : []),
              { complaint: '', severity: '', frequency: '', duration: '', notes: '', isEditing: false }
            ],
            diagnoses: [
              ...(response.diagnosis?.length > 0
                ? response.diagnosis.map(diag => ({
                    diagnosis: diag.name || "",
                    duration: diag.duration || "",
                    notes: diag.notes || "",
                    isEditing: false
                  }))
                : []),
              { diagnosis: '', duration: '', notes: '', isEditing: false }
            ],
            medications: [
              ...(response.medicines?.length > 0
                ? response.medicines.map(med => ({
                    medicine: med.name || "",
                    dose: med.dose || "",
                    timing: med.when || "",
                    frequency: med.frequency || "",
                    duration: med.duration || "",
                    notes: med.notes || "",
                    isEditing: false
                  }))
                : []),
              { medicine: '', dose: '', timing: '', frequency: '', duration: '', notes: '', isEditing: false }
            ],
            tests: response.tests?.[0]?.testlist || [],
            instructions: response.advice?.[0]?.advice || "",
            followUp: "",
            signature: ""
          };
          
          setPrescription(newPrescription);
        } catch (error) {
          console.error("Error fetching prescription:", error);
        }
      }
    };

    // Only initialize if initialize is true and we haven't initialized before
    if (initialize) {
      initializePrescription();
    }
  }, [initialize, appointmentId]); // Remove prescription from dependencies to prevent re-initialization

  // Add this useEffect to handle medicine search
  useEffect(() => {
    const searchMedicines = async () => {
      // Trim the query before checking length
      const trimmedQuery = medicineSearchQuery.trim();
      
      // Only search if there are at least 2 characters after trimming
      if (trimmedQuery.length >= 2) {
        // Get the active row index from the window object
        const activeRowIndex = window.activeSearchRowIndex !== undefined 
          ? window.activeSearchRowIndex 
          : medications.findIndex(med => med.isEditing);
        
        if (activeRowIndex !== -1) {
          // Set loading state for the specific row
          setLoadingMedicineRows(prev => [...prev, activeRowIndex]);
        }
        
        try {
           // Debug point 30: Before calling fetchMedicineSuggestions in searchMedicines
          const suggestions = await fetchMedicineSuggestions(trimmedQuery);
           // Debug point 31: After receiving suggestions from fetchMedicineSuggestions
          console.log('Suggestions received in searchMedicines:', JSON.stringify(suggestions, null, 2));
          setSuggestedMedicines(suggestions);
        } catch (error) {
          console.error('Error fetching medicine suggestions:', error);
          setSuggestedMedicines([]);
        } finally {
          // Clear loading state for the active row
          if (activeRowIndex !== -1) {
            setLoadingMedicineRows(prev => prev.filter(idx => idx !== activeRowIndex));
          }
          // Clear the active row index
          window.activeSearchRowIndex = undefined;
        }
      } else {
        setSuggestedMedicines([]);
      }
    };

    const debounceTimer = setTimeout(searchMedicines, 300);
    return () => clearTimeout(debounceTimer);
  }, [medicineSearchQuery]);

  // Add a function to explicitly trigger a medicine search
  const triggerMedicineSearch = async (query, rowIndex) => {
     // Debug point 32: Start of triggerMedicineSearch
    // Trim the query and check if it's empty
    const trimmedQuery = query ? query.trim() : "";
    
    // If query is empty after trimming, don't hit the API
    if (!trimmedQuery || trimmedQuery.length === 0) {
      console.log("Search query is empty after trimming, skipping API call");
      return;
    }
    
    console.log("Manually triggering medicine search for:", trimmedQuery);
    setMedicineSearchQuery(trimmedQuery);
    
    // Set loading state for the specific row
    if (rowIndex !== undefined) {
      setLoadingMedicineRows(prev => [...prev, rowIndex]);
    }
    
    try {
       // Debug point 33: Before calling fetchMedicineSuggestions in triggerMedicineSearch
      console.log("Calling fetchMedicineSuggestions with query:", trimmedQuery);
      const suggestions = await fetchMedicineSuggestions(trimmedQuery);
       // Debug point 34: After receiving suggestions in triggerMedicineSearch
      console.log("Received suggestions:", suggestions.length, "items");
      console.log("Suggestions data:", JSON.stringify(suggestions, null, 2));
      setSuggestedMedicines(suggestions);
       // Debug point 35: After updating suggestedMedicines state
      console.log("Updated suggestedMedicines state");
    } catch (error) {
       // Debug point 36: Error in triggerMedicineSearch
      console.error("Error fetching medicine suggestions:", error);
    } finally {
      // Clear loading state for the specific row
      if (rowIndex !== undefined) {
        setLoadingMedicineRows(prev => prev.filter(idx => idx !== rowIndex));
      }
    }
  };

  // Add a global click listener to ensure dropdowns close when clicking outside
  useEffect(() => {
    const handleDocumentClick = (e) => {
      // Check if any medication row is in editing mode
      const hasEditingRow = medications.some(med => med.isEditing);
      
      if (hasEditingRow) {
        // Check if the click was outside the medication table
        const medicationTable = document.querySelector('.medication-table');
        
        // Check if the click was on an autocomplete dropdown or option
        const isAutocompleteClick = e.target.closest('.MuiAutocomplete-popper') || 
                                   e.target.closest('.MuiAutocomplete-option') ||
                                   e.target.closest('.MuiAutocomplete-listbox') ||
                                   e.target.closest('.MuiAutocomplete-paper');
        
        // If we're in selection mode, don't close dropdowns
        if (selectionInProgress) {
          console.log('Selection in progress, ignoring document click');
          return;
        }
        
        // Only close if click is outside medication table AND not on an autocomplete element
        if (medicationTable && !medicationTable.contains(e.target) && !isAutocompleteClick) {
          console.log('Click detected outside medication table and not on autocomplete, closing all dropdowns');
          
          // Close all editing rows
          const updatedMedications = medications.map(med => ({
            ...med,
            isEditing: false
          }));
          
          setMedications(updatedMedications);
          setSuggestedMedicines([]);
          setMedicineSearchQuery('');
        }
      }
    };
    
    // Add the event listener
    document.addEventListener('mousedown', handleDocumentClick);
    
    // Clean up
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
    };
  }, [medications, selectionInProgress]);

  // Add a function to handle selection start
  const handleSelectionStart = () => {
    setSelectionInProgress(true);
    // Clear the flag after a delay to ensure the selection is processed
    setTimeout(() => {
      setSelectionInProgress(false);
    }, 300);
  };

  const handleOptionClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    handleSelectionStart();
  };

  // Add useEffect to handle initialData changes
  useEffect(() => {
    if (initialData) {
      console.log('Setting initial data:', initialData);
      
      // Update complaints
      if (initialData.complaints && initialData.complaints.length > 0) {
        setComplaints(initialData.complaints);
      }
      
      // Update diagnoses
      if (initialData.diagnoses && initialData.diagnoses.length > 0) {
        setDiagnoses(initialData.diagnoses);
      }
      
      // Update medications
      if (initialData.medications && initialData.medications.length > 0) {
        setMedications(initialData.medications);
      }
      
      // Update prescription state
      setPrescription(prev => ({
        ...prev,
        ...initialData,
        vitals: {
          ...prev.vitals,
          ...initialData.vitals
        }
      }));
    }
  }, [initialData]);

  // Function to handle opening the save template dialog
  const handleSaveTemplateOpen = (templateType) => {
    setCurrentTemplateType(templateType);
    setTemplateName('');
    setSaveTemplateOpen(true);
  };

  // Function to handle closing the save template dialog
  const handleSaveTemplateClose = () => {
    setSaveTemplateOpen(false);
  };

  // Function to reset templates to defaults
  const handleResetTemplates = () => {
    if (window.confirm('This will reset all templates to defaults. Continue?')) {
      // Instead of using resetToDefaultTemplates, we'll just refresh from the API
      handleLoadTemplateOpen(currentTemplateType);
    }
  };

  // Function to handle opening the load template dialog
  const handleLoadTemplateOpen = async (templateType) => {
    setCurrentTemplateType(templateType);
    setLoadTemplateOpen(true);
    setLoadingTemplateType(templateType); // Set which button is loading
    
    try {
      // Get user and cabin info
      const user = JSON.parse(localStorage.getItem("user"));
      const { cabinId } = getCabinInfo(user);
      
      // Determine the API template type
      let apiTemplateType;
      switch (templateType) {
        case 'medications':
          apiTemplateType = 'medicines';
          break;
        case 'diagnoses':
          apiTemplateType = 'diagnosis';
          break;
        case 'complaints':
          apiTemplateType = 'complaints';
          break;
        default:
          apiTemplateType = templateType;
      }

      // Fetch templates from API
      const apiTemplates = await getTemplates(apiTemplateType, cabinId);
      console.log(`Templates fetched from API for ${templateType}:`, apiTemplates);
      
      // Only proceed if we have valid data
      if (apiTemplates && Array.isArray(apiTemplates)) {
        // For complaints, we can use the API response directly
        if (templateType === 'complaints') {
          setAvailableTemplates(apiTemplates);
        } else {
          // For other types, transform the data
          const transformedTemplates = transformTemplates(apiTemplates, currentTemplateType);
          console.log('Transformed templates:', transformedTemplates);
          setAvailableTemplates(transformedTemplates || []);
        }
      } else {
        console.warn('Invalid template data received:', apiTemplates);
        setAvailableTemplates([]);
      }
    } catch (error) {
      console.error(`Error fetching templates from API:`, error);
      showNotification(`Failed to load templates: ${error.message}`, 'error');
      setAvailableTemplates([]);
    } finally {
      setLoadingTemplateType(null); // Clear loading state
    }
  };

  // Function to handle closing the load template dialog
  const handleLoadTemplateClose = () => {
    setLoadTemplateOpen(false);
  };

  // Function to save a template
  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      showNotification('Please enter a template name', 'error');
      return;
    }

    let templateData;
    switch (currentTemplateType) {
      case 'medications':
        templateData = medications.filter(m => m.medicine && m.medicine.trim());
        break;
      case 'diagnoses':
        templateData = diagnoses.filter(d => d.diagnosis && d.diagnosis.trim());
        break;
      case 'complaints':
        templateData = complaints.filter(c => c.complaint && c.complaint.trim());
        break;
      default:
        templateData = [];
    }

    if (templateData.length === 0) {
      showNotification('No data to save as template', 'error');
      return;
    }

    // Get user and cabin info
    const user = JSON.parse(localStorage.getItem("user"));
    const { cabinId } = getCabinInfo(user);

    // Prepare the payload based on template type
    let payload;
    let templateType;
    switch (currentTemplateType) {
      case 'medications':
        payload = {
          name: templateName,
          items: templateData.map(med => ({
            name: med.medicine,
            dose: med.dose,
            when: med.timing,
            frequency: med.frequency,
            duration: med.duration,
            notes: med.notes
          }))
        };
        templateType = 'medicines';
        break;
      case 'diagnoses':
        payload = {
          name: templateName,
          items: templateData.map(diag => ({
            name: diag.diagnosis,
            duration: diag.duration,
            notes: diag.notes
          }))
        };
        templateType = 'diagnosis';
        break;
      case 'complaints':
        payload = {
          name: templateName,
          items: templateData.map(complaint => ({
            name: complaint.complaint,
            severity: complaint.severity,
            frequency: complaint.frequency,
            duration: complaint.duration,
            notes: complaint.notes
          }))
        };
        templateType = 'complaints';
        break;
    }

    try {
      // Save template using the API
      await saveTemplate(templateType, cabinId, payload);
      console.log(`Template "${templateName}" saved successfully to API`);
      
      // Close the dialog and show success notification
      handleSaveTemplateClose();
      showNotification(`Template "${templateName}" saved successfully`);
      
      // Refresh the templates list
      const updatedTemplates = await getTemplates(templateType, cabinId);
      setAvailableTemplates(transformTemplates(updatedTemplates, currentTemplateType));
    } catch (error) {
      console.error('Error saving template:', error);
      showNotification(`Failed to save template: ${error.message}`, 'error');
    }
  };

  // Update the transformTemplates function to handle null/undefined input
  const transformTemplates = (templates, type) => {
    // Add safety check for templates
    if (!templates || !Array.isArray(templates)) {
      console.warn('Invalid templates data received in transformTemplates:', templates);
      return [];
    }
    
    try {
      switch (type) {
        case 'complaints':
          return templates.map(template => ({
            id: template.id,
            name: template.name,
            data: template.complaints?.map(complaint => ({
              complaint: complaint.name || '',
              severity: complaint.severity || '',
              duration: complaint.duration || '',
              frequency: complaint.frequency || '',
              notes: complaint.notes || '',
              isEditing: false
            })) || []
          }));
        
        case 'diagnoses':
          return templates.map(template => ({
            id: template.id,
            name: template.name,
            data: template.diagnosis?.map(diagnosis => ({
              diagnosis: diagnosis.name || '',
              duration: diagnosis.duration || '',
              notes: diagnosis.notes || '',
              isEditing: false
            })) || []
          }));
        
        case 'medications':
          return templates.map(template => ({
            id: template.id,
            name: template.name,
            data: template.medicines?.map(medicine => ({
              medicine: medicine.name || '',
              dose: medicine.dose || '',
              timing: medicine.when || '',
              frequency: medicine.frequency || '',
              duration: medicine.duration || '',
              notes: medicine.notes || '',
              isEditing: false
            })) || []
          }));
        
        default:
          console.warn('Unknown template type:', type);
          return [];
      }
    } catch (error) {
      console.error('Error transforming templates:', error);
      return [];
    }
  };

  // Handle mobile number input change
  const handleMobileNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    setMobileNumber(value);
    
    
    
    // Clear previous search results when input changes
    if (value.length < 10) {
      setPatientSearchResults([]);
    }
    
    // Clear error when input changes
    if (searchError) {
      setSearchError("");
    }
    
    // When mobile number changes, reset the isPatientFromSearch flag
    // so that name, age, gender fields become editable
    setIsPatientFromSearch(false);
    
    // Auto-search when 10 digits are entered
    if (value.length === 10) {
      handleSearchPatient(value);
    }
  };
  
  // Search patient by mobile number
  const handleSearchPatient = async (phoneNumber) => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      setSearchError("Please enter a valid 10-digit mobile number");
      return;
    }
    
    setIsSearching(true);
    setSearchError("");
    
    try {
      const result = await getPatientProfile(phoneNumber);
      
      if (result && Array.isArray(result) && result.length > 0) {
        setPatientSearchResults(result);
      } else {
        // Remove the error message as requested
        // setSearchError("No patient found with this mobile number");
        setPatientSearchResults([]);
      }
    } catch (error) {
      console.error("Error searching patient:", error);
      setSearchError("Failed to search patient. Please try again.");
      setPatientSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Add the print handler function near the other handler functions
  const handlePrint = () => {
    // Format the data for printing
    const prescriptionData = {
      patientInfo: {
        name: prescription.patientName,
        id: patientInfo?.id || "",
        age: prescription.age,
        gender: prescription.gender,
      },
      appointmentInfo: {
        date: new Date().toISOString(),
        followUp: prescription.followUp,
      },
      vitals: {
        bloodPressure: prescription.vitals.bloodPressure,
        heartRate: prescription.vitals.heartRate,
        temperature: prescription.vitals.temperature,
        spO2: prescription.vitals.spO2,
        weight: prescription.vitals.weight || prescription.weight,
        height: prescription.vitals.height,
        bloodSugar: prescription.vitals.bloodSugar,
      },
      complaints: prescription.complaints
        .filter(c => c.complaint)
        .map(c => ({
          complaint: c.complaint,
          duration: c.duration,
          severity: c.severity,
          frequency: c.frequency,
          notes: c.notes,
        })),
      diagnoses: prescription.diagnoses
        .filter(d => d.diagnosis)
        .map(d => ({
          diagnosis: d.diagnosis,
          duration: d.duration,
          notes: d.notes,
        })),
      medications: prescription.medications
        .filter(m => m.medicine)
        .map(m => ({
          medicine: m.medicine,
          dose: m.dose,
          frequency: m.frequency,
          duration: m.duration,
          timing: m.timing,
          notes: m.notes,
        })),
      tests: prescription.tests,
      instructions: prescription.instructions,
      signature: prescription.signature,
    };

    // Print the prescription using the utility function
    printPrescription(prescriptionData);
  };

  // Add a function to reset the prescription form
  const resetPrescription = () => {
    // Reset all state to default values
    setPrescription({
      patientName: "",
      age: "",
      gender: "",
      weight: "",
      vitals: {
        bloodPressure: "",
        heartRate: "",
        temperature: "",
        spO2: "",
        weight: "",
        height: "",
        bloodSugar: ""
      },
      medications: [
        { medicine: '', dose: '', timing: '', frequency: '', duration: '', notes: '', isEditing: false }
      ],
      complaints: [
        { complaint: '', severity: '', frequency: '', duration: '', notes: '', isEditing: false }
      ],
      diagnoses: [
        { diagnosis: '', duration: '', notes: '', isEditing: false }
      ],
      tests: [],
      instructions: "",
      followUp: null,
      signature: ""
    });
    
    // Reset all other state variables
    setComplaints([{ complaint: '', severity: '', frequency: '', duration: '', notes: '', isEditing: false }]);
    setDiagnoses([{ diagnosis: '', duration: '', notes: '', isEditing: false }]);
    setMedications([{ medicine: '', dose: '', timing: '', frequency: '', duration: '', notes: '', isEditing: false }]);
    setSignature("");
    setMobileNumber("");
    setPatientSearchResults([]);
    setSearchError("");
    setIsPatientFromSearch(false);
    setSelectedPatientDetails(null);
    
    // Clear localStorage
    localStorage.removeItem(PRESCRIPTION_FORM_STATE_KEY);
    
    // Show notification
    // showNotification("Prescription form has been reset", "info");
  };

  // Add an effect to handle page reload warning
  useEffect(() => {
    // Only add the warning if there's saved form data and not in read-only mode
    if (!readOnly) {
      const handleBeforeUnload = (e) => {
        const savedState = localStorage.getItem(PRESCRIPTION_FORM_STATE_KEY);
        if (savedState) {
          // Show a warning message
          const message = "Are you sure you want to leave? Your prescription data will be reset.";
          e.returnValue = message; // For older browsers
          return message; // For modern browsers
        }
      };

      // Function to handle when the page is actually about to be unloaded
      const handleUnload = () => {
        // Clear prescription data from localStorage when the page is actually unloaded
        // This ensures if they come back via browser back or reload, the form will be reset
        localStorage.removeItem(PRESCRIPTION_FORM_STATE_KEY);
      };

      // Add event listeners
      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('unload', handleUnload);

      // Cleanup function to remove event listeners
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        window.removeEventListener('unload', handleUnload);
      };
    }
  }, [readOnly]);

  // Add isLoadingTemplates state
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [loadingTemplateType, setLoadingTemplateType] = useState(null);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      {/* Add Backdrop for patient prefill loading */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={prefillLoading}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress color="inherit" />
          <Typography variant="h6">Loading patient details...</Typography>
        </Box>
      </Backdrop>
      
      <Container className="prescription-container" sx={{ 
        pb: 3,
        height: 'auto',
        minHeight: '90vh',
        padding: '1rem 1.5rem 2rem 1.5rem',
        backgroundColor: '#fbfbfd',
        overflowY: 'auto',
        width: '100%',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        margin: '1rem auto',
        borderRadius: '12px',
        maxWidth: '1280px',
        marginBottom: '50px',
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: '#f1f5f9',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: '#cbd5e0',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          backgroundColor: '#94a3b8',
        },
        '@media (max-width: 960px)': {
          padding: '1rem',
        }
      }}>
        <form id="prescription-form" onSubmit={handleSubmit}>
          <Box>
            {!hidePatientDetails && (
              <>
                <Box sx={{ mb: 3 }}>
                  {/* Patient details form with phone number first */}
          <Grid container spacing={1}>
                    {/* Phone Number Field with Autocomplete */}
                    <Grid item xs={12} sm={3} md={3}>
                      <Autocomplete
                        freeSolo
                        options={patientSearchResults}
                        getOptionLabel={(option) => 
                          typeof option === 'string' ? option : option.phone_number || ""
                        }
                        renderOption={(props, option) => (
                          <li {...props}>
                            <div>
                              <Typography variant="body1">{option.name}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {option.phone_number}
                                {option.age && option.gender ? ` • ${option.age} yrs, ${option.gender === 'M' ? 'Male' : option.gender === 'F' ? 'Female' : option.gender}` : ''}
                                {option.location ? ` • ${option.location}` : ''}
                              </Typography>
                            </div>
                          </li>
                        )}
                        onChange={(_, selectedOption) => {
                          if (selectedOption && typeof selectedOption !== 'string') {
                            // When a patient is selected from dropdown
                            setPrescription(prev => ({
                              ...prev,
                              patientName: selectedOption.name || "",
                              age: selectedOption.age || "",
                              gender: selectedOption.gender === 'M' ? 'Male' : 
                                      selectedOption.gender === 'F' ? 'Female' : 
                                      selectedOption.gender || ""
                            }));
                            
                            // Set flag that patient is from search
                            setIsPatientFromSearch(true);
                            
                            // Show success notification
                            showNotification("Patient details loaded successfully", "success");
                            
                            // Show backdrop while loading patient details
                            setPrefillLoading(true);
                            
                            // Get complete patient details including vitals and any existing prescription data
                            (async () => {
                              try {
                                // Fetch additional patient details if patient_id is available
                                if (selectedOption.patient_id) {
                                  // Get patient vitals and details
                                  const patientDetails = await getPatientDetails(selectedOption.patient_id);
                                  
                                  // Save the patient details in state for later use
                                  setSelectedPatientDetails(patientDetails);
                                  console.log("Saved complete patient details:", patientDetails);
                                  
                                  if (patientDetails && patientDetails.vitals) {
                                    console.log("Patient details:", patientDetails.vitals);
                                    
                                    // Update both the general weight field and the vitals fields
                                    setPrescription(prev => ({
                                      ...prev,
                                      weight: patientDetails.vitals.weight || "",
                                      vitals: {
                                        ...prev.vitals,
                                        bloodPressure: patientDetails.vitals.blood_pressure || "",
                                        heartRate: patientDetails.vitals.pulse_rate || "",
                                        temperature: patientDetails.vitals.temperature || "",
                                        spO2: patientDetails.vitals.spo2 || "",
                                        weight: patientDetails.vitals.weight || "",
                                        height: patientDetails.vitals.height || "",
                                        bloodSugar: patientDetails.vitals.blood_sugar || ""
                                      }
                                    }));
                                  }
                                  
                                  // Get any existing prescription data for this patient
                                  try {
                                    // If there are other appointments for this patient in the search result, use the latest one
                                    const appointmentId = patientDetails?.current_appointment?.appointment_id || 
                                                         (patientDetails?.other_appointments && patientDetails.other_appointments.length > 0 ? 
                                                          patientDetails.other_appointments[0].appointment_id : null);
                                    
                                    if (appointmentId) {
                                      const prescriptionData = await getCurrentPrescription(appointmentId);
                                      console.log("Current prescription data:", prescriptionData);
                                      
                                      if (prescriptionData) {
                                        // Prepare data for state updates
                                        const mappedComplaints = prescriptionData.complaints?.length > 0 
                                          ? [
                                              ...prescriptionData.complaints.map(complaint => ({
                                                complaint: complaint.name || "",
                                                severity: complaint.severity || "",
                                                frequency: complaint.frequency || "",
                                                duration: complaint.duration || "",
                                                notes: complaint.notes || "",
                                                isEditing: false
                                              })),
                                              { complaint: '', severity: '', frequency: '', duration: '', notes: '', isEditing: false } // Empty row
                                            ]
                                          : [{ complaint: '', severity: '', frequency: '', duration: '', notes: '', isEditing: false }];
                                              
                                        const mappedDiagnoses = prescriptionData.diagnosis?.length > 0
                                          ? [
                                              ...prescriptionData.diagnosis.map(diag => ({
                                                diagnosis: diag.name || "",
                                                duration: diag.duration || "",
                                                notes: diag.notes || "",
                                                isEditing: false
                                              })),
                                              { diagnosis: '', duration: '', notes: '', isEditing: false } // Empty row
                                            ]
                                          : [{ diagnosis: '', duration: '', notes: '', isEditing: false }];
                                        
                                        const mappedMedications = prescriptionData.medicines?.length > 0
                                          ? [
                                              ...prescriptionData.medicines.map(med => ({
                                                medicine: med.name || "",
                                                dose: med.dose || "",
                                                timing: med.when || "",
                                                frequency: med.frequency || "",
                                                duration: med.duration || "",
                                                notes: med.notes || "",
                                                isEditing: false
                                              })),
                                              { medicine: '', dose: '', timing: '', frequency: '', duration: '', notes: '', isEditing: false } // Empty row
                                            ]
                                          : [{ medicine: '', dose: '', timing: '', frequency: '', duration: '', notes: '', isEditing: false }];

                                        // Update prescription state
                                        setPrescription(prev => {
                                          // First check if there are any vitals in the prescription data
                                          const updatedVitals = prescriptionData.vitals && (
                                            prescriptionData.vitals.temperature || 
                                            prescriptionData.vitals.pulse_rate || 
                                            prescriptionData.vitals.blood_pressure || 
                                            prescriptionData.vitals.weight || 
                                            prescriptionData.vitals.height || 
                                            prescriptionData.vitals.spo2 || 
                                            prescriptionData.vitals.blood_sugar
                                          ) ? {
                                            bloodPressure: prescriptionData.vitals.blood_pressure || prev.vitals.bloodPressure,
                                            heartRate: prescriptionData.vitals.pulse_rate || prev.vitals.heartRate,
                                            temperature: prescriptionData.vitals.temperature || prev.vitals.temperature,
                                            spO2: prescriptionData.vitals.spo2 || prev.vitals.spO2,
                                            weight: prescriptionData.vitals.weight || prev.vitals.weight,
                                            height: prescriptionData.vitals.height || prev.vitals.height,
                                            bloodSugar: prescriptionData.vitals.blood_sugar || prev.vitals.bloodSugar
                                          } : prev.vitals;

                                          return {
                                            ...prev,
                                            // If vitals contain weight, update the general weight field too
                                            weight: prescriptionData.vitals?.weight || prev.weight,
                                            vitals: updatedVitals,
                                            complaints: mappedComplaints,
                                            diagnoses: mappedDiagnoses,
                                            medications: mappedMedications,
                                            tests: prescriptionData.tests?.[0]?.testlist || [],
                                            instructions: prescriptionData.advice?.[0]?.advice || ""
                                          };
                                        });
                                        
                                        // Update the separate state variables for tables
                                        setComplaints(mappedComplaints);
                                        setDiagnoses(mappedDiagnoses);
                                        setMedications(mappedMedications);
                                        
                                        showNotification("Previous prescription data loaded", "success");
                                      }
                                    }
                                  } catch (prescriptionError) {
                                    console.error("Error loading prescription data:", prescriptionError);
                                  }
                                }
                              } catch (error) {
                                console.error("Error loading complete patient details:", error);
                              } finally {
                                // Always hide the backdrop when done
                                setPrefillLoading(false);
                              }
                            })();
                          }
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Mobile"
                            value={mobileNumber}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              if (value.length <= 10) {
                                setMobileNumber(value);
                                // Reset prescription state on every keystroke
                                resetPrescription();
                                setSelectedPatientDetails(null);
                                localStorage.removeItem(PRESCRIPTION_FORM_STATE_KEY);
                                // When typing a mobile number manually, reset isPatientFromSearch
                                setIsPatientFromSearch(false);
                                
                                // Only search when we have exactly 10 digits
                                if (value.length === 10) {
                                  handleSearchPatient(value);
                                } else {
                                  setPatientSearchResults([]);
                                }
                              }
                            }}
                            placeholder="Enter 10-digit number"
                            size="small"
                            disabled={readOnly}
                            error={!!searchError}
                            helperText={searchError}
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {isSearching ? <CircularProgress color="inherit" size={20} /> : null}
                                  {params.InputProps.endAdornment}
                                </>
                              ),
                            }}
                            inputProps={{
                              ...params.inputProps,
                              maxLength: 10
                            }}
                          />
                        )}
                      />
                    </Grid>
                    
                    {/* Patient Name Field */}
                    <Grid item xs={12} sm={5} md={5}>
                    <TextField
                      fullWidth
                      label="Patient Name"
                      name="patientName"
                      value={prescription.patientName}
                      onChange={handleChange}
                      required
                      size="small"
                        disabled={readOnly || isPatientFromSearch}
                    />
                  </Grid>
                    
                  <Grid item xs={4} sm={2} md={2}>
                    <TextField
                      fullWidth
                      label="Age"
                      name="age"
                      type="number"
                      value={prescription.age}
                      onChange={handleChange}
                      required
                      size="small"
                        disabled={isPatientFromSearch}
                    />
                  </Grid>
                  <Grid item xs={4} sm={2} md={2}>
                    <TextField
                      fullWidth
                      label="Gender"
                      name="gender"
                      select
                      value={prescription.gender}
                      onChange={handleChange}
                      required
                      size="small"
                        disabled={isPatientFromSearch}
                    >
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={4} sm={2} md={2}>
                    <TextField
                      fullWidth
                      label="Weight"
                      name="weight"
                      type="number"
                      value={prescription.weight}
                      onChange={handleChange}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">kg</InputAdornment>
                        ),
                      }}
                      size="small"
                    />
                  </Grid>
                  
                  <Grid item xs={6} sm={2.4} md={2.4}>
                    <TextField
                      fullWidth
                      label="BP (mmHg)"
                      name="bloodPressure"
                      value={prescription.vitals.bloodPressure}
                      onChange={(e) =>
                        setPrescription({
                          ...prescription,
                          vitals: {
                            ...prescription.vitals,
                            bloodPressure: e.target.value,
                          },
                        })
                      }
                      placeholder="120/80"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6} sm={2.4} md={2.4}>
                    <TextField
                      fullWidth
                      label="HR (bpm)"
                      name="heartRate"
                      type="number"
                      value={prescription.vitals.heartRate}
                      onChange={(e) =>
                        setPrescription({
                          ...prescription,
                          vitals: {
                            ...prescription.vitals,
                            heartRate: e.target.value,
                          },
                        })
                      }
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={4} sm={2.4} md={2.4}>
                    <TextField
                      fullWidth
                      label="Temp (°C)"
                      name="temperature"
                      type="number"
                      value={prescription.vitals.temperature}
                      onChange={(e) =>
                        setPrescription({
                          ...prescription,
                          vitals: {
                            ...prescription.vitals,
                            temperature: e.target.value,
                          },
                        })
                      }
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={4} sm={2.4} md={2.4}>
                    <TextField
                      fullWidth
                        label="SpO2 (%)"
                        name="spO2"
                      type="number"
                        value={prescription.vitals.spO2}
                      onChange={(e) =>
                        setPrescription({
                          ...prescription,
                          vitals: {
                            ...prescription.vitals,
                              spO2: e.target.value,
                          },
                        })
                      }
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">%</InputAdornment>
                          ),
                        }}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={4} sm={2.4} md={2.4}>
                    <TextField
                      fullWidth
                        label="Weight"
                        name="weight"
                      type="number"
                        value={prescription.vitals.weight}
                      onChange={(e) =>
                        setPrescription({
                          ...prescription,
                          vitals: {
                            ...prescription.vitals,
                              weight: e.target.value,
                          },
                        })
                      }
                      InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">kg</InputAdornment>
                          ),
                        }}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6} sm={2.4} md={2.4}>
                      <TextField
                        fullWidth
                        label="Height"
                        name="height"
                        type="number"
                        value={prescription.vitals.height}
                        onChange={(e) =>
                          setPrescription({
                            ...prescription,
                            vitals: {
                              ...prescription.vitals,
                              height: e.target.value,
                            },
                          })
                        }
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">cm</InputAdornment>
                          ),
                        }}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6} sm={2.4} md={2.4}>
                      <TextField
                        fullWidth
                        label="Blood Sugar"
                        name="bloodSugar"
                        type="number"
                        value={prescription.vitals.bloodSugar}
                        onChange={(e) =>
                          setPrescription({
                            ...prescription,
                            vitals: {
                              ...prescription.vitals,
                              bloodSugar: e.target.value,
                            },
                          })
                        }
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">mg/dL</InputAdornment>
                        ),
                      }}
                      size="small"
                    />
                  </Grid>
                </Grid>
                </Box>
                <Divider sx={{ mb: 3 }} />
              </>
            )}

            <Grid item xs={12} sx={{ mt: 0, mb: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" className="section-header" sx={{ mt: 0 }}>
                  Complaints
                </Typography>
                
                {!readOnly && (
                  <Box>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<SaveIcon />}
                      onClick={() => handleSaveTemplateOpen('complaints')}
                      sx={{ mr: 1 }}
                    >
                      Save Template
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={loadingTemplateType === 'complaints' ? <CircularProgress size={20} /> : <FolderOpenIcon />}
                      onClick={() => handleLoadTemplateOpen('complaints')}
                      disabled={loadingTemplateType === 'complaints'}
                    >
                      {loadingTemplateType === 'complaints' ? "Loading Templates..." : "Load Template"}
                    </Button>
                  </Box>
                )}
              </Box>
              
              <TableContainer component={Paper} className="compact-table" sx={{ mb: 0.5, border: '1px solid rgba(224, 224, 224, 1)' }}>
                <Table size="small" sx={{ '& .MuiTableCell-root': { borderRight: '1px solid rgba(224, 224, 224, 1)' } }}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}>
                      <TableCell>Complaint</TableCell>
                      <TableCell>Severity</TableCell>
                      <TableCell>Frequency</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Notes</TableCell>
                      <TableCell width="50px" sx={{ borderRight: 'none' }}></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {prescription.complaints.map((row, index) => (
                      <TableRow 
                        key={index}
                        onClick={(e) => {
                          // No longer activate editing at the row level
                          // Editing will only be activated by clicking on the specific inputs
                          e.stopPropagation();
                          console.log(`Row ${index} clicked, current isEditing state:`, row.isEditing);
                        }}
                        sx={{ '&:nth-of-type(odd)': { backgroundColor: 'rgba(0, 0, 0, 0.02)' }, '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}
                      >
                        <TableCell>
                          <Autocomplete
                            id={`complaint-${index}`}
                            freeSolo
                            size="small"
                            options={commonComplaints}
                            value={row.complaint}
                            open={row.isEditing}
                            onClose={(e, reason) => {
                               // Debug point 9: When complaint autocomplete closes
                              console.log('Autocomplete closing:', { reason, currentValue: row.complaint });
                              // Only close when clicking away, not when selecting an item
                              if (reason === 'escape' || reason === 'blur') {
                                handleClickAway(index);
                              }
                            }}
                            onChange={(_, value) => {
                              handleComplaintChange(index, 'complaint', value);
                              // Keep isEditing true after selection
                              const updatedComplaints = [...prescription.complaints];
                              updatedComplaints[index].isEditing = true;
                              setPrescription({
                                ...prescription,
                                complaints: updatedComplaints
                              });
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                variant="standard"
                                placeholder="Enter complaint"
                                onFocus={(e) => {
                                  e.stopPropagation();
                                  const updatedComplaints = [...prescription.complaints];
                                  updatedComplaints[index].isEditing = true;
                                  setPrescription({ ...prescription, complaints: updatedComplaints });
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!readOnly && (row.complaint || index !== prescription.complaints.length - 1)) {
                                    const updatedComplaints = [...prescription.complaints];
                                    updatedComplaints[index].isEditing = true;
                                    setPrescription({ ...prescription, complaints: updatedComplaints });
                                  }
                                }}
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <Autocomplete
                            id={`severity-${index}`}
                            freeSolo
                            size="small"
                            options={severityLevels}
                            value={row.severity}
                            open={row.isEditing}
                            onClose={(e, reason) => {
                              // Only close when clicking away, not when selecting an item
                              if (reason === 'escape' || reason === 'blur') {
                                handleClickAway(index);
                              }
                            }}
                            onChange={(_, value) => {
                              handleComplaintChange(index, 'severity', value);
                              // Keep isEditing true after selection
                              const updatedComplaints = [...prescription.complaints];
                              updatedComplaints[index].isEditing = true;
                              setPrescription({ ...prescription, complaints: updatedComplaints });
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                variant="standard"
                                placeholder="Select severity"
                                onFocus={(e) => {
                                  e.stopPropagation();
                                  const updatedComplaints = [...prescription.complaints];
                                  updatedComplaints[index].isEditing = true;
                                  setPrescription({ ...prescription, complaints: updatedComplaints });
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!readOnly && (row.complaint || index !== prescription.complaints.length - 1)) {
                                    const updatedComplaints = [...prescription.complaints];
                                    updatedComplaints[index].isEditing = true;
                                    setPrescription({ ...prescription, complaints: updatedComplaints });
                                  }
                                }}
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <Autocomplete
                            id={`frequency-${index}`}
                            freeSolo
                            size="small"
                            options={complaintFrequencySuggestions}
                            value={row.frequency}
                            open={row.isEditing}
                            onClose={(e, reason) => {
                              if (reason === 'escape' || reason === 'blur') {
                                handleClickAway(index);
                              }
                            }}
                            onChange={(_, value) => {
                              handleComplaintChange(index, 'frequency', value);
                              const updatedComplaints = [...prescription.complaints];
                              updatedComplaints[index].isEditing = true;
                              setPrescription({ ...prescription, complaints: updatedComplaints });
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                variant="standard"
                                placeholder="Select frequency"
                                onFocus={(e) => {
                                  e.stopPropagation();
                                  const updatedComplaints = [...prescription.complaints];
                                  updatedComplaints[index].isEditing = true;
                                  setPrescription({ ...prescription, complaints: updatedComplaints });
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!readOnly && (row.complaint || index !== prescription.complaints.length - 1)) {
                                    const updatedComplaints = [...prescription.complaints];
                                    updatedComplaints[index].isEditing = true;
                                    setPrescription({ ...prescription, complaints: updatedComplaints });
                                  }
                                }}
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <Autocomplete
                            id={`duration-${index}`}
                            freeSolo
                            size="small"
                            options={durationSuggestions}
                            value={row.duration}
                            open={row.isEditing}
                            onClose={(e, reason) => {
                              // Only close when clicking away, not when selecting an item
                              if (reason === 'escape' || reason === 'blur') {
                                handleClickAway(index);
                              }
                            }}
                            onChange={(_, value) => {
                              handleComplaintChange(index, 'duration', value);
                              // Keep isEditing true after selection
                              const updatedComplaints = [...prescription.complaints];
                              updatedComplaints[index].isEditing = true;
                              setPrescription({ ...prescription, complaints: updatedComplaints });
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                variant="standard"
                                placeholder="Select duration"
                                onFocus={(e) => {
                                  e.stopPropagation();
                                  const updatedComplaints = [...prescription.complaints];
                                  updatedComplaints[index].isEditing = true;
                                  setPrescription({ ...prescription, complaints: updatedComplaints });
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!readOnly && (row.complaint || index !== prescription.complaints.length - 1)) {
                                    const updatedComplaints = [...prescription.complaints];
                                    updatedComplaints[index].isEditing = true;
                                    setPrescription({ ...prescription, complaints: updatedComplaints });
                                  }
                                }}
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            id={`complaint-notes-${index}`}
                            size="small"
                            variant="standard"
                            placeholder="Add notes"
                            value={row.notes || ''}
                            onChange={(e) => handleComplaintChange(index, 'notes', e.target.value)}
                            onClick={(e) => e.stopPropagation()} // Prevent row click event
                            onFocus={(e) => e.stopPropagation()} // Prevent opening dropdown
                            fullWidth
                          />
                        </TableCell>
                        <TableCell>
                          {prescription.complaints.length >= 1  && (
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                const updatedComplaints = prescription.complaints.filter((_, i) => i !== index);
                                setPrescription({ ...prescription, complaints: updatedComplaints });
                                // Also update the complaints state to keep them in sync
                                setComplaints(updatedComplaints);
                              }}
                            >
                              <RemoveCircleOutline fontSize="small" color="error" />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'flex-start',
                  position: 'relative',
                  bottom: 0,
                  left: 0,
                  p: 0.5,
                  backgroundColor: 'background.paper',
                  borderTop: '1px solid',
                  borderColor: 'divider'
                }}>
                  <IconButton
                    size="small"
                    onClick={() => addNewComplaintRow()}
                    sx={{ color: 'primary.main' }}
                  >
                    <AddCircleOutline fontSize="small" />
                  </IconButton>
                </Box>
              </TableContainer>
            </Grid>

            <Grid item xs={12} sx={{ mt: 0, mb: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" className="section-header" sx={{ mt: 0 }}>
                  Diagnosis
                </Typography>
                
                {!readOnly && (
                  <Box>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<SaveIcon />}
                      onClick={() => handleSaveTemplateOpen('diagnoses')}
                      sx={{ mr: 1 }}
                    >
                      Save Template
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={loadingTemplateType === 'diagnoses' ? <CircularProgress size={20} /> : <FolderOpenIcon />}
                      onClick={() => handleLoadTemplateOpen('diagnoses')}
                      disabled={loadingTemplateType === 'diagnoses'}
                    >
                      {loadingTemplateType === 'diagnoses' ? "Loading Templates..." : "Load Template"}
                    </Button>
                  </Box>
                )}
              </Box>
              
              <TableContainer component={Paper} className="compact-table" sx={{ mb: 0.5, border: '1px solid rgba(224, 224, 224, 1)' }}>
                <Table size="small" sx={{ '& .MuiTableCell-root': { borderRight: '1px solid rgba(224, 224, 224, 1)' } }}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}>
                      <TableCell>Diagnosis</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Notes</TableCell>
                      <TableCell width="50px" sx={{ borderRight: 'none' }}></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {diagnoses.map((row, index) => (
                      <TableRow 
                        key={index}
                        onClick={(e) => {
                          // No longer activate editing at the row level
                          // Editing will only be activated by clicking on the specific inputs
                          e.stopPropagation();
                          console.log(`Row ${index} clicked, current isEditing state:`, diagnoses[index].isEditing);
                        }}
                        sx={{ '&:nth-of-type(odd)': { backgroundColor: 'rgba(0, 0, 0, 0.02)' }, '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}
                      >
                        <TableCell>
                          <Autocomplete
                            id={`diagnosis-${index}`}
                            freeSolo
                            size="small"
                            options={diagnosisSearchQuery && diagnosisSearchQuery.length > 0 
                              ? diagnosisSuggestions 
                              : []}
                            value={row.diagnosis}
                            open={row.isEditing}
                            onClose={(e, reason) => {
                              // Only close when clicking away, not when selecting an item
                              if (reason === 'escape' || reason === 'blur') {
                                handleDiagnosisClickAway(index);
                              }
                            }}
                            onChange={(_, value) => {
                              // Handle both string values and suggestion objects
                              if (typeof value === 'object' && value !== null) {
                                // It's a suggestion object
                                handleDiagnosisChange(index, 'diagnosis', value.value);
                                
                                // If the suggestion has additional data, use it
                                if (value.data) {
                                  // Update other fields if needed
                                  if (value.data.duration) {
                                    handleDiagnosisChange(index, 'duration', value.data.duration);
                                  }
                                  if (value.data.notes) {
                                    handleDiagnosisChange(index, 'notes', value.data.notes);
                                  }
                                }
                              } else {
                                // It's a string value
                                handleDiagnosisChange(index, 'diagnosis', value);
                              }
                              
                              // Clear the search query after selection
                              setDiagnosisSearchQuery('');
                              
                              // Keep isEditing true after selection
                              const updatedDiagnoses = [...diagnoses];
                              updatedDiagnoses[index].isEditing = true;
                              setDiagnoses(updatedDiagnoses);
                            }}
                            onInputChange={(_, newInputValue) => {
                              setDiagnosisSearchQuery(newInputValue);
                            }}
                            loading={isLoadingDiagnosisSuggestions}
                            getOptionLabel={(option) => {
                              // Handle both string options and object options
                              if (typeof option === 'object' && option !== null && option.value) {
                                return option.value;
                              }
                              return option;
                            }}
                            renderOption={(props, option) => {
                              // If option is an object with a label, render the label
                              if (typeof option === 'object' && option !== null && option.label) {
                                return <li {...props}>{option.label}</li>;
                              }
                              // Otherwise, render the option as is
                              return <li {...props}>{option}</li>;
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                variant="standard"
                                placeholder="Enter diagnosis"
                                onFocus={(e) => {
                                  e.stopPropagation();
                                  const updatedDiagnoses = [...diagnoses];
                                  updatedDiagnoses[index].isEditing = true;
                                  setDiagnoses(updatedDiagnoses);
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!readOnly && (row.diagnosis || index !== diagnoses.length - 1)) {
                                    const updatedDiagnoses = [...diagnoses];
                                    updatedDiagnoses[index].isEditing = true;
                                    setDiagnoses(updatedDiagnoses);
                                  }
                                }}
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <Autocomplete
                            id={`diagnosis-duration-${index}`}
                            freeSolo
                            size="small"
                            options={diagnosisDurationSuggestions}
                            value={row.duration}
                            open={row.isEditing}
                            onClose={(e, reason) => {
                              // Only close when clicking away, not when selecting an item
                              if (reason === 'escape' || reason === 'blur') {
                                handleDiagnosisClickAway(index);
                              }
                            }}
                            onChange={(_, value) => {
                              handleDiagnosisChange(index, 'duration', value);
                              // Keep isEditing true after selection
                              const updatedDiagnoses = [...diagnoses];
                              updatedDiagnoses[index].isEditing = true;
                              setDiagnoses(updatedDiagnoses);
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                variant="standard"
                                placeholder="Select duration"
                                onFocus={(e) => {
                                  e.stopPropagation();
                                  const updatedDiagnoses = [...diagnoses];
                                  updatedDiagnoses[index].isEditing = true;
                                  setDiagnoses(updatedDiagnoses);
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!readOnly && (row.diagnosis || index !== diagnoses.length - 1)) {
                                    const updatedDiagnoses = [...diagnoses];
                                    updatedDiagnoses[index].isEditing = true;
                                    setDiagnoses(updatedDiagnoses);
                                  }
                                }}
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            id={`diagnosis-notes-${index}`}
                            size="small"
                            variant="standard"
                            placeholder="Add notes"
                            value={row.notes || ''}
                            onChange={(e) => handleDiagnosisChange(index, 'notes', e.target.value)}
                            onClick={(e) => e.stopPropagation()} // Prevent row click event
                            onFocus={(e) => e.stopPropagation()} // Prevent opening dropdown
                            fullWidth
                          />
                        </TableCell>
                        <TableCell>
                          {diagnoses.length >= 1 && (
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                const updatedDiagnoses = diagnoses.filter((_, i) => i !== index);
                                setDiagnoses(updatedDiagnoses);
                                // Also update the prescription state to keep them in sync
                                setPrescription(prev => ({
                                  ...prev,
                                  diagnoses: updatedDiagnoses
                                }));
                              }}
                            >
                              <RemoveCircleOutline fontSize="small" color="error" />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'flex-start',
                  position: 'relative',
                  bottom: 0,
                  left: 0,
                  p: 0.5,
                  backgroundColor: 'background.paper',
                  borderTop: '1px solid',
                  borderColor: 'divider'
                }}>
                  <IconButton
                    size="small"
                    onClick={() => addNewDiagnosisRow()}
                    sx={{ color: 'primary.main' }}
                  >
                    <AddCircleOutline fontSize="small" />
                  </IconButton>
                </Box>
              </TableContainer>
            </Grid>

            <Grid item xs={12} sx={{ mt: 0, mb: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6" className="section-header" sx={{ mt: 0 }}>
                  Medications
                </Typography>
                
                {!readOnly && (
                  <Box>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<SaveIcon />}
                      onClick={() => handleSaveTemplateOpen('medications')}
                      sx={{ mr: 1 }}
                    >
                      Save Template
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={loadingTemplateType === 'medications' ? <CircularProgress size={20} /> : <FolderOpenIcon />}
                      onClick={() => handleLoadTemplateOpen('medications')}
                      disabled={loadingTemplateType === 'medications'}
                      sx={{ mr: 1 }}
                    >
                      {loadingTemplateType === 'medications' ? "Loading Templates..." : "Load Template"}
                    </Button>
                    {patientInfo && patientInfo.id && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={isLoadingPrescriptions ? <CircularProgress size={16} /> : <HistoryIcon />}
                        onClick={loadPastPrescriptions}
                        disabled={isLoadingPrescriptions}
                      >
                        {isLoadingPrescriptions ? "Loading..." : "Load Previous"}
                      </Button>
                    )}
                  </Box>
                )}
              </Box>
              
              <TableContainer 
                component={Paper} 
                className="compact-table medication-table" 
                sx={{ mb: 0.5, border: '1px solid rgba(224, 224, 224, 1)' }}
              >
                <Table size="small" sx={{ '& .MuiTableCell-root': { borderRight: '1px solid rgba(224, 224, 224, 1)' } }}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}>
                      <TableCell width="25%">Medicine</TableCell>
                      <TableCell>Dose</TableCell>
                      <TableCell>Timing</TableCell>
                      <TableCell>Frequency</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Notes</TableCell>
                      <TableCell width="50px" sx={{ borderRight: 'none' }}></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {medications.map((row, index) => (
                      <TableRow 
                        key={index}
                        onClick={(e) => {
                          // No longer activate editing at the row level
                          // Editing will only be activated by clicking on the specific inputs
                          e.stopPropagation();
                          console.log(`Row ${index} clicked, current isEditing state:`, row.isEditing);
                        }}
                        sx={{ '&:nth-of-type(odd)': { backgroundColor: 'rgba(0, 0, 0, 0.02)' }, '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}
                      >
                        <TableCell>
                          {index === 0 && console.log("FIRST ROW RENDER:", {
                            isEditing: row.isEditing,
                            suggestionsCount: suggestedMedicines.length,
                            searchQuery: medicineSearchQuery,
                            openCondition: row.isEditing && (suggestedMedicines.length > 0 || medicineSearchQuery.trim().length > 0)
                          })}
                          <Autocomplete
                            id={`med-medicine-${index}`}
                            freeSolo
                            size="small"
                            options={suggestedMedicines}
                            getOptionLabel={(option) => {
                              if (typeof option === 'string') return option;
                              if (option && option.value) return option.value;
                              if (option && option.name) return option.name;
                              return '';
                            }}
                            value={row.medicine || ''}
                            // Modified to ensure dropdown opens when typing and suggestions are available
                            open={row.isEditing && suggestedMedicines.length > 0}
                            loading={loadingMedicineRows.includes(index)}
                            noOptionsText="Start typing to search medicines"
                            filterOptions={(x) => x}
                            ListboxProps={{
                              style: { 
                                maxHeight: '300px',
                                padding: '8px 0'
                              }
                              // Removed the onMouseDown handler that was preventing selection
                            }}
                            onInputChange={(event, newInputValue) => {
                              if (event) {
                                 // Debug point 14: When typing in medicine field
                                console.log('Medicine search input:', newInputValue);
                                
                                // Set isEditing to true when typing
                                const updatedMedications = [...medications];
                                updatedMedications[index].isEditing = true;
                                setMedications(updatedMedications);
                                
                                // Trigger search with a slight delay to avoid too many API calls
                                if (newInputValue && newInputValue.trim().length > 0) {
                                  // Store the active row index in a data attribute for the searchMedicines function
                                  setMedicineSearchQuery(newInputValue);
                                  // Set the active row for the search
                                  window.activeSearchRowIndex = index;
                                  // This will trigger the useEffect that calls searchMedicines
                                }
                              }
                            }}
                            onChange={(_, value) => {
                               // Debug point 15: When medicine is selected from dropdown
                              console.log('Medicine selected:', value);
                              
                              let medicineValue;
                              if (typeof value === 'string') {
                                medicineValue = value;
                                console.log('String value selected:', medicineValue);
                              } else if (value && typeof value === 'object') {
                                if (value.data) {
                                   // Debug point 16: When medicine with data is selected
                                  const medicine = value.data;
                                  medicineValue = medicine.name;
                                  console.log('Medicine with data selected:', medicine);
                                  
                                  // Create a new medication object with all fields updated at once
                                  const updatedMedication = {
                                    ...medications[index],
                                    medicine: medicine.name,
                                    dose: medicine.dose || medications[index].dose,
                                    timing: medicine.when || medications[index].timing,
                                    frequency: medicine.frequency || medications[index].frequency,
                                    duration: medicine.duration || medications[index].duration,
                                    isEditing: false
                                  };
                                  
                                  // Update all fields at once
                                  const updatedMedications = [...medications];
                                  updatedMedications[index] = updatedMedication;
                                  setMedications(updatedMedications);
                                  
                                  // Clear suggestions and close dropdown after selection
                                  setSuggestedMedicines([]);
                                  setMedicineSearchQuery('');
                                  
                                  // Return early since we've already updated everything
                                  return;
                                } else {
                                  medicineValue = value.value || value.name || '';
                                  console.log('Object value selected:', medicineValue);
                                }
                              } else {
                                medicineValue = '';
                                console.log('Empty value selected');
                              }
                              
                              // For simple string values or objects without data property
                              // Update the medication with just the medicine value
                              if (medicineValue) {
                                console.log('Setting medicine value:', medicineValue);
                                
                                // Update only the medicine field
                                const updatedMedication = {
                                  ...medications[index],
                                  medicine: medicineValue,
                                  isEditing: false
                                };
                                
                                const updatedMedications = [...medications];
                                updatedMedications[index] = updatedMedication;
                                setMedications(updatedMedications);
                                
                                // Clear suggestions and close dropdown after selection
                                setSuggestedMedicines([]);
                                setMedicineSearchQuery('');
                              }
                            }}
                            renderOption={(props, option) => {
                              if (!option) return null;
                              
                              // If option is a string, just render it
                              if (typeof option === 'string') {
                                return <li {...props}>{option}</li>;
                              }
                              
                              // Create a unique key safely
                              const uniqueKey = `${option.value || option.name || ''}-${Date.now()}`;
                              
                              // Get the display data safely
                              const medicineName = option.value || option.name || '';
                              const genericName = option.data?.generic_name || '';
                              const dose = option.data?.dose || '';
                              const timing = option.data?.when || '';
                              const frequency = option.data?.frequency || '';
                              const duration = option.data?.duration || '';
                              
                              return (
                                <li {...props} key={uniqueKey}>
                                  <div>
                                    <div style={{ fontWeight: 'bold' }}>{medicineName}</div>
                                    {genericName && (
                                      <div style={{ fontSize: '0.8em', color: '#666' }}>
                                        {genericName}
                                      </div>
                                    )}
                                    {(dose || timing || frequency || duration) && (
                                      <div style={{ fontSize: '0.8em', color: '#666' }}>
                                        {[dose, timing, frequency, duration].filter(Boolean).join(' | ')}
                                      </div>
                                    )}
                                  </div>
                                </li>
                              );
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                variant="standard"
                                placeholder="Enter medicine"
                                InputProps={{
                                  ...params.InputProps,
                                  endAdornment: (
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                      {loadingMedicineRows.includes(index) && (
                                        <CircularProgress 
                                          color="inherit" 
                                          size={16} 
                                          style={{ marginRight: 8 }} 
                                        />
                                      )}
                                      {params.InputProps.endAdornment}
                                    </div>
                                  ),
                                }}
                                onFocus={(e) => {
                                  e.stopPropagation();
                                  console.log("Medicine field focused, setting isEditing to true for row", index);
                                  console.log("Before update, row isEditing state:", medications[index].isEditing);
                                  
                                  // Set isEditing to true for this row
                                  const updatedMedications = [...medications];
                                  updatedMedications[index].isEditing = true;
                                  setMedications(updatedMedications);
                                  
                                  // Log after the update is scheduled
                                  console.log("After scheduled update for row", index);
                                  
                                  // Only trigger search if there's actual content in the field
                                  if (row.medicine && row.medicine.trim().length > 0) {
                                    console.log("Triggering search with existing value:", row.medicine);
                                    triggerMedicineSearch(row.medicine, index);
                                  } else {
                                    console.log("Skipping search for empty medicine field");
                                    // Ensure isEditing is set without triggering a search
                                    // We still want the dropdown to open for selection, just without API calls
                                  }
                                }}
                              />
                            )}
                          />
                          {/* Add a direct input field for medicine name for debugging */}
                          <TextField
                            size="small"
                            variant="outlined"
                            placeholder="Medicine name (direct input)"
                            value={row.medicine || ''}
                            onChange={(e) => handleMedicationChange(index, 'medicine', e.target.value)}
                            sx={{ mt: 1, display: 'none' }} // Hidden by default, can be shown for debugging
                          />
                        </TableCell>
                        <TableCell>
                          <Autocomplete
                            id={`med-dose-${index}`}
                            freeSolo
                            size="small"
                            options={medicineDosePatterns}
                            value={row.dose || ''}
                            // Regular dropdown behavior for other fields
                            open={Boolean(row.isEditing)}
                            onClose={(e, reason) => {
                              if (reason === 'selectOption' || selectionInProgress) {
                                return;
                              }
                              handleMedicationClickAway(index);
                            }}
                            onChange={(_, value) => {
                              handleSelectionStart();
                              handleMedicationChange(index, 'dose', value || '');
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                variant="standard"
                                placeholder="Select dose"
                                onFocus={(e) => {
                                  if (readOnly) return;
                                  e.stopPropagation();
                                  // Only set editing state if not clicking on notes
                                  const isNotesField = e.target.closest('td')?.querySelector('#med-notes-' + index);
                                  if (!isNotesField) {
                                    const updatedMedications = [...medications];
                                    updatedMedications[index].isEditing = true;
                                    setMedications(updatedMedications);
                                  }
                                }}
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <Autocomplete
                            id={`med-timing-${index}`}
                            freeSolo
                            size="small"
                            options={medicineTimings}
                            value={row.timing || ''}
                            open={Boolean(row.isEditing)}
                            onClose={(e, reason) => {
                              if (reason === 'selectOption' || selectionInProgress) {
                                return;
                              }
                              handleMedicationClickAway(index);
                            }}
                            onChange={(_, value) => {
                              handleSelectionStart();
                              handleMedicationChange(index, 'timing', value || '');
                            }}
                            getOptionLabel={(option) => {
                              return typeof option === 'string' ? option : '';
                            }}
                            renderOption={(props, option) => (
                              <li {...props}>{typeof option === 'string' ? option : ''}</li>
                            )}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                variant="standard"
                                placeholder="Select timing"
                                onFocus={(e) => {
                                  if (readOnly) return;
                                  e.stopPropagation();
                                  const updatedMedications = [...medications];
                                  updatedMedications[index].isEditing = true;
                                  setMedications(updatedMedications);
                                }}
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <Autocomplete
                            id={`med-frequency-${index}`}
                            freeSolo
                            size="small"
                            options={medicineFrequency}
                            value={row.frequency || ''}
                            open={Boolean(row.isEditing)}
                            onClose={(e, reason) => {
                              if (reason === 'selectOption' || selectionInProgress) {
                                return;
                              }
                              handleMedicationClickAway(index);
                            }}
                            onChange={(_, value) => {
                              handleSelectionStart();
                              handleMedicationChange(index, 'frequency', value || '');
                            }}
                            getOptionLabel={(option) => {
                              return typeof option === 'string' ? option : '';
                            }}
                            renderOption={(props, option) => (
                              <li {...props}>{typeof option === 'string' ? option : ''}</li>
                            )}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                variant="standard"
                                placeholder="Select frequency"
                                onFocus={(e) => {
                                  if (readOnly) return;
                                  e.stopPropagation();
                                  const updatedMedications = [...medications];
                                  updatedMedications[index].isEditing = true;
                                  setMedications(updatedMedications);
                                }}
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <Autocomplete
                            id={`med-duration-${index}`}
                            freeSolo
                            size="small"
                            options={medicineDuration}
                            value={row.duration || ''}
                            open={Boolean(row.isEditing)}
                            onClose={(e, reason) => {
                              if (reason === 'selectOption' || selectionInProgress) {
                                return;
                              }
                              handleMedicationClickAway(index);
                            }}
                            onChange={(_, value) => {
                              handleSelectionStart();
                              handleMedicationChange(index, 'duration', value || '');
                            }}
                            getOptionLabel={(option) => {
                              return typeof option === 'string' ? option : '';
                            }}
                            renderOption={(props, option) => (
                              <li {...props}>{typeof option === 'string' ? option : ''}</li>
                            )}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                variant="standard"
                                placeholder="Select duration"
                                onFocus={(e) => {
                                  if (readOnly) return;
                                  e.stopPropagation();
                                  const updatedMedications = [...medications];
                                  updatedMedications[index].isEditing = true;
                                  setMedications(updatedMedications);
                                }}
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            id={`med-notes-${index}`}
                            variant="standard"
                            size="small"
                            value={row.notes || ''}
                            onChange={(e) => handleMedicationChange(index, 'notes', e.target.value)}
                            placeholder="Add notes"
                            onFocus={(e) => {
                              // Don't set editing state for notes field
                              e.stopPropagation();
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {medications.length >= 1 && (
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                const updatedMedications = medications.filter((_, i) => i !== index);
                                setMedications(updatedMedications);
                                // Also update the prescription state to keep them in sync
                                setPrescription(prev => ({
                                  ...prev,
                                  medications: updatedMedications
                                }));
                              }}
                              style={{ visibility: (medications.length >= 1 ) ? 'visible' : 'hidden' }}
                            >
                              <RemoveCircleOutline fontSize="small" color="error" />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'flex-start',
                  position: 'relative',
                  bottom: 0,
                  left: 0,
                  p: 0.5,
                  backgroundColor: 'background.paper',
                  borderTop: '1px solid',
                  borderColor: 'divider'
                }}>
                  <IconButton
                    size="small"
                    onClick={() => addNewMedicationRow()}
                    sx={{ color: 'primary.main' }}
                  >
                    <AddCircleOutline fontSize="small" />
                  </IconButton>
                </Box>
              </TableContainer>
            </Grid>

            <Grid item xs={12} sx={{ mt: 0, mb: 3 }}>
              <Typography variant="h6" className="section-header" sx={{ mt: 0, mb: 2 }}>
                Recommended Tests
              </Typography>

              <Autocomplete
                multiple
                freeSolo
                options={dummyTests}
                value={prescription.tests}
                disableCloseOnSelect={true}
                onChange={(e, value) => {
                  setPrescription({
                    ...prescription,
                    tests: value,
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Test"
                    placeholder="Type to search"
                    size="small"
                    fullWidth
                    variant="outlined"
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props} style={{ display: 'inline-block', margin: '4px' }}>
                    {option}
                  </li>
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      {...getTagProps({ index })}
                      onDelete={() => {
                        setPrescription({
                          ...prescription,
                          tests: prescription.tests.filter((test) => test !== option),
                        });
                      }}
                    />
                  ))
                }
              />
            </Grid>

            <Grid item xs={12} sx={{ mt: 0, mb: 4 }}>
              <Typography variant="h6" className="section-header" sx={{ mt: 0, mb: 2 }}>
                Additional Information
              </Typography>

              <TextField
                fullWidth
                label="Special Instructions"
                name="instructions"
                value={prescription.instructions}
                onChange={handleChange}
                multiline
                rows={1}
                size="small"
                placeholder="Enter any special instructions or notes for the patient"
              />
            </Grid>

            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              {showSubmitButton && (
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ px: 3, py: 1 }}
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                >
                  {isSubmitting ? "Submitting..." : (readOnly ? "Save" : "Submit")}
                </Button>
              )}
              {showPrintButton && !readOnly && (
              <Button
                  variant="contained"
                  startIcon={<Print />}
                  onClick={handlePrint}
                  sx={{ ml: 2 }}
              >
                Print
              </Button>
              )}
              {!readOnly && (
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<RestartAlt />}
                  onClick={resetPrescription}
                  sx={{ ml: 2 }}
                >
                  Reset
              </Button>
              )}
            </Grid>
          </Box>
        </form>
      </Container>

      {/* Past Prescriptions Modal */}
      <Dialog
        open={pastPrescriptionsOpen}
        onClose={() => setPastPrescriptionsOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Past Prescriptions</Typography>
            <IconButton onClick={() => setPastPrescriptionsOpen(false)}>
              <CancelIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {isLoadingPrescriptions ? (
            <Box display="flex" justifyContent="center" p={3}>
              <Typography>Loading past prescriptions...</Typography>
            </Box>
          ) : pastPrescriptions.length === 0 ? (
            <Box display="flex" justifyContent="center" p={3}>
              <Typography>No past prescriptions found for this patient.</Typography>
            </Box>
          ) : (
            <Box sx={{ maxHeight: '75vh', overflowY: 'auto' }}>
              {pastPrescriptions.map((prescription, index) => (
                <Paper 
                  key={prescription.id} 
                  elevation={0} 
                  variant="outlined" 
                  sx={{ 
                    mb: 4, 
                    p: 3,
                    backgroundColor: '#fff',
                  }}
                >
                  {/* Prescription Header with Date */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    borderBottom: '2px solid #2196f3',
                    pb: 1,
                    mb: 3,
                    backgroundColor: '#f8fafc',
                    p: 2,
                    borderRadius: '8px 8px 0 0',
                    border: '1px solid #e2e8f0',
                    borderBottom: '2px solid #2196f3'
                  }}>
                    <Typography variant="h6" sx={{ 
                      fontWeight: '600',
                      color: '#1e40af',
                      fontSize: '1.1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <CalendarToday sx={{ fontSize: '1.2rem', color: '#2563eb' }} />
                      {new Date(prescription.date).toLocaleDateString()}
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      startIcon={<ContentCopyIcon />}
                      onClick={() => {
                        copyMedicationsFromPast(prescription.medications);
                        setPastPrescriptionsOpen(false); // Close the modal after copying
                      }}
                      disabled={!prescription.medications || prescription.medications.length === 0}
                    >
                      Copy Medications
                    </Button>
                  </Box>
                  
                  <Box mb={2}>
                    <Typography variant="subtitle2" gutterBottom>Medications:</Typography>
                    <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}>
                            <TableCell>Medicine</TableCell>
                            <TableCell>Dose</TableCell>
                            <TableCell>Timing</TableCell>
                            <TableCell>Frequency</TableCell>
                            <TableCell>Duration</TableCell>
                            <TableCell>Notes</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {prescription.medications && prescription.medications.length > 0 ? (
                            prescription.medications.map((med, i) => (
                              <TableRow key={i}>
                                <TableCell>{med.medicine || med.name || ''}</TableCell>
                                <TableCell>{med.dose || ''}</TableCell>
                                <TableCell>{med.timing || med.when || ''}</TableCell>
                                <TableCell>{med.frequency || ''}</TableCell>
                                <TableCell>{med.duration || ''}</TableCell>
                                <TableCell>{med.notes || ''}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={6} align="center">No medications in this prescription</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPastPrescriptionsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Save Template Dialog */}
      <Dialog open={saveTemplateOpen} onClose={handleSaveTemplateClose}>
        <DialogTitle>
          {currentTemplateType === 'medications' ? 'Save Medication Template' : 
           currentTemplateType === 'diagnoses' ? 'Save Diagnosis Template' : 
           'Save Complaint Template'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              This will save the current {currentTemplateType} as a template that you can reuse in future prescriptions.
            </Typography>
            
            {currentTemplateType === 'medications' && (
              <Typography variant="caption" color="text.secondary">
                {medications.filter(m => m.medicine && m.medicine.trim()).length} medication(s) will be saved.
              </Typography>
            )}
            
            {currentTemplateType === 'diagnoses' && (
              <Typography variant="caption" color="text.secondary">
                {diagnoses.filter(d => d.diagnosis && d.diagnosis.trim()).length} diagnosis/diagnoses will be saved.
              </Typography>
            )}
            
            {currentTemplateType === 'complaints' && (
              <Typography variant="caption" color="text.secondary">
                {complaints.filter(c => c.complaint && c.complaint.trim()).length} complaint(s) will be saved.
              </Typography>
            )}
          </Box>
          
          <TextField
            autoFocus
            margin="dense"
            label="Template Name"
            fullWidth
            variant="outlined"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder={
              currentTemplateType === 'medications' ? 'e.g., Medications for Dengue' :
              currentTemplateType === 'diagnoses' ? 'e.g., Diagnosis for Viral Fever' :
              'e.g., Complaints for Respiratory Infection'
            }
            helperText="Enter a descriptive name for this template"
            error={templateName.trim() === ''}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSaveTemplateClose} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleSaveTemplate} 
            color="primary" 
            variant="contained" 
            startIcon={<SaveIcon />}
            disabled={templateName.trim() === ''}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Load Template Dialog */}
      <Dialog open={loadTemplateOpen} onClose={handleLoadTemplateClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentTemplateType === 'medications' ? 'Load Medication Template' : 
           currentTemplateType === 'diagnoses' ? 'Load Diagnosis Template' : 
           'Load Complaint Template'}
        </DialogTitle>
        <DialogContent>
          {loadingTemplateType === currentTemplateType ? (
            <Box display="flex" justifyContent="center" alignItems="center" p={3}>
              <CircularProgress size={40} />
              <Typography variant="h6" sx={{ ml: 2 }}>Loading templates...</Typography>
            </Box>
          ) : availableTemplates.length === 0 ? (
            <Box p={2} textAlign="center">
              <Typography variant="body1">No saved templates found.</Typography>
            </Box>
          ) : (
            <>
              <Box sx={{ mb: 2, mt: 1 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  label="Search templates"
                  placeholder="Type to search..."
                  value={searchTemplate}
                  onChange={(e) => setSearchTemplate(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                    endAdornment: searchTemplate && (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setSearchTemplate('')}>
                          <CancelIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </Box>
              
              <Box sx={{ maxHeight: '400px', overflow: 'auto' }}>
                {availableTemplates
                  .filter(template => 
                    template.name.toLowerCase().includes(searchTemplate.toLowerCase())
                  )
                  .map((template, index) => (
                    <Accordion 
                      key={template.id || index} 
                      sx={{ 
                        mb: 1,
                        borderLeft: '4px solid',
                        borderLeftColor: 
                          currentTemplateType === 'medications' ? 'primary.main' : 
                          currentTemplateType === 'diagnoses' ? 'secondary.main' : 
                          'success.main',
                      }}
                    >
                      {/* Rest of the Accordion content remains the same */}
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={{ 
                          '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                        }}
                      >
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          width: '100%',
                          pr: 2 
                        }}>
                          <Typography variant="subtitle1" fontWeight="700">
                            {template.name}
                          </Typography>
                          <Box>
                            <Button
                              size="small"
                              variant="outlined"
                              color="primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLoadTemplate(template);
                              }}
                              startIcon={<AddIcon />}
                              sx={{ mr: 1 }}
                            >
                              Load
                            </Button>
                            <IconButton 
                              size="small" 
                              onClick={(e) => handleEditTemplateOpen(e, template)}
                              sx={{ mr: 1 }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTemplate(template.name);
                              }}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        {/* Template content display based on type */}
                            {currentTemplateType === 'medications' && (
                          <TableContainer component={Paper}>
                                <Table size="small">
                                  <TableHead>
                                <TableRow>
                                      <TableCell>Medicine</TableCell>
                                      <TableCell>Dose</TableCell>
                                      <TableCell>Timing</TableCell>
                                      <TableCell>Frequency</TableCell>
                                      <TableCell>Duration</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                {template.data.map((med, idx) => (
                                        <TableRow key={idx}>
                                    <TableCell>{med.medicine || med.name}</TableCell>
                                    <TableCell>{med.dose}</TableCell>
                                    <TableCell>{med.timing || med.when}</TableCell>
                                    <TableCell>{med.frequency}</TableCell>
                                    <TableCell>{med.duration}</TableCell>
                                        </TableRow>
                                ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            )}
                            
                            {currentTemplateType === 'diagnoses' && (
                          <TableContainer component={Paper}>
                                <Table size="small">
                                  <TableHead>
                                <TableRow>
                                      <TableCell>Diagnosis</TableCell>
                                      <TableCell>Duration</TableCell>
                                      <TableCell>Notes</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                {template.data.map((diag, idx) => (
                                        <TableRow key={idx}>
                                    <TableCell>{diag.diagnosis || diag.name}</TableCell>
                                    <TableCell>{diag.duration}</TableCell>
                                    <TableCell>{diag.notes}</TableCell>
                                        </TableRow>
                                ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            )}
                            
                            {currentTemplateType === 'complaints' && (
                          <TableContainer component={Paper}>
                                <Table size="small">
                                  <TableHead>
                                <TableRow>
                                      <TableCell>Complaint</TableCell>
                                      <TableCell>Severity</TableCell>
                                      <TableCell>Frequency</TableCell>
                                      <TableCell>Duration</TableCell>
                                      <TableCell>Notes</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                {template.complaints?.map((comp, idx) => (
                                        <TableRow key={idx}>
                                    <TableCell>{comp.name}</TableCell>
                                    <TableCell>{comp.severity}</TableCell>
                                    <TableCell>{comp.frequency}</TableCell>
                                    <TableCell>{comp.duration}</TableCell>
                                    <TableCell>{comp.notes}</TableCell>
                                        </TableRow>
                                ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            )}
                      </AccordionDetails>
                    </Accordion>
                  ))}
                
                {availableTemplates.filter(template => 
                  template.name.toLowerCase().includes(searchTemplate.toLowerCase())
                ).length === 0 && (
                  <Box p={2} textAlign="center">
                    <Typography variant="body1">No templates match your search.</Typography>
                  </Box>
                )}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLoadTemplateClose} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification */}
      {notification.open && (
        <Box 
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            backgroundColor: notification.type === 'success' ? 'success.main' : 'error.main',
            color: 'white',
            padding: 2,
            borderRadius: 1,
            boxShadow: 3,
            zIndex: 9999,
            maxWidth: 400
          }}
        >
          <Typography variant="body1">{notification.message}</Typography>
        </Box>
      )}

      {/* Edit Template Dialog */}
      <Dialog 
        open={editTemplateOpen} 
        onClose={handleEditTemplateClose} 
        maxWidth="lg" 
        fullWidth
      >
        <DialogTitle>
          Edit {currentTemplateType === 'medications' ? 'Medication' : 
               currentTemplateType === 'diagnoses' ? 'Diagnosis' : 
               'Complaint'} Template
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Template Name
            </Typography>
            <TextField
              fullWidth
              margin="dense"
              variant="outlined"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              error={templateName.trim() === ''}
              helperText={templateName.trim() === '' ? "Template name is required" : ""}
            />
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" gutterBottom>
            Template Contents
          </Typography>
          
          {currentTemplateType === 'medications' && (
            <>
              <TableContainer component={Paper} sx={{ mb: 2, border: '1px solid rgba(224, 224, 224, 1)' }}>
                <Table size="small" sx={{ '& .MuiTableCell-root': { borderRight: '1px solid rgba(224, 224, 224, 1)' } }}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}>
                      <TableCell>Medicine</TableCell>
                      <TableCell>Dose</TableCell>
                      <TableCell>Timing</TableCell>
                      <TableCell>Frequency</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Notes</TableCell>
                      <TableCell width="50px" sx={{ borderRight: 'none' }}></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tempMedications.map((med, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <TextField
                            fullWidth
                            variant="standard"
                            value={med.medicine || ''}
                            onChange={(e) => {
                              const updatedMeds = [...tempMedications];
                              updatedMeds[index].medicine = e.target.value;
                              setTempMedications(updatedMeds);
                            }}
                            placeholder="Medicine name"
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            variant="standard"
                            value={med.dose || ''}
                            onChange={(e) => {
                              const updatedMeds = [...tempMedications];
                              updatedMeds[index].dose = e.target.value;
                              setTempMedications(updatedMeds);
                            }}
                            placeholder="Dose"
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            variant="standard"
                            value={med.timing || ''}
                            onChange={(e) => {
                              const updatedMeds = [...tempMedications];
                              updatedMeds[index].timing = e.target.value;
                              setTempMedications(updatedMeds);
                            }}
                            placeholder="Timing"
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            variant="standard"
                            value={med.frequency || ''}
                            onChange={(e) => {
                              const updatedMeds = [...tempMedications];
                              updatedMeds[index].frequency = e.target.value;
                              setTempMedications(updatedMeds);
                            }}
                            placeholder="Frequency"
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            variant="standard"
                            value={med.duration || ''}
                            onChange={(e) => {
                              const updatedMeds = [...tempMedications];
                              updatedMeds[index].duration = e.target.value;
                              setTempMedications(updatedMeds);
                            }}
                            placeholder="Duration"
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            variant="standard"
                            value={med.notes || ''}
                            onChange={(e) => {
                              const updatedMeds = [...tempMedications];
                              updatedMeds[index].notes = e.target.value;
                              setTempMedications(updatedMeds);
                            }}
                            placeholder="Notes"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton 
                            size="small" 
                            onClick={() => {
                              const updatedMeds = tempMedications.filter((_, i) => i !== index);
                              setTempMedications(updatedMeds);
                            }}
                            color="error"
                          >
                            <RemoveCircleOutline fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'flex-start',
                mt: 0.5,
                mb: 2
              }}>
                <IconButton
                  size="small"
                  onClick={() => addNewComplaintRow()}
                  sx={{ color: 'primary.main' }}
                >
                  <AddCircleOutline fontSize="small" />
                </IconButton>
              </Box>
            </>
          )}
          
          {currentTemplateType === 'diagnoses' && (
            <>
              <TableContainer component={Paper} sx={{ mb: 2, border: '1px solid rgba(224, 224, 224, 1)' }}>
                <Table size="small" sx={{ '& .MuiTableCell-root': { borderRight: '1px solid rgba(224, 224, 224, 1)' } }}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}>
                      <TableCell>Diagnosis</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Notes</TableCell>
                      <TableCell width="50px" sx={{ borderRight: 'none' }}></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tempDiagnoses.map((diag, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <TextField
                            fullWidth
                            variant="standard"
                            value={diag.diagnosis || ''}
                            onChange={(e) => {
                              const updatedDiagnoses = [...tempDiagnoses];
                              updatedDiagnoses[index].diagnosis = e.target.value;
                              setTempDiagnoses(updatedDiagnoses);
                            }}
                            placeholder="Diagnosis"
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            variant="standard"
                            value={diag.duration || ''}
                            onChange={(e) => {
                              const updatedDiagnoses = [...tempDiagnoses];
                              updatedDiagnoses[index].duration = e.target.value;
                              setTempDiagnoses(updatedDiagnoses);
                            }}
                            placeholder="Duration"
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            variant="standard"
                            value={diag.notes || ''}
                            onChange={(e) => {
                              const updatedDiagnoses = [...tempDiagnoses];
                              updatedDiagnoses[index].notes = e.target.value;
                              setTempDiagnoses(updatedDiagnoses);
                            }}
                            placeholder="Notes"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton 
                            size="small" 
                            onClick={() => {
                              const updatedDiagnoses = tempDiagnoses.filter((_, i) => i !== index);
                              setTempDiagnoses(updatedDiagnoses);
                            }}
                            color="error"
                          >
                            <RemoveCircleOutline fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'flex-start',
                mt: 0.5,
                mb: 2
              }}>
                <IconButton
                  size="small"
                  onClick={() => addNewDiagnosisRow()}
                  sx={{ color: 'primary.main' }}
                >
                  <AddCircleOutline fontSize="small" />
                </IconButton>
              </Box>
            </>
          )}
          
          {currentTemplateType === 'complaints' && (
            <>
              <TableContainer component={Paper} sx={{ mb: 2, border: '1px solid rgba(224, 224, 224, 1)' }}>
                <Table size="small" sx={{ '& .MuiTableCell-root': { borderRight: '1px solid rgba(224, 224, 224, 1)' } }}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}>
                      <TableCell>Complaint</TableCell>
                      <TableCell>Severity</TableCell>
                      <TableCell>Frequency</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Notes</TableCell>
                      <TableCell width="50px" sx={{ borderRight: 'none' }}></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tempComplaints.map((complaint, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <TextField
                            fullWidth
                            variant="standard"
                            value={complaint.complaint || ''}
                            onChange={(e) => {
                              const updatedComplaints = [...tempComplaints];
                              updatedComplaints[index].complaint = e.target.value;
                              setTempComplaints(updatedComplaints);
                            }}
                            placeholder="Complaint"
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            variant="standard"
                            value={complaint.severity || ''}
                            onChange={(e) => {
                              const updatedComplaints = [...tempComplaints];
                              updatedComplaints[index].severity = e.target.value;
                              setTempComplaints(updatedComplaints);
                            }}
                            placeholder="Severity"
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            variant="standard"
                            value={complaint.frequency || ''}
                            onChange={(e) => {
                              const updatedComplaints = [...tempComplaints];
                              updatedComplaints[index].frequency = e.target.value;
                              setTempComplaints(updatedComplaints);
                            }}
                            placeholder="Frequency"
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            variant="standard"
                            value={complaint.duration || ''}
                            onChange={(e) => {
                              const updatedComplaints = [...tempComplaints];
                              updatedComplaints[index].duration = e.target.value;
                              setTempComplaints(updatedComplaints);
                            }}
                            placeholder="Duration"
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            variant="standard"
                            value={complaint.notes || ''}
                            onChange={(e) => {
                              const updatedComplaints = [...tempComplaints];
                              updatedComplaints[index].notes = e.target.value;
                              setTempComplaints(updatedComplaints);
                            }}
                            placeholder="Notes"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton 
                            size="small" 
                            onClick={() => {
                              const updatedComplaints = tempComplaints.filter((_, i) => i !== index);
                              setTempComplaints(updatedComplaints);
                            }}
                            color="error"
                          >
                            <RemoveCircleOutline fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'flex-start',
                mt: 0.5,
                mb: 2
              }}>
                <IconButton
                  size="small"
                  onClick={() => addNewComplaintRow()}
                  sx={{ color: 'primary.main' }}
                >
                  <AddCircleOutline fontSize="small" />
                </IconButton>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditTemplateClose} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleSaveEditedTemplate} 
            color="primary" 
            variant="contained" 
            startIcon={<SaveIcon />}
            disabled={templateName.trim() === ''}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
});

// Create a wrapper component that can be used as a page
const PrescriptionPage = () => {
  const handleFormSubmit = (formData) => {
    // Handle form submission for the page context
    console.log("Form submitted:", formData);
    // Here you would typically save the data to your backend
    // or perform other actions specific to the page context
  };

  // Provide an initialData object with all required properties and proper array initializations
  const initialData = {
    patientName: "",
    age: "",
    gender: "",
    weight: "",
    signature: "",
    vitals: {
      bloodPressure: "",
      heartRate: "",
      temperature: "",
      spO2: "",
      weight: "",
      height: "",
      bloodSugar: ""
    },
    medications: [
      { medicine: '', dose: '', timing: '', frequency: '', duration: '', notes: '', isEditing: false }
    ],
    complaints: [
      { complaint: '', severity: '', frequency: '', duration: '', notes: '', isEditing: false }
    ],
    diagnoses: [
      { diagnosis: '', duration: '', notes: '', isEditing: false }
    ],
    tests: [],
    instructions: "",
    followUp: null
  };

  return <PrescriptionForm initialData={initialData} onSubmit={handleFormSubmit} />;
};

export default PrescriptionPage;
