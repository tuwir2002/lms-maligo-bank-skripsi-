import React from 'react';
import { Box, Typography, Paper, TextField, Autocomplete, IconButton, Avatar } from '@mui/material';
import { styled } from '@mui/material/styles';
import SchoolIcon from '@mui/icons-material/School';
import ClearIcon from '@mui/icons-material/Clear';

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

const StudentInfoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1),
  backgroundColor: '#FAFAFA',
  border: `1px solid ${theme.palette.grey[300]}`,
  marginBottom: theme.spacing(3),
}));

const FilterContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  flexWrap: 'wrap',
}));

const FilterSection = ({ mahasiswaData, selectedMahasiswa, setSelectedMahasiswa }) => {
  const handleClearFilter = () => {
    setSelectedMahasiswa(null);
  };

  return (
    <StyledPaper sx={{ mb: 3 }}>
      <SectionHeader>
        <SchoolIcon sx={{ color: '#2196F3' }} />
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#050D31' }}>
          Filter Mahasiswa
        </Typography>
      </SectionHeader>
      <FilterContainer>
        <Autocomplete
          options={mahasiswaData}
          getOptionLabel={(option) => `${option.namaLengkap} (${option.nim})`}
          value={selectedMahasiswa}
          onChange={(event, newValue) => setSelectedMahasiswa(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Cari Mahasiswa"
              variant="outlined"
              sx={{ minWidth: { xs: '100%', sm: 400 }, bgcolor: '#FFFFFF' }}
            />
          )}
          renderOption={(props, option) => {
            const { key, ...otherProps } = props; // Extract key and spread other props
            return (
              <li key={key} {...otherProps}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}>
                  <Avatar src={option.imageUrl} alt={option.namaLengkap} sx={{ width: 36, height: 36 }} />
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 500, color: '#050D31' }}>
                      {option.namaLengkap}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666666' }}>
                      {option.nim}
                    </Typography>
                  </Box>
                </Box>
              </li>
            );
          }}
        />
        {selectedMahasiswa && (
          <IconButton
            onClick={handleClearFilter}
            sx={{
              bgcolor: '#FFEBEE',
              '&:hover': { bgcolor: '#FFCDD2' },
            }}
          >
            <ClearIcon sx={{ color: '#D32F2F' }} />
          </IconButton>
        )}
      </FilterContainer>
      {selectedMahasiswa && (
        <StudentInfoContainer>
          <Avatar
            src={selectedMahasiswa.imageUrl}
            alt={selectedMahasiswa.namaLengkap}
            sx={{ width: 64, height: 64 }}
          />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#050D31' }}>
              {selectedMahasiswa.namaLengkap}
            </Typography>
            <Typography variant="body2" sx={{ color: '#666666', mb: 0.5 }}>
              NIM: {selectedMahasiswa.nim}
            </Typography>
            <Typography variant="body2" sx={{ color: '#666666', mb: 0.5 }}>
              Semester: {selectedMahasiswa.semester}
            </Typography>
            <Typography variant="body2" sx={{ color: '#666666' }}>
              Program Studi: {selectedMahasiswa.program_studi?.nama}
            </Typography>
          </Box>
        </StudentInfoContainer>
      )}
    </StyledPaper>
  );
};

export default FilterSection;