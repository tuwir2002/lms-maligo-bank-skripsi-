import React, { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  Fade,
  IconButton,
  Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useSnackbar } from 'notistack';
import { deleteKuis } from '../utils/CourseService';

const HapusKuisModal = ({ open, onClose, matakuliah, pertemuan, kuis, refreshMatakuliah }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  const truncateText = (text, maxLength = 50) => {
    if (!text) return 'Tidak ada instruksi';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  };

  const handleDelete = async () => {
    if (!kuis || !kuis.documentId) {
      enqueueSnackbar('Data kuis tidak valid', { variant: 'error' });
      return;
    }

    setLoading(true);
    try {
      await deleteKuis(kuis.documentId);
      enqueueSnackbar('Kuis berhasil dihapus', { variant: 'success' });
      refreshMatakuliah();
      onClose();
    } catch (error) {
      enqueueSnackbar(`Gagal menghapus kuis: ${error.message}`, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} closeAfterTransition>
      <Fade in={open} timeout={400}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: '#ffffff',
            borderRadius: 3,
            boxShadow: '0 16px 64px rgba(0, 0, 0, 0.3)',
            p: { xs: 3, sm: 4 },
            width: { xs: '90%', sm: 450 },
            maxHeight: '90vh',
            overflowY: 'auto',
            border: '1px solid #e0e7ff',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography
              variant="h6"
              sx={{
                color: '#050D31',
                fontWeight: 600,
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <WarningAmberIcon sx={{ color: '#d32f2f', fontSize: '1.5rem' }} />
              Hapus Kuis
            </Typography>
            <Tooltip title="Tutup">
              <IconButton
                onClick={onClose}
                sx={{
                  color: '#64748b',
                  '&:hover': { bgcolor: 'rgba(100, 116, 139, 0.1)' },
                }}
              >
                <CloseIcon fontSize="medium" />
              </IconButton>
            </Tooltip>
          </Box>

          <Typography
            variant="body2"
            sx={{
              color: '#64748b',
              mb: 3,
              fontSize: '0.875rem',
              lineHeight: 1.5,
            }}
          >
            Apakah Anda yakin ingin menghapus kuis berikut dari {matakuliah?.nama} - Pertemuan {pertemuan?.pertemuanKe}?
          </Typography>

          <Box sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: 2, mb: 3, border: '1px solid #e0e7ff' }}>
            <Typography
              variant="body1"
              sx={{
                color: '#1a202c',
                fontWeight: 500,
                fontSize: '0.875rem',
                mb: 1,
              }}
            >
              Jenis: {kuis?.jenis ? kuis.jenis.charAt(0).toUpperCase() + kuis.jenis.slice(1).replace('_', ' ') : 'Tidak diketahui'}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#64748b',
                fontSize: '0.75rem',
              }}
            >
              Instruksi: {truncateText(kuis?.instruksi?.[0]?.children?.[0]?.text)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              onClick={onClose}
              variant="outlined"
              sx={{
                textTransform: 'none',
                color: '#64748b',
                borderColor: '#64748b',
                px: 3,
                py: 1,
                borderRadius: 2,
                fontWeight: 500,
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: 'rgba(100, 116, 139, 0.1)',
                  borderColor: '#64748b',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              Batal
            </Button>
            <Button
              onClick={handleDelete}
              variant="contained"
              disabled={loading}
              sx={{
                bgcolor: '#d32f2f',
                color: '#ffffff',
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1,
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(211, 47, 47, 0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: '#b71c1c',
                  boxShadow: '0 6px 16px rgba(211, 47, 47, 0.3)',
                  transform: 'translateY(-2px)',
                },
                '&:disabled': {
                  bgcolor: '#64748b',
                  color: '#ffffff',
                  boxShadow: 'none',
                },
              }}
            >
              {loading ? 'Menghapus...' : 'Hapus'}
            </Button>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

export default HapusKuisModal;