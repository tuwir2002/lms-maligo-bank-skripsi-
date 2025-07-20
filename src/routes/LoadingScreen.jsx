import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const LoadingScreen = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: '#FFFFFF',
        background: 'linear-gradient(145deg, #FFFFFF 0%, #E0E7FF 100%)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <CircularProgress
          size={60}
          thickness={4}
          sx={{
            color: '#866600',
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            },
          }}
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Typography
          variant="h6"
          sx={{
            mt: 2,
            color: '#050D31',
            fontFamily: '"Orbitron", sans-serif',
            fontWeight: 600,
            letterSpacing: '0.02em',
          }}
        >
          Memuat...
        </Typography>
      </motion.div>
    </Box>
  );
};

export default LoadingScreen;