import React from 'react';
import { Button, Chip, Typography, Box } from '@mui/material';
import { Description as DescriptionIcon } from '@mui/icons-material';
import { getPdfUrl, getPdfTitle } from '../utils/pdfUtils';

// Component for displaying a report link
const ReportLink = ({ type = 'blood-test', variant = 'button', label, onClick }) => {
  const handleClick = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    
    // Get the PDF URL and title
    const pdfUrl = getPdfUrl(type);
    const pdfTitle = getPdfTitle(type);
    
    // Open the PDF directly in a new tab
    window.open(pdfUrl, '_blank');
  };

  // Render as a button
  if (variant === 'button') {
    return (
      <Button
        variant="outlined"
        color="primary"
        size="small"
        startIcon={<DescriptionIcon />}
        onClick={handleClick}
        sx={{ textTransform: 'none' }}
      >
        {label || getPdfTitle(type)}
      </Button>
    );
  }
  
  // Render as a chip
  if (variant === 'chip') {
    return (
      <Chip
        icon={<DescriptionIcon />}
        label={label || getPdfTitle(type)}
        onClick={handleClick}
        color="primary"
        variant="outlined"
        size="small"
      />
    );
  }
  
  // Render as a text link
  return (
    <Box 
      component="span" 
      onClick={handleClick}
      sx={{ 
        display: 'inline-flex',
        alignItems: 'center',
        color: 'primary.main',
        cursor: 'pointer',
        '&:hover': {
          textDecoration: 'underline'
        }
      }}
    >
      <DescriptionIcon fontSize="small" sx={{ mr: 0.5 }} />
      <Typography variant="body2" component="span">
        {label || getPdfTitle(type)}
      </Typography>
    </Box>
  );
};

export default ReportLink; 