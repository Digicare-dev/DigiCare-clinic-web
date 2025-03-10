import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/icons-material';

const PatientInfoPage = () => {
  const navigate = useNavigate();
  const [openAttachmentDialog, setOpenAttachmentDialog] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const [editingVitals, setEditingVitals] = useState(false);
  const [vitals, setVitals] = useState({
    bp: '120/80',
    temp: '98.6°F',
    pulse: '72 bpm',
    weight: '75 kg',
    spO2: '98%',
    respiratoryRate: '16/min',
  });

  const patient = {
    id: "P123456",
    name: 'John Doe',
    age: 35,
    gender: 'Male',
    bloodGroup: 'O+',
    contact: '123-456-7890',
    email: 'john.doe@example.com',
    address: '123 Medical Center Drive, Healthcare City, HC 12345',
    emergencyContact: '987-654-3210',
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
          bloodPressure: vitals.bp,
          heartRate: vitals.pulse.split(' ')[0],
          temperature: vitals.temp.split('°')[0],
          respiratoryRate: vitals.respiratoryRate.split('/')[0],
          spO2: vitals.spO2.replace('%', ''),
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
        vitalsInfo: vitals
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

  return (
    <Container maxWidth="xl" sx={{ py: 3, pb:20 }}>
      {/* 1. Patient Information - Horizontal Section at Top */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={1}>
            <Avatar
              sx={{ width: 70, height: 70, bgcolor: 'primary.main', mx: 'auto' }}
            >
              {patient.name.split(' ').map(n => n[0]).join('')}
            </Avatar>
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <Typography variant="h5">{patient.name}</Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
              <Chip label={`ID: ${patient.id}`} size="small" />
              <Chip label={`${patient.age} yrs`} size="small" />
              <Chip label={patient.gender} size="small" />
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={2}>
            <Typography variant="subtitle2" color="text.secondary">Contact</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Phone fontSize="small" color="action" />
              <Typography variant="body2">{patient.contact}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Email fontSize="small" color="action" />
              <Typography variant="body2">{patient.email}</Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={2}>
            <Typography variant="subtitle2" color="text.secondary">Medical</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2">Blood Group: <Chip label={patient.bloodGroup} size="small" color="error" /></Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
              {patient.allergies.map((allergy) => (
                <Chip key={allergy} label={allergy} size="small" color="warning" sx={{ height: 20 }} />
              ))}
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={2}>
            <Typography variant="subtitle2" color="text.secondary">Conditions</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {patient.chronicConditions.map((condition) => (
                <Chip key={condition} label={condition} size="small" color="info" sx={{ height: 20 }} />
              ))}
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={2}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Tooltip title="Print Patient Info">
                <IconButton><Print /></IconButton>
              </Tooltip>
              <Tooltip title="Share Patient Info">
                <IconButton><Share /></IconButton>
              </Tooltip>
              <Tooltip title="Download Patient Info">
                <IconButton><Download /></IconButton>
              </Tooltip>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* 2. Current Appointment Information with Editable Vitals */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Current Appointment</Typography>
        
        <Grid container spacing={3}>
          {/* Appointment Details */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">Appointment Details</Typography>
                  <Chip label={currentAppointment.status} color="primary" size="small" />
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Date & Time</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarToday fontSize="small" />
                      <Typography>{currentAppointment.date}, {currentAppointment.time}</Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Doctor</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocalHospital fontSize="small" />
                      <Typography>{currentAppointment.doctor}</Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Department</Typography>
                    <Typography>{currentAppointment.department}</Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Token</Typography>
                    <Typography>#{currentAppointment.token}</Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Type</Typography>
                    <Typography>{currentAppointment.appointmentType}</Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Reason</Typography>
                    <Typography>{currentAppointment.disease}</Typography>
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    startIcon={<MedicalServices />}
                    onClick={handleCreatePrescription}
                  >
                    Create Prescription
                  </Button>
                  
                  <Button 
                    variant="outlined" 
                    color="secondary" 
                    startIcon={<Assignment />}
                    onClick={handleOpenConsultation}
                  >
                    Open Consultation File
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Vitals - Editable */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold">Vitals</Typography>
                  <Button 
                    startIcon={editingVitals ? null : <Edit />} 
                    size="small"
                    onClick={() => editingVitals ? handleSaveVitals() : setEditingVitals(true)}
                    color={editingVitals ? "success" : "primary"}
                  >
                    {editingVitals ? "Save Changes" : "Edit Vitals"}
                  </Button>
                </Box>
                
                <Grid container spacing={2}>
                  {Object.entries(vitals).map(([key, value]) => (
                    <Grid item xs={6} sm={4} key={key}>
                      <Typography variant="caption" color="text.secondary">
                        {key === 'bp' ? 'Blood Pressure' : 
                         key === 'temp' ? 'Temperature' :
                         key === 'pulse' ? 'Heart Rate' :
                         key === 'spO2' ? 'SpO2' :
                         key === 'respiratoryRate' ? 'Respiratory Rate' : 
                         key.charAt(0).toUpperCase() + key.slice(1)}
                      </Typography>
                      {editingVitals ? (
                        <TextField
                          fullWidth
                          size="small"
                          value={value}
                          onChange={(e) => handleVitalChange(key, e.target.value)}
                          variant="outlined"
                          margin="dense"
                        />
                      ) : (
                        <Typography variant="h6">{value}</Typography>
                      )}
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* 3. Attachments Section with Add More Option */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Attachments</Typography>
          <Button startIcon={<FileUpload />} color="primary">
            Upload New Attachment
          </Button>
        </Box>
        
        {currentAttachments.length > 0 ? (
          <Grid container spacing={2}>
            {currentAttachments.map((attachment) => (
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

      {/* 4. Past Appointments at the Bottom */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Past Appointments</Typography>
        
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