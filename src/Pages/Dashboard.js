import React, { useState, useEffect, useContext } from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Box,
  LinearProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { Layout } from '../components/Layout';
import { PageHeader } from '../components/common/PageHeader';
import { AuthContext } from '../context/AuthContext';
import {
  PeopleAlt,
  AccessTime,
  CheckCircle,
  Warning,
  TrendingUp,
  Refresh,
} from '@mui/icons-material';
import { SlotSelector } from '../components/SlotSelector';
import QueueContainer from '../components/QueueContainer';
import { getCabinInfo } from "../utils/dateUtils";

const StatCard = ({ title, value, icon, color, subtitle }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography color="textSecondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" component="div" sx={{ mb: 1 }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="textSecondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box sx={{
          backgroundColor: `${color}15`,
          p: 1,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard = ({ 
  patients,
  setPatients,
  currentPosition,
  loading,
  handleNextPatient,
  handleLatePatient,
  shufflePosition,
  fetchPatientsData
}) => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalPatients: 0,
    waitingPatients: 0,
    completedCheckups: 0,
    averageWaitTime: 0,
  });
  const [recentPatients, setRecentPatients] = useState([]);
  const [currentCabinSlot, setCurrentCabinSlot] = useState(null);
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    // Fetch appointments data on component mount
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    const { cabinId, selectedSlot } = getCabinInfo(user);
    if (!cabinId) return;

    const newSlots = selectedSlot ? [selectedSlot] : [];
    setSlots(newSlots);

    if (fetchPatientsData) {
      fetchPatientsData();
    }
  }, [fetchPatientsData]);

  useEffect(() => {
    if (patients.length > 0) {
      setStats({
        totalPatients: patients.length,
        waitingPatients: patients.filter(p => p.status === 'pending').length,
        completedCheckups: patients.filter(p => p.status === 'done_checkup').length,
        averageWaitTime: 25
      });
    }
  }, [patients]);

  return (
    <Layout>
      {/* Commented out dashboard header and slot selector
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <PageHeader title="Dashboard" />
        <SlotSelector 
          slots={slots}
          currentSlot={currentCabinSlot}
          onSlotChange={setCurrentCabinSlot}
        />
      </Box>
      */}

      {loading ? (
        <LinearProgress />
      ) : (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Patients"
                value={stats.totalPatients}
                icon={<PeopleAlt sx={{ color: '#1976d2' }} />}
                color="#1976d2"
                subtitle="Today's total appointments"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Waiting"
                value={stats.waitingPatients}
                icon={<AccessTime sx={{ color: '#ff9800' }} />}
                color="#ff9800"
                subtitle="Patients in queue"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Completed"
                value={stats.completedCheckups}
                icon={<CheckCircle sx={{ color: '#4caf50' }} />}
                color="#4caf50"
                subtitle="Checkups completed"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Avg. Wait Time"
                value={`${stats.averageWaitTime} min`}
                icon={<TrendingUp sx={{ color: '#f44336' }} />}
                color="#f44336"
                subtitle="Current average wait"
              />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} md={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Queue Manager
                  </Typography>
                  <div style={{ 
                    height: 'calc(100vh - 250px)',
                    marginTop: '20px',
                    paddingBottom: '30px'
                  }}>
                    <QueueContainer 
                      loading={loading}
                      patients={patients}
                      setPatients={setPatients}
                      currentPosition={currentPosition}
                      handleNextPatient={handleNextPatient}
                      handleLatePatient={handleLatePatient}
                      shufflePosition={shufflePosition}
                    />
                  </div>
                </CardContent>
              </Card>
            </Grid>

            {/* Commented out Today's Schedule and Alerts section
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Today's Schedule
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1">Morning Session</Typography>
                      <Typography variant="body2" color="textSecondary">
                        9:00 AM - 1:00 PM
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1">Evening Session</Typography>
                      <Typography variant="body2" color="textSecondary">
                        4:00 PM - 8:00 PM
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Alerts
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#ff9800' }}>
                    <Warning color="inherit" />
                    <Typography variant="body2">
                      5 patients waiting for more than 30 minutes
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            */}
          </Grid>
        </>
      )}
    </Layout>
  );
};

export default Dashboard; 