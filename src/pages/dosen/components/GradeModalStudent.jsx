import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  CircularProgress,
  Paper,
  Dialog as FullTextDialog,
  DialogContent as FullTextDialogContent,
  DialogTitle as FullTextDialogTitle,
  InputAdornment,
  IconButton,
  Link,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import SearchIcon from '@mui/icons-material/Search';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { debounce } from 'lodash';

// Utility  untuk memotong teks pada batas kata
const truncateText = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text;
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > 0 && lastSpace < maxLength - 10) {
    return truncated.substring(0, lastSpace) + '...';
  }
  return truncated + '...';
};

// Utility  untuk mengurai teks dan merender URL sebagai tautan yang dapat diklik
const renderTextWithLinks = (text) => {
  if (!text) return 'N/A';
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <Link
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ color: 'primary.main', textDecoration: 'underline' }}
        >
          {part}
        </Link>
      );
    }
    return part;
  });
};

const AnswerRow = ({ answer, index, editGrades, onGradeChange, onSaveGrade, loading, quizzes, onClose }) => {
  const soalKuis = answer.soal_kui;
  const quiz = soalKuis?.kuis ? quizzes.find((q) => q.id === soalKuis.kuis.id) : null;
  const [fullTextOpen, setFullTextOpen] = useState(null); // null, 'question', or 'answer'
  const { enqueueSnackbar } = useSnackbar();

  const handleOpenFullText = (type) => setFullTextOpen(type);
  const handleCloseFullText = () => setFullTextOpen(null);

  // Handle save grade with notification and auto-close
  const handleSaveGrade = async (documentId, answerId) => {
    try {
      await onSaveGrade(documentId, answerId);
      enqueueSnackbar('Nilai berhasil disimpan', { variant: 'success' });
      onClose(); // Auto-close modal on success
    } catch (error) {
      enqueueSnackbar('Gagal menyimpan nilai', { variant: 'error' });
    }
  };

  // Determine grade status for styling
  const isNewGrade = answer.nilai == null;
  const isEditedGrade = editGrades[answer.id] != null && editGrades[answer.id] !== answer.nilai;
  const isValidatedGrade = answer.nilai != null && !isEditedGrade;

  const gradeCellSx = {
    bgcolor: isNewGrade ? 'info.light' : isEditedGrade ? 'warning.light' : isValidatedGrade ? 'success.light' : 'inherit',
  };

  return (
    <>
      <TableRow sx={{ '&:hover': { bgcolor: 'action.hover' } }} key={`${answer.id}-${index}`}>
        <TableCell sx={{ color: 'text.primary' }}>
          {renderTextWithLinks(truncateText(soalKuis?.pertanyaan, 100))}
          {soalKuis?.pertanyaan?.length > 100 && (
            <IconButton size="small" onClick={() => handleOpenFullText('question')} sx={{ ml: 1 }}>
              <MoreHorizIcon />
            </IconButton>
          )}
        </TableCell>
        <TableCell sx={{ color: 'text.primary' }}>
          {soalKuis?.jenis === 'multiple_choice' ? 'Pilihan Ganda' : soalKuis?.jenis === 'esai' ? 'Esai' : 'Tugas'}
        </TableCell>
        <TableCell sx={{ color: 'text.primary' }}>
          {renderTextWithLinks(truncateText(answer.jawaban, 100))}
          {answer.jawaban?.length > 100 && (
            <IconButton size="small" onClick={() => handleOpenFullText('answer')} sx={{ ml: 1 }}>
              <MoreHorizIcon />
            </IconButton>
          )}
        </TableCell>
        <TableCell sx={{ color: 'text.primary' }}>{new Date(answer.createdAt).toLocaleDateString()}</TableCell>
        <TableCell sx={{ ...gradeCellSx, color: 'text.primary' }}>
          <TextField
            size="small"
            type="number"
            value={editGrades[answer.id] ?? answer.nilai ?? ''}
            onChange={(e) => onGradeChange(answer.id, e.target.value)}
            inputProps={{ min: 0, max: 100, step: 1 }}
            sx={{ width: 80 }}
            disabled={loading}
          />
        </TableCell>
        <TableCell>
          <Button
            variant="contained"
            color="secondary"
            size="small"
            onClick={() => handleSaveGrade(answer.documentId, answer.id)}
            disabled={loading || editGrades[answer.id] === undefined}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Simpan
          </Button>
        </TableCell>
      </TableRow>

      {/* Full Text Dialog for Question/Answer */}
      <FullTextDialog open={!!fullTextOpen} onClose={handleCloseFullText} maxWidth="sm" fullWidth>
        <FullTextDialogTitle sx={{ bgcolor: 'blueGrey.100', color: 'text.primary' }}>
          {fullTextOpen === 'question' ? 'Pertanyaan' : 'Jawaban'}
        </FullTextDialogTitle>
        <FullTextDialogContent sx={{ bgcolor: 'grey.100', color: 'text.primary' }}>
          <Typography variant="body2">
            {fullTextOpen === 'question' ? renderTextWithLinks(soalKuis?.pertanyaan) : renderTextWithLinks(answer.jawaban)}
          </Typography>
        </FullTextDialogContent>
      </FullTextDialog>
    </>
  );
};

const GradeModalStudent = ({ open, onClose, student, quizzes, meetings, editGrades, onGradeChange, onSaveGrade, loading }) => {
  const [filters, setFilters] = useState({
    searchAnswer: '',
    sortBy: 'date',
  });
  const [modalLoading, setModalLoading] = useState(false);

  // Simulate loading for smooth transition
  React.useEffect(() => {
    if (open) {
      setModalLoading(true);
      const timer = setTimeout(() => setModalLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Debounced search handler
  const debouncedSearch = debounce((value) => {
    setFilters((prev) => ({ ...prev, searchAnswer: value }));
  }, 300);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      searchAnswer: '',
      sortBy: 'date',
    });
  };

  // Modularized filtering logic
  const filterAnswers = (answers, filters, quizzes) => {
    return answers
      .filter((answer) => {
        if (!answer?.soal_kui?.kuis) {
          console.warn('Invalid answer structure:', answer);
          return false;
        }
        const quiz = quizzes.find((q) => q.id === answer.soal_kui.kuis.id);
        if (!quiz) {
          console.warn('Invalid quiz:', quiz);
          return false;
        }

        // Search filter (case-insensitive)
        const matchesSearch =
          filters.searchAnswer === '' ||
          answer.soal_kui?.pertanyaan?.toLowerCase().includes(filters.searchAnswer.toLowerCase()) ||
          answer.jawaban?.toLowerCase().includes(filters.searchAnswer.toLowerCase());

        return matchesSearch;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'type') {
          return (a.soal_kui?.jenis || '').localeCompare(b.soal_kui?.jenis || '');
        }
        return new Date(b.createdAt) - new Date(a.createdAt); // Sort by date (newest first)
      });
  };

  // Filtered answers
  const modalFilteredAnswers = useMemo(() => {
    if (!student || !student.answers || !Array.isArray(student.answers)) {
      console.warn('Invalid student or answers:', student);
      return [];
    }

    // Deduplicate answers by id
    const uniqueAnswers = Array.from(
      new Map(student.answers.map((answer) => [answer.id, answer])).values()
    );

    return filterAnswers(uniqueAnswers, filters, quizzes);
  }, [student, filters, quizzes]);

  if (!student) {
    return null; // Prevent rendering if student is null
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          bgcolor: 'grey.100', // Light background
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: 'blueGrey.700', // Dark background
          color: 'white', // White text for dark background
          position: 'sticky',
          top: 0,
          zIndex: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 1.5,
        }}
      >
        <Typography component="span" variant="h6">
          Detail Jawaban - {student?.namaLengkap || 'N/A'} ({student?.nim || 'N/A'})
        </Typography>
        <Button
          color="inherit"
          onClick={onClose}
          sx={{ textTransform: 'none', fontWeight: 600, color: 'white' }} // White text
        >
          Tutup
        </Button>
      </DialogTitle>
      <DialogContent sx={{ p: 0, bgcolor: 'grey.100', color: 'text.primary' }}>
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 1,
            bgcolor: 'blueGrey.50', // Light background
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            color: 'text.primary', // Dark text for light background
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="modal-sort-label">Urutkan</InputLabel>
              <Select
                labelId="modal-sort-label"
                value={filters.sortBy}
                label="Urutkan"
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                <MenuItem value="date">Tanggal (Terbaru)</MenuItem>
                <MenuItem value="type">Tipe Soal</MenuItem>
              </Select>
            </FormControl>
            <TextField
              size="small"
              placeholder="Cari Pertanyaan atau Jawaban"
              defaultValue={filters.searchAnswer}
              onChange={(e) => debouncedSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 250 }}
            />
            <Button
              variant="outlined"
              onClick={handleResetFilters}
              sx={{ height: 'fit-content', alignSelf: 'center' }}
            >
              Reset Filters
            </Button>
          </Box>
        </Box>
        <Box sx={{ height: '60vh', p: 2 }}>
          {modalLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : modalFilteredAnswers.length === 0 ? (
            <Typography align="center" color="text.primary" sx={{ mt: 4 }}>
              Tidak ada jawaban untuk ditampilkan. Coba sesuaikan filter.
            </Typography>
          ) : (
            <TableContainer component={Paper} sx={{ maxHeight: '100%', bgcolor: 'white' }}>
              <Table stickyHeader>
              <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, bgcolor: 'blueGrey.100', color: 'text.primary' }}>Pertanyaan</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: 'blueGrey.100', color: 'text.primary' }}>Tipe Soal</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: 'blueGrey.100', color: 'text.primary' }}>Jawaban</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: 'blueGrey.100', color: 'text.primary' }}>Tanggal</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: 'blueGrey.100', color: 'text.primary' }}>Nilai</TableCell>
                    <TableCell sx={{ fontWeight: 600, bgcolor: 'blueGrey.100', color: 'text.primary' }}>Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {modalFilteredAnswers.map((answer, index) => (
                    <AnswerRow
                      key={`${answer.id}-${index}`}
                      answer={answer}
                      index={index}
                      editGrades={editGrades}
                      onGradeChange={onGradeChange}
                      onSaveGrade={onSaveGrade}
                      loading={loading}
                      quizzes={quizzes}
                      onClose={onClose} // Pass onClose to AnswerRow
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default GradeModalStudent;