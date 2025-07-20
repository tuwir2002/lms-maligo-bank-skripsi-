import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  fetchAllTheses,
  searchTheses,
  downloadThesis
} from '../service/skripsiService';
import SearchFilter from '../components/SearchFilter';
import ThesisList from '../components/ThesisList';
import ThesisDetail from '../components/ThesisDetail';
import ThesisSubmissionModal from '../components/ThesisSubmissionModal';
import ThesisSubmissionList from '../components/ThesisSubmissionList';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../../../routes/LoadingScreen';
import ErrorAlert from '../components/ErrorAlert';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  Card, 
  CardContent, 
  Tabs,
  Tab,
  keyframes,
  Paper
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../styles/theme';

// Animasi keyframes untuk efek neon glow
const neonGlow = keyframes`
  0% { box-shadow: 0 0 5px #efbf04, 0 0 10px #efbf04, 0 0 15px #efbf04; }
  50% { box-shadow: 0 0 10px #efbf04, 0 0 20px #efbf04, 0 0 30px #efbf04; }
  100% { box-shadow: 0 0 5px #efbf04, 0 0 10px #efbf04, 0 0 15px #efbf04; }
`;

const BankSkripsi = () => {
  const [theses, setTheses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedThesis, setSelectedThesis] = useState(null);
  const [filters, setFilters] = useState({
    keyword: '',
    program: '',
    year: '',
    category: '',
    sortBy: 'newest'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  const navigate = useNavigate();

  // Fetch theses on component mount and when filters change
  useEffect(() => {
    const loadTheses = async () => {
      try {
        setLoading(true);
        const response = await fetchAllTheses(
          pagination.currentPage,
          pagination.itemsPerPage,
          filters
        );
        setTheses(response.data);
        setPagination({
          ...pagination,
          totalPages: response.totalPages,
          totalItems: response.totalItems
        });
        setError(null);
      } catch (err) {
        console.error('Error fetching theses:', err);
        setError(`Gagal memuat data skripsi: ${err.message}. Silakan coba lagi atau hubungi admin.`);
        setTheses([]);
      } finally {
        setLoading(false);
      }
    };

    if (tabValue === 1) {
      loadTheses();
    }
  }, [pagination.currentPage, pagination.itemsPerPage, filters, tabValue]);

  // Handle search and filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination({ ...pagination, currentPage: 1 });
  };

  // Handle thesis selection
  const handleThesisSelect = (thesis) => {
    setSelectedThesis(thesis);
  };

  // Handle thesis download
  const handleDownload = async (thesisId) => {
    try {
      setLoading(true);
      await downloadThesis(thesisId);
      setError(null);
    } catch (err) {
      console.error('Error downloading thesis:', err);
      setError(`Gagal mengunduh skripsi: ${err.message}. Silakan coba lagi atau periksa autentikasi Anda.`);
    } finally {
      setLoading(false);
    }
  };

  // Handle pagination change
  const handlePageChange = (pageNumber) => {
    setPagination({ ...pagination, currentPage: pageNumber });
  };

  // Handle sidebar toggle
  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Handle modal toggle
  const handleModalToggle = () => {
    setModalOpen(!modalOpen);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0a0e2b' }}>
        {/* Sidebar */}
        <Sidebar open={sidebarOpen} handleDrawerToggle={handleDrawerToggle} role="mahasiswa" />

        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 4,
            mt: 8,
            ml: { xs: 0, sm: sidebarOpen ? '260px' : '0px' },
            transition: 'margin-left 0.3s ease-in-out',
            width: { xs: '100%', sm: `calc(100% - ${sidebarOpen ? '260px' : '70px'})` },
          }}
        >
          <Header title="Bank Skripsi" />
          <Container maxWidth="lg" sx={{ mt: 4 }}>
            {/* Header Section */}
            <Paper
              elevation={3}
              sx={{
                borderRadius: 2,
                bgcolor: '#050D31',
                color: '#FFFFFF',
                animation: `${neonGlow} 2s infinite`,
                border: '1px solid #efbf04',
                mb: 4,
                p: 3,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography
                    variant="h3"
                    sx={{ fontWeight: 700, fontFamily: '"Orbitron", sans-serif', mb: 1 }}
                  >
                    BANK SKRIPSI
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.7 }}>
                    Jelajahi Koleksi Skripsi Mahasiswa Teknologi Rekayasa Komputer
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* Tabs */}
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              sx={{
                mb: 4,
                bgcolor: '#050D31',
                borderRadius: 2,
                border: '1px solid #efbf04',
                '.MuiTab-root': {
                  color: '#FFFFFF',
                  fontWeight: 500,
                  textTransform: 'none',
                  fontSize: '1rem',
                },
                '.Mui-selected': {
                  color: '#efbf04 !important',
                },
                '.MuiTabs-indicator': {
                  backgroundColor: '#efbf04',
                },
              }}
            >
              <Tab label="Pengajuan Proposal" />
              <Tab label="Pencarian Skripsi" />
            </Tabs>

            {/* Thesis Submission Modal */}
            <ThesisSubmissionModal open={modalOpen} onClose={handleModalToggle} />

            {/* Tab Content */}
            {tabValue === 0 && (
              <Box>
                <ThesisSubmissionList />
              </Box>
            )}

            {tabValue === 1 && (
              <>
                {/* Search Filter */}
                <SearchFilter 
                  filters={filters} 
                  onFilterChange={handleFilterChange} 
                />

                {/* Error Alert */}
                {error && <ErrorAlert message={error} />}

                {/* Loading Spinner or Content */}
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <LoadingSpinner />
                  </Box>
                ) : theses.length === 0 ? (
                  <Paper
                    elevation={3}
                    sx={{
                      borderRadius: 2,
                      bgcolor: '#050D31',
                      color: '#FFFFFF',
                      border: '1px solid #efbf04',
                      textAlign: 'center',
                      p: 4,
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{ color: '#FFFFFF', fontFamily: '"Orbitron", sans-serif' }}
                    >
                      Tidak ada skripsi ditemukan
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: '#FFFFFF', opacity: 0.7, mt: 1 }}
                    >
                      Coba sesuaikan filter pencarian Anda
                    </Typography>
                  </Paper>
                ) : (
                  <Grid container spacing={3}>
                    {/* Thesis List */}
                    <Grid item xs={12} lg={8}>
                      <Paper
                        elevation={3}
                        sx={{
                          borderRadius: 2,
                          bgcolor: '#050D31',
                          color: '#FFFFFF',
                          border: '1px solid #efbf04',
                          transition: 'transform 0.3s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                          },
                        }}
                      >
                        <CardContent>
                          <Typography
                            variant="h4"
                            sx={{ mb: 3, fontFamily: '"Orbitron", sans-serif', color: '#FFFFFF' }}
                          >
                            Koleksi Skripsi
                          </Typography>
                          <ThesisList 
                            theses={theses}
                            onThesisSelect={handleThesisSelect}
                            selectedThesisId={selectedThesis?.id}
                          />
                          <Pagination 
                            currentPage={pagination.currentPage}
                            totalPages={pagination.totalPages}
                            onPageChange={handlePageChange}
                          />
                        </CardContent>
                      </Paper>
                    </Grid>
                    
                    {/* Thesis Detail */}
                    <Grid item xs={12} lg={4}>
                      <Paper
                        elevation={3}
                        sx={{
                          borderRadius: 2,
                          bgcolor: '#050D31',
                          color: '#FFFFFF',
                          border: '1px solid #efbf04',
                          height: '100%',
                        }}
                      >
                        <CardContent>
                          {selectedThesis ? (
                            <ThesisDetail 
                              thesis={selectedThesis} 
                              onDownload={handleDownload} 
                            />
                          ) : (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                              <Typography
                                variant="body1"
                                sx={{ color: '#FFFFFF', opacity: 0.7 }}
                              >
                                Pilih skripsi untuk melihat detail dan preview
                              </Typography>
                            </Box>
                          )}
                        </CardContent>
                      </Paper>
                    </Grid>
                  </Grid>
                )}
              </>
            )}
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default BankSkripsi;