import React, { useState, useRef, useEffect } from "react";
import {
  TextField,
  Button,
  Typography,
  Container,
  Grid,
  IconButton,
  InputAdornment,
  Autocomplete,
  Divider,
  Select,
  MenuItem,
} from "@mui/material";
import { Close, AddCircleOutline } from "@mui/icons-material";

// Dummy data
const commonSymptoms = [
  "Fever",
  "Cough",
  "Headache",
  "Fatigue",
  "Nausea",
  "Dizziness",
  "Chest Pain",
  "Shortness of Breath",
];

const commonDiagnoses = [
  "Hypertension",
  "Type 2 Diabetes",
  "Asthma",
  "Migraine",
  "GERD",
  "Osteoarthritis",
];

const dummyMedicines = [
  { label: "Paracetamol", doses: ["500mg", "650mg"], frequency: ["OD", "BD"] },
  { label: "Amoxicillin", doses: ["250mg", "500mg"], frequency: ["TDS"] },
  { label: "Omeprazole", doses: ["20mg", "40mg"], frequency: ["OD"] },
];

const durationOptions = ["3 days", "5 days", "1 week", "2 weeks", "1 month"];

const PrescriptionTablePage = () => {
  // State for all tables
  const [complaints, setComplaints] = useState([
    { complaint: "", frequency: "", duration: "" },
  ]);
  const [diagnoses, setDiagnoses] = useState([{ diagnosis: "", duration: "" }]);
  const [medications, setMedications] = useState([
    { medicine: "", dose: "", when: "", frequency: "", duration: "", note: "" },
  ]);

  const [patientDetails, setPatientDetails] = useState({
    name: "",
    age: "",
    gender: "Male",
  });

  // State for vitals
  const [vitals, setVitals] = useState({
    height: "",
    weight: "",
    pulse: "",
    bp: "",
    temperature: "",
  });

  // Track which row is being edited in each section
  const [activeRow, setActiveRow] = useState({
    section: null,
    index: null,
  });

  // Update handlers
  const handlePatientDetailChange = (field, value) => {
    setPatientDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleVitalChange = (field, value) => {
    setVitals((prev) => ({ ...prev, [field]: value }));
  };

  // Handler to set active row
  const handleRowClick = (section, index) => {
    setActiveRow({ section, index });
  };

  // Handlers for complaints table
  const handleComplaintChange = (index, field, value) => {
    const updated = [...complaints];
    updated[index][field] = value;

    if (index === complaints.length - 1 && value) {
      updated.push({ complaint: "", frequency: "", duration: "" });
      setActiveRow({ section: "complaints", index: index + 1 });
    }

    setComplaints(updated);
  };

  const removeComplaint = (index) => {
    setComplaints(complaints.filter((_, i) => i !== index));
    if (activeRow.section === "complaints" && activeRow.index === index) {
      setActiveRow({ section: null, index: null });
    }
  };

  // Handlers for diagnosis table
  const handleDiagnosisChange = (index, field, value) => {
    const updated = [...diagnoses];
    updated[index][field] = value;

    if (index === diagnoses.length - 1 && value) {
      updated.push({ diagnosis: "", duration: "" });
    }

    setDiagnoses(updated);
  };

  const removeDiagnosis = (index) => {
    setDiagnoses(diagnoses.filter((_, i) => i !== index));
    if (activeRow.section === "diagnoses" && activeRow.index === index) {
      setActiveRow({ section: null, index: null });
    }
  };

  // Handlers for medications table
  const handleMedicationChange = (index, field, value) => {
    const updated = [...medications];
    updated[index][field] = value;

    if (index === medications.length - 1 && value) {
      updated.push({
        medicine: "",
        dose: "",
        when: "",
        frequency: "",
        duration: "",
        note: "",
      });
    }

    setMedications(updated);
  };

  const removeMedication = (index) => {
    setMedications(medications.filter((_, i) => i !== index));
    if (activeRow.section === "medications" && activeRow.index === index) {
      setActiveRow({ section: null, index: null });
    }
  };

  // Click outside handler to close dropdowns
  const pageRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (pageRef.current && !pageRef.current.contains(event.target)) {
        setActiveRow({ section: null, index: null });
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <Container className="prescription-container" ref={pageRef}>
      <Typography variant="h4" gutterBottom className="header" sx={{ 
        color: '#1e40af',
        marginBottom: '2rem !important',
        textAlign: 'center',
        fontWeight: '600',
        position: 'relative',
        paddingBottom: '0.75rem',
        '&:after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80px',
          height: '3px',
          backgroundColor: '#2563eb',
          borderRadius: '2px'
        }
      }}>
        Medical Prescription
      </Typography>

      {/* Patient Details Section */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Patient Name"
            value={patientDetails.name}
            onChange={(e) => handlePatientDetailChange("name", e.target.value)}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <TextField
            fullWidth
            label="Age"
            type="number"
            value={patientDetails.age}
            onChange={(e) => handlePatientDetailChange("age", e.target.value)}
            InputProps={{
              endAdornment: <InputAdornment position="end">yrs</InputAdornment>,
            }}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <Select
            fullWidth
            value={patientDetails.gender}
            onChange={(e) =>
              handlePatientDetailChange("gender", e.target.value)
            }
            label="Gender"
          >
            <MenuItem value="Male">Male</MenuItem>
            <MenuItem value="Female">Female</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </Select>
        </Grid>
      </Grid>

      {/* Vitals Section */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={2}>
          <TextField
            fullWidth
            label="Height"
            value={vitals.height}
            onChange={(e) => handleVitalChange("height", e.target.value)}
            InputProps={{
              endAdornment: <InputAdornment position="end">cm</InputAdornment>,
            }}
          />
        </Grid>
        <Grid item xs={6} sm={2}>
          <TextField
            fullWidth
            label="Weight"
            value={vitals.weight}
            onChange={(e) => handleVitalChange("weight", e.target.value)}
            InputProps={{
              endAdornment: <InputAdornment position="end">kg</InputAdornment>,
            }}
          />
        </Grid>
        <Grid item xs={6} sm={2}>
          <TextField
            fullWidth
            label="Pulse"
            type="number"
            value={vitals.pulse}
            onChange={(e) => handleVitalChange("pulse", e.target.value)}
            InputProps={{
              endAdornment: <InputAdornment position="end">bpm</InputAdornment>,
            }}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <TextField
            fullWidth
            label="Blood Pressure"
            value={vitals.bp}
            onChange={(e) => handleVitalChange("bp", e.target.value)}
            placeholder="120/80"
          />
        </Grid>
        <Grid item xs={6} sm={2}>
          <TextField
            fullWidth
            label="Temperature"
            value={vitals.temperature}
            onChange={(e) => handleVitalChange("temperature", e.target.value)}
            InputProps={{
              endAdornment: <InputAdornment position="end">°C</InputAdornment>,
            }}
          />
        </Grid>
      </Grid>

      <Divider sx={{ mb: 4 }} />

      {/* Complaints Table */}
      <div className="table-section">
        <Typography variant="h6" gutterBottom>
          Complaints
        </Typography>
        <Grid container spacing={1} className="table-header">
          <Grid item xs={5}>
            Complaint
          </Grid>
          <Grid item xs={3}>
            Frequency
          </Grid>
          <Grid item xs={3}>
            Duration
          </Grid>
          <Grid item xs={1}></Grid>
        </Grid>

        {complaints.map((row, index) => {
          const isActive =
            activeRow.section === "complaints" && activeRow.index === index;

          return (
            <Grid
              container
              spacing={1}
              key={index}
              alignItems="center"
              className={`table-row ${isActive ? "active-row" : ""}`}
              onClick={(e) => {
                if (e.target.tagName !== "INPUT") {
                  handleRowClick("complaints", index);
                }
              }}
            >
              <Grid item xs={5}>
                <Autocomplete
                  freeSolo
                  open={isActive}
                  options={commonSymptoms}
                  value={row.complaint}
                  onMouseDown={(e) => e.stopPropagation()}
                  onChange={(e, newValue) => {
                    handleComplaintChange(index, "complaint", newValue || "");
                    handleRowClick("complaints", index);
                  }}
                  onInputChange={(e, newInputValue) =>
                    handleComplaintChange(index, "complaint", newInputValue)
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="standard"
                      placeholder="Enter complaint"
                      onFocus={(e) => {
                        // Changed from onClick to onFocus
                        e.stopPropagation();
                        handleRowClick("complaints", index);
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  variant="standard"
                  value={row.frequency}
                  onChange={(e) =>
                    handleComplaintChange(index, "frequency", e.target.value)
                  }
                  placeholder="e.g., Daily"
                  onFocus={() => handleRowClick("complaints", index)}
                  onClick={(e) => e.stopPropagation()}
                />
              </Grid>
              <Grid item xs={3}>
                <Autocomplete
                  freeSolo
                  open={isActive}
                  options={durationOptions}
                  value={row.duration}
                  onMouseDown={(e) => e.stopPropagation()}
                  onChange={(e, newValue) =>
                    handleComplaintChange(index, "duration", newValue || "")
                  }
                  onInputChange={(e, newInputValue) =>
                    handleComplaintChange(index, "duration", newInputValue)
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="standard"
                      placeholder="Select duration"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick("complaints", index);
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={1}>
                {index !== complaints.length - 1 && (
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      removeComplaint(index);
                    }}
                    size="small"
                  >
                    <Close fontSize="small" />
                  </IconButton>
                )}
              </Grid>
            </Grid>
          );
        })}
      </div>

      <Divider sx={{ my: 3 }} />

      {/* Diagnosis Table */}
      <div className="table-section">
        <Typography variant="h6" gutterBottom>
          Diagnosis
        </Typography>
        <Grid container spacing={1} className="table-header">
          <Grid item xs={8}>
            Diagnosis
          </Grid>
          <Grid item xs={3}>
            Duration
          </Grid>
          <Grid item xs={1}></Grid>
        </Grid>

        {diagnoses.map((row, index) => {
          const isActive =
            activeRow.section === "diagnoses" && activeRow.index === index;

          return (
            <Grid
              container
              spacing={1}
              key={index}
              alignItems="center"
              className={`table-row ${isActive ? "active-row" : ""}`}
              onClick={(e) => {
                if (e.target.tagName !== "INPUT") {
                  handleRowClick("diagnoses", index);
                }
              }}
            >
              <Grid item xs={8}>
                <Autocomplete
                  freeSolo
                  open={isActive}
                  options={commonDiagnoses}
                  value={row.diagnosis}
                  onMouseDown={(e) => e.stopPropagation()}
                  onChange={(e, newValue) => {
                    handleDiagnosisChange(index, "diagnosis", newValue || "");
                    handleRowClick("diagnoses", index);
                  }}
                  onInputChange={(e, newInputValue) =>
                    handleDiagnosisChange(index, "diagnosis", newInputValue)
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="standard"
                      placeholder="Enter diagnosis"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick("diagnoses", index);
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={3}>
                <Autocomplete
                  freeSolo
                  open={isActive}
                  options={durationOptions}
                  value={row.duration}
                  onMouseDown={(e) => e.stopPropagation()}
                  onChange={(e, newValue) =>
                    handleDiagnosisChange(index, "duration", newValue || "")
                  }
                  onInputChange={(e, newInputValue) =>
                    handleDiagnosisChange(index, "duration", newInputValue)
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="standard"
                      placeholder="Select duration"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick("diagnoses", index);
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={1}>
                {index !== diagnoses.length - 1 && (
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      removeDiagnosis(index);
                    }}
                    size="small"
                  >
                    <Close fontSize="small" />
                  </IconButton>
                )}
              </Grid>
            </Grid>
          );
        })}
      </div>

      <Divider sx={{ my: 3 }} />

      {/* Medications Table */}
      <div className="table-section">
        <Typography variant="h6" gutterBottom>
          Medications
        </Typography>
        <Grid container spacing={1} className="table-header">
          <Grid item xs={3}>
            Medicine
          </Grid>
          <Grid item xs={2}>
            Dose
          </Grid>
          <Grid item xs={2}>
            When
          </Grid>
          <Grid item xs={2}>
            Frequency
          </Grid>
          <Grid item xs={2}>
            Duration
          </Grid>
          <Grid item xs={1}></Grid>
        </Grid>

        {medications.map((row, index) => {
          const isActive =
            activeRow.section === "medications" && activeRow.index === index;

          return (
            <Grid
              container
              spacing={1}
              key={index}
              alignItems="center"
              className={`table-row ${isActive ? "active-row" : ""}`}
              onClick={(e) => {
                if (e.target.tagName !== "INPUT") {
                  handleRowClick("medications", index);
                }
              }}
            >
              <Grid item xs={3}>
                <Autocomplete
                  freeSolo
                  open={isActive}
                  options={dummyMedicines.map((medicine) => medicine.label)}
                  value={row.medicine}
                  onMouseDown={(e) => e.stopPropagation()}
                  onChange={(e, newValue) => {
                    const selectedMedicine = dummyMedicines.find(
                      (m) => m.label === newValue
                    );
                    handleMedicationChange(index, "medicine", newValue || "");
                    if (selectedMedicine) {
                      handleMedicationChange(
                        index,
                        "dose",
                        selectedMedicine.doses[0]
                      );
                      handleMedicationChange(
                        index,
                        "frequency",
                        selectedMedicine.frequency[0]
                      );
                    }
                    handleRowClick("medications", index);
                  }}
                  onInputChange={(e, newInputValue) =>
                    handleMedicationChange(index, "medicine", newInputValue)
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="standard"
                      placeholder="Enter medicine"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick("medications", index);
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  fullWidth
                  variant="standard"
                  value={row.dose}
                  onChange={(e) =>
                    handleMedicationChange(index, "dose", e.target.value)
                  }
                  placeholder="Dose"
                  onFocus={() => handleRowClick("medications", index)}
                  onClick={(e) => e.stopPropagation()}
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  fullWidth
                  variant="standard"
                  value={row.when}
                  onChange={(e) =>
                    handleMedicationChange(index, "when", e.target.value)
                  }
                  placeholder="When"
                  onFocus={() => handleRowClick("medications", index)}
                  onClick={(e) => e.stopPropagation()}
                />
              </Grid>
              <Grid item xs={2}>
                <Autocomplete
                  freeSolo
                  open={isActive}
                  options={["OD", "BD", "TDS", "QID"]}
                  value={row.frequency}
                  onMouseDown={(e) => e.stopPropagation()}
                  onChange={(e, newValue) =>
                    handleMedicationChange(index, "frequency", newValue || "")
                  }
                  onInputChange={(e, newInputValue) =>
                    handleMedicationChange(index, "frequency", newInputValue)
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="standard"
                      placeholder="Frequency"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick("medications", index);
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={2}>
                <Autocomplete
                  freeSolo
                  open={isActive}
                  options={durationOptions}
                  value={row.duration}
                  onMouseDown={(e) => e.stopPropagation()}
                  onChange={(e, newValue) =>
                    handleMedicationChange(index, "duration", newValue || "")
                  }
                  onInputChange={(e, newInputValue) =>
                    handleMedicationChange(index, "duration", newInputValue)
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="standard"
                      placeholder="Duration"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick("medications", index);
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={1}>
                {index !== medications.length - 1 && (
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      removeMedication(index);
                    }}
                    size="small"
                  >
                    <Close fontSize="small" />
                  </IconButton>
                )}
              </Grid>
            </Grid>
          );
        })}
      </div>

      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 4 }}
        onClick={() => console.log({ complaints, diagnoses, medications })}
      >
        Save Prescription
      </Button>
    </Container>
  );
};

export default PrescriptionTablePage;

// CSS
const styles = `
.prescription-container {
  padding: 2rem;
  background-color: #fff;
}

.header {
  color: #1976d2;
  margin-bottom: 2rem !important;
  text-align: center;
}

.table-section {
  margin-bottom: 2rem;
}

.table-header {
  font-weight: 600;
  color: #555;
  border-bottom: 2px solid #eee;
  padding-bottom: 0.5rem;
  margin-bottom: 0.5rem;
}

.table-row {
  padding: 0.5rem 0;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  transition: background-color 0.2s;
}

.table-row:hover {
  background-color: #f9f9f9;
}

.active-row {
  background-color: #f0f7ff;
}

.MuiAutocomplete-root {
  min-width: 120px;
}

.MuiInput-root {
  padding: 0 !important;
}

.MuiInput-input {
  font-size: 0.9rem !important;
  padding: 4px 0 !important;
}
`;

// Inject styles
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);
