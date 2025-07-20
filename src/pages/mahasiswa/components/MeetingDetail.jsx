import React, { useState, useEffect } from 'react';
import { useParams, useOutletContext, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Divider,
  LinearProgress,
  CircularProgress,
  Alert,
  keyframes,
  Link,
  Modal,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { VideoLibrary, Description, Visibility, CheckCircle, Quiz as QuizIcon } from '@mui/icons-material';
import theme from '../styles/theme';
import { saveProgress, fetchCourseDetail } from '../service/courseService';

// Animasi keyframes untuk efek neon glow
const neonGlow = keyframes`
  0% { box-shadow: 0 0 5px #efbf04, 0 0 10px #efbf04, 0 0 15px #efbf04; }
  50% { box-shadow: 0 0 10px #efbf04, 0 0 20px #efbf04, 0 0 30px #efbf04; }
  100% { box-shadow: 0 0 5px #efbf04, 0 0 10px #efbf04, 0 0 15px #efbf04; }
`;

// Helper function to render text content with bold, links, and images
const renderTextContent = (text) => {
  if (!text) return null;
  console.log('Rendering textContent:', text);
  const lines = text.split('\n');
  return lines.map((line, index) => {
    const parts = line.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\)|\[IMAGE:[^\]]*?\])/g).filter(Boolean);
    console.log(`Line ${index} parts:`, parts);
    return (
      <Typography key={index} variant="body2" sx={{ mb: 1, whiteSpace: 'pre-wrap' }}>
        {parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={i} style={{ color: '#efbf04' }}>
                {part.slice(2, -2)}
              </strong>
            );
          }
          if (part.startsWith('[') && part.includes('](')) {
            const match = part.match(/\[(.+?)\]\((.+?)\)/);
            if (match) {
              return (
                <Link
                  key={i}
                  href={match[2]}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: '#efbf04', textDecoration: 'underline' }}
                >
                  {match[1]}
                </Link>
              );
            }
          }
          if (part.startsWith('[IMAGE:')) {
            const match = part.match(/\[IMAGE:([^|]*)\|([^|]*)\|([^|]*)\]/);
            console.log(`Image part ${i}:`, part, 'Match:', match);
            if (match) {
              return (
                <img
                  key={i}
                  src={match[1]}
                  alt={match[2] || `Image ${i + 1}`}
                  onError={(e) => {
                    console.log('Inline image failed to load:', match[1]);
                    e.target.src = 'https://via.placeholder.com/150?text=Image+Failed';
                  }}
                  style={{
                    width: '100%',
                    maxWidth: '300px',
                    borderRadius: '8px',
                    border: '2px solid #efbf04',
                    margin: '8px 0',
                    display: 'block',
                  }}
                />
              );
            }
          }
          return part;
        })}
      </Typography>
    );
  });
};

// Helper function to count words in textContent
const countWords = (text) => {
  if (!text) return 0;
  return text.split(/\s+/).filter((word) => word.length > 0).length;
};

// Helper function to convert YouTube URL to embed URL
const getYouTubeEmbedUrl = (url) => {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
      const videoId = urlObj.searchParams.get('v');
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    } else if (urlObj.hostname === 'youtu.be') {
      const videoId = urlObj.pathname.slice(1);
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
    return null;
  } catch (error) {
    console.error('Error parsing YouTube URL:', error.message);
    return null;
  }
};

const MeetingDetail = () => {
  const { code, meetingNumber } = useParams();
  const { course } = useOutletContext();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [error, setError] = useState(null);
  const [materialVisibility, setMaterialVisibility] = useState({});
  const [videoWatched, setVideoWatched] = useState({});
  const [openVideoModal, setOpenVideoModal] = useState(null);
  const [completeButtonEnabled, setCompleteButtonEnabled] = useState({});

  useEffect(() => {
    if (course) {
      console.log('Course data:', JSON.stringify(course, null, 2));
      const selectedMeeting = course.meetings.find(
        (m) => m.meetingNumber === parseInt(meetingNumber)
      );
      if (selectedMeeting) {
        console.log('Selected meeting:', JSON.stringify(selectedMeeting, null, 2));
        setMeeting(selectedMeeting);
        selectedMeeting.materials.forEach((material) => {
          console.log('Material:', JSON.stringify(material, null, 2));
          const wordCount = countWords(material.textContent);
          const delay = wordCount * 50;
          if (!material.videoUrl) {
            setTimeout(() => {
              setCompleteButtonEnabled((prev) => ({
                ...prev,
                [material.id]: true,
              }));
            }, delay);
          }
        });
      } else {
        setError('Pertemuan tidak ditemukan');
      }
    }
  }, [course, meetingNumber]);

  const toggleMaterialVisibility = (materialId) => {
    console.log('Toggling visibility for material:', materialId, 'New state:', !materialVisibility[materialId]);
    setMaterialVisibility((prev) => ({
      ...prev,
      [materialId]: !prev[materialId],
    }));
  };

  const handleVideoClick = (materialId) => {
    setVideoWatched((prev) => ({
      ...prev,
      [materialId]: true,
    }));
    setOpenVideoModal(materialId);
    const material = meeting.materials.find((m) => m.id === materialId);
    const wordCount = countWords(material.textContent);
    const delay = wordCount * 50;
    setTimeout(() => {
      setCompleteButtonEnabled((prev) => ({
        ...prev,
        [materialId]: true,
      }));
    }, delay);
  };

  const handleCloseVideoModal = () => {
    setOpenVideoModal(null);
  };

  const handleProgressUpdate = async (mahasiswaId, pertemuanId, materialId, status, existingDocumentId) => {
    try {
      console.log('Updating progress:', { mahasiswaId, pertemuanId, materialId, status, existingDocumentId });
      await saveProgress(mahasiswaId, pertemuanId, materialId, status, existingDocumentId);
      const user = JSON.parse(localStorage.getItem('user'));
      const updatedCourse = await fetchCourseDetail(code, user.username);
      const updatedMeeting = updatedCourse.meetings.find(
        (m) => m.meetingNumber === parseInt(meetingNumber)
      );
      console.log('Updated meeting:', JSON.stringify(updatedMeeting, null, 2));
      setMeeting(updatedMeeting);
    } catch (err) {
      console.error('Error updating progress:', err.message);
      setError(err.message);
    }
  };

  const handleNavigation = (direction) => {
    const currentMeetingIndex = course.meetings.findIndex(
      (m) => m.meetingNumber === parseInt(meetingNumber)
    );
    const targetIndex = direction === 'next' ? currentMeetingIndex + 1 : currentMeetingIndex - 1;
    if (targetIndex >= 0 && targetIndex < course.meetings.length) {
      const targetMeeting = course.meetings[targetIndex];
      const isUnlocked = currentMeetingIndex === 0 ||
        (direction === 'next' &&
          course.meetings[currentMeetingIndex].materials.every((material) =>
            course.meetings[currentMeetingIndex].progress.some(
              (p) => p.materialId === material.id && p.status === 'selesai'
            )
          )) ||
        direction === 'previous';
      if (isUnlocked) {
        const targetUrl = `/mahasiswa/courses/${code}/pertemuan/${targetMeeting.meetingNumber}`;
        navigate(targetUrl);
        if (direction === 'next') {
          window.location.reload();
        }
      } else {
        setError('Selesaikan semua materi pada pertemuan ini terlebih dahulu.');
      }
    }
  };

  const isQuizUnlocked = (index) => {
    if (index === 0) return true;
    const previousMeeting = course.meetings[index - 1];
    return previousMeeting.materials.every((material) =>
      previousMeeting.progress.some(
        (p) => p.materialId === material.id && p.status === 'selesai'
      )
    );
  };

  if (error) {
    return (
      <ThemeProvider theme={theme}>
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </ThemeProvider>
    );
  }

  if (!meeting) {
    return (
      <ThemeProvider theme={theme}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress sx={{ color: '#efbf04' }} />
        </Box>
      </ThemeProvider>
    );
  }

  const currentMeetingIndex = course.meetings.findIndex(
    (m) => m.meetingNumber === parseInt(meetingNumber)
  );

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ mt: 4 }}>
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
            <Typography
              variant="h4"
              sx={{ mb: 2, fontFamily: '"Orbitron", sans-serif', fontWeight: 500 }}
            >
              Pertemuan {meeting.meetingNumber}: {meeting.topic}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, opacity: 0.7 }}>
              Tanggal: {new Date(meeting.date).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, opacity: 0.7 }}>
              Progres: {meeting.progressPercentage}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={parseFloat(meeting.progressPercentage)}
              sx={{
                mb: 2,
                bgcolor: 'rgba(239, 191, 4, 0.3)',
                '& .MuiLinearProgress-bar': { bgcolor: '#efbf04' },
              }}
            />
          </CardContent>
        </Card>
        <Divider sx={{ bgcolor: 'rgba(239, 191, 4, 0.3)', mb: 2 }} />
        <Typography
          variant="h5"
          sx={{ mb: 2, color: '#FFFFFF', fontFamily: '"Orbitron", sans-serif' }}
        >
          Materi
        </Typography>
        {meeting.materials.length === 0 ? (
          <Typography variant="body2" sx={{ color: '#FFFFFF', opacity: 0.7 }}>
            Tidak ada materi untuk pertemuan ini.
          </Typography>
        ) : (
          meeting.materials.map((material) => {
            const materialProgress = meeting.progress.find(
              (p) => p.materialId === material.id
            ) || { status: 'belum_dibaca', documentId: null };
            const wordCount = countWords(material.textContent);
            const embedUrl = material.videoUrl ? getYouTubeEmbedUrl(material.videoUrl) : null;
            return (
              <Card
                key={material.id}
                sx={{
                  bgcolor: 'rgba(239, 191, 4, 0.1)',
                  borderRadius: 2,
                  mb: 2,
                  p: 2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography
                    variant="h6"
                    sx={{ fontFamily: '"Orbitron", sans-serif', fontWeight: 500, flexGrow: 1 }}
                  >
                    {material.title}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    Status: {materialProgress.status.replace('_', ' ').toUpperCase()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Visibility />}
                    sx={{
                      color: '#efbf04',
                      borderColor: '#efbf04',
                      borderRadius: 20,
                      '&:hover': {
                        bgcolor: '#efbf04',
                        color: '#050D31',
                      },
                    }}
                    onClick={() => {
                      toggleMaterialVisibility(material.id);
                      if (materialProgress.status === 'belum_dibaca') {
                        handleProgressUpdate(
                          course.studentId,
                          meeting.id,
                          material.id,
                          'sedang_dibaca',
                          materialProgress.documentId
                        );
                      }
                    }}
                  >
                    {materialVisibility[material.id] ? 'Sembunyikan Materi' : 'Lihat Materi'}
                  </Button>
                </Box>
                {materialVisibility[material.id] && (
                  <>
                    <Typography variant="body2" sx={{ mt: 1, mb: 2, opacity: 0.7 }}>
                      {material.description}
                    </Typography>
                    {material.videoUrl && (
                      <>
                        <Button
                          variant="outlined"
                          startIcon={<VideoLibrary />}
                          sx={{
                            mt: 2,
                            mr: 1,
                            color: '#efbf04',
                            borderColor: '#efbf04',
                            borderRadius: 20,
                            '&:hover': {
                              bgcolor: '#efbf04',
                              color: '#050D31',
                            },
                          }}
                          onClick={() => handleVideoClick(material.id)}
                          disabled={!embedUrl}
                        >
                          Tonton Video
                        </Button>
                        <Modal
                          open={openVideoModal === material.id}
                          onClose={handleCloseVideoModal}
                          aria-labelledby="video-modal-title"
                          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <Box
                            sx={{
                              bgcolor: '#050D31',
                              borderRadius: 2,
                              border: '1px solid #efbf04',
                              p: 2,
                              width: { xs: '90%', md: '70%' },
                              maxHeight: '80vh',
                              overflow: 'auto',
                            }}
                          >
                            <Typography
                              id="video-modal-title"
                              variant="h6"
                              sx={{ color: '#FFFFFF', mb: 2, fontFamily: '"Orbitron", sans-serif' }}
                            >
                              {material.title}
                            </Typography>
                            {embedUrl ? (
                              <Box sx={{ position: 'relative', paddingTop: '56.25%' }}>
                                <iframe
                                  src={embedUrl}
                                  title={material.title}
                                  style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    border: 'none',
                                  }}
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                />
                              </Box>
                            ) : (
                              <Typography variant="body2" sx={{ color: '#efbf04', mb: 2 }}>
                                Video tidak dapat ditampilkan karena URL tidak valid.
                              </Typography>
                            )}
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
                              onClick={handleCloseVideoModal}
                            >
                              Tutup
                            </Button>
                          </Box>
                        </Modal>
                      </>
                    )}
                    {material.fileUrl && material.fileUrl.length > 0 && (
                      <Box sx={{ mt: 2, mb: 2 }}>
                        <Typography variant="body2" sx={{ color: '#efbf04', mb: 1 }}>
                          Gambar (File):
                        </Typography>
                        {console.log('Rendering fileUrl images:', material.fileUrl)}
                        <Grid container spacing={2}>
                          {material.fileUrl.map((file) => (
                            <Grid item xs={12} sm={6} md= {4} key={file.id}>
                              <img
                                src={file.url}
                                alt={file.name}
                                onError={(e) => {
                                  console.log('File image failed to load:', file.url);
                                  e.target.src = 'https://via.placeholder.com/150?text=File+Image+Failed';
                                }}
                                style={{
                                  width: '100%',
                                  borderRadius: '8px',
                                  border: '2px solid #efbf04',
                                }}
                              />
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}
                    {material.documentUrl && material.documentUrl.length > 0 && (
                      <Box sx={{ mt: 2, mb: 2 }}>
                        <Typography variant="body2" sx={{ color: '#efbf04', mb: 1 }}>
                          Dokumen:
                        </Typography>
                        {console.log('Rendering documentUrl:', material.documentUrl)}
                        {material.documentUrl.map((doc) => (
                          <Button
                            key={doc.id}
                            variant="outlined"
                            startIcon={<Description />}
                            href={doc.url}
                            download={doc.name}
                            sx={{
                              mr: 1,
                              mb: 1,
                              color: '#efbf04',
                              borderColor: '#efbf04',
                              borderRadius: 20,
                              '&:hover': {
                                bgcolor: '#efbf04',
                                color: '#050D31',
                              },
                            }}
                          >
                            {doc.name}
                          </Button>
                        ))}
                      </Box>
                    )}
                    {material.textContent && (
                      <Box sx={{ mt: 2, mb: 2 }}>
                        <Typography variant="body2" sx={{ color: '#efbf04', mb: 1 }}>
                          Konten Teks:
                        </Typography>
                        {renderTextContent(material.textContent)}
                      </Box>
                    )}
                    <Button
                      variant="outlined"
                      startIcon={<CheckCircle />}
                      disabled={!completeButtonEnabled[material.id]}
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
                      onClick={() =>
                        handleProgressUpdate(
                          course.studentId,
                          meeting.id,
                          material.id,
                          'selesai',
                          materialProgress.documentId
                        )
                      }
                    >
                      Tandai Selesai
                    </Button>
                  </>
                )}
              </Card>
            );
          })
        )}
        {/* Quizzes Section */}
        <Divider sx={{ bgcolor: 'rgba(239, 191, 4, 0.3)', mb: 2, mt: 4 }} />
        <Typography
          variant="h5"
          sx={{ mb: 2, color: '#FFFFFF', fontFamily: '"Orbitron", sans-serif' }}
        >
          Kuis
        </Typography>
        {meeting.quizzes.length === 0 ? (
          <Typography variant="body2" sx={{ color: '#FFFFFF', opacity: 0.7 }}>
            Tidak ada kuis untuk pertemuan ini.
          </Typography>
        ) : (
          <List>
            {meeting.quizzes.map((quiz) => {
              const now = new Date();
              const startTime = new Date(quiz.startTime);
              const endTime = new Date(quiz.endTime);
              const isQuizAvailable = now >= startTime && now <= endTime;
              const isUnlocked = isQuizUnlocked(currentMeetingIndex);
              return (
                <ListItem key={quiz.id} sx={{ bgcolor: 'rgba(239, 191, 4, 0.05)', mb: 1, borderRadius: 2 }}>
                  <ListItemText
                    primary={quiz.instructions[0]?.children[0]?.text || 'Kuis Tanpa Nama'}
                    secondary={`Jenis: ${quiz.type === 'multiple_choice' ? 'Pilihan Ganda' : quiz.type === 'esai' ? 'Esai' : 'Tugas'} | Mulai: ${startTime.toLocaleString('id-ID')} | Selesai: ${endTime.toLocaleString('id-ID')}`}
                    primaryTypographyProps={{
                      sx: { color: '#FFFFFF', fontFamily: '"Orbitron", sans-serif' },
                    }}
                    secondaryTypographyProps={{ sx: { color: '#efbf04', opacity: 0.7 } }}
                  />
                  <Button
                    variant="contained"
                    startIcon={<QuizIcon />}
                    disabled={!isUnlocked || !isQuizAvailable}
                    sx={{
                      bgcolor: '#efbf04',
                      color: '#050D31',
                      borderRadius: 20,
                      '&:hover': {
                        bgcolor: '#d4a703',
                        animation: `${neonGlow} 1.5s infinite`,
                      },
                      '&.Mui-disabled': {
                        bgcolor: 'rgba(239, 191, 4, 0.3)',
                        color: '#050D31',
                      },
                    }}
                    onClick={() =>
                      navigate(`/mahasiswa/courses/${code}/pertemuan/${meetingNumber}/quiz/${quiz.id}`)
                    }
                  >
                    Kerjakan Kuis
                  </Button>
                </ListItem>
              );
            })}
          </List>
        )}
        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            variant="outlined"
            sx={{
              color: '#efbf04',
              borderColor: '#efbf04',
              borderRadius: 20,
              '&:hover': {
                bgcolor: '#efbf04',
                color: '#050D31',
              },
              visibility: meeting.meetingNumber === 1 ? 'hidden' : 'visible',
            }}
            onClick={() => handleNavigation('previous')}
          >
            Sebelumnya
          </Button>
          <Button
            variant="outlined"
            sx={{
              color: '#efbf04',
              borderColor: '#efbf04',
              borderRadius: 20,
              '&:hover': {
                bgcolor: '#efbf04',
                color: '#050D31',
              },
              visibility: meeting.meetingNumber === course.meetings.length ? 'hidden' : 'visible',
            }}
            onClick={() => handleNavigation('next')}
          >
            Selanjutnya
          </Button>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default MeetingDetail;