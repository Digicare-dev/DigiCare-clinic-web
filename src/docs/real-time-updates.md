# Real-Time Updates System

This document explains how real-time updates are implemented in the DigiCare Reception Dashboard.

## Overview

The application uses Server-Sent Events (SSE) to receive real-time updates from the server. This enables features like:

- Live queue updates
- Real-time status changes
- Instant notifications
- Automatic UI refreshes

## Implementation

### Server-Sent Events (SSE)

The application uses the `EventSource` API to establish a connection to the server:

```jsx
// Example SSE implementation from App.js
const sseUrl = `${API_BASE_URL}/doctorinfo/queue_updates/${cabinId}/${encodedDate}`;
const eventSource = new EventSource(sseUrl, { withCredentials: true });

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  // Handle different types of updates
  if (data.queue) {
    // Update appointment queue
    updateQueue(data.queue);
  } else if (data.cabinslot) {
    // Update current position
    updatePosition(data.cabinslot.current_number);
  }
};

eventSource.onerror = (error) => {
  console.error("SSE connection error:", error);
  eventSource.close();
  
  // Implement reconnection logic
  setTimeout(() => {
    // Attempt to reconnect
    setupEventSource();
  }, 5000);
};
```

### EventSource Wrapper

To handle the complexities of SSE, a wrapper function is used:

```jsx
// Example wrapper function
const setupSSE = (cabinId, slotDate) => {
  const formattedDate = date
    .toISOString()
    .replace(".000", "")
    .replace("T", " ")
    .replace("Z", "+00:00");
  const encodedDate = encodeURIComponent(formattedDate);
  const sseUrl = `${API_BASE_URL}/doctorinfo/queue_updates/${cabinId}/${encodedDate}`;

  // Close existing connection if any
  if (eventSource) {
    eventSource.close();
  }
  
  // Create new connection
  const newEventSource = new EventSource(sseUrl, { withCredentials: true });
  
  // Set up event handlers
  newEventSource.onmessage = handleSSEMessage;
  newEventSource.onerror = handleSSEError;
  
  return newEventSource;
};
```

## Reconnection Strategy

The application implements a reconnection strategy to handle network issues:

1. **Exponential Backoff**: Increasing delay between reconnection attempts
2. **Visibility Detection**: Reconnecting when the browser tab becomes visible
3. **Error Handling**: Proper error logging and user feedback

```jsx
// Example reconnection with exponential backoff
let reconnectAttempt = 0;

const handleSSEError = (error) => {
  console.error("SSE error:", error);
  eventSource.close();
  
  // Calculate delay with exponential backoff, capped at 30 seconds
  const delay = Math.min(1000 * (2 ** reconnectAttempt), 30000);
  reconnectAttempt++;
  
  setTimeout(() => {
    console.log('Reconnecting to SSE...');
    setupSSE(cabinId, selectedSlot);
  }, delay);
};

// Example visibility change detection
const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible') {
    console.log('Tab is now visible, re-establishing SSE connection');
    reconnectAttempt = 0; // Reset reconnection attempt counter
    setupSSE(cabinId, selectedSlot);
  }
};

document.addEventListener('visibilitychange', handleVisibilityChange);
```

## Data Flow

### Receiving Updates

When data is received from the server, it is parsed and the UI is updated:

```jsx
const handleSSEMessage = (event) => {
  try {
    const parsedData = JSON.parse(event.data);
    
    if (parsedData.queue) {
      // Update the patients array with the new patient data
      setPatients((prevPatients) => {
        const updatedPatient = {
          position: parsedData.queue.position,
          late: parsedData.queue.late || false,
          status: parsedData.queue.status || "pending",
          paid: parsedData.queue.paid || false,
          checkin: parsedData.queue.checkin || false,
          appointment: parsedData.queue.appointment
        };

        // Find if the patient already exists
        const existingIndex = prevPatients.findIndex(
          (p) => p.appointment.appointment_id === parsedData.queue.appointment.appointment_id
        );

        const newPatients = [...prevPatients];
        if (existingIndex !== -1) {
          newPatients[existingIndex] = updatedPatient;
        } else {
          newPatients.push(updatedPatient);
        }
        return newPatients.sort((a, b) => a.position - b.position);
      });
    } else if (parsedData.cabinslot) {
      setCurrentPosition(parsedData.cabinslot.current_number);
    }
  } catch (error) {
    console.error("Error processing SSE data:", error);
  }
};
```

### Update Types

The server can send different types of updates:

1. **Queue Updates**: Changes to patient queue data
2. **Position Updates**: Changes to the current position in the queue
3. **Notification Updates**: System notifications

## Component Integration

### App.js

The SSE connection is established in `App.js` to ensure global availability:

```jsx
// Setup in useEffect in App.js
useEffect(() => {
  if (!cabinId || loading) return;
  
  const eventSource = setupSSE(cabinId, selectedSlot);
  
  // Cleanup function
  return () => {
    if (eventSource) {
      eventSource.close();
    }
  };
}, [cabinId, selectedSlot]);
```

### Component-Specific Updates

Some components may establish their own SSE connections for specific data:

```jsx
// Example in a component
useEffect(() => {
  // Only establish connection if needed
  if (!patientId) return;
  
  const eventSource = new EventSource(`${API_BASE_URL}/patient-updates/${patientId}`);
  
  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    updatePatientData(data);
  };
  
  return () => eventSource.close();
}, [patientId]);
```

## Best Practices

1. **Resource Management**: Close EventSource connections when components unmount
2. **Error Handling**: Implement proper error handling for connection issues
3. **Reconnection Logic**: Use exponential backoff for reconnection attempts
4. **State Updates**: Be careful with state updates from SSE to avoid performance issues
5. **Filter Updates**: Only process relevant updates to minimize unnecessary re-renders
6. **Fallback Mechanism**: Provide polling as a fallback if SSE is not supported
7. **Visibility Changes**: Re-establish connections when the browser tab becomes visible 