import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  School as SchoolIcon,
  Code as CodeIcon,
  Event as EventIcon,
  Class as ClassIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { updateMatakuliah } from '../utils/CourseService';

// Professional color palette
const theme = {
  primary: '#1976d2',
  secondary: '#f5f5f5',
  accent: '#ffd700',
  text: '#1a202c',
  border: '#e0e0e0',
  error: '#d32f2f',
};

// Modal style
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  maxWidth: '95vw',
  bgcolor: '#ffffff',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  p: 4,
  borderRadius: 3,
  border: `1px solid ${theme.border}`,
  maxHeight: '90vh',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
};

const EditMatakuliahModal = ({ open, onClose, matakuliah, refreshMatakuliah }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    nama: '',
    kode: '',
    semester: '',
    sks: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (matakuliah) {
      setFormData({
        nama: matakuliah.nama || '',
        kode: matakuliah.kode || '',
        semester: matakuliah.semester ? matakuliah.semester.toString() : '',
        sks: matakuliah.sks ? matakuliah.sks.toString() : '',
      });
      setErrors({});
    }
  }, [matakuliah]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nama) newErrors.nama = 'Nama mata kuliah wajib diisi';
    if (!formData.kode) newErrors.kode = 'Kode mata kuliah wajib diisi';
    if (!formData.semester) newErrors.semester = 'Semester wajib diisi';
    else if (isNaN(formData.semester) || formData.semester < 1 || formData.semester > 8)
      newErrors.semester = 'Semester harus antara 1 dan 8';
    if (!formData.sks) newErrors.sks = 'SKS wajib diisi';
    else if (isNaN(formData.sks) || formData.sks < 1 || formData.sks > 6)
      newErrors.sks = 'SKS harus antara 1 dan 6';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      enqueueSnackbar('Harap lengkapi semua field dengan benar', { variant: 'warning' });
      return;
    }
    if (!matakuliah?.documentId) {
      enqueueSnackbar('Data mata kuliah tidak valid', { variant: 'error' });
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        nama: formData.nama,
        kode: formData.kode,
        semester: parseInt(formData.semester),
        sks: parseInt(formData.sks),
      };
      const response = await updateMatakuliah(matakuliah.documentId, submitData);
      enqueueSnackbar('Mata kuliah berhasil diperbarui', { variant: 'success' });
      refreshMatakuliah(response.data.data.documentId);
      onClose();
    } catch (error) {
      enqueueSnackbar('Gagal memperbarui mata kuliah', { variant: 'error' });
    } finally {
      setLoading(false);
      window.location.reload(); 
    }
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="edit-matakuliah-modal">
      <Box sx={modalStyle}>
        <Typography
          variant="h5"
          id="edit-matakuliah-modal"
          sx={{ color: theme.text, fontWeight: 600, mb: 2 }}
        >
          Edit Mata Kuliah
        </Typography>
        {matakuliah ? (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nama Mata Kuliah"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  required
                  error={!!errors.nama}
                  helperText={errors.nama || 'Masukkan nama mata kuliah'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SchoolIcon sx={{ color: theme.primary }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: theme.primary },
                      '&.Mui-focused fieldset': { borderColor: theme.primary },
                    },
                    input: { color: theme.text },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Kode Mata Kuliah"
                  name="kode"
                  value={formData.kode}
                  onChange={handleChange}
                  required
                  error={!!errors.kode}
                  helperText={errors.kode || 'Masukkan kode mata kuliah (contoh: MK-001)'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CodeIcon sx={{ color: theme.primary }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: theme.primary },
                      '&.Mui-focused fieldset': { borderColor: theme.primary },
                    },
                    input: { color: theme.text },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Semester"
                  name="semester"
                  type="number"
                  value={formData.semester}
                  onChange={handleChange}
                  required
                  error={!!errors.semester}
                  helperText={errors.semester || 'Masukkan semester (1-8)'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EventIcon sx={{ color: theme.primary }} />
                      </InputAdornment>
                    ),
                    inputProps: { min: 1, max: 8 },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: theme.primary },
                      '&.Mui-focused fieldset': { borderColor: theme.primary },
                    },
                    input: { color: theme.text },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="SKS"
                  name="sks"
                  type="number"
                  value={formData.sks}
                  onChange={handleChange}
                  required
                  error={!!errors.sks}
                  helperText={errors.sks || 'Masukkan jumlah SKS (1-6)'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <ClassIcon sx={{ color: theme.primary }} />
                      </InputAdornment>
                    ),
                    inputProps: { min: 1, max: 6 },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: theme.primary },
                      '&.Mui-focused fieldset': { borderColor: theme.primary },
                    },
                    input: { color: theme.text },
                  }}
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                onClick={onClose}
                startIcon={<CancelIcon />}
                variant="outlined"
                disabled={loading}
                sx={{
                  color: 'rgb(253, 238, 30)',
                  borderColor: theme.border,
                  '&:hover': { bgcolor: theme.secondary },
                }}
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={loading || !formData.nama || !formData.kode || !formData.semester || !formData.sks}
                sx={{
                  bgcolor: theme.primary,
                  '&:hover': { bgcolor: '#1565c0' },
                  boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
                  '&.Mui-disabled': { bgcolor: '#bdbdbd', color: '#fff' },
                }}
              >
                Simpan
              </Button>
            </Box>
          </form>
        ) : (
          <Typography sx={{ color: theme.error, opacity: 0.7 }}>
            Data mata kuliah tidak tersedia. Silakan pilih mata kuliah dari daftar.
          </Typography>
        )}
      </Box>
    </Modal>
  );
};

export default EditMatakuliahModal;