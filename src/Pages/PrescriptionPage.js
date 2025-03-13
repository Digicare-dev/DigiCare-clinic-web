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
} from "@mui/icons-material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "./PrescriptionPage.css";
import { useNavigate, useParams } from 'react-router-dom';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import SaveIcon from '@mui/icons-material/Save';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { saveTemplate, getTemplates, deleteTemplate, resetToDefaultTemplates } from '../services/templateService';
import { 
  saveTemplate as saveTemplateApi, 
  getTemplates as getTemplatesFromAPI,
  deleteTemplate as deleteTemplateApi,
  editTemplate as editTemplateApi,
  suggest as suggestMedicines,
  getCurrentPrescription,
  suggestMedicine
} from "../services/api";
import { getCabinInfoFromUser } from "../utils/dateUtils";

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
  // Initialize state with empty values
  const [prescription, setPrescription] = useState({
    patientName: "",
    age: "",
    gender: "",
    weight: "",
    vitals: {
      bloodPressure: "",
      heartRate: "",
      temperature: "",
      respiratoryRate: "",
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
    followUp: "",
    signature: "",
  });
  const user = JSON.parse(localStorage.getItem("user"));
  

  // Extract cabin information using the new utility function
  const { cabinId, selectedSlot } = getCabinInfoFromUser(user);

  const [newTest, setNewTest] = useState("");
  const [signature, setSignature] = useState(initialData.signature || "");
 
  console.log(initialData);

  // Initialize complaints with initialData or default
  const [complaints, setComplaints] = useState(
      [
      { complaint: '', severity: '', frequency: '', duration: '', notes: '', isEditing: false }
    ]
  );

  // Add these dummy data arrays near your other dummy data
  const commonDiagnosisList = [
    "Hypertension",
    "Diabetes Mellitus Type 2",
    "Upper Respiratory Tract Infection",
    "Gastroenteritis",
    "Migraine",
    "Bronchial Asthma",
    "Anxiety Disorder",
    "Osteoarthritis",
    "Urinary Tract Infection",
    "Dyslipidemia"
  ];

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

  // Initialize diagnoses with initialData or default
  const [diagnoses, setDiagnoses] = useState(
     [
    { diagnosis: '', duration: '', notes: '', isEditing: false }
    ]
  );

  // Initialize medications with initialData or default
  const [medications, setMedications] = useState(
     [
    { medicine: '', dose: '', timing: '', frequency: '', duration: '', notes: '', isEditing: false }
    ]
  );

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
  }, []);

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
  useEffect(() => {
    // Check if we have any templates, if not, initialize defaults
    const medicationTemplates = getTemplates('medicines');
    const diagnosisTemplates = getTemplates('diagnosis');
    const complaintTemplates = getTemplates('complaints');
    
    if (medicationTemplates.length === 0 || 
        diagnosisTemplates.length === 0 || 
        complaintTemplates.length === 0) {
      resetToDefaultTemplates();
    }
  }, []);

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
  
  // Update handleSubmit to use the onSubmit prop
  const handleSubmit = (e) => {
    e.preventDefault();
    
     // Debug point 3: Before form submission
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
    
     // Debug point 4: Form data prepared for submission
    console.log('Form data being submitted:', JSON.stringify(formData));
    
    // Call the onSubmit function passed as prop
    if (onSubmit) {
      onSubmit(formData);
      // Don't reset the form after submission
      showNotification('Prescription saved successfully', 'success');
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
    console.log('Current complaints state:', prescription.complaints);
    
    const updatedComplaints = [...prescription.complaints];
    // Only update isEditing, preserve all other data
    updatedComplaints[index] = {
      ...updatedComplaints[index],
      isEditing: false
    };
    
    console.log('Updated complaints after click away:', updatedComplaints);
    // Update both states
    setComplaints(updatedComplaints);
    setPrescription({
      ...prescription,
      complaints: updatedComplaints
    });
  };

  // Also modify the handleComplaintChange function to include the auto-close behavior
  const handleComplaintChange = (index, field, value) => {
    const updatedComplaints = [...prescription.complaints];
    updatedComplaints[index][field] = value;
    
    // Check if all main fields in the current row have values
    const currentRow = updatedComplaints[index];
    const hasAllMainFields = currentRow.complaint && currentRow.severity && currentRow.duration;

    // If all main fields are filled and this is the last row, add a new row
    if (hasAllMainFields && index === prescription.complaints.length - 1) {
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
        
        setPrescription({
          ...prescription,
          complaints: newComplaints
        });
      }, 10);
    } else {
      // Update the current row without adding a new one
      setPrescription({
        ...prescription,
        complaints: updatedComplaints
      });
    }
  };

  // Modify addNewComplaintRow to prevent auto-opening dropdown
  const addNewComplaintRow = () => {
    if (readOnly) return;
    
     // Debug point 6: Start of adding new complaint row
    console.log('Adding new complaint row');
    console.log('Current complaints:', prescription.complaints);
    
    const updatedComplaints = [...prescription.complaints];
    updatedComplaints[updatedComplaints.length - 1].isEditing = false;
    
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
      setPrescription({
        ...prescription,
        complaints: newComplaints
      });
      
      const newIndex = prescription.complaints.length;
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
    const updatedDiagnoses = [...prescription.diagnoses];
    updatedDiagnoses[index][field] = value;
    
    // Check if all main fields in the current row have values
    const currentRow = updatedDiagnoses[index];
    const hasAllMainFields = currentRow.diagnosis && currentRow.duration;

    // If all main fields are filled and this is the last row, add a new row
    if (hasAllMainFields && index === prescription.diagnoses.length - 1) {
      // Add a small delay to ensure the current row's state is updated
      setTimeout(() => {
        const newDiagnoses = [...updatedDiagnoses, {
          diagnosis: '',
          duration: '',
          notes: '',
          isEditing: false
        }];
        
        setPrescription({
          ...prescription,
          diagnoses: newDiagnoses
        });
      }, 10);
    } else {
      // Update the current row without adding a new one
      setPrescription({
        ...prescription,
        diagnoses: updatedDiagnoses
      });
    }
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
    
    setMedications(updatedMedications);
    
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
    setMedications(updatedMedications);
    
    // Ensure we clear suggestions and search query
    setSuggestedMedicines([]);
    setMedicineSearchQuery('');
  };

  // Modify addNewDiagnosisRow to prevent auto-opening dropdown
  const addNewDiagnosisRow = () => {
    if (readOnly) return;
    
    const updatedDiagnoses = [...prescription.diagnoses];
    updatedDiagnoses[updatedDiagnoses.length - 1].isEditing = false; // Close the current row
    setDiagnoses(updatedDiagnoses); // Update state to close dropdown

    setTimeout(() => {
        setDiagnoses(prev => [...prev, { diagnosis: '', duration: '', notes: '', isEditing: false }]);
        const newIndex = diagnoses.length;
        const element = document.querySelector(`#diagnosis-${newIndex}`);
        if (element && element.querySelector('input')) {
            element.querySelector('input').focus();
        }
    }, 200);
  };

  // Modify addNewMedicationRow to prevent auto-opening dropdown
  const addNewMedicationRow = () => {
    // Removed the validation check that prevented adding a new row
    // Now users can add a new row regardless of whether the last row is filled out
    setMedications([
      ...medications,
      { medicine: '', dose: '', timing: '', frequency: '', duration: '', notes: '', isEditing: false }
    ]);
  };

  // Add these click-away handlers
  const handleDiagnosisClickAway = (index) => {
    // Close the dropdown for the specific row, regardless of field completion
    const updatedDiagnoses = [...prescription.diagnoses];
    updatedDiagnoses[index].isEditing = false;
    setDiagnoses(updatedDiagnoses);
  };

  // Function to load past prescriptions
  const loadPastPrescriptions = async () => {
    if (!patientInfo || !patientInfo.id) {
      console.warn("No patient information available", patientInfo);
      return;
    }
    
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
        prescriptions = prescriptions.filter(p => p.medications && p.medications.length > 0);
      } else if (response && Array.isArray(response)) {
        // Handle the old response format
        prescriptions = response;
      } else {
        // Handle unexpected response format
        console.error("Unexpected response format:", response);
        showNotification("Error loading past prescriptions: Unexpected data format", "error");
        prescriptions = [];
      }
      
      console.log("Processed prescriptions:", prescriptions);
      
      if (prescriptions && prescriptions.length > 0) {
        setPastPrescriptions(prescriptions);
      } else {
        console.warn("No prescriptions returned for patient ID:", patientInfo.id);
      }
    } catch (error) {
      console.error("Error loading past prescriptions:", error);
    } finally {
      setIsLoadingPrescriptions(false);
    }
    
    // Open the modal
    setPastPrescriptionsOpen(true);
  };
  
  // Function to copy medications from a past prescription
  const copyMedicationsFromPast = (pastMedications) => {
    console.log('Copying medications:', pastMedications);
    
    // Filter out medications that already exist in the current list
    const existingMedicineNames = medications.map(med => med.medicine.toLowerCase());
    
    // Handle both old and new structure
    const newMedications = pastMedications.filter(med => {
      const medicineName = (med.medicine || med.name || '').toLowerCase();
      return medicineName && !existingMedicineNames.includes(medicineName);
    });
    
    console.log('New medications to add (duplicates filtered):', newMedications);
    
    // Skip if no new medications to add (silently ignore duplicates)
    if (newMedications.length === 0) {
      showNotification("No new medications to add", "info");
      return;
    }
    
    // Add isEditing property to each medication and ensure all required fields are present
    const medicationsWithEditing = newMedications.map(med => ({
      medicine: med.medicine || med.name || '',
      dose: med.dose || '',
      timing: med.timing || med.when || '',
      frequency: med.frequency || '',
      duration: med.duration || '',
      notes: med.notes || '',
      isEditing: false
    }));
    
    // Remove any empty rows from current medications
    const nonEmptyMedications = medications.filter(med => 
      med.medicine || med.dose || med.timing || med.frequency || med.duration || med.notes
    );
    
    // Check if we have an empty table (no non-empty rows)
    const hasEmptyTable = nonEmptyMedications.length === 0;
    
    // If table is empty, just use the new medications
    // Otherwise, append the new medications to the existing non-empty ones
    let updatedMedications = hasEmptyTable
      ? medicationsWithEditing
      : [...nonEmptyMedications, ...medicationsWithEditing];
    
    // Add an empty row at the end for new entries
    updatedMedications.push({
      medicine: '',
      dose: '',
      timing: '',
      frequency: '',
      duration: '',
      notes: '',
      isEditing: false
    });
    
    // Set the medications state
    setMedications(updatedMedications);
    showNotification(`Added ${medicationsWithEditing.length} medications from past prescription`, "success");
  };

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
      const templates = resetToDefaultTemplates();
      setAvailableTemplates(templates[currentTemplateType] || []);
    }
  };

  // Function to handle opening the load template dialog
  const handleLoadTemplateOpen = async (templateType) => {
    setCurrentTemplateType(templateType);
    
    // Get user and cabin info
    const user = JSON.parse(localStorage.getItem("user"));
    const { cabinId } = getCabinInfoFromUser(user);
    
    try {
      // Call the API to get templates
      const apiTemplates = await getTemplatesFromAPI(templateType, cabinId);
      console.log(`Templates from API for ${templateType}:`, apiTemplates);
      
      if (apiTemplates && apiTemplates.length > 0) {
        // Transform API templates to match the expected format based on template type
        let transformedTemplates = [];
        
        switch (templateType) {
          case 'complaints':
            transformedTemplates = apiTemplates.map(template => ({
              name: template.name,
              timestamp: new Date().toISOString(), // Use current time as timestamp
              data: template.complaints.map(complaint => ({
                complaint: complaint.name,
                severity: complaint.severity || '',
                duration: complaint.duration || '',
                frequency: complaint.frequency || '',
                notes: complaint.notes || '',
                isEditing: false
              }))
            }));
            break;
            
          case 'diagnoses':
            transformedTemplates = apiTemplates.map(template => ({
              name: template.name,
              timestamp: new Date().toISOString(),
              data: template.diagnosis.map(diagnosis => ({
                diagnosis: diagnosis.name,
                duration: diagnosis.duration || '',
                notes: diagnosis.notes || '',
                isEditing: false
              }))
            }));
            break;
            
          case 'medications':
            transformedTemplates = apiTemplates.map(template => ({
              name: template.name,
              timestamp: new Date().toISOString(),
              data: template.medicines.map(medicine => ({
                medicine: medicine.name,
                dose: medicine.dose || '',
                timing: medicine.when || '',
                frequency: medicine.frequency || '',
                duration: medicine.duration || '',
                notes: medicine.notes || '',
                isEditing: false
              }))
            }));
            break;
        }
        
        console.log('Transformed templates:', transformedTemplates);
        setAvailableTemplates(transformedTemplates);
      } else {
        // If no API data, use local templates
        const localTemplates = getTemplates(templateType);
        setAvailableTemplates(localTemplates);
      }
    } catch (error) {
      console.error(`Error fetching ${templateType} templates from API:`, error);
      // Fallback to local templates
      const localTemplates = getTemplates(templateType);
      setAvailableTemplates(localTemplates);
    }
    
    setLoadTemplateOpen(true);
  };

  // Function to handle closing the load template dialog
  const handleLoadTemplateClose = () => {
    setLoadTemplateOpen(false);
  };

  // Function to save a template
  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      alert('Please enter a template name');
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
      alert('No data to save as template');
      return;
    }

    // Check if template with the same name already exists
    const existingTemplates = getTemplates(currentTemplateType);
    const existingTemplateIndex = existingTemplates.findIndex(t => t.name === templateName);
    
    let shouldSave = true;
    
    if (existingTemplateIndex >= 0) {
      shouldSave = window.confirm(`A template named "${templateName}" already exists. Do you want to overwrite it?`);
    }
    
    if (shouldSave) {
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

      // Get user and cabin info
      const user = JSON.parse(localStorage.getItem("user"));
      const { cabinId } = getCabinInfoFromUser(user);
      
      // Call the API to save the template
      try {
        saveTemplateApi(templateType, cabinId, payload);
        console.log(`Template "${templateName}" saved successfully to API`);
        
        // Also save to local storage for now
        saveTemplate(currentTemplateType, templateName, templateData);
        
        handleSaveTemplateClose();
        
        // Show success notification
        showNotification(`Template "${templateName}" saved successfully`);
      } catch (error) {
        console.error('Error saving template to API:', error);
        
        // Still save to local storage as fallback
        saveTemplate(currentTemplateType, templateName, templateData);
        handleSaveTemplateClose();
        
        // Show error notification
        showNotification(`Template saved locally, but there was an error with the server: ${error.message}`, 'error');
      }
    }
  };

  // Function to load a template
  const handleLoadTemplate = (template) => {
    let itemCount = 0;
    
    switch (currentTemplateType) {
      case 'medications':
        // Ensure template data has the correct structure
        const medicationsData = template.data.map(item => {
          // If the item already has a 'medicine' field, it's in the right format
          if (item.medicine) {
            return {
              ...item,
              isEditing: false
            };
          }
          
          // Otherwise, transform from API format to expected format
          return {
            medicine: item.name || '',
            dose: item.dose || '',
            timing: item.when || '',
            frequency: item.frequency || '',
            duration: item.duration || '',
            notes: item.notes || '',
            isEditing: false
          };
        });
        
        itemCount = medicationsData.length;
        
        const nonEmptyMedications = medications.filter(med => 
          med.medicine && med.medicine.trim()
        );
        
        const hasEmptyTable = nonEmptyMedications.length === 0;
        
        let updatedMedications = hasEmptyTable
          ? medicationsData
          : [...nonEmptyMedications, ...medicationsData];
        
        // Add empty row at the end if needed
        if (updatedMedications.length === 0 || updatedMedications[updatedMedications.length - 1].medicine) {
          updatedMedications.push({
            medicine: "",
            dose: "",
            timing: "",
            frequency: "",
            duration: "",
            notes: "",
            isEditing: false
          });
        }
        
        setMedications(updatedMedications);
        break;

      case 'diagnoses':
        // Ensure template data has the correct structure
        const diagnosesData = template.data.map(item => {
          // If the item already has a 'diagnosis' field, it's in the right format
          if (item.diagnosis) {
            return {
              ...item,
              isEditing: false
            };
          }
          
          // Otherwise, transform from API format to expected format
          return {
            diagnosis: item.name || '',
            duration: item.duration || '',
            notes: item.notes || '',
            isEditing: false
          };
        });
        
        itemCount = diagnosesData.length;
        
        const nonEmptyDiagnoses = diagnoses.filter(diag => 
          diag.diagnosis && diag.diagnosis.trim()
        );
        
        const hasEmptyDiagnosesTable = nonEmptyDiagnoses.length === 0;
        
        let updatedDiagnoses = hasEmptyDiagnosesTable
          ? diagnosesData
          : [...nonEmptyDiagnoses, ...diagnosesData];
        
        // Add empty row at the end if needed
        if (updatedDiagnoses.length === 0 || updatedDiagnoses[updatedDiagnoses.length - 1].diagnosis) {
          updatedDiagnoses.push({
            diagnosis: "",
            duration: "",
            notes: "",
            isEditing: false
          });
        }
        
        setDiagnoses(updatedDiagnoses);
        break;

      case 'complaints':
        // Ensure template data has the correct structure
        const complaintsData = template.data.map(item => {
          // If the item already has a 'complaint' field, it's in the right format
          if (item.complaint) {
            return {
              ...item,
              isEditing: false
            };
          }
          
          // Transform from API format to expected format
          return {
            complaint: item.name || '',
            severity: item.severity || '',
            duration: item.duration || '',
            frequency: item.frequency || '',
            notes: item.notes || '',
            isEditing: false
          };
        });
        
        itemCount = complaintsData.length;
        console.log('Transformed complaints data:', complaintsData);
        
        // Check if there are non-empty complaints in the current state
        const nonEmptyComplaints = prescription.complaints.filter(complaint => 
          complaint.complaint && complaint.complaint.trim()
        );
        
        const hasEmptyComplaintsTable = nonEmptyComplaints.length === 0;
        
        // If table is empty, replace it; otherwise append the template data
        let updatedComplaints = hasEmptyComplaintsTable
          ? complaintsData
          : [...nonEmptyComplaints, ...complaintsData];
        
        // Add empty row at the end if needed
        if (updatedComplaints.length === 0 || updatedComplaints[updatedComplaints.length - 1].complaint) {
          updatedComplaints.push({
            complaint: '',
            severity: '',
            duration: '',
            frequency: '',
            notes: '',
            isEditing: false
          });
        }
        
        console.log('Setting complaints to:', updatedComplaints);
        
        // Update both state variables
        setComplaints(updatedComplaints);
        setPrescription(prev => ({
          ...prev,
          complaints: updatedComplaints
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
        const { cabinId } = getCabinInfoFromUser(user);
        
        // Determine the API template type based on currentTemplateType
        let apiTemplateType;
        switch (currentTemplateType) {
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
            apiTemplateType = currentTemplateType;
        }
        
        // Call the API to delete the template
        await deleteTemplateApi(apiTemplateType, templateName, cabinId);
        console.log(`Template "${templateName}" deleted successfully from API`);
        
        // Also delete from local storage for now
        const updatedTemplates = deleteTemplate(currentTemplateType, templateName);
        setAvailableTemplates(updatedTemplates);
        
        // Show success notification
        showNotification(`Template "${templateName}" deleted successfully`);
      } catch (error) {
        console.error('Error deleting template from API:', error);
        
        // Still delete from local storage as fallback
        const updatedTemplates = deleteTemplate(currentTemplateType, templateName);
        setAvailableTemplates(updatedTemplates);
        
        // Show error notification
        showNotification(`Template deleted from local storage, but there was an error with the server: ${error.message}`, 'error');
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

    // Determine the API template type
    let apiTemplateType;
    switch (currentTemplateType) {
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
        apiTemplateType = currentTemplateType;
    }

    // Get user and cabin info
    const user = JSON.parse(localStorage.getItem("user"));
    const { cabinId } = getCabinInfoFromUser(user);

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
      // Handle name change if needed
      if (templateName !== editingTemplate.name) {
        // If the name changed, check if it would conflict with an existing template
        const existingTemplates = getTemplates(currentTemplateType);
        const existingTemplateIndex = existingTemplates.findIndex(t => t.name === templateName);
        
        if (existingTemplateIndex >= 0) {
          if (!window.confirm(`A template named "${templateName}" already exists. Do you want to overwrite it?`)) {
            return;
          }
          
          // Delete the template with the conflicting name from local storage
          deleteTemplate(currentTemplateType, templateName);
          
          // Delete from API as well
          try {
            await deleteTemplateApi(apiTemplateType, templateName, cabinId);
            console.log(`Template "${templateName}" deleted from API due to name conflict`);
          } catch (error) {
            console.error(`Error deleting template "${templateName}" from API:`, error);
          }
        }
        
        // Call the API to edit the template (which will handle the rename)
        await editTemplateApi(apiTemplateType, editingTemplate.name, cabinId, payload);
        console.log(`Template "${editingTemplate.name}" edited and renamed to "${templateName}" in API`);
        
        // Delete the old template from local storage
        deleteTemplate(currentTemplateType, editingTemplate.name);
      } else {
        // Same name, just update the template
        await editTemplateApi(apiTemplateType, templateName, cabinId, payload);
        console.log(`Template "${templateName}" updated in API`);
        
        // Update in local storage as well
        deleteTemplate(currentTemplateType, templateName);
      }
      
      // Save with the new data to local storage
      saveTemplate(currentTemplateType, templateName, updatedData);
      
      // Refresh the templates list
      try {
        const apiTemplates = await getTemplatesFromAPI(apiTemplateType, cabinId);
        console.log(`Templates refreshed from API for ${currentTemplateType}:`, apiTemplates);
        
        if (apiTemplates && apiTemplates.length > 0) {
          // Transform API templates to match the expected format
          let transformedTemplates = [];
          
          switch (currentTemplateType) {
            case 'complaints':
              transformedTemplates = apiTemplates.map(template => ({
                name: template.name,
                timestamp: new Date().toISOString(),
                data: template.complaints.map(complaint => ({
                  complaint: complaint.name,
                  severity: complaint.severity || '',
                  duration: complaint.duration || '',
                  frequency: complaint.frequency || '',
                  notes: complaint.notes || '',
                  isEditing: false
                }))
              }));
              break;
              
            case 'diagnoses':
              transformedTemplates = apiTemplates.map(template => ({
                name: template.name,
                timestamp: new Date().toISOString(),
                data: template.diagnosis.map(diagnosis => ({
                  diagnosis: diagnosis.name,
                  duration: diagnosis.duration || '',
                  notes: diagnosis.notes || '',
                  isEditing: false
                }))
              }));
              break;
              
            case 'medications':
              transformedTemplates = apiTemplates.map(template => ({
                name: template.name,
                timestamp: new Date().toISOString(),
                data: template.medicines.map(medicine => ({
                  medicine: medicine.name,
                  dose: medicine.dose || '',
                  timing: medicine.when || '',
                  frequency: medicine.frequency || '',
                  duration: medicine.duration || '',
                  notes: medicine.notes || '',
                  isEditing: false
                }))
              }));
              break;
          }
          
          setAvailableTemplates(transformedTemplates);
        } else {
          // If no API data, use local templates
          const localTemplates = getTemplates(currentTemplateType);
          setAvailableTemplates(localTemplates);
        }
      } catch (error) {
        console.error(`Error refreshing templates from API:`, error);
        // Fallback to local templates
        const localTemplates = getTemplates(currentTemplateType);
        setAvailableTemplates(localTemplates);
      }
      
      // Close the edit dialog and show notification
      handleEditTemplateClose();
      showNotification(`Template "${templateName}" has been updated successfully!`);
    } catch (error) {
      console.error(`Error editing template in API:`, error);
      
      // Still update in local storage as fallback
      if (templateName !== editingTemplate.name) {
        deleteTemplate(currentTemplateType, editingTemplate.name);
      }
      deleteTemplate(currentTemplateType, templateName);
      saveTemplate(currentTemplateType, templateName, updatedData);
      
      // Update the templates list from local storage
      const localTemplates = getTemplates(currentTemplateType);
      setAvailableTemplates(localTemplates);
      
      // Close the edit dialog and show notification
      handleEditTemplateClose();
      showNotification(`Template updated locally, but there was an error with the server: ${error.message}`, 'error');
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

  // Debounce the medicine search to avoid too many API calls
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (medicineSearchQuery && medicineSearchQuery.length > 0) {
        fetchMedicineSuggestions(medicineSearchQuery);
      }
    }, 300); // 300ms debounce time
    
    return () => clearTimeout(debounceTimer);
  }, [medicineSearchQuery]);

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
              respiratoryRate: "",
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
        setIsLoadingSuggestions(true);
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
          setIsLoadingSuggestions(false);
        }
      } else {
        setSuggestedMedicines([]);
      }
    };

    const debounceTimer = setTimeout(searchMedicines, 300);
    return () => clearTimeout(debounceTimer);
  }, [medicineSearchQuery]);

  // Add a function to explicitly trigger a medicine search
  const triggerMedicineSearch = async (query) => {
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

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
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
          <Grid container spacing={1}>
                  <Grid item xs={12} sm={5} md={6}>
                    <TextField
                      fullWidth
                      label="Patient Name"
                      name="patientName"
                      value={prescription.patientName}
                      onChange={handleChange}
                      required
                      size="small"
                        disabled={readOnly}
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
                      label="RR (bpm)"
                      name="respiratoryRate"
                      type="number"
                      value={prescription.vitals.respiratoryRate}
                      onChange={(e) =>
                        setPrescription({
                          ...prescription,
                          vitals: {
                            ...prescription.vitals,
                            respiratoryRate: e.target.value,
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
                      startIcon={<FolderOpenIcon />}
                      onClick={() => handleLoadTemplateOpen('complaints')}
                    >
                      Load Template
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
                      startIcon={<FolderOpenIcon />}
                      onClick={() => handleLoadTemplateOpen('diagnoses')}
                    >
                      Load Template
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
                            options={commonDiagnosisList}
                            value={row.diagnosis}
                            open={row.isEditing}
                            onClose={(e, reason) => {
                              // Only close when clicking away, not when selecting an item
                              if (reason === 'escape' || reason === 'blur') {
                                handleDiagnosisClickAway(index);
                              }
                            }}
                            onChange={(_, value) => {
                              handleDiagnosisChange(index, 'diagnosis', value);
                              // Keep isEditing true after selection
                              const updatedDiagnoses = [...diagnoses];
                              updatedDiagnoses[index].isEditing = true;
                              setDiagnoses(updatedDiagnoses);
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
                                setDiagnoses(diagnoses.filter((_, i) => i !== index));
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
                      startIcon={<FolderOpenIcon />}
                      onClick={() => handleLoadTemplateOpen('medications')}
                      sx={{ mr: 1 }}
                    >
                      Load Template
                    </Button>
                    {patientInfo && patientInfo.id && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<HistoryIcon />}
                        onClick={loadPastPrescriptions}
                      >
                        Load Previous
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
                            loading={isLoadingSuggestions}
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
                                  setMedicineSearchQuery(newInputValue);
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
                                  
                                  // Auto-fill other fields if available
                                  if (medicine.dose) handleMedicationChange(index, 'dose', medicine.dose);
                                  if (medicine.when) handleMedicationChange(index, 'timing', medicine.when);
                                  if (medicine.frequency) handleMedicationChange(index, 'frequency', medicine.frequency);
                                  if (medicine.duration) handleMedicationChange(index, 'duration', medicine.duration);
                                } else {
                                  medicineValue = value.value || value.name || '';
                                  console.log('Object value selected:', medicineValue);
                                }
                              } else {
                                medicineValue = '';
                                console.log('Empty value selected');
                              }
                              
                              // Update the medication with the medicine value
                              if (medicineValue) {
                                console.log('Setting medicine value:', medicineValue);
                                handleMedicationChange(index, 'medicine', medicineValue);
                                
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
                                    <>
                                      {isLoadingSuggestions ? <CircularProgress color="inherit" size={20} /> : null}
                                      {params.InputProps.endAdornment}
                                    </>
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
                                    triggerMedicineSearch(row.medicine);
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
                                setMedications(medications.filter((_, i) => i !== index));
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
                >
                  {readOnly ? "Save" : "Submit"}
                </Button>
              )}
              {showPrintButton && (
              <Button
                variant="outlined"
                color="primary"
                size="small"
                onClick={() => window.print()}
                sx={{ px: 2, py: 0.5, ml: 1 }}
              >
                Print
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
          {availableTemplates.length === 0 ? (
            <Box p={2} textAlign="center">
              <Typography variant="body1">No saved templates found.</Typography>
              <Button 
                onClick={handleResetTemplates}
                variant="outlined"
                color="primary"
                sx={{ mt: 2 }}
              >
                Load Default Templates
              </Button>
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
                      key={index} 
                      sx={{ 
                        mb: 1,
                        borderLeft: '4px solid',
                        borderLeftColor: 
                          currentTemplateType === 'medications' ? 'primary.main' : 
                          currentTemplateType === 'diagnoses' ? 'secondary.main' : 
                          'success.main',
                      }}
                    >
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
                      <AccordionDetails sx={{ pt: 0 }}>
                        <Box>
                          <Box sx={{ mt: 1, mb: 1 }}>
                            {currentTemplateType === 'medications' && (
                              <TableContainer component={Paper} sx={{ mb: 2 }}>
                                <Table size="small">
                                  <TableHead>
                                    <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}>
                                      <TableCell>Medicine</TableCell>
                                      <TableCell>Dose</TableCell>
                                      <TableCell>Timing</TableCell>
                                      <TableCell>Frequency</TableCell>
                                      <TableCell>Duration</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {template.data.map((med, idx) => {
                                      // Handle both formats (API and local)
                                      const medicineName = med.medicine || med.name || '';
                                      const doseText = med.dose || '';
                                      const timingText = med.timing || med.when || '';
                                      const frequencyText = med.frequency || '';
                                      const durationText = med.duration || '';
                                      
                                      return (
                                        <TableRow key={idx}>
                                          <TableCell>{medicineName}</TableCell>
                                          <TableCell>{doseText}</TableCell>
                                          <TableCell>{timingText}</TableCell>
                                          <TableCell>{frequencyText}</TableCell>
                                          <TableCell>{durationText}</TableCell>
                                        </TableRow>
                                      );
                                    })}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            )}
                            
                            {currentTemplateType === 'diagnoses' && (
                              <TableContainer component={Paper} sx={{ mb: 1 }}>
                                <Table size="small">
                                  <TableHead>
                                    <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}>
                                      <TableCell>Diagnosis</TableCell>
                                      <TableCell>Duration</TableCell>
                                      <TableCell>Notes</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {template.data.map((diag, idx) => {
                                      // Handle both formats (API and local)
                                      const diagnosisText = diag.diagnosis || diag.name || '';
                                      const durationText = diag.duration || '';
                                      const notesText = diag.notes || '';
                                      
                                      return (
                                        <TableRow key={idx}>
                                          <TableCell>{diagnosisText}</TableCell>
                                          <TableCell>{durationText}</TableCell>
                                          <TableCell>{notesText}</TableCell>
                                        </TableRow>
                                      );
                                    })}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            )}
                            
                            {currentTemplateType === 'complaints' && (
                              <TableContainer component={Paper} sx={{ mb: 1 }}>
                                <Table size="small">
                                  <TableHead>
                                    <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}>
                                      <TableCell>Complaint</TableCell>
                                      <TableCell>Severity</TableCell>
                                      <TableCell>Frequency</TableCell>
                                      <TableCell>Duration</TableCell>
                                      <TableCell>Notes</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {template.data.map((comp, idx) => {
                                      // Handle both formats (API and local)
                                      const complaintText = comp.complaint || comp.name || '';
                                      const severityText = comp.severity || '';
                                      const frequencyText = comp.frequency || '';
                                      const durationText = comp.duration || '';
                                      const notesText = comp.notes || '';
                                      
                                      return (
                                        <TableRow key={idx}>
                                          <TableCell>{complaintText}</TableCell>
                                          <TableCell>{severityText}</TableCell>
                                          <TableCell>{frequencyText}</TableCell>
                                          <TableCell>{durationText}</TableCell>
                                          <TableCell>{notesText}</TableCell>
                                        </TableRow>
                                      );
                                    })}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            )}
                          </Box>
                          
                          {/* Removing the bottom load template button */}
                        </Box>
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

  return <PrescriptionForm onSubmit={handleFormSubmit} />;
};

export default PrescriptionPage;
