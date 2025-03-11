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
} from "@mui/icons-material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "./PrescriptionPage.css";
import { useNavigate, useParams } from 'react-router-dom';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import SaveIcon from '@mui/icons-material/Save';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import DeleteIcon from '@mui/icons-material/Delete';
import { saveTemplate, getTemplates, deleteTemplate, resetToDefaultTemplates } from '../services/templateService';
import { 
  saveTemplate as saveTemplateApi, 
  getTemplates as getTemplatesFromAPI,
  deleteTemplate as deleteTemplateApi,
  editTemplate as editTemplateApi,
  suggest as suggestMedicines
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
const dummyDrugs = [
  {
    label: "Paracetamol",
    dosage: ["1 tablet", "1/2 tablet", "1/4 tablet"],
    frequency: ["OD (Morning)", "BD (Morning & Night)", "TDS (After meals)"],
    duration: ["3 days", "5 days", "7 days"],
    type: "Analgesic",
  },
  {
    label: "Amoxicillin",
    dosage: ["1 tablet", "1/2 tablet", "1/4 tablet"],
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
  initialData = {}, 
  onSubmit,
  readOnly = false,
  showPrintButton = true,
  showSubmitButton = true,
  hidePatientDetails = false,
  patientInfo = null
}, ref) => {
  // Initialize state with initialData or default values
  const [prescription, setPrescription] = useState({
    patientName: initialData.patientName || "",
    age: initialData.age || "",
    gender: initialData.gender || "",
    weight: initialData.weight || "",
    vitals: {
      bloodPressure: initialData.vitals?.bloodPressure || "",
      heartRate: initialData.vitals?.heartRate || "",
      temperature: initialData.vitals?.temperature || "",
      respiratoryRate: initialData.vitals?.respiratoryRate || "",
      spO2: initialData.vitals?.spO2 || "",
    },
    medications: initialData.medications || [
      {
        drug: "",
        dosage: "",
        frequency: "",
        duration: "",
        withFood: false,
      },
    ],
    tests: initialData.tests || [],
    instructions: initialData.instructions || "",
    followUp: initialData.followUp || "",
    signature: initialData.signature || "",
  });
  const user = JSON.parse(localStorage.getItem("user"));
  
  // Extract cabin information using the new utility function
  const { cabinId, selectedSlot } = getCabinInfoFromUser(user);

  const [newTest, setNewTest] = useState("");
  const [signature, setSignature] = useState(initialData.signature || "");
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Initialize complaints with initialData or default
  const [complaints, setComplaints] = useState(
    initialData.complaints || [
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
    initialData.diagnoses || [
    { diagnosis: '', duration: '', notes: '', isEditing: false }
    ]
  );

  // Initialize medications with initialData or default
  const [medications, setMedications] = useState(
    initialData.medications || [
    { medicine: '', dose: '', timing: '', frequency: '', duration: '', notes: '', isEditing: false }
    ]
  );

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
        getFormData: () => ({
          complaints,
          diagnoses,
          medications,
          tests: prescription.tests || [],
          instructions: prescription.instructions || "",
          vitals: prescription.vitals || {},
        }),
        submitForm: () => {
          const formData = {
            ...prescription,
            complaints,
            diagnoses,
            medications,
            signature
          };
          
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
    
    // Prepare the complete data to send to parent component
    const formData = {
      ...prescription,
      complaints,
      diagnoses,
      medications,
      signature
    };
    
    // Call the onSubmit function passed as prop
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPrescription({ ...prescription, [name]: value });
  };

  const handleDrugChange = (value, index) => {
    const meds = [...prescription.medications];
    meds[index].drug = value?.label || value;

    const selectedDrug = dummyDrugs.find((d) => d.label === value?.label);
    if (selectedDrug) {
      meds[index].dosage = selectedDrug.dosage[0];
      meds[index].frequency = selectedDrug.frequency[0];
      meds[index].duration = selectedDrug.duration[0];
    }

    setPrescription({ ...prescription, medications: meds });
  };

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
        { drug: "", dosage: "", frequency: "", duration: "", withFood: false },
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
    const updatedComplaints = [...complaints];
    updatedComplaints[index].isEditing = false;
    setComplaints(updatedComplaints);
  };

  // Also modify the handleComplaintChange function to include the auto-close behavior
  const handleComplaintChange = (index, field, value) => {
    const updatedComplaints = [...complaints];
    updatedComplaints[index][field] = value;
    
    if (value) {
      const currentRow = updatedComplaints[index];
      
      // Auto-focus next field
      if (field === 'complaint' && value) {
        const nextElement = document.querySelector(`#severity-${index}`);
        if (nextElement) nextElement.focus();
      } else if (field === 'severity' && value) {
        const nextElement = document.querySelector(`#duration-${index}`);
        if (nextElement) nextElement.focus();
      }

      // Check if all fields in current row are filled
      if (currentRow.complaint && currentRow.severity && currentRow.duration) {
        // Close current row
        updatedComplaints[index].isEditing = false;
        setComplaints(updatedComplaints);
        
        // Add new row if this is the last row
        if (index === complaints.length - 1) {
          setTimeout(() => {
            addNewComplaintRow();
          }, 100);
        }
      }
    }
    
    setComplaints(updatedComplaints);
  };

  // Modify addNewComplaintRow to prevent auto-opening dropdown
  const addNewComplaintRow = () => {
    if (readOnly) return;
    
    const updatedComplaints = [...complaints];
    updatedComplaints[updatedComplaints.length - 1].isEditing = false;
    setComplaints(updatedComplaints);

    setTimeout(() => {
      setComplaints(prev => [...prev, { 
        complaint: '', 
        severity: '', 
        frequency: '',
        duration: '', 
        notes: '', 
        isEditing: false 
      }]);
      const newIndex = complaints.length;
      const element = document.querySelector(`#complaint-${newIndex}`);
      if (element && element.querySelector('input')) {
        element.querySelector('input').focus();
      }
    }, 200);
  };

  // Add these handler functions
  const handleDiagnosisChange = (index, field, value) => {
    const updatedDiagnoses = [...diagnoses];
    updatedDiagnoses[index][field] = value;
    
    // Only proceed with auto-focus and dropdown logic if not editing notes
    if (value && field !== 'notes') {
      const currentRow = updatedDiagnoses[index];
      
      // Auto-focus next field with unique IDs
      if (field === 'diagnosis' && value) {
        const nextElement = document.querySelector(`#diagnosis-duration-${index}`);
        if (nextElement) nextElement.focus();
      }

      // Check if all fields in current row are filled
      if (currentRow.diagnosis && currentRow.duration) {
        updatedDiagnoses[index].isEditing = false;
        setDiagnoses(updatedDiagnoses);
        
        if (index === diagnoses.length - 1) {
          setTimeout(() => {
            addNewDiagnosisRow();
          }, 100);
        }
      }
    }
    
    setDiagnoses(updatedDiagnoses);
  };

  const handleMedicationChange = (index, field, value) => {
    const updatedMedications = [...medications];
    updatedMedications[index][field] = value;
    
    // Only proceed with auto-focus and dropdown logic if not editing notes
    if (value && field !== 'notes') {
      const currentRow = updatedMedications[index];
      
      // Auto-focus next field logic with unique IDs
      const fields = ['medicine', 'dose', 'timing', 'frequency', 'duration'];
      const currentFieldIndex = fields.indexOf(field);
      if (currentFieldIndex < fields.length - 1) {
        const nextField = fields[currentFieldIndex + 1];
        const nextElement = document.querySelector(`#med-${nextField}-${index}`);
        if (nextElement) nextElement.focus();
      }

      // Check if all fields are filled
      if (currentRow.medicine && currentRow.dose && currentRow.timing && 
          currentRow.frequency && currentRow.duration) {
        updatedMedications[index].isEditing = false;
        setMedications(updatedMedications);
        
        if (index === medications.length - 1) {
          setTimeout(() => {
            addNewMedicationRow();
          }, 100);
        }
      }
    }
    
    setMedications(updatedMedications);
  };

  const handleMedicationClickAway = (index) => {
    // Close the dropdown for the specific row, regardless of field completion
    const updatedMedications = [...medications];
    updatedMedications[index].isEditing = false;
    setMedications(updatedMedications);
  };

  // Modify addNewDiagnosisRow to prevent auto-opening dropdown
  const addNewDiagnosisRow = () => {
    if (readOnly) return;
    
    const updatedDiagnoses = [...diagnoses];
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
    if (readOnly) return;
    
    const updatedMedications = [...medications];
    updatedMedications[updatedMedications.length - 1].isEditing = false; // Close the current row
    setMedications(updatedMedications); // Update state to close dropdown

    setTimeout(() => {
        setMedications(prev => [...prev, { 
            medicine: '', dose: '', timing: '', frequency: '', duration: '', notes: '', isEditing: false 
        }]);
        const newIndex = medications.length;
        const element = document.querySelector(`#med-medicine-${newIndex}`);
        if (element && element.querySelector('input')) {
            element.querySelector('input').focus();
        }
    }, 200);
  };

  // Add these click-away handlers
  const handleDiagnosisClickAway = (index) => {
    // Close the dropdown for the specific row, regardless of field completion
    const updatedDiagnoses = [...diagnoses];
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
      const { fetchPastPrescriptions } = await import('../services/dummyDataServiceFixed');
      
      // Fetch past prescriptions for the patient
      console.log("Calling fetchPastPrescriptions with ID:", patientInfo.id);
      const prescriptions = await fetchPastPrescriptions(patientInfo.id);
      console.log("Fetched prescriptions:", prescriptions);
      
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
    const newMedications = pastMedications.filter(med => 
      !existingMedicineNames.includes(med.medicine.toLowerCase())
    );
    
    console.log('New medications to add (duplicates filtered):', newMedications);
    
    // Skip if no new medications to add (silently ignore duplicates)
    if (newMedications.length === 0) {
      return;
    }
    
    // Add isEditing property to each medication and ensure all required fields are present
    const medicationsWithEditing = newMedications.map(med => ({
      medicine: med.medicine || '',
      dose: med.dose || '',
      timing: med.timing || '',
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
    console.log('Updated medications state with new medications');
    
    // Don't close the modal - allow user to copy from multiple past prescriptions
    // Don't update the parent component to avoid triggering form submission
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
          
          // Otherwise, transform from API format to expected format
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
        
        const nonEmptyComplaints = complaints.filter(complaint => 
          complaint.complaint && complaint.complaint.trim()
        );
        
        const hasEmptyComplaintsTable = nonEmptyComplaints.length === 0;
        
        let updatedComplaints = hasEmptyComplaintsTable
          ? complaintsData
          : [...nonEmptyComplaints, ...complaintsData];
        
        // Add empty row at the end if needed
        if (updatedComplaints.length === 0 || updatedComplaints[updatedComplaints.length - 1].complaint) {
          updatedComplaints.push({
            complaint: "",
            severity: "",
            duration: "",
            isEditing: false
          });
        }
        
        setComplaints(updatedComplaints);
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
    if (!query || query.length < 2) {
      setSuggestedMedicines([]);
      return;
    }
    
    setIsLoadingSuggestions(true);
    try {
      const response = await suggestMedicines(query);
      console.log('Medicine suggestions:', response);
      
      if (response && Array.isArray(response)) {
        // Store the full medicine objects to use in the dropdown
        setSuggestedMedicines(response);
      } else {
        setSuggestedMedicines([]);
      }
    } catch (error) {
      console.error('Error fetching medicine suggestions:', error);
      setSuggestedMedicines([]);
    } finally {
      setIsLoadingSuggestions(false);
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

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container className="prescription-container" sx={{ pb: 3 }}>
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
                    {complaints.map((row, index) => (
                      <TableRow 
                        key={index}
                        onClick={(e) => {
                          // No longer activate editing at the row level
                          // Editing will only be activated by clicking on the specific inputs
                          e.stopPropagation();
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
                              // Only close when clicking away, not when selecting an item
                              if (reason === 'escape' || reason === 'blur') {
                                handleClickAway(index);
                              }
                            }}
                            onChange={(_, value) => {
                              handleComplaintChange(index, 'complaint', value);
                              // Keep isEditing true after selection
                              const updatedComplaints = [...complaints];
                              updatedComplaints[index].isEditing = true;
                              setComplaints(updatedComplaints);
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                variant="standard"
                                placeholder="Enter complaint"
                                onFocus={(e) => {
                                  if (e.target === document.activeElement) {
                                    e.stopPropagation();
                                    const updatedComplaints = [...complaints];
                                    updatedComplaints[index].isEditing = true;
                                    setComplaints(updatedComplaints);
                                  }
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!readOnly && (row.complaint || index !== complaints.length - 1)) {
                                    const updatedComplaints = [...complaints];
                                    updatedComplaints[index].isEditing = true;
                                    setComplaints(updatedComplaints);
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
                              const updatedComplaints = [...complaints];
                              updatedComplaints[index].isEditing = true;
                              setComplaints(updatedComplaints);
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                variant="standard"
                                placeholder="Select severity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!readOnly && (row.complaint || index !== complaints.length - 1)) {
                                    const updatedComplaints = [...complaints];
                                    updatedComplaints[index].isEditing = true;
                                    setComplaints(updatedComplaints);
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
                              const updatedComplaints = [...complaints];
                              updatedComplaints[index].isEditing = true;
                              setComplaints(updatedComplaints);
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                variant="standard"
                                placeholder="Select frequency"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!readOnly && (row.complaint || index !== complaints.length - 1)) {
                                    const updatedComplaints = [...complaints];
                                    updatedComplaints[index].isEditing = true;
                                    setComplaints(updatedComplaints);
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
                              const updatedComplaints = [...complaints];
                              updatedComplaints[index].isEditing = true;
                              setComplaints(updatedComplaints);
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                variant="standard"
                                placeholder="Select duration"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!readOnly && (row.complaint || index !== complaints.length - 1)) {
                                    const updatedComplaints = [...complaints];
                                    updatedComplaints[index].isEditing = true;
                                    setComplaints(updatedComplaints);
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
                          {complaints.length > 1 && index !== complaints.length - 1 && (
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                const updatedComplaints = complaints.filter((_, i) => i !== index);
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
                                  if (e.target === document.activeElement) {
                                    e.stopPropagation();
                                    const updatedDiagnoses = [...diagnoses];
                                    updatedDiagnoses[index].isEditing = true;
                                    setDiagnoses(updatedDiagnoses);
                                  }
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
                          {diagnoses.length > 1 && index !== diagnoses.length - 1 && (
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
              
              <TableContainer component={Paper} className="compact-table" sx={{ mb: 0.5, border: '1px solid rgba(224, 224, 224, 1)' }}>
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
                        }}
                        sx={{ '&:nth-of-type(odd)': { backgroundColor: 'rgba(0, 0, 0, 0.02)' }, '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}
                      >
                        <TableCell>
                          <Autocomplete
                            id={`med-medicine-${index}`}
                            freeSolo
                            size="small"
                            options={suggestedMedicines}
                            getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
                            value={row.medicine}
                            open={row.isEditing && medicineSearchQuery.length >= 2}
                            loading={isLoadingSuggestions}
                            noOptionsText="No medicines found"
                            filterOptions={(x) => x} // Disable built-in filtering as we're using the API
                            ListboxProps={{
                              style: { 
                                maxHeight: '300px',
                                padding: '8px 0'
                              }
                            }}
                            PaperComponent={({ children, ...props }) => (
                              <Paper {...props} elevation={3} sx={{ width: 'auto', minWidth: '350px' }}>
                                {children}
                              </Paper>
                            )}
                            onInputChange={(event, newInputValue) => {
                              if (event) {
                                setMedicineSearchQuery(newInputValue);
                              }
                            }}
                            onClose={(e, reason) => {
                              // Only close when clicking away, not when selecting an item
                              if (reason === 'escape' || reason === 'blur') {
                                handleMedicationClickAway(index);
                                // Clear suggestions when closing
                                setSuggestedMedicines([]);
                                setMedicineSearchQuery('');
                              }
                            }}
                            onChange={(_, value) => {
                              // Handle both string values and medicine objects
                              const medicineValue = typeof value === 'string' ? value : value?.name || '';
                              handleMedicationChange(index, 'medicine', medicineValue);
                              
                              // Keep isEditing true after selection
                              const updatedMedications = [...medications];
                              updatedMedications[index].isEditing = true;
                              setMedications(updatedMedications);
                              
                              // Clear suggestions after selection
                              setSuggestedMedicines([]);
                              setMedicineSearchQuery('');
                            }}
                            renderOption={(props, option) => (
                              <li {...props}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', py: 0.8, px: 1 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                    {option.name}
                                  </Typography>
                                  {option.generic_name && (
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                      {option.generic_name}
                                    </Typography>
                                  )}
                                </Box>
                              </li>
                            )}
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
                                  if (e.target === document.activeElement) {
                                    e.stopPropagation();
                                    const updatedMedications = [...medications];
                                    updatedMedications[index].isEditing = true;
                                    setMedications(updatedMedications);
                                  }
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!readOnly && (row.medicine || index !== medications.length - 1)) {
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
                            id={`med-dose-${index}`}
                            freeSolo
                            size="small"
                            options={medicineDosePatterns}
                            value={row.dose}
                            open={row.isEditing}
                            onClose={(e, reason) => {
                              // Only close when clicking away, not when selecting an item
                              if (reason === 'escape' || reason === 'blur') {
                                handleMedicationClickAway(index);
                              }
                            }}
                            onChange={(_, value) => {
                              handleMedicationChange(index, 'dose', value);
                              // Keep isEditing true after selection
                              const updatedMedications = [...medications];
                              updatedMedications[index].isEditing = true;
                              setMedications(updatedMedications);
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                variant="standard"
                                placeholder="Select dose"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!readOnly && (row.medicine || index !== medications.length - 1)) {
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
                            value={row.timing}
                            open={row.isEditing}
                            onClose={(e, reason) => {
                              // Only close when clicking away, not when selecting an item
                              if (reason === 'escape' || reason === 'blur') {
                                handleMedicationClickAway(index);
                              }
                            }}
                            onChange={(_, value) => {
                              handleMedicationChange(index, 'timing', value);
                              // Keep isEditing true after selection
                              const updatedMedications = [...medications];
                              updatedMedications[index].isEditing = true;
                              setMedications(updatedMedications);
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                variant="standard"
                                placeholder="Select timing"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!readOnly && (row.medicine || index !== medications.length - 1)) {
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
                            id={`med-frequency-${index}`}
                            freeSolo
                            size="small"
                            options={medicineFrequency}
                            value={row.frequency}
                            open={row.isEditing}
                            onClose={(e, reason) => {
                              // Only close when clicking away, not when selecting an item
                              if (reason === 'escape' || reason === 'blur') {
                                handleMedicationClickAway(index);
                              }
                            }}
                            onChange={(_, value) => {
                              handleMedicationChange(index, 'frequency', value);
                              // Keep isEditing true after selection
                              const updatedMedications = [...medications];
                              updatedMedications[index].isEditing = true;
                              setMedications(updatedMedications);
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                variant="standard"
                                placeholder="Select frequency"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!readOnly && (row.medicine || index !== medications.length - 1)) {
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
                            id={`med-duration-${index}`}
                            freeSolo
                            size="small"
                            options={medicineDuration}
                            value={row.duration}
                            open={row.isEditing}
                            onClose={(e, reason) => {
                              // Only close when clicking away, not when selecting an item
                              if (reason === 'escape' || reason === 'blur') {
                                handleMedicationClickAway(index);
                              }
                            }}
                            onChange={(_, value) => {
                              handleMedicationChange(index, 'duration', value);
                              // Keep isEditing true after selection
                              const updatedMedications = [...medications];
                              updatedMedications[index].isEditing = true;
                              setMedications(updatedMedications);
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                variant="standard"
                                placeholder="Select duration"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!readOnly && (row.medicine || index !== medications.length - 1)) {
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
                          <TextField
                            id={`med-notes-${index}`}
                            size="small"
                            variant="standard"
                            placeholder="Add notes"
                            value={row.notes || ''}
                            onChange={(e) => handleMedicationChange(index, 'notes', e.target.value)}
                            onClick={(e) => e.stopPropagation()} // Prevent row click event
                            onFocus={(e) => e.stopPropagation()} // Prevent opening dropdown
                            fullWidth
                          />
                        </TableCell>
                        <TableCell>
                          {!readOnly && (
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setMedications(medications.filter((_, i) => i !== index));
                              }}
                              style={{ visibility: (medications.length > 1 && index !== medications.length - 1) ? 'visible' : 'hidden' }}
                            >
                              <RemoveCircleOutline fontSize="small" color="error" />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
            
            <Grid item xs={12} sx={{ height: '120px' }}></Grid>
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
                    mb: 3
                  }}>
                    <Typography variant="h6" sx={{ fontWeight: 'medium', color: '#2196f3' }}>
                      {new Date(prescription.date).toLocaleDateString()}
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      startIcon={<ContentCopyIcon />}
                      onClick={() => copyMedicationsFromPast(prescription.medications)}
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
                          {prescription.medications.map((med, i) => (
                            <TableRow key={i}>
                              <TableCell>{med.medicine}</TableCell>
                              <TableCell>{med.dose}</TableCell>
                              <TableCell>{med.timing}</TableCell>
                              <TableCell>{med.frequency}</TableCell>
                              <TableCell>{med.duration}</TableCell>
                              <TableCell>{med.notes}</TableCell>
                            </TableRow>
                          ))}
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
                          <Typography variant="subtitle1" fontWeight="500">
                            {template.name}
                          </Typography>
                          <Box>
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
                          {template.timestamp && (
                            <Typography variant="body2" color="text.secondary">
                              Created: {new Date(template.timestamp).toLocaleString()}
                            </Typography>
                          )}
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Items: {template.data.length}
                          </Typography>
                          
                          <Box sx={{ mt: 2, mb: 1 }}>
                            {currentTemplateType === 'medications' && (
                              <List dense disablePadding>
                                {template.data.map((med, idx) => {
                                  // Handle both formats (API and local)
                                  const medicineName = med.medicine || med.name || '';
                                  const doseText = med.dose || '';
                                  const timingText = med.timing || med.when || '';
                                  const frequencyText = med.frequency || '';
                                  const durationText = med.duration || '';
                                  
                                  return (
                                    <ListItem key={idx} disablePadding sx={{ py: 0.5 }}>
                                      <ListItemText
                                        primary={medicineName}
                                        secondary={`${doseText} ${timingText ? `- ${timingText}` : ''} ${frequencyText ? `- ${frequencyText}` : ''} ${durationText ? `- ${durationText}` : ''}`}
                                      />
                                    </ListItem>
                                  );
                                })}
                              </List>
                            )}
                            
                            {currentTemplateType === 'diagnoses' && (
                              <List dense disablePadding>
                                {template.data.map((diag, idx) => {
                                  // Handle both formats (API and local)
                                  const diagnosisText = diag.diagnosis || diag.name || '';
                                  const durationText = diag.duration || '';
                                  const notesText = diag.notes || '';
                                  
                                  return (
                                    <ListItem key={idx} disablePadding sx={{ py: 0.5 }}>
                                      <ListItemText
                                        primary={diagnosisText}
                                        secondary={`${durationText || ''} ${notesText ? `- ${notesText}` : ''}`}
                                      />
                                    </ListItem>
                                  );
                                })}
                              </List>
                            )}
                            
                            {currentTemplateType === 'complaints' && (
                              <List dense disablePadding>
                                {template.data.map((comp, idx) => {
                                  // Handle both formats (API and local)
                                  const complaintText = comp.complaint || comp.name || '';
                                  const severityText = comp.severity || '';
                                  const frequencyText = comp.frequency || '';
                                  const durationText = comp.duration || '';
                                  
                                  return (
                                    <ListItem key={idx} disablePadding sx={{ py: 0.5 }}>
                                      <ListItemText
                                        primary={complaintText}
                                        secondary={`${severityText} ${frequencyText ? `- ${frequencyText}` : ''} ${durationText ? `- ${durationText}` : ''}`}
                                      />
                                    </ListItem>
                                  );
                                })}
                              </List>
                            )}
                          </Box>
                          
                          <Box sx={{ mt: 2, textAlign: 'right' }}>
                            <Button 
                              variant="contained" 
                              color="primary"
                              onClick={() => handleLoadTemplate(template)}
                              startIcon={<AddIcon />}
                            >
                              Load Template
                            </Button>
                          </Box>
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
              <Button
                variant="outlined"
                startIcon={<AddCircleOutline />}
                size="small"
                onClick={() => {
                  setTempMedications([
                    ...tempMedications,
                    { medicine: '', dose: '', timing: '', frequency: '', duration: '', notes: '' }
                  ]);
                }}
                sx={{ mb: 2 }}
              >
                Add Medication
              </Button>
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
              <Button
                variant="outlined"
                startIcon={<AddCircleOutline />}
                size="small"
                onClick={() => {
                  setTempDiagnoses([
                    ...tempDiagnoses,
                    { diagnosis: '', duration: '', notes: '' }
                  ]);
                }}
                sx={{ mb: 2 }}
              >
                Add Diagnosis
              </Button>
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
              <Button
                variant="outlined"
                startIcon={<AddCircleOutline />}
                size="small"
                onClick={() => {
                  setTempComplaints([
                    ...tempComplaints,
                    { complaint: '', severity: '', frequency: '', duration: '', notes: '' }
                  ]);
                }}
                sx={{ mb: 2 }}
              >
                Add Complaint
              </Button>
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
