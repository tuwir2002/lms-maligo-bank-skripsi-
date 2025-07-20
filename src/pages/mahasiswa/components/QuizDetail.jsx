import React, { useState, useEffect } from 'react';
import { useParams, useOutletContext, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Divider,
  CircularProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
  LinearProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Chip,
  keyframes,
  Modal,
  IconButton,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { Quiz as QuizIcon, Save, ArrowBack, ArrowForward, Close } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import theme from '../styles/theme';

// Animasi keyframes untuk efek neon glow
const neonGlow = keyframes`
  0% { box-shadow: 0 0 5px #efbf04, 0 0 10px #efbf04, 0 0 15px #efbf04; }
  50% { box-shadow: 0 0 10px #efbf04, 0 0 20px #efbf04, 0 0 30px #efbf04; }
  100% { box-shadow: 0 0 5px #efbf04, 0 0 10px #efbf04, 0 0 15px #efbf04; }
`;

// Helper function to render instructions
const renderInstructions = (instructions) => {
  if (!instructions || !Array.isArray(instructions)) return null;
  return instructions.map((node, index) => {
    if (node.type === 'paragraph' && node.children) {
      return (
        <Typography key={index} variant="body2" sx={{ mb: 1, color: '#FFFFFF', opacity: 0.8 }}>
          {node.children.map((child, i) => child.text).join('')}
        </Typography>
      );
    }
    return null;
  });
};

// Helper function to normalize options
const normalizeOptions = (options) => {
  if (!options || !Array.isArray(options)) return [];
  return options.map((option) => {
    if (option.type === 'paragraph' && option.children && option.children[0]?.text) {
      return option.children[0].text.trim();
    }
    return typeof option === 'string' ? option.trim() : '';
  }).filter(Boolean);
};

// Helper function to normalize strings for comparison
const normalizeString = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove non-alphanumeric characters except spaces
    .replace(/\s+/g, ' '); // Normalize multiple spaces to single
};

const QuizDetail = () => {
  const { code, meetingNumber, quizId } = useParams();
  const { course } = useOutletContext();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [quiz, setQuiz] = useState(null);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openModal, setOpenModal] = useState(true);

  useEffect(() => {
    const checkPreviousMeetings = async () => {
      try {
        const currentMeetingNumber = parseInt(meetingNumber);
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.username) {
          throw new Error('User not found in localStorage');
        }

        // Fetch student data
        const mahasiswaResponse = await fetch('http://localhost:1337/api/mahasiswas');
        if (!mahasiswaResponse.ok) {
          throw new Error(`Failed to fetch student data: ${mahasiswaResponse.statusText}`);
        }
        const mahasiswaData = await mahasiswaResponse.json();
        const student = mahasiswaData.data.find((m) => m.nim === user.username);
        if (!student) {
          throw new Error(`Student with NIM ${user.username} not found`);
        }

        // Check completion of previous meetings
        const previousMeetings = course.meetings.filter(
          (m) => m.meetingNumber < currentMeetingNumber
        );
        for (const meeting of previousMeetings) {
          if (meeting.progress !== undefined && meeting.progress < 100) {
            throw new Error(
              `Pertemuan ${meeting.meetingNumber} belum selesai (Progres: ${meeting.progress}%). Selesaikan semua pertemuan sebelumnya terlebih dahulu.`
            );
          }

          if (!meeting.progress && meeting.quizzes && meeting.quizzes.length > 0) {
            for (const quiz of meeting.quizzes) {
              const submissionResponse = await fetch(
                `http://localhost:1337/api/jawaban-kuises?filters[mahasiswa][id][$eq]=${student.id}&filters[soal_kuis][kuis][id][$eq]=${quiz.id}`
              );
              if (!submissionResponse.ok) {
                throw new Error(`Failed to fetch submissions for quiz ${quiz.id}`);
              }
              const submissionData = await submissionResponse.json();
              if (!submissionData.data || submissionData.data.length === 0) {
                throw new Error(
                  `Pertemuan ${meeting.meetingNumber} belum selesai. Selesaikan kuis "${quiz.instructions[0]?.children[0]?.text || 'Kuis Tanpa Nama'}" terlebih dahulu.`
                );
              }
            }
          }
        }

        // Load quiz
        if (course) {
          const selectedMeeting = course.meetings.find(
            (m) => m.meetingNumber === currentMeetingNumber
          );
          if (selectedMeeting) {
            const selectedQuiz = selectedMeeting.quizzes.find((q) => q.id === parseInt(quizId));
            if (selectedQuiz) {
              const now = new Date();
              const startTime = new Date(selectedQuiz.startTime);
              const endTime = new Date(selectedQuiz.endTime);
              if (now < startTime) {
                setError(`Kuis belum dimulai. Silakan kembali pada ${startTime.toLocaleString('id-ID')}`);
              } else if (now > endTime) {
                setError(`Kuis telah berakhir pada ${endTime.toLocaleString('id-ID')}`);
              } else if (!selectedQuiz.questions || selectedQuiz.questions.length === 0) {
                setError('Tidak ada soal tersedia untuk kuis ini.');
              } else {
                console.log('Raw quiz:', JSON.stringify(selectedQuiz, null, 2));
                // Normalize question options
                const normalizedQuiz = {
                  ...selectedQuiz,
                  questions: selectedQuiz.questions.map((question) => ({
                    ...question,
                    question: question.question || question.pertanyaan || '',
                    type: question.type || question.jenis || 'multiple_choice',
                    options: normalizeOptions(question.options || question.pilihan),
                    jawabanBenar: normalizeString(question.correctAnswer || question.jawabanBenar || ''),
                    bobot: Number(question.weight || question.bobot) || 0,
                  })),
                };
                console.log('Normalized quiz questions:', JSON.stringify(normalizedQuiz.questions, null, 2));
                setQuiz(normalizedQuiz);
                const initialAnswers = {};
                normalizedQuiz.questions.forEach((question) => {
                  initialAnswers[question.id] = question.type === 'multiple_choice' ? '' : '';
                });
                setAnswers(initialAnswers);

                if (selectedQuiz.timer) {
                  const [hours, minutes, seconds] = selectedQuiz.timer.split(':').map(Number);
                  const totalSeconds = hours * 3600 + minutes * 60 + seconds;
                  setTimeLeft(totalSeconds);
                }
              }
            } else {
              setError(`Kuis dengan ID ${quizId} tidak ditemukan untuk pertemuan ${meetingNumber}.`);
            }
          } else {
            setError(`Pertemuan dengan nomor ${meetingNumber} tidak ditemukan.`);
          }
        } else {
          setError(`Data kursus untuk kode ${code} tidak tersedia.`);
        }
      } catch (err) {
        setError(err.message);
        enqueueSnackbar(err.message, { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    checkPreviousMeetings();
  }, [course, meetingNumber, quizId, enqueueSnackbar]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId, value) => {
    console.log('Storing answer for question', questionId, ':', value);
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value, // Store raw value
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.username) {
        throw new Error('User not found in localStorage');
      }

      const mahasiswaResponse = await fetch('http://localhost:1337/api/mahasiswas');
      if (!mahasiswaResponse.ok) {
        throw new Error(`Failed to fetch student data: ${mahasiswaResponse.statusText}`);
      }
      const mahasiswaData = await mahasiswaResponse.json();
      const student = mahasiswaData.data.find((m) => m.nim === user.username);
      if (!student) {
        throw new Error(`Student with NIM ${user.username} not found`);
      }
      console.log('Found student:', JSON.stringify(student, null, 2));

      console.log('Answers before submission:', JSON.stringify(answers, null, 2));

      const submissionPromises = Object.entries(answers).map(([questionId, answer]) => {
        const question = quiz.questions.find((q) => q.id === parseInt(questionId));
        if (!question) {
          console.error('Question not found for ID:', questionId);
          return Promise.reject(new Error(`Question with ID ${questionId} not found`));
        }
        if (!answer) {
          console.warn('No answer provided for question:', questionId);
          return Promise.resolve(); // Skip empty answers
        }
        const normalizedAnswer = normalizeString(answer);
        const normalizedJawabanBenar = normalizeString(question.jawabanBenar);
        console.log('Comparing for question', questionId, ':', {
          normalizedAnswer,
          normalizedJawabanBenar,
          rawAnswer: answer,
          rawJawabanBenar: question.jawabanBenar,
          answerBytes: encodeURIComponent(answer),
          jawabanBenarBytes: encodeURIComponent(question.jawabanBenar),
          bobot: question.bobot,
        });
        const isCorrect =
          question.type === 'multiple_choice' &&
          (normalizedAnswer === normalizedJawabanBenar || answer === question.jawabanBenar);
        const nilai = question.type === 'multiple_choice' ? (isCorrect ? question.bobot : 0) : null;
        console.log('Score for question', questionId, ':', { isCorrect, nilai });
        const payload = {
          data: {
            soal_kui: question.documentId,
            mahasiswa: student.id,
            jawaban: answer,
            nilai,
          },
        };
        console.log('Submitting payload for question documentId', question.documentId, ':', JSON.stringify(payload, null, 2));
        return fetch('http://localhost:1337/api/jawaban-kuises', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      });

      const responses = await Promise.all(submissionPromises);
      for (const response of responses) {
        if (response && !response.ok) {
          const errorData = await response.json();
          console.error('Error response from server:', JSON.stringify(errorData, null, 2));
          throw new Error(`Failed to submit answer: ${errorData.error?.message || response.statusText}`);
        }
      }

      enqueueSnackbar('Jawaban telah disimpan!', { variant: 'success' });
      setOpenModal(false);
      navigate(`/mahasiswa/courses/${code}/pertemuan/${meetingNumber}`);
    } catch (err) {
      console.error('Error submitting quiz:', err.message);
      enqueueSnackbar(err.message, { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuestionSelect = (index) => {
    setCurrentQuestionIndex(index);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    navigate(`/mahasiswa/courses/${code}/pertemuan/${meetingNumber}`);
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress sx={{ color: '#efbf04' }} />
        </Box>
      </ThemeProvider>
    );
  }

  if (error) {
    return (
      <ThemeProvider theme={theme}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Typography variant="body2" sx={{ color: '#FFFFFF' }}>
            {error}
          </Typography>
        </Box>
      </ThemeProvider>
    );
  }

  if (!quiz) {
    return (
      <ThemeProvider theme={theme}>
        <Typography variant="body2" sx={{ color: '#FFFFFF', mt: 4 }}>
          Kuis tidak tersedia.
        </Typography>
      </ThemeProvider>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <ThemeProvider theme={theme}>
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="quiz-modal-title"
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Box
          sx={{
            bgcolor: '#050D31',
            borderRadius: 2,
            border: '1px solid #efbf04',
            p: 3,
            width: { xs: '90%', md: '80%' },
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative',
            animation: `${neonGlow} 2s infinite`,
          }}
        >
          <IconButton
            onClick={handleCloseModal}
            sx={{ position: 'absolute', top: 8, right: 8, color: '#efbf04' }}
          >
            <Close />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <QuizIcon sx={{ fontSize: 40, color: '#efbf04', mr: 2 }} />
            <Typography
              id="quiz-modal-title"
              variant="h4"
              sx={{ fontFamily: '"Orbitron", sans-serif', fontWeight: 500, color: '#FFFFFF' }}
            >
              {quiz.instructions[0]?.children[0]?.text || 'Kuis Tanpa Nama'}
            </Typography>
          </Box>
          <Typography
            variant="subtitle1"
            sx={{ mb: 2, color: '#efbf04', fontFamily: '"Orbitron", sans-serif' }}
          >
            Jenis: {quiz.type === 'multiple_choice' ? 'Pilihan Ganda' : quiz.type === 'esai' ? 'Esai' : 'Tugas'}
          </Typography>
          {renderInstructions(quiz.instructions)}
          <Box sx={{ mt: 2, mb: 2, p: 2, bgcolor: 'rgba(239, 191, 4, 0.1)', borderRadius: 2 }}>
            <Typography variant="body2" sx={{ mb: 1, opacity: 0.8, color: '#FFFFFF' }}>
              Waktu Mulai: {new Date(quiz.startTime).toLocaleString('id-ID')}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, opacity: 0.8, color: '#FFFFFF' }}>
              Waktu Selesai: {new Date(quiz.endTime).toLocaleString('id-ID')}
            </Typography>
            {quiz.timer && (
              <Box>
                <Typography variant="body2" sx={{ mb: 1, color: timeLeft > 0 ? '#efbf04' : '#ff4d4d' }}>
                  Sisa Waktu: {timeLeft > 0 ? formatTime(timeLeft) : 'Waktu Habis'}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(timeLeft / (quiz.timer.split(':').reduce((acc, time, index) => acc + time * Math.pow(60, 2 - index), 0))) * 100}
                  sx={{
                    bgcolor: 'rgba(239, 191, 4, 0.3)',
                    '& .MuiLinearProgress-bar': { bgcolor: '#efbf04' },
                  }}
                />
              </Box>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
            {/* Question Navigation */}
            <Box sx={{ width: { xs: '100%', md: '250px' }, flexShrink: 0 }}>
              <Typography
                variant="h6"
                sx={{ mb: 2, color: '#FFFFFF', fontFamily: '"Orbitron", sans-serif' }}
              >
                Navigasi Soal
              </Typography>
              <List sx={{ bgcolor: 'rgba(239, 191, 4, 0.05)', borderRadius: 2, p: 1 }}>
                {quiz.questions.map((question, index) => (
                  <ListItem key={question.id} disablePadding>
                    <ListItemButton
                      selected={index === currentQuestionIndex}
                      onClick={() => handleQuestionSelect(index)}
                      sx={{
                        '&:hover': { bgcolor: 'rgba(239, 191, 4, 0.1)' },
                        '&.Mui-selected': {
                          bgcolor: 'rgba(239, 191, 4, 0.2)',
                          '&:hover': { bgcolor: 'rgba(239, 191, 4, 0.3)' },
                        },
                        py: 1,
                      }}
                    >
                      <ListItemText
                        primary={`Soal ${index + 1}`}
                        secondary={answers[question.id] ? 'Terjawab' : 'Belum Terjawab'}
                        primaryTypographyProps={{
                          sx: { color: '#FFFFFF', fontFamily: '"Orbitron", sans-serif' },
                        }}
                        secondaryTypographyProps={{
                          sx: { color: answers[question.id] ? '#efbf04' : '#FFFFFF', opacity: 0.7 },
                        }}
                      />
                      {answers[question.id] && (
                        <Chip
                          label="✔"
                          size="small"
                          sx={{ bgcolor: '#efbf04', color: '#050D31', ml: 1 }}
                        />
                      )}
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Box>
            {/* Quiz Content */}
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1" sx={{ mr: 2, opacity: 0.8, color: '#FFFFFF' }}>
                  Progres: Soal {currentQuestionIndex + 1} dari {quiz.questions.length}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={((currentQuestionIndex + 1) / quiz.questions.length) * 100}
                  sx={{
                    flexGrow: 1,
                    bgcolor: 'rgba(239, 191, 4, 0.3)',
                    '& .MuiLinearProgress-bar': { bgcolor: '#efbf04' },
                  }}
                />
              </Box>
              <Divider sx={{ bgcolor: 'rgba(239, 191, 4, 0.3)', mb: 2 }} />
              <Typography
                variant="h6"
                sx={{ mb: 2, color: '#FFFFFF', fontFamily: '"Orbitron", sans-serif' }}
              >
                Soal {currentQuestionIndex + 1}
              </Typography>
              {quiz.questions.length === 0 ? (
                <Typography variant="body2" sx={{ color: '#FFFFFF', opacity: 0.7 }}>
                  Tidak ada soal untuk kuis ini.
                </Typography>
              ) : (
                <Box
                  sx={{
                    bgcolor: 'rgba(239, 191, 4, 0.1)',
                    borderRadius: 2,
                    p: 3,
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 4px 20px rgba(239, 191, 4, 0.2)',
                    },
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontFamily: '"Orbitron", sans-serif', fontWeight: 500, mb: 2, color: '#FFFFFF' }}
                  >
                    {currentQuestion.question}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2, color: '#efbf04' }}>
                    Bobot: {currentQuestion.bobot}
                  </Typography>
                  {currentQuestion.type === 'multiple_choice' && (
                    <RadioGroup
                      value={answers[currentQuestion.id] || ''}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    >
                      {currentQuestion.options ? (
                        currentQuestion.options.map((option, optIndex) => (
                          <FormControlLabel
                            key={optIndex}
                            value={option}
                            control={<Radio sx={{ color: '#efbf04', '&.Mui-checked': { color: '#efbf04' } }} />}
                            label={option}
                            sx={{
                              color: '#FFFFFF',
                              mb: 1,
                              bgcolor: answers[currentQuestion.id] === option ? 'rgba(239, 191, 4, 0.2)' : 'transparent',
                              borderRadius: 1,
                              p: 1,
                            }}
                          />
                        ))
                      ) : (
                        <Typography variant="body2" sx={{ color: '#efbf04' }}>
                          Tidak ada pilihan tersedia untuk soal ini.
                        </Typography>
                      )}
                    </RadioGroup>
                  )}
                  {(currentQuestion.type === 'esai' || currentQuestion.type === 'tugas') && (
                    <TextField
                      multiline
                      rows={currentQuestion.type === 'esai' ? 4 : 6}
                      fullWidth
                      value={answers[currentQuestion.id] || ''}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      sx={{
                        '& .MuiInputBase-root': { color: '#FFFFFF', bgcolor: '#050D31' },
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#efbf04' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#efbf04' },
                        mb: 2,
                      }}
                      placeholder={currentQuestion.type === 'esai' ? 'Tulis jawaban Anda di sini...' : 'Tulis tugas Anda di sini...'}
                    />
                  )}
                </Box>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, mb: 4 }}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  disabled={currentQuestionIndex === 0}
                  sx={{
                    color: '#efbf04',
                    borderColor: '#efbf04',
                    borderRadius: 20,
                    '&:hover': {
                      bgcolor: '#efbf04',
                      color: '#050D31',
                    },
                  }}
                  onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                >
                  Soal Sebelumnya
                </Button>
                <Button
                  variant="outlined"
                  endIcon={<ArrowForward />}
                  disabled={currentQuestionIndex === quiz.questions.length - 1}
                  sx={{
                    color: '#efbf04',
                    borderColor: '#efbf04',
                    borderRadius: 20,
                    '&:hover': {
                      bgcolor: '#efbf04',
                      color: '#050D31',
                    },
                  }}
                  onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                >
                  Soal Selanjutnya
                </Button>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  disabled={isSubmitting || timeLeft === 0}
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
                  onClick={handleSubmit}
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Jawaban'}
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Modal>
    </ThemeProvider>
  );
};

export default QuizDetail;