# Patient Management System

This document explains the patient management functionality in the DigiCare Reception Dashboard.

## Overview

The patient management system allows users to:
- View and edit patient information
- Track patient history
- Manage patient appointments
- View and create prescriptions
- Store and access patient attachments

## Key Components

### PatientInfoPage.js

Located in `src/Pages/PatientInfoPage.js`, this component displays comprehensive patient information:

- Basic patient details
- Appointment history
- Prescription history
- Vitals information
- Attachments and documents

### ConsultationPage.js

Located in `src/Pages/ConsultationPage.js`, this component allows doctors to:

- View patient information during consultation
- Record vitals
- Create and manage prescriptions
- Add notes and remarks

### Patient-related Forms

Several forms are used for patient data management:

- Patient registration form (within appointment creation)
- Vitals entry form
- Prescription creation form

## Patient Data Structure

The core patient data structure includes:

```javascript
{
  patient_id: "string",      // Unique identifier
  firstName: "string",       // Patient first name
  lastName: "string",        // Patient last name
  age: number,               // Patient age
  sex: "male" | "female" | "other", // Patient gender
  guardian: "string",        // Guardian name
  phone_number: "string",    // Contact number
  location: "string",        // Patient address
  created_at: "string",      // Date patient was added to system
  updated_at: "string",      // Date patient info was last updated
  // Additional fields
  medical_history: [...],    // Array of medical history items
  allergies: [...],          // Array of allergies
  current_medication: [...]  // Array of current medications
}
```

## Patient-Related Workflow

### Accessing Patient Information

1. Navigate to PatientInfoPage with patient ID
2. System fetches patient details, appointments, and prescriptions
3. Information is displayed in tabs for easy navigation

```jsx
// Example of fetching patient details
const fetchPatientData = async (patientId) => {
  try {
    setLoading(true);
    const patientDetails = await getPatientDetails(patientId);
    const prescriptions = await getPrescriptions(patientId);
    const pastPrescriptions = await getPastPrescriptions(patientId);
    
    setPatient(patientDetails);
    setPrescriptionData(prescriptions);
    setPastPrescriptions(pastPrescriptions);
  } catch (error) {
    showErrorSnackbar("Failed to fetch patient information");
  } finally {
    setLoading(false);
  }
};
```

### Creating Prescriptions

1. Doctor views patient information
2. Opens prescription form
3. Enters medication details
4. Saves prescription to patient record
5. Can print or share prescription

```jsx
// Example of creating a prescription
const handleSavePrescription = async (prescriptionData) => {
  try {
    setIsSubmitting(true);
    await savePrescription({
      patientId,
      appointmentId,
      medications: prescriptionData.medications,
      instructions: prescriptionData.instructions,
      diagnosis: prescriptionData.diagnosis
    });
    showSuccessSnackbar("Prescription saved successfully");
  } catch (error) {
    showErrorSnackbar("Failed to save prescription");
  } finally {
    setIsSubmitting(false);
  }
};
```

### Managing Vitals

1. Enter patient vitals during consultation
2. System saves vitals to patient record
3. Vitals history can be viewed and tracked

```jsx
// Example of saving vitals
const handleSaveVitals = async (vitalsData) => {
  try {
    setIsSubmitting(true);
    await manageVitals({
      patientId,
      appointmentId,
      ...vitalsData
    });
    showSuccessSnackbar("Vitals saved successfully");
  } catch (error) {
    showErrorSnackbar("Failed to save vitals");
  } finally {
    setIsSubmitting(false);
  }
};
```

### Managing Attachments

1. Upload attachments to patient record
2. View and download attachments
3. Delete attachments if needed

```jsx
// Example of uploading an attachment
const handleUploadAttachment = async (file) => {
  try {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('patientId', patientId);
    
    await uploadAttachment(formData);
    showSuccessSnackbar("Attachment uploaded successfully");
    // Refresh attachments list
    fetchAttachments();
  } catch (error) {
    showErrorSnackbar("Failed to upload attachment");
  } finally {
    setIsUploading(false);
  }
};
```

## Patient Search

The system allows searching for patients by:
- Name
- Phone number
- Patient ID

```jsx
// Example of patient search
const handlePatientSearch = async (searchTerm) => {
  try {
    setIsSearching(true);
    const results = await searchPatients(searchTerm);
    setSearchResults(results);
  } catch (error) {
    showErrorSnackbar("Failed to search patients");
  } finally {
    setIsSearching(false);
  }
};
```

## Patient-Related API Calls

Key API functions for patient management:

```jsx
// Get patient details
const patientDetails = await getPatientDetails(patientId);

// Get patient prescriptions
const prescriptions = await getPrescriptions(patientId);

// Get patient's past prescriptions
const pastPrescriptions = await getPastPrescriptions(patientId);

// Get patient's attachments
const attachments = await getAttachments(patientId);

// Get patient's vitals
const vitals = await getVitals(patientId);

// Save patient's vitals
await manageVitals(vitalsData);

// Save a prescription
await savePrescription(prescriptionData);

// Upload an attachment
await uploadAttachment(formData);

// Delete an attachment
await deleteAttachment(attachmentId);
```

## Best Practices

1. **Data Privacy**: Always handle patient data with appropriate privacy measures
2. **Validation**: Validate all patient data before submission
3. **Comprehensive Records**: Maintain complete, accurate patient records
4. **User Experience**: Design intuitive interfaces for accessing patient information
5. **Information Architecture**: Organize patient information in logical, accessible structures
6. **Performance**: Optimize data loading for large patient records 