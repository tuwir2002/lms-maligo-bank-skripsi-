import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  Tooltip,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { AccessTime, Assignment, PlayArrow } from '@mui/icons-material';
import theme from '../styles/theme';
import { fetchUjiansByMahasiswa } from '../service/ujianService';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const ExamPage = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const loadExams = async () => {
      try {
        setLoading(true);
        const examData = await fetchUjiansByMahasiswa();
        console.log('Processed exam data:', examData);
        setExams(examData);
      } catch (err) {
        console.error('Error loading exams:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadExams();
  }, []);

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const groupExamsByCourse = (exams) => {
    console.log('Grouping exams:', exams);
    if (!Array.isArray(exams)) {
      console.warn('Exams is not an array:', exams);
      return {};
    }

    return exams.reduce((acc, exam) => {
      const courseName = exam.matakuliah?.nama || exam.judul || 'Tanpa Mata Kuliah';
      if (!acc[courseName]) {
        acc[courseName] = [];
      }
      acc[courseName].push(exam);
      return acc;
    }, {});
  };

  const handleStartExam = (examId) => {
    navigate(`/mahasiswa/exams/${examId}`);
  };

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const groupedExams = groupExamsByCourse(exams);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0a0e2b' }}>
        <Sidebar open={sidebarOpen} handleDrawerToggle={handleDrawerToggle} role="mahasiswa" />
        <Box
          sx={{
            flexGrow: 1,
            width: `calc(100% - ${sidebarOpen ? 260 : 70}px)`,
            transition: 'width 0.3s ease-in-out',
            ml: sidebarOpen ? '260px' : '70px',
          }}
        >
          <Header title="Daftar Ujian" />
          <Box
            sx={{
              p: { xs: 2, sm: 4 },
              color: '#FFFFFF',
              mt: '64px',
              minHeight: 'calc(100vh - 64px)',
            }}
          >
            <Typography
              variant="h3"
              sx={{ fontFamily: '"Orbitron", sans-serif', fontWeight: 700, mb: 4, textAlign: 'center' }}
            >
              Daftar Ujian
            </Typography>

            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress sx={{ color: '#efbf04' }} />
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 4, mx: 'auto', width: 'fit-content' }}>
                {error}
              </Alert>
            )}

            {!loading && !error && (
              <Box>
                {Object.keys(groupedExams).length === 0 ? (
                  <Typography variant="h6" sx={{ textAlign: 'center', color: '#efbf04' }}>
                    Tidak ada ujian tersedia saat ini.
                  </Typography>
                ) : (
                  Object.entries(groupedExams).map(([course, exams]) => (
                    <Box key={course} sx={{ mb: 4 }}>
                      <Typography
                        variant="h5"
                        sx={{ fontFamily: '"Orbitron", sans-serif', fontWeight: 600, mb: 2 }}
                      >
                        {course}
                      </Typography>
                      <Divider sx={{ bgcolor: '#efbf04', mb: 3 }} />
                      <Grid container spacing={3}>
                        {exams.map((exam) => {
                          const now = new Date();
                          const startTime = new Date(exam.waktuMulai);
                          const endTime = new Date(exam.waktuSelesai);
                          const isActive = now >= startTime && now <= endTime;
                          const hasStarted = now >= startTime;
                          const isSubmitted = exam.hasSubmitted;

                          return (
                            <Grid item xs={12} sm={6} md={4} key={exam.id}>
                              <Card
                                sx={{
                                  bgcolor: '#050D31',
                                  border: '1px solid #efbf04',
                                  borderRadius: 2,
                                  boxShadow: '0 0 10px rgba(239, 191, 4, 0.3)',
                                  transition: 'transform 0.2s ease',
                                  '&:hover': {
                                    transform: isSubmitted ? 'none' : 'scale(1.02)',
                                  },
                                }}
                              >
                                <CardContent>
                                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Assignment sx={{ color: '#efbf04', mr: 1, fontSize: 30 }} />
                                    <Typography
                                      variant="h6"
                                      sx={{ fontFamily: '"Orbitron", sans-serif', fontWeight: 600 }}
                                    >
                                      {exam.judul}
                                    </Typography>
                                  </Box>
                                  <Typography variant="body2" sx={{ mb: 1, opacity: 0.7 }}>
                                    Mata Kuliah: {exam.matakuliah?.nama || 'N/A'} ({exam.matakuliah?.kode || 'N/A'})
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <AccessTime sx={{ color: '#efbf04', mr: 1, fontSize: 20 }} />
                                    <Typography variant="body2" sx={{ opacity: 0.7 }}>
                                      Mulai: {formatDate(exam.waktuMulai)}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <AccessTime sx={{ color: '#efbf04', mr: 1, fontSize: 20 }} />
                                    <Typography variant="body2" sx={{ opacity: 0.7 }}>
                                      Selesai: {formatDate(exam.waktuSelesai)}
                                    </Typography>
                                  </Box>
                                  <Chip
                                    label={
                                      isSubmitted
                                        ? 'Sudah Dikumpulkan'
                                        : isActive
                                        ? 'Sedang Berlangsung'
                                        : hasStarted
                                        ? 'Selesai'
                                        : 'Belum Mulai'
                                    }
                                    sx={{
                                      bgcolor: isSubmitted
                                        ? '#757575'
                                        : isActive
                                        ? '#efbf04'
                                        : hasStarted
                                        ? '#d32f2f'
                                        : '#1976d2',
                                      color: isSubmitted || isActive ? '#050D31' : '#FFFFFF',
                                      fontWeight: 600,
                                      mb: 2,
                                    }}
                                  />
                                  <Tooltip
                                    title={
                                      isSubmitted
                                        ? 'Ujian ini sudah Anda kumpulkan dan tidak dapat diakses kembali.'
                                        : !isActive
                                        ? 'Ujian tidak sedang berlangsung.'
                                        : ''
                                    }
                                  >
                                    <span>
                                      <Button
                                        variant="contained"
                                        disabled={!isActive || isSubmitted}
                                        onClick={() => handleStartExam(exam.id)}
                                        sx={{
                                          bgcolor: '#efbf04',
                                          color: '#050D31',
                                          borderRadius: 1,
                                          fontWeight: 600,
                                          '&:hover': { bgcolor: '#d4a703' },
                                          '&.Mui-disabled': {
                                            bgcolor: 'rgba(239, 191, 4, 0.3)',
                                            color: '#050D31',
                                          },
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: 1,
                                        }}
                                      >
                                        <PlayArrow />
                                        Mulai Ujian
                                      </Button>
                                    </span>
                                  </Tooltip>
                                </CardContent>
                              </Card>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </Box>
                  ))
                )}
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default ExamPage;