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
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 20 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', mt: 10, color: '#E0E7FF' }}>
        <Typography variant="h5">Error: {error}</Typography>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => navigate('/login')}
          sx={{ mt: 2 }}
        >
          Back to Login
        </Button>
      </Box>
    );
  }

  const isDosen = !!profileData?.nip;
  const role = isDosen ? 'dosen' : 'mahasiswa';

  return (
    <ThemeProvider theme={theme}>
      <ErrorBoundary>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'linear-gradient(180deg, #0A1A5C 0%, #050D31 100%)' }}>
          <Header title="Profil" />
          <Box sx={{ display: 'flex', flex: 1, pt: '64px' }}>
            <Sidebar open={sidebarOpen} handleDrawerToggle={handleDrawerToggle} role={role} />
            <Box
              component="main"
              sx={{
                flex: 1,
                py: 4,
                pl: sidebarOpen ? '260px' : '70px',
                transition: 'padding-left 0.3s ease-in-out',
              }}
            >
              <Container maxWidth="lg">
                <Paper
                  elevation={6}
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
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
                          border: '3px solid #FFD700',
                        }}
                      />
                      <Typography variant="h4" sx={{ color: '#E0E7FF', fontWeight: 600 }}>
                        {profileData?.namaLengkap}
                      </Typography>
                      <Chip
                        label={isDosen ? 'Dosen' : 'Mahasiswa'}
                        color={isDosen ? 'primary' : 'secondary'}
                        sx={{ mt: 2, fontSize: '1rem' }}
                      />
                    </Grid>
                    <Grid item xs={12} md={8}>
                      <Typography variant="h5" sx={{ color: '#FFD700', mb: 3 }}>
                        Profile Details
                      </Typography>
                      <Divider sx={{ mb: 3, borderColor: 'rgba(255, 255, 255, 0.2)' }} />
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography sx={{ color: '#E0E7FF' }}>
                            <strong>{isDosen ? 'NIP' : 'NIM'}:</strong> {isDosen ? profileData.nip : profileData.nim}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography sx={{ color: '#E0E7FF' }}>
                            <strong>Email:</strong> {profileData?.users_permissions_user?.email}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography sx={{ color: '#E0E7FF' }}>
                            <strong>Program Studi:</strong> {profileData?.program_studi?.nama || 'N/A'}
                          </Typography>
                        </Grid>
                        {isDosen ? (
                          <>
                            <Grid item xs={12} sm={6}>
                              <Typography sx={{ color: '#E0E7FF' }}>
                                <strong>NIDN:</strong> {profileData.nidn}
                              </Typography>
                            </Grid>
                            <Grid item xs={12}>
                              <Typography sx={{ color: '#E0E7FF', mt: 2 }}>
                                <strong>Mata Kuliah:</strong>
                              </Typography>
                              {profileData.matakuliahs?.length > 0 ? (
                                profileData.matakuliahs.map((mk) => (
                                  <Chip
                                    key={mk.id}
                                    label={`${mk.nama} (${mk.kode})`}
                                    sx={{ mr: 1, mt: 1, backgroundColor: '#1A237E', color: '#E0E7FF' }}
                                  />
                                ))
                              ) : (
                                <Typography sx={{ color: '#E0E7FF' }}>No courses assigned</Typography>
                              )}
                            </Grid>
                          </>
                        ) : (
                          <>
                            <Grid item xs={12} sm={6}>
                              <Typography sx={{ color: '#E0E7FF' }}>
                                <strong>Semester:</strong> {profileData.semester}
                              </Typography>
                            </Grid>
                            <Grid item xs={12}>
                              <Typography sx={{ color: '#E0E7FF', mt: 2 }}>
                                <strong>Status:</strong> {profileData.status_class}
                              </Typography>
                            </Grid>
                          </>
                        )}
                      </Grid>
                      <Button
                        variant="contained"
                        color="primary"
                        sx={{ mt: 4, borderRadius: 12 }}
                        onClick={handleEditOpen}
                      >
                        Edit Profile
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              </Container>
            </Box>
          </Box>

          <Dialog open={editOpen} onClose={handleEditClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ color: '#E0E7FF', backgroundColor: '#050D31' }}>
              Edit Profile
            </DialogTitle>
            <DialogContent sx={{ backgroundColor: '#050D31' }}>
              <TextField
                fullWidth
                label="Full Name"
                name="namaLengkap"
                value={editForm.namaLengkap}
                onChange={handleEditChange}
                margin="normal"
                InputLabelProps={{ style: { color: '#E0E7FF' } }}
                InputProps={{ style: { color: '#E0E7FF' } }}
                sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#FFD700' } } }}
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={editForm.email}
                onChange={handleEditChange}
                margin="normal"
                InputLabelProps={{ style: { color: '#E0E7FF' } }}
                InputProps={{ style: { color: '#E0E7FF' } }}
                sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#FFD700' } } }}
              />
            </DialogContent>
            <DialogActions sx={{ backgroundColor: '#050D31' }}>
              <Button onClick={handleEditClose} sx={{ color: '#E0E7FF' }}>
                Cancel
              </Button>
              <Button onClick={handleEditSubmit} variant="contained" color="primary">
                Save
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default ProfilePage;