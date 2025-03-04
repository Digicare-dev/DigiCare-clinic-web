import React, { useState, useRef } from "react";
import {
  TextField,
  Button,
  Typography,
  Container,
  Grid,
  FormControlLabel,
  Checkbox,
  Divider,
  IconButton,
  InputAdornment,
  Autocomplete,
  MenuItem,
} from "@mui/material";
import { AddCircleOutline, RemoveCircleOutline } from "@mui/icons-material";
import "./PrescriptionPage.css";

import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

// Dummy databases
const dummyDrugs = [
  {
    label: "Paracetamol",
    dosage: [
      "500mg (1 tablet whole)",
      "650mg (1 tablet whole)",
      "250mg (1/2 tablet)",
    ],
    frequency: ["OD (Morning)", "BD (Morning & Night)", "TDS (After meals)"],
    duration: ["3 days", "5 days", "7 days"],
    type: "Analgesic",
  },
  {
    label: "Amoxicillin",
    dosage: [
      "250mg (1 capsule)",
      "500mg (1 capsule)",
      "125mg/5ml (10ml syrup)",
    ],
    frequency: ["BD (Every 12 hours)", "TDS (Every 8 hours)"],
    duration: ["5 days", "7 days", "10 days"],
    type: "Antibiotic",
  },
  {
    label: "Omeprazole",
    dosage: ["20mg (1 capsule before food)", "40mg (1 capsule before food)"],
    frequency: ["OD (Before breakfast)"],
    duration: ["14 days", "30 days"],
    type: "PPI",
  },
  {
    label: "Cetirizine",
    dosage: ["10mg (1 tablet)", "5mg (1/2 tablet)"],
    frequency: ["OD (Night)"],
    duration: ["5 days", "7 days"],
    type: "Antihistamine",
  },
  {
    label: "Atorvastatin",
    dosage: [
      "10mg (1 tablet night)",
      "20mg (1 tablet night)",
      "40mg (1 tablet night)",
    ],
    frequency: ["OD (Night)"],
    duration: ["30 days"],
    type: "Statin",
  },
  {
    label: "Metformin",
    dosage: [
      "500mg (1 tablet with food)",
      "850mg (1 tablet with food)",
      "1000mg (1 tablet with food)",
    ],
    frequency: ["BD (With meals)"],
    duration: ["30 days"],
    type: "Antidiabetic",
  },
];

const dummyTests = [
  "Complete Blood Count (CBC) with ESR",
  "Comprehensive Metabolic Panel (CMP)",
  "Lipid Profile (Cholesterol, Triglycerides)",
  "Thyroid Function Test (T3, T4, TSH)",
  "Liver Function Test (ALT, AST, Bilirubin)",
  "Renal Function Test (Creatinine, BUN)",
  "HbA1c (Glycated Hemoglobin)",
  "Urine Routine & Microscopy",
  "ECG (12 Lead Electrocardiogram)",
  "Chest X-ray PA View",
  "Ultrasound Abdomen & Pelvis",
  "MRI Brain (With Contrast)",
  "Vitamin D3 (25-OH) Levels",
  "Serum Iron Studies (Ferritin, TIBC)",
  "CRP (C-Reactive Protein) Quantitative",
  "D-Dimer (Quantitative)",
  "PSA (Prostate Specific Antigen)",
  "PAP Smear (Cervical Cytology)",
  "Stool Routine & Occult Blood",
];

const frequencyOptions = [
  "OD (Once daily)",
  "BD (Twice daily)",
  "TDS (Thrice daily)",
  "QID (Four times daily)",
  "SOS (As needed)",
  "Weekly",
  "Monthly",
];

const durationOptions = [
  "3 days",
  "5 days",
  "7 days",
  "10 days",
  "14 days",
  "21 days",
  "30 days",
  "45 days",
  "60 days",
];

const PrescriptionPage = () => {
  const [prescription, setPrescription] = useState({
    patientName: "",
    age: "",
    gender: "",
    weight: "",
    diagnosis: "",
    medications: [
      {
        drug: "",
        dosage: "",
        frequency: "",
        duration: "",
        withFood: false,
      },
    ],
    tests: [],
    instructions: "",
    followUp: "",
    signature: "",
  });

  const RxSymbol = () => (
    <span style={{ color: "#1976d2", fontSize: "2.5rem", marginRight: "10px" }}>
      ℞
    </span>
  );

  const [newTest, setNewTest] = useState("");
  const [signature, setSignature] = useState("");
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPrescription({ ...prescription, [name]: value });
  };

  const handleDrugChange = (value, index) => {
    const meds = [...prescription.medications];
    meds[index].drug = value?.label || value;

    const selectedDrug = dummyDrugs.find((d) => d.label === value?.label);
    if (selectedDrug) {
      meds[index].dosage = selectedDrug.dosage[0];
      meds[index].frequency = selectedDrug.frequency[0];
      meds[index].duration = selectedDrug.duration[0];
    }

    setPrescription({ ...prescription, medications: meds });
  };

  const handleMedicationChange = (field, value, index) => {
    const meds = [...prescription.medications];
    meds[index][field] = value;
    setPrescription({ ...prescription, medications: meds });
  };

  const handleCheckboxChange = (index) => {
    const meds = [...prescription.medications];
    meds[index].withFood = !meds[index].withFood;
    setPrescription({ ...prescription, medications: meds });
  };

  const addMedication = () => {
    setPrescription({
      ...prescription,
      medications: [
        ...prescription.medications,
        { drug: "", dosage: "", frequency: "", duration: "", withFood: false },
      ],
    });
  };

  const removeMedication = (index) => {
    const meds = [...prescription.medications];
    meds.splice(index, 1);
    setPrescription({ ...prescription, medications: meds });
  };

  const handleTestChange = (value) => {
    setNewTest(value);
  };

  const addTest = () => {
    if (newTest) {
      setPrescription({
        ...prescription,
        tests: [...prescription.tests, newTest],
      });
      setNewTest("");
    }
  };

  const removeTest = (index) => {
    const updatedTests = [...prescription.tests];
    updatedTests.splice(index, 1);
    setPrescription({ ...prescription, tests: updatedTests });
  };

  // Signature Drawing Logic
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();

    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();

    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const endDrawing = () => {
    const canvas = canvasRef.current;
    setSignature(canvas.toDataURL());
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignature("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ ...prescription, signature });
  };

  const handleFollowUpChange = (date) => {
    setPrescription({
      ...prescription,
      followUp: date ? date.format("YYYY-MM-DD") : "",
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container className="prescription-container">
        <Typography variant="h4" gutterBottom className="header">
          <RxSymbol />
          Digital Prescription
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Patient Details */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Patient Name"
                name="patientName"
                value={prescription.patientName}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={4} sm={2}>
              <TextField
                fullWidth
                label="Age"
                name="age"
                type="number"
                value={prescription.age}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={4} sm={2}>
              <TextField
                fullWidth
                label="Gender"
                name="gender"
                select
                value={prescription.gender}
                onChange={handleChange}
                required
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={4} sm={2}>
              <TextField
                fullWidth
                label="Weight (kg)"
                name="weight"
                type="number"
                value={prescription.weight}
                onChange={handleChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">kg</InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Diagnosis */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Diagnosis"
                name="diagnosis"
                value={prescription.diagnosis}
                onChange={handleChange}
                multiline
                rows={3}
                required
              />
            </Grid>

            {/* Medications */}
            <Grid item xs={12}>
              <Divider />
              <Typography variant="h6" gutterBottom className="section-header">
                Medications
              </Typography>

              {prescription.medications.map((med, index) => (
                <Grid
                  container
                  spacing={2}
                  key={index}
                  alignItems="center"
                  sx={{ marginBottom: "16px" }}
                >
                  <Grid item xs={12} sm={3}>
                    <Autocomplete
                      freeSolo
                      options={dummyDrugs}
                      getOptionLabel={(option) => option.label || option}
                      value={med.drug}
                      onChange={(e, value) => handleDrugChange(value, index)}
                      renderInput={(params) => (
                        <TextField {...params} label="Drug Name" required />
                      )}
                    />
                  </Grid>
                  <Grid item xs={6} sm={2}>
                    <Autocomplete
                      freeSolo
                      options={
                        dummyDrugs.find((d) => d.label === med.drug)?.dosage ||
                        []
                      }
                      value={med.dosage}
                      onChange={(e, value) =>
                        handleMedicationChange("dosage", value, index)
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Dosage & Instructions"
                          required
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={6} sm={2}>
                    <Autocomplete
                      freeSolo
                      options={frequencyOptions}
                      value={med.frequency}
                      onChange={(e, value) =>
                        handleMedicationChange("frequency", value, index)
                      }
                      renderInput={(params) => (
                        <TextField {...params} label="Frequency" required />
                      )}
                    />
                  </Grid>
                  <Grid item xs={6} sm={2}>
                    <Autocomplete
                      freeSolo
                      options={durationOptions}
                      value={med.duration}
                      onChange={(e, value) =>
                        handleMedicationChange("duration", value, index)
                      }
                      renderInput={(params) => (
                        <TextField {...params} label="Duration" required />
                      )}
                    />
                  </Grid>
                  <Grid item xs={6} sm={2}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={med.withFood}
                          onChange={() => handleCheckboxChange(index)}
                          color="primary"
                        />
                      }
                      label="With Food"
                    />
                  </Grid>
                  <Grid item xs={12} sm={1}>
                    {index > 0 && (
                      <IconButton onClick={() => removeMedication(index)}>
                        <RemoveCircleOutline color="error" />
                      </IconButton>
                    )}
                  </Grid>
                </Grid>
              ))}

              <Button
                variant="outlined"
                startIcon={<AddCircleOutline />}
                onClick={addMedication}
                className="add-button"
              >
                Add Medication
              </Button>
            </Grid>

            {/* Tests Section */}
            <Grid item xs={12}>
              <Divider />
              <Typography variant="h6" gutterBottom className="section-header">
                Recommended Tests
              </Typography>

              <Grid container spacing={2} alignItems="center">
                <Grid item xs={9} sm={4}>
                  <Autocomplete
                    freeSolo
                    options={dummyTests}
                    value={newTest}
                    onChange={(e, value) => handleTestChange(value)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Search Tests"
                        placeholder="Type to search tests..."
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={3} sm={2}>
                  <Button variant="outlined" onClick={addTest} fullWidth>
                    Add Test
                  </Button>
                </Grid>

                {prescription.tests.map((test, index) => (
                  <Grid item xs={12} key={index}>
                    <div className="test-item">
                      {test}
                      <IconButton
                        size="small"
                        onClick={() => removeTest(index)}
                        className="remove-test-btn"
                      >
                        <RemoveCircleOutline fontSize="small" />
                      </IconButton>
                    </div>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Additional Information */}
            <Grid item xs={12}>
              <Divider />
              <Typography variant="h6" gutterBottom className="section-header">
                Additional Information
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Special Instructions"
                    name="instructions"
                    value={prescription.instructions}
                    onChange={handleChange}
                    multiline
                    rows={3}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Follow-up Date"
                    value={
                      prescription.followUp
                        ? dayjs(prescription.followUp)
                        : null
                    }
                    onChange={handleFollowUpChange}
                    minDate={dayjs()}
                    format="DD/MM/YYYY"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: false,
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Signature */}
            <Grid item xs={12}>
              <Divider />
              <Typography variant="h6" gutterBottom className="section-header">
                Doctor's Signature
              </Typography>

              <div className="signature-container">
                <canvas
                  ref={canvasRef}
                  width={500}
                  height={150}
                  className="signature-canvas"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={endDrawing}
                  onMouseLeave={endDrawing}
                />
                <div className="signature-buttons">
                  <Button variant="outlined" onClick={clearSignature}>
                    Clear Signature
                  </Button>
                </div>
              </div>
            </Grid>

            {/* Submit */}
            <Grid item xs={12} className="action-buttons">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
              >
                Save Prescription
              </Button>
              <Button
                variant="outlined"
                color="primary"
                size="large"
                onClick={() => window.print()}
              >
                Print
              </Button>
            </Grid>
          </Grid>
        </form>
      </Container>
    </LocalizationProvider>
  );
};

export default PrescriptionPage;
