import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Alert, Grid } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../styles/theme';
import { fetchUjiansByMahasiswa, fetchMahasiswas, submitJawabanUjian } from '../service/ujianService';
import ExamHeader from '../components/ExamHeader';
import ProgressBar from '../components/ProgressBar';
import QuestionNavigation from '../components/QuestionNavigation';
import QuestionArea from '../components/QuestionArea';
import ExamDialogs from '../components/ExamDialogs';
import AntiCheat from '../components/AntiCheat';

const ExamInterface = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState(() => JSON.parse(localStorage.getItem(`exam_${examId}_answers`)) || {});
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [timeUpDialogOpen, setTimeUpDialogOpen] = useState(false);
  const [warningDialogOpen, setWarningDialogOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mahasiswaId, setMahasiswaId] = useState(null);
  const [violationCount, setViolationCount] = useState(0);
  const [violationHistory, setViolationHistory] = useState([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const examRef = useRef(null);
  const lastViolationTime = useRef(0);
  const DEBOUNCE_TIME = 2000; // 2 seconds debounce
  const MAX_VIOLATIONS = 3;

  // Function to convert timer (HH:mm:ss) to seconds
  const parseTimerToSeconds = (timer) => {
    if (!timer) return 0;
    const [hours, minutes, seconds] = timer.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };

  // Fetch user and mahasiswa data
  useEffect(() => {
    const loadUserAndMahasiswa = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.username) {
          throw new Error('User data not found in localStorage');
        }
        const mahasiswas = await fetchMahasiswas();
        const matchedMahasiswa = mahasiswas.find((m) => m.nim === user.username);
        if (!matchedMahasiswa) {
          throw new Error('No mahasiswa found matching the user NIM');
        }
        setMahasiswaId(matchedMahasiswa.id);
      } catch (err) {
        console.error('Error loading user or mahasiswa data:', err);
        setError(err.message);
      }
    };
    loadUserAndMahasiswa();
  }, []);

  // Fetch exam data
  useEffect(() => {
    const loadExam = async () => {
      try {
        setLoading(true);
        const exams = await fetchUjiansByMahasiswa();
        if (!Array.isArray(exams)) {
          throw new Error('Invalid exam data: Expected an array');
        }
        const selectedExam = exams.find((e) => e.id === parseInt(examId));
        if (!selectedExam) {
          throw new Error('Ujian tidak ditemukan atau Anda tidak terdaftar untuk ujian ini');
        }
        if (selectedExam.hasSubmitted) {
          setHasSubmitted(true);
          throw new Error('Ujian ini sudah Anda kumpulkan dan tidak dapat diakses kembali');
        }
        setExam(selectedExam);
        setQuestions(selectedExam.soal_ujians || []);
        const durationInSeconds = parseTimerToSeconds(selectedExam.timer);
        if (durationInSeconds <= 0) {
          throw new Error('Invalid timer duration');
        }
        setTimeLeft(durationInSeconds);
      } catch (err) {
        console.error('Error loading exam:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadExam();
  }, [examId]);

  // Save answers to localStorage
  useEffect(() => {
    if (!hasSubmitted) {
      localStorage.setItem(`exam_${examId}_answers`, JSON.stringify(answers));
    }
  }, [answers, examId, hasSubmitted]);

  // Timer logic
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || hasSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimeUpDialogOpen(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, hasSubmitted]);

  // Handle answer change
  const handleAnswerChange = (questionId, value) => {
    if (hasSubmitted) return;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  // Navigation between questions
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleQuestionSelect = (index) => {
    setCurrentQuestionIndex(index);
  };

  // Submit exam
  const handleSubmitExam = useCallback(async () => {
    if (hasSubmitted) {
      setError('Ujian sudah dikumpulkan sebelumnya.');
      return;
    }
    try {
      if (!mahasiswaId) {
        throw new Error('Mahasiswa ID not available');
      }
      const jawabanData = Object.entries(answers).map(([questionId, jawaban]) => ({
        jawaban,
        soal_ujian: parseInt(questionId),
        mahasiswa: mahasiswaId,
      }));

      await submitJawabanUjian(jawabanData);
      setHasSubmitted(true);
      localStorage.removeItem(`exam_${examId}_answers`);
      setSuccessDialogOpen(true);
    } catch (err) {
      setError(err.message);
    }
  }, [answers, examId, mahasiswaId, hasSubmitted]);

  // Handle time up
  const handleTimeUp = useCallback(() => {
    setTimeUpDialogOpen(false);
    handleSubmitExam();
  }, [handleSubmitExam]);

  // Handle violation with debounce and history
  const handleViolation = useCallback(
    (violationType) => {
      const now = Date.now();
      if (now - lastViolationTime.current < DEBOUNCE_TIME) {
        return; // Ignore if within debounce period
      }
      lastViolationTime.current = now;

      setViolationCount((prev) => {
        const newCount = prev + 1;
        setViolationHistory((prevHistory) => [
          ...prevHistory,
          { type: violationType, timestamp: new Date().toISOString() },
        ]);

        if (newCount >= MAX_VIOLATIONS) {
          handleSubmitExam();
          return newCount;
        }
        setWarningDialogOpen(true);
        return newCount;
      });
    },
    [handleSubmitExam]
  );

  // Calculate progress
  const progress = questions.length > 0 ? (Object.keys(answers).length / questions.length) * 100 : 0;

  // Check if submit button should be enabled
  const isSubmitEnabled = Object.keys(answers).length === questions.length || timeLeft <= 300;

  return (
    <ThemeProvider theme={theme}>
      <Box
        ref={examRef}
        sx={{
          bgcolor: '#0a0e2b',
          minHeight: '100vh',
          p: { xs: 2, sm: 3, md: 4 },
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 1000,
        }}
      >
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress sx={{ color: '#efbf04' }} />
          </Box>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 4, mx: 'auto', width: 'fit-content', maxWidth: '90%', zIndex: 1500 }}>
            {error}
          </Alert>
        )}
        {exam && !loading && !error && (
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <ExamHeader
              exam={exam}
              timeLeft={timeLeft}
              isFullscreen={isFullscreen}
              toggleFullscreen={() => setIsFullscreen((prev) => !prev)}
              examRef={examRef}
            />
            <ProgressBar progress={progress} answersCount={Object.keys(answers).length} totalQuestions={questions.length} />
            <Grid container spacing={2} sx={{ flexGrow: 1, mt: 2 }}>
              <QuestionNavigation
                questions={questions}
                currentQuestionIndex={currentQuestionIndex}
                answers={answers}
                handleQuestionSelect={handleQuestionSelect}
              />
              <QuestionArea
                questions={questions}
                currentQuestionIndex={currentQuestionIndex}
                answers={answers}
                handleAnswerChange={handleAnswerChange}
                handlePreviousQuestion={handlePreviousQuestion}
                handleNextQuestion={handleNextQuestion}
                setSubmitDialogOpen={setSubmitDialogOpen}
                isSubmitEnabled={isSubmitEnabled}
                mahasiswaId={mahasiswaId}
              />
            </Grid>
            <ExamDialogs
              submitDialogOpen={submitDialogOpen}
              setSubmitDialogOpen={setSubmitDialogOpen}
              successDialogOpen={successDialogOpen}
              setSuccessDialogOpen={setSuccessDialogOpen}
              timeUpDialogOpen={timeUpDialogOpen}
              warningDialogOpen={warningDialogOpen}
              setWarningDialogOpen={setWarningDialogOpen}
              answers={answers}
              questions={questions}
              handleSubmitExam={handleSubmitExam}
              handleTimeUp={handleTimeUp}
              navigate={navigate}
              violationCount={violationCount}
              violationHistory={violationHistory}
            />
            <AntiCheat
              isFullscreen={isFullscreen}
              setIsFullscreen={setIsFullscreen}
              examRef={examRef}
              handleViolation={handleViolation}
              setSubmitDialogOpen={setSubmitDialogOpen}
            />
          </Box>
        )}
      </Box>
    </ThemeProvider>
  );
};

export default ExamInterface;