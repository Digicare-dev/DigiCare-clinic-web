# Theming and Styling Guide

This document explains the theming and styling system used in the DigiCare Reception Dashboard.

## Overview

The application uses Material UI (MUI) for its component library and styling system. Customization is achieved through:

- Global theme configuration
- Component-specific styling
- CSS Modules for custom components
- Inline styles for minor adjustments

## Theme Configuration

### Theme Setup

The main theme is defined in `src/theme/theme.js`:

```jsx
// Example of theme configuration
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#4791db',
      dark: '#115293',
      contrastText: '#fff',
    },
    secondary: {
      main: '#dc004e',
      light: '#e33371',
      dark: '#9a0036',
      contrastText: '#fff',
    },
    // Additional palette settings
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 14,
    // Custom typography variants
  },
  components: {
    // Component customizations
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});
```

### Theme Implementation

The theme is applied in `App.js` using ThemeProvider:

```jsx
import { ThemeProvider } from '@mui/material/styles';
import { theme } from './theme/theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      {/* App content */}
    </ThemeProvider>
  );
}
```

## Styling Methods

### 1. MUI `sx` Prop

The most common styling method is using MUI's `sx` prop:

```jsx
<Box
  sx={{
    display: 'flex',
    padding: 2,
    backgroundColor: 'primary.light',
    '&:hover': {
      backgroundColor: 'primary.main',
    },
  }}
>
  Content
</Box>
```

This allows for:
- Theme-aware styling
- Responsive styling with breakpoints
- Nested selectors
- Direct access to theme values

### 2. CSS Modules

For more complex components, CSS Modules are used:

```jsx
// ComponentName.module.css
.container {
  display: flex;
  flex-direction: column;
}

.header {
  font-weight: bold;
  margin-bottom: 16px;
}

// ComponentName.js
import styles from './ComponentName.module.css';

function ComponentName() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>Title</div>
      {/* Content */}
    </div>
  );
}
```

### 3. Styled Components

For custom variants of MUI components:

```jsx
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';

const CustomButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius * 2,
  textTransform: 'none',
}));

function MyComponent() {
  return <CustomButton>Custom Button</CustomButton>;
}
```

### 4. Global Styles

Global styles are defined in `src/index.css` and applied to the entire application:

```css
body {
  margin: 0;
  font-family: 'Roboto', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

:root {
  --primary-color: #1976d2;
  --secondary-color: #dc004e;
  /* Additional CSS variables */
}
```

## Color System

The application uses a consistent color palette defined in the theme:

### Primary Colors
- Primary: #1976d2 (Main blue color for buttons, headers)
- Secondary: #dc004e (Accent color for highlights)

### Functional Colors
- Success: #4caf50 (Green for success states)
- Error: #f44336 (Red for error states)
- Warning: #ff9800 (Orange for warning states)
- Info: #2196f3 (Blue for information states)

### Neutral Colors
- Background: #f5f5f5
- Paper: #ffffff
- Text: Primary (#000000), Secondary (#757575)

## Typography System

The application follows a consistent typography hierarchy:

### Headings
- h1: Page titles (2.5rem)
- h2: Section titles (2rem)
- h3: Subsection titles (1.75rem)
- h4: Card titles (1.5rem)
- h5: Small section titles (1.25rem)
- h6: Small card titles (1rem)

### Body Text
- body1: Primary body text (1rem)
- body2: Secondary body text (0.875rem)

### Special Text
- button: Button text (0.875rem, uppercase)
- caption: Helper text (0.75rem)

## Component-Specific Styling

Many components have custom styling applied to maintain a consistent look:

### Buttons

```jsx
<Button
  variant="contained"
  sx={{
    backgroundColor: '#007bff',
    color: 'white',
    height: '50px',
    '&:hover': {
      backgroundColor: '#0066cc',
    },
    '&.Mui-disabled': {
      backgroundColor: '#007bff',
      color: 'white',
    },
  }}
>
  Submit
</Button>
```

### Cards

```jsx
<Card 
  sx={{
    borderRadius: 2, 
    boxShadow: 3,
    overflow: 'hidden'
  }}
>
  <CardHeader
    sx={{ backgroundColor: 'primary.light', color: 'white' }}
    title="Card Title"
  />
  <CardContent>
    Content
  </CardContent>
</Card>
```

## Responsive Styling

Responsive styling is applied using MUI's breakpoint system:

```jsx
<Box
  sx={{
    padding: { xs: 1, sm: 2, md: 3 },
    display: 'flex',
    flexDirection: { xs: 'column', md: 'row' },
    gap: { xs: 1, md: 2 },
  }}
>
  Content
</Box>
```

## Best Practices

1. **Theme Consistency**: Use theme values instead of hardcoded colors and sizes
2. **Responsive Design**: Always consider how components will look on different devices
3. **Component Abstraction**: Create reusable styled components for common patterns
4. **CSS Modules**: Use CSS Modules for complex styling needs
5. **Avoid Inline Styles**: Prefer `sx` prop or CSS Modules over inline styles
6. **Semantic Classes**: Use meaningful class names in CSS Modules
7. **Theme Extension**: Extend the theme rather than overriding it for component variations 