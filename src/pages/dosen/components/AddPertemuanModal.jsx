import React, { useState, useEffect } from 'react';
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
  Grid,
  InputAdornment,
} from '@mui/material';
import {
  School as SchoolIcon,
  Event as EventIcon,
  Subject as SubjectIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import LoadingScreen from '../../../routes/LoadingScreen';
import { createPertemuan, getPertemuanList } from '../utils/CourseService';

// Professional color palette
const theme = {
  primary: '#1976d2',
  secondary: '#f5f5f5',
  text: '#1a202c',
  border: '#e0e0e0',
  error: '#d32f2f',
};

// Updated modal style
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 700,
  maxWidth: '95vw',
  bgcolor: '#ffffff',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  p: 4,
  borderRadius: 3,
  border: `1px solid ${theme.border}`,
  maxHeight: '85vh',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
};

const AddPertemuanModal = ({ open, onClose, matakuliah, refreshMatakuliah }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    matakuliah: matakuliah?.id || '',
    pertemuanKe: '',
    topik: '',
    tanggal: null,
  });
  const [pertemuanList, setPertemuanList] = useState([]);
  const [errors, setErrors] = useState({
    matakuliah: '',
    pertemuanKe: '',
    topik: '',
    tanggal: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPertemuan = async () => {
      if (matakuliah?.id) {
        setLoading(true);
        try {
          const response = await getPertemuanList(matakuliah.id);
          setPertemuanList(response.data || []);
          setFormData((prev) => ({ ...prev, matakuliah: matakuliah.id }));
        } catch (error) {
          enqueueSnackbar('Gagal mengambil data pertemuan', { variant: 'error' });
        } finally {
          setLoading(false);
        }
      } else {
        setPertemuanList([]);
        setErrors((prev) => ({ ...prev, pertemuanKe: '' }));
      }
    };
    fetchPertemuan();
  }, [matakuliah, enqueueSnackbar]);

  const validatePertemuanKe = (value, pertemuanList) => {
    if (!value) {
      return 'Nomor pertemuan wajib diisi';
    }
    const pertemuanKe = parseInt(value);
    if (isNaN(pertemuanKe) || pertemuanKe <= 0) {
      return 'Nomor pertemuan harus bilangan positif';
    }
    const isDuplicate = pertemuanList.some(
      (pertemuan) =>
        (pertemuan.attributes?.pertemuanKe || pertemuan.pertemuanKe) === pertemuanKe
    );
    if (isDuplicate) {
      return 'Nomor pertemuan sudah digunakan';
    }
    return '';
  };

  const validateTanggal = (value) => {
    if (!value) {
      return 'Tanggal dan waktu wajib diisi';
    }
    const selectedDate = new Date(value);
    const now = new Date();
    if (selectedDate < now) {
      return 'Tanggal tidak boleh di masa lalu';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'pertemuanKe') {
      setErrors((prev) => ({
        ...prev,
        pertemuanKe: validatePertemuanKe(value, pertemuanList),
      }));
    } else if (name === 'topik') {
      setErrors((prev) => ({
        ...prev,
        topik: value ? '' : 'Topik wajib diisi',
      }));
    }
  };

  const handleTanggalChange = (newValue) => {
    setFormData((prev) => ({
      ...prev,
      tanggal: newValue,
    }));
    setErrors((prev) => ({
      ...prev,
      tanggal: validateTanggal(newValue),
    }));
  };

  const validateForm = () => {
    const newErrors = {
      matakuliah: formData.matakuliah ? '' : 'Mata kuliah wajib dipilih',
      pertemuanKe: validatePertemuanKe(formData.pertemuanKe, pertemuanList),
      topik: formData.topik ? '' : 'Topik wajib diisi',
      tanggal: validateTanggal(formData.tanggal),
    };
    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      enqueueSnackbar('Harap lengkapi dan perbaiki form', { variant: 'warning' });
      return;
    }
    try {
      const submitData = {
        pertemuanKe: parseInt(formData.pertemuanKe),
        topik: formData.topik,
        tanggal: formData.tanggal.toISOString(),
        matakuliah: { connect: [{ id: formData.matakuliah }] },
      };
      await createPertemuan(submitData);
      enqueueSnackbar('Pertemuan berhasil ditambahkan', { variant: 'success' });
      refreshMatakuliah();
      onClose();
      setFormData({ matakuliah: matakuliah?.id || '', pertemuanKe: '', topik: '', tanggal: null });
      setPertemuanList([]);
      setErrors({ matakuliah: '', pertemuanKe: '', topik: '', tanggal: '' });
    } catch (error) {
      enqueueSnackbar('Gagal menambahkan pertemuan', { variant: 'error' });
    }
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="add-pertemuan-modal">
      <Box sx={modalStyle}>
        {loading ? (
          <LoadingScreen />
        ) : (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Typography
              variant="h5"
              id="add-pertemuan-modal"
              sx={{ color: theme.text, fontWeight: 600, mb: 1 }}
            >
              Tambah Pertemuan Baru
            </Typography>
            {!matakuliah || !matakuliah.id ? (
              <Typography sx={{ color: theme.error, opacity: 0.7 }}>
                Mata kuliah tidak valid. Silakan pilih mata kuliah dari daftar.
              </Typography>
            ) : (
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <FormControl fullWidth error={!!errors.matakuliah}>
                        <InputLabel sx={{ color: theme.text }}>Mata Kuliah</InputLabel>
                        <Select
                          name="matakuliah"
                          value={formData.matakuliah}
                          onChange={handleChange}
                          disabled
                          required
                          sx={{
                            color: theme.text,
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.border },
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.primary },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.primary },
                          }}
                          startAdornment={
                            <InputAdornment position="start">
                              <SchoolIcon sx={{ color: theme.primary }} />
                            </InputAdornment>
                          }
                        >
                          <MenuItem value={matakuliah.id}>
                            {matakuliah.attributes?.nama || matakuliah.nama}
                          </MenuItem>
                        </Select>
                        {errors.matakuliah && (
                          <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                            {errors.matakuliah}
                          </Typography>
                        )}
                      </FormControl>

                      <TextField
                        fullWidth
                        label="Pertemuan Ke"
                        name="pertemuanKe"
                        type="number"
                        value={formData.pertemuanKe}
                        onChange={handleChange}
                        required
                        error={!!errors.pertemuanKe}
                        helperText={errors.pertemuanKe || 'Masukkan nomor pertemuan (misal: 1, 2, 3)'}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EventIcon sx={{ color: theme.primary }} />
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

                      <TextField
                        fullWidth
                        label="Topik"
                        name="topik"
                        value={formData.topik}
                        onChange={handleChange}
                        required
                        error={!!errors.topik}
                        helperText={errors.topik || 'Masukkan topik pertemuan (misal: Pengenalan AI)'}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SubjectIcon sx={{ color: theme.primary }} />
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

                      <DateTimePicker
                        label="Tanggal dan Waktu"
                        value={formData.tanggal}
                        onChange={handleTanggalChange}
                        minDateTime={new Date()}
                        slotProps={{
                          actionBar: {
                            actions: ['cancel', 'accept'],
                            sx: {
                              '& .MuiButton-root': {
                                color: 'white', // Ubah warna teks tombol ke putih
                              },
                            },
                          },
                          textField: {
                            fullWidth: true,
                            required: true,
                            error: !!errors.tanggal,
                            helperText: errors.tanggal || 'Pilih tanggal dan waktu pertemuan',
                            InputProps: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  <CalendarIcon sx={{ color: theme.primary }} />
                                </InputAdornment>
                              ),
                            },
                            sx: {
                              '& .MuiOutlinedInput-root': {
                                '&:hover fieldset': { borderColor: theme.primary },
                                '&.Mui-focused fieldset': { borderColor: theme.primary },
                              },
                              input: { color: 'rgb(4, 25, 46)' },
                            },
                          },
                        }}
                      />
                    </Box>
                  </Grid>


                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" sx={{ mb: 1, color: theme.text, fontWeight: 500 }}>
                      Daftar Pertemuan
                    </Typography>
                    <Typography variant="caption" sx={{ mb: 2, color: theme.text, opacity: 0.7, display: 'block' }}>
                      Pertemuan yang telah ditambahkan untuk mata kuliah ini
                    </Typography>
                    <Box
                      sx={{
                        maxHeight: 250,
                        overflowY: 'auto',
                        border: `1px solid ${theme.border}`,
                        borderRadius: 2,
                        p: 2,
                        bgcolor: theme.secondary,
                      }}
                    >
                      {pertemuanList.length === 0 ? (
                        <Typography sx={{ color: theme.text, opacity: 0.7 }}>
                          Belum ada pertemuan untuk mata kuliah ini
                        </Typography>
                      ) : (
                        pertemuanList.map((pertemuan) => (
                          <Box
                            key={pertemuan.id}
                            sx={{
                              p: 1,
                              borderRadius: 1,
                              mb: 1,
                              bgcolor: '#fff',
                              '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.04)' },
                            }}
                          >
                            <Typography variant="body2" sx={{ color: theme.text }}>
                              Pertemuan {pertemuan.attributes?.pertemuanKe || pertemuan.pertemuanKe}: {pertemuan.attributes?.topik || pertemuan.topik}
                              {pertemuan.attributes?.tanggal && (
                                <>
                                  {' '}
                                  - {new Date(pertemuan.attributes.tanggal).toLocaleString('id-ID', {
                                    dateStyle: 'medium',
                                    timeStyle: 'short',
                                  })}
                                </>
                              )}
                            </Typography>
                          </Box>
                        ))
                      )}
                    </Box>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    onClick={onClose}
                    startIcon={<CancelIcon />}
                    variant="outlined"
                    sx={{
                      color: 'rgb(236, 214, 11)',
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
                    disabled={
                      !formData.matakuliah ||
                      !formData.pertemuanKe ||
                      !formData.topik ||
                      !formData.tanggal ||
                      !!errors.pertemuanKe ||
                      !!errors.tanggal
                    }
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
            )}
          </LocalizationProvider>
        )}
      </Box>
    </Modal>
  );
};

export default AddPertemuanModal;