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
  IconButton,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useSnackbar } from 'notistack';
import { fetchInvitedStudents } from '../utils/ApiStudent';

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

const LihatMahasiswaModal = ({ open, handleClose, matakuliah }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [invitedStudents, setInvitedStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchInvitedStudents(matakuliah.id);
      console.log('LihatMahasiswa raw invited response:', JSON.stringify(response, null, 2));
      setInvitedStudents(response);
    } catch (error) {
      console.error('Error in fetchData:', error);
      const errorMessage = error.message.includes('Network Error')
        ? 'Tidak dapat terhubung ke server. Pastikan server berjalan dan CORS dikonfigurasi dengan benar.'
        : error.message || 'Gagal memuat daftar mahasiswa yang diundang';
      setError(errorMessage);
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && matakuliah) {
      console.log('Matakuliah data:', JSON.stringify(matakuliah, null, 2));
      fetchData();
    } else {
      setInvitedStudents([]);
      setError(null);
    }
  }, [open, matakuliah, enqueueSnackbar]);

  const handleRefresh = async () => {
    await fetchData();
  };

  return (
    <Modal open={open} onClose={handleClose} aria-labelledby="lihat-mahasiswa-modal">
      <Box sx={modalStyle}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography
            id="lihat-mahasiswa-modal"
            variant="h5"
            sx={{ color: theme.text, fontWeight: 600, fontSize: { xs: '1.5rem', sm: '1.75rem' } }}
          >
            Daftar Mahasiswa di {matakuliah?.nama}
          </Typography>
          <IconButton onClick={handleRefresh} disabled={loading}>
            <RefreshIcon sx={{ color: theme.accent }} />
          </IconButton>
        </Box>

        {error && (
          <Typography sx={{ color: theme.error, fontStyle: 'italic', fontSize: '0.9rem' }}>
            {error}
          </Typography>
        )}

        <Typography variant="h6" sx={{ color: theme.text, fontWeight: 500, fontSize: '1.25rem' }}>
          Mahasiswa yang Diundang
        </Typography>
        <TableContainer component={Paper} sx={{ maxHeight: 400, borderRadius: '8px', boxShadow: theme.shadow }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: theme.text, fontSize: '0.9rem' }}>NIM</TableCell>
                <TableCell sx={{ fontWeight: 600, color: theme.text, fontSize: '0.9rem' }}>Nama Lengkap</TableCell>
                <TableCell sx={{ fontWeight: 600, color: theme.text, fontSize: '0.9rem' }}>Semester</TableCell>
                <TableCell sx={{ fontWeight: 600, color: theme.text, fontSize: '0.9rem' }}>Status</TableCell>
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
              ) : invitedStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography sx={{ color: theme.muted, fontStyle: 'italic', fontSize: '0.9rem' }}>
                      Tidak ada mahasiswa yang diundang
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                invitedStudents.map((student) => (
                  <TableRow key={student.id} hover sx={{ '&:hover': { bgcolor: theme.secondary } }}>
                    <TableCell sx={{ color: theme.text, fontSize: '0.9rem' }}>{student.nim}</TableCell>
                    <TableCell sx={{ color: theme.text, fontSize: '0.9rem' }}>{student.namaLengkap}</TableCell>
                    <TableCell sx={{ color: theme.text, fontSize: '0.9rem' }}>{student.semester}</TableCell>
                    <TableCell sx={{ color: theme.text, fontSize: '0.9rem' }}>
                      {student.status_class === 'pending' ? 'Menunggu' : student.status_class}
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
        </Box>
      </Box>
    </Modal>
  );
};

export default LihatMahasiswaModal;