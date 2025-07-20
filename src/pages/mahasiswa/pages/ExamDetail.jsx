import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  keyframes,
  Grid,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { Assignment, Schedule, Book, Info, Timer, Rule, Warning } from '@mui/icons-material';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import theme from '../styles/theme';
import { fetchUjiansByMahasiswa } from '../service/ujianService';

// Animasi keyframes untuk efek neon glow
const neonGlow = keyframes`
  0% { box-shadow: 0 0 5px #efbf04, 0 0 10px #efbf04, 0 0 15px #efbf04; }
  50% { box-shadow: 0 0 10px #efbf04, 0 0 20px #efbf04, 0 0 30px #efbf04; }
  100% { box-shadow: 0 0 5px #efbf04, 0 0 10px #efbf04, 0 0 15px #efbf04; }
`;

const ExamDetail = ({ role }) => {
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadExam = async () => {
      try {
        setLoading(true);
        const exams = await fetchUjiansByMahasiswa();
        if (!Array.isArray(exams)) {
          throw new Error('Invalid exam data: Expected an array');
        }
        const selectedExam = exams.find((e) => e.id === parseInt(examId));
        if (!selectedExam) {
          throw new Error('Ujian tidak ditemukan atau Anda tidak terdaftar untuk ujian ini');
        }
        setExam(selectedExam);
      } catch (err) {
        console.error('Error loading exam:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadExam();
  }, [examId]);

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleStartExam = () => {
    navigate(`/mahasiswa/exams/${examId}/start`);
  };

  // Format tanggal lebih profesional
  const formatDate = (dateString) => {
    const options = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0a0e2b' }}>
        <Sidebar open={sidebarOpen} handleDrawerToggle={handleDrawerToggle} role={role} />
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
          <Header title="Detail Ujian" />
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress sx={{ color: '#efbf04' }} />
            </Box>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 4 }}>
              {error}
            </Alert>
          )}
          {exam && !loading && !error && (
            <Box sx={{ mt: 4 }}>
              <Card
                sx={{
                  borderRadius: 2,
                  bgcolor: '#050D31',
                  color: '#FFFFFF',
                  animation: `${neonGlow} 2s infinite`,
                  border: '1px solid #efbf04',
                  mb: 4,
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Assignment sx={{ fontSize: 40, color: '#efbf04', mr: 2 }} />
                    <Typography
                      variant="h3"
                      sx={{ fontWeight: 700, fontFamily: '"Orbitron", sans-serif' }}
                    >
                      {exam.judul}
                    </Typography>
                  </Box>

                  <Divider sx={{ bgcolor: '#efbf04', mb: 3 }} />

                  <Grid container spacing={3}>
                    {/* Informasi Mata Kuliah */}
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Book sx={{ color: '#efbf04', mr: 1.5, fontSize: '1.2rem' }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Mata Kuliah
                        </Typography>
                      </Box>
                      <Box sx={{ pl: 3.5 }}>
                        <Typography variant="body1">
                          {exam.matakuliah?.nama || 'N/A'}
                        </Typography>
                        <Chip
                          label={`Kode: ${exam.matakuliah?.kode || 'N/A'}`}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(239, 191, 4, 0.1)',
                            color: '#efbf04',
                            mt: 1,
                            fontSize: '0.75rem',
                          }}
                        />
                      </Box>
                    </Grid>

                    {/* Informasi Waktu */}
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Schedule sx={{ color: '#efbf04', mr: 1.5, fontSize: '1.2rem' }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Periode Ujian
                        </Typography>
                      </Box>
                      <Box sx={{ pl: 3.5 }}>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          <strong>Mulai:</strong> {formatDate(exam.waktuMulai)}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Selesai:</strong> {formatDate(exam.waktuSelesai)}
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Durasi Ujian */}
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Timer sx={{ color: '#efbf04', mr: 1.5, fontSize: '1.2rem' }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Durasi Ujian
                        </Typography>
                      </Box>
                      <Box sx={{ pl: 3.5 }}>
                        <Typography variant="body1">
                          {exam.timer || 'N/A'}
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Instruksi Ujian */}
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                        <Info sx={{ color: '#efbf04', mr: 1.5, fontSize: '1.2rem', mt: 0.5 }} />
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                            Instruksi Ujian
                          </Typography>
                          <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                            {exam.instruksi || 'Tidak ada instruksi tersedia'}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>

                  <Divider sx={{ bgcolor: '#efbf04', mt: 3, mb: 3 }} />

                  {/* Papan Informasi Tata Cara dan Peringatan Kecurangan */}
                  <Box sx={{ mb: 4 }}>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 600,
                        fontFamily: '"Orbitron", sans-serif',
                        mb: 2,
                        color: '#efbf04',
                      }}
                    >
                      Informasi Penting
                    </Typography>
                    <Grid container spacing={3}>
                      {/* Tata Cara Pengerjaan Soal */}
                      <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Rule sx={{ color: '#efbf04', mr: 1.5, fontSize: '1.5rem' }} />
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            Tata Cara Pengerjaan Soal
                          </Typography>
                        </Box>
                        <List sx={{ pl: 1 }}>
                          <ListItem sx={{ alignItems: 'flex-start', py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>
                              <Assignment sx={{ color: '#efbf04', fontSize: '1.2rem' }} />
                            </ListItemIcon>
                            <ListItemText
                              primary="Baca Soal dengan Teliti"
                              secondary="Pastikan Anda memahami pertanyaan sebelum menjawab. Perhatikan bobot soal yang tertera."
                              primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                              secondaryTypographyProps={{ variant: 'body2', color: '#FFFFFF' }}
                            />
                          </ListItem>
                          <ListItem sx={{ alignItems: 'flex-start', py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>
                              <Assignment sx={{ color: '#efbf04', fontSize: '1.2rem' }} />
                            </ListItemIcon>
                            <ListItemText
                              primary="Soal Pilihan Ganda"
                              secondary="Pilih satu jawaban yang paling tepat dengan mengklik opsi yang sesuai."
                              primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                              secondaryTypographyProps={{ variant: 'body2', color: '#FFFFFF' }}
                            />
                          </ListItem>
                          <ListItem sx={{ alignItems: 'flex-start', py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>
                              <Assignment sx={{ color: '#efbf04', fontSize: '1.2rem' }} />
                            </ListItemIcon>
                            <ListItemText
                              primary="Soal Esai"
                              secondary="Ketik jawaban Anda pada kolom yang tersedia. Pastikan jawaban jelas dan lengkap."
                              primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                              secondaryTypographyProps={{ variant: 'body2', color: '#FFFFFF' }}
                            />
                          </ListItem>
                          <ListItem sx={{ alignItems: 'flex-start', py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>
                              <Assignment sx={{ color: '#efbf04', fontSize: '1.2rem' }} />
                            </ListItemIcon>
                            <ListItemText
                              primary="Navigasi Soal"
                              secondary="Gunakan tombol 'Sebelumnya' dan 'Selanjutnya' untuk berpindah antar soal. Anda juga dapat memilih soal langsung dari panel navigasi."
                              primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                              secondaryTypographyProps={{ variant: 'body2', color: '#FFFFFF' }}
                            />
                          </ListItem>
                          <ListItem sx={{ alignItems: 'flex-start', py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>
                              <Assignment sx={{ color: '#efbf04', fontSize: '1.2rem' }} />
                            </ListItemIcon>
                            <ListItemText
                              primary="Pengumpulan Jawaban"
                              secondary="Klik 'Selesai dan Kumpulkan' setelah semua soal dijawab atau saat waktu hampir habis. Pastikan Anda mengonfirmasi pengumpulan."
                              primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                              secondaryTypographyProps={{ variant: 'body2', color: '#FFFFFF' }}
                            />
                          </ListItem>
                        </List>
                      </Grid>

                      {/* Instruksi Peringatan Kecurangan */}
                      <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Warning sx={{ color: '#efbf04', mr: 1.5, fontSize: '1.5rem' }} />
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            Peringatan Kecurangan
                          </Typography>
                        </Box>
                        <List sx={{ pl: 1 }}>
                          <ListItem sx={{ alignItems: 'flex-start', py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>
                              <Warning sx={{ color: '#efbf04', fontSize: '1.2rem' }} />
                            </ListItemIcon>
                            <ListItemText
                              primary="Tindakan Dilarang"
                              secondary="Jangan melakukan klik kanan, menyalin/menempel, membuka tab lain, mengambil screenshot, atau keluar dari mode layar penuh."
                              primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                              secondaryTypographyProps={{ variant: 'body2', color: '#FFFFFF' }}
                            />
                          </ListItem>
                          <ListItem sx={{ alignItems: 'flex-start', py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>
                              <Warning sx={{ color: '#efbf04', fontSize: '1.2rem' }} />
                            </ListItemIcon>
                            <ListItemText
                              primary="Konsekuensi Pelanggaran"
                              secondary="Setiap pelanggaran akan memicu peringatan. Jika mencapai 3 pelanggaran, ujian Anda akan otomatis dikumpulkan."
                              primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                              secondaryTypographyProps={{ variant: 'body2', color: '#FFFFFF' }}
                            />
                          </ListItem>
                          <ListItem sx={{ alignItems: 'flex-start', py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>
                              <Warning sx={{ color: '#efbf04', fontSize: '1.2rem' }} />
                            </ListItemIcon>
                            <ListItemText
                              primary="Integritas Akademik"
                              secondary="Lakukan ujian dengan jujur. Segala bentuk kecurangan dapat mengakibatkan sanksi akademik sesuai peraturan."
                              primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                              secondaryTypographyProps={{ variant: 'body2', color: '#FFFFFF' }}
                            />
                          </ListItem>
                        </List>
                      </Grid>
                    </Grid>
                  </Box>

                  <Divider sx={{ bgcolor: '#efbf04', mt: 3, mb: 3 }} />

                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      sx={{
                        color: '#efbf04',
                        borderColor: '#efbf04',
                        borderRadius: 1,
                        '&:hover': {
                          bgcolor: 'rgba(239, 191, 4, 0.1)',
                        },
                      }}
                      onClick={() => navigate('/mahasiswa/exams')}
                    >
                      Kembali
                    </Button>
                    <Button
                      variant="contained"
                      sx={{
                        bgcolor: '#efbf04',
                        color: '#050D31',
                        borderRadius: 1,
                        px: 4,
                        '&:hover': {
                          bgcolor: '#d4a703',
                        },
                      }}
                      onClick={handleStartExam}
                      disabled={exam.soal_ujians?.length === 0}
                    >
                      Mulai Ujian
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default ExamDetail;