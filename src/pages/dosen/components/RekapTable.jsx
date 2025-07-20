import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  TableSortLabel,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  maxHeight: '60vh',
}));

const RekapTable = ({ rekapData, matakuliahData }) => {
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('namaLengkap');

  const UJIAN_WEIGHT = 0.6;
  const KUIS_WEIGHT = 0.4;

  const groupedData = rekapData.reduce((acc, item) => {
    const mahasiswaId = item.mahasiswa?.id || item.mahasiswa?.nim;
    if (!acc[mahasiswaId]) {
      acc[mahasiswaId] = {
        mahasiswa: item.mahasiswa,
        scores: [],
        average: 0,
        completionRate: 0,
      };
    }

    const ujianScores = item.mahasiswa?.jawaban_ujians?.map((ju) => ju.nilai || 0) || [];
    const kuisScores = item.mahasiswa?.jawaban_kuis?.map((jk) => jk.nilai || 0) || [];

    const avgUjian = ujianScores.length
      ? ujianScores.reduce((sum, score) => sum + score, 0) / ujianScores.length
      : 0;
    const avgKuis = kuisScores.length
      ? kuisScores.reduce((sum, score) => sum + score, 0) / kuisScores.length
      : 0;

    const matakuliahScore = (avgUjian * UJIAN_WEIGHT + avgKuis * KUIS_WEIGHT).toFixed(2);

    const matakuliah = matakuliahData.find((mk) => mk.id === item.matakuliah?.id);
    const totalTasks = (matakuliah?.ujians?.length || 0) + (matakuliah?.soal_kuises?.length || 0);
    const completedTasks = ujianScores.length + kuisScores.length;
    const completionRate = totalTasks
      ? Math.min(((completedTasks / totalTasks) * 100).toFixed(2), 100)
      : 0;

    acc[mahasiswaId].scores.push({
      matakuliah: item.matakuliah?.nama,
      nilai: matakuliahScore,
      matakuliahId: item.matakuliah?.id,
      completionRate,
    });

    return acc;
  }, {});

  Object.values(groupedData).forEach((group) => {
    const validScores = group.scores.filter((s) => s.nilai > 0);
    group.average = validScores.length
      ? (validScores.reduce((sum, s) => sum + parseFloat(s.nilai), 0) / validScores.length).toFixed(2)
      : 0;
    group.completionRate = validScores.length
      ? (validScores.reduce((sum, s) => sum + parseFloat(s.completionRate), 0) / validScores.length).toFixed(2)
      : 0;
  });

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedData = Object.values(groupedData).sort((a, b) => {
    if (orderBy === 'namaLengkap') {
      return order === 'asc'
        ? (a.mahasiswa?.namaLengkap || '').localeCompare(b.mahasiswa?.namaLengkap || '')
        : (b.mahasiswa?.namaLengkap || '').localeCompare(a.mahasiswa?.namaLengkap || '');
    }
    if (orderBy === 'average') {
      return order === 'asc' ? a.average - b.average : b.average - a.average;
    }
    return 0;
  });

  return (
    <StyledTableContainer component={Paper}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>
              <TableSortLabel
                active={orderBy === 'namaLengkap'}
                direction={orderBy === 'namaLengkap' ? order : 'asc'}
                onClick={() => handleRequestSort('namaLengkap')}
              >
                Nama Mahasiswa
              </TableSortLabel>
            </TableCell>
            <TableCell>NIM</TableCell>
            <TableCell>Mata Kuliah</TableCell>
            <TableCell>Nilai</TableCell>
            <TableCell>
              <TableSortLabel
                active={orderBy === 'average'}
                direction={orderBy === 'average' ? order : 'asc'}
                onClick={() => handleRequestSort('average')}
              >
                Rata-rata
              </TableSortLabel>
            </TableCell>
            <TableCell>Penyelesaian</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedData.map((group, index) =>
            group.scores.length > 0 ? (
              group.scores.map((score, scoreIndex) => (
                <TableRow key={`${index}-${scoreIndex}`}>
                  {scoreIndex === 0 && (
                    <>
                      <TableCell rowSpan={group.scores.length}>
                        {group.mahasiswa?.namaLengkap || '-'}
                      </TableCell>
                      <TableCell rowSpan={group.scores.length}>
                        {group.mahasiswa?.nim || '-'}
                      </TableCell>
                    </>
                  )}
                  <TableCell>{score.matakuliah || '-'}</TableCell>
                  <TableCell>
                    {score.nilai > 0 ? (
                      <Chip
                        label={score.nilai}
                        color={score.nilai >= 60 ? 'success' : 'error'}
                        size="small"
                      />
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  {scoreIndex === 0 && (
                    <>
                      <TableCell rowSpan={group.scores.length}>
                        <Chip
                          label={group.average}
                          color={group.average >= 60 ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell rowSpan={group.scores.length}>
                        {group.completionRate}%
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow key={index}>
                <TableCell>{group.mahasiswa?.namaLengkap || '-'}</TableCell>
                <TableCell>{group.mahasiswa?.nim || '-'}</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell>
                  <Chip label="0" color="error" size="small" />
                </TableCell>
                <TableCell>0%</TableCell>
              </TableRow>
            )
          )}
          {sortedData.length === 0 && (
            <TableRow>
              <TableCell colSpan={6}>
                <Typography align="center" color="textSecondary">
                  Tidak ada data tersedia
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </StyledTableContainer>
  );
};

export default RekapTable;