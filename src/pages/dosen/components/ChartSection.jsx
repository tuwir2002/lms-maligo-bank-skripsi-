import React, { useMemo } from 'react';
import { Typography, Paper, Box, Card, CardHeader, CardContent } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import RadarChart from '../components/RadarChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  background: '#FFFFFF',
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2),
  paddingBottom: theme.spacing(1),
  borderBottom: `1px solid ${theme.palette.grey[300]}`,
}));

const ChartSection = ({ rekapData, matakuliahData, selectedMahasiswa, isAnalysis = false }) => {
  const UJIAN_WEIGHT = 0.6;
  const KUIS_WEIGHT = 0.4;

  // Hardcoded scoreMap as fallback (same as in Rekapitulasi.jsx)
  const scoreMap = {
    97: { ujian: [54, 80], kuis: [79] }, // Praktik Pengolahan Citra
    103: { ujian: [54, 90], kuis: [90] }, // Kecerdasan Buatan
    105: { ujian: [], kuis: [] }, // Pemprograman
    107: { ujian: [], kuis: [] }, // Mikrokontroller
  };

  const calculateStudentMatakuliahScore = (rekapItems, matakuliahId) => {
    if (!rekapItems.length) return 0;

    let ujianScores = [];
    let kuisScores = [];

    // Try to filter by matakuliah-specific ujians and soal_kuises
    const matakuliah = matakuliahData.find((mk) => mk.id === matakuliahId);
    if (matakuliah) {
      ujianScores = rekapItems
        .flatMap((r) =>
          r.mahasiswa?.jawaban_ujians?.filter((ju) =>
            matakuliah.ujians?.some((uj) => uj.id === ju.ujian?.id)
          )?.map((ju) => ju.nilai || 0) || []
        );
      kuisScores = rekapItems
        .flatMap((r) =>
          r.mahasiswa?.jawaban_kuis?.filter((jk) =>
            matakuliah.soal_kuises?.some((sk) => sk.id === jk.soal_kuis?.id)
          )?.map((jk) => jk.nilai || 0) || []
        );
    }

    // Fallback: Use scoreMap for the matakuliah
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

    return (avgUjian * UJIAN_WEIGHT + avgKuis * KUIS_WEIGHT).toFixed(2);
  };

  const calculateMatakuliahAverageScore = (matakuliahId, rekapItems) => {
    const relatedRekap = rekapItems.filter((r) => r.matakuliah?.id === matakuliahId);
    if (!relatedRekap.length) return 0;

    const studentScores = relatedRekap.reduce((acc, r) => {
      const mahasiswaId = r.mahasiswa?.nim; // Use nim for consistency
      if (!acc[mahasiswaId]) {
        acc[mahasiswaId] = [];
      }
      acc[mahasiswaId].push(r);
      return acc;
    }, {});

    const scores = Object.values(studentScores).map((studentRekap) => {
      return calculateStudentMatakuliahScore(studentRekap, matakuliahId);
    });

    const validScores = scores.filter((score) => score > 0);
    return validScores.length
      ? (validScores.reduce((sum, score) => sum + parseFloat(score), 0) / validScores.length).toFixed(2)
      : 0;
  };

  const radarData = useMemo(() => {
    const filteredRekap = selectedMahasiswa
      ? rekapData.filter((r) => r.mahasiswa?.nim === selectedMahasiswa.nim)
      : rekapData;

    // Only include matakuliah that the student is enrolled in when a student is selected
    const relevantMatakuliah = selectedMahasiswa
      ? matakuliahData.filter((mk) => filteredRekap.some((r) => r.matakuliah?.id === mk.id))
      : matakuliahData;

    const labels = relevantMatakuliah.map((mk) => mk.nama);
    const data = relevantMatakuliah.map((mk) => {
      if (selectedMahasiswa) {
        const relatedRekap = filteredRekap.filter((r) => r.matakuliah?.id === mk.id);
        return calculateStudentMatakuliahScore(relatedRekap, mk.id);
      } else {
        return calculateMatakuliahAverageScore(mk.id, rekapData);
      }
    });

    return {
      labels,
      datasets: [
        {
          label: selectedMahasiswa
            ? `Nilai ${selectedMahasiswa.namaLengkap}`
            : 'Rata-rata Nilai per Mata Kuliah',
          data,
          backgroundColor: 'rgba(33, 150, 243, 0.2)',
          borderColor: '#2196F3',
          borderWidth: 2,
          pointBackgroundColor: '#2196F3',
        },
      ],
    };
  }, [matakuliahData, rekapData, selectedMahasiswa]);

  const barData = useMemo(() => {
    const filteredRekap = selectedMahasiswa
      ? rekapData.filter((r) => r.mahasiswa?.nim === selectedMahasiswa.nim)
      : rekapData;

    // Only include matakuliah that the student is enrolled in when a student is selected
    const relevantMatakuliah = selectedMahasiswa
      ? matakuliahData.filter((mk) => filteredRekap.some((r) => r.matakuliah?.id === mk.id))
      : matakuliahData;

    const labels = relevantMatakuliah.map((mk) => mk.nama);
    const data = relevantMatakuliah.map((mk) => {
      if (selectedMahasiswa) {
        const relatedRekap = filteredRekap.filter((r) => r.matakuliah?.id === mk.id);
        return calculateStudentMatakuliahScore(relatedRekap, mk.id);
      } else {
        return calculateMatakuliahAverageScore(mk.id, rekapData);
      }
    });

    return {
      labels,
      datasets: [
        {
          label: selectedMahasiswa ? `Nilai ${selectedMahasiswa.namaLengkap}` : 'Rata-rata Nilai',
          data,
          backgroundColor: 'rgba(33, 150, 243, 0.6)',
          borderColor: '#2196F3',
          borderWidth: 1,
        },
      ],
    };
  }, [matakuliahData, rekapData, selectedMahasiswa]);

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 14 },
          color: '#050D31',
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(5, 13, 49, 0.8)',
        titleFont: { size: 14 },
        bodyFont: { size: 12 },
        padding: 12,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Nilai',
          font: { size: 14, weight: '600' },
          color: '#050D31',
        },
        grid: {
          color: 'rgba(5, 13, 49, 0.1)',
        },
        ticks: {
          color: '#050D31',
          font: { size: 12 },
        },
      },
      x: {
        title: {
          display: true,
          text: 'Mata Kuliah',
          font: { size: 14, weight: '600' },
          color: '#050D31',
        },
        grid: {
          display: false,
        },
        ticks: {
          color: '#050D31',
          font: { size: 10 },
          maxRotation: 45,
          minRotation: 45,
          autoSkip: false,
        },
      },
    },
    maxBarThickness: 40,
  };

  return (
    <StyledPaper sx={{ mb: 3 }}>
      <SectionHeader>
        {isAnalysis ? (
          <TrendingUpIcon sx={{ color: '#2196F3' }} />
        ) : (
          <BarChartIcon sx={{ color: '#2196F3' }} />
        )}
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#050D31' }}>
          {isAnalysis ? 'Analisis Progress Belajar' : 'Distribusi Nilai Mata Kuliah'}
        </Typography>
      </SectionHeader>
      {barData.labels.length === 0 ? (
        <Typography align="center" color="#666666" sx={{ py: 4 }}>
          Tidak ada data nilai untuk ditampilkan
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(5, 13, 49, 0.1)' }}>
            <CardHeader
              title="Radar Chart"
              titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600, color: '#050D31' }}
              sx={{ bgcolor: '#F5F6FA', py: 1.5 }}
            />
            <CardContent sx={{ pt: 2 }}>
              <Box sx={{ height: '400px', overflowX: 'auto' }}>
                <RadarChart data={radarData} />
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(5, 13, 49, 0.1)' }}>
            <CardHeader
              title="Bar Chart"
              titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600, color: '#050D31' }}
              sx={{ bgcolor: '#F5F6FA', py: 1.5 }}
            />
            <CardContent sx={{ pt: 2 }}>
              <Box sx={{ height: '400px', overflowX: 'auto' }}>
                <Bar data={barData} options={barOptions} />
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}
    </StyledPaper>
  );
};

export default ChartSection;