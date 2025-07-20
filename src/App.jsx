// src/App.jsx
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme/theme';
import AppRoutes from './routes/AppRoutes';
import ErrorBoundary from './components/ErrorBoundary';

const App = () => (
  <ThemeProvider theme={theme}>
    <ErrorBoundary>
      <AppRoutes />
    </ErrorBoundary>
  </ThemeProvider>
);

export default App;