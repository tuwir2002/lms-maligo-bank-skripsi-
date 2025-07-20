import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Checkbox,
  IconButton,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useSnackbar } from 'notistack';
import { fetchStudents, searchStudents, fetchInvitedStudents, inviteStudents } from '../utils/ApiStudent';

const theme = {
  primary: '#005a6f',
  secondary: '#f8fafc',
  accent: '#4db6ac',
  text: '#e3d10e',
  border: '#e2e8f0',
  error: '#d32f2f',
  muted: '#64748b',
  hover: '#004a5a',
  shadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
};

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '95%', sm: 600, md: 700 },
  maxHeight: '85vh',
  bgcolor: '#ffffff',
  boxShadow: theme.shadow,
  p: { xs: 3, sm: 4 },
  borderRadius: '16px',
  border: `1px solid ${theme.border}`,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
  overflowY: 'auto',
};

const TambahMahasiswaModal = ({ open, handleClose, matakuliah }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [students, setStudents] = useState([]);
  const [invitedStudents, setInvitedStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    console.log('fetchData called with matakuliah:', JSON.stringify(matakuliah, null, 2));

    const programStudi = matakuliah?.program_studi;
    const semester = matakuliah?.semester;

    console.log('Extracted values:', {
      programStudi: JSON.stringify(programStudi, null, 2),
      semester,
    });

    if (!matakuliah?.id || !programStudi?.id || !semester) {
      const errorMessage = 'Data matakuliah, program studi, atau semester tidak valid';
      console.warn('Validation failed:', {
        matakuliahId: matakuliah?.id,
        programStudi,
        hasProgramStudiId: !!programStudi?.id,
        semester,
        errorMessage,
      });
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: 'error' });
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const allStudents = searchQuery
        ? await searchStudents(programStudi, semester, searchQuery)
        : await fetchStudents(programStudi, semester);
      console.log('Fetched students:', JSON.stringify(allStudents, null, 2));

      const invited = await fetchInvitedStudents(matakuliah.id);
      console.log('Fetched invited students:', JSON.stringify(invited, null, 2));

      const invitedIds = new Set(invited.map((student) => student.mahasiswaId));
      const uninvitedStudents = allStudents.filter(
        (student) => !invitedIds.has(Number(student.id))
      );
      console.log('Filtered uninvited students:', JSON.stringify(uninvitedStudents, null, 2));

      setStudents(uninvitedStudents);
      setInvitedStudents(invited);
    } catch (error) {
      console.error('Error in fetchData:', {
        message: error.message,
        stack: error.stack,
        programStudi,
        semester,
        searchQuery,
      });
      const errorMessage = error.message.includes('Network Error')
        ? 'Tidak dapat terhubung ke server. Pastikan server berjalan dan CORS dikonfigurasi dengan benar.'
        : error.message || 'Gagal memuat daftar mahasiswa';
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useEffect triggered with:', {
      open,
      matakuliah: JSON.stringify(matakuliah, null, 2),
      searchQuery,
    });
    if (open && matakuliah) {
      fetchData();
    } else {
      console.log('Resetting state due to invalid or closed modal:', {
        open,
        hasMatakuliah: !!matakuliah,
      });
      setStudents([]);
      setInvitedStudents([]);
      setSelectedStudents([]);
      setSearchQuery('');
      setError(null);
    }
  }, [open, matakuliah, searchQuery, enqueueSnackbar]);

  const handleSearch = (event) => {
    console.log('Search query changed:', event.target.value);
    setSearchQuery(event.target.value);
  };

  const handleSelectStudent = (studentId) => {
    console.log('Selecting student:', studentId, 'Current selected:', selectedStudents);
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = (event) => {
    const checked = event.target.checked;
    console.log('Select all toggled:', checked);
    if (checked) {
      setSelectedStudents(students.map((student) => student.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleInvite = async () => {
    console.log('Inviting students:', selectedStudents);
    if (selectedStudents.length === 0) {
      enqueueSnackbar('Pilih setidaknya satu mahasiswa untuk diundang', { variant: 'warning' });
      return;
    }

    setLoading(true);
    try {
      await inviteStudents(matakuliah.id, selectedStudents);
      enqueueSnackbar('Mahasiswa berhasil diundang dan entri rekapitulasi dibuat', { variant: 'success' });
      setSelectedStudents([]);
      await fetchData();
    } catch (error) {
      console.error('Error inviting students:', error);
      enqueueSnackbar(error.message || 'Gagal mengundang mahasiswa atau membuat entri rekapitulasi', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    console.log('Refresh triggered');
    setSearchQuery('');
    await fetchData();
  };

  return (
    <Modal open={open} onClose={handleClose} aria-labelledby="tambah-mahasiswa-modal">
      <Box sx={modalStyle}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography
            id="tambah-mahasiswa-modal"
            variant="h5"
            sx={{ color: theme.text, fontWeight: 600, fontSize: { xs: '1.5rem', sm: '1.75rem' } }}
          >
            Tambah Mahasiswa ke {matakuliah?.nama}
          </Typography>
          <IconButton onClick={handleRefresh} disabled={loading}>
            <RefreshIcon sx={{ color: theme.accent }} />
          </IconButton>
        </Box>

        <TextField
          label="Cari Mahasiswa (NIM atau Nama)"
          variant="outlined"
          value={searchQuery}
          onChange={handleSearch}
          fullWidth
          sx={{ mb: 2 }}
          disabled={loading}
        />

        {error && (
          <Typography sx={{ color: theme.error, fontStyle: 'italic', fontSize: '0.9rem' }}>
            {error}
          </Typography>
        )}

        <Typography variant="h6" sx={{ color: theme.text, fontWeight: 500, fontSize: '1.25rem' }}>
          Daftar Mahasiswa Belum Diundang
        </Typography>
        <TableContainer component={Paper} sx={{ maxHeight: 400, borderRadius: '8px', boxShadow: theme.shadow }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedStudents.length === students.length && students.length > 0}
                    onChange={handleSelectAll}
                    disabled={loading || students.length === 0}
                    sx={{ color: theme.accent, '&.Mui-checked': { color: theme.accent } }}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: theme.text, fontSize: '0.9rem' }}>NIM</TableCell>
                <TableCell sx={{ fontWeight: 600, color: theme.text, fontSize: '0.9rem' }}>Nama Lengkap</TableCell>
                <TableCell sx={{ fontWeight: 600, color: theme.text, fontSize: '0.9rem' }}>Semester</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <CircularProgress size={24} sx={{ color: theme.accent }} />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography sx={{ color: theme.error, fontStyle: 'italic', fontSize: '0.9rem' }}>
                      Gagal memuat data mahasiswa
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography sx={{ color: theme.muted, fontStyle: 'italic', fontSize: '0.9rem' }}>
                      Tidak ada mahasiswa yang belum diundang
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student) => (
                  <TableRow
                    key={student.id}
                    hover
                    sx={{ '&:hover': { bgcolor: theme.secondary } }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => handleSelectStudent(student.id)}
                        sx={{ color: theme.accent, '&.Mui-checked': { color: theme.accent } }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: theme.text, fontSize: '0.9rem' }}>
                      {student.nim || 'N/A'}
                    </TableCell>
                    <TableCell sx={{ color: theme.text, fontSize: '0.9rem' }}>
                      {student.namaLengkap || student.nama_lengkap || 'N/A'}
                    </TableCell>
                    <TableCell sx={{ color: theme.text, fontSize: '0.9rem' }}>
                      {student.semester || 'N/A'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            disabled={loading}
            sx={{
              color: theme.text,
              borderColor: theme.border,
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 500,
              px: 4,
              py: 1,
              fontSize: '0.9rem',
              '&:hover': { bgcolor: theme.secondary, borderColor: theme.accent },
              '&:disabled': { color: theme.muted },
            }}
          >
            Tutup
          </Button>
          <Button
            onClick={handleInvite}
            variant="contained"
            disabled={loading || selectedStudents.length === 0}
            sx={{
              bgcolor: theme.accent,
              color: '#ffffff',
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 500,
              px: 4,
              py: 1,
              fontSize: '0.9rem',
              '&:hover': { bgcolor: theme.hover },
              '&:disabled': { bgcolor: theme.muted, color: '#ffffff' },
            }}
          >
            Undang
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default TambahMahasiswaModal;