# Custom Hooks

This document provides information about custom React hooks used throughout the DigiCare Reception Dashboard.

## Overview

The application uses several custom hooks to encapsulate and reuse stateful logic. These hooks are located in the `src/hooks/` directory and provide functionality for common tasks.

## Core Hooks

### usePDFViewer

Located in `src/hooks/usePDFViewer.js`, this hook manages the state and functionality for the PDF viewer:

```jsx
import { usePDFViewer } from '../hooks/usePDFViewer';

function MyComponent() {
  const { pdfViewerState, openPdfViewer, closePdfViewer } = usePDFViewer();
  
  const handleViewPDF = (url, title) => {
    openPdfViewer(url, title);
  };
  
  return (
    <Button onClick={() => handleViewPDF('pdf-url.pdf', 'PDF Title')}>
      View PDF
    </Button>
  );
}
```

#### Properties and Methods

- `pdfViewerState` - Current state of the PDF viewer
  - `isOpen` - Boolean indicating if the viewer is open
  - `pdfUrl` - URL of the PDF being displayed
  - `title` - Title of the PDF being displayed
- `openPdfViewer(url, title)` - Opens the PDF viewer with the specified PDF
- `closePdfViewer()` - Closes the PDF viewer

### useAppointmentForm

Located in `src/context/AppointmentFormContext.js`, this hook provides state and methods for the appointment form:

```jsx
import { useAppointmentForm } from '../context/AppointmentFormContext';

function MyComponent() {
  const { 
    isOpen, 
    openAppointmentForm, 
    closeAppointmentForm, 
    initialData,
    setInitialData 
  } = useAppointmentForm();
  
  const handleAddAppointment = () => {
    setInitialData({ firstName: 'John', lastName: 'Doe' });
    openAppointmentForm();
  };
  
  return (
    <Button onClick={handleAddAppointment}>
      Add Appointment
    </Button>
  );
}
```

#### Properties and Methods

- `isOpen` - Boolean indicating if the form is open
- `openAppointmentForm()` - Opens the appointment form
- `closeAppointmentForm()` - Closes the appointment form
- `initialData` - Initial data for the form
- `setInitialData(data)` - Sets the initial form data
- `updateMaxToken(cabinId, selectedSlot, maxToken)` - Updates the maximum token number
- `getMaxToken(cabinId, selectedSlot)` - Gets the maximum token number

### useNotification

Located in `src/context/NotificationContext.js`, this hook provides access to the global notification system:

```jsx
import { useNotification } from '../context/NotificationContext';

function MyComponent() {
  const { 
    showSuccessSnackbar, 
    showErrorSnackbar,
    showNotification 
  } = useNotification();
  
  const handleAction = () => {
    try {
      // Perform action
      showSuccessSnackbar('Action completed successfully');
    } catch (error) {
      showErrorSnackbar('Failed to complete action');
    }
  };
  
  return (
    <Button onClick={handleAction}>
      Perform Action
    </Button>
  );
}
```

#### Properties and Methods

- `notification` - Current notification state
- `showNotification(message, severity, autoHideDuration, position, title)` - Shows a notification
- `hideNotification()` - Hides the current notification
- `showSuccessSnackbar(message, duration)` - Shows a success snackbar
- `showErrorSnackbar(message, duration)` - Shows an error snackbar
- `showInfoSnackbar(message, duration)` - Shows an info snackbar
- `showWarningSnackbar(message, duration)` - Shows a warning snackbar
- `showSuccessAlert(title, message)` - Shows a success alert

## Utility Hooks

### useDebounce

A utility hook for debouncing values:

```jsx
import { useDebounce } from '../hooks/useDebounce';

function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  useEffect(() => {
    if (debouncedSearchTerm) {
      performSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);
  
  return (
    <TextField
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

### useLocalStorage

A hook for managing local storage state:

```jsx
import { useLocalStorage } from '../hooks/useLocalStorage';

function SettingsComponent() {
  const [settings, setSettings] = useLocalStorage('userSettings', defaultSettings);
  
  const updateSettings = (newSettings) => {
    setSettings({ ...settings, ...newSettings });
  };
  
  return (
    <Button onClick={() => updateSettings({ darkMode: true })}>
      Enable Dark Mode
    </Button>
  );
}
```

### useMediaQuery

A hook for responsive design:

```jsx
import { useMediaQuery } from '../hooks/useMediaQuery';

function ResponsiveComponent() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  return (
    <div>
      {isMobile ? (
        <MobileView />
      ) : (
        <DesktopView />
      )}
    </div>
  );
}
```

## Context-Based Hooks

### useAuth

Located in `src/context/AuthContext.js`, this hook provides access to authentication state and methods:

```jsx
import { useAuth } from '../context/AuthContext';

function ProfileButton() {
  const { user, logout } = useAuth();
  
  return (
    <>
      <Button>
        {user.username}
      </Button>
      <Button onClick={logout}>
        Logout
      </Button>
    </>
  );
}
```

#### Properties and Methods

- `user` - Current authenticated user or null
- `setUser(userData)` - Sets the current user
- `logout()` - Logs out the user
- `isAuthenticated` - Boolean indicating if a user is authenticated

## Best Practices

1. **Custom Hook Creation**: Create hooks for reusable stateful logic
2. **Naming Conventions**: Prefix hooks with 'use' (e.g., useCustomHook)
3. **Single Responsibility**: Each hook should focus on a specific functionality
4. **Error Handling**: Include error handling within hooks
5. **Documentation**: Document parameters, returns, and usage examples
6. **Testing**: Write unit tests for custom hooks
7. **Composability**: Make hooks composable with other hooks

When creating new custom hooks:
- Extract repeated logic into a new hook
- Ensure hooks follow React's rules (called at the top level, etc.)
- Consider creating a dedicated file in `src/hooks/` for reusable hooks
- Add relevant documentation to this file 