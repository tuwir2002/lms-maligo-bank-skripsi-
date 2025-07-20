import React from 'react';
import {
  Box,
  Typography,
  Button,
  Divider,
  Chip,
  Stack,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

const ThesisDetail = ({ thesis, onDownload }) => {
  if (!thesis) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" sx={{ color: '#FFFFFF', opacity: 0.7 }}>
          Pilih skripsi untuk melihat detail
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ color: '#FFFFFF' }}>
      <Typography
        variant="h5"
        sx={{ fontWeight: 600, mb: 2, fontFamily: '"Orbitron", sans-serif' }}
      >
        {thesis.title}
      </Typography>

      <Divider sx={{ bgcolor: '#efbf04', mb: 2 }} />

      <Stack spacing={2}>
        {/* Author and Year */}
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500, color: '#efbf04' }}>
            Penulis
          </Typography>
          <Typography variant="body1">{thesis.author}</Typography>
        </Box>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500, color: '#efbf04' }}>
            Tahun
          </Typography>
          <Typography variant="body1">{thesis.year}</Typography>
        </Box>

        {/* Program Studi */}
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500, color: '#efbf04' }}>
            Program Studi
          </Typography>
          <Chip
            label={thesis.program}
            sx={{
              bgcolor: '#4caf50',
              color: '#FFFFFF',
              fontSize: '0.875rem',
              mt: 1,
            }}
          />
        </Box>

        {/* Category */}
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500, color: '#efbf04' }}>
            Kategori
          </Typography>
          <Chip
            label={thesis.category}
            sx={{
              bgcolor: '#1976d2',
              color: '#FFFFFF',
              fontSize: '0.875rem',
              mt: 1,
            }}
          />
        </Box>

        {/* Abstract */}
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500, color: '#efbf04' }}>
            Abstrak
          </Typography>
          <Typography
            variant="body2"
            sx={{
              mt: 1,
              color: '#FFFFFF',
              maxHeight: '200px',
              overflow: 'auto',
              bgcolor: 'rgba(255,255,255,0.05)',
              p: 2,
              borderRadius: 1,
            }}
            component="div" // Ensure no <p> nesting issues
          >
            {thesis.abstract || 'Tidak ada abstrak tersedia.'}
          </Typography>
        </Box>

        {/* Download Button */}
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={() => onDownload(thesis.id)}
          sx={{
            mt: 2,
            bgcolor: '#efbf04',
            color: '#000000',
            '&:hover': {
              bgcolor: '#d4a503',
            },
            fontWeight: 500,
            textTransform: 'none',
            px: 3,
            py: 1,
          }}
        >
          Unduh Skripsi
        </Button>
      </Stack>
    </Box>
  );
};

export default ThesisDetail;