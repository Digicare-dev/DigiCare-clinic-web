import React, { useState, useEffect, useRef } from 'react';
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
  CircularProgress,
  Alert,
  Collapse,
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
  FileCopy,
  History,
} from '@mui/icons-material';

import ReportLink from '../components/ReportLink';
import { PageHeader } from '../components/common/PageHeader';

import {getAttachments, uploadAttachment, deleteAttachment, getPatientDetails, getPrescriptions, savePrescription, manageVitals, saveTemplate, getVitals, getCurrentPrescription, getPastPrescriptions, getAppointmentDetails} from '../services/api';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Utility function to construct full URL for attachments
const getFullAttachmentUrl = (relativePath) => {
  if (!relativePath) return '';
  // Remove leading slash if present in both API_BASE_URL and relativePath
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  return `${baseUrl}${path}`;
};

const ConsultationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  console.log(location.state)
  
  // Get patient data from location state
  const patientInfo = location.state?.patientInfo || {
    id: "",
    name: "",
    age: "",
    gender: "",
    phone: "",
    allergies: "",
    chronicConditions: "",
  };

  const appointmentInfo = location.state?.appointmentInfo || {
    id: "",
    token: "",
    date: "",
    time: "",
    doctor: "",
    department: "",
    type: "",
    status: "",
    reason: "",
    paid: false,
    checkin: false,
    fees: 0,
    mode: "",
  };

  // Get vitals data from location state or use default values
  const vitalsInfo = location.state?.vitalsInfo || {
    bloodPressure: '',
    heartRate: '',
    temperature: '',
    respiratoryRate: '',
    spO2: '',
    height: '',
    weight: '',
  };

  // Get complaints data from location state or use empty array
  const complaintsData = location.state?.complaintsData || [];

  // Get queue position information
  const position = location.state?.position || 0;
  const late = location.state?.late || false;
  const status = location.state?.status || 'pending';

  // Ensure state variables are declared only once
  const [pastPrescriptions, setPastPrescriptions] = useState([]);
  const [isLoadingPrescriptions, setIsLoadingPrescriptions] = useState(false);
  const [pastPrescriptionsOpen, setPastPrescriptionsOpen] = useState(false);

  // Add useEffect to fetch past prescriptions when component mounts
  useEffect(() => {
    const fetchPastPrescriptions = async () => {
      try {
        setIsLoadingPrescriptions(true);
        const user = JSON.parse(localStorage.getItem("user"));
        const cabinId = user?.checkupcabindata?.[0]?.id;

        if (patientInfo.id && cabinId) {
          const response = await getPastPrescriptions(patientInfo.id, cabinId);
          console.log("Past Prescriptions Response:", response);
          // Ensure response is an array before setting state
          setPastPrescriptions(Array.isArray(response?.prescription) ? response.prescription : []);
        } else {
          console.error('Missing patient ID or cabin ID');
          setPastPrescriptions([]);
        }
      } catch (error) {
        console.error("Error fetching past prescriptions:", error);
        setPastPrescriptions([]);
      } finally {
        setIsLoadingPrescriptions(false);
      }
    };

    fetchPastPrescriptions();
  }, [patientInfo.id]);

useEffect(() => {
  console.log("Past Prescriptions:", pastPrescriptions);
}, [pastPrescriptions]);

  // We're not going to use the complaints data for prefilling
  // Instead, we'll just initialize with an empty complaint

  // Add new state for current prescription
  const [currentPrescriptionDetails, setCurrentPrescriptionDetails] = useState(null);
  const [isLoadingCurrentPrescription, setIsLoadingCurrentPrescription] = useState(false);
  const [currentPrescriptionError, setCurrentPrescriptionError] = useState(null);

  // Function to fetch current prescription
  const fetchCurrentPrescription = async () => {
    if (!appointmentInfo?.id) return;

    try {
      setIsLoadingCurrentPrescription(true);
      setCurrentPrescriptionError(null);

      const prescriptionData = await getCurrentPrescription(appointmentInfo.id);
      console.log("Current prescription data:", prescriptionData);

      // The API returns the prescription data directly, not in an array
      if (prescriptionData) {
        setCurrentPrescriptionDetails(prescriptionData);
      }
    } catch (error) {
      console.error("Error fetching current prescription:", error);
      setCurrentPrescriptionError("Failed to load current prescription");
    } finally {
      setIsLoadingCurrentPrescription(false);
    }
  };

  // Add useEffect to fetch current prescription
  useEffect(() => {
    if (appointmentInfo?.id) {
      fetchCurrentPrescription();
    }
  }, [appointmentInfo?.id]);

  // Update the prefilledPrescriptionData to use current prescription if available
  const prefilledPrescriptionData = {
    // For the main prescription state object
    patientName: patientInfo?.name || "",
    age: patientInfo?.age || "",
    gender: patientInfo?.gender || "",
    weight: currentPrescriptionDetails?.vitals?.weight || vitalsInfo.weight || "",
    vitals: {
      bloodPressure: currentPrescriptionDetails?.vitals?.blood_pressure || vitalsInfo.bloodPressure,
      heartRate: currentPrescriptionDetails?.vitals?.pulse_rate || vitalsInfo.heartRate,
      temperature: currentPrescriptionDetails?.vitals?.temperature || vitalsInfo.temperature,
      respiratoryRate: vitalsInfo.respiratoryRate, // Not in the API response
      spO2: currentPrescriptionDetails?.vitals?.spo2 || vitalsInfo.spO2,
    },
    // For the prescription.medications array (uses drug, dosage)
    medications: currentPrescriptionDetails?.medicines?.length > 0
      ? currentPrescriptionDetails.medicines.map(med => ({
          medicine: med.name || '',
          dose: med.dose || '',
          frequency: med.frequency || '',
          duration: med.duration || '',
          withFood: false,
          notes: med.notes || ''
        }))
      : [{ medicine: '', dose: '', frequency: '', duration: '', withFood: false }],
    tests: currentPrescriptionDetails?.tests?.length > 0 && currentPrescriptionDetails.tests[0]?.testlist
      ? currentPrescriptionDetails.tests[0].testlist
      : [],
    instructions: currentPrescriptionDetails?.advice?.length > 0 && currentPrescriptionDetails.advice[0]?.advice
      ? currentPrescriptionDetails.advice[0].advice
      : "",
    followUp: currentPrescriptionDetails?.followup || "",
    signature: "Dr. Amit Mittal",
    // Add attachments from the API response
    attachments: currentPrescriptionDetails?.attachments || [],
    
    // For the separate state variables in PrescriptionForm
    // For the complaints state array (uses complaint, severity, duration)
    complaints: currentPrescriptionDetails?.complaints?.length > 0
      ? currentPrescriptionDetails.complaints.map(complaint => ({
          complaint: complaint.name || '',
          severity: complaint.severity || '',
          duration: complaint.duration || '',
          frequency: complaint.frequency || '', // Added frequency field
          notes: complaint.notes || '',
          isEditing: false
        }))
      : [{ complaint: '', severity: '', duration: '', frequency: '', notes: '', isEditing: false }],
    // For the diagnoses state array
    diagnoses: currentPrescriptionDetails?.diagnosis?.length > 0
      ? currentPrescriptionDetails.diagnosis.map(diagnosis => ({
          diagnosis: diagnosis.name || '',
          duration: diagnosis.duration || '',
          notes: diagnosis.notes || '',
          isEditing: false
        }))
      : [{ diagnosis: '', duration: '', notes: '', isEditing: false }],
    // For the medications state array (uses medicine, dose, timing)
    medicationsArray: currentPrescriptionDetails?.medicines?.length > 0
      ? currentPrescriptionDetails.medicines.map(med => ({
          medicine: med.name || '',
          dose: med.dose || '',
          timing: med.when || '',
          frequency: med.frequency || '',
          duration: med.duration || '',
          notes: med.notes || '',
          isEditing: false
        }))
      : [{ medicine: '', dose: '', timing: '', frequency: '', duration: '', notes: '', isEditing: false }],
  };

  useEffect(() =>{
    console.log(prefilledPrescriptionData);
  },[prefilledPrescriptionData])

  const [openAttachmentDialog, setOpenAttachmentDialog] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const [confirmDoneDialog, setConfirmDoneDialog] = useState(false);
  const [isEditingVitals, setIsEditingVitals] = useState(false);
  const [editedVitals, setEditedVitals] = useState({...vitalsInfo});

  // Update the attachments to include the ECG report as a PDF
  const [attachments, setAttachments] = useState([]);
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);
  const [attachmentsError, setAttachmentsError] = useState(null);

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
    if (!attachment.url) {
      console.error('No URL available for attachment');
      return;
    }

    // For PDFs and images, try to open in a new tab
    if (attachment.type === 'pdf' || attachment.type === 'image') {
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = attachment.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      // Try to open the file
      try {
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Error opening attachment:', error);
        setAttachmentsError('Failed to open the file. Please try again.');
      }
    } else {
      // For other types, show in the preview dialog
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

  // Add a ref to access the PrescriptionForm component's data
  const prescriptionFormRef = useRef();

  // Modify the handlePrescriptionSubmit function to handle direct submission
  const handlePrescriptionSubmit = (formData) => {
    debugger; // Debug point 7: When prescription form is submitted
    console.log("Raw form data received:", JSON.stringify(formData, null, 2));
    
    // Check if medications exist and have the expected structure
    if (formData.medications) {
      debugger; // Debug point 8: Examining medications from form data
      console.log("Medications from form:", JSON.stringify(formData.medications, null, 2));
      
      // Log each medication individually for debugging
      formData.medications.forEach((med, index) => {
        console.log(`Medication ${index}:`, {
          medicine: med.medicine,
          dose: med.dose,
          frequency: med.frequency,
          timing: med.timing,
          duration: med.duration,
          notes: med.notes
        });
      });
    }
    
    debugger; // Debug point 9: Before creating API payload
    const payload = {
      appointment_id: appointmentInfo.id || "",
      complaints: Array.isArray(formData.complaints) 
        ? formData.complaints.filter(complaint => complaint.complaint || complaint.duration || complaint.severity).map(complaint => ({
            name: complaint.complaint || "",
            duration: complaint.duration || "",
            severity: complaint.severity || "",
            frequency: complaint.frequency || "",
            notes: complaint.notes || ""
          }))
        : [],
      diagnosis: Array.isArray(formData.diagnoses) 
        ? formData.diagnoses.filter(diagnosis => diagnosis.diagnosis || diagnosis.duration).map(diagnosis => ({
            name: diagnosis.diagnosis || "",
            duration: diagnosis.duration || "",
            notes: diagnosis.notes || ""
          }))
        : [],
      medicine: Array.isArray(formData.medications) 
        ? formData.medications
            .filter(medication => medication.medicine || medication.dose || medication.frequency || medication.duration)
            .map(medication => {
              debugger; // Debug point 10: Processing each medication for API payload
              console.log("Processing medication:", JSON.stringify(medication));
              return {
                name: medication.medicine || "",
                dose: medication.dose || "",
                frequency: medication.frequency || "",
                when: medication.timing || "",
                duration: medication.duration || "",
                notes: medication.notes || ""
              };
            })
        : [],
      advice: formData.instructions || "",
      tests: Array.isArray(formData.tests) ? formData.tests : []
    };

    debugger; // Debug point 11: Final API payload before sending
    console.log("Saving prescription with payload:", JSON.stringify(payload, null, 2));
    
    // Here you would typically call the savePrescription API with the payload
    savePrescription(payload)
      .then(data => {
        debugger; // Debug point 12: API response success
        console.log('Prescription saved successfully:', data);
        // Optionally, handle success (e.g., show a success message)
      })
      .catch(error => {
        debugger; // Debug point 13: API response error
        console.error('Error saving prescription:', error);
        // Optionally, handle error (e.g., show an error message)
      });
  };

  const handleEditVitals = () => {
    if (isEditingVitals) {
      // If we're currently editing and clicking save
      handleSaveVitals();
    } else {
      // If we're starting to edit
      setIsEditingVitals(true);
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
      doctor: 'Dr. Amit Mittal',
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
      followUp: '1 month',
      attachments: [
        { id: 1, name: 'Blood Test Results.pdf', type: 'pdf', reportType: 'blood-test', date: '2024-02-15', size: '1.2 MB' },
        { id: 2, name: 'ECG Report.pdf', type: 'pdf', reportType: 'ecg-test', date: '2024-02-15', size: '3.5 MB' },
      ]
    },
    {
      id: 'P002',
      date: '2024-01-20',
      doctor: 'Dr. Amit Mittal',
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
      followUp: '1 week if symptoms persist',
      attachments: [
        { id: 1, name: 'Throat Swab Results.pdf', type: 'pdf', reportType: 'lab-test', date: '2024-01-20', size: '0.8 MB' },
        { id: 2, name: 'Chest X-Ray.jpg', type: 'image', reportType: 'image', date: '2024-01-20', size: '2.5 MB' },
      ]
    }
  ]);

  // Add state for the file upload modal
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileType, setUploadFileType] = useState('pdf');
  const [isDragging, setIsDragging] = useState(false);

  // Add state for prescription modal
  const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  // Add new state variables
  const [expandedAppointment, setExpandedAppointment] = useState(null);
  const [prescriptionDetails, setPrescriptionDetails] = useState(null);
  const [isLoadingPrescription, setIsLoadingPrescription] = useState(false);
  const [error, setError] = useState(null);
  const [pastAppointments, setPastAppointments] = useState([]);

  // Add these state variables at the top with other state declarations
  const [openSaveTemplateDialog, setOpenSaveTemplateDialog] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateType, setTemplateType] = useState('');

  // Add these functions before the return statement
  const handleSaveTemplateOpen = (type) => {
    setTemplateType(type);
    setTemplateName('');
    setOpenSaveTemplateDialog(true);
  };

  const handleSaveTemplateClose = () => {
    setOpenSaveTemplateDialog(false);
    setTemplateName('');
  };

  const handleSaveTemplate = async () => {
    try {
      if (!templateName.trim()) {
        alert('Please enter a template name');
        return;
      }

      let payload;
      if (templateType === 'complaints') {
        // Get current form data from the PrescriptionForm component
        const formData = prescriptionFormRef.current?.getFormData();
        if (!formData) {
          alert('Unable to get form data');
          return;
        }

        payload = {
          name: templateName,
          complaints: formData.complaints.filter(complaint => 
            complaint.complaint || complaint.duration || complaint.severity
          ).map(complaint => ({
            name: complaint.complaint || "",
            duration: complaint.duration || "",
            severity: complaint.severity || "",
            frequency: "",
            notes: ""
          }))
        };
      }

      await saveTemplate(templateType, "CABIN_ID", payload);
      handleSaveTemplateClose();
      // Optionally show success message
      alert('Template saved successfully!');
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template. Please try again.');
    }
  };

  // Add function to fetch patient details
  const fetchPatientDetails = async () => {
    try {
      setError(null);
      const response = await getPatientDetails(patientInfo.id);
      console.log("Patient details response:", response);
      
      if (response && response.other_appointments && Array.isArray(response.other_appointments)) {
        // Map the other_appointments to our pastAppointments state with proper structure
        const formattedAppointments = response.other_appointments
          .filter(app => app.appointment_id !== appointmentInfo.id) // Filter out current appointment
          .map(app => {
            // Extract date from appointment_id if possible
            let appointmentDate;
            try {
              if (app.appointment_id && app.appointment_id.includes('-')) {
                appointmentDate = app.appointment_id.split('-')[1].substring(0, 10);
                // Validate date format
                if (!/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate)) {
                  appointmentDate = new Date().toISOString().split('T')[0];
                }
              } else {
                appointmentDate = new Date().toISOString().split('T')[0];
              }
            } catch (e) {
              appointmentDate = new Date().toISOString().split('T')[0];
            }

            return {
              ...app,
              id: app.appointment_id,
              date: appointmentDate,
              token: app.token || 0,
              appointment_type: app.appointment_type || 'Consultation',
              status: app.status || 'pending',
              disease: app.disease || 'No diagnosis recorded'
            };
          });
        
        setPastAppointments(formattedAppointments);
        console.log("Formatted past appointments:", formattedAppointments);
      } else {
        console.log("No past appointments found in the response");
        setPastAppointments([]);
      }
    } catch (error) {
      console.error("Error fetching patient details:", error);
      setError("Failed to load patient history");
      setPastAppointments([]);
    }
  };

  // Add function to fetch prescription details
  const handleFetchPrescription = async (appointmentId) => {
    try {
      setIsLoadingPrescription(true);
      setError(null);
      
      // First, get the prescription data
      const prescriptionResponse = await getPrescriptions(appointmentId);
      console.log("Prescription response:", prescriptionResponse);
      
      // Then, get the vitals data
      const vitalsResponse = await getVitals(appointmentId);
      console.log("Vitals response:", vitalsResponse);
      
      // Finally, get any attachments
      const attachmentsResponse = await getAttachments(appointmentId);
      console.log("Attachments response:", attachmentsResponse);
      
      // Process attachments to ensure they have the correct format
      const processedAttachments = Array.isArray(attachmentsResponse) 
        ? attachmentsResponse.map(att => ({
            id: att.id,
            name: att.file_name || `Attachment-${att.id}`,
            type: att.file_type?.includes('pdf') ? 'pdf' : 
                  att.file_type?.includes('image') ? 'image' : 'document',
            url: getFullAttachmentUrl(att.file),
            description: att.description || ''
          }))
        : [];
      
      // Combine all the data into a comprehensive prescription details object
      if (prescriptionResponse && Array.isArray(prescriptionResponse) && prescriptionResponse.length > 0) {
        const prescriptionData = prescriptionResponse[0];
        
        // Create a combined prescription details object
        const combinedDetails = {
          ...prescriptionData,
          // Add vitals data if available
          vitals: vitalsResponse || {
            blood_pressure: "N/A",
            pulse_rate: "N/A",
            temperature: "N/A",
            spo2: "N/A"
          },
          // Ensure complaints is an array
          complaints: Array.isArray(prescriptionData.complaints) ? prescriptionData.complaints : [],
          // Ensure diagnosis is an array
          diagnosis: Array.isArray(prescriptionData.diagnosis) ? prescriptionData.diagnosis : [],
          // Ensure medicines is an array
          medicines: Array.isArray(prescriptionData.medicines) ? prescriptionData.medicines : [],
          // Ensure tests has a testlist array
          tests: prescriptionData.tests && prescriptionData.tests.testlist 
            ? prescriptionData.tests 
            : { testlist: [] },
          // Ensure advice has an advice string
          advice: prescriptionData.advice && typeof prescriptionData.advice.advice === 'string'
            ? prescriptionData.advice
            : { advice: prescriptionData.advice || "No advice recorded" },
          // Add processed attachments
          attachments: processedAttachments
        };
        
        setPrescriptionDetails(combinedDetails);
        setExpandedAppointment(appointmentId);
      } else {
        // If no prescription data is available, create a minimal object with available data
        setPrescriptionDetails({
          vitals: vitalsResponse || {
            blood_pressure: "N/A",
            pulse_rate: "N/A",
            temperature: "N/A",
            spo2: "N/A"
          },
          complaints: [],
          diagnosis: [],
          medicines: [],
          tests: { testlist: [] },
          advice: { advice: "No advice recorded" },
          attachments: processedAttachments
        });
        setExpandedAppointment(appointmentId);
      }
    } catch (error) {
      console.error("Error fetching prescription details:", error);
      setError("Failed to load prescription details");
      // Set minimal prescription details even on error
      setPrescriptionDetails({
        vitals: {
          blood_pressure: "N/A",
          pulse_rate: "N/A",
          temperature: "N/A",
          spo2: "N/A"
        },
        complaints: [],
        diagnosis: [],
        medicines: [],
        tests: { testlist: [] },
        advice: { advice: "Error loading prescription details" },
        attachments: []
      });
    } finally {
      setIsLoadingPrescription(false);
    }
  };

  // Add useEffect to fetch patient details on component mount
  useEffect(() => {
    if (patientInfo?.id) {
      fetchPatientDetails();
    }
  }, [patientInfo]);

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
  const handleFileUpload = async () => {
    if (!uploadFile || !uploadFileName) return;
    
    try {
      setAttachmentsLoading(true);
      setAttachmentsError(null);
      
      // Create form data
      const formData = new FormData();
      formData.append('appointment_id', appointmentInfo.id);
      formData.append('file', uploadFile);
      formData.append('file_name', uploadFileName);
      formData.append('file_type', uploadFile.type);
      formData.append('description', `Medical record uploaded for appointment ${appointmentInfo.id}`);
      
      // Upload the file
      const response = await uploadAttachment(formData);
      console.log('File uploaded successfully:', response);
      
      // Refresh attachments list
      await fetchAttachments();
      
      // Close the modal
      handleCloseUploadModal();
      
    } catch (error) {
      console.error('Error uploading file:', error);
      setAttachmentsError('Failed to upload file. Please try again.');
    } finally {
      setAttachmentsLoading(false);
    }
  };

  // Add function to handle opening the prescription modal
  const handleOpenPrescription = (prescription) => {
    console.log("Opening prescription:", prescription); // For debugging
    
    setSelectedPrescription({
      patientInfo: patientInfo,
      appointmentInfo: {
        date: new Date().toLocaleDateString(),
        doctor: appointmentInfo?.doctor || 'Doctor',
        diagnosis: prescription.diagnosis?.[0]?.name || '',
        id: appointmentInfo?.id || ''
      },
      initialData: {
        vitals: {
          bloodPressure: prescription.vitals?.blood_pressure || 'N/A',
          heartRate: prescription.vitals?.pulse_rate || 'N/A',
          temperature: prescription.vitals?.temperature || 'N/A',
          respiratoryRate: 'N/A',
          spO2: prescription.vitals?.spo2 || 'N/A',
          weight: prescription.vitals?.weight || 'N/A',
          height: prescription.vitals?.height || 'N/A'
        },
        complaints: prescription.complaints?.map(complaint => ({
          complaint: complaint.name,
          severity: complaint.severity,
          duration: complaint.duration,
          frequency: complaint.frequency,
          notes: complaint.notes
        })) || [],
        diagnoses: prescription.diagnosis?.map(diag => ({
          diagnosis: diag.name,
          duration: diag.duration,
          notes: diag.notes
        })) || [],
        medications: prescription.medicines?.map(med => ({
          medicine: med.name,
          dose: med.dose,
          timing: med.when,
          frequency: med.frequency,
          duration: med.duration,
          notes: med.notes
        })) || [],
        tests: prescription.tests?.[0]?.testlist || [],
        instructions: prescription.advice?.[0]?.advice || '',
        followUp: '',
        attachments: prescription.attachments?.map(att => ({
          id: att.id,
          name: att.file_name,
          type: att.file_type?.includes('pdf') ? 'pdf' : 
                att.file_type?.includes('image') ? 'image' : 'document',
          url: getFullAttachmentUrl(att.file),
          date: new Date(att.uploaded_at).toLocaleDateString(),
          size: '1 MB' // You might want to get actual file size if available
        })) || []
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
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    // Generate prescription HTML content
    const prescriptionContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Prescription - ${selectedPrescription.appointmentInfo.date}</title>
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
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
          }
          .medication-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          .medication-table th, .medication-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          .medication-table th {
            background-color: #f2f2f2;
          }
          .tests, .instructions {
            margin-top: 15px;
          }
          .footer {
            margin-top: 30px;
            text-align: right;
            font-style: italic;
            color: #666;
          }
          .attachments {
            margin-top: 15px;
          }
          .attachments ul {
            list-style-type: none;
            padding-left: 0;
          }
          .attachments li {
            padding: 5px 0;
            border-bottom: 1px dashed #ddd;
          }
          @media print {
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="clinic-name">DigiCare Medical Center</div>
          <div class="doctor-info">Healthcare Professional: ${selectedPrescription.appointmentInfo.doctor || 'Doctor'}</div>
        </div>
        
        <div class="patient-info">
          <div class="patient-details">
            <p><strong>Patient Name:</strong> ${selectedPrescription.patientInfo.name}</p>
            <p><strong>Patient ID:</strong> ${selectedPrescription.patientInfo.id}</p>
            <p><strong>BP:</strong> ${selectedPrescription.initialData.vitals.bloodPressure} mmHg | <strong>Temp:</strong> ${selectedPrescription.initialData.vitals.temperature}°C</p>
          </div>
          <div class="appointment-details">
            <p><strong>Date:</strong> ${selectedPrescription.appointmentInfo.date}</p>
            <p><strong>Appointment ID:</strong> ${selectedPrescription.appointmentInfo.id}</p>
          </div>
        </div>
        
        <div class="section-title">Diagnosis</div>
        <p>${selectedPrescription.initialData.diagnoses.map(d => d.diagnosis).join(', ') || selectedPrescription.appointmentInfo.diagnosis}</p>
        
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
            ${selectedPrescription.initialData.medications.map(med => `
              <tr>
                <td>${med.medicine}</td>
                <td>${med.dose}</td>
                <td>${med.frequency}</td>
                <td>${med.duration}</td>
                <td>${med.notes || med.timing || ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        ${selectedPrescription.initialData.tests && selectedPrescription.initialData.tests.length > 0 ? `
          <div class="section-title">Tests Advised</div>
          <div class="tests">
            ${selectedPrescription.initialData.tests.map(test => `<p>• ${test}</p>`).join('')}
          </div>
        ` : ''}
        
        <div class="section-title">Instructions</div>
        <div class="instructions">
          <p>${selectedPrescription.initialData.instructions || 'No specific instructions provided.'}</p>
          <p><strong>Follow-up:</strong> ${selectedPrescription.initialData.followUp || 'As needed'}</p>
        </div>
        
        ${selectedPrescription.initialData.attachments && selectedPrescription.initialData.attachments.length > 0 ? `
          <div class="section-title">Attachments</div>
          <div class="attachments">
            <ul>
              ${selectedPrescription.initialData.attachments.map(attachment => `
                <li>
                  <strong>${attachment.name}</strong> - 
                  ${attachment.reportType === 'ecg-test' ? 'ECG Test Report' : 
                  attachment.reportType === 'blood-test' ? 'Blood Test Report' : 
                  attachment.reportType === 'lab-test' ? 'Lab Test Report' :
                  attachment.type === 'pdf' ? 'PDF Document' :
                  attachment.type === 'image' ? 'Image' : 'Document'}
                  (${attachment.date})
                </li>
              `).join('')}
            </ul>
          </div>
        ` : ''}
        
        <div class="footer">
          <p>This is a digital prescription issued by DigiCare Medical Center.</p>
        </div>
        
        <button onclick="window.print(); window.close();" style="display: block; margin: 30px auto; padding: 10px 20px; background: #2196f3; color: white; border: none; border-radius: 4px; cursor: pointer;">
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
    };
  };

  // Update the renderPrescriptionForm function
  const renderPrescriptionForm = () => (
    <Box>
      <PrescriptionForm 
        initialData={prefilledPrescriptionData}
        appointmentId={appointmentInfo.id}
        initialize={true}
        onSubmit={handlePrescriptionSubmit}
        showPrintButton={false}
        showSubmitButton={false} // Hide the built-in submit button
        hidePatientDetails={hidePatientDetails}
        patientInfo={patientInfo}
        ref={prescriptionFormRef}
      />
      
      {/* Add a custom submit button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<Print />}
          onClick={handlePrintCurrentPrescription}
        >
          Print
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Save />}
          onClick={() => {
            if (prescriptionFormRef.current && prescriptionFormRef.current.submitForm) {
              prescriptionFormRef.current.submitForm();
            }
          }}
        >
          Save Prescription
        </Button>
      </Box>
    </Box>
  );

  // Add a new function to handle printing the current prescription
  const handlePrintCurrentPrescription = () => {
    // Create a new window with the prescription content
    const printWindow = window.open('', '_blank');
    
    // Get current prescription data
    const currentPrescriptionData = {
      patientInfo: patientInfo,
      appointmentInfo: appointmentInfo,
      vitals: editedVitals,
      medications: document.querySelectorAll('table[aria-label="Medications"] tbody tr').length > 0 
        ? Array.from(document.querySelectorAll('table[aria-label="Medications"] tbody tr')).map(row => {
            const cells = row.querySelectorAll('td');
            return {
              medicine: cells[0]?.textContent || '',
              dose: cells[1]?.textContent || '',
              timing: cells[2]?.textContent || '',
              frequency: cells[3]?.textContent || '',
              duration: cells[4]?.textContent || '',
              notes: cells[5]?.textContent || ''
            };
          })
        : [],
      diagnoses: document.querySelectorAll('table[aria-label="Diagnoses"] tbody tr').length > 0 
        ? Array.from(document.querySelectorAll('table[aria-label="Diagnoses"] tbody tr')).map(row => {
            const cells = row.querySelectorAll('td');
            return {
              diagnosis: cells[0]?.textContent || '',
              duration: cells[1]?.textContent || '',
              notes: cells[2]?.textContent || ''
            };
          })
        : [],
      tests: Array.from(document.querySelectorAll('[data-testtype="test-item"]')).map(el => el.textContent),
      instructions: document.querySelector('[name="instructions"]')?.value || '',
      followUp: document.querySelector('[name="followUp"]')?.value || ''
    };
    
    // Generate the prescription HTML content
    const prescriptionContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Prescription - ${patientInfo?.name || 'Patient'}</title>
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
          <div class="doctor-info">${appointmentInfo?.doctor || 'Doctor'}</div>
          <div class="doctor-info">General Medicine</div>
        </div>
        
        <div class="patient-info">
          <div class="patient-details">
            <p><strong>Patient Name:</strong> ${patientInfo?.name || 'Patient'}</p>
            <p><strong>Patient ID:</strong> ${patientInfo?.id || 'N/A'}</p>
            <p><strong>Age/Gender:</strong> ${patientInfo?.age || 'N/A'} years, ${patientInfo?.gender || 'N/A'}</p>
          </div>
          <div class="appointment-details">
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Appointment ID:</strong> ${appointmentInfo?.id || 'N/A'}</p>
            <p><strong>BP:</strong> ${currentPrescriptionData.vitals?.bloodPressure || 'N/A'} mmHg | <strong>Temp:</strong> ${currentPrescriptionData.vitals?.temperature || 'N/A'}°C</p>
          </div>
        </div>
        
        <div class="section-title">Diagnosis</div>
        <p>${currentPrescriptionData.diagnoses.map(diag => diag.diagnosis).join(', ') || 'No diagnosis provided'}</p>
        
        <div class="section-title">Medications</div>
        <table class="medication-table">
          <thead>
            <tr>
              <th>Medication</th>
              <th>Dose</th>
              <th>When</th>
              <th>Frequency</th>
              <th>Duration</th>
              <th>Instructions</th>
            </tr>
          </thead>
          <tbody>
            ${currentPrescriptionData.medications.map(med => `
              <tr>
                <td>${med.medicine || 'N/A'}</td>
                <td>${med.dose || 'N/A'}</td>
                <td>${med.timing || ''}</td>
                <td>${med.frequency || 'N/A'}</td>
                <td>${med.duration || 'N/A'}</td>
                <td>${med.notes || ''}</td>
              </tr>
            `).join('') || '<tr><td colspan="6">No medications prescribed</td></tr>'}
          </tbody>
        </table>
        
        <div class="section-title">Tests Recommended</div>
        <div class="tests-list">
          ${currentPrescriptionData.tests.length > 0 ? currentPrescriptionData.tests.map(test => `<p>• ${test}</p>`).join('') : 'No tests recommended'}
        </div>
        
        <div class="section-title">Advice</div>
        <div class="advice">
          <p>${currentPrescriptionData.instructions || 'Follow a healthy diet and exercise regularly.'}</p>
        </div>
        
        <div class="section-title">Follow-up</div>
        <p>Please return for follow-up on ${currentPrescriptionData.followUp ? new Date(currentPrescriptionData.followUp).toLocaleDateString() : 'as advised'}.</p>
        
        <div class="footer">
          <div></div>
          <div class="signature">
            <p>${appointmentInfo?.doctor || 'Doctor'}</p>
            <p>General Medicine</p>
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

  // Add function to fetch attachments
  const fetchAttachments = async () => {
    if (!appointmentInfo?.id) return;
    
    try {
      setAttachmentsLoading(true);
      setAttachmentsError(null);
      
      const response = await getAttachments(appointmentInfo.id);
      console.log("Attachments response:", response);
      
      if (response) {
        setAttachments(response.map(att => ({
          id: att.id,
          name: att.file_name,
          type: att.file_type.includes('pdf') ? 'pdf' : 
                att.file_type.includes('image') ? 'image' : 'document',
          reportType: 'custom',
          date: new Date(att.uploaded_at).toLocaleDateString(),
          size: '1 MB', // Since size is not provided in the API
          url: getFullAttachmentUrl(att.file),
          description: att.description
        })));
      }
    } catch (error) {
      console.error("Error fetching attachments:", error);
      setAttachmentsError("Failed to load attachments. Please try again.");
    } finally {
      setAttachmentsLoading(false);
    }
  };

  useEffect(() => {
    // Fetch attachments when component mounts
    fetchAttachments();
  }, []);

  // Add function to handle attachment deletion
  const handleDeleteAttachment = async (attachmentId, event) => {
    event.stopPropagation(); // Prevent the attachment box click event
    setAttachmentToDelete(attachmentId);
    setDeleteDialogOpen(true);
  };

  // Add new function to handle actual deletion
  const confirmDeleteAttachment = async () => {
    if (!attachmentToDelete) return;
    
    try {
      setAttachmentsLoading(true);
      setAttachmentsError(null);
      
      await deleteAttachment(attachmentToDelete);
      console.log('Attachment deleted successfully');
      
      // Refresh attachments list
      await fetchAttachments();
      
    } catch (error) {
      console.error('Error deleting attachment:', error);
      setAttachmentsError('Failed to delete attachment. Please try again.');
    } finally {
      setAttachmentsLoading(false);
      setDeleteDialogOpen(false);
      setAttachmentToDelete(null);
    }
  };

  // Add function to handle appointment expansion
  const handleExpandAppointment = (appointmentId) => {
    if (expandedAppointment === appointmentId) {
      setExpandedAppointment(null);
      setPrescriptionDetails(null);
    } else {
      handleFetchPrescription(appointmentId);
    }
  };

  // Add JSX for past appointments section with real data
  const renderPastAppointments = () => {
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Past Appointments
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {pastAppointments.length > 0 ? (
          <List>
            {pastAppointments.map((appointment) => (
              <React.Fragment key={appointment.id}>
                <ListItem 
                  button 
                  onClick={() => handleExpandAppointment(appointment.id)}
                  sx={{
                    bgcolor: 'background.paper',
                    mb: 1,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    }
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle1">
                          {appointment.date && new Date(appointment.date).toLocaleDateString()} 
                          {appointment.token ? ` - Token #${appointment.token}` : ''} 
                          {appointment.appointment_type ? ` - ${appointment.appointment_type}` : ''}
                        </Typography>
                        <Chip 
                          label={appointment.status}
                          size="small"
                          color={
                            appointment.status === 'done_checkup' || appointment.status === 'completed' ? 'success' : 
                            appointment.status === 'in_progress' ? 'primary' :
                            appointment.status === 'cancelled' ? 'error' : 'default'
                          }
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        {appointment.disease || 'No diagnosis recorded'}
                      </Typography>
                    }
                  />
                </ListItem>
                
                <Collapse in={expandedAppointment === appointment.id} timeout="auto" unmountOnExit>
                  <Box sx={{ p: 2, bgcolor: 'background.paper', ml: 2, borderLeft: 2, borderColor: 'primary.main' }}>
                    {isLoadingPrescription ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                        <CircularProgress size={24} />
                      </Box>
                    ) : prescriptionDetails ? (
                      <Grid container spacing={2}>
                        {/* Vitals */}
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" gutterBottom>Vitals</Typography>
                          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <Typography variant="body2">BP: {prescriptionDetails.vitals.blood_pressure || 'N/A'}</Typography>
                            <Typography variant="body2">Temp: {prescriptionDetails.vitals.temperature || 'N/A'}°C</Typography>
                            <Typography variant="body2">Pulse: {prescriptionDetails.vitals.pulse_rate || 'N/A'}</Typography>
                            <Typography variant="body2">SpO2: {prescriptionDetails.vitals.spo2 || 'N/A'}%</Typography>
                          </Box>
                        </Grid>
                        
                        {/* Complaints */}
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" gutterBottom>Complaints</Typography>
                          {prescriptionDetails.complaints && prescriptionDetails.complaints.length > 0 ? (
                            prescriptionDetails.complaints.map((complaint, index) => (
                              <Typography key={index} variant="body2">
                                • {complaint.complaint || complaint.name} 
                                {complaint.duration ? ` - ${complaint.duration}` : ''} 
                                {complaint.severity ? ` (${complaint.severity})` : ''}
                              </Typography>
                            ))
                          ) : (
                            <Typography variant="body2" color="text.secondary">No complaints recorded</Typography>
                          )}
                        </Grid>
                        
                        {/* Diagnosis */}
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" gutterBottom>Diagnosis</Typography>
                          {prescriptionDetails.diagnosis && prescriptionDetails.diagnosis.length > 0 ? (
                            prescriptionDetails.diagnosis.map((diag, index) => (
                              <Typography key={index} variant="body2">
                                • {diag.diagnosis || diag.name} 
                                {diag.icd_code ? ` (${diag.icd_code})` : ''}
                                {diag.duration ? ` - ${diag.duration}` : ''}
                              </Typography>
                            ))
                          ) : (
                            <Typography variant="body2" color="text.secondary">No diagnosis recorded</Typography>
                          )}
                        </Grid>
                        
                        {/* Medicines */}
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" gutterBottom>Medications</Typography>
                          {prescriptionDetails.medicines && prescriptionDetails.medicines.length > 0 ? (
                            prescriptionDetails.medicines.map((med, index) => (
                              <Typography key={index} variant="body2">
                                • {med.name || med.medicine} 
                                {med.dose ? ` ${med.dose}` : ''} 
                                {med.frequency ? ` - ${med.frequency}` : ''} 
                                {med.duration ? ` for ${med.duration}` : ''} 
                                {med.instructions ? ` (${med.instructions})` : ''}
                                {med.when ? ` ${med.when}` : ''}
                              </Typography>
                            ))
                          ) : (
                            <Typography variant="body2" color="text.secondary">No medications prescribed</Typography>
                          )}
                        </Grid>
                        
                        {/* Tests */}
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" gutterBottom>Tests</Typography>
                          {prescriptionDetails.tests && prescriptionDetails.tests.testlist && prescriptionDetails.tests.testlist.length > 0 ? (
                            prescriptionDetails.tests.testlist.map((test, index) => (
                              <Typography key={index} variant="body2">• {test}</Typography>
                            ))
                          ) : (
                            <Typography variant="body2" color="text.secondary">No tests prescribed</Typography>
                          )}
                        </Grid>
                        
                        {/* Advice */}
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" gutterBottom>Advice</Typography>
                          <Typography variant="body2">
                            {prescriptionDetails.advice && prescriptionDetails.advice.advice ? 
                              prescriptionDetails.advice.advice : 'No specific advice provided'}
                          </Typography>
                        </Grid>
                        
                        {/* Attachments */}
                        {prescriptionDetails.attachments && prescriptionDetails.attachments.length > 0 && (
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" gutterBottom>Attachments</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {prescriptionDetails.attachments.map((attachment, index) => (
                                <Chip
                                  key={index}
                                  label={attachment.name || `Attachment ${index + 1}`}
                                  onClick={() => handleOpenAttachment(attachment)}
                                  icon={getAttachmentIcon(attachment.type)}
                                  variant="outlined"
                                  sx={{ m: 0.5 }}
                                />
                              ))}
                            </Box>
                          </Grid>
                        )}
                      </Grid>
                    ) : (
                      <Typography color="text.secondary">No prescription details available</Typography>
                    )}
                  </Box>
                </Collapse>
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Paper sx={{ p: 2, bgcolor: 'background.paper', textAlign: 'center' }}>
            <Typography color="text.secondary">No past appointments found</Typography>
          </Paper>
        )}
      </Box>
    );
  };

  const [isSavingVitals, setIsSavingVitals] = useState(false);

  const handleSaveVitals = async () => {
    try {
      setIsSavingVitals(true);
      // Prepare the payload for the API
      const vitalsPayload = {
        appointment_id: appointmentInfo.id,
        vitals: {
          blood_pressure: editedVitals.bloodPressure,
          pulse_rate: editedVitals.heartRate,
          temperature: editedVitals.temperature,
          respiratory_rate: editedVitals.respiratoryRate,
          spo2: editedVitals.spO2,
          height: editedVitals.height,
          weight: editedVitals.weight,
          blood_sugar: ""
        }
      };

      // Call the API
      const response = await manageVitals(vitalsPayload);
      console.log("Vitals updated successfully:", response);

      // Optionally, update the UI state or refetch data
      setIsEditingVitals(false);

    } catch (error) {
      console.error("Error saving vitals:", error);
      // Optionally, handle error (e.g., show an error message)
    } finally {
      setIsSavingVitals(false);
    }
  };

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [attachmentToDelete, setAttachmentToDelete] = useState(null);

  return (
    <Container maxWidth="xl" sx={{ mt: 3, mb: 10 }}>
      {/* Enhanced PageHeader with back button */}
      <PageHeader 
        title="Patient Consultation"
        showBackButton={true}
        backButtonVariant="button"
        backButtonText="Back"
        onBackButtonClick={handleBackToPatient}
      />

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
              {patientInfo.age && patientInfo.age !== '' && (
                <Chip 
                    size="small"
                    icon={<Person />} 
                    label={patientInfo.age} 
                    variant="outlined" 
                />
              )}
              {patientInfo.gender && patientInfo.gender !== '' && (
                <Chip 
                    size="small"
                    label={patientInfo.gender} 
                    variant="outlined" 
                />
              )}
              {patientInfo.id && (
                    <Chip 
                      size="small"
                      label={`ID: ${patientInfo.id}`} 
                      variant="outlined" 
                    />
              )}
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
              {patientInfo?.blood_type && patientInfo.blood_type !== '' && (
                <Chip 
                size="small" 
                  label={`Blood: ${patientInfo.blood_type}`}
                variant="outlined"
                    color="error"
                />
              )}
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
                startIcon={isEditingVitals ? (isSavingVitals ? <CircularProgress size={20} /> : <Save />) : <Edit />}
                onClick={handleEditVitals}
                disabled={isSavingVitals}
                sx={{ ml: 2 }}
              >
                {isEditingVitals ? (isSavingVitals ? "Saving..." : "Save Vitals") : "Edit Vitals"}
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
                    endAdornment: <Typography variant="caption">°C</Typography>,
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
            {attachmentsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={24} />
              </Box>
            ) : attachmentsError ? (
              <Box sx={{ p: 2 }}>
                <Alert 
                  severity="error" 
                  action={
                    <Button color="inherit" size="small" onClick={fetchAttachments}>
                      Retry
                    </Button>
                  }
                >
                  {attachmentsError}
                </Alert>
              </Box>
            ) : attachments.length > 0 ? (
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
                    <IconButton 
                      size="small" 
                      onClick={(e) => handleDeleteAttachment(attachment.id, e)}
                      sx={{ 
                        ml: 1,
                        opacity: 0,
                        transition: 'opacity 0.2s',
                        '&:hover': { color: 'error.main' },
                        '.MuiBox-root:hover &': { opacity: 1 }
                      }}
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No attachments available.
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Upload />}
                  onClick={handleOpenUploadModal}
                  sx={{ mt: 2 }}
                >
                  Upload New Attachment
                </Button>
              </Box>
            )}
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

      {/* Attachment Preview Dialog */}
      <Dialog
        open={openAttachmentDialog}
        onClose={handleCloseAttachmentDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedAttachment?.name || 'Attachment'}
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
            {selectedAttachment?.type === 'image' && selectedAttachment?.url ? (
              <Box 
                component="img" 
                src={selectedAttachment.url}
                alt={selectedAttachment?.name || 'Medical Image'}
                sx={{ maxWidth: '100%', maxHeight: '70vh' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/800x600?text=Image+Not+Available";
                }}
              />
            ) : selectedAttachment?.type === 'pdf' && selectedAttachment?.url ? (
              <Box sx={{ height: '70vh', width: '100%' }}>
                <iframe 
                  src={selectedAttachment.url} 
                  title={selectedAttachment?.name || 'PDF Document'}
                  width="100%" 
                  height="100%" 
                  style={{ border: 'none' }}
                />
              </Box>
            ) : (
              <Box sx={{ height: '70vh', bgcolor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography>
                  {selectedAttachment?.url 
                    ? 'Preview not available for this file type. Please download to view.' 
                    : 'File not available for preview.'}
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAttachmentDialog}>Close</Button>
          {selectedAttachment?.url && (
            <>
              <Button 
                startIcon={<Print />} 
                color="primary"
                onClick={() => {
                  if (selectedAttachment?.url) {
                    const printWindow = window.open(selectedAttachment.url, '_blank');
                    if (printWindow) {
                      printWindow.onload = () => {
                        printWindow.print();
                      };
                    }
                  }
                }}
              >
                Print
              </Button>
              <Button 
                startIcon={<Save />} 
                color="primary"
                component="a"
                href={selectedAttachment.url}
                download={selectedAttachment.name || 'download'}
                target="_blank"
              >
                Download
              </Button>
            </>
          )}
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

      {/* Prescription Modal */}
      <Dialog
        open={prescriptionModalOpen}
        onClose={handleClosePrescriptionModal}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Prescription Details</Typography>
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
              <IconButton onClick={handleClosePrescriptionModal}>
                <Close />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedPrescription && (
            <Box sx={{ p: 2 }}>
              {/* Patient Info Header */}
              <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      <strong>Patient Information</strong>
                </Typography>
                    <Typography variant="body2">Name: {selectedPrescription.patientInfo.name}</Typography>
                    <Typography variant="body2">ID: {selectedPrescription.patientInfo.id}</Typography>
                    <Typography variant="body2">Age: {selectedPrescription.patientInfo.age} years</Typography>
                    <Typography variant="body2">Gender: {selectedPrescription.patientInfo.gender}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      <strong>Appointment Details</strong>
                </Typography>
                    <Typography variant="body2">Date: {selectedPrescription.appointmentInfo.date}</Typography>
                    <Typography variant="body2">Doctor: {selectedPrescription.appointmentInfo.doctor}</Typography>
                    <Typography variant="body2">Appointment ID: {selectedPrescription.appointmentInfo.id}</Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* Vitals Section */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                  <MedicalServices sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Vitals
                  </Typography>
                <Grid container spacing={2}>
                  {Object.entries({
                    'Blood Pressure': selectedPrescription.initialData.vitals.bloodPressure + ' mmHg',
                    'Heart Rate': selectedPrescription.initialData.vitals.heartRate + ' bpm',
                    'Temperature': selectedPrescription.initialData.vitals.temperature + ' °C',
                    'SpO2': selectedPrescription.initialData.vitals.spO2 + ' %',
                    'Weight': selectedPrescription.initialData.vitals.weight + ' kg',
                    'Height': selectedPrescription.initialData.vitals.height + ' cm'
                  }).map(([key, value]) => (
                    <Grid item xs={6} sm={4} md={2} key={key}>
                      <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          {key}
                  </Typography>
                        <Typography variant="body1">
                          {value}
                  </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
                </Box>

              {/* Complaints Section - Add this new section */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                  Complaints
                  </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Complaint</TableCell>
                        <TableCell>Severity</TableCell>
                        <TableCell>Duration</TableCell>
                        <TableCell>Frequency</TableCell>
                        <TableCell>Notes</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedPrescription.initialData.complaints.length > 0 ? (
                        selectedPrescription.initialData.complaints.map((complaint, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{complaint.complaint}</TableCell>
                            <TableCell>{complaint.severity}</TableCell>
                            <TableCell>{complaint.duration}</TableCell>
                            <TableCell>{complaint.frequency}</TableCell>
                            <TableCell>{complaint.notes}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} align="center">No complaints recorded</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* Diagnosis Section */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                  Diagnosis
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Diagnosis</TableCell>
                        <TableCell>Duration</TableCell>
                        <TableCell>Notes</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedPrescription.initialData.diagnoses.length > 0 ? (
                        selectedPrescription.initialData.diagnoses.map((diag, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{diag.diagnosis}</TableCell>
                            <TableCell>{diag.duration}</TableCell>
                            <TableCell>{diag.notes}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} align="center">No diagnosis recorded</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* Medications */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Medications</Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Medicine</TableCell>
                        <TableCell>Dose</TableCell>
                        <TableCell>When</TableCell>
                        <TableCell>Frequency</TableCell>
                        <TableCell>Duration</TableCell>
                        <TableCell>Instructions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedPrescription.initialData.medications && selectedPrescription.initialData.medications.length > 0 ? (
                        selectedPrescription.initialData.medications.map((med, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{med.medicine}</TableCell>
                            <TableCell>{med.dose}</TableCell>
                            <TableCell>{med.timing || med.when}</TableCell>
                            <TableCell>{med.frequency}</TableCell>
                            <TableCell>{med.duration}</TableCell>
                            <TableCell>{med.notes}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} align="center">No medications prescribed</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* Tests */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Tests</Typography>
                  <Box sx={{ pl: 2 }}>
                  {selectedPrescription.initialData.tests && selectedPrescription.initialData.tests.length > 0 ? (
                    selectedPrescription.initialData.tests.map((test, idx) => (
                      <Typography key={idx} variant="body2">• {test}</Typography>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">No tests prescribed</Typography>
                  )}
                  </Box>
                </Box>

              {/* Instructions */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>Instructions</Typography>
                <Typography variant="body2">
                  {selectedPrescription.initialData.instructions || 'No specific instructions provided'}
                </Typography>
              </Box>

              {/* Attachments Section */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                  <Description sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Attachments
                  </Typography>
                <Grid container spacing={2}>
                  {selectedPrescription.initialData.attachments && selectedPrescription.initialData.attachments.length > 0 ? (
                    selectedPrescription.initialData.attachments.map((attachment, index) => (
                      <Grid item xs={12} sm={6} md={4} key={attachment.id || index}>
                        <Paper
                          variant="outlined"
                    sx={{ 
                            p: 2,
                          cursor: 'pointer',
                          '&:hover': { 
                              bgcolor: 'action.hover',
                              borderColor: 'primary.main'
                          }
                        }}
                        onClick={() => handleOpenAttachment(attachment)}
                      >
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        {getAttachmentIcon(attachment.type)}
                            <Typography variant="subtitle2" sx={{ ml: 1 }}>
                            {attachment.name}
                          </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {attachment.date} • {attachment.size}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))
                  ) : (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary" align="center">
                        No attachments available
                </Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Save Template Dialog */}
      <Dialog open={openSaveTemplateDialog} onClose={handleSaveTemplateClose}>
        <DialogTitle>Save as Template</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Template Name"
            type="text"
            fullWidth
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSaveTemplateClose}>Cancel</Button>
          <Button onClick={handleSaveTemplate} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Attachment</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this attachment? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={confirmDeleteAttachment} 
            color="error" 
            variant="contained"
            disabled={attachmentsLoading}
          >
            {attachmentsLoading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Past Prescriptions Section */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}> {/* Changed from p: 2 to p: 3 to match prescription page */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <History sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="h6" component="h2">
            Past Prescriptions
          </Typography>
        </Box>
        <Divider sx={{ mb: 4 }} />
        
        {isLoadingPrescriptions ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : pastPrescriptions.length > 0 ? (
          <Box>
            {pastPrescriptions.map((prescription, index) => (
              <Paper 
                key={index} 
                sx={{ 
                  mb: 1,
                  mr:12,
                  ml:12,
                  p: 4,
                  border: '1px solid',
                  borderColor: 'divider',
                  maxWidth: '100%', // Added to ensure content doesn't overflow
                  overflow: 'hidden' // Added to handle any overflow
                }}
              >
                {/* Prescription Header */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 1, // Reduced from mb: 2
                  pb: 1, // Reduced from pb: 2
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }}>
                  <CalendarToday fontSize="small" color="action" sx={{ mr: 1 }} />
                  <Typography>{new Date().toLocaleDateString()}</Typography>
                  <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
                  {prescription.diagnosis && prescription.diagnosis.length > 0 && (
                    <>
                      <LocalHospital fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography>{prescription.diagnosis[0].name}</Typography>
                    </>
                  )}
                  <Box sx={{ ml: 'auto' }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Print />}
                          onClick={() => handlePrintPrescription(prescription)}
                        >
                          Print
                        </Button>
                      </Box>
                </Box>

                {/* Prescription Content */}
                <Grid container spacing={1}> {/* Reduced from spacing={3} */}
                  {/* Vitals Section */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ mb: 0, color: 'primary.main' }}> {/* Reduced from mb: 2 */}
                      <MedicalServices sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Vitals
                    </Typography>
                    <Grid container spacing={1}> {/* Reduced from spacing={2} */}
                      {prescription.vitals && Object.entries(prescription.vitals).map(([key, value]) => (
                        value ? (
                          <Grid item xs={6} sm={4} md={2} key={key}>
                            <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
                              <Typography variant="caption" color="text.secondary">
                                {key.replace('_', ' ').toUpperCase()}
                              </Typography>
                              <Typography variant="body1">
                                {value}
                                {key === 'blood_pressure' ? ' mmHg' : 
                                 key === 'temperature' ? ' °C' :
                                 key === 'pulse_rate' ? ' bpm' :
                                 key === 'spo2' ? ' %' :
                                 key === 'weight' ? ' kg' :
                                 key === 'height' ? ' cm' : ''}
                              </Typography>
                            </Paper>
                          </Grid>
                        ) : <Grid item xs={6} sm={4} md={2}>
                          <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                              {key.replace('_', ' ').toUpperCase()}
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                              N/A
                            </Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Grid>

                  {/* Other sections - update their spacing */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ mb: 0, mt: 0, color: 'primary.main' }}> {/* Added mt: 1, reduced mb: 2 to mb: 1 */}
                      Complaints
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Complaint</TableCell>
                            <TableCell>Severity</TableCell>
                            <TableCell>Duration</TableCell>
                            <TableCell>Frequency</TableCell>
                            <TableCell>Notes</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {prescription.complaints && prescription.complaints.length > 0 ? (
                            prescription.complaints.map((complaint, idx) => (
                              <TableRow key={idx}>
                                <TableCell>{complaint.name}</TableCell>
                                <TableCell>{complaint.severity}</TableCell>
                                <TableCell>{complaint.duration}</TableCell>
                                <TableCell>{complaint.frequency}</TableCell>
                                <TableCell>{complaint.notes}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={5} align="center">No complaints recorded</TableCell>
                            </TableRow>
                          )}
              </TableBody>
            </Table>
          </TableContainer>
                  </Grid>

                  {/* Apply similar spacing updates to other sections */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ mb: 0, mt: 0, color: 'primary.main' }}>
                      Diagnosis
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Diagnosis</TableCell>
                            <TableCell>Duration</TableCell>
                            <TableCell>Notes</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {prescription.diagnosis && prescription.diagnosis.length > 0 ? (
                            prescription.diagnosis.map((diag, idx) => (
                              <TableRow key={idx}>
                                <TableCell>{diag.name}</TableCell>
                                <TableCell>{diag.duration}</TableCell>
                                <TableCell>{diag.notes}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={3} align="center">No diagnosis recorded</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ mb: 0, mt: 0, color: 'primary.main' }}>
                      Medications
            </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Medicine</TableCell>
                            <TableCell>Dosage</TableCell>
                            <TableCell>When</TableCell>
                            <TableCell>Frequency</TableCell>
                            <TableCell>Duration</TableCell>
                            <TableCell>Notes</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {prescription.medicines && prescription.medicines.length > 0 ? (
                            prescription.medicines.map((med, idx) => (
                              <TableRow key={idx}>
                                <TableCell>{med.medicine || med.name}</TableCell>
                                <TableCell>{med.dose}</TableCell>
                                <TableCell>{med.timing || med.when}</TableCell>
                                <TableCell>{med.frequency}</TableCell>
                                <TableCell>{med.duration}</TableCell>
                                <TableCell>{med.notes}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={6} align="center">No medications prescribed</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ mb: 1, mt: 0, color: 'primary.main' }}>
                      Tests
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 1 }}>
                      {prescription.tests && prescription.tests[0]?.testlist?.length > 0 ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {prescription.tests[0].testlist.map((test, idx) => (
                            <Chip
                              key={idx}
                              label={test}
                              variant="outlined"
                              size="small"
                            />
                          ))}
                        </Box>
                      ) : (
                        <Typography color="text.secondary">No tests prescribed</Typography>
                      )}
                    </Paper>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ mb: 1, mt: 0, color: 'primary.main' }}>
                      Advice
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography>
                        {prescription.advice?.[0]?.advice || 'No specific advice provided'}
                      </Typography>
                    </Paper>
                  </Grid>

                  {/* Attachments Section */}
                  {prescription.attachments && prescription.attachments.length > 0 && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" sx={{ mb: 1, mt: 0, color: 'primary.main' }}>
                        Attachments
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {prescription.attachments.map((attachment, idx) => (
                          <Chip
                            key={idx}
                            label={attachment.file_name}
                            onClick={() => handleOpenAttachment({
                              ...attachment,
                              url: getFullAttachmentUrl(attachment.file),
                              type: attachment.file_type?.includes('pdf') ? 'pdf' : 
                                    attachment.file_type?.includes('image') ? 'image' : 'document'
                            })}
                            icon={getAttachmentIcon(
                              attachment.file_type?.includes('pdf') ? 'pdf' : 
                              attachment.file_type?.includes('image') ? 'image' : 'document'
                            )}
                            variant="outlined"
                            sx={{ m: 0.5 }}
                          />
                        ))}
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            ))}
          </Box>
        ) : (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">No past prescriptions found</Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default ConsultationPage; 