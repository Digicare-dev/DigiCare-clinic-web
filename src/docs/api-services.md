# API Services Documentation

This document details the API services used in the DigiCare Reception Dashboard for data fetching and manipulation.

## Overview

The application communicates with backend services through a set of API service modules located in the `src/services/` directory. These services abstract the API calls and provide a clean interface for data operations.

## Core API Service

### axiosInstance

Located in `src/utils/axiosInstance.js`, this is the configured Axios instance used by all service modules:

- Automatically includes authentication headers
- Handles common error scenarios
- Manages token refresh when needed

```jsx
// Example of using axiosInstance directly
import axiosInstance from '../utils/axiosInstance';

async function fetchCustomData() {
  try {
    const response = await axiosInstance.get('/custom-endpoint');
    return response.data;
  } catch (error) {
    console.error('Error fetching custom data:', error);
    throw error;
  }
}
```

## Service Modules

### authService.js

Handles authentication-related API calls:

```jsx
import { login, refreshToken, changePassword } from '../services/authService';

// Login user
await login(username, password);

// Refresh the access token
await refreshToken(refreshToken);

// Change user password
await changePassword(currentPassword, newPassword);
```

### apiService.js

General-purpose API methods for CRUD operations:

```jsx
import { getData, postData, putData, deleteData } from '../services/apiService';

// GET request
const data = await getData('endpoint');

// POST request
const response = await postData('endpoint', payloadData);

// PUT request
await putData('endpoint', updateData);

// DELETE request
await deleteData('endpoint/id');
```

### Specific Service Modules

#### api.js (Appointment Management)

Contains functions specific to appointment management:

```jsx
import { 
  fetchAppointments, 
  addAppointment, 
  updateAppointmentDetails, 
  removeAppointment 
} from '../services/api';

// Get appointments
const appointments = await fetchAppointments(cabinId, selectedSlot);

// Add a new appointment
await addAppointment(appointmentData);

// Update appointment details
await updateAppointmentDetails(updatedData);

// Remove an appointment
await removeAppointment(appointmentId);
```

## Real-time Updates

The application uses Server-Sent Events (SSE) for real-time updates:

```jsx
// Example of setting up an SSE connection
const setupSSE = (cabinId, slotDate) => {
  const formattedDate = encodeURIComponent(slotDate);
  const sseUrl = `${API_BASE_URL}/doctorinfo/queue_updates/${cabinId}/${formattedDate}`;
  
  const eventSource = new EventSource(sseUrl, { withCredentials: true });
  
  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    // Handle the real-time update
  };
  
  return eventSource;
};
```

## Error Handling

All service modules include error handling with consistent patterns:

1. Try/catch blocks for all async calls
2. Detailed error logging
3. Error response formatting
4. Authentication error handling

Example error handling pattern:

```jsx
try {
  const response = await axiosInstance.get('/endpoint');
  return response.data;
} catch (error) {
  if (error.response) {
    // The request was made and the server responded with an error status
    console.error('Server error:', error.response.data);
    throw error.response.data;
  } else if (error.request) {
    // The request was made but no response was received
    console.error('Network error:', error.request);
    throw new Error('Network error, please check your connection');
  } else {
    // Something else caused the error
    console.error('Error:', error.message);
    throw new Error('An unexpected error occurred');
  }
}
```

## Environment Configuration

API endpoints are configured based on environment variables:

- `REACT_APP_API_BASE_URL` - The base URL for API requests
- Different environments (development, staging, production) can use different API endpoints

## Best Practices

1. **Abstraction**: Keep API call details within service modules
2. **Reusability**: Create generic functions for common operations
3. **Error Handling**: Always include comprehensive error handling
4. **Mock Data**: Use mock data for development and testing
5. **Caching**: Implement appropriate caching strategies for frequently accessed data 