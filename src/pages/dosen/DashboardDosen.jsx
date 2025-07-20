import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, Card, CardContent, Button, Divider, CircularProgress, Alert } from '@mui/material';
import { School, People, EventAvailable, AssignmentTurnedIn } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DosenService from './utils/DosenService';

const StatCard = ({ title, value, icon, color }) => (
  <motion.div
    whileHover={{ scale: 1.03, boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)' }}
    transition={{ duration: 0.2 }}
  >
    <Card
      sx={{
        bgcolor: '#FFFFFF',
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease-in-out',
      }}
    >
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3, p: 3 }}>
        <Box sx={{ color, fontSize: '2.5rem' }}>{icon}</Box>
        <Box>
          <Typography variant="subtitle2" sx={{ color: '#1A237E', fontWeight: 500, opacity: 0.9 }}>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ color, fontWeight: 700 }}>
            {value}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  </motion.div>
);

const CourseCard = ({ courseName, students, progress }) => {
  const navigate = useNavigate();
  return (
    <motion.div
      whileHover={{ scale: 1.03, boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)' }}
    transition={{ duration: 0.2 }}
    >
      <Card
        sx={{
          bgcolor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease-in-out',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ color: '#1A237E', fontWeight: 600, mb: 2 }}>
            {courseName}
          </Typography>
          <Typography variant="body2" sx={{ color: '#757575', mb: 1 }}>
            Mahasiswa: {students}
          </Typography>
          <Typography variant="body2" sx={{ color: '#757575', mb: 3 }}>
            Kemajuan: {progress}%
          </Typography>
          <Button
            variant="contained"
            sx={{
              width: '100%',
              bgcolor: '#FFC107',
              color: '#FFFFFF',
              fontWeight: 500,
              '&:hover': { bgcolor: '#FFB300' },
              borderRadius: '8px',
              textTransform: 'none',
            }}
            onClick={() => navigate('/dosen/courses')}
          >
            Lihat Detail
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const DashboardDosen = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState([
    { title: 'Total Mata Kuliah', value: '0', icon: <School />, color: '#1A237E' },
    { title: 'Mahasiswa', value: '0', icon: <People />, color: '#1A237E' },
    { title: 'Mata Kuliah Berjalan', value: '0', icon: <EventAvailable />, color: '#1A237E' },
    { title: 'Penilaian Selesai', value: '0', icon: <AssignmentTurnedIn />, color: '#1A237E' },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.username) {
          throw new Error('Data pengguna tidak ditemukan di localStorage');
        }

        const nip = user.username;
        console.log('Fetching lecturer data for NIP:', nip);

        // Fetch lecturer data
        const lecturerData = await DosenService.getLecturerByNIP(nip);
        if (!lecturerData) {
          throw new Error(`Data dosen tidak ditemukan untuk NIP: ${nip}`);
        }
        console.log('Lecturer data:', lecturerData);

        // Get course IDs from lecturer data
        const courseIds = lecturerData.matakuliahs?.map(course => course.id) || [];

        // Fetch detailed course data
        const coursesData = await DosenService.getCoursesByIds(courseIds);
        console.log('Courses data:', coursesData); // Debug courses data

        // Fetch all students
        const studentsData = await DosenService.getAllStudents();

        // Filter valid students enrolled in lecturer's courses
        const enrolledStudents = studentsData.filter(student => 
          student && 
          student.attributes && 
          student.attributes.undangan_mahasiswas?.some(inv =>
            inv.matakuliah && courseIds.includes(inv.matakuliah.id)
          )
        );
        const totalStudents = enrolledStudents.length;

        // Format courses for display
        const formattedCourses = coursesData.map(course => ({
          courseName: course.nama || 'Mata Kuliah Tidak Diketahui',
          students: course.undangan_mahasiswas?.length || 0,
          progress: course.progress || 0, // Placeholder: No progress field
        }));

        // Calculate stats
        const ongoingCourses = coursesData.filter(course =>
          course.undangan_mahasiswas?.some(inv => inv.status_class === 'pending')
        ).length;
        const completedAssessments = enrolledStudents.reduce((sum, student) => 
          sum + (student.attributes.jawaban_ujians?.length || 0), 0);

        setCourses(formattedCourses);
        setStats([
          { title: 'Total Mata Kuliah', value: coursesData.length.toString(), icon: <School />, color: '#1A237E' },
          { title: 'Mahasiswa', value: totalStudents.toString(), icon: <People />, color: '#1A237E' },
          { title: 'Mata Kuliah Berjalan', value: ongoingCourses.toString(), icon: <EventAvailable />, color: '#1A237E' },
          {
            title: 'Penilaian Selesai',
            value: completedAssessments.toString(),
            icon: <AssignmentTurnedIn />,
            color: '#1A237E',
          },
        ]);
      } catch (error) {
        console.error('Error mengambil data dosen:', error);
        setError(`Gagal memuat data dashboard: ${error.message}. Silakan coba lagi nanti.`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#F5F7FA' }}>
      <Header title="Dashboard Dosen" />
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        <Sidebar open={open} handleDrawerToggle={handleDrawerToggle} role="dosen" />
        <Box
          sx={{
            flexGrow: 1,
            p: { xs: 3, sm: 5 },
            transition: 'margin 0.3s ease-in-out',
            width: open ? 'calc(100% - 260px)' : 'calc(100% - 70px)',
            mt: 8,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography
              variant="h3"
              sx={{
                color: '#1A237E',
                fontWeight: 700,
                mb: 2,
                fontFamily: '"Roboto", sans-serif',
              }}
            >
              Selamat Datang, Dosen
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: '#424242', mb: 5, maxWidth: '700px', fontSize: '1.1rem' }}
            >
              Kelola mata kuliah Anda, pantau kemajuan mahasiswa, dan tingkatkan pengalaman belajar dengan platform LMS MALIGO.
            </Typography>
          </motion.div>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 5 }}>
              {error}
            </Alert>
          ) : (
            <>
              <Grid container spacing={4} sx={{ mb: 6 }}>
                {stats.map((stat, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <StatCard {...stat} />
                  </Grid>
                ))}
              </Grid>

              <Typography
                variant="h4"
                sx={{
                  color: '#1A237E',
                  fontWeight: 600,
                  mb: 3,
                  fontFamily: '"Roboto", sans-serif',
                }}
              >
                Mata Kuliah
              </Typography>
              <Divider sx={{ mb: 4, borderColor: '#E0E0E0' }} />
              <Grid container spacing={4}>
                {courses.length > 0 ? (
                  courses.map((course, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <CourseCard {...course} />
                    </Grid>
                  ))
                ) : (
                  <Typography variant="body1" sx={{ color: '#757575' }}>
                    Tidak ada mata kuliah yang ditemukan.
                  </Typography>
                )}
              </Grid>

              <Box sx={{ mt: 6 }}>
                <Typography
                  variant="h4"
                  sx={{
                    color: '#1A237E',
                    fontWeight: 600,
                    mb: 3,
                    fontFamily: '"Roboto", sans-serif',
                  }}
                >
                  Akses Cepat
                </Typography>
                <Divider sx={{ mb: 4, borderColor: '#E0E0E0' }} />
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    sx={{
                      bgcolor: '#1A237E',
                      color: '#FFFFFF',
                      fontWeight: 500,
                      px: 4,
                      py: 1.5,
                      borderRadius: '8px',
                      textTransform: 'none',
                      '&:hover': { bgcolor: '#283593' },
                      flex: 1,
                      minWidth: '180px',
                    }}
                    onClick={() => navigate('/dosen/courses')}
                  >
                    Kelola Mata Kuliah
                  </Button>
                  <Button
                    variant="contained"
                    sx={{
                      bgcolor: '#FFC107',
                      color: '#FFFFFF',
                      fontWeight: 500,
                      px: 4,
                      py: 1.5,
                      borderRadius: '8px',
                      textTransform: 'none',
                      '&:hover': { bgcolor: '#FFB300' },
                      flex: 1,
                      minWidth: '180px',
                    }}
                    onClick={() => navigate('/dosen/progress')}
                  >
                    Lihat Kemajuan
                  </Button>
                  <Button
                    variant="contained"
                    sx={{
                      bgcolor: '#424242',
                      color: '#FFFFFF',
                      fontWeight: 500,
                      px: 4,
                      py: 1.5,
                      borderRadius: '8px',
                      textTransform: 'none',
                      '&:hover': { bgcolor: '#616161' },
                      flex: 1,
                      minWidth: '180px',
                    }}
                    onClick={() => navigate('/dosen/profile')}
                  >
                    Profil Saya
                  </Button>
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardDosen;