import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Chip,
  Button,
  IconButton,
  Card,
  CardContent,
  TextField,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  AppBar,
  Toolbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Autocomplete,
} from '@mui/material';

// Import Timeline components from the correct package
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';

import {
  CalendarToday,
  LocalHospital,
  MedicalServices,
  Description,
  PictureAsPdf,
  Image,
  InsertDriveFile,
  ExpandMore,
  CheckCircle,
  Add,
  FileUpload,
  Download,
  Print,
  ArrowBack,
  Save,
  Done,
  Close,
  RemoveCircleOutline,
} from '@mui/icons-material';

const ConsultationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openAttachmentDialog, setOpenAttachmentDialog] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const [confirmDoneDialog, setConfirmDoneDialog] = useState(false);

  // Dummy data - in a real app, this would come from props or context
  const patient = {
    id: "P123456",
    name: 'John Doe',
    age: 35,
    gender: 'Male',
    bloodGroup: 'O+',
    contact: '123-456-7890',
    email: 'john.doe@example.com',
    allergies: ['Penicillin', 'Peanuts'],
    chronicConditions: ['Hypertension', 'Diabetes Type 2'],
  };

  const currentAppointment = {
    id: "A789",
    date: '2024-03-10',
    time: '10:00 AM',
    doctor: 'Dr. Smith',
    department: 'Cardiology',
    status: 'Ongoing',
    reason: 'Regular Checkup',
    appointmentType: 'Follow-up',
    token: '45',
    disease: 'Hypertension',
  };

  const vitals = {
    bp: '120/80',
    temp: '98.6°F',
    pulse: '72 bpm',
    weight: '75 kg',
    spO2: '98%',
    respiratoryRate: '16/min',
  };

  // Prescription state
  const [complaints, setComplaints] = useState([
    { complaint: '', severity: '', duration: '', isEditing: false }
  ]);

  const [diagnoses, setDiagnoses] = useState([
    { diagnosis: '', duration: '', isEditing: false }
  ]);

  const [medications, setMedications] = useState([
    { medicine: '', dose: '', timing: '', frequency: '', duration: '', isEditing: false }
  ]);

  const [tests, setTests] = useState([]);
  const [newTest, setNewTest] = useState('');
  const [instructions, setInstructions] = useState('');

  // Dummy data for suggestions
  const commonComplaints = [
    "Headache", "Fever", "Cough", "Body Pain", "Stomach Pain", 
    "Vomiting", "Diarrhea", "Chest Pain", "Breathlessness", "Dizziness"
  ];

  const severityLevels = [
    "Mild", "Moderate", "Severe", "Very Severe", "Unbearable"
  ];

  const durationSuggestions = [
    "1 day", "2-3 days", "1 week", "2 weeks", "1 month", "3 months", "6 months", "> 1 year"
  ];

  const commonDiagnosisList = [
    "Hypertension", "Diabetes Mellitus Type 2", "Upper Respiratory Tract Infection",
    "Gastroenteritis", "Migraine", "Bronchial Asthma", "Anxiety Disorder",
    "Osteoarthritis", "Urinary Tract Infection", "Dyslipidemia"
  ];

  const diagnosisDurationSuggestions = [
    "Acute", "Chronic", "1 month", "6 months", "1 year", "> 2 years", "Lifelong"
  ];

  const medicineSuggestions = [
    "Paracetamol", "Amoxicillin", "Omeprazole", "Cetirizine", "Atorvastatin", "Metformin"
  ];

  const medicineDosePatterns = [
    "1-0-1", "1-1-1", "1-0-0", "0-0-1", "1/2-0-1/2", "1/2-0-0", "2-2-2", "SOS"
  ];

  const medicineTimings = [
    "Before breakfast", "After breakfast", "Before lunch", "After lunch",
    "Before dinner", "After dinner", "Empty stomach", "With meals", "SOS"
  ];

  const medicineFrequency = [
    "Daily", "Alternate days", "Weekly once", "Weekly twice", "Monthly once",
    "Every 6 hours", "Every 8 hours", "SOS"
  ];

  const medicineDuration = [
    "1 day", "3 days", "5 days", "1 week", "2 weeks", "1 month", "3 months", "6 months", "Lifelong"
  ];

  const testSuggestions = [
    "Complete Blood Count (CBC)", "Comprehensive Metabolic Panel", "Lipid Profile",
    "Thyroid Function Test", "Liver Function Test", "Renal Function Test",
    "HbA1c", "Urine Routine & Microscopy", "ECG", "Chest X-ray", "Ultrasound Abdomen"
  ];

  // Attachments
  const [attachments, setAttachments] = useState([
    { id: 1, name: 'Blood Test Results.pdf', type: 'pdf', date: '2024-03-10', size: '1.2 MB' },
    { id: 2, name: 'ECG Report.jpg', type: 'image', date: '2024-03-10', size: '3.5 MB' },
  ]);

  // Past consultations
  const pastConsultations = [
    {
      id: 1,
      date: '2024-02-15',
      doctor: 'Dr. Smith',
      diagnosis: 'Hypertension',
      medications: ['Lisinopril 10mg', 'Hydrochlorothiazide 12.5mg'],
      attachments: [
        { name: 'Blood Pressure Chart.pdf', type: 'pdf' },
        { name: 'ECG Results.jpg', type: 'image' },
      ],
    },
    {
      id: 2,
      date: '2024-01-20',
      doctor: 'Dr. Brown',
      diagnosis: 'Seasonal Flu',
      medications: ['Oseltamivir 75mg', 'Acetaminophen 500mg'],
      attachments: [
        { name: 'Chest X-Ray.jpg', type: 'image' },
      ],
    },
    {
      id: 3,
      date: '2023-12-05',
      doctor: 'Dr. Johnson',
      diagnosis: 'Mild Sprain',
      medications: ['Ibuprofen 400mg', 'Diclofenac Gel'],
      attachments: [
        { name: 'Ankle X-Ray.jpg', type: 'image' },
        { name: 'Physical Therapy Plan.pdf', type: 'pdf' },
      ],
    },
  ];

  const handleOpenAttachment = (attachment) => {
    setSelectedAttachment(attachment);
    setOpenAttachmentDialog(true);
  };

  const handleCloseAttachmentDialog = () => {
    setOpenAttachmentDialog(false);
  };

  const handleDoneConsultation = () => {
    setConfirmDoneDialog(true);
  };

  const confirmDoneConsultation = () => {
    setConfirmDoneDialog(false);
    // In a real app, you would save the consultation data here
    navigate('/patient-info');
  };

  const handleBackToPatient = () => {
    navigate('/patient-info');
  };

  const getAttachmentIcon = (type) => {
    switch(type) {
      case 'pdf':
        return <PictureAsPdf color="error" />;
      case 'image':
        return <Image color="primary" />;
      case 'document':
        return <Description color="info" />;
      default:
        return <InsertDriveFile />;
    }
  };

  // Handlers for prescription form
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

  const addNewComplaintRow = () => {
    setComplaints(prev => [...prev, { complaint: '', severity: '', duration: '', isEditing: true }]);
  };

  const handleDiagnosisChange = (index, field, value) => {
    const updatedDiagnoses = [...diagnoses];
    updatedDiagnoses[index][field] = value;
    
    if (value) {
      const currentRow = updatedDiagnoses[index];
      
      // Auto-focus next field
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

  const addNewDiagnosisRow = () => {
    setDiagnoses(prev => [...prev, { diagnosis: '', duration: '', isEditing: true }]);
  };

  const handleMedicationChange = (index, field, value) => {
    const updatedMedications = [...medications];
    updatedMedications[index][field] = value;
    
    if (value) {
      const currentRow = updatedMedications[index];
      
      // Auto-focus next field logic
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

  const addNewMedicationRow = () => {
    setMedications(prev => [...prev, { 
      medicine: '', dose: '', timing: '', frequency: '', duration: '', isEditing: true 
    }]);
  };

  const handleAddTest = () => {
    if (newTest) {
      setTests([...tests, newTest]);
      setNewTest('');
    }
  };

  const handleRemoveTest = (index) => {
    const updatedTests = [...tests];
    updatedTests.splice(index, 1);
    setTests(updatedTests);
  };

  const handleClickAway = (index, setterFunction, array) => {
    const updated = [...array];
    updated[index].isEditing = false;
    setterFunction(updated);
  };

  return (
    <>
      {/* Fixed App Bar with Patient Info and Actions */}
      <AppBar position="sticky" color="default" elevation={1} sx={{ mb: 3 }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleBackToPatient} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Typography variant="h6" component="div" sx={{ mr: 2 }}>
              {patient.name}
            </Typography>
            <Chip label={`ID: ${patient.id}`} size="small" sx={{ mr: 1 }} />
            <Chip label={`${patient.age} yrs, ${patient.gender}`} size="small" sx={{ mr: 1 }} />
            <Chip label={`Blood: ${patient.bloodGroup}`} size="small" color="error" />
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<Save />}
              size="small"
            >
              Save Draft
            </Button>
            <Button 
              variant="contained" 
              color="success" 
              startIcon={<Done />}
              size="small"
              onClick={handleDoneConsultation}
            >
              Done Consultation
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 2, pb: 20 }}>
        {/* 1. Prescription Form */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Prescription</Typography>
            <Box>
              <Chip 
                label={currentAppointment.status} 
                color="primary" 
                size="small" 
                sx={{ mr: 1 }}
              />
              <Chip 
                icon={<CalendarToday fontSize="small" />} 
                label={`${currentAppointment.date}, ${currentAppointment.time}`} 
                size="small" 
                variant="outlined"
              />
            </Box>
          </Box>

          {/* Patient Details */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Patient Name"
                value={patient.name}
                size="small"
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={4} sm={1.5}>
              <TextField
                fullWidth
                label="Age"
                value={patient.age}
                size="small"
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={4} sm={1.5}>
              <TextField
                fullWidth
                label="Gender"
                value={patient.gender}
                size="small"
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={4} sm={1.5}>
              <TextField
                fullWidth
                label="Weight"
                value={vitals.weight}
                size="small"
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={6} sm={2}>
              <TextField
                fullWidth
                label="BP"
                value={vitals.bp}
                size="small"
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={6} sm={2}>
              <TextField
                fullWidth
                label="Temperature"
                value={vitals.temp}
                size="small"
                InputProps={{ readOnly: true }}
              />
            </Grid>
          </Grid>

          {/* Complaints Table */}
          <Typography variant="h6" className="section-header" sx={{ mt: 3, mb: 1 }}>
            Complaints
          </Typography>
          
          <TableContainer component={Paper} className="compact-table" sx={{ mb: 3 }}>
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
                      e.stopPropagation();
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
                        onClose={() => handleClickAway(index, setComplaints, complaints)}
                        onChange={(_, value) => handleComplaintChange(index, 'complaint', value)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="standard"
                            placeholder="Enter complaint"
                            onFocus={(e) => {
                              e.stopPropagation();
                              const updatedComplaints = [...complaints];
                              updatedComplaints[index].isEditing = true;
                              setComplaints(updatedComplaints);
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
                        onClose={() => handleClickAway(index, setComplaints, complaints)}
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
                        onClose={() => handleClickAway(index, setComplaints, complaints)}
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
                      {complaints.length > 1 && (
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

          {/* Diagnosis Table */}
          <Typography variant="h6" className="section-header" sx={{ mt: 3, mb: 1 }}>
            Diagnosis
          </Typography>
          
          <TableContainer component={Paper} className="compact-table" sx={{ mb: 3 }}>
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
                        onClose={() => handleClickAway(index, setDiagnoses, diagnoses)}
                        onChange={(_, value) => handleDiagnosisChange(index, 'diagnosis', value)}
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
                        onClose={() => handleClickAway(index, setDiagnoses, diagnoses)}
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
                      {diagnoses.length > 1 && (
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

          {/* Medications Table */}
          <Typography variant="h6" className="section-header" sx={{ mt: 3, mb: 1 }}>
            Medications
          </Typography>
          
          <TableContainer component={Paper} className="compact-table" sx={{ mb: 3 }}>
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
                        options={medicineSuggestions}
                        value={row.medicine}
                        open={row.isEditing}
                        onClose={() => handleClickAway(index, setMedications, medications)}
                        onChange={(_, value) => handleMedicationChange(index, 'medicine', value)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="standard"
                            placeholder="Enter medicine"
                            onFocus={(e) => {
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
                        id={`med-dose-${index}`}
                        freeSolo
                        size="small"
                        options={medicineDosePatterns}
                        value={row.dose}
                        open={row.isEditing}
                        onClose={() => handleClickAway(index, setMedications, medications)}
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
                        onClose={() => handleClickAway(index, setMedications, medications)}
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
                        onClose={() => handleClickAway(index, setMedications, medications)}
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
                        onClose={() => handleClickAway(index, setMedications, medications)}
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
                      {medications.length > 1 && (
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

          {/* Instructions */}
          <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
            Special Instructions
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={2}
            placeholder="Enter any special instructions for the patient"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
          />
        </Paper>

        {/* 2. Attachments Section with Add More Option */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Current Attachments</Typography>
            <Button startIcon={<FileUpload />} color="primary">
              Upload New Attachment
            </Button>
          </Box>
          
          {attachments.length > 0 ? (
            <Grid container spacing={2}>
              {attachments.map((attachment) => (
                <Grid item xs={12} sm={6} md={4} key={attachment.id}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': { boxShadow: 3 }
                    }}
                    onClick={() => handleOpenAttachment(attachment)}
                  >
                    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {getAttachmentIcon(attachment.type)}
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" noWrap>{attachment.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {attachment.date} • {attachment.size}
                        </Typography>
                      </Box>
                      <IconButton size="small">
                        <Download fontSize="small" />
                      </IconButton>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ p: 3, textAlign: 'center', bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography color="text.secondary">No attachments available</Typography>
              <Button startIcon={<Add />} sx={{ mt: 1 }}>Add First Attachment</Button>
            </Box>
          )}
        </Paper>

        {/* 3. Past Consultations Timeline */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Past Consultations</Typography>
          
          <Timeline position="alternate">
            {pastConsultations.map((consultation, index) => (
              <TimelineItem key={consultation.id}>
                <TimelineOppositeContent color="text.secondary">
                  {consultation.date}
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot color={index === 0 ? "primary" : "grey"} />
                  {index < pastConsultations.length - 1 && <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography>{consultation.diagnosis} - {consultation.doctor}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>Medications:</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                        {consultation.medications.map((med, i) => (
                          <Chip key={i} label={med} size="small" />
                        ))}
                      </Box>
                      
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>Attachments:</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {consultation.attachments.map((attachment, i) => (
                          <Chip 
                            key={i} 
                            icon={getAttachmentIcon(attachment.type)} 
                            label={attachment.name} 
                            size="small"
                            onClick={() => handleOpenAttachment(attachment)}
                          />
                        ))}
                      </Box>
                      
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button 
                          size="small" 
                          variant="outlined" 
                          startIcon={<Description />}
                        >
                          View Full Details
                        </Button>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </Paper>
      </Container>

      {/* Attachment Preview Dialog */}
      <Dialog
        open={openAttachmentDialog}
        onClose={handleCloseAttachmentDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedAttachment?.name}
          <IconButton
            aria-label="close"
            onClick={handleCloseAttachmentDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ p: 2, textAlign: 'center' }}>
            {selectedAttachment?.type === 'image' ? (
              <Box 
                component="img" 
                src="https://via.placeholder.com/800x600?text=Sample+Medical+Image"
                alt={selectedAttachment?.name}
                sx={{ maxWidth: '100%', maxHeight: '70vh' }}
              />
            ) : selectedAttachment?.type === 'pdf' ? (
              <Box sx={{ height: '70vh', bgcolor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography>PDF Viewer would be integrated here</Typography>
              </Box>
            ) : (
              <Box sx={{ height: '70vh', bgcolor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography>Document Viewer would be integrated here</Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAttachmentDialog}>Close</Button>
          <Button startIcon={<Download />} color="primary">Download</Button>
          <Button startIcon={<Print />} color="primary">Print</Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Done Dialog */}
      <Dialog
        open={confirmDoneDialog}
        onClose={() => setConfirmDoneDialog(false)}
      >
        <DialogTitle>Complete Consultation</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to mark this consultation as complete? This will save the prescription and update the patient's records.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDoneDialog(false)}>Cancel</Button>
          <Button onClick={confirmDoneConsultation} color="primary" variant="contained">
            Complete Consultation
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ConsultationPage; 