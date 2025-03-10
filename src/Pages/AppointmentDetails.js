import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Paper,
  Typography,
  Box,
  Grid,
  Chip,
  Button,
  TextField,
  Divider,
  IconButton,
  Avatar,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import {
  CalendarToday,
  AccessTime,
  Person,
  LocalHospital,
  AttachMoney,
  EventAvailable,
  Notes,
  Edit,
  ArrowBack,
  Assignment,
  MedicalServices,
  CheckCircle,
  Cancel,
  PriorityHigh,
  LocationOn,
  Phone,
  SupervisorAccount,
  Payment,
  ReceiptLong,
  Print,
  Close,
} from '@mui/icons-material';
import { Layout } from '../components/Layout';
import { PageHeader } from '../components/common/PageHeader';
import ReportLink from '../components/ReportLink';
import dayjs from 'dayjs';

const AppointmentDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [appointmentInfo, setAppointmentInfo] = useState(null);
  const [patientInfo, setPatientInfo] = useState(null);
  const [isFromPastAppointments, setIsFromPastAppointments] = useState(false);
  const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  
  useEffect(() => {
    // Get data from location state or fetch from API if available
    if (location.state) {
      const { appointmentInfo, patientInfo, fromPastAppointments } = location.state;
      
      // Check if appointmentInfo exists
      if (appointmentInfo) {
        setAppointmentInfo(appointmentInfo);
      } else {
        console.error('No appointment information provided');
      }
      
      // Check if patientInfo exists
      if (patientInfo) {
        setPatientInfo(patientInfo);
      } else {
        console.error('No patient information provided');
        // Create a default patient info object to prevent errors
        setPatientInfo({
          id: 'unknown',
          name: 'Unknown Patient',
          age: '',
          gender: '',
          phone: '',
          location: '',
          guardianName: '',
          email: '',
        });
      }
      
      setIsFromPastAppointments(fromPastAppointments || false);
      
      console.log('Received appointment data:', appointmentInfo);
      console.log('Received patient data:', patientInfo);
      console.log('From past appointments:', fromPastAppointments);
    } else {
      // If no state is passed, you could fetch appointment data
      console.log('No state data received, would need to fetch appointment details');
      // fetchAppointmentDetails(appointmentId);
    }
  }, [location]);

  // If we don't have appointment data yet, show a loading state
  if (!appointmentInfo) {
    return (
      <Layout>
        <PageHeader title="Appointment Details" breadcrumbs={[
          { text: 'Dashboard', href: '/' },
          { text: 'Appointments', href: '/appointments' },
          { text: 'Appointment Details' }
        ]} />
        <Box sx={{ p: 3, textAlign: 'center' }}>
          Loading appointment details...
        </Box>
      </Layout>
    );
  }

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'pending':
        return 'warning';
      case 'late':
        return 'error';
      default:
        return 'default';
    }
  };

  // Get payment status color
  const getPaymentStatusColor = (paid) => {
    return paid ? 'success' : 'error';
  };

  // Handle back navigation
  const handleBack = () => {
    // Simply navigate back, the state is preserved in sessionStorage
    navigate(-1);
  };

  // Add function to handle opening the prescription modal
  const handleOpenPrescription = () => {
    setSelectedPrescription({
      patientInfo: patientInfo,
      appointmentInfo: appointmentInfo,
      initialData: {
        patientName: patientInfo.name,
        patientId: patientInfo.id,
        patientAge: patientInfo.age,
        patientGender: patientInfo.gender,
        appointmentId: appointmentInfo.id,
        appointmentDate: appointmentInfo.date,
        doctor: appointmentInfo.doctor,
        department: appointmentInfo.department,
        complaints: [{ complaint: appointmentInfo.reason, duration: "2 weeks", severity: "Moderate" }],
        diagnosis: [{ diagnosis: appointmentInfo.reason, notes: "Patient responded well to treatment" }],
        medications: [
          { 
            drug: "Amlodipine", 
            dosage: "5mg", 
            frequency: "Once daily", 
            duration: "30 days",
            timing: "After breakfast",
            notes: "Take regularly"
          }
        ],
        tests: ["Complete Blood Count", "Lipid Profile"],
        advice: "Maintain a healthy diet and exercise regularly",
        followUpDate: dayjs(appointmentInfo.date).add(2, 'week').format('YYYY-MM-DD'),
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
          <div class="doctor-info">${selectedPrescription?.appointmentInfo?.doctor || 'Dr. Smith'}</div>
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
        <p>${selectedPrescription?.initialData?.diagnosis?.[0]?.diagnosis || selectedPrescription?.appointmentInfo?.reason}</p>
        
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
            <p>${selectedPrescription?.appointmentInfo?.doctor || 'Dr. Smith'}</p>
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

  // Add function to handle printing the payment receipt
  const handlePrintPaymentReceipt = () => {
    // Create a new window with the receipt content
    const printWindow = window.open('', '_blank');
    
    // Format the date for the receipt
    const receiptDate = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    // Generate a receipt number
    const receiptNumber = `RCP-${appointmentInfo.id.replace('AP', '')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    
    // Generate the receipt HTML content
    const receiptContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Receipt - ${patientInfo.name}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
          }
          .receipt {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ddd;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #2196f3;
          }
          .clinic-name {
            font-size: 24px;
            font-weight: bold;
            color: #2196f3;
            margin-bottom: 5px;
          }
          .clinic-address {
            font-size: 14px;
            margin-bottom: 5px;
          }
          .receipt-title {
            font-size: 18px;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
            text-transform: uppercase;
          }
          .receipt-details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
          }
          .patient-details, .payment-details {
            flex: 1;
          }
          .detail-row {
            margin-bottom: 8px;
          }
          .label {
            font-weight: bold;
            display: inline-block;
            width: 150px;
          }
          .service-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          .service-table th, .service-table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          .service-table th {
            background-color: #f5f5f5;
          }
          .amount-row {
            text-align: right;
            margin-top: 20px;
            font-weight: bold;
          }
          .footer {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
          }
          .signature {
            margin-top: 60px;
            border-top: 1px solid #ddd;
            padding-top: 5px;
            width: 200px;
            text-align: center;
          }
          .paid-stamp {
            position: relative;
            text-align: center;
            margin: 30px auto;
          }
          .paid-stamp span {
            display: inline-block;
            border: 3px solid #4CAF50;
            color: #4CAF50;
            padding: 10px 20px;
            font-size: 24px;
            font-weight: bold;
            transform: rotate(-15deg);
            border-radius: 5px;
          }
          @media print {
            body {
              margin: 0;
              padding: 15px;
            }
            .receipt {
              border: none;
            }
            button {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <div class="clinic-name">DigiCare Medical Center</div>
            <div class="clinic-address">123 Healthcare Avenue, Medical District</div>
            <div class="clinic-address">Phone: +91 1234567890 | Email: info@digicare.com</div>
          </div>
          
          <div class="receipt-title">Payment Receipt</div>
          
          <div class="receipt-details">
            <div class="patient-details">
              <div class="detail-row"><span class="label">Receipt No:</span> ${receiptNumber}</div>
              <div class="detail-row"><span class="label">Date:</span> ${receiptDate}</div>
              <div class="detail-row"><span class="label">Patient Name:</span> ${patientInfo.name}</div>
              <div class="detail-row"><span class="label">Patient ID:</span> ${patientInfo.id}</div>
            </div>
            <div class="payment-details">
              <div class="detail-row"><span class="label">Appointment ID:</span> ${appointmentInfo.id}</div>
              <div class="detail-row"><span class="label">Appointment Date:</span> ${appointmentInfo.date}</div>
              <div class="detail-row"><span class="label">Payment Method:</span> ${appointmentInfo.paymentMode || 'Cash'}</div>
              <div class="detail-row"><span class="label">Payment Status:</span> ${appointmentInfo.paid ? 'Paid' : 'Unpaid'}</div>
            </div>
          </div>
          
          <table class="service-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Doctor</th>
                <th>Department</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${appointmentInfo.type || 'Consultation'} - ${appointmentInfo.reason || 'General Checkup'}</td>
                <td>${appointmentInfo.doctor || 'Dr. Smith'}</td>
                <td>${appointmentInfo.department || 'General Medicine'}</td>
                <td>₹${appointmentInfo.fees}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="amount-row">
            <div class="detail-row"><span class="label">Subtotal:</span> ₹${appointmentInfo.fees}</div>
            <div class="detail-row"><span class="label">Tax (0%):</span> ₹0</div>
            <div class="detail-row"><span class="label">Total Amount:</span> ₹${appointmentInfo.fees}</div>
          </div>
          
          <div class="paid-stamp">
            <span>PAID</span>
          </div>
          
          <div class="footer">
            <div class="signature">
              Received By
            </div>
            <div class="signature">
              Authorized Signature
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #777;">
            This is a computer-generated receipt and does not require a physical signature.
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Write the content to the new window
    printWindow.document.open();
    printWindow.document.write(receiptContent);
    printWindow.document.close();
    
    // Wait for the content to load and then print
    printWindow.onload = function() {
      printWindow.print();
    };
  };

  return (
    <Layout>
      {/* Page Header with Back Button and Action Buttons */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, flexWrap: 'wrap' }}>
        <IconButton 
          onClick={handleBack} 
          sx={{ mr: 2, color: 'primary.main' }}
        >
          <ArrowBack />
        </IconButton>
      <PageHeader 
          title="Appointment Details" 
        breadcrumbs={[
            { text: 'Dashboard', href: '/' },
            { text: isFromPastAppointments ? 'Past Appointments' : 'Appointments', href: isFromPastAppointments ? '/past-appointments' : '/appointments' },
            { text: 'Appointment Details' }
          ]}
        />
      
        {/* Action Buttons moved to the top */}
        <Box sx={{ display: 'flex', gap: 2, ml: 'auto', mt: { xs: 2, md: 0 } }}>
          {!isFromPastAppointments && appointmentInfo.status !== 'completed' && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<MedicalServices />}
              onClick={() => navigate('/consultation', { 
                state: { patientInfo, appointmentInfo } 
              })}
            >
              Start Consultation
            </Button>
          )}
          
          {!isFromPastAppointments && (
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => {/* Handle edit */}}
            >
              Edit Appointment
            </Button>
          )}
          
          {!isFromPastAppointments && appointmentInfo.status !== 'cancelled' && 
           appointmentInfo.status !== 'completed' && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<Cancel />}
              onClick={() => {/* Handle cancel */}}
            >
              Cancel Appointment
            </Button>
          )}
        </Box>
      </Box>

      {/* Consolidated Card with All Information */}
      <Paper 
        elevation={0} 
                  sx={{ 
          mb: { xs: 4, md: 6 },
          bgcolor: 'white', 
          borderRadius: 2,
          border: '1px solid #f0f0f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            p: 2,
            color: 'primary.main', 
            fontWeight: 'medium',
            borderBottom: '1px solid #f0f0f0',
            backgroundColor: '#fcfcfc'
                  }}
                >
          Appointment Information
        </Typography>
        
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {/* Patient Information Section - Moved to top */}
          {patientInfo && (
            <>
              <Typography variant="h6" color="primary.main" sx={{ mb: 2 }}>
                Patient Information
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar 
                  sx={{ width: 56, height: 56, bgcolor: 'primary.main', mr: 2 }}
                >
                  {patientInfo.name ? patientInfo.name.charAt(0) : 'P'}
                </Avatar>
                <Box>
                  <Typography variant="h6">{patientInfo.name || 'Unknown Patient'}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    ID: {patientInfo.id || 'Unknown'} | {patientInfo.age ? `${patientInfo.age} years` : 'Age not available'}, {patientInfo.gender || 'Gender not specified'}
                  </Typography>
                </Box>
                <Button 
                  variant="outlined" 
                  startIcon={<Person />} 
                  sx={{ ml: 'auto' }}
                  onClick={() => navigate('/patient-info', { 
                    state: { patientInfo, appointmentInfo } 
                  })}
                >
                  View Complete Profile
                </Button>
              </Box>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={patientInfo.phone || "Not available"}
                    InputProps={{ readOnly: true }}
                    variant="outlined"
                    size="small"
                    margin="normal"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={patientInfo.email || "Not available"}
                    InputProps={{ readOnly: true }}
                    variant="outlined"
                    size="small"
                    margin="normal"
                  />
                </Grid>
                
                {patientInfo.location && (
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      label="Location"
                      value={patientInfo.location}
                      InputProps={{ readOnly: true }}
                      variant="outlined"
                      size="small"
                      margin="normal"
                    />
                  </Grid>
                )}
                
                {patientInfo.guardianName && (
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      label="Guardian Name"
                      value={patientInfo.guardianName}
                      InputProps={{ readOnly: true }}
                      variant="outlined"
                      size="small"
                      margin="normal"
                    />
                  </Grid>
                )}
              </Grid>
            </>
          )}
          
          <Divider sx={{ my: 3 }} />
          
          {/* Appointment Details - Moved before Appointment Status */}
          <Typography variant="h6" color="primary.main" sx={{ mb: 2 }}>
            Appointment Details
          </Typography>
          
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Date
                </Typography>
                <Typography variant="body1">
                  {appointmentInfo.date || 'Not scheduled'}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Time
                </Typography>
                <Typography variant="body1">
                  {appointmentInfo.time || 'Time not set'}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Appointment Type
                </Typography>
                <Typography variant="body1">
                  {appointmentInfo.type || 'General Checkup'}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Reason for Visit
                </Typography>
                <Typography variant="body1">
                  {appointmentInfo.reason || 'Not specified'}
                </Typography>
              </Box>
              
              {appointmentInfo.doctor && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Doctor
                  </Typography>
                  <Typography variant="body1">
                    {appointmentInfo.doctor}
                  </Typography>
                </Box>
              )}
              
              {/* Add View Prescription button here for past appointments */}
              {isFromPastAppointments && appointmentInfo.status?.toLowerCase() === 'completed' && (
                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Assignment />}
                    onClick={handleOpenPrescription}
                    size="medium"
                  >
                    View Prescription
                  </Button>
                </Box>
              )}
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              {appointmentInfo.fees > 0 && (
                <>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Amount
                    </Typography>
                    <Typography variant="body1">
                      ₹{appointmentInfo.fees}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Payment Method
                    </Typography>
                    <Typography variant="body1">
                      {appointmentInfo.paymentMode || 'Not specified'}
                    </Typography>
                  </Box>
                  
                  {/* Add Print Receipt Button */}
                  {appointmentInfo.paid && (
                    <Box sx={{ mt: 3 }}>
                      <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<Print />}
                        onClick={handlePrintPaymentReceipt}
                        size="medium"
                      >
                        Print Receipt
                      </Button>
                    </Box>
                  )}
                </>
              )}
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 3 }} />
          
          {/* Appointment Status Information */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" color="primary.main" sx={{ mb: 2 }}>
              Appointment Status
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Appointment ID
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  #{appointmentInfo.id}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                <Typography 
                  variant="body1" 
                  fontWeight="medium"
                  sx={{ 
                    color: appointmentInfo.status?.toLowerCase() === 'completed' ? 'success.main' : 
                           appointmentInfo.status?.toLowerCase() === 'cancelled' ? 'error.main' : 
                           appointmentInfo.status?.toLowerCase() === 'pending' ? 'warning.main' : 'text.primary'
                  }}
                >
                  {appointmentInfo.status || 'Pending'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Payment Status
                </Typography>
                <Typography 
                  variant="body1" 
                  fontWeight="medium"
                  sx={{ color: appointmentInfo.paid ? 'success.main' : 'error.main' }}
                >
                  {appointmentInfo.paid ? 'Paid' : 'Unpaid'}
                </Typography>
              </Grid>
              
              {appointmentInfo.token && (
                <Grid item xs={12} sm={6} md={4}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Token Number
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    #{appointmentInfo.token}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Box>
          
          {appointmentInfo.notes && (
            <Box sx={{ mt: 2, p: 2, backgroundColor: '#f9f9f9', borderRadius: 1 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Additional Notes
              </Typography>
              <Typography variant="body1">{appointmentInfo.notes}</Typography>
            </Box>
          )}
        </Box>
      </Paper>
      
      {/* Back button at the bottom */}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBack />} 
          onClick={handleBack}
        >
          Back to {isFromPastAppointments ? 'Past Appointments' : 'Appointments'}
        </Button>
      </Box>

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
                  {selectedPrescription.initialData.diagnosis?.[0]?.diagnosis || selectedPrescription.appointmentInfo.reason}
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
    </Layout>
  );
};

export default AppointmentDetails;