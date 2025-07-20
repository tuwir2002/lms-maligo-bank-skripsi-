import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  Box,
  Typography,
  Chip,
  Stack,
} from '@mui/material';

const ThesisList = ({ theses, onThesisSelect, selectedThesisId }) => {
  return (
    <List sx={{ bgcolor: 'transparent', maxHeight: '600px', overflow: 'auto' }}>
      {theses.map((thesis, index) => (
        <React.Fragment key={thesis.id}>
          <ListItem disablePadding>
            <ListItemButton
              selected={selectedThesisId === thesis.id}
              onClick={() => onThesisSelect(thesis)}
              sx={{
                borderRadius: 1,
                mb: 1,
                py: 2,
                '&.Mui-selected': {
                  bgcolor: '#efbf04',
                  color: '#000000',
                  '&:hover': {
                    bgcolor: '#d4a503',
                  },
                },
                '&:hover': {
                  bgcolor: 'rgba(239, 191, 4, 0.1)',
                },
              }}
            >
              <Box sx={{ width: '100%' }}>
                <ListItemText
                  primary={
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {thesis.title}
                    </Typography>
                  }
                  secondary={
                    <Typography component="div" variant="body2" color="inherit">
                      <Stack spacing={1} sx={{ mt: 1 }}>
                        <Typography component="span" variant="body2" color="inherit">
                          {thesis.author} • {thesis.year}
                        </Typography>
                        <Stack direction="row" spacing={1}>
                          <Chip
                            label={thesis.program}
                            size="small"
                            sx={{
                              bgcolor: '#4caf50',
                              color: '#FFFFFF',
                              fontSize: '0.75rem',
                            }}
                          />
                          <Chip
                            label={thesis.category}
                            size="small"
                            sx={{
                              bgcolor: '#1976d2',
                              color: '#FFFFFF',
                              fontSize: '0.75rem',
                            }}
                          />
                        </Stack>
                      </Stack>
                    </Typography>
                  }
                />
              </Box>
            </ListItemButton>
          </ListItem>
          {index < theses.length - 1 && <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />}
        </React.Fragment>
      ))}
    </List>
  );
};

export default ThesisList;