import React from "react";
import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  CardContent,
  Chip,
  Avatar,
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useLocation } from "react-router-dom";
// Import additional icons
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PaymentIcon from "@mui/icons-material/Payment";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import AttachmentIcon from "@mui/icons-material/Attachment";
import { PageHeader } from '../components/common/PageHeader';
import { Layout } from '../components/Layout';

const dummyAppointment = {
  id: 1234,
  firstName: "John",
  lastName: "Doe",
  age: 30,
  sex: "Male",
  date: "2023-10-15T10:00:00Z",
  status: "Completed",
  fees_paid: 500,
  mode: "Cash",
  complaints: [
    { complaint: "Fever", severity: "Moderate", duration: "3 days" },
    { complaint: "Headache", severity: "Mild", duration: "2 days" },
  ],
  diagnosis: [
    { diagnosis: "Viral fever", duration: "5 days" },
    { diagnosis: "Migraine", duration: "2 days" },
  ],
  medications: [
    {
      name: "Paracetamol",
      dosage: "500mg",
      frequency: "Twice a day",
      duration: "5 days",
    },
    {
      name: "Ibuprofen",
      dosage: "400mg",
      frequency: "Once a day",
      duration: "3 days",
    },
  ],
  tests: "Complete blood count (CBC), Urine test.",
  attachments: [
    { name: "Blood Test Report.pdf", date: "2023-10-14" },
    { name: "Urine Test Report.pdf", date: "2023-10-14" },
  ],
  vitals: {
    pulse: "72 bpm",
    bp: "120/80 mmHg",
    height: "175 cm",
    weight: "70 kg",
    spo2: "98%",
    sugar: "90 mg/dL",
  },
};


export default function AppointmentDetails() {
  const [activeTab, setActiveTab] = React.useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  

  return (
    <Layout>
      <PageHeader 
        title={`Appointment #${dummyAppointment.id}`}
        breadcrumbs={[
          { text: 'Appointments', href: '/appointments' },
          { text: 'Details', href: '#' }
        ]}
      />
      
      <Box sx={{ bgcolor: "#f5f7fa", minHeight: "100vh" }}>
        <Box sx={{ p: 3, maxWidth: 1200, margin: "0 auto" }}>
          {/* Header Section */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
              startIcon={<ArrowBackIcon />}
              sx={{ mr: 2, borderRadius: 2 }}
            >
              Back
            </Button>
            <Typography variant="h4" sx={{ fontWeight: "bold", flex: 1 }}>
              Appointment #{dummyAppointment.id}
            </Typography>
            <Chip
              label={dummyAppointment.status}
              color={getStatusColor(dummyAppointment.status)}
              sx={{ fontSize: "1rem", py: 1 }}
            />
          </Box>

          {/* Patient Summary Card */}
          <Card sx={{ mb: 3, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Avatar
                  sx={{ 
                    width: 64, 
                    height: 64, 
                    bgcolor: "primary.main",
                    fontSize: "1.5rem",
                    mr: 2 
                  }}
                >
                  {`${dummyAppointment.firstName[0]}${dummyAppointment.lastName[0]}`}
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                    {dummyAppointment.firstName} {dummyAppointment.lastName}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {dummyAppointment.age} years • {dummyAppointment.sex}
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <AccessTimeIcon sx={{ mr: 1, color: "primary.main" }} />
                    <Typography>
                      {new Date(dummyAppointment.date).toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <PaymentIcon sx={{ mr: 1, color: "primary.main" }} />
                    <Typography>
                      ₹{dummyAppointment.fees_paid} ({dummyAppointment.mode})
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Custom styled Tabs */}
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{
              mb: 3,
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                minWidth: 120,
                fontWeight: 500,
                fontSize: '1rem',
              }
            }}
          >
            <Tab label="Details" icon={<LocalHospitalIcon />} iconPosition="start" />
            <Tab label="Prescription" icon={<LocalHospitalIcon />} iconPosition="start" />
            <Tab label="Attachments" icon={<AttachmentIcon />} iconPosition="start" />
          </Tabs>

          {/* Tab Panels */}
          {activeTab === 0 && (
            <Box>
              {/* Vitals Card */}
              <Card sx={{ mb: 3, borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: "bold" }}>
                    Vitals
                  </Typography>
                  <Grid container spacing={3}>
                    {Object.entries(dummyAppointment.vitals).map(([key, value]) => (
                      <Grid item xs={12} sm={6} md={4} key={key}>
                        <Card sx={{ bgcolor: "#f8fafc", p: 2, borderRadius: 2 }}>
                          <Typography color="text.secondary" sx={{ textTransform: "capitalize" }}>
                            {key.replace('_', ' ')}
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: "bold", mt: 1 }}>
                            {value}
                          </Typography>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          )}

          {activeTab === 1 && (
            <Box>
              {/* Complaints, Diagnosis, and Medications sections */}
              {["Complaints", "Diagnosis", "Medications"].map((section) => (
                <Card 
                  key={section}
                  sx={{ 
                    mb: 3, 
                    borderRadius: 2,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: "bold" }}>
                      {section}
                    </Typography>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            {Object.keys(dummyAppointment[section.toLowerCase()][0]).map((header) => (
                              <TableCell 
                                key={header}
                                sx={{ 
                                  fontWeight: "bold",
                                  bgcolor: "#f8fafc",
                                  textTransform: "capitalize"
                                }}
                              >
                                {header.replace('_', ' ')}
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {dummyAppointment[section.toLowerCase()].map((item, index) => (
                            <TableRow key={index}>
                              {Object.values(item).map((value, i) => (
                                <TableCell key={i}>{value}</TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}

          {activeTab === 2 && (
            <Grid container spacing={3}>
              {dummyAppointment.attachments.map((file, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card 
                    sx={{ 
                      borderRadius: 2,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      transition: "transform 0.2s",
                      "&:hover": {
                        transform: "translateY(-4px)"
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                        <AttachmentIcon sx={{ mr: 1, color: "primary.main" }} />
                        <Typography variant="h6" noWrap>{file.name}</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Uploaded: {file.date}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button 
                          variant="contained" 
                          fullWidth
                          sx={{ borderRadius: 2 }}
                        >
                          Preview
                        </Button>
                        <Button 
                          variant="outlined" 
                          fullWidth
                          sx={{ borderRadius: 2 }}
                        >
                          Download
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Box>
    </Layout>
  );
}