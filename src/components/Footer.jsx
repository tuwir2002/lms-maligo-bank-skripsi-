import React from 'react';
import { Box, Typography, Container, Grid, Link } from '@mui/material';

const Footer = () => {
  return (
    <Box
      sx={{
        background: 'linear-gradient(180deg,rgb(54, 54, 54) 0%,rgb(31, 31, 31) 100%)',
        color: '#E0E7FF',
        py: 8,
        boxShadow: '0 0 15px rgba(134, 102, 0, 0.3)',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={6}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#FFD700' }}>
              MALIGO
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, lineHeight: 1.6 }}>
              Memberdayakan pendidikan dengan teknologi AI dan AR.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#FFD700' }}>
              Tautan Cepat
            </Typography>
            <Link
              href="/"
              color="inherit"
              underline="hover"
              sx={{ display: 'block', mb: 1.5, opacity: 0.8, '&:hover': { color: '#FFD700' } }}
            >
              Beranda
            </Link>
            <Link
              href="/#features"
              color="inherit"
              underline="hover"
              sx={{ display: 'block', mb: 1.5, opacity: 0.8, '&:hover': { color: '#FFD700' } }}
            >
              Fitur
            </Link>
            <Link
              href="/login"
              color="inherit"
              underline="hover"
              sx={{ display: 'block', mb: 1.5, opacity: 0.8, '&:hover': { color: '#FFD700' } }}
            >
              Masuk
            </Link>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#FFD700' }}>
              Hubungi Kami
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mb: 1.5 }}>
              Email: support@maligo.com
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Telepon: +62 123 456 7890
            </Typography>
          </Grid>
        </Grid>
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Typography variant="body2" sx={{ opacity: 0.6 }}>
            © {new Date().getFullYear()} MALIGO. Hak cipta dilindungi.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;