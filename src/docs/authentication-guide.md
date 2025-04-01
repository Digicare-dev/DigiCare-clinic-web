# Authentication System

This document explains how authentication works in the DigiCare Reception Dashboard and how to implement authentication-related features.

## Overview

The application uses a token-based authentication system with JWT tokens. Authentication state is managed through the `AuthContext` and protected routes are implemented using `PrivateRoute` and `RoleBasedRoute` components.

## Components

### AuthContext

Located in `src/context/AuthContext.js`, this context provides authentication state and methods to the entire application.

```jsx
// Example of using AuthContext
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, setUser, logout } = useContext(AuthContext);
  
  // Now you can use auth state and methods
}
```

#### Available Properties and Methods

- `user` - The current authenticated user object or null
- `isAuthenticated` - Boolean indicating if a user is authenticated
- `setUser(userData)` - Set the current user (typically after login)
- `logout()` - Log out the current user

### Protected Routes

#### PrivateRoute

Located in `src/components/PrivateRoute.js`, this component ensures that routes are only accessible to authenticated users.

```jsx
// Example usage in routing
<Route
  path="/appointments"
  element={
    <PrivateRoute>
      <AppointmentTable />
    </PrivateRoute>
  }
/>
```

#### RoleBasedRoute

Located in `src/components/RoleBasedRoute.js`, this component restricts access based on user roles.

```jsx
// Example usage in routing
<Route
  path="/admin"
  element={
    <RoleBasedRoute allowedRoles={['admin']}>
      <AdminPanel />
    </RoleBasedRoute>
  }
/>
```

## Authentication Flow

### Login

The login process is handled by the `Login` component (`src/Pages/Login.js`):

1. User enters credentials
2. Credentials are sent to the API via `loginService`
3. On successful login:
   - User data and token are stored in localStorage
   - User state is updated in AuthContext
   - User is redirected to the appropriate route

```jsx
// Example login implementation
const handleLogin = async (e) => {
  e.preventDefault();
  
  try {
    const response = await loginService(username, password);
    if (response.username) {
      localStorage.setItem("user", JSON.stringify(response));
      setUser(response);
      navigate('/');
    }
  } catch (error) {
    showErrorSnackbar("Login failed");
  }
};
```

### Logout

Logout is handled through the `logout` method in AuthContext:

1. User data is removed from localStorage
2. User state is set to null
3. User is redirected to the login page

### Auto Logout

The application supports auto logout on token expiration:

1. Token expiration is checked on protected routes
2. If expired, user is redirected to login with a message
3. `utils/authUtils.js` provides utilities for token management

## API Authentication

API requests include authentication tokens through an Axios interceptor:

1. `axiosInstance` in `utils/axiosInstance.js` adds the token to request headers
2. Token is retrieved from localStorage
3. Failed requests due to authentication issues trigger logout

## Best Practices

1. **Security**: Never store sensitive information in localStorage
2. **Token Handling**: Always check token expiration before making API calls
3. **Error Handling**: Provide clear feedback for authentication errors
4. **Redirection**: After login, redirect users to their intended destination
5. **Permission Checks**: Always verify permissions on the server, not just the client 