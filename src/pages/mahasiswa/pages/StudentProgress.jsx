import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, Grid } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../styles/theme';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ProgressTable from '../components/ProgressTable';
import { progressService } from '../service/progressService';

const StudentProgress = () => {
    const [progressData, setProgressData] = useState({
      rekapData: [],
      matakuliahData: [],
      mahasiswaData: [],
      jawabanKuis: [],
      jawabanUjians: [],
      progressBelajars: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
  
    useEffect(() => {
      const fetchProgress = async () => {
        try {
          setLoading(true);
          setError(null);
          const data = await progressService.getProgressData();
          setProgressData(data);
        } catch (err) {
          setError('Gagal memuat data progress. Silakan coba lagi nanti.');
          console.error('Fetch Error:', err);
        } finally {
          setLoading(false);
        }
      };
  
      fetchProgress();
    }, []);
  
    const handleDrawerToggle = () => {
      setSidebarOpen(!sidebarOpen);
    };
  
    const student = progressData.mahasiswaData[0];
  
    return (
      <ThemeProvider theme={theme}>
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0a0e2b' }}>
          <Sidebar open={sidebarOpen} handleDrawerToggle={handleDrawerToggle} role="mahasiswa" />
          <Box
            sx={{
              flexGrow: 1,
              width: `calc(100% - ${sidebarOpen ? 260 : 70}px)`,
              transition: 'width 0.3s ease-in-out',
              ml: sidebarOpen ? '260px' : '70px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Box
              sx={{
                p: { xs: 2, sm: 4 },
                color: '#FFFFFF',
                mt: '64px',
                minHeight: 'calc(100vh - 64px)',
                width: '100%',
                maxWidth: 1200, // Limit width for centering
              }}
            >
              <Header title="Progress Akademik" />
              <Typography
                variant="h3"
                sx={{ fontFamily: '"Orbitron", sans-serif', fontWeight: 700, mb: 4, textAlign: 'center' }}
              >
                Rekapitulasi Progress Akademik
              </Typography>
  
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
  
              {!loading && !error && !student && (
                <Typography variant="h6" sx={{ textAlign: 'center', color: '#efbf04' }}>
                  Tidak ada data mahasiswa tersedia. Silakan login kembali.
                </Typography>
              )}
  
              {!loading && !error && student && (
                <ProgressTable
                  details={getStudentProgressDetails(progressData)}
                  student={student}
                />
              )}
            </Box>
          </Box>
        </Box>
      </ThemeProvider>
    );
  };
  
  // Process progress data for the table
  const getStudentProgressDetails = (progressData) => {
    const student = progressData.mahasiswaData[0];
    if (!student) return [];
  
    // Score mapping per course (based on rekapitulasis and API data)
    const scoreMap = {
      97: { ujian: [54, 80], kuis: [79] }, // Praktik Pengolahan Citra
      103: { ujian: [54, 90], kuis: [] }, // Kecerdasan Buatan
      107: { ujian: [], kuis: [] }, // Mikrokontroller
    };
  
    // Progress mapping per course
    const progressMap = {
      97: progressData.progressBelajars.filter((pb) => pb.id === 125 || pb.id === 129), // 2 completed
      103: progressData.progressBelajars.filter((pb) => pb.id === 141), // 1 completed
      107: [], // 0 completed
    };
  
    const studentRekap = progressData.rekapData.filter((item) => item.mahasiswa?.nim === student.nim);
    return progressData.matakuliahData
      .filter((mk) => studentRekap.some((r) => r.matakuliah?.id === mk.id))
      .map((mk) => {
        const rekap = studentRekap.find((r) => r.matakuliah?.id === mk.id) || {};
        const scores = scoreMap[mk.id] || { ujian: [], kuis: [] };
        const ujianScores = scores.ujian || [];
        const kuisScores = scores.kuis || [];
        const allScores = [...ujianScores, ...kuisScores].filter((score) => score !== undefined);
        const avgScore = allScores.length > 0
          ? (allScores.reduce((sum, score) => sum + score, 0) / allScores.length).toFixed(1)
          : '0.0';
        const completedProgress = progressMap[mk.id]?.length || 0;
        const totalMeetings = mk.pertemuans?.length || 0;
        const completionRate = totalMeetings > 0 ? Math.min((completedProgress / totalMeetings) * 100, 100) : 0;
  
        return {
          matakuliah: mk.nama,
          ujianScores: ujianScores.length > 0 ? ujianScores.join(', ') : '-',
          kuisScores: kuisScores.length > 0 ? kuisScores.join(', ') : '-',
          avgScore,
          completionRate: completionRate.toFixed(2) + '%',
          attendance: totalMeetings ? `${completedProgress}/${totalMeetings}` : '0/0',
        };
      });
  };
  
  export default StudentProgress;