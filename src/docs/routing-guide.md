# Routing Guide

This document describes the routing structure and navigation flow in the DigiCare Reception Dashboard.

## Route Structure

The application uses React Router v6 for routing. All routes are defined in `App.js` and are protected with authentication checks where necessary.

### Main Routes

- `/` - Redirects to `/queue` (or `/mobile-queue` on mobile devices)
- `/queue` - Main queue management page
- `/appointments` - Appointment management
- `/past-appointments` - Past appointments view
- `/prescription` - Prescription management
- `/patient-info` - Patient information page
- `/appointment-details` - Appointment details page
- `/consultation` - Consultation page
- `/help` - Help center providing user documentation and support resources, links to the [User Guide](./user-guide.md)

### Mobile-Specific Routes

Special routes for mobile devices:

- `/add-appointment` - Mobile appointment creation
- `/mobile-appointments` - Mobile appointment view
- `/mobile-queue` - Mobile queue management

## Route Types

### Public Routes

These routes are accessible without authentication:

- `/login` - Authentication page

### Protected Routes

These routes require authentication and are wrapped with the `PrivateRoute` component:

- `/` - Redirects to `/queue` (or `/mobile-queue` on mobile devices)
- `/queue` - Main queue management page
- `/appointments` - Appointment management
- `/past-appointments` - Past appointments view
- `/prescription` - Prescription management
- `/patient-info` - Patient information page
- `/appointment-details` - Appointment details page
- `/consultation` - Consultation page
- `/help` - Help and documentation page

## Route Implementation

Routes are defined in `App.js` using React Router's `Routes` and `Route` components:

```jsx
<Routes>
  <Route path="/login" element={<Login />} />
  <Route
    path="/queue"
    element={
      <PrivateRoute>
        <Home
          currentPosition={currentPosition}
          setCurrentPosition={setCurrentPosition}
          patients={patients}
          // Additional props...
        />
      </PrivateRoute>
    }
  />
  {/* Other routes... */}
  <Route path="*" element={<Navigate to="/login" replace />} />
</Routes>
```

## Route Protection

### PrivateRoute Component

Located in `src/components/PrivateRoute.js`, this higher-order component:

1. Checks if a user is authenticated
2. Redirects to the login page if not authenticated
3. Renders the child components if authenticated

```jsx
// Simplified implementation
const PrivateRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};
```

### RoleBasedRoute Component

Located in `src/components/RoleBasedRoute.js`, this component extends PrivateRoute to add role-based access control:

```jsx
// Simplified implementation
const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { user } = useContext(AuthContext);
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};
```

## Navigation

### Programmatic Navigation

For programmatic navigation, use the `useNavigate` hook:

```jsx
import { useNavigate } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();
  
  const handleButtonClick = () => {
    navigate('/appointments');
  };
  
  // With state
  const goToAppointmentDetails = (appointmentId) => {
    navigate('/appointment-details', { state: { appointmentId } });
  };
  
  return (
    <button onClick={handleButtonClick}>Go to Appointments</button>
  );
}
```

### Retrieving Route Parameters

Use the `useParams` hook to access route parameters:

```jsx
import { useParams } from 'react-router-dom';

function AppointmentDetails() {
  const { appointmentId } = useParams();
  
  // Now you can use appointmentId
}
```

### Accessing Location State

Use the `useLocation` hook to access state passed via navigation:

```jsx
import { useLocation } from 'react-router-dom';

function AppointmentDetails() {
  const location = useLocation();
  const appointmentId = location.state?.appointmentId;
  
  // Now you can use appointmentId
}
```

## Responsive Routing

The application implements device-specific routing:

```jsx
// Example of responsive routing in App.js
<Route
  path="/"
  element={
    <PrivateRoute>
      {isMobile ? (
        <Navigate to="/mobile-queue" replace />
      ) : (
        <Navigate to="/queue" replace />
      )}
    </PrivateRoute>
  }
/>
```

## Navigation Components

### Header Navigation

The `Header` component provides top navigation links based on user role and permissions.

### Sidebar Navigation

The `Sidebar` component provides desktop navigation for accessing different sections.

### Bottom Navigation

The `BottomNavigator` component provides mobile navigation at the bottom of the screen.

## Best Practices

1. **Route Organization**: Keep all routes in one place (App.js) for easy management
2. **Consistent Protection**: Always wrap protected content with PrivateRoute
3. **Clear Naming**: Use clear, consistent route names
4. **State Management**: Pass minimal data through navigation state
5. **Fallback Routes**: Always include a fallback route (`path="*"`)
6. **Responsive Routing**: Direct users to device-appropriate views 