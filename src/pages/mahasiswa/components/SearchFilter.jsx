import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Typography,
  Paper,
  Divider,
} from '@mui/material';
import { debounce } from 'lodash';
import { fetchFilterOptions } from '../service/skripsiService';

const SearchFilter = ({ filters, onFilterChange }) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [filterOptions, setFilterOptions] = useState({
    programs: [],
    years: [],
    categories: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch filter options on mount
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        setLoading(true);
        const options = await fetchFilterOptions();
        setFilterOptions(options);
        setError(null);
      } catch (err) {
        setError('Gagal memuat opsi filter: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    loadFilterOptions();
  }, []);

  // Debounce filter changes
  const debouncedOnChange = debounce((newFilters) => {
    onFilterChange(newFilters);
  }, 500);

  // Sync local filters with prop changes
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Handle filter input changes
  const handleChange = (field) => (event) => {
    const value = event.target.value;
    const newFilters = { ...localFilters, [field]: value };
    setLocalFilters(newFilters);
    debouncedOnChange(newFilters);
  };

  // Handle filter reset
  const handleReset = () => {
    const resetFilters = {
      keyword: '',
      program: '',
      year: '',
      category: '',
      sortBy: 'newest',
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <Paper
      elevation={4}
      sx={{
        mb: 4,
        p: 3,
        bgcolor: '#050D31',
        borderRadius: 2,
        border: '2px solid #efbf04',
        boxShadow: '0 4px 20px rgba(239, 191, 4, 0.2)',
        '&:hover': {
          boxShadow: '0 6px 30px rgba(239, 191, 4, 0.3)',
        },
      }}
    >
      <Typography
        variant="h6"
        sx={{
          color: '#efbf04',
          mb: 2,
          fontWeight: 600,
          fontFamily: '"Orbitron", sans-serif',
        }}
      >
        Filter Pencarian
      </Typography>
      <Divider sx={{ bgcolor: '#efbf04', mb: 3 }} />

      {error && (
        <Typography color="error" sx={{ mb: 2, textAlign: 'center', fontSize: '0.9rem' }}>
          {error}
        </Typography>
      )}

      <Grid container spacing={2} alignItems="center">
        {/* Title Search */}
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Cari Judul"
            value={localFilters.keyword}
            onChange={handleChange('keyword')}
            fullWidth
            disabled={loading}
            variant="outlined"
            sx={{
              '& .MuiInputBase-input': { color: '#FFFFFF', fontSize: '0.95rem' },
              '& .MuiInputLabel-root': {
                color: '#FFFFFF',
                fontSize: '0.95rem',
                '&.Mui-focused': { color: '#efbf04' },
              },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#efbf04' },
                '&:hover fieldset': { borderColor: '#d4a503' },
                '&.Mui-focused fieldset': { borderColor: '#efbf04' },
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 1,
              },
            }}
          />
        </Grid>

        {/* Program Studi */}
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth disabled={loading} variant="outlined">
            <InputLabel
              sx={{
                color: '#FFFFFF',
                fontSize: '0.95rem',
                '&.Mui-focused': { color: '#efbf04' },
              }}
            >
              Program Studi
            </InputLabel>
            <Select
              value={localFilters.program}
              onChange={handleChange('program')}
              sx={{
                color: '#FFFFFF',
                fontSize: '0.95rem',
                '& .MuiSvgIcon-root': { color: '#FFFFFF' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#efbf04' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#d4a503' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#efbf04' },
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 1,
                '& .MuiSelect-select': {
                  whiteSpace: 'normal',
                  paddingRight: '32px',
                },
              }}
            >
              <MenuItem value="" sx={{ fontSize: '0.95rem' }}>
                Semua
              </MenuItem>
              {filterOptions.programs.map((program) => (
                <MenuItem
                  key={program}
                  value={program}
                  sx={{ fontSize: '0.95rem', whiteSpace: 'normal', py: 1 }}
                >
                  {program}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Tahun */}
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth disabled={loading} variant="outlined">
            <InputLabel
              sx={{
                color: '#FFFFFF',
                fontSize: '0.95rem',
                '&.Mui-focused': { color: '#efbf04' },
              }}
            >
              Tahun
            </InputLabel>
            <Select
              value={localFilters.year}
              onChange={handleChange('year')}
              sx={{
                color: '#FFFFFF',
                fontSize: '0.95rem',
                '& .MuiSvgIcon-root': { color: '#FFFFFF' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#efbf04' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#d4a503' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#efbf04' },
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 1,
                '& .MuiSelect-select': {
                  whiteSpace: 'normal',
                  paddingRight: '32px',
                },
              }}
            >
              <MenuItem value="" sx={{ fontSize: '0.95rem' }}>
                Semua
              </MenuItem>
              {filterOptions.years.map((year) => (
                <MenuItem
                  key={year}
                  value={year}
                  sx={{ fontSize: '0.95rem', whiteSpace: 'normal', py: 1 }}
                >
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Kategori */}
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth disabled={loading} variant="outlined">
            <InputLabel
              sx={{
                color: '#FFFFFF',
                fontSize: '0.95rem',
                '&.Mui-focused': { color: '#efbf04' },
              }}
            >
              Kategori
            </InputLabel>
            <Select
              value={localFilters.category}
              onChange={handleChange('category')}
              sx={{
                color: '#FFFFFF',
                fontSize: '0.95rem',
                '& .MuiSvgIcon-root': { color: '#FFFFFF' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#efbf04' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#d4a503' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#efbf04' },
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 1,
                '& .MuiSelect-select': {
                  whiteSpace: 'normal',
                  paddingRight: '32px',
                },
              }}
            >
              <MenuItem value="" sx={{ fontSize: '0.95rem' }}>
                Semua
              </MenuItem>
              {filterOptions.categories.map((category) => (
                <MenuItem
                  key={category}
                  value={category}
                  sx={{ fontSize: '0.95rem', whiteSpace: 'normal', py: 1 }}
                >
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Sort By */}
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth disabled={loading} variant="outlined">
            <InputLabel
              sx={{
                color: '#FFFFFF',
                fontSize: '0.95rem',
                '&.Mui-focused': { color: '#efbf04' },
              }}
            >
              Urutkan
            </InputLabel>
            <Select
              value={localFilters.sortBy}
              onChange={handleChange('sortBy')}
              sx={{
                color: '#FFFFFF',
                fontSize: '0.95rem',
                '& .MuiSvgIcon-root': { color: '#FFFFFF' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#efbf04' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#d4a503' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#efbf04' },
                bgcolor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 1,
                '& .MuiSelect-select': {
                  whiteSpace: 'normal',
                  paddingRight: '32px',
                },
              }}
            >
              <MenuItem value="newest" sx={{ fontSize: '0.95rem' }}>
                Terbaru
              </MenuItem>
              <MenuItem value="year" sx={{ fontSize: '0.95rem' }}>
                Tahun
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Reset Button */}
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            variant="contained"
            onClick={handleReset}
            disabled={loading}
            sx={{
              bgcolor: '#efbf04',
              color: '#000000',
              '&:hover': {
                bgcolor: '#d4a503',
              },
              '&:disabled': {
                bgcolor: '#efbf04',
                color: '#000000',
                opacity: 0.5,
              },
              px: 4,
              py: 1,
              fontWeight: 600,
              fontSize: '0.95rem',
              borderRadius: 1,
              textTransform: 'none',
            }}
          >
            Reset Filter
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default SearchFilter;