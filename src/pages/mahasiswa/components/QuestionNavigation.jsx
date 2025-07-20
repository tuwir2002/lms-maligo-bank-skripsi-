import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Grid } from '@mui/material';

const QuestionNavigation = ({ questions, currentQuestionIndex, answers, handleQuestionSelect }) => {
  return (
    <Grid item xs={12} sm={3} md={2} sx={{ display: 'flex', flexDirection: 'column' }}>
      <Card
        sx={{
          bgcolor: '#050D31',
          border: '1px solid #efbf04',
          borderRadius: 2,
          flexGrow: 1,
          overflowY: 'auto',
        }}
      >
        <CardContent>
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              fontFamily: '"Orbitron", sans-serif',
              fontWeight: 600,
              fontSize: { xs: '1rem', sm: '1.25rem' },
            }}
          >
            Navigasi Soal
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(auto-fill, minmax(40px, 1fr))',
                sm: 'repeat(auto-fill, minmax(50px, 1fr))',
              },
              gap: 1,
            }}
          >
            {questions.map((_, index) => (
              <Chip
                key={index}
                label={index + 1}
                onClick={() => handleQuestionSelect(index)}
                sx={{
                  bgcolor:
                    currentQuestionIndex === index
                      ? '#efbf04'
                      : answers[questions[index].id]
                      ? 'rgba(239, 191, 4, 0.3)'
                      : '#0a0e2b',
                  color: currentQuestionIndex === index ? '#050D31' : '#FFFFFF',
                  fontWeight: currentQuestionIndex === index ? 600 : 400,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  height: { xs: 28, sm: 32 },
                  '&:hover': {
                    bgcolor: '#d4a703',
                    color: '#050D31',
                  },
                  transition: 'all 0.2s ease',
                }}
              />
            ))}
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );
};

export default QuestionNavigation;