// src/components/TestimonialCard.jsx
import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { FormatQuote } from '@mui/icons-material';

const TestimonialCard = ({ name, role, quote }) => {
  return (
    <Card sx={{ height: '100%', p: 2, backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#ffffff' }}>
      <CardContent>
        <FormatQuote sx={{ fontSize: '2rem', opacity: 0.5, mb: 2 }} />
        <Typography variant="body1" sx={{ mb: 2, fontStyle: 'italic' }}>
          "{quote}"
        </Typography>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {name}
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.8 }}>
          {role}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default TestimonialCard;