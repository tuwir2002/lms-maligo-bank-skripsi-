import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Avatar,
  Grid,
  Paper,
  Button,
  CircularProgress,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Chip,
  Fade,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../styles/theme';
import ErrorBoundary from '../../../components/ErrorBoundary';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const API_URL = import.meta.env.VITE_API_URL;

const ProfilePage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser || !storedUser.username) {
          throw new Error('User not found in localStorage');
        }
        setUserData(storedUser);

        const username = storedUser.username;
        let endpoint = '';
        let isDosen = false;
        let matchingUser = null;

        const dosenResponse = await fetch(`${API_URL}/dosens?populate=*`);
        if (!dosenResponse.ok) throw new Error('Failed to fetch dosen data');
        const dosenData = await dosenResponse.json();

        const matchingDosen = dosenData.data.find(
          (dosen) => dosen.nip === username
        );
        if (matchingDosen) {
          endpoint = 'dosens';
          isDosen = true;
          matchingUser = matchingDosen;
        } else {
          const mahasiswaResponse = await fetch(`${API_URL}/mahasiswas?populate=*`);
          if (!mahasiswaResponse.ok) throw new Error('Failed to fetch mahasiswa data');
          const mahasiswaData = await mahasiswaResponse.json();

          const matchingMahasiswa = mahasiswaData.data.find(
            (mahasiswa) => mahasiswa.nim === username
          );
          if (matchingMahasiswa) {
            endpoint = 'mahasiswas';
            matchingUser = matchingMahasiswa;
          } else {
            throw new Error('User not found in dosen or mahasiswa data');
          }
        }

        const response = await fetch(
          `${API_URL}/${endpoint}?filters[documentId][$eq]=${matchingUser.documentId}&populate=*`
        );
        if (!response.ok) throw new Error(`Failed to fetch ${endpoint} profile`);
        const data = await response.json();
        setProfileData(data.data[0]);
        setEditForm({
          namaLengkap: data.data[0].namaLengkap,
          email: data.data[0].users_permissions_user?.email || '',
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleEditOpen = () => {
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async () => {
    try {
      const endpoint = profileData.nip ? 'dosens' : 'mahasiswas';
      const response = await fetch(`${API_URL}/${endpoint}/${profileData.documentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('jwt')}`,
        },
        body: JSON.stringify({
          namaLengkap: editForm.namaLengkap,
          users_permissions_user: {
            email: editForm.email,
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to update profile');
      const updatedData = await response.json();
      setProfileData(updatedData.data);
      handleEditClose();
    } catch (err) {
      setError('Failed to update profile: ' + err.message);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 20, bgcolor: '#f7f9fc' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', mt: 10, color: '#050D31', bgcolor: '#f7f9fc' }}>
        <Typography variant="h5" sx={{ color: '#050D31', fontWeight: 700 }}>
          Error: {error}
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => navigate('/login')}
          sx={{
            mt: 2,
            bgcolor: '#050D31',
            textTransform: 'none',
            fontWeight: 600,
            px: 4,
            py: 1.5,
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(5, 13, 49, 0.2)',
            '&:hover': {
              bgcolor: '#0A1A5C',
              boxShadow: '0 6px 16px rgba(5, 13, 49, 0.3)',
              transform: 'translateY(-2px)',
            },
          }}
        >
          Back to Login
        </Button>
      </Box>
    );
  }

  const isDosen = !!profileData?.nip;
  const role = isDosen ? 'dosen' : 'mahasiswa';

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f7f9fc', minHeight: '100vh' }}>
      <Sidebar
        open={sidebarOpen}
        handleDrawerToggle={handleDrawerToggle}
        role={role}
      />
      <ThemeProvider theme={theme}>
        <ErrorBoundary>
          <Header title="Profil" />
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
                        Profil Pengguna
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
                        Lihat dan kelola informasi profil Anda dengan mudah.
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleEditOpen}
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
                        Edit Profil
                      </Button>
                    </Grid>
                  </Grid>
                  <Paper
                    elevation={3}
                    sx={{
                      p: { xs: 2, md: 4 },
                      borderRadius: 2,
                      background: '#ffffff',
                      boxShadow: '0 4px 12px rgba(5, 13, 49, 0.1)',
                    }}
                  >
                    <Grid container spacing={4}>
                      <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
                        <Avatar
                          src={profileData?.imageUrl || 'https://via.placeholder.com/150'}
                          sx={{
                            width: 150,
                            height: 150,
                            mx: 'auto',
                            mb: 2,
                            border: '3px solid #050D31',
                          }}
                        />
                        <Typography
                          variant="h5"
                          sx={{ color: '#050D31', fontWeight: 600 }}
                        >
                          {profileData?.namaLengkap}
                        </Typography>
                        <Chip
                          label={isDosen ? 'Dosen' : 'Mahasiswa'}
                          color={isDosen ? 'primary' : 'secondary'}
                          sx={{ mt: 2, fontSize: '1rem' }}
                        />
                      </Grid>
                      <Grid item xs={12} md={8}>
                        <Typography
                          variant="h6"
                          sx={{ color: '#050D31', mb: 3, fontWeight: 700 }}
                        >
                          Detail Profil
                        </Typography>
                        <Divider sx={{ mb: 3, borderColor: '#e2e8f0' }} />
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Typography sx={{ color: '#64748b' }}>
                              <strong>{isDosen ? 'NIP' : 'NIM'}:</strong>{' '}
                              {isDosen ? profileData.nip : profileData.nim}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography sx={{ color: '#64748b' }}>
                              <strong>Email:</strong>{' '}
                              {profileData?.users_permissions_user?.email}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography sx={{ color: '#64748b' }}>
                              <strong>Program Studi:</strong>{' '}
                              {profileData?.program_studi?.nama || 'N/A'}
                            </Typography>
                          </Grid>
                          {isDosen ? (
                            <>
                              <Grid item xs={12} sm={6}>
                                <Typography sx={{ color: '#64748b' }}>
                                  <strong>NIDN:</strong> {profileData.nidn}
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography sx={{ color: '#64748b', mt: 2 }}>
                                  <strong>Mata Kuliah:</strong>
                                </Typography>
                                {profileData.matakuliahs?.length > 0 ? (
                                  profileData.matakuliahs.map((mk) => (
                                    <Chip
                                      key={mk.id}
                                      label={`${mk.nama} (${mk.kode})`}
                                      sx={{
                                        mr: 1,
                                        mt: 1,
                                        backgroundColor: '#e2e8f0',
                                        color: '#050D31',
                                      }}
                                    />
                                  ))
                                ) : (
                                  <Typography sx={{ color: '#64748b' }}>
                                    Tidak ada mata kuliah
                                  </Typography>
                                )}
                              </Grid>
                            </>
                          ) : (
                            <>
                              <Grid item xs={12} sm={6}>
                                <Typography sx={{ color: '#64748b' }}>
                                  <strong>Semester:</strong> {profileData.semester}
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography sx={{ color: '#64748b', mt: 2 }}>
                                  <strong>Status:</strong> {profileData.status_class}
                                </Typography>
                              </Grid>
                            </>
                          )}
                        </Grid>
                      </Grid>
                    </Grid>
                  </Paper>
                </Box>
              </Fade>
            </Container>
          </Box>

          <Dialog open={editOpen} onClose={handleEditClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ color: '#050D31', backgroundColor: '#ffffff' }}>
              Edit Profil
            </DialogTitle>
            <DialogContent sx={{ backgroundColor: '#ffffff' }}>
              <TextField
                fullWidth
                label="Nama Lengkap"
                name="namaLengkap"
                value={editForm.namaLengkap}
                onChange={handleEditChange}
                margin="normal"
                InputLabelProps={{ style: { color: '#64748b' } }}
                InputProps={{ style: { color: '#050D31' } }}
                sx={{
                  '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#e2e8f0' } },
                  '& .MuiOutlinedInput-root:hover fieldset': { borderColor: '#050D31' },
                }}
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={editForm.email}
                onChange={handleEditChange}
                margin="normal"
                InputLabelProps={{ style: { color: '#64748b' } }}
                InputProps={{ style: { color: '#050D31' } }}
                sx={{
                  '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#e2e8f0' } },
                  '& .MuiOutlinedInput-root:hover fieldset': { borderColor: '#050D31' },
                }}
              />
            </DialogContent>
            <DialogActions sx={{ backgroundColor: '#ffffff' }}>
              <Button
                onClick={handleEditClose}
                sx={{ color: '#64748b', textTransform: 'none' }}
              >
                Batal
              </Button>
              <Button
                onClick={handleEditSubmit}
                variant="contained"
                color="primary"
                sx={{
                  bgcolor: '#050D31',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 4,
                  py: 1,
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(5, 13, 49, 0.2)',
                  '&:hover': {
                    bgcolor: '#0A1A5C',
                    boxShadow: '0 6px 16px rgba(5, 13, 49, 0.3)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Simpan
              </Button>
            </DialogActions>
          </Dialog>
        </ErrorBoundary>
      </ThemeProvider>
    </Box>
  );
};

export default ProfilePage;