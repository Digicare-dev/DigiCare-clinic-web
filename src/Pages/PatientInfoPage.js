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
  Modal,
  FormControlLabel,
  Checkbox,
  ToggleButtonGroup,
  ToggleButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
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
  ArrowForward,
  Close,
  Upload,
  CloudUpload,
} from '@mui/icons-material';
import ReportLink from '../components/ReportLink';
import dayjs from 'dayjs';
import { PrescriptionForm } from './PrescriptionPage';

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  maxWidth: "90vw",
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 3,
};

const PatientInfoPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get patient data from location state or use default values
  const patientId = location.state?.patientId || 'PT12345';
  const appointmentId = location.state?.appointmentId || 'AP67890';
  const patientInfo = location.state?.patientInfo || {
    name: 'Rajesh Kumar',
    age: '45',
    gender: 'Male',
    phone: '+91 9876543210',
    email: 'rajesh.kumar@example.com',
    id: 'PT12345',
    bloodGroup: 'O+',
    allergies: ['None'],
    chronicConditions: [],
  };

  // Check if the patient has a current appointment
  const hasCurrentAppointment = location.state?.appointmentInfo !== undefined;
  
  const appointmentInfo = location.state?.appointmentInfo || {
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM',
    doctor: 'Dr. Amit Mittal',
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
    { id: 1, name: 'Blood Test Results.pdf', type: 'pdf', reportType: 'blood-test', date: '2024-03-10', size: '1.2 MB' },
    { id: 2, name: 'ECG Report.pdf', type: 'pdf', reportType: 'ecg-test', date: '2024-03-10', size: '3.5 MB' },
  ];

  const pastAppointments = [
    {
      id: 'A456',
      date: '2024-02-15',
      time: '09:30 AM',
      doctor: 'Dr. Amit Mittal',
      department: 'Cardiology',
      diagnosis: 'Hypertension',
      prescription: 'View',
      status: 'Completed',
      appointmentType: 'Follow-up',
      token: '32',
      disease: 'Hypertension',
      paid: true,
      mode: 'cash'
    },
    {
      id: 'A123',
      date: '2024-01-20',
      time: '11:00 AM',
      doctor: 'Dr. Amit Mittal',
      department: 'Internal Medicine',
      diagnosis: 'Seasonal Flu',
      prescription: 'View',
      status: 'Completed',
      appointmentType: 'New Visit',
      token: '18',
      disease: 'Influenza',
      paid: true,
      mode: 'online'
    },
    {
      id: 'A089',
      date: '2023-12-05',
      time: '10:15 AM',
      doctor: 'Dr. Amit Mittal',
      department: 'Orthopedics',
      diagnosis: 'Mild Sprain',
      prescription: 'View',
      status: 'Completed',
      appointmentType: 'Emergency',
      token: '07',
      disease: 'Ankle Sprain',
      paid: false,
      mode: ''
    },
  ];

  // Add state for the reports modal
  const [reportsModalOpen, setReportsModalOpen] = useState(false);

  // Add state for the prescription modal
  const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  
  // Add state for the file upload modal
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileType, setUploadFileType] = useState('pdf');
  const [isDragging, setIsDragging] = useState(false);
  
  // New appointment modal state
  const [open, setOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    id: "",
    token: "",
    appointment_id: "",
    firstName: "",
    lastName: "",
    checkin: false,
    paid: false,
    mode: "cash",
    fees_paid: 0,
    status: "pending",
    disease: "",
    age: "",
    phone_number: "",
    location: "",
    sex: "",
    guardian: "",
    appointment_type: "New",
  });
  const [suggestedToken, setSuggestedToken] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");

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
    if (!hasCurrentAppointment) {
      // If there's no current appointment, don't navigate
      return;
    }
    
    navigate('/consultation', {
      state: {
        patientInfo,
        appointmentInfo: currentAppointment,
        vitalsInfo: vitals,
        complaintsData: [],
        position: currentAppointment.position || 0,
        late: currentAppointment.status === 'Late',
        status: currentAppointment.status.toLowerCase(),
      }
    });
  };

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
    switch (type) {
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

  // Add a function to handle going back
  const handleGoBack = () => {
    navigate(-1); // Navigate back to the previous page
  };

  // Update the handleOpenPrescription function to open the modal instead of navigating
  const handleOpenPrescription = (appointment) => {
    setSelectedPrescription({
      patientInfo: patientInfo,
      appointmentInfo: {
        ...appointment,
        status: 'Completed',
        paid: true,
        checkin: true
      },
      initialData: {
        patientName: patientInfo.name,
        patientId: patientInfo.id,
        patientAge: patientInfo.age,
        patientGender: patientInfo.gender,
        appointmentId: appointment.id,
        appointmentDate: appointment.date,
        doctor: appointment.doctor,
        department: appointment.department,
        complaints: [{ complaint: appointment.diagnosis, duration: "2 weeks", severity: "Moderate" }],
        diagnosis: [{ diagnosis: appointment.diagnosis, notes: "Patient responded well to treatment" }],
        medications: [
          { 
            drug: "Amlodipine", 
            dosage: "5mg", 
            frequency: "Once daily", 
            duration: "30 days",
            timing: "After breakfast",
            notes: "Take regularly"
          },
          { 
            drug: "Pantoprazole", 
            dosage: "40mg", 
            frequency: "Once daily", 
            duration: "15 days",
            timing: "Before breakfast",
            notes: "Take on empty stomach"
          },
          { 
            drug: "Ecosprin", 
            dosage: "75mg", 
            frequency: "Once daily", 
            duration: "30 days",
            timing: "After dinner",
            notes: "Do not skip doses"
          }
        ],
        tests: ["Complete Blood Count", "Lipid Profile"],
        advice: "Maintain a healthy diet and exercise regularly",
        followUpDate: dayjs(appointment.date).add(2, 'week').format('YYYY-MM-DD'),
        vitals: {
          bloodPressure: "120/80",
          heartRate: "72",
          temperature: "98.6",
          respiratoryRate: "16",
          spO2: "98",
        }
      },
      readOnly: true
    });
    setPrescriptionModalOpen(true);
  };
  
  // Add function to handle closing the prescription modal
  const handleClosePrescriptionModal = () => {
    setPrescriptionModalOpen(false);
    setSelectedPrescription(null);
  };
  
  // Add function to handle printing the prescription
  const handlePrintPrescription = () => {
    // Create a new window with the prescription content
    const printWindow = window.open('', '_blank');
    
    // Generate the prescription HTML content
    const prescriptionContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Prescription - ${patientInfo.name}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #2196f3;
            padding-bottom: 10px;
          }
          .clinic-name {
            font-size: 24px;
            font-weight: bold;
            color: #2196f3;
          }
          .doctor-info {
            font-size: 16px;
            margin: 5px 0;
          }
          .patient-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            padding: 10px;
            background-color: #f5f5f5;
            border-radius: 5px;
          }
          .patient-details, .appointment-details {
            flex: 1;
          }
          .section-title {
            font-size: 18px;
            font-weight: bold;
            margin: 15px 0 10px 0;
            color: #2196f3;
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
          }
          .medication-table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0 20px 0;
          }
          .medication-table th, .medication-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          .medication-table th {
            background-color: #f5f5f5;
          }
          .tests-list, .advice {
            margin: 10px 0;
            padding: 10px;
            background-color: #f9f9f9;
            border-radius: 5px;
          }
          .footer {
            margin-top: 30px;
            display: flex;
            justify-content: space-between;
          }
          .signature {
            text-align: right;
            margin-top: 50px;
          }
          @media print {
            body {
              margin: 0;
              padding: 15px;
            }
            button {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="clinic-name">DigiCare Medical Center</div>
          <div class="doctor-info">${selectedPrescription?.appointmentInfo?.doctor || 'Dr. Amit Mittal'}</div>
          <div class="doctor-info">${selectedPrescription?.appointmentInfo?.department || 'General Medicine'}</div>
        </div>
        
        <div class="patient-info">
          <div class="patient-details">
            <p><strong>Patient Name:</strong> ${patientInfo.name}</p>
            <p><strong>Patient ID:</strong> ${patientInfo.id}</p>
            <p><strong>Age/Gender:</strong> ${patientInfo.age} years, ${patientInfo.gender}</p>
          </div>
          <div class="appointment-details">
            <p><strong>Date:</strong> ${selectedPrescription?.appointmentInfo?.date}</p>
            <p><strong>Appointment ID:</strong> ${selectedPrescription?.appointmentInfo?.id}</p>
            <p><strong>BP:</strong> ${selectedPrescription?.initialData?.vitals?.bloodPressure} mmHg | <strong>Temp:</strong> ${selectedPrescription?.initialData?.vitals?.temperature}°F</p>
          </div>
        </div>
        
        <div class="section-title">Diagnosis</div>
        <p>${selectedPrescription?.initialData?.diagnosis?.[0]?.diagnosis || selectedPrescription?.appointmentInfo?.diagnosis}</p>
        
        <div class="section-title">Medications</div>
        <table class="medication-table">
          <thead>
            <tr>
              <th>Medication</th>
              <th>Dosage</th>
              <th>Frequency</th>
              <th>Duration</th>
              <th>Instructions</th>
            </tr>
          </thead>
          <tbody>
            ${selectedPrescription?.initialData?.medications?.map(med => `
              <tr>
                <td>${med.drug}</td>
                <td>${med.dosage}</td>
                <td>${med.frequency}</td>
                <td>${med.duration}</td>
                <td>${med.notes || med.timing || ''}</td>
              </tr>
            `).join('') || ''}
          </tbody>
        </table>
        
        <div class="section-title">Tests Recommended</div>
        <div class="tests-list">
          ${selectedPrescription?.initialData?.tests?.map(test => `<p>• ${test}</p>`).join('') || 'No tests recommended'}
        </div>
        
        <div class="section-title">Advice</div>
        <div class="advice">
          <p>${selectedPrescription?.initialData?.advice || 'Follow a healthy diet and exercise regularly.'}</p>
        </div>
        
        <div class="section-title">Follow-up</div>
        <p>Please return for follow-up on ${selectedPrescription?.initialData?.followUpDate || 'as advised'}.</p>
        
        <div class="footer">
          <div></div>
          <div class="signature">
            <p>${selectedPrescription?.appointmentInfo?.doctor || 'Dr. Amit Mittal'}</p>
            <p>${selectedPrescription?.appointmentInfo?.department || 'General Medicine'}</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Write the content to the new window
    printWindow.document.open();
    printWindow.document.write(prescriptionContent);
    printWindow.document.close();
    
    // Wait for the content to load and then print
    printWindow.onload = function() {
      printWindow.print();
    };
  };

  // Add functions to handle navigation to AppointmentDetails
  const handleOpenAppointmentDetails = (appointment) => {
    navigate('/appointment-details', {
      state: {
        appointmentInfo: {
          ...appointment,
          reason: appointment.diagnosis,
          fees: 500,
          paymentMode: 'cash',
          paid: true,
          checkin: true
        },
        patientInfo: patientInfo,
        fromPastAppointments: true
      }
    });
  };

  // Add functions to handle opening and closing the reports modal
  const handleOpenReportsModal = () => {
    setReportsModalOpen(true);
  };
  
  const handleCloseReportsModal = () => {
    setReportsModalOpen(false);
  };

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
    // For now, we'll just add it to the currentAttachments array
    
    const newAttachment = {
      id: currentAttachments.length + 1,
      name: `${uploadFileName}.${uploadFileType === 'pdf' ? 'pdf' : uploadFileType === 'image' ? 'jpg' : 'doc'}`,
      type: uploadFileType,
      reportType: 'custom',
      date: new Date().toISOString().split('T')[0],
      size: `${(uploadFile.size / (1024 * 1024)).toFixed(1)} MB`
    };
    
    // In a real app, you would update the state with the new attachment
    // For now, we'll just log it
    console.log('New attachment:', newAttachment);
    
    // Close the modal
    handleCloseUploadModal();
    
    // Show a success message (in a real app)
    alert('File uploaded successfully!');
  };

  // New appointment modal handlers
  const handleOpenAppointmentModal = () => {
    // Initialize with patient info
    setNewAppointment({
      ...newAppointment,
      firstName: patient.name.split(' ')[0] || '',
      lastName: patient.name.split(' ').slice(1).join(' ') || '',
      age: patient.age || '',
      phone_number: patient.phone.replace(/\+91 /, '') || '',
      sex: patient.gender === 'Male' ? 'M' : patient.gender === 'Female' ? 'F' : 'O',
    });
    
    // Suggest token number (this would typically come from your API)
    setSuggestedToken(Math.floor(Math.random() * 90) + 10); // For demo, random number between 10-99
    setOpen(true);
  };

  const handleCloseAppointmentModal = () => {
    resetAppointmentForm();
    setOpen(false);
  };

  const resetAppointmentForm = () => {
    setNewAppointment({
      id: "",
      token: "",
      appointment_id: "",
      firstName: "",
      lastName: "",
      checkin: false,
      paid: false,
      mode: "cash",
      fees_paid: 0,
      status: "pending",
      disease: "",
      age: "",
      phone_number: "",
      location: "",
      sex: "",
      guardian: "",
      appointment_type: "New",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAppointment((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSexChange = (event, newSex) => {
    if (newSex !== null) {
      setNewAppointment((prev) => ({ ...prev, sex: newSex }));
    }
  };

  const handleAddAppointment = async () => {
    try {
      setIsAdding(true);
      setError("");

      // Here you would typically call your API to add the appointment
      // For demo purposes, we'll just simulate a successful API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Success notification would go here
      
      handleCloseAppointmentModal();
      
      // Optionally reload the page or update the state to show the new appointment
      // For demo purposes, we'll just add the appointment to currentAppointment
      setCurrentAppointment({
        token: newAppointment.token || suggestedToken,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString(),
        doctor: "Dr. Amit Mittal",
        type: newAppointment.appointment_type,
        status: "Pending",
        id: "AP" + Math.floor(Math.random() * 10000),
        reason: newAppointment.disease,
        department: "General",
      });

    } catch (error) {
      console.error("Error adding appointment:", error);
      setError("Failed to add appointment. Please try again.");
    } finally {
      setIsAdding(false);
    }
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
        {hasCurrentAppointment && (
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
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Healing color="primary" sx={{ mr: 1, fontSize: '1.1rem' }} />
                    <Typography variant="subtitle1" sx={{ fontSize: '0.95rem', fontWeight: 'medium' }}>
                      Patient Vitals
                    </Typography>
                    <IconButton 
                      size="small" 
                      onClick={() => setEditingVitals(!editingVitals)} 
                      sx={{ ml: 1, p: 0.5 }}
                    >
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

                {/* Medical Records Section - Updated to match vitals styling */}
                <Grid item xs={12} md={6}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Description color="primary" sx={{ mr: 1, fontSize: '1.1rem' }} />
                      <Typography variant="subtitle1" sx={{ fontSize: '0.95rem', fontWeight: 'medium' }}>
                        Medical Records
                      </Typography>
                      <Button 
                        variant="text" 
                        color="primary" 
                        size="small"
                        onClick={handleOpenReportsModal}
                        sx={{ ml: 1, p: 0.5, minWidth: 'auto' }}
                      >
                        View All
                      </Button>
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
                    
                    <Box sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: '1fr',
                      gap: 1.5,
                      mt: 1,
                      p: 1.5,
                      borderRadius: 1,
                      bgcolor: 'rgba(0, 0, 0, 0.01)',
                      border: '1px solid #eee'
                    }}>
                      {/* Blood Test Result */}
                      <Box 
                        sx={{ 
                          borderRadius: 1,
                          p: 1,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.03)' }
                        }}
                        onClick={() => window.open(require('../assets/dummy-blood-test-report.pdf'), '_blank')}
                      >
                        <PictureAsPdf color="error" sx={{ mr: 1.5, fontSize: '1.3rem' }} />
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
                      
                      {/* ECG Test Result */}
                      <Box 
                        sx={{ 
                          borderRadius: 1,
                          p: 1,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.03)' }
                        }}
                        onClick={() => window.open(require('../assets/dummy-ecg-test-report.pdf'), '_blank')}
                      >
                        <PictureAsPdf color="error" sx={{ mr: 1.5, fontSize: '1.3rem' }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            ECG Test Report
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
          )}

          {/* Message when no current appointment */}
          {!hasCurrentAppointment && (
            <Paper elevation={2} sx={{ p: 3, mb: 2, textAlign: 'center' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2 }}>
                <CalendarToday sx={{ fontSize: 40, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No Current Appointment
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', mb: 2 }}>
                  This patient doesn't have an appointment scheduled for today.
                </Typography>
                <Button 
                  variant="outlined" 
                  color="primary"
                  startIcon={<Add />}
                  onClick={handleOpenAppointmentModal}
                  sx={{ mt: 1 }}
                >
                  Schedule New Appointment
                </Button>
              </Box>
            </Paper>
          )}

        {/* Past Appointments */}
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CalendarToday color="primary" sx={{ mr: 1, fontSize: '1.1rem' }} />
            <Typography variant="h6">Past Appointments</Typography>
          </Box>
        
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Payment</TableCell>
                <TableCell>Mode</TableCell>
                <TableCell>Checkup Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pastAppointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>
                    <Typography variant="body2">{appointment.date}</Typography>
                  </TableCell>
                  <TableCell>{appointment.appointmentType}</TableCell>
                  <TableCell>
                    <Chip
                      label={appointment.paid ? "Paid" : "Unpaid"}
                      size="small"
                      color={appointment.paid ? "success" : "error"}
                    />
                  </TableCell>
                  <TableCell>{appointment.mode ? appointment.mode.charAt(0).toUpperCase() + appointment.mode.slice(1) : "N/A"}</TableCell>
                  <TableCell>
                    <Chip
                      label={appointment.status}
                      size="small"
                      color={appointment.status === 'Completed' ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        startIcon={<MedicalServices />}
                        onClick={() => handleOpenPrescription(appointment)}
                      >
                        Prescription
                      </Button>
                      <Button 
                        size="small" 
                        variant="outlined" 
                        startIcon={<Description />}
                        onClick={() => handleOpenAppointmentDetails(appointment)}
                      >
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

      {/* Reports Modal */}
      <Dialog 
        open={reportsModalOpen} 
        onClose={handleCloseReportsModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Description color="primary" sx={{ mr: 1 }} />
            Medical Records
          </Box>
          <IconButton size="small" onClick={handleCloseReportsModal}>
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            {/* Blood Test Result */}
            <Grid item xs={12} sm={6}>
              <Box 
                sx={{ 
                  borderRadius: 1,
                  border: '1px solid #eee',
                  p: 2,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.01)' }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PictureAsPdf color="error" sx={{ mr: 1.5, fontSize: '2rem' }} />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      Blood Test Report
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {currentAttachments[0].date} • {currentAttachments[0].size}
                    </Typography>
                  </Box>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Complete Blood Count (CBC), Lipid Profile, Liver Function Test, Kidney Function Test
                </Typography>
                
                <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    startIcon={<Download />}
                    onClick={() => window.open(require('../assets/dummy-blood-test-report.pdf'), '_blank')}
                  >
                    Download
                  </Button>
                  <Button 
                    variant="contained" 
                    size="small" 
                    startIcon={<Print />}
                    onClick={() => window.open(require('../assets/dummy-blood-test-report.pdf'), '_blank')}
                  >
                    Print
                  </Button>
                </Box>
              </Box>
            </Grid>
            
            {/* ECG Test Result */}
            <Grid item xs={12} sm={6}>
              <Box 
                sx={{ 
                  borderRadius: 1,
                  border: '1px solid #eee',
                  p: 2,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.01)' }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PictureAsPdf color="error" sx={{ mr: 1.5, fontSize: '2rem' }} />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      ECG Test Report
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {currentAttachments[1].date} • {currentAttachments[1].size}
                    </Typography>
                  </Box>
                </Box>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  12-Lead Electrocardiogram, Heart Rate Variability Analysis, ST Segment Analysis
                </Typography>
                
                <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    startIcon={<Download />}
                    onClick={() => window.open(require('../assets/dummy-ecg-test-report.pdf'), '_blank')}
                  >
                    Download
                  </Button>
                  <Button 
                    variant="contained" 
                    size="small" 
                    startIcon={<Print />}
                    onClick={() => window.open(require('../assets/dummy-ecg-test-report.pdf'), '_blank')}
                  >
                    Print
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>

      {/* Prescription Modal */}
      <Dialog
        open={prescriptionModalOpen}
        onClose={handleClosePrescriptionModal}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <MedicalServices color="primary" sx={{ mr: 1 }} />
            Prescription - {selectedPrescription?.appointmentInfo?.date}
          </Box>
          <Box>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<Print />} 
              onClick={handlePrintPrescription}
              sx={{ mr: 1 }}
            >
              Print
            </Button>
            <IconButton size="small" onClick={handleClosePrescriptionModal}>
              <Close fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedPrescription && (
            <Box sx={{ p: 2, bgcolor: '#fff' }}>
              {/* Prescription Header */}
              <Box sx={{ textAlign: 'center', mb: 3, pb: 2, borderBottom: '2px solid #2196f3' }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  DigiCare Medical Center
                </Typography>
                <Typography variant="subtitle1">
                  {selectedPrescription.appointmentInfo.doctor}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  {selectedPrescription.appointmentInfo.department}
                </Typography>
              </Box>
              
              {/* Patient Information */}
              <Grid container spacing={2} sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2">
                    <strong>Patient Name:</strong> {patientInfo.name}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Patient ID:</strong> {patientInfo.id}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Age/Gender:</strong> {patientInfo.age} years, {patientInfo.gender}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2">
                    <strong>Date:</strong> {selectedPrescription.appointmentInfo.date}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Appointment ID:</strong> {selectedPrescription.appointmentInfo.id}
                  </Typography>
                  <Typography variant="body2">
                    <strong>BP:</strong> {selectedPrescription.initialData.vitals.bloodPressure} mmHg | <strong>Temp:</strong> {selectedPrescription.initialData.vitals.temperature}°F
                  </Typography>
                </Grid>
              </Grid>
              
              {/* Diagnosis */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 1, pb: 0.5, borderBottom: '1px solid #eee', color: 'primary.main' }}>
                  Diagnosis
                </Typography>
                <Typography variant="body1">
                  {selectedPrescription.initialData.diagnosis?.[0]?.diagnosis || selectedPrescription.appointmentInfo.diagnosis}
                </Typography>
              </Box>
              
              {/* Medications */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 1, pb: 0.5, borderBottom: '1px solid #eee', color: 'primary.main' }}>
                  Medications
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Medication</strong></TableCell>
                        <TableCell><strong>Dosage</strong></TableCell>
                        <TableCell><strong>Frequency</strong></TableCell>
                        <TableCell><strong>Duration</strong></TableCell>
                        <TableCell><strong>Instructions</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedPrescription.initialData.medications.map((med, index) => (
                        <TableRow key={index}>
                          <TableCell>{med.drug}</TableCell>
                          <TableCell>{med.dosage}</TableCell>
                          <TableCell>{med.frequency}</TableCell>
                          <TableCell>{med.duration}</TableCell>
                          <TableCell>{med.notes || med.timing || ''}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
              
              {/* Tests */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 1, pb: 0.5, borderBottom: '1px solid #eee', color: 'primary.main' }}>
                  Tests Recommended
                </Typography>
                <Box sx={{ p: 2, bgcolor: '#f9f9f9', borderRadius: 1 }}>
                  {selectedPrescription.initialData.tests.map((test, index) => (
                    <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                      • {test}
                    </Typography>
                  ))}
                </Box>
              </Box>
              
              {/* Advice */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 1, pb: 0.5, borderBottom: '1px solid #eee', color: 'primary.main' }}>
                  Advice
                </Typography>
                <Box sx={{ p: 2, bgcolor: '#f9f9f9', borderRadius: 1 }}>
                  <Typography variant="body1">
                    {selectedPrescription.initialData.advice}
                  </Typography>
                </Box>
              </Box>
              
              {/* Follow-up */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 1, pb: 0.5, borderBottom: '1px solid #eee', color: 'primary.main' }}>
                  Follow-up
                </Typography>
                <Typography variant="body1">
                  Please return for follow-up on {selectedPrescription.initialData.followUpDate}.
                </Typography>
              </Box>
              
              {/* Signature */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    {selectedPrescription.appointmentInfo.doctor}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedPrescription.appointmentInfo.department}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
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

      {/* New Appointment Modal */}
      <Modal open={open} onClose={handleCloseAppointmentModal}>
        <Box sx={modalStyle}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            New Appointment
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <div
            style={{
              display: "grid",
              gap: "16px",
              gridTemplateColumns: "1fr 1fr",
            }}
          >
            <TextField
              fullWidth
              label="Token Number"
              name="token"
              type="number"
              value={newAppointment.token}
              onChange={handleInputChange}
              required
              helperText={`Suggested token: ${suggestedToken}`}
            />
            <TextField
              label="Mobile"
              name="phone_number"
              value={newAppointment.phone_number}
              onChange={handleInputChange}
              slotProps={{ input: { maxLength: 10 } }}
              fullWidth
            />
            <TextField
              label="First Name"
              name="firstName"
              value={newAppointment.firstName}
              onChange={handleInputChange}
              required
            />
            <TextField
              label="Last Name"
              name="lastName"
              value={newAppointment.lastName}
              onChange={handleInputChange}
              required
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={newAppointment.checkin}
                  onChange={(e) =>
                    setNewAppointment((prev) => ({
                      ...prev,
                      checkin: e.target.checked,
                    }))
                  }
                />
              }
              label={
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontWeight: newAppointment.checkin ? 'bold' : 'normal',
                    color: newAppointment.checkin ? 'primary.main' : 'text.primary'
                  }}
                >
                  Present in Clinic
                </Typography>
              }
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={newAppointment.paid}
                  onChange={(e) =>
                    setNewAppointment((prev) => ({
                      ...prev,
                      paid: e.target.checked,
                      mode: e.target.checked ? "cash" : "",
                    }))
                  }
                />
              }
              label={
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontWeight: newAppointment.paid ? 'bold' : 'normal',
                    color: newAppointment.paid ? 'primary.main' : 'text.primary'
                  }}
                >
                  Payment Done
                </Typography>
              }
            />
            {newAppointment.paid && (
              <>
                <FormControl fullWidth>
                  <InputLabel>Payment Mode</InputLabel>
                  <Select
                    name="mode"
                    value={newAppointment.mode}
                    onChange={handleInputChange}
                    label="Payment Mode"
                  >
                    <MenuItem value="cash">Cash</MenuItem>
                    <MenuItem value="online">Online</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="Fees"
                  name="fees_paid"
                  type="number"
                  value={newAppointment.fees_paid}
                  onChange={handleInputChange}
                  InputProps={{ inputProps: { min: 0 } }}
                />
              </>
            )}
            <TextField
              label="Age"
              name="age"
              type="number"
              value={newAppointment.age}
              onChange={handleInputChange}
            />
            <FormControl component="fieldset">
              <ToggleButtonGroup
                value={newAppointment.sex}
                exclusive
                onChange={handleSexChange}
                color="primary"
              >
                <ToggleButton value="M" color="primary">
                  Male
                </ToggleButton>
                <ToggleButton value="F" color="secondary">
                  Female
                </ToggleButton>
                <ToggleButton value="O">Other</ToggleButton>
              </ToggleButtonGroup>
            </FormControl>
            <TextField
              label="Guardian"
              name="guardian"
              value={newAppointment.guardian}
              onChange={handleInputChange}
            />
            <TextField
              label="Place"
              name="location"
              value={newAppointment.location}
              onChange={handleInputChange}
            />
            <FormControl fullWidth>
              <InputLabel>Appointment Type *</InputLabel>
              <Select
                name="appointment_type"
                value={newAppointment.appointment_type}
                onChange={handleInputChange}
                label="Appointment Type"
              >
                <MenuItem value="New">New</MenuItem>
                <MenuItem value="Follow-up">Follow-up</MenuItem>
                <MenuItem value="Emergency">Emergency</MenuItem>
                <MenuItem value="Routine">Routine</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Complaint"
              name="disease"
              value={newAppointment.disease}
              onChange={handleInputChange}
            />
          </div>

          <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={handleCloseAppointmentModal} sx={{ mr: 2 }} disabled={isAdding}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleAddAppointment}
              disabled={isAdding}
            >
              {isAdding ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Add Appointment"
              )}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Container>
  );
};

export default PatientInfoPage; 