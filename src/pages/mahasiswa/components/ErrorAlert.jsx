import React from 'react';
import { Alert, AlertTitle } from '@mui/material';

const ErrorAlert = ({ message }) => {
  return (
    <Alert severity="error" sx={{ mb: 2 }}>
      <AlertTitle>Error</AlertTitle>
      {message}
    </Alert>
  );
};

export default ErrorAlert;