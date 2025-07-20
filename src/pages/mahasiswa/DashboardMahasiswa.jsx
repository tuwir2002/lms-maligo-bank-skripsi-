import React, { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Avatar,
  Chip,
  keyframes,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { School, Assignment, CalendarToday, Notifications } from '@mui/icons-material';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import theme from './styles/theme';

// Animasi keyframes untuk efek neon glow
const neonGlow = keyframes`
  0% { box-shadow: 0 0 5px #efbf04, 0 0 10px #efbf04, 0 0 15px #efbf04; }
  50% { box-shadow: 0 0 10px #efbf04, 0 0 20px #efbf04, 0 0 30px #efbf04; }
  100% { box-shadow: 0 0 5px #efbf04, 0 0 10px #efbf04, 0 0 15px #efbf04; }
`;

const DashboardMahasiswa = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const dashboardCards = [
    {
      title: 'Mata Kuliah',
      icon: <School sx={{ fontSize: 50, color: '#efbf04' }} />,
      description: 'Akses materi dan aktivitas mata kuliah Anda.',
      actionText: 'Jelajahi',
      actionPath: '/mahasiswa/courses',
      chipLabel: '4 Kursus Aktif',
    },
    {
      title: 'Tugas',
      icon: <Assignment sx={{ fontSize: 50, color: '#efbf04' }} />,
      description: 'Kelola tugas dan lihat penilaian Anda.',
      actionText: 'Lihat Tugas',
      actionPath: '/mahasiswa/assignments',
      chipLabel: '2 Tugas Baru',
    },
    {
      title: 'Jadwal',
      icon: <CalendarToday sx={{ fontSize: 50, color: '#efbf04' }} />,
      description: 'Pantau jadwal kuliah dan tenggat waktu.',
      actionText: 'Lihat Jadwal',
      actionPath: '#',
      chipLabel: '3 Acara',
    },
    {
      title: 'Notifikasi',
      icon: <Notifications sx={{ fontSize: 50, color: '#efbf04' }} />,
      description: 'Dapatkan pembaruan dan pengumuman terbaru.',
      actionText: 'Cek Sekarang',
      actionPath: '#',
      chipLabel: '5 Baru',
    },
  ];

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0a0e2b' }}>
        {/* Sidebar */}
        <Sidebar open={sidebarOpen} handleDrawerToggle={handleDrawerToggle} role="mahasiswa" />

        {/* Main Content */}
        <Box
          sx={{
            flexGrow: 1,
            p: 4,
            mt: 8,
            ml: { xs: 0, sm: sidebarOpen ? '260px' : '70px' },
            transition: 'margin-left 0.3s ease-in-out',
            width: { xs: '100%', sm: `calc(100% - ${sidebarOpen ? '260px' : '70px'})` },
          }}
        >
          {/* Header */}
          <Header title="Dashboard Mahasiswa" />

          {/* Dashboard Content */}
          <Box sx={{ mt: 4 }}>
            {/* Welcome Section */}
            <Box
              sx={{
                p: 4,
                mb: 4,
                borderRadius: 2,
                bgcolor: '#050D31',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                animation: `${neonGlow} 2s infinite`,
                border: '1px solid #efbf04',
              }}
            >
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 700, fontFamily: '"Orbitron", sans-serif' }}>
                  Halo, Mahasiswa!
                </Typography>
                <Typography variant="body1" sx={{ mt: 1, opacity: 0.8 }}>
                  Jelajahi kemajuan akademik Anda dengan antarmuka futuristik.
                </Typography>
              </Box>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: '#efbf04',
                  color: '#050D31',
                  fontWeight: 700,
                  fontSize: 40,
                  animation: `${neonGlow} 2s infinite`,
                }}
              >
                M
              </Avatar>
            </Box>

            {/* Dashboard Cards */}
            <Grid container spacing={3}>
              {dashboardCards.map((card, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card
                    sx={{
                      borderRadius: 2,
                      bgcolor: '#050D31',
                      color: '#FFFFFF',
                      transition: 'transform 0.3s ease-in-out, box-shadow 0.3s',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        animation: `${neonGlow} 1.5s infinite`,
                      },
                      border: '1px solid rgba(239, 191, 4, 0.3)',
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center' }}>
                      {card.icon}
                      <Typography
                        variant="h6"
                        sx={{ mt: 2, fontWeight: 600, fontFamily: '"Orbitron", sans-serif' }}
                      >
                        {card.title}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1, opacity: 0.7 }}>
                        {card.description}
                      </Typography>
                      <Chip
                        label={card.chipLabel}
                        sx={{
                          mt: 2,
                          bgcolor: '#efbf04',
                          color: '#050D31',
                          fontWeight: 500,
                        }}
                      />
                      <Button
                        variant="outlined"
                        sx={{
                          mt: 2,
                          color: '#efbf04',
                          borderColor: '#efbf04',
                          borderRadius: 20,
                          '&:hover': {
                            bgcolor: '#efbf04',
                            color: '#050D31',
                          },
                        }}
                        onClick={() => (window.location.href = card.actionPath)}
                      >
                        {card.actionText}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Progress Overview */}
            <Box
              sx={{
                mt: 4,
                p: 4,
                borderRadius: 2,
                bgcolor: '#050D31',
                color: '#FFFFFF',
                border: '1px solid #efbf04',
                animation: `${neonGlow} 2s infinite`,
              }}
            >
              <Typography
                variant="h4"
                sx={{ fontWeight: 600, fontFamily: '"Orbitron", sans-serif', mb: 3 }}
              >
                Ringkasan Akademik
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                    Mata Kuliah Selesai (60%)
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={60}
                    sx={{
                      height: 12,
                      borderRadius: 6,
                      bgcolor: 'rgba(239, 191, 4, 0.2)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: '#efbf04',
                        animation: `${neonGlow} 2s infinite`,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                    Tugas Terselesaikan (80%)
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={80}
                    sx={{
                      height: 12,
                      borderRadius: 6,
                      bgcolor: 'rgba(239, 191, 4, 0.2)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: '#efbf04',
                        animation: `${neonGlow} 2s infinite`,
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default DashboardMahasiswa;