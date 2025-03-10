import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const DemoBanner = () => {
  return (
    <Paper 
      elevation={0}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(25, 118, 210, 0.9)',
        color: 'white',
        padding: '8px 16px',
        textAlign: 'center',
        zIndex: 1200,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Typography variant="body2" fontWeight="medium">
        DEMO MODE - Login with username: "demo" and password: "demo" - All data is simulated
      </Typography>
    </Paper>
  );
};

export default DemoBanner; 