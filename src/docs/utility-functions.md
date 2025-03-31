# Utility Functions

This document provides information about utility functions used throughout the DigiCare Reception Dashboard.

## Overview

The application contains various utility functions located in the `src/utils/` directory. These functions provide common functionality used across different components and help maintain a clean separation of concerns.

## Available Utility Modules

### dateUtils.js

Located in `src/utils/dateUtils.js`, this module provides date and time manipulation functions:

```jsx
import { 
  formatAppointmentDate, 
  formatAppointmentTime, 
  getCabinInfo,
  getLatestCabinSlot 
} from '../utils/dateUtils';

// Format a date string for display
const formattedDate = formatAppointmentDate('2023-03-15T09:30:00.000Z');
// Output: "15 Mar 2023"

// Format a time string for display
const formattedTime = formatAppointmentTime('2023-03-15T09:30:00.000Z');
// Output: "09:30 AM"

// Get cabin and slot information from user object
const { cabinId, selectedSlot } = getCabinInfo(user);

// Get the latest cabin slot
const latestSlot = getLatestCabinSlot(cabinInfo);
```

### authUtils.js

Located in `src/utils/authUtils.js`, this module provides authentication-related utilities:

```jsx
import { getAutoLogoutMessage, checkTokenExpiration } from '../utils/authUtils';

// Get auto-logout message if user was logged out automatically
const autoLogoutInfo = getAutoLogoutMessage();
if (autoLogoutInfo) {
  showNotification(autoLogoutInfo.message, autoLogoutInfo.severity);
}

// Check if token is expired
const isExpired = checkTokenExpiration(token);
if (isExpired) {
  logout();
}
```

### axiosInstance.js

Located in `src/utils/axiosInstance.js`, this module configures and exports an Axios instance:

```jsx
import axiosInstance from '../utils/axiosInstance';

// Make authenticated HTTP requests
axiosInstance.get('/endpoint').then(response => {
  // Handle response
}).catch(error => {
  // Handle error
});
```

### notificationUtils.js

Located in `src/utils/notificationUtils.js`, this module provides utilities for notifications:

```jsx
import { useSnackbarCompat } from '../utils/notificationUtils';

// Use the compatibility hook for snackbars
const { handleOpenSnackbar } = useSnackbarCompat();

// Show a notification
handleOpenSnackbar('Operation successful', 'success');
```

### prescriptionUtils.js

Located in `src/utils/prescriptionUtils.js`, this module provides utilities for prescription management:

```jsx
import { printPrescription, formatPrescription } from '../utils/prescriptionUtils';

// Format prescription data for display or API
const formattedData = formatPrescription(rawPrescriptionData);

// Print a prescription
printPrescription(prescriptionId);
```

### pdfUtils.js

Located in `src/utils/pdfUtils.js`, this module provides PDF-related utilities:

```jsx

// Generate a PDF from data
const pdfBlob = await generatePDF(data, template);

// Download a PDF
downloadPDF(pdfBlob, 'filename.pdf');
```

## Specialized Helper Functions

### Form Validation

Various utilities for form validation:

```jsx
// Example phone number validation
const validatePhoneNumber = (number) => {
  return /^\d{10}$/.test(number);
};

// Example age validation
const validateAge = (age) => {
  const numAge = parseInt(age, 10);
  return !isNaN(numAge) && numAge > 0 && numAge < 120;
};
```

### Data Formatting

Utilities for data formatting and display:

```jsx
// Capitalize first letter of a string
const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

// Format currency
const formatCurrency = (amount) => {
  return `₹${parseFloat(amount).toFixed(2)}`;
};
```

### API Helpers

Utilities for working with API responses:

```jsx
// Extract error message from API response
const getErrorMessage = (error) => {
  if (error.response && error.response.data && error.response.data.message) {
    return error.response.data.message;
  }
  return error.message || 'An unknown error occurred';
};

// Format request payload
const formatRequestPayload = (data) => {
  // Transform data for API requirements
  return {
    ...data,
    // Add any required transformations
  };
};
```

## Best Practices

1. **Reusability**: Keep utility functions generic and reusable
2. **Single Responsibility**: Each function should do one thing well
3. **Pure Functions**: Prefer pure functions (same input = same output)
4. **Documentation**: Document parameters and return values
5. **Error Handling**: Include proper error handling in utility functions
6. **Testing**: Write unit tests for utility functions
7. **Naming**: Use clear, descriptive names for functions 