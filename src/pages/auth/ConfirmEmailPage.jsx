import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { confirmEmail } from '../../services/AuthService';
import { useSnackbar } from 'notistack';
import { Container, Typography, Box, Paper, CircularProgress, Button } from '@mui/material';
import { motion } from 'framer-motion';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const ConfirmEmailPage = () => {
  const [status, setStatus] = useState('loading');
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const confirm = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('confirmation');

      if (!token) {
        setStatus('error');
        enqueueSnackbar('Token konfirmasi tidak ditemukan.', { variant: 'error' });
        return;
      }

      try {
        await confirmEmail(token);
        setStatus('success');
        enqueueSnackbar('Email berhasil dikonfirmasi!', { variant: 'success' });
      } catch (error) {
        setStatus('error');
        enqueueSnackbar('Konfirmasi email gagal: ' + error.message, { variant: 'error' });
      }
    };

    confirm();
  }, [location, enqueueSnackbar]);

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
            {status === 'loading' && (
              <>
                <CircularProgress sx={{ color: '#FFD700', mb: 2 }} />
                <Typography
                  variant="h4"
                  sx={{ color: '#E0E7FF', mb: 2, fontWeight: 700, letterSpacing: '0.02em' }}
                >
                  Memverifikasi Email...
                </Typography>
                <Typography variant="body1" sx={{ color: '#FFD700', opacity: 0.9 }}>
                  Harap tunggu sebentar.
                </Typography>
              </>
            )}
            {status === 'success' && (
              <>
                <CheckCircleOutlineIcon sx={{ fontSize: 80, color: '#FFD700', mb: 2 }} />
                <Typography
                  variant="h4"
                  sx={{ color: '#E0E7FF', mb: 2, fontWeight: 700, letterSpacing: '0.02em' }}
                >
                  Email Terkonfirmasi!
                </Typography>
                <Typography variant="body1" sx={{ color: '#FFD700', mb: 4, opacity: 0.9 }}>
                  Akun Anda telah berhasil dikonfirmasi. Silakan masuk untuk melanjutkan.
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => navigate('/login')}
                  sx={{ py: 1.5 }}
                >
                  Masuk Sekarang
                </Button>
              </>
            )}
            {status === 'error' && (
              <>
                <ErrorOutlineIcon sx={{ fontSize: 80, color: '#FFD700', mb: 2 }} />
                <Typography
                  variant="h4"
                  sx={{ color: '#E0E7FF', mb: 2, fontWeight: 700, letterSpacing: '0.02em' }}
                >
                  Konfirmasi Gagal
                </Typography>
                <Typography variant="body1" sx={{ color: '#FFD700', mb: 4, opacity: 0.9 }}>
                  Terjadi kesalahan saat memverifikasi email Anda. Silakan coba lagi atau hubungi dukungan.
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => navigate('/login')}
                  sx={{ py: 1.5 }}
                >
                  Kembali ke Masuk
                </Button>
              </>
            )}
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default ConfirmEmailPage;