import React, { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  FormHelperText,
  Divider,
  Grid,
} from '@mui/material';
import { Add, Delete, Close } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { createKuis, createSoalKuis } from '../utils/CourseService';

// Convert minutes to HH:mm:ss format
const minutesToHHMMSS = (minutes) => {
  if (!minutes || isNaN(minutes)) return null;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`;
};

const AddKuisModal = ({ open, onClose, matakuliah, pertemuan, refreshMatakuliah }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    jenis: 'multiple_choice',
    instruksi: '',
    waktuMulai: '',
    waktuSelesai: '',
    timer: '',
    bobot: '',
    soal: {
      pertanyaan: '',
      pilihan: ['', '', '', ''],
      jawabanBenar: '',
    },
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.instruksi) newErrors.instruksi = 'Instruksi wajib diisi';
    if (!formData.waktuMulai) newErrors.waktuMulai = 'Waktu mulai wajib diisi';
    if (!formData.waktuSelesai) newErrors.waktuSelesai = 'Waktu selesai wajib diisi';
    if (!formData.bobot) newErrors.bobot = 'Bobot wajib diisi';
    if (formData.jenis === 'multiple_choice' && !formData.timer) newErrors.timer = 'Timer wajib diisi';
    if (formData.jenis === 'multiple_choice' && formData.timer && (!/^\d+$/.test(formData.timer) || parseInt(formData.timer, 10) <= 0)) {
      newErrors.timer = 'Timer harus berupa angka positif (dalam menit)';
    }
    if (!formData.soal.pertanyaan) newErrors.pertanyaan = 'Pertanyaan wajib diisi';
    if (formData.jenis === 'multiple_choice') {
      if (formData.soal.pilihan.some((p) => !p.trim())) newErrors.pilihan = 'Semua pilihan harus diisi';
      if (!formData.soal.jawabanBenar) newErrors.jawabanBenar = 'Jawaban benar wajib dipilih';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSoalChange = (e, index = null) => {
    const { name, value } = e.target;
    if (name === 'pertanyaan') {
      setFormData((prev) => ({
        ...prev,
        soal: { ...prev.soal, pertanyaan: value },
      }));
      setErrors((prev) => ({ ...prev, pertanyaan: '' }));
    } else if (name === 'pilihan' && index !== null) {
      const newPilihan = [...formData.soal.pilihan];
      newPilihan[index] = value;
      setFormData((prev) => ({
        ...prev,
        soal: { ...prev.soal, pilihan: newPilihan },
      }));
      setErrors((prev) => ({ ...prev, pilihan: '' }));
    } else if (name === 'jawabanBenar') {
      setFormData((prev) => ({
        ...prev,
        soal: { ...prev.soal, jawabanBenar: value },
      }));
      setErrors((prev) => ({ ...prev, jawabanBenar: '' }));
    }
  };

  const addPilihan = () => {
    setFormData((prev) => ({
      ...prev,
      soal: { ...prev.soal, pilihan: [...prev.soal.pilihan, ''] },
    }));
  };

  const removePilihan = (index) => {
    if (formData.soal.pilihan.length <= 2) {
      enqueueSnackbar('Minimal harus ada 2 pilihan jawaban', { variant: 'warning' });
      return;
    }
    const newPilihan = formData.soal.pilihan.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      soal: { ...prev.soal, pilihan: newPilihan },
    }));
  };

  const handleSubmit = async () => {
    if (!matakuliah || !pertemuan) {
      enqueueSnackbar('Data mata kuliah atau pertemuan tidak valid', { variant: 'error' });
      return;
    }

    if (!validateForm()) {
      enqueueSnackbar('Harap lengkapi semua kolom yang wajib diisi', { variant: 'error' });
      return;
    }

    setLoading(true);
    try {
      const kuisData = {
        data: {
          jenis: formData.jenis,
          instruksi: [
            {
              type: 'paragraph',
              children: [{ text: formData.instruksi.trim(), type: 'text' }],
            },
          ],
          waktuMulai: new Date(formData.waktuMulai).toISOString(),
          waktuSelesai: new Date(formData.waktuSelesai).toISOString(),
          timer: formData.jenis === 'multiple_choice' ? minutesToHHMMSS(parseInt(formData.timer, 10)) : null,
          pertemuan: { connect: [{ id: pertemuan.id }] },
        },
      };

      const kuisResponse = await createKuis(kuisData);
      const kuisId = kuisResponse.data.id;

      const soalKuisData = {
        data: {
          pertanyaan: formData.soal.pertanyaan.trim(),
          jenis: formData.jenis,
          pilihan:
            formData.jenis === 'multiple_choice'
              ? formData.soal.pilihan.map((text) => ({
                  type: 'paragraph',
                  children: [{ text: text.trim(), type: 'text' }],
                }))
              : null,
          jawabanBenar: formData.jenis === 'multiple_choice' ? formData.soal.jawabanBenar : null,
          bobot: parseInt(formData.bobot, 10),
          kuis: { connect: [{ id: kuisId }] },
        },
      };

      await createSoalKuis(soalKuisData);

      enqueueSnackbar('Kuis berhasil ditambahkan', { variant: 'success' });
      refreshMatakuliah();
      onClose();
      setFormData({
        jenis: 'multiple_choice',
        instruksi: '',
        waktuMulai: '',
        waktuSelesai: '',
        timer: '',
        bobot: '',
        soal: {
          pertanyaan: '',
          pilihan: ['', '', '', ''],
          jawabanBenar: '',
        },
      });
      setErrors({});
    } catch (error) {
      enqueueSnackbar(`Gagal menambahkan kuis: ${error.message}`, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 600 },
          bgcolor: '#ffffff',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#050D31' }}>
            Tambah Kuis Baru
          </Typography>
          <IconButton onClick={onClose} sx={{ color: '#050D31' }}>
            <Close />
          </IconButton>
        </Box>

        <Typography variant="body2" sx={{ mb: 3, color: '#050D31' }}>
          Lengkapi detail kuis untuk {matakuliah?.nama} - Pertemuan {pertemuan?.pertemuanKe}: {pertemuan?.topik}
        </Typography>

        <Divider sx={{ mb: 3, borderColor: '#e0e0e0' }} />

        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: '#050D31' }}>
          Informasi Kuis
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth margin="normal" required error={!!errors.jenis}>
              <InputLabel sx={{ color: '#050D31' }}>Jenis Kuis</InputLabel>
              <Select
                name="jenis"
                value={formData.jenis}
                onChange={handleChange}
                label="Jenis Kuis"
                sx={{ color: '#050D31' }}
              >
                <MenuItem value="multiple_choice">Pilihan Ganda</MenuItem>
                <MenuItem value="esai">Esai</MenuItem>
                <MenuItem value="tugas">Tugas</MenuItem>
              </Select>
              {errors.jenis && <FormHelperText>{errors.jenis}</FormHelperText>}
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Instruksi Kuis"
              name="instruksi"
              value={formData.instruksi}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={3}
              required
              error={!!errors.instruksi}
              helperText={errors.instruksi}
              InputLabelProps={{ style: { color: '#050D31' } }}
              sx={{
                '& .MuiInputBase-input': {
                  color: '#000000 !important', // Force input text color with !important
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Waktu Mulai"
              name="waktuMulai"
              type="datetime-local"
              value={formData.waktuMulai}
              onChange={handleChange}
              margin="normal"
              InputLabelProps={{ shrink: true, style: { color: '#050D31' } }}
              required
              error={!!errors.waktuMulai}
              helperText={errors.waktuMulai}
              sx={{ input: { color: '#050D31' } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Waktu Selesai"
              name="waktuSelesai"
              type="datetime-local"
              value={formData.waktuSelesai}
              onChange={handleChange}
              margin="normal"
              InputLabelProps={{ shrink: true, style: { color: '#050D31' } }}
              required
              error={!!errors.waktuSelesai}
              helperText={errors.waktuSelesai}
              sx={{ input: { color: '#050D31' } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            {formData.jenis === 'multiple_choice' && (
              <TextField
                fullWidth
                label="Timer (Menit)"
                name="timer"
                type="number"
                value={formData.timer}
                onChange={handleChange}
                margin="normal"
                required
                error={!!errors.timer}
                helperText={errors.timer || 'Masukkan durasi dalam menit (contoh: 30)'}
                InputLabelProps={{ style: { color: '#050D31' } }}
                sx={{ input: { color: '#050D31' } }}
                inputProps={{ min: 1 }}
              />
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Bobot Penilaian"
              name="bobot"
              type="number"
              value={formData.bobot}
              onChange={handleChange}
              margin="normal"
              required
              error={!!errors.bobot}
              helperText={errors.bobot}
              InputLabelProps={{ style: { color: '#050D31' } }}
              sx={{ input: { color: '#050D31' } }}
              inputProps={{ min: 1, max: 100 }}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, borderColor: '#e0e0e0' }} />

        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: '#050D31' }}>
          Soal Kuis
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Pertanyaan"
              name="pertanyaan"
              value={formData.soal.pertanyaan}
              onChange={handleSoalChange}
              margin="normal"
              required
              error={!!errors.pertanyaan}
              helperText={errors.pertanyaan}
              InputLabelProps={{ style: { color: '#050D31' } }}
              sx={{ input: { color: '#050D31' } }}
            />
          </Grid>
          {formData.jenis === 'multiple_choice' && (
            <>
              {formData.soal.pilihan.map((pilihan, index) => (
                <Grid item xs={12} key={index}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TextField
                      fullWidth
                      label={`Pilihan ${index + 1}`}
                      name="pilihan"
                      value={pilihan}
                      onChange={(e) => handleSoalChange(e, index)}
                      margin="normal"
                      required
                      error={!!errors.pilihan}
                      helperText={errors.pilihan}
                      InputLabelProps={{ style: { color: '#050D31' } }}
                      sx={{ input: { color: '#050D31' } }}
                    />
                    <IconButton
                      color="error"
                      onClick={() => removePilihan(index)}
                      sx={{ color: '#d32f2f' }}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </Grid>
              ))}
              <Grid item xs={12}>
                <Button
                  onClick={addPilihan}
                  startIcon={<Add />}
                  sx={{
                    color: '#0288d1',
                    textTransform: 'none',
                    '&:hover': { bgcolor: '#e3f2fd' },
                  }}
                >
                  Tambah Pilihan
                </Button>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal" required error={!!errors.jawabanBenar}>
                  <InputLabel sx={{ color: '#050D31' }}>Jawaban Benar</InputLabel>
                  <Select
                    name="jawabanBenar"
                    value={formData.soal.jawabanBenar}
                    onChange={handleSoalChange}
                    label="Jawaban Benar"
                    sx={{ color: '#050D31' }}
                  >
                    {formData.soal.pilihan.map((pilihan, index) => (
                      <MenuItem key={index} value={pilihan} disabled={!pilihan}>
                        {pilihan || `Pilihan ${index + 1} (kosong)`}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.jawabanBenar && <FormHelperText>{errors.jawabanBenar}</FormHelperText>}
                </FormControl>
              </Grid>
            </>
          )}
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{ color: '#efbf04', borderColor: '#050D31', '&:hover': { borderColor: '#1a237e' } }}
          >
            Batal
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            sx={{
              bgcolor: '#050D31',
              color: '#fff',
              '&:hover': { bgcolor: '#1a237e' },
              '&:disabled': { bgcolor: '#bdbdbd', color: '#fff' },
            }}
          >
            {loading ? 'Menyimpan...' : 'Simpan Kuis'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AddKuisModal;