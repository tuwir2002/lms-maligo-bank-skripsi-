import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useThemeContext } from '../../../theme/ThemeContext';

const ThemeToggle = () => {
  const { mode, toggleTheme } = useThemeContext();

  return (
    <Tooltip title={mode === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}>
      <IconButton onClick={toggleTheme} color="inherit">
        {mode === 'light' ? (
          <Brightness4 sx={{ color: '#050D31' }} />
        ) : (
          <Brightness7 sx={{ color: '#efbf04' }} />
        )}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;