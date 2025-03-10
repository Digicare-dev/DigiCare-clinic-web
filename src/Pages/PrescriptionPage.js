import React, { useState, useRef } from "react";
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
} from "@mui/material";
import {
  AddCircleOutline,
  RemoveCircleOutline,
  Cancel as CancelIcon,
  CheckCircle,
  MedicalInformation as MedicalInformationIcon,
} from "@mui/icons-material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "./PrescriptionPage.css";

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

// Change from a page to a reusable component
export const PrescriptionForm = ({ 
  initialData = {}, 
  onSubmit,
  readOnly = false,
  showPrintButton = true,
  hidePatientDetails = false,
  patientInfo = null
}) => {
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

  const [newTest, setNewTest] = useState("");
  const [signature, setSignature] = useState(initialData.signature || "");
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Initialize complaints with initialData or default
  const [complaints, setComplaints] = useState(
    initialData.complaints || [
    { complaint: '', severity: '', duration: '', isEditing: false }
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
    updatedComplaints[updatedComplaints.length - 1].isEditing = false; // Close the current row
    setComplaints(updatedComplaints); // Update state to close dropdown

    setTimeout(() => {
        setComplaints(prev => [...prev, { complaint: '', severity: '', duration: '', isEditing: false }]);
        const newIndex = complaints.length;
        const newElement = document.querySelector(`#complaint-${newIndex}`);
        if (newElement && newElement.querySelector('input')) {
            newElement.querySelector('input').focus();
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

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container className="prescription-container" sx={{ pb: 3 }}>
        <form onSubmit={handleSubmit}>
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
              <Typography variant="h6" className="section-header" sx={{ mt: 0, mb: 2 }}>
                Complaints
              </Typography>
              
              <TableContainer component={Paper} className="compact-table" sx={{ mb: 0.5, border: '1px solid rgba(224, 224, 224, 1)' }}>
                <Table size="small" sx={{ '& .MuiTableCell-root': { borderRight: '1px solid rgba(224, 224, 224, 1)' } }}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}>
                      <TableCell>Complaint</TableCell>
                      <TableCell>Severity</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell width="50px" sx={{ borderRight: 'none' }}></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {complaints.map((row, index) => (
                      <TableRow 
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent click propagation
                          const updatedComplaints = complaints.map((c, i) => ({
                            ...c,
                            isEditing: i === index
                          }));
                          setComplaints(updatedComplaints);
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
                            onClose={() => handleClickAway(index)}
                            onChange={(_, value) => handleComplaintChange(index, 'complaint', value)}
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
                            onClose={() => handleClickAway(index)}
                            onChange={(_, value) => handleComplaintChange(index, 'severity', value)}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                variant="standard"
                                placeholder="Select severity"
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
                            onClose={() => handleClickAway(index)}
                            onChange={(_, value) => handleComplaintChange(index, 'duration', value)}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                variant="standard"
                                placeholder="Select duration"
                              />
                            )}
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
              <Typography variant="h6" className="section-header" sx={{ mt: 0, mb: 2 }}>
                Diagnosis
              </Typography>
              
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
                          e.stopPropagation();
                          const updatedDiagnoses = diagnoses.map((d, i) => ({
                            ...d,
                            isEditing: i === index
                          }));
                          setDiagnoses(updatedDiagnoses);
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
                            onClose={() => handleDiagnosisClickAway(index)}
                            onChange={(_, value) => handleDiagnosisChange(index, 'diagnosis', value)}
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
                            onClose={() => handleDiagnosisClickAway(index)}
                            onChange={(_, value) => handleDiagnosisChange(index, 'duration', value)}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                variant="standard"
                                placeholder="Select duration"
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
              <Typography variant="h6" className="section-header" sx={{ mt: 0, mb: 2 }}>
                Medications
              </Typography>
              
              <TableContainer component={Paper} className="compact-table" sx={{ mb: 0.5, border: '1px solid rgba(224, 224, 224, 1)' }}>
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
                    {medications.map((row, index) => (
                      <TableRow 
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          const updatedMedications = medications.map((m, i) => ({
                            ...m,
                            isEditing: i === index
                          }));
                          setMedications(updatedMedications);
                        }}
                        sx={{ '&:nth-of-type(odd)': { backgroundColor: 'rgba(0, 0, 0, 0.02)' }, '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}
                      >
                        <TableCell>
                          <Autocomplete
                            id={`med-medicine-${index}`}
                            freeSolo
                            size="small"
                            options={dummyDrugs.map(drug => drug.label)}
                            value={row.medicine}
                            open={row.isEditing}
                            onClose={() => handleMedicationClickAway(index)}
                            onChange={(_, value) => handleMedicationChange(index, 'medicine', value)}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                variant="standard"
                                placeholder="Enter medicine"
                                onFocus={(e) => {
                                  if (e.target === document.activeElement) {
                                    e.stopPropagation();
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
                            onClose={() => handleMedicationClickAway(index)}
                            onChange={(_, value) => handleMedicationChange(index, 'dose', value)}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                variant="standard"
                                placeholder="Select dose"
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
                            onClose={() => handleMedicationClickAway(index)}
                            onChange={(_, value) => handleMedicationChange(index, 'timing', value)}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                variant="standard"
                                placeholder="Select timing"
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
                            onClose={() => handleMedicationClickAway(index)}
                            onChange={(_, value) => handleMedicationChange(index, 'frequency', value)}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                variant="standard"
                                placeholder="Select frequency"
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
                            onClose={() => handleMedicationClickAway(index)}
                            onChange={(_, value) => handleMedicationChange(index, 'duration', value)}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                variant="standard"
                                placeholder="Select duration"
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
                          {medications.length > 1 && index !== medications.length - 1 && (
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                setMedications(medications.filter((_, i) => i !== index));
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
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ px: 3, py: 1 }}
              >
                {readOnly ? "Save" : "Submit"}
              </Button>
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
    </LocalizationProvider>
  );
};

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
