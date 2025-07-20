import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';

const ProgressBar = ({ progress, answersCount, totalQuestions }) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="body2" sx={{ mb: 1, opacity: 0.7, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
        Kemajuan: {answersCount} dari {totalQuestions} soal dijawab
      </Typography>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          bgcolor: '#0a0e2b',
          '& .MuiLinearProgress-bar': { bgcolor: '#efbf04' },
          height: 8,
          borderRadius: 4,
        }}
      />
    </Box>
  );
};

export default ProgressBar;