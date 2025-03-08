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

const PrescriptionPage = () => {
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
    },
    medications: [
      {
        drug: "",
        dosage: "",
        frequency: "",
        duration: "",
        withFood: false,
      },
    ],
    tests: [],
    instructions: "",
    followUp: "",
    signature: "",
  });

  const [newTest, setNewTest] = useState("");
  const [signature, setSignature] = useState("");
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Add this to your PrescriptionPage component state
  const [complaints, setComplaints] = useState([
    { complaint: '', severity: '', duration: '', isEditing: false }
  ]);

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

  // Add these to your state declarations
  const [diagnoses, setDiagnoses] = useState([
    { diagnosis: '', duration: '', isEditing: false }
  ]);

  const [medications, setMedications] = useState([
    { medicine: '', dose: '', timing: '', frequency: '', duration: '', isEditing: false }
  ]);

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

  // const handleMedicationChange = (field, value, index) => {
  //   const meds = [...prescription.medications];
  //   meds[index][field] = value;
  //   setPrescription({ ...prescription, medications: meds });
  // };

  const handleCheckboxChange = (index) => {
    const meds = [...prescription.medications];
    meds[index].withFood = !meds[index].withFood;
    setPrescription({ ...prescription, medications: meds });
  };

  const addMedication = () => {
    setPrescription({
      ...prescription,
      medications: [
        ...prescription.medications,
        { drug: "", dosage: "", frequency: "", duration: "", withFood: false },
      ],
    });
  };

  const removeMedication = (index) => {
    const meds = [...prescription.medications];
    meds.splice(index, 1);
    setPrescription({ ...prescription, medications: meds });
  };

  const handleTestChange = (value) => {
    setNewTest(value);
  };

  const addTest = () => {
    if (newTest) {
      setPrescription({
        ...prescription,
        tests: [...prescription.tests, newTest],
      });
      setNewTest("");
    }
  };

  const removeTest = (index) => {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ ...prescription, signature });
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
    setComplaints(prev => [...prev, { complaint: '', severity: '', duration: '', isEditing: false }]);
    
    // Don't try to focus immediately - wait for the component to render
    setTimeout(() => {
      const newIndex = complaints.length;
      const newElement = document.querySelector(`#complaint-${newIndex}`);
      if (newElement && newElement.querySelector('input')) {
        newElement.querySelector('input').focus();
      }
    }, 200); // Increase timeout to ensure DOM is updated
  };

  // Add these handler functions
  const handleDiagnosisChange = (index, field, value) => {
    const updatedDiagnoses = [...diagnoses];
    updatedDiagnoses[index][field] = value;
    
    if (value) {
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
    
    if (value) {
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
    setDiagnoses(prev => [...prev, { diagnosis: '', duration: '', isEditing: false }]);
    
    // Wait longer for the DOM to update
    setTimeout(() => {
      const newIndex = diagnoses.length;
      const element = document.querySelector(`#diagnosis-${newIndex}`);
      if (element && element.querySelector('input')) {
        element.querySelector('input').focus();
      }
    }, 200);
  };

  // Modify addNewMedicationRow to prevent auto-opening dropdown
  const addNewMedicationRow = () => {
    setMedications(prev => [...prev, { 
      medicine: '', dose: '', timing: '', frequency: '', duration: '', isEditing: false 
    }]);
    
    // Wait longer for the DOM to update
    setTimeout(() => {
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
          <Grid container spacing={1}>
            {/* Combined Patient Details and Vitals */}
            <Grid item xs={12} sx={{ mb: 0.5 }}>
              <Paper elevation={0} sx={{ p: 1, backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <Grid container spacing={1}>
                  {/* Patient Details Row */}
                  <Grid item xs={12} sm={5} md={6}>
                    <TextField
                      fullWidth
                      label="Patient Name"
                      name="patientName"
                      value={prescription.patientName}
                      onChange={handleChange}
                      required
                      size="small"
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
                  
                  {/* Vitals Row */}
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
              </Paper>
            </Grid>

            {/* Add just one divider after patient information */}
            <Grid item xs={12}>
              <Divider sx={{ my: 0.5 }} />
            </Grid>

            {/* Complaints Section */}
            <Grid item xs={12} sx={{ mt: 0 }}>
              <Typography variant="h6" className="section-header" sx={{ mt: 0, mb: 0.5 }}>
                Complaints
              </Typography>
              
              <TableContainer component={Paper} className="compact-table" sx={{ mb: 0.5 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Complaint</TableCell>
                      <TableCell>Severity</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell width="50px"></TableCell>
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

            {/* Diagnosis Table */}
            <Grid item xs={12} sx={{ mt: 0 }}>
              <Typography variant="h6" className="section-header" sx={{ mt: 0, mb: 0.5 }}>
                Diagnosis
              </Typography>
              
              <TableContainer component={Paper} className="compact-table" sx={{ mb: 0.5 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Diagnosis</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell width="50px"></TableCell>
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

            {/* Medications Table */}
            <Grid item xs={12} sx={{ mt: 0 }}>
              <Typography variant="h6" className="section-header" sx={{ mt: 0, mb: 0.5 }}>
                Medications
              </Typography>
              
              <TableContainer component={Paper} className="compact-table" sx={{ mb: 0.5 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Medicine</TableCell>
                      <TableCell>Dose</TableCell>
                      <TableCell>Timing</TableCell>
                      <TableCell>Frequency</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell width="50px"></TableCell>
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

            {/* Tests Section */}
            <Grid item xs={12} sx={{ mt: 0 }}>
              <Typography variant="h6" className="section-header" sx={{ mt: 0, mb: 0.5 }}>
                Recommended Tests
              </Typography>

              <Grid container spacing={1} alignItems="center">
                <Grid item xs={9} sm={4} md={3}>
                  <Autocomplete
                    freeSolo
                    size="small"
                    options={dummyTests}
                    value={newTest}
                    onChange={(e, value) => handleTestChange(value)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Test"
                        placeholder="Type to search"
                        size="small"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={3} sm={2} md={1}>
                  <Button 
                    variant="outlined" 
                    onClick={addTest} 
                    fullWidth
                    size="small"
                  >
                    Add
                  </Button>
                </Grid>
                
                <Grid item xs={12}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 0.5,
                      mt: 0.5,
                      backgroundColor: '#f8fafc', 
                      borderRadius: '8px',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 1,
                      minHeight: prescription.tests.length ? 'auto' : '24px'
                    }}
                  >
                    {prescription.tests.map((test, index) => (
                      <Chip
                        key={index}
                        label={test}
                        onDelete={() => removeTest(index)}
                        size="small"
                        sx={{ 
                          backgroundColor: '#fff',
                          border: '1px solid #e2e8f0',
                          '& .MuiChip-deleteIcon': {
                            color: '#ef4444',
                            '&:hover': { color: '#b91c1c' }
                          }
                        }}
                      />
                    ))}
                    {!prescription.tests.length && 
                      <Typography variant="caption" color="text.secondary" sx={{ p: 0 }}>
                        No tests added yet
                      </Typography>
                    }
                  </Paper>
                </Grid>
              </Grid>
            </Grid>

            {/* Additional Information */}
            <Grid item xs={12} sx={{ mt: 0 }}>
              <Typography variant="h6" className="section-header" sx={{ mt: 0, mb: 0.5 }}>
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

            {/* Submit */}
            <Grid item xs={12} className="action-buttons" sx={{ mt: 1, mb: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="small"
                sx={{ 
                  px: 2,
                  py: 0.5,
                  boxShadow: '0 4px 6px rgba(37, 99, 235, 0.1)',
                  fontWeight: 500
                }}
              >
                Save Prescription
              </Button>
              <Button
                variant="outlined"
                color="primary"
                size="small"
                onClick={() => window.print()}
                sx={{ px: 2, py: 0.5, ml: 1 }}
              >
                Print
              </Button>
            </Grid>
            
            {/* Add an empty spacer element to ensure scrollability */}
            <Grid item xs={12} sx={{ height: '120px' }}></Grid>
          </Grid>
        </form>
      </Container>
    </LocalizationProvider>
  );
};

export default PrescriptionPage;
