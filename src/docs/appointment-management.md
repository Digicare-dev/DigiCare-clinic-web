# Appointment Management System

This document explains how the appointment management system works in DigiCare Reception Dashboard.

## Overview

The appointment management system allows users to create, update, view, and delete patient appointments. It includes features for:

- Creating new appointments
- Managing appointment queues
- Tracking appointment status
- Rescheduling appointments
- Canceling appointments

## Key Components

### AppointmentTable.js

Located in `src/Pages/AppointmentTable.js`, this is the main component for viewing and managing appointments:

- Displays appointments in a table format
- Provides filtering and searching
- Enables CRUD operations on appointments
- Shows payment and check-in status

### AppointmentForm.js

Located in `src/components/AppointmentForm.js`, this component handles appointment creation and editing:

- Modal-based form for appointment data
- Validates appointment information
- Handles patient lookup and creation
- Auto-assigns token numbers

### AppointmentDetails.js

Located in `src/Pages/AppointmentDetails.js`, this component shows detailed information about a specific appointment:

- Displays all appointment data
- Provides actions for appointment management
- Shows patient history and related information

### AppointmentFormContext.js

Located in `src/context/AppointmentFormContext.js`, this context manages the global state of the appointment form:

- Controls visibility of the appointment form
- Stores form data across components
- Manages form submission state

## Appointment Data Structure

The core appointment data structure includes:

```javascript
{
  appointment_id: "string", // Unique identifier
  token: number,            // Queue position
  firstName: "string",      // Patient first name
  lastName: "string",       // Patient last name
  checkin: boolean,         // Check-in status
  paid: boolean,            // Payment status
  mode: "cash" | "online",  // Payment mode
  fees_paid: number,        // Amount paid
  status: "pending" | "in_progress" | "done_checkup" | "cancelled", // Appointment status
  disease: "string",        // Initial complaint/disease
  age: number,              // Patient age
  phone_number: "string",   // Contact number
  location: "string",       // Patient address
  sex: "male" | "female" | "other", // Patient gender
  guardian: "string",       // Guardian name
  appointment_type: "New" | "Follow-up" // Appointment type
}
```

## Appointment Workflow

### Creating Appointments

1. User clicks "Add Appointment" button
2. AppointmentForm modal opens
3. User enters patient details
4. On submit, `addAppointment` API is called
5. On success, appointment is added to the table

```jsx
// Example of creating an appointment
const handleAddAppointment = async (appointmentData) => {
  try {
    const newAppointment = await addAppointment({
      ...appointmentData,
      cabinId,
      selectedSlot
    });
    showSuccessSnackbar("Appointment added successfully");
    // Handle success, e.g., refresh appointment list
  } catch (error) {
    showErrorSnackbar("Failed to add appointment");
  }
};
```

### Managing Queue

The appointment queue is managed through:

1. **Token Assignment**: Each appointment gets a unique token number
2. **Queue Position**: Appointments are ordered by token number
3. **Status Updates**: Status changes reflect patient progress
4. **Real-time Updates**: SSE (Server-Sent Events) provide real-time queue updates

```jsx
// Example of handling the next patient
const handleNextPatient = async () => {
  try {
    const response = await fetchCurrentPosition(cabinId, selectedSlot);
    const nextPosition = response.current_number + 1;
    await updateCurrentPosition(cabinId, selectedSlot, nextPosition);
    // Update UI
  } catch (error) {
    showErrorSnackbar("Failed to update queue position");
  }
};
```

## Mobile vs Desktop

The system provides different UIs for mobile and desktop:

- **Desktop**: Full-featured table with expanded information
- **Mobile**: Simplified list with essential information

Mobile-specific components:
- `MobileAppointmentTable.js`: Mobile-optimized appointment list
- `AddAppointmentMobile.js`: Mobile appointment creation form

## Appointment-Related API Calls

Key API functions for appointment management:

```jsx
// Fetch appointments
const appointments = await fetchAppointments(cabinId, selectedSlot);

// Add appointment
const newAppointment = await addAppointment(appointmentData);

// Update appointment
await updateAppointmentDetails(updatedData);

// Cancel appointment
await cancelAppointment(appointmentId, reason);

// Get appointment details
const details = await getAppointmentDetails(appointmentId);
```

## Real-time Updates

The appointment system uses SSE (Server-Sent Events) for real-time updates:

1. An EventSource connection is established in App.js
2. Updates to appointments are received in real-time
3. UI is automatically updated when data changes

```jsx
// Example SSE implementation
const sseUrl = `${API_BASE_URL}/doctorinfo/queue_updates/${cabinId}/${encodedDate}`;
const eventSource = new EventSource(sseUrl, { withCredentials: true });

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.queue) {
    // Update appointments
  } else if (data.cabinslot) {
    // Update current position
  }
};
```

## Best Practices

1. **Error Handling**: Always handle API errors gracefully
2. **Validation**: Validate all appointment data before submission
3. **Optimistic Updates**: Update UI optimistically before API confirmation
4. **Responsive Design**: Ensure appointment components work on all devices
5. **Real-time Sync**: Use real-time updates to keep data synchronized 