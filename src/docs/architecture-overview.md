# DigiCare Reception Dashboard Architecture

This document provides an overview of the architecture of the DigiCare Reception Dashboard web application.

## Application Structure

The application follows a typical React application structure with some specific organizational patterns:

```
src/
├── assets/          # Static assets like images, icons
├── components/      # Reusable UI components
├── context/         # React context providers
├── docs/            # Documentation files
├── hooks/           # Custom React hooks
├── Pages/           # Top-level page components
├── services/        # API services and data fetching
├── theme/           # UI theme configuration
├── utils/           # Utility functions
├── App.js           # Main application component
└── index.js         # Application entry point
```

## Key Architectural Patterns

### Component Hierarchy

1. **App.js** - The root component that sets up routing and global providers
2. **Pages/** - Container components that represent full pages
3. **components/** - Reusable UI components used across different pages

### State Management

The application uses a combination of:

1. **React Context** - For global state management (auth, notifications, etc.)
2. **Local Component State** - For component-specific state
3. **Server State** - Managed through API calls and real-time updates

### Data Flow

1. User interactions trigger state changes or API calls
2. API services in `services/` handle data fetching and mutations
3. Response data updates context or component state
4. UI re-renders based on the updated state

### Real-time Updates

The application uses Server-Sent Events (SSE) for real-time updates:
- Queue updates are received through an EventSource connection
- Updates automatically trigger UI refreshes

## Global Providers

The application wraps components with several providers for global functionality:

1. **AuthContext** - Manages user authentication state
2. **NotificationContext** - Manages global notifications
3. **AppointmentFormContext** - Manages appointment form state
4. **ThemeProvider** - Provides MUI theming

## Routing

React Router is used for navigation with:
- Public routes (login)
- Private routes (requiring authentication)
- Role-based routes (requiring specific user roles)

## Backend Integration

The application communicates with a backend API through:
- RESTful HTTP requests using Axios
- Real-time updates using Server-Sent Events

## Design System

Material UI (MUI) is used as the primary UI component library with:
- Custom theme configuration in `theme/`
- Responsive design for both desktop and mobile views 