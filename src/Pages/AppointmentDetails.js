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
} from '@mui/icons-material';
import { Layout } from '../components/Layout';
import { PageHeader } from '../components/common/PageHeader';

const AppointmentDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [appointmentInfo, setAppointmentInfo] = useState(null);
  const [patientInfo, setPatientInfo] = useState(null);
  const [isFromPastAppointments, setIsFromPastAppointments] = useState(false);
  
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

  return (
    <Layout>
      {/* Page Header with Back Button and Action Buttons */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, flexWrap: 'wrap' }}>
        <IconButton 
          onClick={() => navigate(-1)} 
          sx={{ mr: 2, color: 'primary.main' }}
        >
          <ArrowBack />
        </IconButton>
      <PageHeader 
          title="Appointment Details" 
        breadcrumbs={[
            { text: 'Dashboard', href: '/' },
          { text: 'Appointments', href: '/appointments' },
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
          
          {isFromPastAppointments && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<Assignment />}
              onClick={() => navigate('/prescription', { 
                state: { 
                  patientInfo, 
                  appointmentInfo,
                  fromAppointmentDetails: true 
                } 
              })}
            >
              View Prescription
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
          
          <Divider sx={{ my: 3 }} />
          
          {/* Appointment Details */}
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
                </>
              )}
            </Grid>
          </Grid>
          
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
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
      </Box>
    </Layout>
  );
};

export default AppointmentDetails;