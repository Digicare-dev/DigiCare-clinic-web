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
  Upload,
  CloudUpload,
  Cancel as CancelIcon,
  ContentCopy as ContentCopyIcon,
} from '@mui/icons-material';

import ReportLink from '../components/ReportLink';

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

  // Log patient info for debugging
  console.log("ConsultationPage - Patient Info:", patientInfo);

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

  // Update the attachments to include the ECG report as a PDF
  const [attachments, setAttachments] = useState([
    { id: 1, name: 'Blood Test Results.pdf', type: 'pdf', reportType: 'blood-test', date: '2024-03-10', size: '1.2 MB' },
    { id: 2, name: 'ECG Report.pdf', type: 'pdf', reportType: 'ecg-test', date: '2024-03-10', size: '3.5 MB' },
  ]);

  // Get the PDF viewer context
  // const { openPdfViewer } = usePDFViewerContext();

  // Update the getAttachmentIcon function to make the icons more prominent
  const getAttachmentIcon = (type) => {
    switch (type) {
      case 'pdf':
        return <PictureAsPdf sx={{ fontSize: '1.5rem', color: '#f44336' }} />;
      case 'image':
        return <Image sx={{ fontSize: '1.5rem', color: '#2196f3' }} />;
      case 'document':
        return <Description sx={{ fontSize: '1.5rem', color: '#03a9f4' }} />;
      default:
        return <InsertDriveFile sx={{ fontSize: '1.5rem', color: '#757575' }} />;
    }
  };

  // Update the handleOpenAttachment function to directly open PDFs in a new tab
  const handleOpenAttachment = (attachment) => {
    if (attachment.type === 'pdf') {
      // Open the PDF directly in a new tab
      const pdfUrl = attachment.reportType === 'ecg-test' 
        ? require('../assets/dummy-ecg-test-report.pdf')
        : require('../assets/dummy-blood-test-report.pdf');
      
      window.open(pdfUrl, '_blank');
    } else {
      // Use the existing dialog for other types of attachments
      setSelectedAttachment(attachment);
      setOpenAttachmentDialog(true);
    }
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
      diagnoses: [
        { diagnosis: 'Hypertension', duration: '30 days', notes: 'Stage 1 hypertension, monitoring required' },
        { diagnosis: 'Hyperlipidemia', duration: '30 days', notes: 'Borderline high cholesterol' }
      ],
      medications: [
        { medicine: 'Amlodipine', dose: '5mg', timing: 'Morning', frequency: 'Once daily', duration: '30 days', notes: 'Take with food' },
        { medicine: 'Hydrochlorothiazide', dose: '12.5mg', timing: 'Morning', frequency: 'Once daily', duration: '30 days', notes: 'Monitor potassium levels' }
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
      diagnoses: [
        { diagnosis: 'Upper Respiratory Infection', duration: '7 days', notes: 'Viral etiology suspected' }
      ],
      medications: [
        { medicine: 'Azithromycin', dose: '500mg', timing: 'After meals', frequency: 'Once daily', duration: '5 days', notes: 'Complete full course' },
        { medicine: 'Paracetamol', dose: '500mg', timing: 'As needed', frequency: 'Every 6 hours', duration: '3 days', notes: 'For fever and pain relief' }
      ],
      tests: ['Throat Swab Culture'],
      instructions: 'Plenty of fluids. Rest advised.',
      followUp: '1 week if symptoms persist'
    }
  ]);

  // Add state for the file upload modal
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileType, setUploadFileType] = useState('pdf');
  const [isDragging, setIsDragging] = useState(false);

  // Add function to handle opening the upload modal
  const handleOpenUploadModal = () => {
    setUploadModalOpen(true);
  };
  
  // Add function to handle closing the upload modal
  const handleCloseUploadModal = () => {
    setUploadModalOpen(false);
    setUploadFile(null);
    setUploadFileName('');
    setUploadFileType('pdf');
    setIsDragging(false);
  };
  
  // Add function to handle file drop
  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileSelect(file);
    }
  };
  
  // Add function to handle file selection
  const handleFileSelect = (file) => {
    setUploadFile(file);
    
    // Set default file name from the file (without extension)
    const fileName = file.name.split('.').slice(0, -1).join('.');
    setUploadFileName(fileName);
    
    // Determine file type
    const fileType = file.type.includes('pdf') ? 'pdf' : 
                    file.type.includes('image') ? 'image' : 'document';
    setUploadFileType(fileType);
  };
  
  // Add function to handle file upload
  const handleFileUpload = () => {
    // In a real app, you would upload the file to a server here
    // For now, we'll just add it to the attachments array
    
    const newAttachment = {
      id: attachments.length + 1,
      name: `${uploadFileName}.${uploadFileType === 'pdf' ? 'pdf' : uploadFileType === 'image' ? 'jpg' : 'doc'}`,
      type: uploadFileType,
      reportType: 'custom',
      date: new Date().toISOString().split('T')[0],
      size: `${(uploadFile.size / (1024 * 1024)).toFixed(1)} MB`
    };
    
    // Update the attachments array with the new attachment
    setAttachments([...attachments, newAttachment]);
    
    // Close the modal
    handleCloseUploadModal();
    
    // Show a success message (in a real app)
    alert('File uploaded successfully!');
  };

  // Render the PrescriptionForm with the patient ID
  const renderPrescriptionForm = () => (
    <PrescriptionForm 
      initialData={prefilledPrescriptionData}
      onSubmit={handlePrescriptionSubmit}
      showPrintButton={true}
      hidePatientDetails={hidePatientDetails}
      patientInfo={{
        id: patientInfo.id,
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
      }}
    />
  );

  // Add state for the past prescriptions modal
  const [pastPrescriptionsOpen, setPastPrescriptionsOpen] = useState(false);
  const [isLoadingPrescriptions, setIsLoadingPrescriptions] = useState(false);
  const [pastPrescriptions, setPastPrescriptions] = useState([]);

  // Add function to handle opening the past prescriptions modal
  const handleOpenPastPrescriptions = async () => {
    setIsLoadingPrescriptions(true);
    try {
      // Fetch previous prescriptions from the backend
      const response = await fetch('/api/patients/previous-prescriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ patientId: patientInfo.id }),
      });

      if (response.ok) {
        const data = await response.json();
        setPastPrescriptions(data);
      } else {
        console.error('Error fetching previous prescriptions');
      }
    } catch (error) {
      console.error('Error loading previous prescriptions:', error);
    } finally {
      setIsLoadingPrescriptions(false);
    }
    setPastPrescriptionsOpen(true);
  };

  // Add function to copy medications from a past prescription
  const copyMedicationsFromPast = (medications) => {
    // Implement the logic to copy medications from the past prescription to the current prescription
    console.log('Copying medications:', medications);
  };

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
        
        {/* Attachments with Report Names - Improved layout */}
        <Box sx={{ mt: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Description color="primary" sx={{ mr: 1 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 'medium', color: 'primary.main' }}>
              Attachments
            </Typography>
            <Button 
              variant="text" 
              color="primary" 
              size="small"
              startIcon={<Upload fontSize="small" />}
              onClick={handleOpenUploadModal}
              sx={{ ml: 1, p: 0.5 }}
            >
              Upload
            </Button>
          </Box>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Box 
              sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                gap: 2,
                p: 0.5,
              }}
            >
              {attachments.map((attachment) => (
                <Box
                  key={attachment.id}
                  sx={{ 
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    p: 1.5,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'all 0.2s',
                    '&:hover': { 
                      bgcolor: 'rgba(0, 0, 0, 0.03)',
                      borderColor: 'primary.light'
                    }
                  }}
                  onClick={() => handleOpenAttachment(attachment)}
                >
                  {getAttachmentIcon(attachment.type)}
                  <Box sx={{ ml: 1.5, flex: 1, overflow: 'hidden' }}>
                    <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontSize: '0.7rem' }}>
                      {attachment.reportType === 'ecg-test' ? 'ECG Test Report' : 
                       attachment.reportType === 'blood-test' ? 'Blood Test Report' : 
                       attachment.type === 'pdf' ? 'PDF Document' :
                       attachment.type === 'image' ? 'Image' : 'Document'}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {attachment.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {attachment.date} • {attachment.size}
                    </Typography>
                  </Box>
                </Box>
              ))}
              <Box
                sx={{ 
                  border: '1px dashed #2196f3',
                  borderRadius: 1,
                  p: 1.5,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  transition: 'all 0.2s',
                  '&:hover': { 
                    bgcolor: 'rgba(33, 150, 243, 0.04)'
                  }
                }}
                onClick={handleOpenUploadModal}
              >
                <Add color="primary" />
                <Typography variant="body2" color="primary" sx={{ mt: 0.5, fontWeight: 500 }}>
                  Add New Report
                </Typography>
              </Box>
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
        {renderPrescriptionForm()}
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
                  <Grid item xs={6} sm={4}>
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
                  <Grid item xs={6} sm={4}>
                    <Typography variant="body2">
                      Medications: {prescription.medications.length > 0 ? (
                        <Tooltip 
                          title={
                            <React.Fragment>
                              {prescription.medications.map((med, i) => (
                                <Typography key={i} variant="body2" component="div">
                                  {med.medicine} {med.dose}
                                </Typography>
                              ))}
                            </React.Fragment>
                          } 
                          arrow
                        >
                          <Chip 
                            label={prescription.medications.length > 1 
                              ? `${prescription.medications[0].medicine} +${prescription.medications.length - 1} more` 
                              : prescription.medications[0].medicine}
                            size="small"
                            color="secondary" 
                            variant="outlined"
                            sx={{ ml: 0.5 }}
                          />
                        </Tooltip>
                      ) : (
                        <Chip 
                          label="None" 
                          size="small"
                          color="default" 
                          variant="outlined"
                          sx={{ ml: 0.5 }}
                        />
                      )}
                    </Typography>
                  </Grid>
                </Grid>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 3, pt: 1 }}>
                {/* Patient Details for this appointment */}
                <Box sx={{ mb: 2 }}>
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
                <Box sx={{ mt: 2, mb: 2 }}>
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
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium', color: 'primary.main' }}>
            Complaints
          </Typography>
                  <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
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
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium', color: 'primary.main' }}>
            Diagnosis
          </Typography>
                  <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Diagnosis</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                          {prescription.diagnoses ? (
                            prescription.diagnoses.map((diagnosis, idx) => (
                              <TableRow key={idx} hover>
                                <TableCell>{diagnosis.diagnosis}</TableCell>
                                <TableCell>{diagnosis.duration}</TableCell>
                                <TableCell>{diagnosis.notes}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow hover>
                              <TableCell>{prescription.diagnosis}</TableCell>
                              <TableCell>Not specified</TableCell>
                              <TableCell>No notes provided</TableCell>
                  </TableRow>
                          )}
              </TableBody>
            </Table>
          </TableContainer>
                  </Paper>
                </Box>

                {/* Medications Section */}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium', color: 'primary.main' }}>
            Medications
          </Typography>
                  <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Medicine</TableCell>
                  <TableCell>Dose</TableCell>
                  <TableCell>Timing</TableCell>
                  <TableCell>Frequency</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Notes</TableCell>
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
                              <TableCell>{med.notes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
          </Box>
          
                {/* Tests Section */}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium', color: 'primary.main' }}>
                    Tests
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
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
                <Box sx={{ mt: 2 }}>
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
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1 }}>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    startIcon={<Print />}
                    onClick={() => {
                      // Create a new window for printing
                      const printWindow = window.open('', '_blank');
                      
                      // Generate prescription HTML content
                      const prescriptionContent = `
                        <!DOCTYPE html>
                        <html>
                        <head>
                          <title>Prescription - ${prescription.date}</title>
                          <style>
                            body { font-family: Arial, sans-serif; margin: 20px; }
                            .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
                            .section { margin-bottom: 15px; }
                            h1 { font-size: 24px; margin-bottom: 10px; }
                            h2 { font-size: 18px; margin-bottom: 8px; color: #2196f3; }
                            table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
                            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                            th { background-color: #f5f5f5; }
                            .footer { margin-top: 30px; text-align: right; }
                            @media print {
                              button { display: none; }
                              body { margin: 0; }
                            }
                          </style>
                        </head>
                        <body>
                          <div class="header">
                            <div>
                              <h1>Medical Prescription</h1>
                              <p>Date: ${prescription.date}</p>
                              <p>Doctor: ${prescription.doctor}</p>
                            </div>
                          </div>
                          
                          <div class="section">
                            <h2>Vitals</h2>
                            <p>Blood Pressure: ${prescription.vitals.bloodPressure} mmHg | 
                               Heart Rate: ${prescription.vitals.heartRate} bpm | 
                               Temperature: ${prescription.vitals.temperature} °F | 
                               Respiratory Rate: ${prescription.vitals.respiratoryRate || "16"} bpm | 
                               SpO2: ${prescription.vitals.spO2 || "98"}%</p>
                          </div>
                          
                          <div class="section">
                            <h2>Diagnosis</h2>
                            <table>
                              <thead>
                                <tr>
                                  <th>Diagnosis</th>
                                  <th>Duration</th>
                                  <th>Notes</th>
                                </tr>
                              </thead>
                              <tbody>
                                ${prescription.diagnoses ? 
                                  prescription.diagnoses.map(diag => `
                                    <tr>
                                      <td>${diag.diagnosis}</td>
                                      <td>${diag.duration}</td>
                                      <td>${diag.notes || ''}</td>
                                    </tr>
                                  `).join('') : 
                                  `<tr>
                                    <td>${prescription.diagnosis}</td>
                                    <td>Not specified</td>
                                    <td>No notes provided</td>
                                  </tr>`
                                }
                              </tbody>
                            </table>
                          </div>
                          
                          <div class="section">
                            <h2>Medications</h2>
                            <table>
                              <thead>
                                <tr>
                                  <th>Medicine</th>
                                  <th>Dose</th>
                                  <th>Timing</th>
                                  <th>Frequency</th>
                                  <th>Duration</th>
                                  <th>Notes</th>
                                </tr>
                              </thead>
                              <tbody>
                                ${prescription.medications.map(med => `
                                  <tr>
                                    <td>${med.medicine}</td>
                                    <td>${med.dose}</td>
                                    <td>${med.timing}</td>
                                    <td>${med.frequency}</td>
                                    <td>${med.duration}</td>
                                    <td>${med.notes || ''}</td>
                                  </tr>
                                `).join('')}
                              </tbody>
                            </table>
                          </div>
                          
                          ${prescription.tests && prescription.tests.length > 0 ? `
                            <div class="section">
                              <h2>Tests</h2>
                              <ul>
                                ${prescription.tests.map(test => `<li>${test}</li>`).join('')}
                              </ul>
                            </div>
                          ` : ''}
                          
                          <div class="section">
                            <h2>Instructions & Follow-up</h2>
                            <p><strong>Instructions:</strong> ${prescription.instructions || "No specific instructions"}</p>
                            <p><strong>Follow-up:</strong> ${prescription.followUp || "No follow-up scheduled"}</p>
                          </div>
                          
                          <div class="footer">
                            <p>Signature: ${prescription.doctor}</p>
                          </div>
                          
                          <button onclick="window.print(); window.close();" style="margin-top: 20px; padding: 8px 16px;">
                            Print Prescription
                          </button>
                        </body>
                        </html>
                      `;
                      
                      // Write the content to the new window
                      printWindow.document.open();
                      printWindow.document.write(prescriptionContent);
                      printWindow.document.close();
                      
                      // Automatically trigger print when content is loaded
                      printWindow.onload = function() {
                        printWindow.focus();
                        // Uncomment to automatically print
                        // printWindow.print();
                      };
                    }}
                  >
                    Print
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

      {/* File Upload Modal */}
      <Dialog
        open={uploadModalOpen}
        onClose={handleCloseUploadModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CloudUpload color="primary" sx={{ mr: 1 }} />
            Upload Medical Record
          </Box>
          <IconButton size="small" onClick={handleCloseUploadModal}>
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ p: 2 }}>
            {/* File Drop Area */}
            <Box
              sx={{
                border: isDragging ? '2px dashed #2196f3' : '2px dashed #ccc',
                borderRadius: 1,
                p: 3,
                mb: 3,
                textAlign: 'center',
                bgcolor: isDragging ? 'rgba(33, 150, 243, 0.04)' : 'transparent',
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragging(false);
              }}
              onDrop={handleFileDrop}
              onClick={() => document.getElementById('file-upload-input').click()}
            >
              <input
                id="file-upload-input"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
              />
              <CloudUpload color="primary" sx={{ fontSize: '3rem', mb: 1 }} />
              <Typography variant="body1" sx={{ mb: 1 }}>
                {uploadFile ? uploadFile.name : 'Drag and drop a file here or click to browse'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Supported file types: PDF, JPG, PNG, DOC
              </Typography>
            </Box>
            
            {/* File Details Form */}
            {uploadFile && (
              <Box sx={{ mt: 3 }}>
                <TextField
                  fullWidth
                  label="File Name"
                  value={uploadFileName}
                  onChange={(e) => setUploadFileName(e.target.value)}
                  margin="normal"
                  required
                  helperText="Enter a name for this medical record"
                />
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    File Type
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                      label="PDF"
                      variant={uploadFileType === 'pdf' ? 'filled' : 'outlined'}
                      color={uploadFileType === 'pdf' ? 'primary' : 'default'}
                      onClick={() => setUploadFileType('pdf')}
                      sx={{ cursor: 'pointer' }}
                    />
                    <Chip
                      label="Image"
                      variant={uploadFileType === 'image' ? 'filled' : 'outlined'}
                      color={uploadFileType === 'image' ? 'primary' : 'default'}
                      onClick={() => setUploadFileType('image')}
                      sx={{ cursor: 'pointer' }}
                    />
                    <Chip
                      label="Document"
                      variant={uploadFileType === 'document' ? 'filled' : 'outlined'}
                      color={uploadFileType === 'document' ? 'primary' : 'default'}
                      onClick={() => setUploadFileType('document')}
                      sx={{ cursor: 'pointer' }}
                    />
                  </Box>
                </Box>
                
                <Box sx={{ mt: 3, display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    File Size: {(uploadFile.size / (1024 * 1024)).toFixed(2)} MB
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUploadModal}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<CloudUpload />}
            onClick={handleFileUpload}
            disabled={!uploadFile || !uploadFileName}
          >
            Upload File
          </Button>
        </DialogActions>
      </Dialog>

      {/* Past Prescriptions Modal */}
      <Dialog
        open={pastPrescriptionsOpen}
        onClose={() => setPastPrescriptionsOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Previous Medications</Typography>
            <IconButton onClick={() => setPastPrescriptionsOpen(false)}>
              <CancelIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {isLoadingPrescriptions ? (
            <Box display="flex" justifyContent="center" p={3}>
              <Typography>Loading previous medications...</Typography>
            </Box>
          ) : pastPrescriptions.length === 0 ? (
            <Box display="flex" justifyContent="center" p={3}>
              <Typography>No previous medications found for this patient.</Typography>
            </Box>
          ) : (
            <Box>
              {pastPrescriptions.map((prescription, index) => (
                <Paper key={prescription.id} elevation={0} variant="outlined" sx={{ mb: 2, p: 2 }}>
                  <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                      {new Date(prescription.date).toLocaleDateString()} - {prescription.doctor}
                    </Typography>
                  </Box>
                  
                  <Box mb={2}>
                    <Typography variant="subtitle2" gutterBottom>Diagnoses:</Typography>
                    <List dense>
                      {prescription.diagnoses.map((diag, i) => (
                        <ListItem key={i}>
                          <ListItemText 
                            primary={diag.diagnosis} 
                            secondary={`${diag.duration}${diag.notes ? ` - ${diag.notes}` : ''}`} 
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                  
                  <Box mb={2}>
                    <Typography variant="subtitle2" gutterBottom>Medications:</Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
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
                    
                    <Box display="flex" justifyContent="flex-end" mt={1}>
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
                  </Box>
                  
                  {prescription.instructions && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>Instructions:</Typography>
                      <Typography variant="body2">{prescription.instructions}</Typography>
                    </Box>
                  )}
                </Paper>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPastPrescriptionsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ConsultationPage; 