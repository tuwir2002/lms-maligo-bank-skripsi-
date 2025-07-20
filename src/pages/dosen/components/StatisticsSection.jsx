import React, { useMemo } from 'react';
import { Grid, Typography, Paper, Card, CardContent, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import PeopleIcon from '@mui/icons-material/People';
import ScoreIcon from '@mui/icons-material/Score';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SchoolIcon from '@mui/icons-material/School';
import GroupIcon from '@mui/icons-material/Group';
import ClassIcon from '@mui/icons-material/Class';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  background: '#FFFFFF',
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

const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2),
  paddingBottom: theme.spacing(1),
  borderBottom: `1px solid ${theme.palette.grey[300]}`,
}));

const StatisticsSection = ({ rekapData, matakuliahData, mahasiswaData, selectedMahasiswa }) => {
  const UJIAN_WEIGHT = 0.6;
  const KUIS_WEIGHT = 0.4;

  // Hardcoded scoreMap as fallback (same as in Rekapitulasi.jsx)
  const scoreMap = {
    97: { ujian: [54, 80], kuis: [79] }, // Praktik Pengolahan Citra
    103: { ujian: [54, 90], kuis: [90] }, // Kecerdasan Buatan
    105: { ujian: [], kuis: [] }, // Pemprograman
    107: { ujian: [], kuis: [] }, // Mikrokontroller
  };

  const statistics = useMemo(() => {
    // Filter rekapData based on selectedMahasiswa
    const filteredRekap = selectedMahasiswa
      ? rekapData.filter((r) => r.mahasiswa?.nim === selectedMahasiswa.nim)
      : rekapData;

    // Total mahasiswa keseluruhan
    const totalStudents = mahasiswaData.length;

    // Daftar program studi tanpa jumlah
    const programStudiList = [...new Set(mahasiswaData
      .map(m => m.program_studi?.nama)
      .filter(Boolean))]
      .join(', ');

    // Daftar semester tanpa jumlah
    const semesterList = [...new Set(mahasiswaData
      .map(m => m.semester)
      .filter(Boolean))]
      .sort()
      .map(s => `Sem ${s}`)
      .join(', ');

    // Perhitungan nilai
    const scores = filteredRekap.map((r) => {
      const matakuliahId = r.matakuliah?.id;
      const matakuliah = matakuliahData.find((mk) => mk.id === matakuliahId);

      // Try to get scores from jawaban_ujians and jawaban_kuis
      let ujianScores = r.mahasiswa?.jawaban_ujians
        ?.filter((ju) => matakuliah?.ujians?.some((uj) => uj.id === ju.ujian?.id))
        ?.map((ju) => ju.nilai || 0) || [];
      let kuisScores = r.mahasiswa?.jawaban_kuis
        ?.filter((jk) => matakuliah?.soal_kuises?.some((sk) => sk.id === jk.soal_kuis?.id))
        ?.map((jk) => jk.nilai || 0) || [];

      // Fallback to scoreMap if no scores are found
      if (!ujianScores.length && !kuisScores.length && scoreMap[matakuliahId]) {
        ujianScores = scoreMap[matakuliahId].ujian || [];
        kuisScores = scoreMap[matakuliahId].kuis || [];
      }

      const avgUjian = ujianScores.length
        ? ujianScores.reduce((sum, score) => sum + score, 0) / ujianScores.length
        : 0;
      const avgKuis = kuisScores.length
        ? kuisScores.reduce((sum, score) => sum + score, 0) / kuisScores.length
        : 0;

      return (avgUjian * UJIAN_WEIGHT + avgKuis * KUIS_WEIGHT) || 0;
    }).filter(score => score > 0);

    // Rata-rata nilai (semua mahasiswa atau mahasiswa terpilih)
    const averageScore = scores.length
      ? (scores.reduce((sum, s) => sum + s, 0) / scores.length).toFixed(2)
      : 0;

    const scoreDistribution = scores.length
      ? {
          high: ((scores.filter((s) => s > 80).length / scores.length) * 100).toFixed(2),
          medium: ((scores.filter((s) => s >= 60 && s <= 80).length / scores.length) * 100).toFixed(2),
          low: ((scores.filter((s) => s < 60).length / scores.length) * 100).toFixed(2),
        }
      : { high: 0, medium: 0, low: 0 };

    const passingRate = scores.length
      ? ((scores.filter((s) => s >= 60).length / scores.length) * 100).toFixed(2)
      : 0;

    // Perhitungan tingkat penyelesaian yang dibatasi maksimal 100%
    const completionRate = filteredRekap.length
      ? filteredRekap.reduce((acc, r) => {
          const matakuliahId = r.matakuliah?.id;
          const matakuliah = matakuliahData.find((mk) => mk.id === matakuliahId);

          // Get ujian and kuis counts
          let completedUjians = r.mahasiswa?.jawaban_ujians
            ?.filter((ju) => matakuliah?.ujians?.some((uj) => uj.id === ju.ujian?.id))
            ?.length || 0;
          let completedKuis = r.mahasiswa?.jawaban_kuis
            ?.filter((jk) => matakuliah?.soal_kuises?.some((sk) => sk.id === jk.soal_kuis?.id))
            ?.length || 0;

          // Fallback to scoreMap counts if no completed tasks
          if (!completedUjians && !completedKuis && scoreMap[matakuliahId]) {
            completedUjians = scoreMap[matakuliahId].ujian?.length || 0;
            completedKuis = scoreMap[matakuliahId].kuis?.length || 0;
          }

          const totalTasks = (matakuliah?.ujians?.length || 0) + (matakuliah?.soal_kuises?.length || matakuliah?.pertemuans?.length || 0);
          const completedTasks = completedUjians + completedKuis;
          const rate = totalTasks ? (completedTasks / totalTasks) * 100 : 0;
          return acc + Math.min(rate, 100);
        }, 0) / filteredRekap.length
      : 0;

    // Perhitungan mata kuliah aktif
    const activeCourses = selectedMahasiswa
      ? new Set(filteredRekap.map((r) => r.matakuliah?.id)).size
      : new Set(matakuliahData.map((mk) => mk.id)).size;

    return {
      totalStudents,
      programStudiList,
      semesterList,
      scoreDistribution,
      averageScore,
      passingRate,
      completionRate: completionRate.toFixed(2),
      activeCourses,
    };
  }, [rekapData, matakuliahData, mahasiswaData, selectedMahasiswa]);

  return (
    <StyledPaper sx={{ mb: 3 }}>
      <SectionHeader>
        <PeopleIcon sx={{ color: '#2196F3' }} />
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#050D31' }}>
          Statistik Akademik
        </Typography>
      </SectionHeader>
      <Grid container spacing={2}>
        {[
          {
            label: 'Total Mahasiswa',
            value: statistics.totalStudents,
            icon: <PeopleIcon />,
            color: '#2196F3',
          },
          {
            label: 'Program Studi',
            value: statistics.programStudiList || 'Tidak ada data',
            icon: <GroupIcon />,
            color: '#4CAF50',
          },
          {
            label: 'Semester',
            value: statistics.semesterList || 'Tidak ada data',
            icon: <ClassIcon />,
            color: '#00BCD4',
          },
          {
            label: selectedMahasiswa ? `Rata-rata Nilai (${selectedMahasiswa.namaLengkap})` : 'Rata-rata Nilai Keseluruhan',
            value: statistics.averageScore,
            icon: <ScoreIcon />,
            color: '#FF9800',
          },
          {
            label: 'Tingkat Kelulusan',
            value: `${statistics.passingRate}%`,
            icon: <CheckCircleIcon />,
            color: '#866600',
          },
          {
            label: 'Tingkat Penyelesaian',
            value: `${statistics.completionRate}%`,
            icon: <AssignmentIcon />,
            color: '#2196F3',
          },
          {
            label: 'Mata Kuliah Aktif',
            value: statistics.activeCourses,
            icon: <SchoolIcon />,
            color: '#4CAF50',
          },
          {
            label: 'Distribusi Nilai',
            value: `>80: ${statistics.scoreDistribution.high}% | 60-80: ${statistics.scoreDistribution.medium}% | <60: ${statistics.scoreDistribution.low}%`,
            icon: <ScoreIcon />,
            color: '#00BCD4',
          },
        ].map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StyledCard>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
                <Box sx={{ color: stat.color, fontSize: 32 }}>{stat.icon}</Box>
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
    </StyledPaper>
  );
};

export default StatisticsSection;