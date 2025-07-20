import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { loginUser } from '../../services/AuthService';
import { useSnackbar } from 'notistack';
import { Container, TextField, Button, Typography, Box, Paper, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (typeof login !== 'function') {
        throw new Error('Fungsi login tidak tersedia di AuthContext');
      }
      const response = await loginUser(formData);
      console.log('Login user response:', response.user); // Debug
      login(response.jwt, response.user);
      enqueueSnackbar('Masuk berhasil!', { variant: 'success' });
      navigate(
        response.user.peran.toLowerCase() === 'dosen'
          ? '/dosen'
          : response.user.peran.toLowerCase() === 'mahasiswa'
          ? '/mahasiswa'
          : '/admin'
      );
    } catch (error) {
      console.error('Login error:', error);
      enqueueSnackbar('Masuk gagal: ' + error.message, { variant: 'error' });
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
              Masuk ke MALIGO
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: '#FFD700', mb: 4, opacity: 0.9 }}
            >
              Akses platform pembelajaran interaktif berbasis AI & AR
            </Typography>
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email atau NIP/NIM"
                name="identifier"
                value={formData.identifier}
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
                label="Kata Sandi"
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
              <Button
                fullWidth
                type="submit"
                variant="contained"
                color="secondary"
                disabled={loading}
                sx={{ mt: 3, py: 1.5 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Masuk'}
              </Button>
              <Button
                fullWidth
                variant="text"
                sx={{ mt: 2, color: '#FFD700', '&:hover': { color: '#E0E7FF' } }}
                onClick={() => navigate('/forgot-password')}
              >
                Lupa Kata Sandi?
              </Button>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default LoginPage;