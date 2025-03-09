import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Avatar,
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  CalendarToday,
  AccessTime,
  LocalHospital,
  Phone,
  Email,
  Print,
  Share,
  Download,
  Description,
  FileCopy,
  PictureAsPdf,
  Image,
  MedicalServices,
  Assignment,
  InsertDriveFile,
  Edit,
  Add,
  FileUpload,
  ArrowBack,
  Paid as PaidIcon,
  CheckCircle,
  AttachMoney,
  Person,
  Healing,
  AssignmentLate,
} from '@mui/icons-material';

const PatientInfoPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get patient data from location state or use default values
  const patientId = location.state?.patientId || 'PT12345';
  const appointmentId = location.state?.appointmentId || 'AP67890';
  const patientInfo = location.state?.patientInfo || {
    name: 'John Doe',
    age: '45',
    gender: 'Male',
    phone: '+91 9876543210',
    email: 'john.doe@example.com',
    id: 'PT12345',
    bloodGroup: 'O+',
    allergies: ['None'],
    chronicConditions: [],
  };

  const appointmentInfo = location.state?.appointmentInfo || {
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM',
    doctor: 'Dr. Smith',
    type: 'General Checkup',
    status: 'In Progress',
    id: 'AP67890',
    reason: 'General Checkup',
    department: 'General',
    token: '1',
    disease: '',
    fees: 0,
    paymentMode: 'cash',
    paid: true,
    checkin: true,
  };

  // Get vitals data from location state or use default values
  const vitalsInfo = location.state?.vitalsInfo || {
    bloodPressure: '120/80',
    heartRate: '72',
    temperature: '98.6',
    respiratoryRate: '16',
    spO2: '98',
    height: '175',
    weight: '70',
  };

  // Get complaints data from location state or use empty array
  const complaintsData = location.state?.complaintsData || [];

  // Get queue position information
  const position = location.state?.position || 0;
  const late = location.state?.late || false;
  const status = location.state?.status || 'pending';

  const [openAttachmentDialog, setOpenAttachmentDialog] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const [editingVitals, setEditingVitals] = useState(false);
  
  // Update patient state to use the data from location
  const [patient, setPatient] = useState(patientInfo);
  const [currentAppointment, setCurrentAppointment] = useState(appointmentInfo);
  const [vitals, setVitals] = useState(vitalsInfo);
  const [complaints, setComplaints] = useState(complaintsData);

  const currentAttachments = [
    { id: 1, name: 'Blood Test Results.pdf', type: 'pdf', date: '2024-03-10', size: '1.2 MB' },
    { id: 2, name: 'ECG Report.jpg', type: 'image', date: '2024-03-10', size: '3.5 MB' },
    { id: 3, name: 'Previous Medication List.docx', type: 'document', date: '2024-03-09', size: '0.5 MB' },
  ];

  const pastAppointments = [
    {
      id: 'A456',
      date: '2024-02-15',
      time: '09:30 AM',
      doctor: 'Dr. Smith',
      department: 'Cardiology',
      diagnosis: 'Hypertension',
      prescription: 'View',
      status: 'Completed',
      appointmentType: 'Follow-up',
      token: '32',
      disease: 'Hypertension',
    },
    {
      id: 'A123',
      date: '2024-01-20',
      time: '11:00 AM',
      doctor: 'Dr. Brown',
      department: 'Internal Medicine',
      diagnosis: 'Seasonal Flu',
      prescription: 'View',
      status: 'Completed',
      appointmentType: 'New Visit',
      token: '18',
      disease: 'Influenza',
    },
    {
      id: 'A089',
      date: '2023-12-05',
      time: '10:15 AM',
      doctor: 'Dr. Johnson',
      department: 'Orthopedics',
      diagnosis: 'Mild Sprain',
      prescription: 'View',
      status: 'Completed',
      appointmentType: 'Emergency',
      token: '07',
      disease: 'Ankle Sprain',
    },
  ];

  const handleCreatePrescription = () => {
    navigate('/prescription', { 
      state: { 
        patientInfo: {
          patientName: patient.name,
          age: patient.age,
          gender: patient.gender,
          weight: vitals.weight.split(' ')[0],
          bloodPressure: vitals.bloodPressure,
          heartRate: vitals.heartRate,
          temperature: vitals.temperature,
          respiratoryRate: vitals.respiratoryRate,
          spO2: vitals.spO2,
          allergies: patient.allergies,
          chronicConditions: patient.chronicConditions,
        }
      } 
    });
  };

  const handleOpenConsultation = () => {
    navigate('/consultation', { 
      state: { 
        patientInfo: patient,
        appointmentInfo: currentAppointment,
        vitalsInfo: vitals,
        complaintsData: complaints,
        position: position,
        late: late,
        status: status,
      } 
    });
  };

  const handleOpenAttachment = (attachment) => {
    setSelectedAttachment(attachment);
    setOpenAttachmentDialog(true);
  };

  const handleCloseAttachmentDialog = () => {
    setOpenAttachmentDialog(false);
  };

  const handleVitalChange = (key, value) => {
    setVitals({
      ...vitals,
      [key]: value,
    });
  };

  const handleSaveVitals = () => {
    setEditingVitals(false);
    // In a real app, you would save the vitals to the backend here
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

  // Add a function to handle going back
  const handleGoBack = () => {
    navigate(-1); // Navigate back to the previous page
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 3, mb: 10 }}>
      {/* Back button and page title */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <IconButton 
          color="primary" 
          onClick={handleGoBack}
          sx={{ mr: 1 }}
            >
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" component="h1">
          Patient Information
        </Typography>
            </Box>

      {/* Connected layout with consistent styling */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Patient Header */}
        <Paper elevation={2} sx={{ p: 2 }}>
          <Box>
            {/* Patient name and avatar */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar 
                sx={{ 
                  bgcolor: 'primary.light', 
                  color: 'primary.contrastText',
                  width: 40,
                  height: 40,
                  mr: 2,
                  fontSize: '1.2rem'
                }}
              >
                {patient.name.charAt(0)}
              </Avatar>
              <Box>
                <Typography 
                  variant="h6" 
                  component="h1" 
                  sx={{ 
                    fontWeight: 'medium', 
                    color: 'text.primary',
                    opacity: 0.9,
                    letterSpacing: '0.01em'
                  }}
                >
                  {patient.name}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Patient ID: {patient.id || "Not specified"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {patient.age} years, {patient.gender}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Blood: {patient.bloodGroup || "Not specified"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Phone: {patient.phone || "Not specified"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Allergies: {patient.allergies && patient.allergies.length > 0 && patient.allergies[0] !== "None" ? 
                      patient.allergies.join(", ") : "None"}
                  </Typography>
            </Box>
            </Box>
            </Box>
            </Box>
        </Paper>

        {/* Current Appointment with Vitals and Attachments */}
        <Paper elevation={2} sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, justifyContent: 'space-between' }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocalHospital color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" component="h2">
                  Current Appointment
                </Typography>
            </Box>
              <Typography variant="caption" color="text.secondary" sx={{ ml: 4 }}>
                Token #{currentAppointment.token} • {currentAppointment.doctor} • {currentAppointment.type}
              </Typography>
            </Box>
                  <Button 
                    variant="contained" 
                    color="primary" 
              size="medium"
                    onClick={handleOpenConsultation}
              startIcon={<MedicalServices />}
              sx={{ 
                fontWeight: 'bold',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                position: 'relative',
                overflow: 'hidden',
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': {
                    boxShadow: '0 0 0 0 rgba(25, 118, 210, 0.7)',
                  },
                  '70%': {
                    boxShadow: '0 0 0 6px rgba(25, 118, 210, 0)',
                  },
                  '100%': {
                    boxShadow: '0 0 0 0 rgba(25, 118, 210, 0)',
                  }
                },
                '&:hover': {
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.1), transparent)',
                  transform: 'translateX(-100%)',
                  transition: 'transform 0.6s',
                },
                '&:hover::after': {
                  transform: 'translateX(100%)',
                }
              }}
                  >
                    Open Consultation File
                  </Button>
                </Box>
          <Divider sx={{ mb: 1.5 }} />
          
          {/* Vitals and Attachments in a balanced layout */}
          <Grid container spacing={2}>
            {/* Vitals Section */}
          <Grid item xs={12} md={6}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Healing color="primary" sx={{ mr: 1, fontSize: '1.1rem' }} />
                    <Typography variant="subtitle1" sx={{ fontSize: '0.95rem', fontWeight: 'medium' }}>
                      Patient Vitals
                    </Typography>
                  </Box>
                  <IconButton size="small" onClick={() => setEditingVitals(!editingVitals)} sx={{ p: 0.5 }}>
                    <Edit fontSize="small" />
                  </IconButton>
                </Box>
                
                      {editingVitals ? (
                  <Grid container spacing={1}>
                    {Object.entries(vitals).map(([key, value], index) => (
                      <Grid item xs={6} key={key}>
                        <TextField
                          fullWidth
                          size="small"
                          label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          value={value}
                          onChange={(e) => handleVitalChange(key, e.target.value)}
                          InputProps={{
                            endAdornment: (
                              <Typography variant="caption" color="text.secondary">
                                {key === 'bloodPressure' ? 'mmHg' : 
                                 key === 'heartRate' ? 'bpm' : 
                                 key === 'temperature' ? '°F' : 
                                 key === 'respiratoryRate' ? 'bpm' : 
                                 key === 'spO2' ? '%' : 
                                 key === 'weight' ? 'kg' : ''}
                              </Typography>
                            ),
                          }}
                        />
                      </Grid>
                    ))}
                    <Grid item xs={12}>
                      <Button 
                        variant="contained" 
                        onClick={handleSaveVitals}
                        size="small"
                        sx={{ mt: 1 }}
                      >
                        Save Vitals
                      </Button>
                    </Grid>
          </Grid>
                ) : (
                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(2, 1fr)', 
                    gap: 2,
                    mt: 1,
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: 'rgba(0, 0, 0, 0.01)',
                    border: '1px solid #eee'
                  }}>
                    {Object.entries(vitals).map(([key, value], index) => (
                      <Box key={key} sx={{ display: 'flex', alignItems: 'baseline' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ width: '50%', fontSize: '0.8rem' }}>
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                        </Typography>
                        <Typography variant="body1" sx={{ 
                          fontWeight: key === 'bloodPressure' || key === 'heartRate' ? 'medium' : 'normal',
                          color: key === 'bloodPressure' ? 'error.main' : 'text.primary'
                        }}>
                          {value} {key === 'bloodPressure' ? 'mmHg' : 
                                  key === 'heartRate' ? 'bpm' : 
                                  key === 'temperature' ? '°F' : 
                                  key === 'respiratoryRate' ? 'bpm' : 
                                  key === 'spO2' ? '%' : 
                                  key === 'weight' ? 'kg' : ''}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
        </Grid>

            {/* Attachments Section */}
            <Grid item xs={12} md={6}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FileCopy color="primary" sx={{ mr: 1, fontSize: '1.1rem' }} />
                    <Typography variant="subtitle1" sx={{ fontSize: '0.95rem', fontWeight: 'medium' }}>
                      Medical Documents
                    </Typography>
                  </Box>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      cursor: 'pointer',
                      '&:hover': { color: 'primary.main' }
                    }}
                    onClick={() => {/* handle upload */}}
                  >
                    <FileUpload fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="body2">Upload</Typography>
                  </Box>
        </Box>
        
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 1.5,
                  mt: 1,
                  height: '100%',
                }}>
                  {/* Blood Test Result */}
                  <Box 
                  sx={{ 
                      borderRadius: 1,
                      border: '1px solid #eee',
                      p: 1.5,
                    cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      height: '100%',
                      '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.01)' }
                  }}
                    onClick={() => handleOpenAttachment(currentAttachments[0])}
                >
                    <PictureAsPdf color="error" sx={{ mr: 1.5, fontSize: '1.5rem' }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Blood Test Report
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        CBC, Lipid Profile • {currentAttachments[0].date}
                      </Typography>
                    </Box>
                    <Download fontSize="small" color="action" sx={{ opacity: 0.6 }} />
                  </Box>
                  
                  {/* ECG Report */}
                  <Box 
                    sx={{ 
                      borderRadius: 1,
                      border: '1px solid #eee',
                      p: 1.5,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      height: '100%',
                      '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.01)' }
                    }}
                    onClick={() => handleOpenAttachment(currentAttachments[1])}
                  >
                    <Image color="primary" sx={{ mr: 1.5, fontSize: '1.5rem' }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        ECG Report
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        12-Lead ECG • {currentAttachments[1].date}
                      </Typography>
                    </Box>
                    <Download fontSize="small" color="action" sx={{ opacity: 0.6 }} />
                  </Box>
                </Box>
              </Box>
              </Grid>
          </Grid>
        </Paper>

        {/* Past Appointments */}
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CalendarToday color="primary" sx={{ mr: 1, fontSize: '1.1rem' }} />
            <Typography variant="h6">Past Appointments</Typography>
          </Box>
        
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date & Time</TableCell>
                <TableCell>Token</TableCell>
                <TableCell>Doctor</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Diagnosis</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pastAppointments.map((appointment) => (
                <TableRow key={appointment.id} hover>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{appointment.date}</Typography>
                      <Typography variant="caption" color="text.secondary">{appointment.time}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>#{appointment.token}</TableCell>
                  <TableCell>{appointment.doctor}</TableCell>
                  <TableCell>{appointment.department}</TableCell>
                  <TableCell>{appointment.appointmentType}</TableCell>
                  <TableCell>{appointment.diagnosis}</TableCell>
                  <TableCell>
                    <Chip
                      label={appointment.status}
                      size="small"
                      color={appointment.status === 'Completed' ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button size="small" variant="outlined" startIcon={<MedicalServices />}>
                        Prescription
                      </Button>
                      <Button size="small" variant="outlined" startIcon={<Description />}>
                        Details
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      </Box>

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
            &times;
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
    </Container>
  );
};

export default PatientInfoPage; 