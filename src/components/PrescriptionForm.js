import React, { useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Chip,
  TextField,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Autocomplete,
} from '@mui/material';
import {
  CalendarToday,
  RemoveCircleOutline,
} from '@mui/icons-material';

// This component will be a reusable prescription form that can be used in multiple places
const PrescriptionForm = ({
  patient,
  appointment,
  vitals,
  initialComplaints = [{ complaint: '', severity: '', duration: '', isEditing: false }],
  initialDiagnoses = [{ diagnosis: '', duration: '', isEditing: false }],
  initialMedications = [{ medicine: '', dose: '', timing: '', frequency: '', duration: '', isEditing: false }],
  initialInstructions = '',
  readOnly = false,
  onFormChange = () => {},
}) => {
  // State for form data
  const [complaints, setComplaints] = useState(initialComplaints);
  const [diagnoses, setDiagnoses] = useState(initialDiagnoses);
  const [medications, setMedications] = useState(initialMedications);
  const [instructions, setInstructions] = useState(initialInstructions);

  // Dummy data for suggestions
  const commonComplaints = [
    "Headache", "Fever", "Cough", "Body Pain", "Stomach Pain", 
    "Vomiting", "Diarrhea", "Chest Pain", "Breathlessness", "Dizziness"
  ];

  const severityLevels = [
    "Mild", "Moderate", "Severe", "Very Severe", "Unbearable"
  ];

  const durationSuggestions = [
    "1 day", "2-3 days", "1 week", "2 weeks", "1 month", "3 months", "6 months", "> 1 year"
  ];

  const commonDiagnosisList = [
    "Hypertension", "Diabetes Mellitus Type 2", "Upper Respiratory Tract Infection",
    "Gastroenteritis", "Migraine", "Bronchial Asthma", "Anxiety Disorder",
    "Osteoarthritis", "Urinary Tract Infection", "Dyslipidemia"
  ];

  const diagnosisDurationSuggestions = [
    "Acute", "Chronic", "1 month", "6 months", "1 year", "> 2 years", "Lifelong"
  ];

  const medicineSuggestions = [
    "Paracetamol", "Amoxicillin", "Omeprazole", "Cetirizine", "Atorvastatin", "Metformin"
  ];

  const medicineDosePatterns = [
    "1-0-1", "1-1-1", "1-0-0", "0-0-1", "1/2-0-1/2", "1/2-0-0", "2-2-2", "SOS"
  ];

  const medicineTimings = [
    "Before breakfast", "After breakfast", "Before lunch", "After lunch",
    "Before dinner", "After dinner", "Empty stomach", "With meals", "SOS"
  ];

  const medicineFrequency = [
    "Daily", "Alternate days", "Weekly once", "Weekly twice", "Monthly once",
    "Every 6 hours", "Every 8 hours", "SOS"
  ];

  const medicineDuration = [
    "1 day", "3 days", "5 days", "1 week", "2 weeks", "1 month", "3 months", "6 months", "Lifelong"
  ];

  // Update parent component when form data changes
  const updateParent = () => {
    onFormChange({
      complaints,
      diagnoses,
      medications,
      instructions
    });
  };

  // Handlers for prescription form
  const handleComplaintChange = (index, field, value) => {
    const updatedComplaints = [...complaints];
    updatedComplaints[index][field] = value;
    
    if (value) {
      const currentRow = updatedComplaints[index];
      
      // Auto-focus next field
      if (field === 'complaint' && value) {
        const nextElement = document.querySelector(`#severity-${index}`);
        if (nextElement) nextElement.focus();
      } else if (field === 'severity' && value) {
        const nextElement = document.querySelector(`#duration-${index}`);
        if (nextElement) nextElement.focus();
      }

      // Check if all fields in current row are filled
      if (currentRow.complaint && currentRow.severity && currentRow.duration) {
        // Close current row
        updatedComplaints[index].isEditing = false;
        setComplaints(updatedComplaints);
        
        // Add new row if this is the last row
        if (index === complaints.length - 1) {
          setTimeout(() => {
            addNewComplaintRow();
          }, 100);
        }
      }
    }
    
    setComplaints(updatedComplaints);
    updateParent();
  };

  const addNewComplaintRow = () => {
    const newComplaints = [...complaints, { complaint: '', severity: '', duration: '', isEditing: true }];
    setComplaints(newComplaints);
    updateParent();
  };

  const handleDiagnosisChange = (index, field, value) => {
    const updatedDiagnoses = [...diagnoses];
    updatedDiagnoses[index][field] = value;
    
    if (value) {
      const currentRow = updatedDiagnoses[index];
      
      // Auto-focus next field
      if (field === 'diagnosis' && value) {
        const nextElement = document.querySelector(`#diagnosis-duration-${index}`);
        if (nextElement) nextElement.focus();
      }

      // Check if all fields in current row are filled
      if (currentRow.diagnosis && currentRow.duration) {
        updatedDiagnoses[index].isEditing = false;
        setDiagnoses(updatedDiagnoses);
        
        if (index === diagnoses.length - 1) {
          setTimeout(() => {
            addNewDiagnosisRow();
          }, 100);
        }
      }
    }
    
    setDiagnoses(updatedDiagnoses);
    updateParent();
  };

  const addNewDiagnosisRow = () => {
    const newDiagnoses = [...diagnoses, { diagnosis: '', duration: '', isEditing: true }];
    setDiagnoses(newDiagnoses);
    updateParent();
  };

  const handleMedicationChange = (index, field, value) => {
    const updatedMedications = [...medications];
    updatedMedications[index][field] = value;
    
    if (value) {
      const currentRow = updatedMedications[index];
      
      // Auto-focus next field logic
      const fields = ['medicine', 'dose', 'timing', 'frequency', 'duration'];
      const currentFieldIndex = fields.indexOf(field);
      if (currentFieldIndex < fields.length - 1) {
        const nextField = fields[currentFieldIndex + 1];
        const nextElement = document.querySelector(`#med-${nextField}-${index}`);
        if (nextElement) nextElement.focus();
      }

      // Check if all fields are filled
      if (currentRow.medicine && currentRow.dose && currentRow.timing && 
          currentRow.frequency && currentRow.duration) {
        updatedMedications[index].isEditing = false;
        setMedications(updatedMedications);
        
        if (index === medications.length - 1) {
          setTimeout(() => {
            addNewMedicationRow();
          }, 100);
        }
      }
    }
    
    setMedications(updatedMedications);
    updateParent();
  };

  const addNewMedicationRow = () => {
    const newMedications = [...medications, { 
      medicine: '', dose: '', timing: '', frequency: '', duration: '', isEditing: true 
    }];
    setMedications(newMedications);
    updateParent();
  };

  const handleClickAway = (index, setterFunction, array) => {
    const updated = [...array];
    updated[index].isEditing = false;
    setterFunction(updated);
    updateParent();
  };

  return (
    <Paper 
      sx={{ 
        p: { xs: 2, md: 4 }, 
        mb: 3, 
        bgcolor: '#f8f9fa',
        '& .MuiPaper-root': {
          mb: { xs: 4, md: 6 },
          p: { xs: 3, md: 4 },
        },
        '& .section-header': {
          mb: { xs: 3, md: 4 },
        },
        '& .MuiTableContainer-root': {
          mt: 3,
        },
        '& .MuiTableRow-root': {
          '& .MuiTableCell-root': {
            py: 2,
            px: { xs: 1, md: 2 },
          },
        },
        '& .MuiTableHead-root': {
          '& .MuiTableRow-root': {
            '& .MuiTableCell-root': {
              fontWeight: 'bold',
              fontSize: '0.95rem',
              py: 2,
              backgroundColor: '#f5f5f5',
            },
          },
        },
      }}
    >
      {/* Title section with increased spacing */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        mb: { xs: 4, md: 5 },
        borderBottom: '1px solid #eaeaea',
        pb: 2
      }}>
        <Typography variant="h5" fontWeight="medium">Prescription</Typography>
        {appointment && (
          <Box>
            <Chip 
              label={appointment.status} 
              color="primary" 
              size="small" 
              sx={{ mr: 1 }}
            />
            <Chip 
              icon={<CalendarToday fontSize="small" />} 
              label={`${appointment.date}, ${appointment.time}`} 
              size="small" 
              variant="outlined"
            />
          </Box>
        )}
      </Box>

      {/* Patient Details */}
      {patient && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Patient Name"
              value={patient.name || ''}
              size="small"
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={4} sm={1.5}>
            <TextField
              fullWidth
              label="Age"
              value={patient.age || ''}
              size="small"
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={4} sm={1.5}>
            <TextField
              fullWidth
              label="Gender"
              value={patient.gender || ''}
              size="small"
              InputProps={{ readOnly: true }}
            />
          </Grid>
          {vitals && (
            <>
              <Grid item xs={4} sm={1.5}>
                <TextField
                  fullWidth
                  label="Weight"
                  value={vitals.weight || ''}
                  size="small"
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={6} sm={2}>
                <TextField
                  fullWidth
                  label="BP"
                  value={vitals.bp || ''}
                  size="small"
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={6} sm={2}>
                <TextField
                  fullWidth
                  label="Temperature"
                  value={vitals.temp || ''}
                  size="small"
                  InputProps={{ readOnly: true }}
                />
              </Grid>
            </>
          )}
        </Grid>
      )}

      {/* Complaints Table */}
      <Typography variant="h6" className="section-header" sx={{ mt: 3, mb: 1 }}>
        Complaints
      </Typography>
      
      <TableContainer component={Paper} className="compact-table" sx={{ mb: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Complaint</TableCell>
              <TableCell>Severity</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell width="50px"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {complaints.map((row, index) => (
              <TableRow 
                key={index}
                onClick={(e) => {
                  if (readOnly) return;
                  e.stopPropagation();
                  const updatedComplaints = complaints.map((c, i) => ({
                    ...c,
                    isEditing: i === index
                  }));
                  setComplaints(updatedComplaints);
                }}
              >
                <TableCell>
                  <Autocomplete
                    id={`complaint-${index}`}
                    freeSolo
                    size="small"
                    options={commonComplaints}
                    value={row.complaint}
                    open={!readOnly && row.isEditing}
                    onClose={() => handleClickAway(index, setComplaints, complaints)}
                    onChange={(_, value) => handleComplaintChange(index, 'complaint', value)}
                    disabled={readOnly}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="standard"
                        placeholder="Enter complaint"
                        onFocus={(e) => {
                          if (readOnly) return;
                          e.stopPropagation();
                          const updatedComplaints = [...complaints];
                          updatedComplaints[index].isEditing = true;
                          setComplaints(updatedComplaints);
                        }}
                        InputProps={{
                          ...params.InputProps,
                          readOnly: readOnly
                        }}
                      />
                    )}
                  />
                </TableCell>
                <TableCell>
                  <Autocomplete
                    id={`severity-${index}`}
                    freeSolo
                    size="small"
                    options={severityLevels}
                    value={row.severity}
                    open={!readOnly && row.isEditing}
                    onClose={() => handleClickAway(index, setComplaints, complaints)}
                    onChange={(_, value) => handleComplaintChange(index, 'severity', value)}
                    disabled={readOnly}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="standard"
                        placeholder="Select severity"
                        InputProps={{
                          ...params.InputProps,
                          readOnly: readOnly
                        }}
                      />
                    )}
                  />
                </TableCell>
                <TableCell>
                  <Autocomplete
                    id={`duration-${index}`}
                    freeSolo
                    size="small"
                    options={durationSuggestions}
                    value={row.duration}
                    open={!readOnly && row.isEditing}
                    onClose={() => handleClickAway(index, setComplaints, complaints)}
                    onChange={(_, value) => handleComplaintChange(index, 'duration', value)}
                    disabled={readOnly}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="standard"
                        placeholder="Select duration"
                        InputProps={{
                          ...params.InputProps,
                          readOnly: readOnly
                        }}
                      />
                    )}
                  />
                </TableCell>
                <TableCell>
                  {!readOnly && complaints.length > 1 && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        const updatedComplaints = complaints.filter((_, i) => i !== index);
                        setComplaints(updatedComplaints);
                        updateParent();
                      }}
                    >
                      <RemoveCircleOutline fontSize="small" color="error" />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Diagnosis Table */}
      <Typography variant="h6" className="section-header" sx={{ mt: 3, mb: 1 }}>
        Diagnosis
      </Typography>
      
      <TableContainer component={Paper} className="compact-table" sx={{ mb: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Diagnosis</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell width="50px"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {diagnoses.map((row, index) => (
              <TableRow 
                key={index}
                onClick={(e) => {
                  if (readOnly) return;
                  e.stopPropagation();
                  const updatedDiagnoses = diagnoses.map((d, i) => ({
                    ...d,
                    isEditing: i === index
                  }));
                  setDiagnoses(updatedDiagnoses);
                }}
              >
                <TableCell>
                  <Autocomplete
                    id={`diagnosis-${index}`}
                    freeSolo
                    size="small"
                    options={commonDiagnosisList}
                    value={row.diagnosis}
                    open={!readOnly && row.isEditing}
                    onClose={() => handleClickAway(index, setDiagnoses, diagnoses)}
                    onChange={(_, value) => handleDiagnosisChange(index, 'diagnosis', value)}
                    disabled={readOnly}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="standard"
                        placeholder="Enter diagnosis"
                        onFocus={(e) => {
                          if (readOnly) return;
                          e.stopPropagation();
                          const updatedDiagnoses = [...diagnoses];
                          updatedDiagnoses[index].isEditing = true;
                          setDiagnoses(updatedDiagnoses);
                        }}
                        InputProps={{
                          ...params.InputProps,
                          readOnly: readOnly
                        }}
                      />
                    )}
                  />
                </TableCell>
                <TableCell>
                  <Autocomplete
                    id={`diagnosis-duration-${index}`}
                    freeSolo
                    size="small"
                    options={diagnosisDurationSuggestions}
                    value={row.duration}
                    open={!readOnly && row.isEditing}
                    onClose={() => handleClickAway(index, setDiagnoses, diagnoses)}
                    onChange={(_, value) => handleDiagnosisChange(index, 'duration', value)}
                    disabled={readOnly}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="standard"
                        placeholder="Select duration"
                        InputProps={{
                          ...params.InputProps,
                          readOnly: readOnly
                        }}
                      />
                    )}
                  />
                </TableCell>
                <TableCell>
                  {!readOnly && diagnoses.length > 1 && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDiagnoses(diagnoses.filter((_, i) => i !== index));
                        updateParent();
                      }}
                    >
                      <RemoveCircleOutline fontSize="small" color="error" />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Medications Table */}
      <Typography variant="h6" className="section-header" sx={{ mt: 3, mb: 1 }}>
        Medications
      </Typography>
      
      <TableContainer component={Paper} className="compact-table" sx={{ mb: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Medicine</TableCell>
              <TableCell>Dose</TableCell>
              <TableCell>Timing</TableCell>
              <TableCell>Frequency</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell width="50px"></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {medications.map((row, index) => (
              <TableRow 
                key={index}
                onClick={(e) => {
                  if (readOnly) return;
                  e.stopPropagation();
                  const updatedMedications = medications.map((m, i) => ({
                    ...m,
                    isEditing: i === index
                  }));
                  setMedications(updatedMedications);
                }}
              >
                <TableCell>
                  <Autocomplete
                    id={`med-medicine-${index}`}
                    freeSolo
                    size="small"
                    options={medicineSuggestions}
                    value={row.medicine}
                    open={!readOnly && row.isEditing}
                    onClose={() => handleClickAway(index, setMedications, medications)}
                    onChange={(_, value) => handleMedicationChange(index, 'medicine', value)}
                    disabled={readOnly}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="standard"
                        placeholder="Enter medicine"
                        onFocus={(e) => {
                          if (readOnly) return;
                          e.stopPropagation();
                          const updatedMedications = [...medications];
                          updatedMedications[index].isEditing = true;
                          setMedications(updatedMedications);
                        }}
                        InputProps={{
                          ...params.InputProps,
                          readOnly: readOnly
                        }}
                      />
                    )}
                  />
                </TableCell>
                <TableCell>
                  <Autocomplete
                    id={`med-dose-${index}`}
                    freeSolo
                    size="small"
                    options={medicineDosePatterns}
                    value={row.dose}
                    open={!readOnly && row.isEditing}
                    onClose={() => handleClickAway(index, setMedications, medications)}
                    onChange={(_, value) => handleMedicationChange(index, 'dose', value)}
                    disabled={readOnly}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="standard"
                        placeholder="Select dose"
                        InputProps={{
                          ...params.InputProps,
                          readOnly: readOnly
                        }}
                      />
                    )}
                  />
                </TableCell>
                <TableCell>
                  <Autocomplete
                    id={`med-timing-${index}`}
                    freeSolo
                    size="small"
                    options={medicineTimings}
                    value={row.timing}
                    open={!readOnly && row.isEditing}
                    onClose={() => handleClickAway(index, setMedications, medications)}
                    onChange={(_, value) => handleMedicationChange(index, 'timing', value)}
                    disabled={readOnly}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="standard"
                        placeholder="Select timing"
                        InputProps={{
                          ...params.InputProps,
                          readOnly: readOnly
                        }}
                      />
                    )}
                  />
                </TableCell>
                <TableCell>
                  <Autocomplete
                    id={`med-frequency-${index}`}
                    freeSolo
                    size="small"
                    options={medicineFrequency}
                    value={row.frequency}
                    open={!readOnly && row.isEditing}
                    onClose={() => handleClickAway(index, setMedications, medications)}
                    onChange={(_, value) => handleMedicationChange(index, 'frequency', value)}
                    disabled={readOnly}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="standard"
                        placeholder="Select frequency"
                        InputProps={{
                          ...params.InputProps,
                          readOnly: readOnly
                        }}
                      />
                    )}
                  />
                </TableCell>
                <TableCell>
                  <Autocomplete
                    id={`med-duration-${index}`}
                    freeSolo
                    size="small"
                    options={medicineDuration}
                    value={row.duration}
                    open={!readOnly && row.isEditing}
                    onClose={() => handleClickAway(index, setMedications, medications)}
                    onChange={(_, value) => handleMedicationChange(index, 'duration', value)}
                    disabled={readOnly}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="standard"
                        placeholder="Select duration"
                        InputProps={{
                          ...params.InputProps,
                          readOnly: readOnly
                        }}
                      />
                    )}
                  />
                </TableCell>
                <TableCell>
                  {!readOnly && medications.length > 1 && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMedications(medications.filter((_, i) => i !== index));
                        updateParent();
                      }}
                    >
                      <RemoveCircleOutline fontSize="small" color="error" />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Instructions */}
      <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
        Special Instructions
      </Typography>
      <TextField
        fullWidth
        multiline
        rows={2}
        placeholder="Enter any special instructions for the patient"
        value={instructions}
        onChange={(e) => {
          setInstructions(e.target.value);
          updateParent();
        }}
        InputProps={{
          readOnly: readOnly
        }}
      />
    </Paper>
  );
};

export default PrescriptionForm; 