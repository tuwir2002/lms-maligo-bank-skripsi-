// src/pages/NotFound.jsx
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme/theme';

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(45deg, rgb(5, 13, 49) 30%, #00bcd4 90%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          textAlign: 'center',
          p: 4,
        }}
      >
        <Box>
          <Typography variant="h3" sx={{ fontSize: { xs: '2rem', md: '3rem' }, mb: 2 }}>
            404 - Page Not Found
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.8 }}>
            The page you're looking for doesn't exist or you don't have access.
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate('/')}
            sx={{ px: 4, py: 1.5 }}
          >
            Back to Home
          </Button>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default NotFound;