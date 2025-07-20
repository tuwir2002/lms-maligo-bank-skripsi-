import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { Container, TextField, Button, Typography, Box, Paper, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { resetPassword } from '../../services/AuthService';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const ResetPasswordPage = () => {
  const [formData, setFormData] = useState({
    password: '',
    passwordConfirmation: '',
  });
  const [status, setStatus] = useState('form'); // form, loading, success, error
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.passwordConfirmation) {
      enqueueSnackbar('Kata sandi dan konfirmasi tidak cocok.', { variant: 'error' });
      return;
    }

    setStatus('loading');
    try {
      const params = new URLSearchParams(location.search);
      const code = params.get('code');
      if (!code) {
        throw new Error('Token reset tidak ditemukan.');
      }

      await resetPassword({
        code,
        password: formData.password,
        passwordConfirmation: formData.passwordConfirmation,
      });

      setStatus('success');
      enqueueSnackbar('Kata sandi berhasil direset! Silakan masuk.', { variant: 'success' });
      setTimeout(() => navigate('/login'), 2000); // Auto-redirect after 2s
    } catch (error) {
      console.error('Reset password error:', error);
      setStatus('error');
      enqueueSnackbar('Gagal mereset kata sandi: ' + (error.response?.data?.error?.message || error.message), { variant: 'error' });
    }
  };

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
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <Paper elevation={0} sx={{ p: 4, textAlign: 'center' }}>
            {status === 'form' || status === 'loading' ? (
              <>
                <Typography
                  variant="h4"
                  sx={{ color: '#E0E7FF', mb: 2, fontWeight: 700, letterSpacing: '0.02em' }}
                >
                  Reset Kata Sandi
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: '#FFD700', mb: 4, opacity: 0.9 }}
                >
                  Masukkan kata sandi baru untuk akun Anda.
                </Typography>
                <Box component="form" onSubmit={handleSubmit}>
                  <TextField
                    fullWidth
                    label="Kata Sandi Baru"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    margin="normal"
                    required
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(5, 13, 49, 0.5)',
                        color: '#E0E7FF',
                        '& fieldset': { borderColor: '#FFD700' },
                        '&:hover fieldset': { borderColor: '#E0E7FF' },
                        '&.Mui-focused fieldset': { borderColor: '#FFD700' },
                      },
                      '& .MuiInputLabel-root': { color: '#FFD700' },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#E0E7FF' },
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Konfirmasi Kata Sandi"
                    name="passwordConfirmation"
                    type="password"
                    value={formData.passwordConfirmation}
                    onChange={handleChange}
                    margin="normal"
                    required
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(5, 13, 49, 0.5)',
                        color: '#E0E7FF',
                        '& fieldset': { borderColor: '#FFD700' },
                        '&:hover fieldset': { borderColor: '#E0E7FF' },
                        '&.Mui-focused fieldset': { borderColor: '#FFD700' },
                      },
                      '& .MuiInputLabel-root': { color: '#FFD700' },
                      '& .MuiInputLabel-root.Mui-focused': { color: '#E0E7FF' },
                    }}
                  />
                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    color="secondary"
                    disabled={status === 'loading'}
                    sx={{ mt: 3, py: 1.5 }}
                  >
                    {status === 'loading' ? <CircularProgress size={24} color="inherit" /> : 'Reset Kata Sandi'}
                  </Button>
                  <Button
                    fullWidth
                    variant="text"
                    sx={{ mt: 2, color: '#FFD700', '&:hover': { color: '#E0E7FF' } }}
                    onClick={() => navigate('/login')}
                  >
                    Kembali ke Masuk
                  </Button>
                </Box>
              </>
            ) : status === 'success' ? (
              <>
                <CheckCircleOutlineIcon sx={{ fontSize: 80, color: '#FFD700', mb: 2 }} />
                <Typography
                  variant="h4"
                  sx={{ color: '#E0E7FF', mb: 2, fontWeight: 700, letterSpacing: '0.02em' }}
                >
                  Kata Sandi Diperbarui!
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: '#FFD700', mb: 4, opacity: 0.9 }}
                >
                  Kata sandi Anda telah berhasil direset. Anda akan diarahkan ke halaman masuk.
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
            ) : (
              <>
                <ErrorOutlineIcon sx={{ fontSize: 80, color: '#FFD700', mb: 2 }} />
                <Typography
                  variant="h4"
                  sx={{ color: '#E0E7FF', mb: 2, fontWeight: 700, letterSpacing: '0.02em' }}
                >
                  Gagal Mereset Kata Sandi
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: '#FFD700', mb: 4, opacity: 0.9 }}
                >
                  Terjadi kesalahan. Silakan coba lagi atau hubungi dukungan.
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => navigate('/forgot-password')}
                  sx={{ py: 1.5 }}
                >
                  Coba Lagi
                </Button>
              </>
            )}
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default ResetPasswordPage;