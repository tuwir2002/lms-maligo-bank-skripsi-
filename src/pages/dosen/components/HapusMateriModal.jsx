import React, { useState, forwardRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  Slide, // Added Slide import
} from '@mui/material';
import { useSnackbar } from 'notistack';
import WarningIcon from '@mui/icons-material/Warning';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { deleteMateri } from '../utils/CourseService';

// Animasi transisi untuk modal
const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const HapusMateriModal = ({ open, onClose, matakuliah, pertemuan, materi, refreshMatakuliah }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!materi?.documentId) {
      enqueueSnackbar('Data materi tidak valid', { variant: 'error' });
      return;
    }

    setLoading(true);
    try {
      await deleteMateri(materi.documentId);
      enqueueSnackbar('Materi berhasil dihapus', { variant: 'success' });
      refreshMatakuliah();
      onClose();
    } catch (error) {
      enqueueSnackbar(error.message || 'Gagal menghapus materi', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      TransitionComponent={Transition}
      sx={{
        '& .MuiDialog-paper': {
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
          border: '1px solid #e8ecef',
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle sx={{ bgcolor: '#ffffff', borderBottom: '1px solid #e8ecef', py: 2, px: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ color: '#1a237e', fontWeight: 700 }}>
            Hapus Materi
          </Typography>
          <Button
            onClick={onClose}
            sx={{
              minWidth: 'auto',
              p: 0.5,
              color: '#546e7a',
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
            }}
          >
            <CloseIcon />
          </Button>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ bgcolor: '#ffffff', py: 4, px: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <WarningIcon sx={{ color: '#ffca28', fontSize: 32, mr: 2 }} />
          <Typography variant="h6" sx={{ color: '#263238', fontWeight: 600 }}>
            Konfirmasi Penghapusan
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ color: '#37474f', mb: 1 }}>
          Anda yakin ingin menghapus materi <strong>"{materi?.judul}"</strong> dari pertemuan <strong>"{pertemuan?.topik}"</strong> pada mata kuliah <strong>"{matakuliah?.nama}"</strong>?
        </Typography>
        <Typography variant="body2" sx={{ color: '#78909c' }}>
          Tindakan ini tidak dapat dibatalkan.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 3, bgcolor: '#f9fafb', borderTop: '1px solid #e8ecef', justifyContent: 'flex-end', gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            textTransform: 'none',
            borderColor: '#b0bec5',
            color: '#455a64',
            bgcolor: '#ffffff',
            px: 3,
            py: 1,
            fontWeight: 500,
            '&:hover': {
              bgcolor: '#f5f5f5',
              borderColor: '#90a4ae',
            },
          }}
          startIcon={<CloseIcon />}
        >
          Batal
        </Button>
        <Button
          onClick={handleDelete}
          variant="contained"
          color="error"
          disabled={loading}
          sx={{
            textTransform: 'none',
            bgcolor: '#c62828',
            px: 3,
            py: 1,
            fontWeight: 500,
            '&:hover': {
              bgcolor: '#b71c1c',
              boxShadow: '0 4px 16px rgba(198, 40, 40, 0.3)',
            },
            '&:disabled': {
              bgcolor: '#ef9a9a',
              color: '#ffffff',
            },
          }}
          startIcon={<DeleteIcon />}
        >
          Hapus
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default HapusMateriModal;