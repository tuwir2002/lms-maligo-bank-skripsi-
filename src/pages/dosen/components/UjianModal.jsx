import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { useSnackbar } from 'notistack';

// Fungsi untuk mengonversi menit ke format HH:MM:SS
const minutesToHHMMSS = (minutes) => {
  if (!minutes || isNaN(minutes)) return '00:00:00';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const secs = 0;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

// Fungsi untuk mengonversi HH:MM:SS ke menit
const HHMMSSToMinutes = (timer) => {
  if (!timer || typeof timer !== 'string') return '';
  const [hours, minutes, seconds] = timer.split(':').map(Number);
  return hours * 60 + minutes + Math.round(seconds / 60);
};

const UjianModal = ({ open, onClose, onSave, exam, matakuliahOptions }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    judul: '',
    instruksi: '',
    waktuMulai: '',
    waktuSelesai: '',
    timer: '',
    matakuliahId: '',
  });

  useEffect(() => {
    if (exam) {
      setFormData({
        judul: exam.judul || '',
        instruksi: exam.instruksi || '',
        waktuMulai: exam.waktuMulai
          ? new Date(exam.waktuMulai).toISOString().slice(0, 16)
          : '',
        waktuSelesai: exam.waktuSelesai
          ? new Date(exam.waktuSelesai).toISOString().slice(0, 16)
          : '',
        timer: exam.timer ? HHMMSSToMinutes(exam.timer) : '',
        matakuliahId: exam.matakuliah?.id || '',
      });
    } else {
      setFormData({
        judul: '',
        instruksi: '',
        waktuMulai: '',
        waktuSelesai: '',
        timer: '',
        matakuliahId: '',
      });
    }
  }, [exam]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (
      !formData.judul ||
      !formData.instruksi ||
      !formData.waktuMulai ||
      !formData.waktuSelesai ||
      !formData.timer ||
      !formData.matakuliahId
    ) {
      enqueueSnackbar('Semua field harus diisi', { variant: 'warning' });
      return;
    }

    if (new Date(formData.waktuMulai) >= new Date(formData.waktuSelesai)) {
      enqueueSnackbar('Waktu selesai harus setelah waktu mulai', { variant: 'warning' });
      return;
    }

    if (!/^\d+$/.test(formData.timer) || parseInt(formData.timer) <= 0) {
      enqueueSnackbar('Durasi harus berupa angka positif (dalam menit)', { variant: 'warning' });
      return;
    }

    const examData = {
      judul: formData.judul,
      instruksi: formData.instruksi,
      waktuMulai: new Date(formData.waktuMulai).toISOString(),
      waktuSelesai: new Date(formData.waktuSelesai).toISOString(),
      timer: minutesToHHMMSS(parseInt(formData.timer)), // Konversi ke HH:MM:SS
      matakuliah: formData.matakuliahId, // ID langsung
    };

    console.log('Exam data to save:', JSON.stringify(examData, null, 2));
    onSave(examData);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 500,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: '#050D31' }}>
          {exam ? 'Edit Ujian' : 'Tambah Ujian'}
        </Typography>
        <TextField
          fullWidth
          label="Judul Ujian"
          name="judul"
          value={formData.judul}
          onChange={handleChange}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Instruksi"
          name="instruksi"
          value={formData.instruksi}
          onChange={handleChange}
          margin="normal"
          multiline
          rows={3}
          required
        />
        <TextField
          fullWidth
          label="Waktu Mulai"
          name="waktuMulai"
          type="datetime-local"
          value={formData.waktuMulai}
          onChange={handleChange}
          margin="normal"
          InputLabelProps={{ shrink: true }}
          required
        />
        <TextField
          fullWidth
          label="Waktu Selesai"
          name="waktuSelesai"
          type="datetime-local"
          value={formData.waktuSelesai}
          onChange={handleChange}
          margin="normal"
          InputLabelProps={{ shrink: true }}
          required
        />
        <TextField
          fullWidth
          label="Durasi (Menit)"
          name="timer"
          type="number"
          value={formData.timer}
          onChange={handleChange}
          margin="normal"
          required
        />
        <FormControl fullWidth margin="normal" required>
          <InputLabel>Mata Kuliah</InputLabel>
          <Select
            name="matakuliahId"
            value={formData.matakuliahId}
            onChange={handleChange}
            label="Mata Kuliah"
          >
            {matakuliahOptions.map((mk) => (
              <MenuItem key={mk.id} value={mk.id}>
                {mk.nama} ({mk.kode})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{ color: '#fff', borderColor: '#050D31' }}
          >
            Batal
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{ bgcolor: '#050D31', color: '#efbf04', '&:hover': { bgcolor: '#1a237e' } }}
          >
            Simpan
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default UjianModal;