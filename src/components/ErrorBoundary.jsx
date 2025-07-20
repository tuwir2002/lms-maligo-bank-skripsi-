// src/components/ErrorBoundary.jsx
import React, { Component } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme/theme';
import { useNavigate } from 'react-router-dom';

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
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
              <Typography variant="h4" sx={{ mb: 2 }}>
                Something went wrong
              </Typography>
              <Typography variant="body1" sx={{ mb: 4 }}>
                {this.state.error?.message || 'An unexpected error occurred.'}
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => window.location.href = '/'}
              >
                Back to Home
              </Button>
            </Box>
          </Box>
        </ThemeProvider>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;