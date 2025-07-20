import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { updatePertemuan } from '../utils/CourseService';

const EditPertemuanModal = ({ open, onClose, matakuliah, pertemuan, refreshMatakuliah }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    pertemuanKe: '',
    topik: '',
    tanggal: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pertemuan) {
      setFormData({
        pertemuanKe: pertemuan.pertemuanKe || '',
        topik: pertemuan.topik || '',
        tanggal: pertemuan.tanggal ? new Date(pertemuan.tanggal).toISOString().split('T')[0] : '',
      });
    }
  }, [pertemuan]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!matakuliah?.id || !pertemuan?.documentId) {
      enqueueSnackbar('Data mata kuliah atau pertemuan tidak valid', { variant: 'error' });
      return;
    }

    setLoading(true);
    try {
      const data = {
        pertemuanKe: parseInt(formData.pertemuanKe, 10),
        topik: formData.topik,
        tanggal: formData.tanggal || null,
        matakuliah: matakuliah.id,
      };

      await updatePertemuan(pertemuan.documentId, data);
      enqueueSnackbar('Pertemuan berhasil diperbarui', { variant: 'success' });
      refreshMatakuliah();
      onClose();
    } catch (error) {
      enqueueSnackbar(error.message || 'Gagal memperbarui pertemuan', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e0e0e0',
        },
      }}
    >
      <DialogTitle sx={{ bgcolor: '#ffffff', borderBottom: '1px solid #e0e0e0', py: 2 }}>
        <Typography variant="h6" sx={{ color: '#1a237e', fontWeight: 700 }}>
          Edit Pertemuan
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ bgcolor: '#ffffff', py: 3 }}>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Nomor Pertemuan"
            name="pertemuanKe"
            type="number"
            value={formData.pertemuanKe}
            onChange={handleChange}
            margin="normal"
            required
            disabled={true}
            InputProps={{ inputProps: { min: 1 } }}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#e0e0e0' },
                '&:hover fieldset': { borderColor: '#0288d1' },
                '&.Mui-focused fieldset': { borderColor: '#0288d1' },
              },
              '& .MuiInputLabel-root': { color: '#616161' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#0288d1' },
            }}
          />
          <TextField
            fullWidth
            label="Topik"
            name="topik"
            value={formData.topik}
            onChange={handleChange}
            margin="normal"
            required
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#e0e0e0' },
                '&:hover fieldset': { borderColor: '#0288d1' },
                '&.Mui-focused fieldset': { borderColor: '#0288d1' },
              },
              '& .MuiInputLabel-root': { color: '#0d0840' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#0288d1' },
              '& .MuiInputBase-input': {
                  color: '#000 !important', // Force input text color with !important
                },
            }}
          />
          <TextField
            fullWidth
            label="Tanggal"
            name="tanggal"
            type="date"
            value={formData.tanggal}
            onChange={handleChange}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#e0e0e0' },
                '&:hover fieldset': { borderColor: '#0288d1' },
                '&.Mui-focused fieldset': { borderColor: '#0288d1' },
              },
              '& .MuiInputLabel-root': { color: '#616161' },
              '& .MuiInputLabel-root.Mui-focused': { color: '#0288d1' },
              '& .MuiInputBase-input': {
                  color: '#000 !important', // Force input text color with !important
                },
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, bgcolor: '#ffffff', borderTop: '1px solid #e0e0e0' }}>
        <Button
          onClick={onClose}
          variant="outlined"
          color="primary"
          sx={{
            textTransform: 'none',
            borderColor: '#0288d1',
            color: 'rgb(253, 238, 30)',
            bgcolor: '#ffffff',
            '&:hover': { 
              bgcolor: '#f5f5f5',
              borderColor: '#0277bd',
            },
          }}
        >
          Batal
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={loading}
          sx={{
            textTransform: 'none',
            bgcolor: '#0288d1',
            '&:hover': { 
              bgcolor: '#0277bd',
              boxShadow: '0 4px 12px rgba(2, 136, 209, 0.3)',
            },
          }}
        >
          Simpan
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditPertemuanModal;