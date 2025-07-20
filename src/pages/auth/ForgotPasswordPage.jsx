import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { Container, TextField, Button, Typography, Box, Paper, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import axios from 'axios';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      await axios.post(`${API_URL}/auth/forgot-password`, { email });
      enqueueSnackbar('Tautan reset kata sandi telah dikirim. Periksa kotak masuk Anda.', { variant: 'success' });
      navigate('/login');
    } catch (error) {
      console.error('Error sending reset email:', error);
      enqueueSnackbar('Gagal mengirim tautan reset. Silakan coba lagi.', { variant: 'error' });
    } finally {
      setLoading(false);
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
            <Typography
              variant="h4"
              sx={{ color: '#E0E7FF', mb: 2, fontWeight: 700, letterSpacing: '0.02em' }}
            >
              Lupa Kata Sandi
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: '#FFD700', mb: 4, opacity: 0.9 }}
            >
              Masukkan email Anda untuk menerima tautan reset kata sandi.
            </Typography>
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                disabled={loading}
                sx={{ mt: 3, py: 1.5 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Kirim Tautan Reset'}
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
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default ForgotPasswordPage;