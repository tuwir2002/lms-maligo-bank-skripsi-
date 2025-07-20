import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';

const Header = ({ title }) => (
  <AppBar
    position="fixed"
    sx={{
      bgcolor: '#050D31',
      boxShadow: '0 2px 8px rgba(5, 13, 49, 0.2)',
      borderBottom: '1px solid rgba(134, 102, 0, 0.3)',
      width: '100%',
      zIndex: 1201, // Above sidebar
      borderRadius: 0,
    }}
  >
    <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography
          variant="h6"
          sx={{
            color: '#FFFFFF',
            fontWeight: 700,
            fontFamily: '"Orbitron", sans-serif',
          }}
        >
          {title}
        </Typography>
      </Box>
    </Toolbar>
  </AppBar>
);

export default Header;