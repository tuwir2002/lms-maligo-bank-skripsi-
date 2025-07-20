import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#050D31', // RGB(5, 13, 49) - Deep futuristic blue
      contrastText: '#fff',
    },
    secondary: {
      main: '#866600', // RGB(134, 102, 0) - Gold-yellow for accents
      contrastText: '#fff',
    },
    background: {
      default: 'linear-gradient(180deg, #0A1A5C 0%, #050D31 100%)', // Gradient background for futuristic vibe
      paper: '#1A237E', // Darker blue for cards and surfaces
    },
    text: {
      primary: '#E0E7FF', // Light text for contrast on dark backgrounds
      secondary: '#FFD700', // Gold for secondary text
    },
  },
  typography: {
    fontFamily: '"Orbitron", "Roboto", "Helvetica", "Arial", sans-serif', // Futuristic font stack
    h1: {
      fontWeight: 700,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
    },
    h2: {
      fontWeight: 600,
      letterSpacing: '0.04em',
    },
    h3: {
      fontWeight: 600,
      letterSpacing: '0.03em',
    },
    h4: {
      fontWeight: 700,
      letterSpacing: '0.02em',
    },
    body1: {
      fontWeight: 400,
      lineHeight: 1.6,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          padding: '10px 24px',
          fontSize: '1.1rem',
          fontWeight: 600,
          background: 'linear-gradient(45deg, #050D31 30%, #0A1A5C 90%)', // Gradient for buttons
          boxShadow: '0 0 10px rgba(5, 13, 49, 0.5)', // Subtle glow
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 0 20px rgba(134, 102, 0, 0.7)', // Gold glow on hover
            transform: 'translateY(-2px)', // Lift effect
            background: 'linear-gradient(45deg, #0A1A5C 30%, #050D31 90%)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(45deg, #866600 30%, #FFD700 90%)', // Gold gradient for secondary buttons
          '&:hover': {
            background: 'linear-gradient(45deg, #FFD700 30%, #866600 90%)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          background: 'linear-gradient(145deg, #1A237E 0%, #050D31 100%)', // Gradient for cards
          boxShadow: '0 0 15px rgba(134, 102, 0, 0.3)', // Neon gold glow
          border: '1px solid rgba(134, 102, 0, 0.2)', // Subtle gold border
          transition: 'box-shadow 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 0 25px rgba(134, 102, 0, 0.5)', // Enhanced glow on hover
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          padding: '16px',
          background: 'rgba(5, 13, 49, 0.9)', // Slightly transparent for depth
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          textShadow: '0 0 5px rgba(134, 102, 0, 0.2)', // Subtle text glow
        },
      },
    },
  },
});

export default theme;