import React from 'react';
import { Typography, Paper, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import SchoolIcon from '@mui/icons-material/School';

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

const StudentDetailSection = ({ rekapData, matakuliahData, selectedMahasiswa, details }) => {
  // Filter matakuliahData to only include courses the selected student is enrolled in
  const enrolledMatakuliah = matakuliahData.filter((mk) =>
    rekapData.some(
      (r) =>
        r.mahasiswa?.nim === selectedMahasiswa.nim &&
        r.matakuliah?.id === mk.id
    )
  );

  return (
    <StyledPaper sx={{ mb: 3 }}>
      <SectionHeader>
        <SchoolIcon sx={{ color: '#2196F3' }} />
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#050D31' }}>
          Detail Nilai Mahasiswa
        </Typography>
      </SectionHeader>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: '#050D31', bgcolor: '#F5F6FA' }}>Mata Kuliah</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#050D31', bgcolor: '#F5F6FA' }}>Nilai Ujian</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#050D31', bgcolor: '#F5F6FA' }}>Nilai Kuis</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#050D31', bgcolor: '#F5F6FA' }}>Rata-rata</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#050D31', bgcolor: '#F5F6FA' }}>Penyelesaian</TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#050D31', bgcolor: '#F5F6FA' }}>Kehadiran</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {details
              .filter((detail) => enrolledMatakuliah.some((mk) => mk.nama === detail.matakuliah))
              .map((detail, index) => (
                <TableRow key={index}>
                  <TableCell sx={{ color: '#050D31', fontWeight: 500 }}>{detail.matakuliah}</TableCell>
                  <TableCell sx={{ color: '#050D31' }}>{detail.ujianScores}</TableCell>
                  <TableCell sx={{ color: '#050D31' }}>{detail.kuisScores}</TableCell>
                  <TableCell>
                    <Chip
                      label={detail.avgScore}
                      color={parseFloat(detail.avgScore) >= 60 ? 'success' : 'error'}
                      size="small"
                      sx={{
                        fontWeight: 500,
                        bgcolor: parseFloat(detail.avgScore) >= 60 ? '#E8F5E9' : '#FFEBEE',
                        color: '#050D31',
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: '#050D31' }}>{detail.completionRate}</TableCell>
                  <TableCell sx={{ color: '#050D31' }}>{detail.attendance}</TableCell>
                </TableRow>
              ))}
            {enrolledMatakuliah.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: 'center', color: '#666666', py: 4 }}>
                  Tidak ada data nilai untuk mahasiswa ini
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </StyledPaper>
  );
};

export default StudentDetailSection;