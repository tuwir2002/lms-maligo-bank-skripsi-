import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#050D31', // Biru tua
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#efbf04', // Kuning emas
      contrastText: '#050D31',
    },
    background: {
      default: '#0a0e2b', // Latar belakang gelap futuristik
      paper: '#050D31',
    },
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  typography: {
    fontFamily: '"Orbitron", "Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontFamily: '"Orbitron", sans-serif',
      fontWeight: 700,
    },
    h4: {
      fontFamily: '"Orbitron", sans-serif',
      fontWeight: 600,
    },
    h6: {
      fontFamily: '"Orbitron", sans-serif',
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 0 15px rgba(239, 191, 4, 0.5)',
          borderBottom: '1px solid #efbf04',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 0 10px rgba(239, 191, 4, 0.3)',
          transition: 'all 0.3s ease-in-out',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 20,
          padding: '8px 24px',
          fontWeight: 500,
          transition: 'all 0.3s ease-in-out',
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 500,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s ease-in-out',
        },
      },
    },
  },
});

export default theme;