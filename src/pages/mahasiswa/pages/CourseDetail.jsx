import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Outlet } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Avatar,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  keyframes,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { School, Lock, LockOpen, Quiz as QuizIcon } from '@mui/icons-material';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import theme from '../styles/theme';
import { fetchCourseDetail } from '../service/courseService';

// Animasi keyframes untuk efek neon glow
const neonGlow = keyframes`
  0% { box-shadow: 0 0 5px #efbf04, 0 0 10px #efbf04, 0 0 15px #efbf04; }
  50% { box-shadow: 0 0 10px #efbf04, 0 0 20px #efbf04, 0 0 30px #efbf04; }
  100% { box-shadow: 0 0 5px #efbf04, 0 0 10px #efbf04, 0 0 15px #efbf04; }
`;

const CourseDetail = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    const loadCourseDetail = async () => {
      try {
        setLoading(true);
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.username) {
          throw new Error('User not found in localStorage');
        }
        const courseData = await fetchCourseDetail(code, user.username);
        console.log('Fetched course data:', courseData);
        setCourse(courseData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadCourseDetail();
  }, [code]);

  const isMeetingUnlocked = (meeting, index, meetings) => {
    if (index === 0) return true;
    const previousMeeting = meetings[index - 1];
    return previousMeeting.materials.every((material) =>
      previousMeeting.progress.some(
        (p) => p.materialId === material.id && p.status === 'selesai'
      )
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0a0e2b' }}>
        <Sidebar open={sidebarOpen} handleDrawerToggle={handleDrawerToggle} role="mahasiswa" />
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
          <Header title="Detail Mata Kuliah" />
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress sx={{ color: '#efbf04' }} />
            </Box>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 4 }}>
              {error}
            </Alert>
          )}
          {course && (
            <Box sx={{ mt: 4 }}>
              {/* Course Header */}
              <Card
                sx={{
                  borderRadius: 2,
                  bgcolor: '#050D31',
                  color: '#FFFFFF',
                  animation: `${neonGlow} 2s infinite`,
                  border: '1px solid #efbf04',
                  mb: 4,
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <School sx={{ fontSize: 40, color: '#efbf04', mr: 2 }} />
                    <Typography
                      variant="h3"
                      sx={{ fontWeight: 700, fontFamily: '"Orbitron", sans-serif' }}
                    >
                      {course.title}
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ opacity: 0.7 }}>
                    Kode: {course.code}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1, opacity: 0.7 }}>
                    Semester: {course.semester}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1, opacity: 0.7 }}>
                    SKS: {course.sks}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1, opacity: 0.7 }}>
                    Program Studi: {course.programStudi}
                  </Typography>
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
                    onClick={() => navigate('/mahasiswa/courses')}
                  >
                    Kembali ke Daftar Mata Kuliah
                  </Button>
                </CardContent>
              </Card>

              {/* Lecturers Section */}
              <Typography
                variant="h4"
                sx={{ mt: 4, mb: 2, color: '#FFFFFF', fontFamily: '"Orbitron", sans-serif' }}
              >
                Dosen Pengampu
              </Typography>
              <Grid container spacing={3}>
                {course.lecturers.map((lecturer) => (
                  <Grid item xs={12} sm={6} md={4} key={lecturer.id}>
                    <Card
                      sx={{
                        borderRadius: 2,
                        bgcolor: '#050D31',
                        color: '#FFFFFF',
                        transition: 'transform 0.3s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          animation: `${neonGlow} 1.5s infinite`,
                        },
                        border: '1px solid rgba(239, 191, 4, 0.3)',
                      }}
                    >
                      <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar
                          src={lecturer.imageUrl}
                          sx={{ width: 60, height: 60, mr: 2, border: '2px solid #efbf04' }}
                        />
                        <Box>
                          <Typography
                            variant="h6"
                            sx={{ fontFamily: '"Orbitron", sans-serif', fontWeight: 500 }}
                          >
                            {lecturer.name}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.7 }}>
                            NIP: {lecturer.nip}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.7 }}>
                            NIDN: {lecturer.nidn}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Meeting Navigation and Details */}
              <Box sx={{ mt: 4, display: 'flex', gap: 4 }}>
                {/* Meeting Navigation */}
                <Box sx={{ width: '300px', flexShrink: 0 }}>
                  <Typography
                    variant="h5"
                    sx={{ mb: 2, color: '#FFFFFF', fontFamily: '"Orbitron", sans-serif' }}
                  >
                    Navigasi Pertemuan
                  </Typography>
                  <Card sx={{ bgcolor: '#050D31', border: '1px solid #efbf04', borderRadius: 2 }}>
                    <List>
                      {course.meetings.map((meeting, index) => {
                        const isUnlocked = isMeetingUnlocked(meeting, index, course.meetings);
                        return (
                          <ListItem key={meeting.id} disablePadding>
                            <ListItemButton
                              onClick={() =>
                                isUnlocked &&
                                navigate(`/mahasiswa/courses/${course.code}/pertemuan/${meeting.meetingNumber}`)
                              }
                              disabled={!isUnlocked}
                              sx={{
                                '&:hover': { bgcolor: 'rgba(239, 191, 4, 0.1)' },
                                py: 1,
                              }}
                            >
                              <ListItemIcon>
                                {isUnlocked ? (
                                  <LockOpen sx={{ color: '#efbf04' }} />
                                ) : (
                                  <Lock sx={{ color: '#efbf04' }} />
                                )}
                              </ListItemIcon>
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    {`Pertemuan ${meeting.meetingNumber}: ${meeting.topic}`}
                                    {meeting.quizzes && meeting.quizzes.length > 0 && (
                                      <Chip
                                        icon={<QuizIcon />}
                                        label={`${meeting.quizzes.length} Kuis`}
                                        size="small"
                                        sx={{
                                          ml: 1,
                                          bgcolor: '#efbf04',
                                          color: '#050D31',
                                          fontSize: '0.75rem',
                                        }}
                                      />
                                    )}
                                  </Box>
                                }
                                secondary={`Progres: ${meeting.progressPercentage}%`}
                                primaryTypographyProps={{
                                  sx: { color: '#FFFFFF', fontFamily: '"Orbitron", sans-serif' },
                                }}
                                secondaryTypographyProps={{ sx: { color: '#efbf04', opacity: 0.7 } }}
                              />
                            </ListItemButton>
                          </ListItem>
                        );
                      })}
                    </List>
                  </Card>
                </Box>
                {/* Meeting Details */}
                <Box sx={{ flexGrow: 1 }}>
                  <Typography
                    variant="h4"
                    sx={{ mb: 2, color: '#FFFFFF', fontFamily: '"Orbitron", sans-serif' }}
                  >
                    Detail Pertemuan
                  </Typography>
                  <Outlet context={{ course }} />
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default CourseDetail;