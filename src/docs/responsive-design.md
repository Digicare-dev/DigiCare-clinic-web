# Responsive Design Implementation

This document explains the responsive design implementation in the DigiCare Reception Dashboard.

## Overview

The application is designed to work seamlessly on both desktop and mobile devices. It uses a combination of:

- Media queries
- Responsive components
- Conditional rendering
- Device-specific routes and components

## Device Detection

The application detects device type using the window width:

```jsx
// Example of device detection
const isMobile = window.innerWidth <= 768;

// React hook for responsive detection
const isMobile = useMediaQuery('(max-width: 768px)');
```

This detection is used throughout the application to conditionally render components appropriate for each device type.

## Responsive Layout Components

### Responsive Box/Grid

MUI's Box and Grid components are used with responsive properties:

```jsx
// Example of responsive grid
<Grid container spacing={2}>
  <Grid item xs={12} md={6}>
    {/* Content for full width on mobile, half width on desktop */}
  </Grid>
  <Grid item xs={12} md={6}>
    {/* Content for full width on mobile, half width on desktop */}
  </Grid>
</Grid>

// Example of responsive box with conditional styling
<Box
  sx={{
    p: { xs: 1, sm: 2, md: 4 },
    display: 'flex',
    flexDirection: { xs: 'column', md: 'row' }
  }}
>
  {/* Content that changes layout based on screen size */}
</Box>
```

### Responsive Typography

Typography adjusts based on screen size:

```jsx
// Example of responsive typography
<Typography
  variant="h4"
  sx={{
    fontSize: { xs: '1.5rem', md: '2.125rem' },
    fontWeight: { xs: 500, md: 700 }
  }}
>
  Page Title
</Typography>
```

## Mobile-Specific Components

For mobile devices, the application provides specialized components:

### Bottom Navigation

Located in `src/components/BottomNavigator.js`, this component provides navigation for mobile users:

```jsx
// Example from App.js showing conditional rendering
{currentUser !== null && isMobile && <BottomNavigator />}
```

### Mobile-Optimized Pages

Mobile-specific versions of key pages:

- `MobileQueuePage.js` - Mobile version of queue management
- `MobileAppointmentTable.js` - Mobile version of appointment table
- `AddAppointmentMobile.js` - Mobile appointment creation form

## Responsive Routing

The app uses responsive routing to direct users to device-appropriate views:

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

## Layout Components

### Header

The Header component adapts to screen size:
- Full navigation on desktop
- Simplified navigation on mobile
- Adjusts spacing and component visibility

### Sidebar

The Sidebar is only displayed on desktop devices:

```jsx
// Example from App.js
{currentUser !== null && !isMobile && <Sidebar />}
```

## Responsive UI Patterns

### Card-Based Layout

On mobile, complex tables are replaced with card-based layouts:

```jsx
// Example of conditionally rendering different layouts
{isMobile ? (
  <CardBasedList items={appointments} />
) : (
  <DataGrid rows={appointments} columns={columns} />
)}
```

### Expandable Sections

Mobile views use expandable sections to manage screen space:

```jsx
// Example of expandable section
<Accordion>
  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
    <Typography>Patient Information</Typography>
  </AccordionSummary>
  <AccordionDetails>
    {/* Detailed content */}
  </AccordionDetails>
</Accordion>
```

### Modal Usage

On mobile, some complex forms are presented as full-screen modals:

```jsx
// Example of responsive modal sizing
<Modal
  open={isOpen}
  onClose={handleClose}
  sx={{
    '& .MuiPaper-root': {
      width: { xs: '95%', sm: '80%', md: '60%' },
      maxHeight: { xs: '95vh', md: '80vh' }
    }
  }}
>
  {/* Modal content */}
</Modal>
```

## CSS Techniques

### CSS Modules

The application uses CSS Modules for component-specific styling:

```jsx
// Example of importing CSS module
import styles from './ComponentName.module.css';

// Usage in component
<div className={styles.containerClass}>
  {/* Content */}
</div>
```

### Media Queries in CSS

CSS files include media queries for responsive styling:

```css
/* Example from a CSS module */
.container {
  padding: 20px;
}

@media (max-width: 768px) {
  .container {
    padding: 10px;
  }
}
```

## Best Practices

1. **Mobile-First Approach**: Design for mobile first, then enhance for desktop
2. **Performance**: Optimize component rendering for mobile devices
3. **Touch-Friendly UI**: Ensure adequate touch target sizes on mobile
4. **Responsive Images**: Use responsive techniques for images
5. **Test on Real Devices**: Test on actual devices, not just browser resizing
6. **Consistent Experience**: Maintain feature parity between desktop and mobile
7. **Conditional Imports**: Use dynamic imports for device-specific features to reduce bundle size 