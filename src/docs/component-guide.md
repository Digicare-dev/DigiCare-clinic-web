# Reusable Components Guide

This document provides an overview of the reusable components in the DigiCare Reception Dashboard.

## Overview

The application contains various reusable components located in the `src/components/` directory. These components are designed to be modular, flexible, and consistent across the application.

## Core Components

### GlobalSnackbar

Located in `src/components/GlobalSnackbar.js`, this component provides a global notification system:

```jsx
// Implementation is in App.js
import GlobalSnackbar from './components/GlobalSnackbar';

function App() {
  return (
    <NotificationProvider>
      {/* App content */}
      <GlobalSnackbar />
    </NotificationProvider>
  );
}

// Usage in components
import { useNotification } from '../context/NotificationContext';

function MyComponent() {
  const { showSuccessSnackbar } = useNotification();
  
  const handleSuccess = () => {
    showSuccessSnackbar('Operation completed successfully');
  };
  
  return <Button onClick={handleSuccess}>Submit</Button>;
}
```

### AppointmentForm

Located in `src/components/AppointmentForm.js`, this component is a modal form for creating and editing appointments:

```jsx
// Implementation in App.js
import AppointmentForm from './components/AppointmentForm';

function App() {
  return (
    <AppointmentFormProvider>
      {/* App content */}
      <AppointmentForm />
    </AppointmentFormProvider>
  );
}

// Usage in components
import { useAppointmentForm } from '../context/AppointmentFormContext';

function MyComponent() {
  const { openAppointmentForm, setInitialData } = useAppointmentForm();
  
  const handleAddAppointment = () => {
    setInitialData({ firstName: 'John', lastName: 'Doe' });
    openAppointmentForm();
  };
  
  return <Button onClick={handleAddAppointment}>Add Appointment</Button>;
}
```

### PDFViewer

Located in `src/components/PDFViewer.js`, this component displays PDF documents:

```jsx
// Usage with PDFViewerContext
import { usePDFViewer } from '../hooks/usePDFViewer';

function MyComponent() {
  const { openPdfViewer } = usePDFViewer();
  
  const handleViewPDF = () => {
    openPdfViewer('https://example.com/document.pdf', 'Document Title');
  };
  
  return <Button onClick={handleViewPDF}>View PDF</Button>;
}
```

## Navigation Components

### Header

Located in `src/components/Header.js`, this component provides the top navigation bar:

- Displays user information
- Shows application title
- Provides navigation options
- Adapts to mobile and desktop views

### Sidebar

Located in `src/components/Sidebar.js`, this component provides desktop navigation:

- Links to main application areas
- Collapsible design
- Role-based menu items

### BottomNavigator

Located in `src/components/BottomNavigator.js`, this component provides mobile navigation:

- Bottom-positioned navigation bar
- Icons for main application areas
- Touch-optimized design

## Form Components

### CustomTextField

Located in `src/components/CustomTextField.js`, this component extends MUI TextField with consistent styling:

```jsx
import CustomTextField from '../components/CustomTextField';

function MyForm() {
  return (
    <CustomTextField
      label="Name"
      value={name}
      onChange={handleNameChange}
      required
      error={!!nameError}
      helperText={nameError}
    />
  );
}
```

### SearchBar

Located in `src/components/SearchBar.js`, this component provides a standard search interface:

```jsx
import SearchBar from '../components/SearchBar';

function MyList() {
  const handleSearch = (query) => {
    // Handle search logic
  };
  
  return (
    <SearchBar 
      placeholder="Search patients..."
      onSearch={handleSearch}
      debounceTime={300}
    />
  );
}
```

## Data Display Components

### DataTable

Located in `src/components/DataTable.js`, this component provides a standardized table interface:

```jsx
import DataTable from '../components/DataTable';

function PatientList() {
  const columns = [
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'age', headerName: 'Age', width: 100 },
    { field: 'phone', headerName: 'Phone', width: 150 },
    // Additional columns...
  ];
  
  return (
    <DataTable
      rows={patients}
      columns={columns}
      loading={loading}
      onRowClick={handleRowClick}
      pageSize={10}
    />
  );
}
```

### StatusBadge

Located in `src/components/StatusBadge.js`, this component displays status information with appropriate colors:

```jsx
import StatusBadge from '../components/StatusBadge';

function AppointmentCard({ appointment }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">{appointment.patientName}</Typography>
        <StatusBadge status={appointment.status} />
      </CardContent>
    </Card>
  );
}
```

## Route Protection Components

### PrivateRoute

Located in `src/components/PrivateRoute.js`, this component ensures routes are only accessible to authenticated users:

```jsx
import PrivateRoute from '../components/PrivateRoute';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
```

### RoleBasedRoute

Located in `src/components/RoleBasedRoute.js`, this component restricts access based on user roles:

```jsx
import RoleBasedRoute from '../components/RoleBasedRoute';

function AdminRoutes() {
  return (
    <Routes>
      <Route
        path="/admin"
        element={
          <RoleBasedRoute allowedRoles={['admin']}>
            <AdminPanel />
          </RoleBasedRoute>
        }
      />
    </Routes>
  );
}
```

## Best Practices

1. **Component Composition**: Compose complex components from simpler ones
2. **Prop Validation**: Use PropTypes or TypeScript to validate component props
3. **Default Props**: Provide sensible default values for optional props
4. **Consistent API**: Use consistent prop naming and patterns across components
5. **Controlled Components**: Prefer controlled components over uncontrolled ones
6. **Loading States**: Include loading state handling in data-dependent components
7. **Error Handling**: Implement graceful error handling and feedback
8. **Accessibility**: Ensure components are accessible with proper ARIA attributes
9. **Responsive Design**: Design components to work well on all screen sizes 