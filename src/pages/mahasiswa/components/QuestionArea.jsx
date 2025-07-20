import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Grid,
  Tooltip,
} from '@mui/material';
import { Assignment } from '@mui/icons-material';

const QuestionArea = ({
  questions,
  currentQuestionIndex,
  answers,
  handleAnswerChange,
  handlePreviousQuestion,
  handleNextQuestion,
  setSubmitDialogOpen,
  isSubmitEnabled,
  mahasiswaId,
}) => {
  const renderQuestion = (question) => {
    if (question.jenis === 'multiple_choice') {
      return (
        <RadioGroup
          value={answers[question.id] || ''}
          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
        >
          {question.pilihan?.map((option, index) => (
            <FormControlLabel
              key={index}
              value={option.children[0].text}
              control={<Radio sx={{ color: '#efbf04', '&.Mui-checked': { color: '#efbf04' } }} />}
              label={option.children[0].text}
              sx={{
                color: '#FFFFFF',
                mb: 1,
                bgcolor: 'rgba(239, 191, 4, 0.1)',
                p: 1,
                borderRadius: 1,
                fontSize: { xs: '0.9rem', sm: '1rem' },
              }}
            />
          ))}
        </RadioGroup>
      );
    } else if (question.jenis === 'esai') {
      return (
        <TextField
          fullWidth
          multiline
          rows={8}
          value={answers[question.id] || ''}
          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
          placeholder="Tulis jawaban Anda di sini..."
          sx={{
            bgcolor: '#0a0e2b',
            borderRadius: 1,
            '& .MuiInputBase-input': { color: '#FFFFFF', p: 2, fontSize: { xs: '0.9rem', sm: '1rem' } },
            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#efbf04' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#d4a703' },
          }}
          onPaste={(e) => e.preventDefault()} // Disable paste
          onCopy={(e) => e.preventDefault()} // Disable copy
        />
      );
    }
    return null;
  };

  return (
    <Grid
      item
      xs={12}
      sm={9}
      md={11}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {questions.length > 0 ? (
        <Card
          sx={{
            bgcolor: '#050D31',
            border: '1px solid #efbf04',
            borderRadius: 2,
            flexGrow: 1,
            transition: 'opacity 0.3s ease',
            opacity: 1,
            width: '100%',
            maxWidth: { xs: '100%', sm: '90%', md: 1200, lg: 1600 },
            display: 'flex',
            flexDirection: 'column',
            minHeight: { xs: 'auto', sm: 'calc(100vh - 200px)' },
            zIndex: 1200,
          }}
        >
          <CardContent
            sx={{
              px: { xs: 2, sm: 4 },
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Assignment sx={{ color: '#efbf04', mr: 1, fontSize: { xs: 24, sm: 30 } }} />
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: '"Orbitron", sans-serif',
                    fontWeight: 600,
                    fontSize: { xs: '1.2rem', sm: '1.5rem' },
                  }}
                >
                  Soal {currentQuestionIndex + 1} dari {questions.length}
                </Typography>
              </Box>
              <Typography
                variant="body1"
                sx={{ mb: 2, fontSize: { xs: '1rem', sm: '1.3rem' } }}
              >
                {questions[currentQuestionIndex].pertanyaan}
              </Typography>
              <Typography
                variant="body2"
                sx={{ mb: 3, color: '#efbf04', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
              >
                Bobot: {questions[currentQuestionIndex].bobot} poin
              </Typography>
              <Box sx={{ flexGrow: 1 }}>{renderQuestion(questions[currentQuestionIndex])}</Box>
            </Box>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                pt: 3,
                pb: 3,
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <Button
                variant="outlined"
                sx={{
                  color: '#efbf04',
                  borderColor: '#efbf04',
                  borderRadius: 1,
                  px: 3,
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  '&:hover': { bgcolor: 'rgba(239, 191, 4, 0.1)' },
                  zIndex: 1300,
                }}
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                Sebelumnya
              </Button>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  sx={{
                    color: '#efbf04',
                    borderColor: '#efbf04',
                    borderRadius: 1,
                    px: 3,
                    fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    '&:hover': { bgcolor: 'rgba(239, 191, 4, 0.1)' },
                    zIndex: 1300,
                  }}
                  onClick={handleNextQuestion}
                  disabled={currentQuestionIndex === questions.length - 1}
                >
                  Selanjutnya
                </Button>
                <Tooltip
                  title={
                    !isSubmitEnabled
                      ? 'Kumpulkan hanya tersedia jika semua soal dijawab atau waktu tersisa kurang dari 5 menit.'
                      : ''
                  }
                >
                  <span>
                    <Button
                      variant="contained"
                      sx={{
                        bgcolor: '#efbf04',
                        color: '#050D31',
                        borderRadius: 1,
                        px: 4,
                        fontWeight: 600,
                        fontSize: { xs: '0.8rem', sm: '0.875rem' },
                        '&:hover': { bgcolor: '#d4a703' },
                        '&.Mui-disabled': {
                          bgcolor: 'rgba(239, 191, 4, 0.3)',
                          color: '#050D31',
                        },
                        zIndex: 1400,
                      }}
                      onClick={() => setSubmitDialogOpen(true)}
                      disabled={!isSubmitEnabled || !mahasiswaId}
                    >
                      Selesai dan Kumpulkan
                    </Button>
                  </span>
                </Tooltip>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Typography
          variant="body1"
          sx={{ color: '#efbf04', flexGrow: 1, fontSize: { xs: '0.9rem', sm: '1rem' } }}
        >
          Tidak ada soal tersedia untuk ujian ini.
        </Typography>
      )}
    </Grid>
  );
};

export default QuestionArea;