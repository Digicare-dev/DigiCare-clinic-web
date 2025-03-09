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

// Import the PrescriptionForm component
import { PrescriptionForm } from './PrescriptionPage';

import {
  CalendarToday,
  AccessTime,
  LocalHospital,
  ArrowBack,
  MedicalServices,
  Save,
  Print,
  Close,
  ExpandMore,
  Add,
  Remove,
  RemoveCircleOutline,
  AttachMoney,
  CheckCircle,
  Paid as PaidIcon,
  Person,
  Assignment,
  ReceiptLong,
  PictureAsPdf,
  Image,
  Description,
  InsertDriveFile,
  Edit,
} from '@mui/icons-material';

const ConsultationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get patient data from location state
  const patientInfo = location.state?.patientInfo || {
    name: 'John Doe',
    age: '45',
    gender: 'Male',
    phone: '+91 9876543210',
    email: 'john.doe@example.com',
    id: 'PT12345',
    bloodGroup: 'O+',
  };

  const appointmentInfo = location.state?.appointmentInfo || {
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM',
    doctor: 'Dr. Smith',
    type: 'General Checkup',
    status: 'In Progress',
    id: 'AP67890',
    reason: 'General Checkup',
    fees: 0,
    paymentMode: 'cash',
    paid: true,
    checkin: true,
  };

  const vitalsInfo = location.state?.vitalsInfo || {
    bloodPressure: '120/80',
    heartRate: '72',
    temperature: '98.6',
    respiratoryRate: '16',
    spO2: '98',
    height: '175',
    weight: '70',
  };

  // Get complaints data from location state
  const complaintsData = location.state?.complaintsData || [];

  // Get queue position information
  const position = location.state?.position || 0;
  const late = location.state?.late || false;
  const status = location.state?.status || 'pending';

  // We're not going to use the complaints data for prefilling
  // Instead, we'll just initialize with an empty complaint

  // Modify the prefilledPrescriptionData to remove patient details
  const prefilledPrescriptionData = {
    // Remove patient details since they're shown in the header
    vitals: {
      bloodPressure: vitalsInfo.bloodPressure,
      heartRate: vitalsInfo.heartRate,
      temperature: vitalsInfo.temperature,
      respiratoryRate: vitalsInfo.respiratoryRate,
      spO2: vitalsInfo.spO2,
    },
    complaints: [
    { complaint: '', severity: '', duration: '', isEditing: false }
    ],
    diagnoses: [
    { diagnosis: '', duration: '', isEditing: false }
    ],
    medications: [
    { medicine: '', dose: '', timing: '', frequency: '', duration: '', isEditing: false }
    ],
    tests: [],
    instructions: "",
    followUp: "",
    signature: appointmentInfo.doctor,
  };

  const [openAttachmentDialog, setOpenAttachmentDialog] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const [confirmDoneDialog, setConfirmDoneDialog] = useState(false);
  const [isEditingVitals, setIsEditingVitals] = useState(false);
  const [editedVitals, setEditedVitals] = useState({...vitalsInfo});

  // Add this for attachments
  const [attachments, setAttachments] = useState([
    // Sample attachments - in a real app, these would come from the API
    { id: 1, name: 'Blood Test Results.pdf', type: 'pdf', date: '2024-03-10', size: '1.2 MB' },
    { id: 2, name: 'ECG Report.jpg', type: 'image', date: '2024-03-10', size: '3.5 MB' },
  ]);

  // Add this helper function to get the appropriate icon for each attachment type
  const getAttachmentIcon = (type) => {
    switch(type) {
      case 'pdf':
        return <PictureAsPdf fontSize="small" color="error" />;
      case 'image':
        return <Image fontSize="small" color="primary" />;
      case 'document':
        return <Description fontSize="small" color="info" />;
      default:
        return <InsertDriveFile fontSize="small" />;
    }
  };

  const handleOpenAttachment = (attachment) => {
    setSelectedAttachment(attachment);
    setOpenAttachmentDialog(true);
  };

  const handleCloseAttachmentDialog = () => {
    setOpenAttachmentDialog(false);
    setSelectedAttachment(null);
  };

  const handleDoneConsultation = () => {
    setConfirmDoneDialog(true);
  };

  const confirmDoneConsultation = () => {
    setConfirmDoneDialog(false);
    // Here you would typically save the consultation data
    alert("Consultation marked as done!");
    handleBackToPatient();
  };

  const handleBackToPatient = () => {
    navigate(-1); // Navigate back to the previous page
  };

  const handlePrescriptionSubmit = (formData) => {
    console.log("Prescription submitted:", formData);
    // Here you would typically save the prescription data
    // and then navigate back or to another page
    
    // For demo purposes, just show an alert and navigate back
    alert("Prescription saved successfully!");
    handleBackToPatient();
  };

  const handleEditVitals = () => {
    setIsEditingVitals(!isEditingVitals);
    if (isEditingVitals) {
      // Save the edited vitals
      console.log("Saving vitals:", editedVitals);
      // Here you would typically save the vitals data to your backend
    }
  };

  const handleVitalsChange = (field, value) => {
    setEditedVitals(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Add this constant
  const hidePatientDetails = true; // Since we want to always hide patient details in consultation page

  // Add sample previous prescriptions data
  const [previousPrescriptions, setPreviousPrescriptions] = useState([
    {
      id: 'P001',
      date: '2024-02-15',
      doctor: 'Dr. Smith',
      diagnosis: 'Hypertension',
      vitals: {
        bloodPressure: '140/90',
        heartRate: '78',
        temperature: '98.4',
        respiratoryRate: '16',
        spO2: '97',
      },
      medications: [
        { medicine: 'Amlodipine', dose: '5mg', timing: 'Morning', frequency: 'Once daily', duration: '30 days' },
        { medicine: 'Hydrochlorothiazide', dose: '12.5mg', timing: 'Morning', frequency: 'Once daily', duration: '30 days' }
      ],
      tests: ['Complete Blood Count', 'Lipid Profile'],
      instructions: 'Reduce salt intake. Regular exercise recommended.',
      followUp: '1 month'
    },
    {
      id: 'P002',
      date: '2024-01-20',
      doctor: 'Dr. Johnson',
      diagnosis: 'Upper Respiratory Infection',
      vitals: {
        bloodPressure: '120/80',
        heartRate: '82',
        temperature: '99.2',
        respiratoryRate: '18',
        spO2: '96',
      },
      medications: [
        { medicine: 'Azithromycin', dose: '500mg', timing: 'After meals', frequency: 'Once daily', duration: '5 days' },
        { medicine: 'Paracetamol', dose: '500mg', timing: 'As needed', frequency: 'Every 6 hours', duration: '3 days' }
      ],
      tests: ['Throat Swab Culture'],
      instructions: 'Plenty of fluids. Rest advised.',
      followUp: '1 week if symptoms persist'
    }
  ]);

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4, pb: 8 }}>
      {/* Back button moved outside of header */}
      <Box sx={{ display: 'flex', mb: 2 }}>
            <Button 
          variant="outlined" 
              color="primary" 
          onClick={handleBackToPatient}
          startIcon={<ArrowBack />}
              size="small"
          sx={{ py: 1, px: 2 }}
            >
          Back to Patient List
            </Button>
          </Box>

      {/* SECTION 1: Merged Header and Patient Details with Vitals (editable) and Attachments */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        {/* Patient Header */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={7}>
            <Box>
                <Typography variant="h5" component="h1" sx={{ fontWeight: 'medium', mb: 1 }}>
                  {patientInfo.name}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip 
                    size="small"
                    icon={<Person />} 
                    label={`${patientInfo.gender}${patientInfo.age ? `, ${patientInfo.age} years` : ""}`} 
                    variant="outlined" 
                  />
                  {patientInfo.id && 
                    <Chip 
                      size="small"
                      label={`ID: ${patientInfo.id}`} 
                      variant="outlined" 
                    />
                  }
                  <Chip 
                    size="small"
                    label={`Token: #${appointmentInfo.token}`} 
                color="primary" 
                    variant="outlined" 
                  />
                  <Chip 
                size="small" 
                    label="General Checkup" 
                    variant="outlined" 
              />
              <Chip 
                size="small" 
                    label="Blood: O+" 
                variant="outlined"
                    color="error"
                  />
                  {appointmentInfo.disease && (
                    <Chip 
                      size="small" 
                      icon={<LocalHospital />} 
                      label={appointmentInfo.disease} 
                      color="error" 
                      variant="outlined"
              />
                  )}
            </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 1 }}>
              <Button 
                variant="contained" 
                color="success" 
                onClick={handleDoneConsultation}
                startIcon={<Save />}
                size="small"
                sx={{ py: 1, px: 2 }}
              >
                Complete Consultation
              </Button>
            </Grid>
          </Grid>
          </Box>

        <Divider sx={{ mb: 3 }} />
        
        {/* Editable Vitals with Edit Button */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <MedicalServices color="primary" sx={{ mr: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 'medium', color: 'primary.main', mr: 2 }}>
                Vitals
              </Typography>
              <Button 
                variant="outlined" 
                color={isEditingVitals ? "success" : "primary"}
                size="small" 
                startIcon={isEditingVitals ? <Save /> : <Edit />}
                onClick={handleEditVitals}
                sx={{ ml: 2 }}
              >
                {isEditingVitals ? "Save Vitals" : "Edit Vitals"}
              </Button>
            </Box>
          </Box>
          <Paper variant="outlined" sx={{ p: 2, bgcolor: isEditingVitals ? 'background.paper' : '#f8f9fa' }}>
            <Grid container spacing={3}>
              <Grid item xs={6} sm={4} md={2}>
              <TextField
                  label="Blood Pressure"
                  value={editedVitals.bloodPressure}
                  variant="outlined"
                  size="small"
                fullWidth
                  disabled={!isEditingVitals}
                  InputProps={{ 
                    endAdornment: <Typography variant="caption">mmHg</Typography>,
                    sx: { bgcolor: isEditingVitals ? 'background.paper' : 'transparent' }
                  }}
                  onChange={(e) => handleVitalsChange('bloodPressure', e.target.value)}
              />
            </Grid>
              <Grid item xs={6} sm={4} md={2}>
              <TextField
                  label="Heart Rate"
                  value={editedVitals.heartRate}
                  variant="outlined"
                  size="small"
                fullWidth
                  disabled={!isEditingVitals}
                  InputProps={{ 
                    endAdornment: <Typography variant="caption">bpm</Typography>,
                    sx: { bgcolor: isEditingVitals ? 'background.paper' : 'transparent' }
                  }}
                  onChange={(e) => handleVitalsChange('heartRate', e.target.value)}
              />
            </Grid>
              <Grid item xs={6} sm={4} md={2}>
              <TextField
                  label="Temperature"
                  value={editedVitals.temperature}
                  variant="outlined"
                  size="small"
                fullWidth
                  disabled={!isEditingVitals}
                  InputProps={{ 
                    endAdornment: <Typography variant="caption">°F</Typography>,
                    sx: { bgcolor: isEditingVitals ? 'background.paper' : 'transparent' }
                  }}
                  onChange={(e) => handleVitalsChange('temperature', e.target.value)}
              />
            </Grid>
              <Grid item xs={6} sm={4} md={2}>
              <TextField
                  label="Respiratory Rate"
                  value={editedVitals.respiratoryRate}
                  variant="outlined"
                  size="small"
                fullWidth
                  disabled={!isEditingVitals}
                  InputProps={{ 
                    endAdornment: <Typography variant="caption">bpm</Typography>,
                    sx: { bgcolor: isEditingVitals ? 'background.paper' : 'transparent' }
                  }}
                  onChange={(e) => handleVitalsChange('respiratoryRate', e.target.value)}
              />
            </Grid>
              <Grid item xs={6} sm={4} md={2}>
              <TextField
                  label="SpO2"
                  value={editedVitals.spO2}
                  variant="outlined"
                  size="small"
                fullWidth
                  disabled={!isEditingVitals}
                  InputProps={{ 
                    endAdornment: <Typography variant="caption">%</Typography>,
                    sx: { bgcolor: isEditingVitals ? 'background.paper' : 'transparent' }
                  }}
                  onChange={(e) => handleVitalsChange('spO2', e.target.value)}
              />
            </Grid>
              <Grid item xs={6} sm={4} md={2}>
              <TextField
                  label="Weight"
                  value={editedVitals.weight}
                  variant="outlined"
                  size="small"
                fullWidth
                  disabled={!isEditingVitals}
                  InputProps={{ 
                    endAdornment: <Typography variant="caption">kg</Typography>,
                    sx: { bgcolor: isEditingVitals ? 'background.paper' : 'transparent' }
                  }}
                  onChange={(e) => handleVitalsChange('weight', e.target.value)}
                />
              </Grid>
            </Grid>
          </Paper>
        </Box>
        
        {/* Attachments with Report Names */}
        <Box sx={{ mt: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Description color="primary" sx={{ mr: 1 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 'medium', color: 'primary.main' }}>
              Attachments
            </Typography>
          </Box>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Box 
              sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 1.5,
                p: 0.5,
              }}
            >
              {attachments.map((attachment) => (
                <Chip
                  key={attachment.id}
                  icon={getAttachmentIcon(attachment.type)}
                  label={
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontSize: '0.7rem' }}>
                        {attachment.type === 'pdf' ? 'Blood Test Report' : 'ECG Report'}
                      </Typography>
                      {attachment.name}
                    </Box>
                  }
                  size="medium"
                  variant="outlined"
                  onClick={() => handleOpenAttachment(attachment)}
                  sx={{ 
                    p: 0.5,
                    height: 'auto',
                    '& .MuiChip-label': {
                      whiteSpace: 'normal',
                      overflow: 'visible',
                      display: 'block',
                      padding: '4px 0'
                    }
                  }}
                />
              ))}
              <Chip
                icon={<Add fontSize="small" />}
                label={
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontSize: '0.7rem' }}>
                      New Report
                    </Typography>
                    Add New Report
                  </Box>
                }
                size="medium"
                color="primary"
                variant="outlined"
                onClick={() => {/* Handle add attachment */}}
                sx={{ 
                  p: 0.5,
                  height: 'auto',
                  '& .MuiChip-label': {
                    padding: '4px 0'
                  }
                }}
              />
            </Box>
          </Paper>
        </Box>
      </Paper>

      {/* SECTION 2: Prescription Page with more vertical spacing */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <ReceiptLong color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" component="h2">
            Prescription
          </Typography>
        </Box>
        <Divider sx={{ mb: 4 }} />
        
        {/* Prescription Form with more vertical spacing */}
        <PrescriptionForm 
          initialData={prefilledPrescriptionData}
          onSubmit={handlePrescriptionSubmit}
          showPrintButton={true}
          hidePatientDetails={hidePatientDetails}
          patientInfo={{
            patientName: patientInfo.name,
            age: patientInfo.age,
            gender: patientInfo.gender,
            weight: editedVitals.weight,
          }}
          // Add custom styling to reduce clutter and add vertical spacing
          formSx={{
            '& .MuiGrid-container': { mb: 5 },
            '& .MuiTableCell-root': { p: 2 },
            '& .MuiTableContainer-root': { mb: 5 },
            '& .MuiDivider-root': { my: 5 },
            '& .MuiButton-root': { mx: 0.5 },
            '& .MuiTypography-subtitle1': { mb: 2 },
            '& .MuiPaper-root': { p: 2, mb: 4 },
            '& .section-header': { mt: 5, mb: 2 }
          }}
        />
      </Paper>

      {/* SECTION 3: Past Appointments */}
      {previousPrescriptions.length > 0 && (
        <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <MedicalServices color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" component="h2">
              Past Appointments
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          
          {previousPrescriptions.map((prescription, index) => (
            <Accordion 
              key={prescription.id}
              sx={{ 
                mb: 2,
                '&:before': { display: 'none' },
                boxShadow: 'none',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                aria-controls={`panel${index}-content`}
                id={`panel${index}-header`}
                sx={{ 
                  bgcolor: 'background.default',
                  '&:hover': { bgcolor: 'action.hover' },
                  p: 1.5
                }}
              >
                <Grid container alignItems="center" spacing={1}>
                  <Grid item xs={3} sm={2}>
                    <Typography variant="subtitle2">
                      {prescription.date}
                    </Typography>
                  </Grid>
                  <Grid item xs={3} sm={2}>
                    <Typography variant="body2" color="text.secondary">
                      {prescription.doctor}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={8}>
                    <Typography variant="body2">
                      Diagnosis: <Chip 
                        label={prescription.diagnosis} 
                size="small"
                        color="primary" 
                        variant="outlined"
                        sx={{ ml: 0.5 }}
              />
                    </Typography>
            </Grid>
          </Grid>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 3, pt: 1 }}>
                {/* Patient Details for this appointment */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium', color: 'primary.main' }}>
                    Patient Details
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <Typography variant="caption" color="text.secondary">Appointment Date</Typography>
                        <Typography variant="body2">{prescription.date}</Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography variant="caption" color="text.secondary">Doctor</Typography>
                        <Typography variant="body2">{prescription.doctor}</Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography variant="caption" color="text.secondary">Diagnosis</Typography>
                        <Typography variant="body2">{prescription.diagnosis}</Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Box>

                {/* Vitals Section */}
                <Box sx={{ mt: 3, mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium', color: 'primary.main' }}>
                    Vitals
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={4} md={2}>
                        <Typography variant="caption" color="text.secondary">Blood Pressure</Typography>
                        <Typography variant="body2">{prescription.vitals.bloodPressure} mmHg</Typography>
                      </Grid>
                      <Grid item xs={6} sm={4} md={2}>
                        <Typography variant="caption" color="text.secondary">Heart Rate</Typography>
                        <Typography variant="body2">{prescription.vitals.heartRate} bpm</Typography>
                      </Grid>
                      <Grid item xs={6} sm={4} md={2}>
                        <Typography variant="caption" color="text.secondary">Temperature</Typography>
                        <Typography variant="body2">{prescription.vitals.temperature} °F</Typography>
                      </Grid>
                      <Grid item xs={6} sm={4} md={2}>
                        <Typography variant="caption" color="text.secondary">Respiratory Rate</Typography>
                        <Typography variant="body2">{prescription.vitals.respiratoryRate || "16"} bpm</Typography>
                      </Grid>
                      <Grid item xs={6} sm={4} md={2}>
                        <Typography variant="caption" color="text.secondary">SpO2</Typography>
                        <Typography variant="body2">{prescription.vitals.spO2 || "98"}%</Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Box>

                {/* Complaints Section */}
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium', color: 'primary.main' }}>
            Complaints
          </Typography>
                  <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                    <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Complaint</TableCell>
                  <TableCell>Severity</TableCell>
                  <TableCell>Duration</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                          {prescription.complaints ? (
                            prescription.complaints.map((complaint, idx) => (
                              <TableRow key={idx} hover>
                                <TableCell>{complaint.complaint}</TableCell>
                    <TableCell>
                                  <Chip 
                                    label={complaint.severity} 
                        size="small"
                                    color={
                                      complaint.severity === 'High' ? 'error' : 
                                      complaint.severity === 'Medium' ? 'warning' : 'success'
                                    }
                      />
                    </TableCell>
                                <TableCell>{complaint.duration}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={3} align="center">No complaints recorded</TableCell>
                  </TableRow>
                          )}
              </TableBody>
            </Table>
          </TableContainer>
                  </Paper>
                </Box>

                {/* Diagnosis Section */}
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium', color: 'primary.main' }}>
            Diagnosis
          </Typography>
                  <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                    <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Diagnosis</TableCell>
                  <TableCell>Duration</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                          {prescription.diagnoses ? (
                            prescription.diagnoses.map((diagnosis, idx) => (
                              <TableRow key={idx} hover>
                                <TableCell>{diagnosis.diagnosis}</TableCell>
                                <TableCell>{diagnosis.duration}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow hover>
                              <TableCell>{prescription.diagnosis}</TableCell>
                              <TableCell>Not specified</TableCell>
                  </TableRow>
                          )}
              </TableBody>
            </Table>
          </TableContainer>
                  </Paper>
                </Box>

                {/* Medications Section */}
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium', color: 'primary.main' }}>
            Medications
          </Typography>
                  <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                    <TableContainer>
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
                          {prescription.medications.map((med, idx) => (
                            <TableRow key={idx} hover>
                              <TableCell>{med.medicine}</TableCell>
                              <TableCell>{med.dose}</TableCell>
                              <TableCell>{med.timing}</TableCell>
                              <TableCell>{med.frequency}</TableCell>
                              <TableCell>{med.duration}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
          </Box>
          
                {/* Tests Section */}
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium', color: 'primary.main' }}>
                    Tests
                        </Typography>
                  <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                    {prescription.tests && prescription.tests.length > 0 ? (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {prescription.tests.map((test, idx) => (
                          <Chip key={idx} label={test} size="small" />
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ p: 1 }}>
                        No tests prescribed
                      </Typography>
          )}
        </Paper>
                      </Box>
                      
                {/* Instructions & Follow-up Section */}
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium', color: 'primary.main' }}>
                    Instructions & Follow-up
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Instructions</Typography>
                        <Typography variant="body2">{prescription.instructions || "No specific instructions"}</Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Follow-up</Typography>
                        <Typography variant="body2">{prescription.followUp || "No follow-up scheduled"}</Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                      </Box>
                      
                {/* Action buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 1 }}>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    startIcon={<Print />}
                  >
                    Print
                  </Button>
                        <Button 
                          size="small" 
                          variant="outlined" 
                          startIcon={<Description />}
                        >
                    View Full
                        </Button>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
            ))}
        </Paper>
      )}

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
          <Button startIcon={<Print />} color="primary">Print</Button>
          <Button startIcon={<Save />} color="primary">Download</Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDoneDialog}
        onClose={() => setConfirmDoneDialog(false)}
      >
        <DialogTitle>Complete Consultation</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to mark this consultation as complete?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDoneDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDoneConsultation} color="primary" variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ConsultationPage; 