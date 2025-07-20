import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Pagination,
  Chip,
} from '@mui/material';
import { Download } from '@mui/icons-material';
import SearchFilter from './SearchFilter';
import { fetchAllTheses, downloadThesis } from '../utils/skripsiService';

const SkripsiSearch = () => {
  const [theses, setTheses] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    keyword: '',
    program: '',
    year: '',
    category: '',
    sortBy: 'newest',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const pageSize = 10;

  const fetchTheses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchAllTheses(currentPage, pageSize, filters);
      setTheses(response.data);
      setTotalPages(response.totalPages);
      setError(null);
    } catch (err) {
      setError(err.message || 'Gagal mengambil data skripsi');
      setTheses([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    fetchTheses();
  }, [fetchTheses]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const handleDownload = async (thesisId) => {
    setLoading(true);
    try {
      await downloadThesis(thesisId);
      setSuccess('Skripsi berhasil diunduh');
      setError(null);
    } catch (err) {
      setError(err.message || 'Gagal mengunduh skripsi');
      setSuccess(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ color: '#050D31', fontWeight: 700, fontFamily: '"Inter", sans-serif' }}
      >
        Pencarian Skripsi
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* Filter Section */}
      <SearchFilter filters={filters} onFilterChange={handleFilterChange} />

      {/* Theses Table */}
      <Paper
        sx={{
          p: 3,
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid #e0e0e0',
        }}
      >
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            color: '#ffffff',
            fontWeight: 600,
            fontFamily: '"Inter", sans-serif',
            bgcolor: '#1a237e',
            p: 2,
            borderRadius: 1,
          }}
        >
          Daftar Skripsi
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#1a237e' }}>
                    <TableCell sx={{ color: '#ffffff', fontWeight: 600, fontFamily: '"Inter", sans-serif' }}>
                      Judul
                    </TableCell>
                    <TableCell sx={{ color: '#ffffff', fontWeight: 600, fontFamily: '"Inter", sans-serif' }}>
                      Penulis
                    </TableCell>
                    <TableCell sx={{ color: '#ffffff', fontWeight: 600, fontFamily: '"Inter", sans-serif' }}>
                      Program Studi
                    </TableCell>
                    <TableCell sx={{ color: '#ffffff', fontWeight: 600, fontFamily: '"Inter", sans-serif' }}>
                      Tahun
                    </TableCell>
                    <TableCell sx={{ color: '#ffffff', fontWeight: 600, fontFamily: '"Inter", sans-serif' }}>
                      Kategori
                    </TableCell>
                    <TableCell sx={{ color: '#ffffff', fontWeight: 600, fontFamily: '"Inter", sans-serif' }}>
                      Aksi
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {theses.length > 0 ? (
                    theses.map((thesis) => (
                      <TableRow
                        key={thesis.documentId}
                        sx={{
                          '&:hover': { bgcolor: '#7393B3' },
                          transition: 'background-color 0.2s',
                          bgcolor: '#2e3b55',
                        }}
                      >
                        <TableCell sx={{ color: '#ffffff', fontFamily: '"Inter", sans-serif', '&:hover': { color: '#1a237e' } }}>
                          {thesis.title}
                        </TableCell>
                        <TableCell sx={{ color: '#ffffff', fontFamily: '"Inter", sans-serif', '&:hover': { color: '#1a237e' } }}>
                          {thesis.author}
                        </TableCell>
                        <TableCell sx={{ color: '#ffffff', fontFamily: '"Inter", sans-serif', '&:hover': { color: '#1a237e' } }}>
                          {thesis.program}
                        </TableCell>
                        <TableCell sx={{ color: '#ffffff', fontFamily: '"Inter", sans-serif', '&:hover': { color: '#1a237e' } }}>
                          {thesis.year}
                        </TableCell>
                        <TableCell sx={{ color: '#ffffff', fontFamily: '"Inter", sans-serif', '&:hover': { color: '#1a237e' } }}>
                          {thesis.category}
                        </TableCell>
                        <TableCell>
                          {thesis.fileUrl && (
                            <Button
                              variant="contained"
                              startIcon={<Download />}
                              onClick={() => handleDownload(thesis.id)}
                              disabled={loading}
                              sx={{
                                bgcolor: '#1976d2',
                                color: '#ffffff',
                                textTransform: 'none',
                                fontWeight: 600,
                                borderRadius: 2,
                                '&:hover': { bgcolor: '#1565c0' },
                                '&:disabled': { bgcolor: '#b0bec5' },
                              }}
                            >
                              Unduh
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        sx={{
                          textAlign: 'center',
                          color: '#ffffff',
                          py: 4,
                          fontFamily: '"Inter", sans-serif',
                          bgcolor: '#2e3b55',
                        }}
                      >
                        Tidak ada skripsi yang ditemukan
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      color: '#ffffff',
                      '&.Mui-selected': {
                        bgcolor: '#1976d2',
                        color: '#ffffff',
                      },
                      '&:hover': {
                        bgcolor: '#1565c0',
                        color: '#ffffff',
                      },
                    },
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
};

export default SkripsiSearch;