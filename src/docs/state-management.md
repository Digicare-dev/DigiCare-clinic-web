# State Management

This document describes the state management approach used in the DigiCare Reception Dashboard.

## Overview

The application uses a hybrid state management approach combining React Context API for global state and local component state for UI-specific concerns. This approach provides a balance between maintainability and performance.

## Context API Implementation

### Available Contexts

The application uses several context providers to manage different aspects of global state:

1. **AuthContext** (`src/context/AuthContext.js`)
   - Manages user authentication state
   - Provides login, logout, and token refresh functions
   - Tracks user role and permissions

2. **NotificationContext** (`src/context/NotificationContext.js`)
   - Manages global notification system
   - Provides functions for displaying and dismissing notifications
   - Controls notification appearance and duration

3. **ThemeContext** (`src/context/ThemeContext.js`)
   - Manages application theme settings
   - Provides theme switching functionality
   - Persists theme preferences

### Context Architecture

Contexts are organized in a provider tree in `App.js`:

```jsx
// Example from App.js
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            {/* Application routes */}
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
```

## Auth Context Example

Here's how the AuthContext is implemented:

```jsx
// src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from "react";
import { loginUser, refreshToken, logoutUser } from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Initialize auth state from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);
  
  // Login function
  const login = async (email, password) => {
    setLoading(true);
    try {
      const userData = await loginUser(email, password);
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      setError(null);
      return userData;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Logout function
  const logout = async () => {
    try {
      await logoutUser();
    } finally {
      localStorage.removeItem("user");
      setUser(null);
    }
  };
  
  // Check if user has specific role
  const hasRole = (role) => {
    return user && user.roles && user.roles.includes(role);
  };
  
  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        error, 
        login, 
        logout, 
        hasRole 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

## Local State Management

Component-level state is used for UI concerns that don't need to be shared:

```jsx
// Example component with local state
function AppointmentForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    patientName: "",
    appointmentDate: new Date(),
    appointmentType: "consultation",
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm(formData);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      // Reset form on success
      setFormData({
        patientName: "",
        appointmentDate: new Date(),
        appointmentType: "consultation",
        notes: "",
      });
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Component render...
}
```

## State Flow

### Data Flow Patterns

The application follows these data flow patterns:

1. **Context to Components**: Global state flows down from contexts to components
2. **Components to Context**: Components dispatch actions/call functions to update context
3. **API to Context**: External data is fetched and stored in context
4. **Local Component Flow**: UI state is managed within components

### Example Flow: Authentication

1. User enters credentials in Login component
2. Login component calls `login()` from AuthContext
3. AuthContext makes API call and updates global auth state
4. Protected components read AuthContext to determine access

```jsx
// Example usage in Login.js
import { useAuth } from '../context/AuthContext';

function Login() {
  const { login, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      // Redirect on success
    } catch (err) {
      // Error is handled by context
    }
  };
  
  // Render login form...
}
```

## Performance Considerations

Several techniques are used to optimize context performance:

1. **Context Splitting**: Separate contexts for different concerns
2. **Memoization**: Using `useMemo` and `useCallback` for context values
3. **Selective Updates**: Only updating changed parts of state
4. **Selective Consumption**: Components only consume the context values they need

## Best Practices

1. **Use Local State First**: Prefer component state for UI-only concerns
2. **Context for Shared State**: Use context only for truly global state
3. **Avoid Deep Nesting**: Keep the provider tree as flat as possible
4. **Memoize Context Values**: Prevent unnecessary re-renders
5. **Split Large Contexts**: Break contexts into smaller, focused providers
6. **Use Custom Hooks**: Create custom hooks to encapsulate context logic
7. **Debuggable**: Include development tools for context debugging 