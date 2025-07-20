import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Paper, Button } from '@mui/material';
import { motion } from 'framer-motion';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const RegisterSuccessPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0A1A5C 0%, #050D31 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <Paper elevation={0} sx={{ p: 4, textAlign: 'center' }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 80, color: '#FFD700', mb: 2 }} />
            <Typography
              variant="h4"
              sx={{ color: '#E0E7FF', mb: 2, fontWeight: 700, letterSpacing: '0.02em' }}
            >
              Registrasi Berhasil!
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: '#FFD700', mb: 4, opacity: 0.9 }}
            >
              Silakan cek email Anda untuk mengonfirmasi akun. Pastikan untuk memeriksa folder spam jika email tidak ditemukan.
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => navigate('/login')}
              sx={{ py: 1.5 }}
            >
              Kembali ke Masuk
            </Button>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default RegisterSuccessPage;