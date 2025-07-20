import React from 'react';
import { Box, Card, CardContent, Typography, IconButton, Tooltip } from '@mui/material';
import { Timer, Fullscreen, FullscreenExit } from '@mui/icons-material';

const ExamHeader = ({ exam, timeLeft, isFullscreen, toggleFullscreen, examRef }) => {
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  return (
    <Card
      sx={{
        bgcolor: '#050D31',
        border: '1px solid #efbf04',
        borderRadius: 2,
        mb: 3,
        boxShadow: '0 0 10px rgba(239, 191, 4, 0.3)',
      }}
    >
      <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <Box sx={{ mb: { xs: 2, sm: 0 } }}>
          <Typography
            variant="h4"
            sx={{
              fontFamily: '"Orbitron", sans-serif',
              fontWeight: 700,
              mb: 1,
              fontSize: { xs: '1.5rem', sm: '2rem' },
            }}
          >
            {exam.judul}
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.7, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
            Mata Kuliah: {exam.matakuliah?.nama || 'N/A'} ({exam.matakuliah?.kode || 'N/A'})
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Timer sx={{ color: '#efbf04', mr: 1, fontSize: { xs: 20, sm: 24 } }} />
            <Typography
              variant="h6"
              sx={{
                color: timeLeft <= 300 ? '#FF0000' : '#efbf04',
                fontWeight: 600,
                fontSize: { xs: '1rem', sm: '1.25rem' },
              }}
            >
              {formatTime(timeLeft)}
            </Typography>
          </Box>
          <Tooltip title={isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}>
            <IconButton
              onClick={() => {
                if (!isFullscreen && examRef.current.requestFullscreen) {
                  examRef.current.requestFullscreen();
                } else if (document.exitFullscreen) {
                  document.exitFullscreen();
                }
                toggleFullscreen();
              }}
              sx={{ color: '#efbf04' }}
            >
              {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
            </IconButton>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ExamHeader;