import React, { useState, useEffect, useCallback } from 'react';
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
  Checkbox,
  FormControlLabel,
  Grid,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import {
  Subject as SubjectIcon,
  Code as CodeIcon,
  School as SchoolIcon,
  Event as EventIcon,
  PersonSearch as PersonSearchIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  ConfirmationNumber as ConNum,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { debounce } from 'lodash';
import LoadingScreen from '../../../routes/LoadingScreen';
import { createMatakuliah, getProgramStudiList, getDosenList } from '../utils/CourseService';

// Modal styles
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 'min(800px, 90vw)',
  bgcolor: 'white',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  borderRadius: '12px',
  p: 4,
  maxHeight: '90vh',
  overflowY: 'auto',
  border: 'none',
};

// Theme colors
const theme = {
  primary: '#1e40af', // Blue
  accent: '#f59e0b', // Amber
  textPrimary: '#1f2937', // Dark gray
  textSecondary: '#091f4a', // Gray
};

// Debounce delay for search
const DEBOUNCE_DELAY = 200;

const AddMatakuliahModal = ({ open, onClose, refreshMatakuliah }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    nama: '',
    kode: '',
    sks: '',
    semester: '',
    dosens: [],
    programStudi: '',
  });
  const [programStudiList, setProgramStudiList] = useState([]);
  const [dosenList, setDosenList] = useState([]);
  const [filteredDosenList, setFilteredDosenList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUserDosenId, setCurrentUserDosenId] = useState(null);

  // Get current user's NIP from localStorage
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const userNip = user?.username || null;

  // Fetch program studi list
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const programStudiRes = await getProgramStudiList();
        setProgramStudiList(programStudiRes.data || []);
      } catch (error) {
        enqueueSnackbar('Gagal mengambil data program studi', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [enqueueSnackbar]);

  // Fetch dosen list based on selected program studi and set current user's dosen
  useEffect(() => {
    const fetchDosen = async () => {
      if (formData.programStudi) {
        setLoading(true);
        try {
          const dosenRes = await getDosenList(formData.programStudi);
          const dosens = dosenRes.data || [];
          setDosenList(dosens);
          setFilteredDosenList(dosens);

          // Find the current user's dosen based on NIP
          const currentDosen = dosens.find((dosen) => dosen.nip === userNip);
          if (currentDosen) {
            setCurrentUserDosenId(currentDosen.id);
            // Automatically select the current user's dosen
            setFormData((prev) => ({
              ...prev,
              dosens: prev.dosens.includes(currentDosen.id)
                ? prev.dosens
                : [...prev.dosens, currentDosen.id],
            }));
          } else {
            setCurrentUserDosenId(null);
          }
        } catch (error) {
          enqueueSnackbar('Gagal mengambil data dosen', { variant: 'error' });
        } finally {
          setLoading(false);
        }
      } else {
        setDosenList([]);
        setFilteredDosenList([]);
        setFormData((prev) => ({ ...prev, dosens: [] }));
        setSearchQuery('');
        setCurrentUserDosenId(null);
      }
    };
    fetchDosen();
  }, [formData.programStudi, enqueueSnackbar, userNip]);

  // Debounced dosen search
  const filterDosen = useCallback(
    debounce((query) => {
      const lowerQuery = query.toLowerCase();
      const filtered = dosenList.filter(
        (dosen) =>
          dosen.namaLengkap.toLowerCase().includes(lowerQuery) ||
          dosen.nip.toLowerCase().includes(lowerQuery)
      );
      setFilteredDosenList(filtered);
    }, DEBOUNCE_DELAY),
    [dosenList]
  );

  useEffect(() => {
    filterDosen(searchQuery);
  }, [searchQuery, filterDosen]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle dosen selection
  const handleDosenChange = (dosenId) => {
    // Prevent deselecting the current user's dosen
    if (dosenId === currentUserDosenId) {
      return;
    }

    // Only allow selecting other dosens if the current user's dosen is selected
    if (!formData.dosens.includes(currentUserDosenId)) {
      enqueueSnackbar('Anda harus memilih diri Anda sebagai dosen terlebih dahulu', {
        variant: 'warning',
      });
      return;
    }

    setFormData((prev) => {
      const dosens = prev.dosens.includes(dosenId)
        ? prev.dosens.filter((id) => id !== dosenId)
        : [...prev.dosens, dosenId];
      return { ...prev, dosens };
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.dosens.includes(currentUserDosenId)) {
      enqueueSnackbar('Anda harus memilih diri Anda sebagai dosen', { variant: 'error' });
      return;
    }
    try {
      const submitData = {
        nama: formData.nama,
        kode: formData.kode,
        sks: formData.sks,
        semester: formData.semester,
        program_studi: { connect: [{ id: formData.programStudi }] },
        dosens: { connect: formData.dosens.map((id) => ({ id })) },
      };
      await createMatakuliah(submitData);
      enqueueSnackbar('Mata kuliah berhasil ditambahkan', { variant: 'success' });
      refreshMatakuliah();
      onClose();
      setFormData({ nama: '', kode: '', sks: '', semester: '', dosens: [], programStudi: '' });
      setSearchQuery('');
    } catch (error) {
      enqueueSnackbar('Gagal menambahkan mata kuliah', { variant: 'error' });
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        {loading ? (
          <LoadingScreen />
        ) : (
          <>
            {/* Modal Header */}
            <Typography
              variant="h5"
              sx={{
                color: theme.primary,
                fontWeight: 'bold',
                mb: 3,
                borderBottom: `2px solid ${theme.accent}`,
                pb: 1,
              }}
            >
              Tambah Mata Kuliah
            </Typography>

            {programStudiList.length === 0 ? (
              <Typography sx={{ color: theme.textSecondary }}>
                Tidak ada data program studi
              </Typography>
            ) : (
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  {/* Form Fields */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Nama Mata Kuliah"
                      name="nama"
                      value={formData.nama}
                      onChange={handleChange}
                      margin="normal"
                      required
                      helperText="Masukkan nama lengkap mata kuliah (misal: Pemrograman Lanjutan)"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SubjectIcon sx={{ color: theme.primary }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': { borderColor: theme.accent },
                          '&.Mui-focused fieldset': { borderColor: theme.accent },
                        },
                        '& label.Mui-focused': { color: theme.accent },
                        '& .MuiInputBase-input': { color: theme.textPrimary },
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Kode Mata Kuliah"
                      name="kode"
                      value={formData.kode}
                      onChange={handleChange}
                      margin="normal"
                      required
                      helperText="Masukkan kode unik mata kuliah (misal: MK-002)"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CodeIcon sx={{ color: theme.primary }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': { borderColor: theme.accent },
                          '&.Mui-focused fieldset': { borderColor: theme.accent },
                        },
                        '& label.Mui-focused': { color: theme.accent },
                        '& .MuiInputBase-input': { color: theme.textPrimary },
                      }}
                    />
                    <TextField
                      fullWidth
                      label="Jumlah SKS"
                      name="sks"
                      value={formData.sks}
                      onChange={handleChange}
                      margin="normal"
                      required
                      helperText="Masukkan jumlah SKS mata kuliah"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <ConNum sx={{ color: theme.primary }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': { borderColor: theme.accent },
                          '&.Mui-focused fieldset': { borderColor: theme.accent },
                        },
                        '& label.Mui-focused': { color: theme.accent },
                        '& .MuiInputBase-input': { color: theme.textPrimary },
                      }}
                    />
                    <FormControl fullWidth margin="normal">
                      <InputLabel sx={{ color: theme.textPrimary }}>
                        Program Studi
                      </InputLabel>
                      <Select
                        name="programStudi"
                        value={formData.programStudi}
                        onChange={handleChange}
                        required
                        sx={{
                          color: theme.textPrimary,
                          '& .MuiSvgIcon-root': { color: theme.primary },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.accent,
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.accent,
                          },
                        }}
                        startAdornment={
                          <InputAdornment position="start">
                            <SchoolIcon sx={{ color: theme.primary }} />
                          </InputAdornment>
                        }
                      >
                        <MenuItem value="">Pilih Program Studi</MenuItem>
                        {programStudiList.map((ps) => (
                          <MenuItem key={ps.id} value={ps.id}>
                            {ps.nama}
                          </MenuItem>
                        ))}
                      </Select>
                      <Typography
                        variant="caption"
                        sx={{ mt: 1, color: theme.textSecondary }}
                      >
                        Pilih program studi yang terkait dengan mata kuliah
                      </Typography>
                    </FormControl>
                    <TextField
                      fullWidth
                      label="Semester"
                      name="semester"
                      value={formData.semester}
                      onChange={handleChange}
                      margin="normal"
                      required
                      helperText="Masukkan nomor semester (misal: 1, 2, ..., 8)"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EventIcon sx={{ color: theme.primary }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': { borderColor: theme.accent },
                          '&.Mui-focused fieldset': { borderColor: theme.accent },
                        },
                        '& label.Mui-focused': { color: theme.accent },
                        '& .MuiInputBase-input': { color: theme.textPrimary },
                      }}
                    />
                  </Grid>

                  {/* Dosen Selection */}
                  <Grid item xs={12} md={6}>
                    <Typography
                      variant="subtitle1"
                      sx={{ mb: 1, color: theme.textPrimary, fontWeight: 'medium' }}
                    >
                      Pilih Dosen
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ mb: 2, display: 'block', color: theme.textSecondary }}
                    >
                      Anda harus memilih diri Anda sebagai dosen sebelum menambahkan dosen lain.
                    </Typography>
                    <TextField
                      fullWidth
                      label="Cari Dosen (Nama atau NIP)"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      margin="normal"
                      disabled={!formData.programStudi}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonSearchIcon sx={{ color: theme.primary }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': { borderColor: theme.accent },
                          '&.Mui-focused fieldset': { borderColor: theme.accent },
                        },
                        '& label.Mui-focused': { color: theme.accent },
                        '& .MuiInputBase-input': { color: theme.textPrimary },
                      }}
                    />
                    <Box
                      sx={{
                        maxHeight: 300,
                        overflowY: 'auto',
                        border: `1px solid ${theme.textSecondary}30`,
                        borderRadius: 2,
                        p: 2,
                        mt: 2,
                        bgcolor: '#f9fafb',
                      }}
                    >
                      {filteredDosenList.length === 0 ? (
                        <Typography sx={{ color: theme.textSecondary }}>
                          {searchQuery
                            ? 'Tidak ada dosen yang cocok'
                            : 'Pilih program studi terlebih dahulu'}
                        </Typography>
                      ) : (
                        <Grid container spacing={1}>
                          {filteredDosenList.map((dosen) => (
                            <Grid item xs={12} sm={6} key={dosen.id}>
                              <Tooltip
                                title={
                                  dosen.id === currentUserDosenId
                                    ? 'Anda harus menjadi dosen untuk mata kuliah ini'
                                    : !formData.dosens.includes(currentUserDosenId)
                                    ? 'Pilih diri Anda terlebih dahulu sebelum menambahkan dosen lain'
                                    : ''
                                }
                                disableHoverListener={
                                  dosen.id !== currentUserDosenId &&
                                  formData.dosens.includes(currentUserDosenId)
                                }
                              >
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={formData.dosens.includes(dosen.id)}
                                      onChange={() => handleDosenChange(dosen.id)}
                                      disabled={
                                        // Disable if it's the current user's dosen (always checked)
                                        dosen.id === currentUserDosenId ||
                                        // Disable other dosens if current user's dosen is not selected
                                        (dosen.id !== currentUserDosenId &&
                                          !formData.dosens.includes(currentUserDosenId))
                                      }
                                      sx={{
                                        color: theme.textPrimary,
                                        '&.Mui-checked': { color: theme.accent },
                                        '&.Mui-disabled': {
                                          color: dosen.id === currentUserDosenId ? theme.accent : '#bdbdbd',
                                        },
                                      }}
                                    />
                                  }
                                  label={`${dosen.namaLengkap} (${dosen.nip})${
                                    dosen.id === currentUserDosenId ? ' (Anda)' : ''
                                  }`}
                                  sx={{
                                    color: theme.textPrimary,
                                    bgcolor: formData.dosens.includes(dosen.id)
                                      ? `${theme.accent}10`
                                      : 'transparent',
                                    p: 1,
                                    borderRadius: 1,
                                    '&:hover': {
                                      bgcolor:
                                        dosen.id === currentUserDosenId ||
                                        !formData.dosens.includes(currentUserDosenId)
                                          ? 'transparent'
                                          : `${theme.accent}20`,
                                    },
                                    width: '100%',
                                  }}
                                />
                              </Tooltip>
                            </Grid>
                          ))}
                        </Grid>
                      )}
                    </Box>
                  </Grid>
                </Grid>

                {/* Action Buttons */}
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    onClick={onClose}
                    startIcon={<CancelIcon />}
                    sx={{
                      color: 'rgb(253, 238, 30)',
                      bgcolor: '#e5e7eb',
                      '&:hover': {
                        bgcolor: '#d1d5db',
                        transform: 'scale(1.02)',
                      },
                      transition: 'all 0.2s ease',
                      px: 3,
                    }}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    sx={{
                      bgcolor: theme.primary,
                      color: 'white',
                      '&:hover': {
                        bgcolor: '#1e3a8a',
                        boxShadow: `0 4px 12px ${theme.primary}80`,
                        transform: 'scale(1.02)',
                      },
                      transition: 'all 0.2s ease',
                      px: 3,
                    }}
                  >
                    Simpan
                  </Button>
                </Box>
              </form>
            )}
          </>
        )}
      </Box>
    </Modal>
  );
};

export default AddMatakuliahModal;