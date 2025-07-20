import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

const FeatureCard = ({ title, description, icon }) => {
  return (
    <Card
      sx={{
        height: '100%',
        textAlign: 'center',
        p: 3,
        backgroundColor: '#FFFFFF',
        border: '1px solid rgba(134, 102, 0, 0.2)',
        boxShadow: '0 0 15px rgba(134, 102, 0, 0.3)',
        transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 0 25px rgba(134, 102, 0, 0.5)',
        },
      }}
    >
      <CardContent sx={{ px: 2, py: 4 }}>
        <Box sx={{ fontSize: '2.5rem', mb: 3, color: '#050D31' }}>{icon}</Box>
        <Typography
          variant="h6"
          sx={{ fontSize: '1.25rem', fontWeight: 600, mb: 2, mt:4, color: '#050D31' }}
        >
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: '#050D31', opacity: 0.8, lineHeight: 1.6 }}>
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;