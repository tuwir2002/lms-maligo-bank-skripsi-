// ExamManagement.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Modal,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { Add, Edit, Delete, QuestionAnswer } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { getExamsByDosen, createExam, updateExam, deleteExam, validateMatakuliah, createSoalUjian, getSoalByUjian } from '../utils/ujianService';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import UjianModal from '../components/UjianModal';
import SoalUjianModal from '../components/SoalUjianModal';
import SoalListModal from '../components/SoalListModal';

// Fungsi untuk mengonversi HH:MM:SS ke menit
const convertTimerToMinutes = (timer) => {
  if (!timer || typeof timer !== 'string') return 0;
  const [hours, minutes, seconds] = timer.split(':').map(Number);
  return hours * 60 + minutes + Math.round(seconds / 60);
};

const ExamManagement = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [exams, setExams] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [openSoalModal, setOpenSoalModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openSoalListModal, setOpenSoalListModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedExamId, setSelectedExamId] = useState(null);
  const [selectedSoalList, setSelectedSoalList] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [matakuliahOptions, setMatakuliahOptions] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const nip = user?.username;
    console.log('Current user NIP from localStorage:', nip);
    if (!nip) {
      enqueueSnackbar('User tidak ditemukan. Silakan login ulang.', { variant: 'error' });
      setExams([]);
      return;
    }
    setExams([]); // Reset exams sebelum fetch
    fetchExams(nip);
    fetchMatakuliah(nip);
  }, []); // Trigger ulang saat komponen dimuat

  const fetchExams = async (nip) => {
    try {
      const response = await getExamsByDosen(nip);
      const examData = response.data || [];
      console.log('Filtered exams:', JSON.stringify(examData, null, 2));
      setExams(examData);
    } catch (error) {
      console.error('Failed to fetch exams:', error);
      enqueueSnackbar('Gagal memuat data ujian', { variant: 'error' });
      setExams([]);
    }
  };

  const fetchMatakuliah = async (nip) => {
    try {
      const response = await validateMatakuliah(nip);
      const matakuliahData = response.data || [];
      console.log('Matakuliah data:', JSON.stringify(matakuliahData, null, 2));
      setMatakuliahOptions(matakuliahData);
    } catch (error) {
      console.error('Failed to fetch matakuliah:', error);
      enqueueSnackbar('Gagal memuat data mata kuliah', { variant: 'error' });
      setMatakuliahOptions([]);
    }
  };

  const handleOpenModal = (exam = null) => {
    setSelectedExam(exam);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedExam(null);
  };

  const handleOpenSoalModal = (examId) => {
    setSelectedExamId(examId);
    setOpenSoalModal(true);
  };

  const handleCloseSoalModal = () => {
    setOpenSoalModal(false);
    setSelectedExamId(null);
  };

  const handleOpenDeleteModal = (examId) => {
    setSelectedExamId(examId);
    setOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
    setSelectedExamId(null);
  };

  const handleOpenSoalListModal = async (examId) => {
    try {
      const response = await getSoalByUjian(examId);
      setSelectedSoalList(response.data || []);
      setOpenSoalListModal(true);
    } catch (error) {
      enqueueSnackbar('Gagal memuat daftar soal', { variant: 'error' });
    }
  };

  const handleCloseSoalListModal = () => {
    setOpenSoalListModal(false);
    setSelectedSoalList([]);
  };

  const handleSaveExam = async (examData) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const nip = user?.username;
      if (selectedExam) {
        await updateExam(selectedExam.documentId, examData);
        enqueueSnackbar('Ujian berhasil diperbarui', { variant: 'success' });
      } else {
        await createExam(examData);
        enqueueSnackbar('Ujian berhasil ditambahkan', { variant: 'success' });
      }
      fetchExams(nip);
      handleCloseModal();
    } catch (error) {
      enqueueSnackbar('Gagal menyimpan ujian', { variant: 'error' });
    }
  };

  const handleSaveSoal = async (soalList) => {
    try {
      for (const soal of soalList) {
        await createSoalUjian({ ...soal, ujian: selectedExamId });
      }
      enqueueSnackbar('Semua soal berhasil ditambahkan', { variant: 'success' });
      handleCloseSoalModal();
    } catch (error) {
      enqueueSnackbar('Gagal menambahkan soal', { variant: 'error' });
    }
  };

  const handleDeleteExam = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const nip = user?.username;
      await deleteExam(selectedExamId);
      enqueueSnackbar('Ujian berhasil dihapus', { variant: 'success' });
      fetchExams(nip);
      handleCloseDeleteModal();
    } catch (error) {
      enqueueSnackbar('Gagal menghapus ujian', { variant: 'error' });
    }
  };

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <Sidebar open={sidebarOpen} handleDrawerToggle={handleDrawerToggle} role="dosen" />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          ml: sidebarOpen ? '0px' : '0px',
          transition: 'margin 0.3s ease-in-out',
          mt: '64px',
        }}
      >
        <Header title="Manajemen Ujian" />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#050D31' }}>
              Daftar Ujian
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenModal()}
              sx={{
                bgcolor: '#050D31',
                color: '#efbf04',
                '&:hover': { bgcolor: '#1a237e' },
              }}
            >
              Tambah Ujian
            </Button>
          </Box>
          {exams.length === 0 ? (
            <Typography variant="h6" sx={{ textAlign: 'center', mt: 4, color: '#050D31' }}>
              Tidak ada data!
            </Typography>
          ) : (
            <TableContainer component={Paper} elevation={3}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#050D31' }}>
                    <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>Judul</TableCell>
                    <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>Mata Kuliah</TableCell>
                    <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>Waktu Mulai</TableCell>
                    <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>Waktu Selesai</TableCell>
                    <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>Durasi (Menit)</TableCell>
                    <TableCell sx={{ color: '#FFFFFF', fontWeight: 600 }}>Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {exams.map((exam) => (
                    <TableRow
                      key={exam.documentId}
                      onClick={() => handleOpenSoalListModal(exam.id)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>{exam.judul}</TableCell>
                      <TableCell>{exam.matakuliah?.nama}</TableCell>
                      <TableCell>
                        {new Date(exam.waktuMulai).toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell>
                        {new Date(exam.waktuSelesai).toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell>{convertTimerToMinutes(exam.timer)}</TableCell>
                      <TableCell
                        onClick={(e) => e.stopPropagation()}
                      >
                        <IconButton
                          color="secondary"
                          onClick={() => handleOpenModal(exam)}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          color="secondary"
                          onClick={() => handleOpenSoalModal(exam.id)}
                        >
                          <QuestionAnswer />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleOpenDeleteModal(exam.documentId)}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Container>
        <UjianModal
          open={openModal}
          onClose={handleCloseModal}
          onSave={handleSaveExam}
          exam={selectedExam}
          matakuliahOptions={matakuliahOptions}
        />
        <SoalUjianModal
          open={openSoalModal}
          onClose={handleCloseSoalModal}
          onSave={handleSaveSoal}
        />
        <Modal open={openDeleteModal} onClose={handleCloseDeleteModal}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 400,
              bgcolor: 'background.paper',
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
            }}
          >
            <DialogTitle>Hapus Ujian</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Apakah Anda yakin ingin menghapus ujian ini? Tindakan ini tidak dapat dibatalkan.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={handleCloseDeleteModal}
                sx={{ color: '#050D31' }}
              >
                Batal
              </Button>
              <Button
                onClick={handleDeleteExam}
                color="error"
                variant="contained"
              >
                Hapus
              </Button>
            </DialogActions>
          </Box>
        </Modal>
        <SoalListModal
          open={openSoalListModal}
          onClose={handleCloseSoalListModal}
          soalList={selectedSoalList}
        />
      </Box>
    </Box>
  );
};

export default ExamManagement;