import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Box } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme/theme';

const MahasiswaLayout = () => {
  return (
    <ThemeProvider theme={theme}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Mahasiswa Dashboard</Typography>
        </Toolbar>
      </AppBar>
      <Container>
        <Box my={4}>
          <Outlet />
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default MahasiswaLayout;