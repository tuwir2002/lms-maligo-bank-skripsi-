import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Container, Grid, Fade } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useSnackbar } from 'notistack';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import AddMatakuliahModal from '../components/AddMatakuliahModal';
import CourseAccordion from '../components/CourseAccordion';
import LoadingScreen from '../../../routes/LoadingScreen';
import { getMatakuliahList, getMaterisList, getKuisList } from '../utils/CourseService';

const CourseManagement = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [openMatakuliahModal, setOpenMatakuliahModal] = useState(false);
  const [matakuliahList, setMatakuliahList] = useState([]);
  const [selectedMatakuliah, setSelectedMatakuliah] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [matakuliahResponse, materisResponse, kuisResponse] = await Promise.all([
        getMatakuliahList(),
        getMaterisList(),
        getKuisList(),
      ]);

      const materis = materisResponse.data || [];
      const kuises = kuisResponse.data || [];
      const matakuliahs = matakuliahResponse.data || [];

      const updatedMatakuliahs = matakuliahs.map((matakuliah) => ({
        ...matakuliah,
        pertemuans: matakuliah.pertemuans.map((pertemuan) => ({
          ...pertemuan,
          materis: materis.filter((materi) => materi.pertemuan?.id === pertemuan.id) || [],
          kuises: kuises.filter((kuis) => kuis.pertemuan?.id === pertemuan.id) || [],
        })),
      }));

      setMatakuliahList(updatedMatakuliahs);
      setLoading(false);
    } catch (error) {
      enqueueSnackbar('Gagal mengambil data mata kuliah', { variant: 'error' });
      setLoading(false);
    }
  };

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f7f9fc', minHeight: '100vh' }}>
      <Header title="Manajemen Mata Kuliah" />
      <Sidebar open={sidebarOpen} handleDrawerToggle={handleDrawerToggle} role="dosen" />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 4 },
          mt: '64px',
          ml: sidebarOpen ? { xs: 0, md: '0px' } : 0,
          transition: 'margin-left 0.3s ease-in-out',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Container maxWidth="lg">
          {loading ? (
            <LoadingScreen />
          ) : (
            <Fade in={!loading} timeout={600}>
              <Box>
                <Grid container spacing={3} alignItems="center" sx={{ mb: 4 }}>
                  <Grid item xs={12} md={8}>
                    <Typography
                      variant="h4"
                      sx={{
                        color: '#050D31',
                        fontWeight: 700,
                        letterSpacing: '0.02em',
                        fontSize: { xs: '1.8rem', md: '2.2rem' },
                      }}
                    >
                      Manajemen Mata Kuliah
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: '#64748b',
                        mt: 1,
                        fontSize: '1rem',
                        maxWidth: '600px',
                      }}
                    >
                      Kelola mata kuliah, pertemuan, materi, dan kuis dengan antarmuka yang intuitif dan efisien.
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => setOpenMatakuliahModal(true)}
                      startIcon={<AddIcon />}
                      sx={{
                        bgcolor: '#050D31',
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 4,
                        py: 1.5,
                        borderRadius: 2,
                        boxShadow: '0 4px 12px rgba(5, 13, 49, 0.2)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: '#0A1A5C',
                          boxShadow: '0 6px 16px rgba(5, 13, 49, 0.3)',
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      Tambah Mata Kuliah
                    </Button>
                  </Grid>
                </Grid>
                <CourseAccordion
                  matakuliahList={matakuliahList}
                  setSelectedMatakuliah={setSelectedMatakuliah}
                  refreshMatakuliah={fetchData}
                />
                <AddMatakuliahModal
                  open={openMatakuliahModal}
                  onClose={() => setOpenMatakuliahModal(false)}
                  refreshMatakuliah={fetchData}
                />
              </Box>
            </Fade>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default CourseManagement;