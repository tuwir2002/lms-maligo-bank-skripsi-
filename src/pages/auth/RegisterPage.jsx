import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../../services/AuthService';
import { useSnackbar } from 'notistack';
import { Container, TextField, Button, Typography, Box, Paper, CircularProgress, MenuItem } from '@mui/material';
import { motion } from 'framer-motion';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    peran: '',
  });
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerUser(formData);
      enqueueSnackbar('Registrasi berhasil! Silakan cek email untuk konfirmasi.', { variant: 'success' });
      navigate('/register-success');
    } catch (error) {
      console.error('Register error:', error);
      enqueueSnackbar('Registrasi gagal: ' + error.message, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Determine username field label based on peran
  const usernameLabel = formData.peran === 'Mahasiswa' ? 'NIM' : formData.peran === 'Dosen' ? 'NIP' : 'Nama Pengguna';

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
              Daftar ke MALIGO
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: '#FFD700', mb: 4, opacity: 0.9 }}
            >
              Bergabung dengan platform pembelajaran interaktif berbasis AI & AR
            </Typography>
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                select
                label="Peran"
                name="peran"
                value={formData.peran}
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
                  '& .MuiSelect-icon': { color: '#FFD700' },
                }}
              >
                <MenuItem value="Mahasiswa">Mahasiswa</MenuItem>
                <MenuItem value="Dosen">Dosen</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </TextField>
              <TextField
                fullWidth
                label={usernameLabel}
                name="username"
                value={formData.username}
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
                label="Email"
                name="email"
                type="email"
                value={formData.email}
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
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Daftar'}
              </Button>
              <Button
                fullWidth
                variant="text"
                sx={{ mt: 2, color: '#FFD700', '&:hover': { color: '#E0E7FF' } }}
                onClick={() => navigate('/login')}
              >
                Sudah punya akun? Masuk
              </Button>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default RegisterPage;