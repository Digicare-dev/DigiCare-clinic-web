import { Box, Container } from '@mui/material';

export const Layout = ({ children }) => {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box
        sx={{
          backgroundColor: 'background.default',
          borderRadius: 2,
          p: { xs: 2, md: 3 },
          minHeight: 'calc(100vh - 180px)',
        }}
      >
        {children}
      </Box>
    </Container>
  );
}; 