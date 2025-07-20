import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  keyframes,
  CircularProgress,
  Alert,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { School } from '@mui/icons-material';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import theme from '../styles/theme';
import { fetchEnrolledCourses } from '../service/courseService';

// Animasi keyframes untuk efek neon glow
const neonGlow = keyframes`
  0% { box-shadow: 0 0 5px #efbf04, 0 0 10px #efbf04, 0 0 15px #efbf04; }
  50% { box-shadow: 0 0 10px #efbf04, 0 0 20px #efbf04, 0 0 30px #efbf04; }
  100% { box-shadow: 0 0 5px #efbf04, 0 0 10px #efbf04, 0 0 15px #efbf04; }
`;

const EnrolledCourses = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.username) {
          throw new Error('User not found in localStorage');
        }
        const enrolledCourses = await fetchEnrolledCourses(user.username);
        setCourses(enrolledCourses);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

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
          <Header title="Mata Kuliah Terdaftar" />

          {/* Courses Content */}
          <Box sx={{ mt: 4 }}>
            <Box
              sx={{
                p: 4,
                mb: 4,
                borderRadius: 2,
                bgcolor: '#050D31',
                color: '#FFFFFF',
                animation: `${neonGlow} 2s infinite`,
                border: '1px solid #efbf04',
              }}
            >
              <Typography
                variant="h3"
                sx={{ fontWeight: 700, fontFamily: '"Orbitron", sans-serif' }}
              >
                Mata Kuliah Anda
              </Typography>
              <Typography variant="body1" sx={{ mt: 1, opacity: 0.8 }}>
                Kelola dan pantau semua mata kuliah yang Anda ikuti.
              </Typography>
            </Box>

            {/* Loading State */}
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress sx={{ color: '#efbf04' }} />
              </Box>
            )}

            {/* Error State */}
            {error && (
              <Alert severity="error" sx={{ mb: 4 }}>
                {error}
              </Alert>
            )}

            {/* Course Cards */}
            {!loading && !error && courses.length === 0 && (
              <Typography variant="body1" sx={{ color: '#FFFFFF', textAlign: 'center' }}>
                Tidak ada mata kuliah terdaftar.
              </Typography>
            )}
            <Grid container spacing={3}>
              {courses.map((course, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
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
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <School sx={{ fontSize: 40, color: '#efbf04', mr: 2 }} />
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 600, fontFamily: '"Orbitron", sans-serif' }}
                        >
                          {course.title}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ opacity: 0.7 }}>
                        Kode: {course.code}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1, opacity: 0.7 }}>
                        Dosen: {course.lecturer}
                      </Typography>
                      <Chip
                        label={course.status}
                        sx={{
                          mt: 2,
                          bgcolor: course.status === 'Aktif' ? '#efbf04' : '#666',
                          color: course.status === 'Aktif' ? '#050D31' : '#FFFFFF',
                          fontWeight: 500,
                        }}
                      />
                      <Typography variant="body2" sx={{ mt: 2 }}>
                        Progres: {course.progress}%
                      </Typography>
                      <Box
                        sx={{
                          mt: 1,
                          height: 8,
                          borderRadius: 4,
                          bgcolor: 'rgba(239, 191, 4, 0.2)',
                        }}
                      >
                        <Box
                          sx={{
                            width: `${course.progress}%`,
                            height: '100%',
                            borderRadius: 4,
                            bgcolor: '#efbf04',
                            animation: `${neonGlow} 2s infinite`,
                          }}
                        />
                      </Box>
                      <Button
                        variant="outlined"
                        sx={{
                          mt: 3,
                          color: '#efbf04',
                          borderColor: '#efbf04',
                          borderRadius: 20,
                          '&:hover': {
                            bgcolor: '#efbf04',
                            color: '#050D31',
                          },
                        }}
                        onClick={() => window.location.href = `/mahasiswa/courses/${course.code}`}
                      >
                        Lihat Detail
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default EnrolledCourses;