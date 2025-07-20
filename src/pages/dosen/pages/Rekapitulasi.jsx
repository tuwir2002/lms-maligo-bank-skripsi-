import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Tabs, Tab, CircularProgress, Breadcrumbs, Link, Alert, Card, CardContent, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import StatisticsSection from '../components/StatisticsSection';
import FilterSection from '../components/FilterSection';
import ChartSection from '../components/ChartSection';
import StudentDetailSection from '../components/StudentDetailSection';
import RekapTable from '../components/RekapTable';
import { rekapitulasiService } from '../utils/rekapitulasiService';
import BarChartIcon from '@mui/icons-material/BarChart';
import SchoolIcon from '@mui/icons-material/School';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import HomeIcon from '@mui/icons-material/Home';

// Hardcoded scoreMap for temporary scores
const scoreMap = {
  97: { ujian: [54, 80], kuis: [79], completion: 0.75 }, // Praktik Pengolahan Citra
  103: { ujian: [54, 90], kuis: [90], completion: 0.75 }, // Kecerdasan Buatan
  105: { ujian: [], kuis: [], completion: 0 }, // Pemprograman
  107: { ujian: [], kuis: [], completion: 0 }, // Mikrokontroller
};

// Styled components
const MainContent = styled(Box)(({ theme, open }) => ({
  flexGrow: 1,
  marginLeft: open ? 0 : 0,
  transition: theme.transitions.create(['margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  paddingTop: theme.spacing(10),
  backgroundColor: '#F5F6FA',
  minHeight: '100vh',
}));

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  background: '#FFFFFF',
  boxShadow: '0 4px 12px rgba(5, 13, 49, 0.15)',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 24px rgba(5, 13, 49, 0.25)',
  },
}));

const Rekapitulasi = () => {
  const [rekapData, setRekapData] = useState([]);
  const [matakuliahData, setMatakuliahData] = useState([]);
  const [mahasiswaData, setMahasiswaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedMahasiswa, setSelectedMahasiswa] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [rekap, matakuliah, mahasiswa] = await Promise.all([
          rekapitulasiService.getRekapitulasiData().catch(() => []),
          rekapitulasiService.getMatakuliahProgress().catch(() => []),
          rekapitulasiService.getMahasiswaData().catch(() => []),
        ]);
        console.log('Fetched rekapData:', rekap);
        console.log('Fetched matakuliahData:', matakuliah);
        console.log('Fetched mahasiswaData:', mahasiswa);
        setRekapData(rekap.length ? rekap : fallbackRekapData);
        setMatakuliahData(matakuliah.length ? matakuliah : fallbackMatakuliahData);
        setMahasiswaData(mahasiswa.length ? mahasiswa : fallbackMahasiswaData);
        if (rekap.length === 0) {
          setError('Tidak ada data rekapitulasi tersedia. Menggunakan data sementara.');
        }
        if (matakuliah.length === 0) {
          setError('Tidak ada data mata kuliah tersedia. Menggunakan data sementara.');
        }
        if (mahasiswa.length === 0) {
          setError('Tidak ada data mahasiswa tersedia. Menggunakan data sementara.');
        }
      } catch (err) {
        setError('Gagal memuat data. Menggunakan data sementara.');
        console.error('Fetch Error:', err);
        setRekapData(fallbackRekapData);
        setMatakuliahData(fallbackMatakuliahData);
        setMahasiswaData(fallbackMahasiswaData);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fallback data
  const fallbackRekapData = [
    {
      id: 4,
      mahasiswa: { namaLengkap: 'Saepulloh', nim: '21254322017' },
      matakuliah: { id: 97, nama: 'Praktik Pengolahan Citra', pertemuans: [{ id: 1 }, { id: 2 }] },
    },
    {
      id: 6,
      mahasiswa: { namaLengkap: 'Mahasiswa 2', nim: '21254323035' },
      matakuliah: { id: 103, nama: 'Kecerdasan Buatan', pertemuans: [{ id: 3 }, { id: 4 }] },
    },
    {
      id: 8,
      mahasiswa: { namaLengkap: 'Mahasiswa 3', nim: '21254322011' },
      matakuliah: { id: 107, nama: 'Mikrokontroller', pertemuans: [] },
    },
  ];

  const fallbackMatakuliahData = [
    { id: 97, nama: 'Praktik Pengolahan Citra', pertemuans: [{ id: 1 }, { id: 2 }] },
    { id: 103, nama: 'Kecerdasan Buatan', pertemuans: [{ id: 3 }, { id: 4 }] },
    { id: 105, nama: 'Pemprograman', pertemuans: [] },
    { id: 107, nama: 'Mikrokontroller', pertemuans: [] },
  ];

  const fallbackMahasiswaData = [
    { id: 57, namaLengkap: 'Saepulloh', nim: '21254322017', semester: 8, program_studi: { nama: 'Informatika' } },
    { id: 59, namaLengkap: 'Mahasiswa 2', nim: '21254323035', semester: 8, program_studi: { nama: 'Informatika' } },
    { id: 61, namaLengkap: 'Mahasiswa 3', nim: '21254322011', semester: 8, program_studi: { nama: 'Informatika' } },
  ];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Process data for StudentDetailSection
  const getStudentDetails = () => {
    if (!selectedMahasiswa) return [];
    const studentRekap = rekapData.filter((item) => item.mahasiswa?.nim === selectedMahasiswa.nim);
    return matakuliahData.map((mk) => {
      const rekap = studentRekap.find((r) => r.matakuliah?.id === mk.id) || {};
      const scores = scoreMap[mk.id] || { ujian: [], kuis: [], completion: 0 };
      const ujianScores = scores.ujian || [];
      const kuisScores = scores.kuis || [];
      const allScores = [...ujianScores, ...kuisScores].filter((score) => score !== undefined);
      const avgScore = allScores.length > 0 ? (allScores.reduce((sum, score) => sum + score, 0) / allScores.length).toFixed(1) : '0.0';
      const completionRate = scores.completion || 0;
      const attendedMeetings = rekap.matakuliah?.pertemuans?.length || 0;
      const totalMeetings = mk.pertemuans?.length || 0;
      return {
        matakuliah: mk.nama,
        ujianScores: ujianScores.length > 0 ? ujianScores.join(', ') : '-',
        kuisScores: kuisScores.length > 0 ? kuisScores.join(', ') : '-',
        avgScore,
        completionRate: (completionRate * 100).toFixed(2) + '%',
        attendance: totalMeetings ? `${attendedMeetings}/${totalMeetings}` : '0/0',
      };
    });
  };

  // Process data for ChartSection
  const getChartData = () => {
    if (!selectedMahasiswa) {
      return {
        radarData: matakuliahData.map((mk) => ({
          subject: mk.nama,
          A: scoreMap[mk.id]
            ? (scoreMap[mk.id].ujian.concat(scoreMap[mk.id].kuis).reduce((sum, s) => sum + s, 0) /
                (scoreMap[mk.id].ujian.length + scoreMap[mk.id].kuis.length) || 0).toFixed(1)
            : 0,
        })),
        barData: matakuliahData.map((mk) => ({
          name: mk.nama,
          completion: (scoreMap[mk.id]?.completion || 0) * 100,
        })),
      };
    }
    const details = getStudentDetails();
    return {
      radarData: details.map((d) => ({
        subject: d.matakuliah,
        A: parseFloat(d.avgScore) || 0,
      })),
      barData: details.map((d) => ({
        name: d.matakuliah,
        completion: parseFloat(d.completionRate) || 0,
      })),
    };
  };

  // Process data for Progress Analysis
  const getProgressAnalysisData = () => {
    const filteredRekap = selectedMahasiswa
      ? rekapData.filter((r) => r.mahasiswa?.nim === selectedMahasiswa.nim)
      : rekapData;

    const relevantMatakuliah = selectedMahasiswa
      ? matakuliahData.filter((mk) => filteredRekap.some((r) => r.matakuliah?.id === mk.id))
      : matakuliahData;

    const stats = relevantMatakuliah.map((mk) => {
      const rekap = filteredRekap.find((r) => r.matakuliah?.id === mk.id) || {};
      const scores = scoreMap[mk.id] || { ujian: [], kuis: [], completion: 0 };
      const allScores = [...(scores.ujian || []), ...(scores.kuis || [])].filter((score) => score !== undefined);
      const avgScore = allScores.length > 0 ? (allScores.reduce((sum, score) => sum + score, 0) / allScores.length).toFixed(1) : '0.0';
      const highestScore = allScores.length > 0 ? Math.max(...allScores) : 0;
      const lowestScore = allScores.length > 0 ? Math.min(...allScores) : 0;
      const completionRate = scores.completion || 0;
      const attendedMeetings = rekap.matakuliah?.pertemuans?.length || 0;
      const totalMeetings = mk.pertemuans?.length || 0;

      return {
        matakuliah: mk.nama,
        avgScore,
        highestScore,
        lowestScore,
        completionRate: (completionRate * 100).toFixed(2) + '%',
        attendance: totalMeetings ? `${attendedMeetings}/${totalMeetings}` : '0/0',
      };
    });

    const overallStats = {
      averageScore: stats.length > 0 ? (stats.reduce((sum, s) => sum + parseFloat(s.avgScore), 0) / stats.length).toFixed(1) : '0.0',
      highestScore: stats.length > 0 ? Math.max(...stats.map(s => parseFloat(s.highestScore))) : 0,
      lowestScore: stats.length > 0 ? Math.min(...stats.filter(s => s.lowestScore > 0).map(s => parseFloat(s.lowestScore))) : 0,
      completionRate: stats.length > 0 ? (stats.reduce((sum, s) => sum + parseFloat(s.completionRate), 0) / stats.length).toFixed(2) + '%' : '0%',
    };

    return { stats, overallStats };
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar open={sidebarOpen} handleDrawerToggle={handleDrawerToggle} role="dosen" />
      <MainContent open={sidebarOpen}>
        <Header title="Rekapitulasi Progress" />
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Breadcrumbs sx={{ mb: 3, color: '#050D31' }}>
            <Link
              underline="hover"
              sx={{ display: 'flex', alignItems: 'center', color: '#050D31' }}
              href="/dosen"
            >
              <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
              Dashboard
            </Link>
            <Typography color="#050D31">Rekapitulasi Progress</Typography>
          </Breadcrumbs>

          <Typography
            variant="h4"
            gutterBottom
            sx={{ fontWeight: 700, mb: 4, color: '#050D31' }}
          >
            Rekapitulasi Progress Akademik
          </Typography>

          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              mb: 4,
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                color: '#050D31',
                '&.Mui-selected': {
                  color: '#2196F3',
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#2196F3',
              },
            }}
          >
            <Tab label="Ringkasan" icon={<BarChartIcon />} iconPosition="start" />
            <Tab label="Detail Mahasiswa" icon={<SchoolIcon />} iconPosition="start" />
            <Tab label="Analisis Progress" icon={<TrendingUpIcon />} iconPosition="start" />
          </Tabs>

          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
              <CircularProgress size={60} color="primary" />
            </Box>
          ) : error ? (
            <Alert severity="warning" sx={{ mt: 4 }}>
              {error}
            </Alert>
          ) : (
            <>
              {activeTab === 0 && (
                <>
                  {mahasiswaData.length === 0 ? (
                    <Alert severity="warning" sx={{ mb: 3 }}>
                      Tidak ada data mahasiswa tersedia. Menggunakan data sementara.
                    </Alert>
                  ) : (
                    <FilterSection
                      mahasiswaData={mahasiswaData}
                      selectedMahasiswa={selectedMahasiswa}
                      setSelectedMahasiswa={setSelectedMahasiswa}
                    />
                  )}
                  {matakuliahData.length === 0 ? (
                    <Alert severity="warning" sx={{ mb: 3 }}>
                      Tidak ada data mata kuliah tersedia. Menggunakan data sementara.
                    </Alert>
                  ) : (
                    <StatisticsSection
                      rekapData={rekapData}
                      matakuliahData={matakuliahData}
                      mahasiswaData={mahasiswaData}
                      selectedMahasiswa={selectedMahasiswa}
                    />
                  )}
                  <ChartSection
                    rekapData={rekapData}
                    matakuliahData={matakuliahData}
                    selectedMahasiswa={selectedMahasiswa}
                    chartData={getChartData()}
                  />
                  {selectedMahasiswa && (
                    <StudentDetailSection
                      rekapData={rekapData}
                      matakuliahData={matakuliahData}
                      selectedMahasiswa={selectedMahasiswa}
                      details={getStudentDetails()}
                    />
                  )}
                </>
              )}

              {activeTab === 1 && (
                <>
                  {mahasiswaData.length === 0 ? (
                    <Alert severity="warning" sx={{ mb: 3 }}>
                      Tidak ada data mahasiswa tersedia. Menggunakan data sementara.
                    </Alert>
                  ) : (
                    <>
                      <FilterSection
                        mahasiswaData={mahasiswaData}
                        selectedMahasiswa={selectedMahasiswa}
                        setSelectedMahasiswa={setSelectedMahasiswa}
                      />
                      {selectedMahasiswa ? (
                        <Box sx={{ mb: 3 }}>
                          <StyledCard sx={{ mb: 3 }}>
                            <CardContent>
                              <Typography variant="h6" sx={{ fontWeight: 600, color: '#050D31', mb: 2 }}>
                                Informasi Mahasiswa
                              </Typography>
                              <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="body2" sx={{ color: '#666666' }}>
                                    Nama: <strong>{selectedMahasiswa.namaLengkap}</strong>
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: '#666666', mt: 1 }}>
                                    NIM: <strong>{selectedMahasiswa.nim}</strong>
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="body2" sx={{ color: '#666666' }}>
                                    Program Studi: <strong>{selectedMahasiswa.program_studi?.nama || '-'}</strong>
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: '#666666', mt: 1 }}>
                                    Semester: <strong>{selectedMahasiswa.semester || '-'}</strong>
                                  </Typography>
                                </Grid>
                              </Grid>
                            </CardContent>
                          </StyledCard>
                          <StudentDetailSection
                            rekapData={rekapData}
                            matakuliahData={matakuliahData}
                            selectedMahasiswa={selectedMahasiswa}
                            details={getStudentDetails()}
                          />
                        </Box>
                      ) : (
                        <Alert severity="info" sx={{ mb: 3 }}>
                          Silakan pilih mahasiswa untuk melihat detail.
                        </Alert>
                      )}
                    </>
                  )}
                </>
              )}

              {activeTab === 2 && (
                <>
                  {mahasiswaData.length === 0 ? (
                    <Alert severity="warning" sx={{ mb: 3 }}>
                      Tidak ada data mahasiswa tersedia. Menggunakan data sementara.
                    </Alert>
                  ) : (
                    <>
                      <FilterSection
                        mahasiswaData={mahasiswaData}
                        selectedMahasiswa={selectedMahasiswa}
                        setSelectedMahasiswa={setSelectedMahasiswa}
                      />
                      <ChartSection
                        rekapData={rekapData}
                        matakuliahData={matakuliahData}
                        selectedMahasiswa={selectedMahasiswa}
                        chartData={getChartData()}
                        isAnalysis
                      />
                      {selectedMahasiswa && (
                        <Box sx={{ mt: 3 }}>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 600, color: '#050D31', mb: 2 }}
                          >
                            Statistik Performa
                          </Typography>
                          <Grid container spacing={2}>
                            {[
                              {
                                label: 'Rata-rata Nilai',
                                value: getProgressAnalysisData().overallStats.averageScore,
                                color: '#2196F3',
                              },
                              {
                                label: 'Nilai Tertinggi',
                                value: getProgressAnalysisData().overallStats.highestScore,
                                color: '#4CAF50',
                              },
                              {
                                label: 'Nilai Terendah',
                                value: getProgressAnalysisData().overallStats.lowestScore,
                                color: '#FF9800',
                              },
                              {
                                label: 'Tingkat Penyelesaian',
                                value: getProgressAnalysisData().overallStats.completionRate,
                                color: '#00BCD4',
                              },
                            ].map((stat, index) => (
                              <Grid item xs={12} sm={6} md={3} key={index}>
                                <StyledCard>
                                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
                                    <Box sx={{ color: stat.color, fontSize: 32 }}><BarChartIcon /></Box>
                                    <Box>
                                      <Typography
                                        variant="body2"
                                        sx={{ color: '#666666', fontSize: '0.9rem', mb: 0.5 }}
                                      >
                                        {stat.label}
                                      </Typography>
                                      <Typography
                                        variant="h6"
                                        sx={{ color: stat.color, fontWeight: 700, fontSize: '1.25rem' }}
                                      >
                                        {stat.value}
                                      </Typography>
                                    </Box>
                                  </CardContent>
                                </StyledCard>
                              </Grid>
                            ))}
                          </Grid>
                          <StyledCard sx={{ mt: 3 }}>
                            <CardContent>
                              <Typography variant="h6" sx={{ fontWeight: 600, color: '#050D31', mb: 2 }}>
                                Detail Per Mata Kuliah
                              </Typography>
                              <TableContainer>
                                <Table>
                                  <TableHead>
                                    <TableRow>
                                      <TableCell sx={{ fontWeight: 600, color: '#050D31' }}>Mata Kuliah</TableCell>
                                      <TableCell sx={{ fontWeight: 600, color: '#050D31' }}>Rata-rata Nilai</TableCell>
                                      <TableCell sx={{ fontWeight: 600, color: '#050D31' }}>Nilai Tertinggi</TableCell>
                                      <TableCell sx={{ fontWeight: 600, color: '#050D31' }}>Nilai Terendah</TableCell>
                                      <TableCell sx={{ fontWeight: 600, color: '#050D31' }}>Penyelesaian</TableCell>
                                      <TableCell sx={{ fontWeight: 600, color: '#050D31' }}>Kehadiran</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {getProgressAnalysisData().stats.map((stat, index) => (
                                      <TableRow key={index}>
                                        <TableCell sx={{ color: '#050D31' }}>{stat.matakuliah}</TableCell>
                                        <TableCell>
                                          <Chip
                                            label={stat.avgScore}
                                            color={parseFloat(stat.avgScore) >= 60 ? 'success' : 'error'}
                                            size="small"
                                            sx={{ fontWeight: 500, bgcolor: parseFloat(stat.avgScore) >= 60 ? '#E8F5E9' : '#FFEBEE' }}
                                          />
                                        </TableCell>
                                        <TableCell sx={{ color: '#050D31' }}>{stat.highestScore || '-'}</TableCell>
                                        <TableCell sx={{ color: '#050D31' }}>{stat.lowestScore || '-'}</TableCell>
                                        <TableCell sx={{ color: '#050D31' }}>{stat.completionRate}</TableCell>
                                        <TableCell sx={{ color: '#050D31' }}>{stat.attendance}</TableCell>
                                      </TableRow>
                                    ))}
                                    {getProgressAnalysisData().stats.length === 0 && (
                                      <TableRow>
                                        <TableCell colSpan={6} sx={{ textAlign: 'center', color: '#666666', py: 4 }}>
                                          Tidak ada data tersedia
                                        </TableCell>
                                      </TableRow>
                                    )}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </CardContent>
                          </StyledCard>
                        </Box>
                      )}
                    </>
                  )}
                </>
              )}
            </>
          )}
        </Container>
      </MainContent>
    </Box>
  );
};

export default Rekapitulasi;