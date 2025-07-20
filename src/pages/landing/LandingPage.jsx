import React from 'react';
import { Box, Typography, Button, Container, Grid } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import theme from '../../theme/theme';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import FeatureCard from '../../components/FeatureCard';
import TestimonialCard from '../../components/TestimonialCard';
import ErrorBoundary from '../../components/ErrorBoundary';
import image1 from '../../assets/hero.jpg';

// Sample data for features and testimonials
const features = [
  {
    title: 'Pembelajaran Berbasis AI',
    description: 'Jalur pembelajaran yang dipersonalisasi dengan algoritma cerdas.',
    icon: '🧠',
  },
  {
    title: 'Pratinjau Kursus AR',
    description: 'Rasakan pratinjau kursus yang imersif dengan augmented reality.',
    icon: '🌐',
  },
  {
    title: 'Analitik Real-Time',
    description: 'Pantau kemajuan dengan analitik dan wawasan canggih.',
    icon: '📊',
  },
];

const testimonials = [
  {
    name: 'Dr. Andi',
    role: 'Dosen',
    quote: 'Wawasan berbasis AI telah mengubah cara saya mengelola kursus!',
  },
  {
    name: 'Siti',
    role: 'Mahasiswa',
    quote: 'Pratinjau AR membuat pembelajaran begitu menarik dan interaktif.',
  },
];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <ThemeProvider theme={theme}>
      <ErrorBoundary>
        <Box sx={{ background: 'linear-gradient(180deg, #0A1A5C 0%, #050D31 100%)', minHeight: '100vh' }}>
          {/* Navbar */}
          <Navbar />

          {/* Hero Section */}
          <Box
            sx={{
              py: { xs: 10, md: 16 },
              color: '#E0E7FF',
              textAlign: 'center',
              background: 'linear-gradient(45deg, #050D31 30%, #1A237E 90%)',
            }}
          >
            <Container maxWidth="lg">
              <Grid container spacing={6} alignItems="center" justifyContent="center">
                <Grid item xs={12} md={6}>
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: '2.25rem', sm: '3rem', md: '4rem' },
                      fontWeight: 700,
                      mb: 3,
                      lineHeight: 1.2,
                    }}
                  >
                    Modular Adaptive Learning and Intelligent Growth
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      fontSize: { xs: '1.125rem', md: '1.5rem' },
                      mb: 5,
                      opacity: 0.9,
                      maxWidth: '80%',
                      mx: 'auto',
                    }}
                  >
                    Maligo adalah aplikasi pembelajaran untuk mahasiswa
                  </Typography>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    onClick={() => navigate('/login')}
                    sx={{ px: 5, py: 1.5, fontSize: '1.125rem', borderRadius: 12 }}
                  >
                    Mulai Belajar Sekarang
                  </Button>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box
                    component="img"
                    src={image1}
                    alt="AI/AR LMS Hero"
                    sx={{
                      width: '100%',
                      maxWidth: 1500,
                      borderRadius: 5,
                      boxShadow: '0 0 25px rgba(134, 102, 0, 0.5)',
                      border: '1px solid rgba(134, 102, 0, 0.2)',
                      mt: { xs: 4, md: 0 },
                    }}
                  />
                </Grid>
              </Grid>
            </Container>
          </Box>

          {/* Features Section */}
          <Box sx={{ py: { xs: 8, md: 12 }, backgroundColor: 'transparent' }}>
            <Container maxWidth="lg">
              <Typography
                variant="h3"
                sx={{
                  fontSize: { xs: '1.75rem', md: '2.5rem' },
                  textAlign: 'center',
                  mb: 8,
                  color: '#E0E7FF',
                  fontWeight: 600,
                }}
              >
                Mengapa Memilih MALIGO?
              </Typography>
              <Grid container spacing={4} justifyContent="center">
                {features.map((feature, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <FeatureCard {...feature} />
                  </Grid>
                ))}
              </Grid>
            </Container>
          </Box>

          {/* Testimonials Section */}
          <Box
            sx={{
              py: { xs: 8, md: 12 },
              background: 'linear-gradient(45deg, #1A237E 0%, #050D31 100%)',
              color: '#E0E7FF',
            }}
          >
            <Container maxWidth="lg">
              <Typography
                variant="h3"
                sx={{
                  fontSize: { xs: '1.75rem', md: '2.5rem' },
                  textAlign: 'center',
                  mb: 8,
                  fontWeight: 600,
                }}
              >
                Apa Kata Pengguna Kami
              </Typography>
              <Grid container spacing={4} justifyContent="center">
                {testimonials.map((testimonial, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <TestimonialCard {...testimonial} />
                  </Grid>
                ))}
              </Grid>
            </Container>
          </Box>

          {/* CTA Section */}
          <Box
            sx={{
              py: { xs: 8, md: 12 },
              textAlign: 'center',
              background: 'linear-gradient(180deg, #050D31 0%, #0A1A5C 100%)',
            }}
          >
            <Container maxWidth="md">
              <Typography
                variant="h3"
                sx={{
                  fontSize: { xs: '1.75rem', md: '2.5rem' },
                  mb: 4,
                  color: '#E0E7FF',
                  fontWeight: 600,
                }}
              >
                Siap Mengubah Cara Belajar Anda?
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontSize: { xs: '1rem', md: '1.25rem' },
                  mb: 6,
                  color: '#FFD700',
                  opacity: 0.8,
                  maxWidth: '80%',
                  mx: 'auto',
                }}
              >
                Bergabunglah dengan ribuan pelajar dan pendidik dalam revolusi LMS berbasis AI.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={() => navigate('/register')}
                sx={{ px: 5, py: 1.5, fontSize: '1.125rem', borderRadius: 12 }}
              >
                Daftar Sekarang
              </Button>
            </Container>
          </Box>

          {/* Footer */}
          <Footer />
        </Box>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default LandingPage;