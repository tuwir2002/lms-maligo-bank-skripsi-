import React, { useState, useMemo } from 'react';
import {
  Modal,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  IconButton,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useSnackbar } from 'notistack';

// Konstanta untuk panjang maksimum teks sebelum menggunakan ikon
const MAX_TEXT_LENGTH = 100;
const TABLE_HEADER_BG = '#1976d2';
const TABLE_HEADER_COLOR = '#ffffff';

// Komponen untuk modal teks panjang
const TextModal = ({ open, onClose, title, content }) => (
  <Modal open={open} onClose={onClose}>
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        borderRadius: 2,
        maxWidth: '80%',
        maxHeight: '80vh',
        overflow: 'auto',
        width: 600,
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
        {title}
      </Typography>
      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
        {content || 'N/A'}
      </Typography>
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={onClose}>
          Tutup
        </Button>
      </Box>
    </Box>
  </Modal>
);

// Komponen untuk teks dengan ikon untuk teks panjang
const IconText = ({ text, label, maxLength = MAX_TEXT_LENGTH }) => {
  const [textModalOpen, setTextModalOpen] = useState(false);

  if (!text || text.length <= maxLength) {
    return <span>{text || 'N/A'}</span>;
  }

  return (
    <>
      <Tooltip title={`Lihat ${label} Lengkap`}>
        <IconButton
          onClick={() => setTextModalOpen(true)}
          size="small"
          sx={{ color: 'primary.main' }}
        >
          <VisibilityIcon />
        </IconButton>
      </Tooltip>
      <TextModal
        open={textModalOpen}
        onClose={() => setTextModalOpen(false)}
        title={label}
        content={text}
      />
    </>
  );
};

const GradeModalExam = ({
  open,
  onClose,
  student,
  exams,
  examAnswers,
  editGrades,
  onGradeChange,
  onSaveGrade,
  loading,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [saveAllLoading, setSaveAllLoading] = useState(false);
  const [filters, setFilters] = useState({
    matakuliah: '',
    ujian: '',
  });

  if (!student) return null;

  const studentAnswers = examAnswers.filter(
    (answer) => answer.mahasiswa?.nim === student.nim
  );

  // Mendapatkan daftar unik mata kuliah dan ujian untuk filter
  const matakuliahOptions = useMemo(() => {
    const matakuliahSet = new Set();
    exams.forEach((exam) => {
      const matakuliah = exam?.matakuliah?.nama || exam?.attributes?.matakuliah?.data?.attributes?.nama;
      if (matakuliah) matakuliahSet.add(matakuliah);
    });
    return Array.from(matakuliahSet).sort();
  }, [exams]);

  const ujianOptions = useMemo(() => {
    const ujianSet = new Set();
    exams.forEach((exam) => {
      if (exam?.judul) ujianSet.add(exam.judul);
    });
    return Array.from(ujianSet).sort();
  }, [exams]);

  // Filter jawaban berdasarkan mata kuliah dan ujian
  const filteredAnswers = useMemo(() => {
    return studentAnswers.filter((answer) => {
      const exam = exams.find(
        (e) => e.id === (answer.soal_ujian?.ujian?.id || answer.soal_ujian?.ujian?.data?.id)
      );
      const matakuliah = exam?.matakuliah?.nama || exam?.attributes?.matakuliah?.data?.attributes?.nama || 'N/A';
      const ujian = exam?.judul || 'N/A';

      const matchesMatakuliah = !filters.matakuliah || matakuliah === filters.matakuliah;
      const matchesUjian = !filters.ujian || ujian === filters.ujian;

      return matchesMatakuliah && matchesUjian;
    });
  }, [studentAnswers, exams, filters]);

  // Fungsi untuk menyimpan semua nilai yang diedit
  const handleSaveAll = async () => {
    setSaveAllLoading(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const answer of filteredAnswers) {
        const key = `exam_${answer.id}`;
        const grade = editGrades[key];
        if (grade !== undefined && grade !== '' && !isNaN(grade) && grade >= 0 && grade <= 100) {
          try {
            await onSaveGrade(answer.documentId, answer.id);
            successCount++;
          } catch (err) {
            errorCount++;
            console.error(`Failed to save grade for answer ${answer.id}:`, err);
          }
        }
      }
      if (successCount > 0) {
        enqueueSnackbar(`${successCount} nilai berhasil disimpan`, { variant: 'success' });
      }
      if (errorCount > 0) {
        enqueueSnackbar(`${errorCount} nilai gagal disimpan`, { variant: 'error' });
      }
    } catch (err) {
      enqueueSnackbar('Terjadi kesalahan saat menyimpan nilai', { variant: 'error' });
      console.error('Error saving all grades:', err);
    } finally {
      setSaveAllLoading(false);
    }
  };

  // Validasi input nilai
  const isGradeValid = (grade) => {
    if (grade === '' || grade === undefined) return true;
    const num = parseFloat(grade);
    return !isNaN(num) && num >= 0 && num <= 100;
  };

  // Handler untuk perubahan filter
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Handler untuk menyimpan nilai individual dengan notifikasi
  const handleSaveGrade = async (documentId, answerId) => {
    try {
      await onSaveGrade(documentId, answerId);
      enqueueSnackbar('Nilai berhasil disimpan', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar('Gagal menyimpan nilai', { variant: 'error' });
      console.error(`Failed to save grade for answer ${answerId}:`, err);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          maxWidth: '95%',
          maxHeight: '90vh',
          overflow: 'auto',
          width: 1000,
        }}
      >
        <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider', pb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#050D31' }}>
            Validasi Nilai Ujian
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {student.namaLengkap} (NIM: {student.nim})
          </Typography>
        </Box>

        {/* Filter */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel id="matakuliah-filter-label">Mata Kuliah</InputLabel>
            <Select
              labelId="matakuliah-filter-label"
              value={filters.matakuliah}
              label="Mata Kuliah"
              onChange={(e) => handleFilterChange('matakuliah', e.target.value)}
              renderValue={(selected) => selected || 'Semua Mata Kuliah'}
            >
              <MenuItem value="">Semua Mata Kuliah</MenuItem>
              {matakuliahOptions.map((matakuliah) => (
                <MenuItem key={matakuliah} value={matakuliah}>
                  {matakuliah}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel id="ujian-filter-label">Ujian</InputLabel>
            <Select
              labelId="ujian-filter-label"
              value={filters.ujian}
              label="Ujian"
              onChange={(e) => handleFilterChange('ujian', e.target.value)}
              renderValue={(selected) => selected || 'Semua Ujian'}
            >
              <MenuItem value="">Semua Ujian</MenuItem>
              {ujianOptions.map((ujian) => (
                <MenuItem key={ujian} value={ujian}>
                  {ujian}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {filteredAnswers.length === 0 ? (
          <Typography color="text.secondary" align="center">
            Belum ada jawaban ujian untuk filter ini.
          </Typography>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: '50vh' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        fontWeight: 'bold',
                        bgcolor: TABLE_HEADER_BG,
                        color: TABLE_HEADER_COLOR,
                        width: '15%',
                      }}
                    >
                      Mata Kuliah
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 'bold',
                        bgcolor: TABLE_HEADER_BG,
                        color: TABLE_HEADER_COLOR,
                        width: '15%',
                      }}
                    >
                      Ujian
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 'bold',
                        bgcolor: TABLE_HEADER_BG,
                        color: TABLE_HEADER_COLOR,
                        width: '25%',
                      }}
                    >
                      Pertanyaan
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 'bold',
                        bgcolor: TABLE_HEADER_BG,
                        color: TABLE_HEADER_COLOR,
                        width: '25%',
                      }}
                    >
                      Jawaban
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 'bold',
                        bgcolor: TABLE_HEADER_BG,
                        color: TABLE_HEADER_COLOR,
                        width: '10%',
                      }}
                    >
                      Bobot
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 'bold',
                        bgcolor: TABLE_HEADER_BG,
                        color: TABLE_HEADER_COLOR,
                        width: '10%',
                      }}
                    >
                      Nilai
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 'bold',
                        bgcolor: TABLE_HEADER_BG,
                        color: TABLE_HEADER_COLOR,
                        width: '15%',
                      }}
                    >
                      Aksi
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAnswers.map((answer) => {
                    console.log('Processing answer:', JSON.stringify(answer, null, 2));
                    const exam = exams.find(
                      (e) => e.id === (answer.soal_ujian?.ujian?.id || answer.soal_ujian?.ujian?.data?.id)
                    );
                    console.log('Found exam:', JSON.stringify(exam, null, 2));
                    const matakuliah =
                      exam?.matakuliah?.nama ||
                      exam?.attributes?.matakuliah?.data?.attributes?.nama ||
                      'N/A';
                    const gradeKey = `exam_${answer.id}`;
                    const gradeValue = editGrades[gradeKey] ?? answer.nilai ?? '';

                    return (
                      <TableRow key={answer.id} hover>
                        <TableCell sx={{ maxWidth: 150, overflowX: 'auto' }}>
                          {matakuliah}
                        </TableCell>
                        <TableCell sx={{ maxWidth: 150, overflowX: 'auto' }}>
                          {exam?.judul || 'N/A'}
                        </TableCell>
                        <TableCell sx={{ maxWidth: 200, overflowX: 'auto' }}>
                          <IconText
                            text={answer.soal_ujian?.pertanyaan}
                            label="Pertanyaan"
                          />
                        </TableCell>
                        <TableCell sx={{ maxWidth: 200, overflowX: 'auto' }}>
                          <IconText
                            text={answer.jawaban}
                            label="Jawaban"
                          />
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          {answer.soal_ujian?.bobot || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={gradeValue}
                            onChange={(e) => onGradeChange(answer.id, e.target.value)}
                            inputProps={{ min: 0, max: 100 }}
                            error={!isGradeValid(gradeValue)}
                            helperText={!isGradeValid(gradeValue) ? '0-100' : ''}
                            sx={{ width: 80 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={() => handleSaveGrade(answer.documentId, answer.id)}
                            disabled={
                              loading ||
                              editGrades[gradeKey] === undefined ||
                              !isGradeValid(gradeValue)
                            }
                            sx={{ color: '#ffffff' }} // Set text color to white
                          >
                            {loading ? <CircularProgress size={20} /> : 'Simpan'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', gap: 2 }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={onClose}
                disabled={loading || saveAllLoading}
              >
                Tutup
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveAll}
                disabled={
                  loading ||
                  saveAllLoading ||
                  !Object.keys(editGrades).some(
                    (key) => editGrades[key] !== undefined && isGradeValid(editGrades[key])
                  )
                }
                sx={{ color: '#ffffff' }} 
              >
                {saveAllLoading ? <CircularProgress size={20} /> : 'Simpan Semua'}
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Modal>
  );
};

export default GradeModalExam;