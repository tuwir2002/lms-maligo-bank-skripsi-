import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Modal,
  Card,
  CardContent,
  Divider,
  keyframes,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { Assignment } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import theme from '../styles/theme';
import { progressService } from '../service/progressService';

// Animasi keyframes untuk efek neon glow
const neonGlow = keyframes`
  0% { box-shadow: 0 0 5px #efbf04, 0 0 10px #efbf04, 0 0 15px #efbf04; }
  50% { box-shadow: 0 0 10px #efbf04, 0 0 20px #efbf04, 0 0 30px #efbf04; }
  100% { box-shadow: 0 0 5px #efbf04, 0 0 10px #efbf04, 0 0 15px #efbf04; }
`;

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 600 },
  maxHeight: '80vh',
  overflowY: 'auto',
  bgcolor: '#050D31',
  border: '2px solid #efbf04',
  borderRadius: 2,
  boxShadow: '0 0 15px rgba(239, 191, 4, 0.5)',
  p: 4,
  color: '#FFFFFF',
  animation: `${neonGlow} 2s infinite`,
};

const Assignments = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleOpenModal = (assignment) => {
    setSelectedAssignment(assignment);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedAssignment(null);
  };

  const handleAssignmentAction = (assignmentId) => {
    navigate(`/mahasiswa/assignments/${assignmentId}`);
  };

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        const data = await progressService.getProgressData();
        const { jawabanKuis, jawabanUjians, undanganMahasiswas, rekapData, matakuliahData } = data;

        // Map rekapitulasis to course IDs
        const rekapMap = {
          4: 97, // Praktik Pengolahan Citra
          6: 103, // Kecerdasan Buatan
          8: 107, // Mikrokontroller
        };

        // Create assignment entries from jawaban_kuis and jawaban_ujians
        const quizAssignments = jawabanKuis.map((quiz, index) => ({
          id: `quiz-${quiz.id}`,
          courseId: 97,
          course: matakuliahData.find((mk) => mk.id === 97)?.nama || 'Unknown',
          title: `Kuis ${index + 1}: Diagram Mermaid`,
          dueDate: new Date(quiz.createdAt).toISOString().split('T')[0],
          status: 'Terkumpul',
          submissionDate: quiz.createdAt,
          score: quiz.nilai,
          submissionLink: quiz.jawaban,
        }));

        const examAssignments = jawabanUjians.map((exam, index) => ({
          id: `exam-${exam.id}`,
          courseId: index < 2 ? 97 : 103,
          course: matakuliahData.find((mk) => mk.id === (index < 2 ? 97 : 103))?.nama || 'Unknown',
          title: index < 2 ? `Ujian ${index + 1}: ${index === 0 ? 'Pengolahan Citra' : 'Algoritma'}` : `Ujian ${index - 1}: ${index === 2 ? 'Machine Learning' : 'Deep Learning'}`,
          dueDate: new Date(exam.createdAt).toISOString().split('T')[0],
          status: 'Terkumpul',
          submissionDate: exam.createdAt,
          score: exam.nilai,
          submissionLink: null,
        }));

        // Create pending assignments from undangan_mahasiswas for Mikrokontroller
        const pendingAssignments = undanganMahasiswas.length > 0 ? [{
          id: `pending-${undanganMahasiswas[0].id}`,
          courseId: 107,
          course: matakuliahData.find((mk) => mk.id === 107)?.nama || 'Unknown',
          title: 'Tugas 1: Pengenalan Mikrokontroller',
          dueDate: new Date(undanganMahasiswas[undanganMahasiswas.length - 1].tanggalUndangan).toISOString().split('T')[0],
          status: 'Belum Dikumpul',
          invitationDate: undanganMahasiswas[undanganMahasiswas.length - 1].tanggalUndangan,
        }] : [];

        // Combine all assignments
        const allAssignments = [...quizAssignments, ...examAssignments, ...pendingAssignments];
        setAssignments(allAssignments);
      } catch (err) {
        setError('Gagal memuat data tugas. Silakan coba lagi nanti.');
        console.error('Fetch Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0a0e2b' }}>
        <Sidebar open={sidebarOpen} handleDrawerToggle={handleDrawerToggle} role="mahasiswa" />
        <Box
          sx={{
            flexGrow: 1,
            p: 4,
            mt: 8,
            ml: { xs: 0, sm: sidebarOpen ? '260px' : '70px' },
            transition: 'margin-left 0.3s ease-in-out',
            width: { xs: '100%', sm: `calc(100% - ${sidebarOpen ? '260px' : '70px'})` },
          }}
        >
          <Header title="Tugas & Penilaian" />
          <Box sx={{ mt: 4 }}>
            <Box
              sx={{
                p: 4,
                mb: 4,
                borderRadius: 2,
                bgcolor: '#050D31',
                color: '#FFFFFF',
                animation: `${neonGlow} 2s infinite`,
                border: '1px solid #efbf04',
              }}
            >
              <Typography
                variant="h3"
                sx={{ fontWeight: 700, fontFamily: '"Orbitron", sans-serif' }}
              >
                Daftar Tugas
              </Typography>
              <Typography variant="body1" sx={{ mt: 1, opacity: 0.8 }}>
                Pantau tugas Anda dan kirimkan sebelum tenggat waktu.
              </Typography>
            </Box>

            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress sx={{ color: '#efbf04' }} />
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 4, mx: 'auto', width: 'fit-content' }}>
                {error}
              </Alert>
            )}

            {!loading && !error && (
              <TableContainer
                sx={{
                  borderRadius: 2,
                  bgcolor: '#050D31',
                  border: '1px solid #efbf04',
                  animation: `${neonGlow} 2s infinite`,
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: '#efbf04', fontWeight: 600 }}>Mata Kuliah</TableCell>
                      <TableCell sx={{ color: '#efbf04', fontWeight: 600 }}>Judul Tugas</TableCell>
                      <TableCell sx={{ color: '#efbf04', fontWeight: 600 }}>Tenggat</TableCell>
                      <TableCell sx={{ color: '#efbf04', fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ color: '#efbf04', fontWeight: 600 }}>Aksi</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assignments.map((assignment) => (
                      <TableRow
                        key={assignment.id}
                        sx={{
                          '&:hover': {
                            bgcolor: 'rgba(239, 191, 4, 0.1)',
                            transition: 'background-color 0.3s',
                          },
                        }}
                      >
                        <TableCell sx={{ color: '#FFFFFF' }}>{assignment.course}</TableCell>
                        <TableCell sx={{ color: '#FFFFFF' }}>{assignment.title}</TableCell>
                        <TableCell sx={{ color: '#FFFFFF' }}>{assignment.dueDate}</TableCell>
                        <TableCell>
                          <Chip
                            label={assignment.status}
                            sx={{
                              bgcolor:
                                assignment.status === 'Belum Dikumpul' ? '#efbf04' : '#666',
                              color:
                                assignment.status === 'Belum Dikumpul' ? '#050D31' : '#FFFFFF',
                              fontWeight: 500,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            sx={{
                              color: '#efbf04',
                              borderColor: '#efbf04',
                              borderRadius: 20,
                              '&:hover': {
                                bgcolor: '#efbf04',
                                color: '#050D31',
                              },
                            }}
                            onClick={() => handleOpenModal(assignment)}
                          >
                            {assignment.status === 'Belum Dikumpul' ? 'Kumpul' : 'Lihat'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {assignments.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          sx={{ textAlign: 'center', color: '#efbf04', py: 4 }}
                        >
                          Tidak ada tugas tersedia saat ini.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>

          {/* Modal for Assignment Details */}
          <Modal
            open={openModal}
            onClose={handleCloseModal}
            aria-labelledby="assignment-modal-title"
            aria-describedby="assignment-modal-description"
          >
            <Box sx={modalStyle}>
              {selectedAssignment && (
                <Card sx={{ bgcolor: 'transparent', boxShadow: 'none' }}>
                  <CardContent>
                    <Typography
                      id="assignment-modal-title"
                      variant="h5"
                      sx={{
                        fontFamily: '"Orbitron", sans-serif',
                        fontWeight: 600,
                        color: '#efbf04',
                        mb: 2,
                      }}
                    >
                      {selectedAssignment.title}
                    </Typography>
                    <Divider sx={{ bgcolor: '#efbf04', mb: 2 }} />
                    <Typography variant="body1" sx={{ mb: 1, color: '#FFFFFF' }}>
                      <strong>Mata Kuliah:</strong> {selectedAssignment.course}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1, color: '#FFFFFF' }}>
                      <strong>Tenggat:</strong> {selectedAssignment.dueDate}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1, color: '#FFFFFF' }}>
                      <strong>Status:</strong> {selectedAssignment.status}
                    </Typography>
                    {selectedAssignment.status === 'Terkumpul' ? (
                      <>
                        <Typography variant="body1" sx={{ mb: 1, color: '#FFFFFF' }}>
                          <strong>Tanggal Pengumpulan:</strong>{' '}
                          {new Date(selectedAssignment.submissionDate).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1, color: '#FFFFFF' }}>
                          <strong>Nilai:</strong> {selectedAssignment.score ?? 'Belum Dinilai'}
                        </Typography>
                        {selectedAssignment.submissionLink && (
                          <Typography variant="body1" sx={{ mb: 1, color: '#FFFFFF' }}>
                            <strong>Link Pengumpulan:</strong>{' '}
                            <a
                              href={selectedAssignment.submissionLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: '#efbf04', textDecoration: 'underline' }}
                            >
                              Lihat File
                            </a>
                          </Typography>
                        )}
                      </>
                    ) : (
                      <Typography variant="body1" sx={{ mb: 1, color: '#FFFFFF' }}>
                        <strong>Tanggal Undangan:</strong>{' '}
                        {new Date(selectedAssignment.invitationDate).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </Typography>
                    )}
                    <Divider sx={{ bgcolor: '#efbf04', my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                      <Button
                        variant="outlined"
                        sx={{
                          color: '#efbf04',
                          borderColor: '#efbf04',
                          '&:hover': { bgcolor: '#efbf04', color: '#050D31' },
                        }}
                        onClick={handleCloseModal}
                      >
                        Tutup
                      </Button>
                      {selectedAssignment.status === 'Belum Dikumpul' && (
                        <Button
                          variant="contained"
                          sx={{
                            bgcolor: '#efbf04',
                            color: '#050D31',
                            '&:hover': { bgcolor: '#d4a703' },
                          }}
                          onClick={() => handleAssignmentAction(selectedAssignment.id)}
                        >
                          Kumpul Sekarang
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              )}
            </Box>
          </Modal>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Assignments;