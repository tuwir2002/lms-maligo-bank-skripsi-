import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#050D31', // Deep blue
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#866600', // Gold-yellow
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#FFFFFF', // White for main background
      paper: 'linear-gradient(145deg, #050D31 0%,rgb(17, 41, 139) 100%)', // Gradient for cards
    },
    text: {
      primary: '#050D31', // Deep blue for primary text
      secondary: '#866600', // Gold for secondary text
    },
  },
  typography: {
    fontFamily: '"Orbitron", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '0.05em',
      color: '#ffd700',
    },
    h2: {
      fontWeight: 600,
      letterSpacing: '0.04em',
      color: '#ffd700',
    },
    h3: {
      fontWeight: 600,
      letterSpacing: '0.03em',
      color: '#ffd700',
    },
    h4: {
      fontWeight: 700,
      letterSpacing: '0.02em',
      color: '#ffd700',
    },
    body1: {
      fontWeight: 400,
      lineHeight: 1.6,
      color: '#ffd700',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          padding: '12px 24px',
          fontSize: '1rem',
          fontWeight: 600,
          background: 'linear-gradient(45deg, #050D31 30%, #0A1A5C 90%)',
          boxShadow: '0 2px 8px rgba(5, 13, 49, 0.3)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(134, 102, 0, 0.5)',
            transform: 'scale(1.02)',
            background: 'linear-gradient(45deg, #0A1A5C 30%, #050D31 90%)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(45deg, #866600 30%, #FFD700 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #FFD700 30%, #866600 90%)',
            boxShadow: '0 4px 16px rgba(134, 102, 0, 0.7)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          background: 'linear-gradient(145deg, #FFFFFF 0%, #E0E7FF 100%)', // White to light blue gradient
          boxShadow: '0 4px 12px rgba(5, 13, 49, 0.2)',
          border: '1px solid rgba(134, 102, 0, 0.1)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(134, 102, 0, 0.3)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '16px',
          background: 'rgba(255, 255, 255, 0.95)', // Slightly transparent white
          boxShadow: '0 2px 8px rgba(5, 13, 49, 0.1)',
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          textShadow: '0 1px 2px rgba(5, 13, 49, 0.1)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(90deg, #050D31 0%, #0A1A5C 100%)',
          boxShadow: '0 2px 8px rgba(5, 13, 49, 0.2)',
        },
      },
    },
  },
});

export default theme;