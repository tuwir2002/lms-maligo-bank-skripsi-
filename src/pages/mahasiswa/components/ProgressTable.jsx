import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  Box,
} from '@mui/material';
import { Assignment } from '@mui/icons-material';

const ProgressTable = ({ details, student }) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <Card
        sx={{
          bgcolor: '#050D31',
          border: '1px solid #efbf04',
          borderRadius: 2,
          boxShadow: '0 0 10px rgba(239, 191, 4, 0.3)',
          width: '100%',
          maxWidth: 1000, // Limit card width for centering
          mx: 'auto',
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Assignment sx={{ color: '#efbf04', mr: 1, fontSize: 30 }} />
            <Typography
              variant="h5"
              sx={{ fontFamily: '"Orbitron", sans-serif', fontWeight: 600, color: '#FFFFFF' }}
            >
              Informasi Mahasiswa
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ mb: 1, color: '#FFFFFF', opacity: 0.7 }}>
            Nama: {student.namaLengkap}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, color: '#FFFFFF', opacity: 0.7 }}>
            NIM: {student.nim}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, color: '#FFFFFF', opacity: 0.7 }}>
            Program Studi: {student.program_studi?.nama || 'N/A'}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, color: '#FFFFFF', opacity: 0.7 }}>
            Semester: {student.semester || 'N/A'}
          </Typography>
          <Divider sx={{ bgcolor: '#efbf04', mb: 3 }} />
          <Typography
            variant="h5"
            sx={{ fontFamily: '"Orbitron", sans-serif', fontWeight: 600, color: '#FFFFFF', mb: 2 }}
          >
            Detail Progress Akademik
          </Typography>
          <TableContainer>
            <Table sx={{ bgcolor: '#050D31' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#efbf04', fontWeight: 600, borderBottom: '1px solid #efbf04' }}>
                    Mata Kuliah
                  </TableCell>
                  <TableCell sx={{ color: '#efbf04', fontWeight: 600, borderBottom: '1px solid #efbf04' }}>
                    Nilai Ujian
                  </TableCell>
                  <TableCell sx={{ color: '#efbf04', fontWeight: 600, borderBottom: '1px solid #efbf04' }}>
                    Nilai Kuis
                  </TableCell>
                  <TableCell sx={{ color: '#efbf04', fontWeight: 600, borderBottom: '1px solid #efbf04' }}>
                    Rata-rata
                  </TableCell>
                  <TableCell sx={{ color: '#efbf04', fontWeight: 600, borderBottom: '1px solid #efbf04' }}>
                    Penyelesaian
                  </TableCell>
                  <TableCell sx={{ color: '#efbf04', fontWeight: 600, borderBottom: '1px solid #efbf04' }}>
                    Kehadiran
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {details.map((detail, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ color: '#FFFFFF', borderBottom: '1px solid rgba(239, 191, 4, 0.3)' }}>
                      {detail.matakuliah}
                    </TableCell>
                    <TableCell sx={{ color: '#FFFFFF', borderBottom: '1px solid rgba(239, 191, 4, 0.3)' }}>
                      {detail.ujianScores}
                    </TableCell>
                    <TableCell sx={{ color: '#FFFFFF', borderBottom: '1px solid rgba(239, 191, 4, 0.3)' }}>
                      {detail.kuisScores}
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid rgba(239, 191, 4, 0.3)' }}>
                      <Chip
                        label={detail.avgScore}
                        sx={{
                          bgcolor: parseFloat(detail.avgScore) >= 60 ? '#efbf04' : '#d32f2f',
                          color: '#050D31',
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#FFFFFF', borderBottom: '1px solid rgba(239, 191, 4, 0.3)' }}>
                      {detail.completionRate}
                    </TableCell>
                    <TableCell sx={{ color: '#FFFFFF', borderBottom: '1px solid rgba(239, 191, 4, 0.3)' }}>
                      {detail.attendance}
                    </TableCell>
                  </TableRow>
                ))}
                {details.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      sx={{ textAlign: 'center', color: '#efbf04', py: 4, borderBottom: 'none' }}
                    >
                      Tidak ada data progress tersedia
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ProgressTable;