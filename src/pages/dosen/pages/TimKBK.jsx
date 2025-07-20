// KBKTeam.jsx
import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Container, Grid, Card, CardContent, Modal, TextField, IconButton, Fade } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import { useSnackbar } from 'notistack';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import LoadingScreen from '../../../routes/LoadingScreen';
import { getKbkInfoList, createKbkInfo, updateKbkInfo } from '../utils/kbkService';

const TeamKBK = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openValidationModal, setOpenValidationModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', file: null });
  const [editData, setEditData] = useState({ documentId: '', title: '', description: '', date: '', file: null });
  const [infoList, setInfoList] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  console.log('User from localStorage:', user); // Debug log
  const isCoordinator = user.jabatan && user.jabatan.toLowerCase() === 'koordinator program studi';

  useEffect(() => {
    const fetchInfo = async () => {
      setLoading(true);
      try {
        const response = await getKbkInfoList();
        console.log('API Response:', response); // Debug log
        const sortedData = (Array.isArray(response.data) ? response.data : [])
          .filter((info) => info && info.id && info.title && info.description && info.date)
          .sort((a, b) => new Date(b.date) - new Date(a.date));
        setInfoList(sortedData);
        setLoading(false);
      } catch (error) {
        console.error('Fetch error:', error); // Debug log
        enqueueSnackbar('Gagal mengambil data informasi', { variant: 'error' });
        setLoading(false);
      }
    };
    fetchInfo();
  }, []);

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleOpenModal = () => {
    setOpenValidationModal(true);
  };

  const handleCloseModal = () => {
    setOpenValidationModal(false);
    setFormData({ title: '', description: '', file: null });
  };

  const handleOpenEditModal = (info) => {
    setEditData({
      documentId: info.documentId,
      title: info.title || '',
      description: info.description || '',
      date: info.date || '',
      file: null,
    });
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
    setEditData({ documentId: '', title: '', description: '', date: '', file: null });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, file: e.target.files[0] }));
  };

  const handleEditFileChange = (e) => {
    setEditData((prev) => ({ ...prev, file: e.target.files[0] }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.file) {
      enqueueSnackbar('Semua field harus diisi', { variant: 'warning' });
      return;
    }
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('data', JSON.stringify({ 
        title: formData.title, 
        description: formData.description, 
        date: new Date().toISOString().split('T')[0] 
      }));
      formDataToSend.append('files.file', formData.file);
      await createKbkInfo(formDataToSend);
      enqueueSnackbar('Validasi berhasil dikirim', { variant: 'success' });
      // Refresh data after submission
      const response = await getKbkInfoList();
      const sortedData = (Array.isArray(response.data) ? response.data : [])
        .filter((info) => info && info.id && info.title && info.description && info.date)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      setInfoList(sortedData);
      handleCloseModal();
    } catch (error) {
      console.error('Submit error:', error); // Debug log
      enqueueSnackbar('Gagal mengirim validasi', { variant: 'error' });
    }
  };

  const handleEditSubmit = async () => {
    if (!editData.title || !editData.description) {
      enqueueSnackbar('Judul dan deskripsi harus diisi', { variant: 'warning' });
      return;
    }
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('data', JSON.stringify({
        title: editData.title,
        description: editData.description,
        date: editData.date || new Date().toISOString().split('T')[0],
      }));
      if (editData.file) {
        formDataToSend.append('files.file', editData.file);
      }
      await updateKbkInfo(editData.documentId, formDataToSend);
      enqueueSnackbar('Validasi berhasil diperbarui', { variant: 'success' });
      // Refresh data after update
      const response = await getKbkInfoList();
      const sortedData = (Array.isArray(response.data) ? response.data : [])
        .filter((info) => info && info.id && info.title && info.description && info.date)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      setInfoList(sortedData);
      handleCloseEditModal();
    } catch (error) {
      console.error('Edit submit error:', error); // Debug log
      enqueueSnackbar('Gagal memperbarui validasi', { variant: 'error' });
    }
  };

  const handleDownload = (info) => {
    if (info.file && info.file.length > 0) {
      const fileUrl = `http://localhost:1337${info.file[0].url}`;
      window.open(fileUrl, '_blank');
    } else {
      enqueueSnackbar('Tidak ada file untuk diunduh', { variant: 'warning' });
    }
  };

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f7f9fc', minHeight: '100vh' }}>
      <Header title="Tim KBK" />
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
                      Informasi Tim KBK
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
                      Kelola informasi dan validasi terkait kegiatan Tim KBK dengan antarmuka yang intuitif.
                    </Typography>
                  </Grid>
                  {isCoordinator && (
                    <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleOpenModal}
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
                        Tambah Validasi
                      </Button>
                    </Grid>
                  )}
                </Grid>
                <Grid container spacing={3}>
                  {infoList.length === 0 ? (
                    <Grid item xs={12}>
                      <Typography variant="body1" sx={{ color: '#64748b', textAlign: 'center' }}>
                        Tidak ada data tersedia
                      </Typography>
                    </Grid>
                  ) : (
                    infoList.map((info) => (
                      <Grid item xs={12} sm={6} md={4} key={info.id}>
                        <Card
                          sx={{
                            borderRadius: 2,
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                            bgcolor: '#050D31',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                            },
                          }}
                        >
                          <CardContent>
                            <Typography
                              variant="h6"
                              sx={{ color: 'white', fontWeight: 600, mb: 1 }}
                            >
                              {info.title || 'Judul Tidak Tersedia'}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ color: 'white', mb: 2, opacity: 0.9 }}
                            >
                              {info.description || 'Deskripsi Tidak Tersedia'}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: 'white', opacity: 0.7 }}
                            >
                              {info.date
                                ? new Date(info.date).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                  })
                                : 'Tanggal Tidak Tersedia'}
                            </Typography>
                            <Box sx={{ mt: 2, textAlign: 'right' }}>
                              <Button
                                variant="outlined"
                                startIcon={<DownloadIcon />}
                                onClick={() => handleDownload(info)}
                                sx={{
                                  color: 'white',
                                  borderColor: 'white',
                                  textTransform: 'none',
                                  mr: isCoordinator ? 1 : 0,
                                  '&:hover': {
                                    borderColor: '#e0e0e0',
                                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                                  },
                                }}
                              >
                                Unduh Data
                              </Button>
                              {isCoordinator && (
                                <Button
                                  variant="outlined"
                                  startIcon={<EditIcon />}
                                  onClick={() => handleOpenEditModal(info)}
                                  sx={{
                                    color: 'white',
                                    borderColor: 'white',
                                    textTransform: 'none',
                                    '&:hover': {
                                      borderColor: '#e0e0e0',
                                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                                    },
                                  }}
                                >
                                  Edit
                                </Button>
                              )}
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))
                  )}
                </Grid>
                {/* Add Validation Modal */}
                <Modal
                  open={openValidationModal}
                  onClose={handleCloseModal}
                  closeAfterTransition
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Fade in={openValidationModal}>
                    <Box
                      sx={{
                        bgcolor: 'white',
                        borderRadius: 2,
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                        p: 4,
                        width: { xs: '90%', sm: '500px' },
                        maxWidth: '500px',
                        position: 'relative',
                      }}
                    >
                      <IconButton
                        onClick={handleCloseModal}
                        sx={{ position: 'absolute', top: 8, right: 8 }}
                      >
                        <CloseIcon />
                      </IconButton>
                      <Typography
                        variant="h5"
                        sx={{ color: '#050D31', fontWeight: 600, mb: 3 }}
                      >
                        Form Validasi
                      </Typography>
                      <TextField
                        fullWidth
                        label="Judul"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        sx={{
                          mb: 3,
                          '& .MuiInputLabel-root': { color: 'black' },
                          '& .MuiInputBase-input': { color: 'black' },
                        }}
                      />
                      <TextField
                        fullWidth
                        label="Deskripsi"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        multiline
                        rows={4}
                        sx={{
                          mb: 3,
                          '& .MuiInputLabel-root': { color: 'black' },
                          '& .MuiInputBase-input': { color: 'black' },
                        }}
                      />
                      <Button
                        variant="contained"
                        component="label"
                        sx={{ mb: 3, bgcolor: '#050D31', '&:hover': { bgcolor: '#0A1A5C' } }}
                      >
                        Upload File
                        <input
                          type="file"
                          hidden
                          onChange={handleFileChange}
                          accept="image/*,application/pdf"
                        />
                      </Button>
                      {formData.file && (
                        <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
                          File: {formData.file.name}
                        </Typography>
                      )}
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={handleSubmit}
                        sx={{
                          bgcolor: '#050D31',
                          textTransform: 'none',
                          fontWeight: 600,
                          py: 1.5,
                          borderRadius: 2,
                          '&:hover': { bgcolor: '#0A1A5C' },
                        }}
                      >
                        Submit
                      </Button>
                    </Box>
                  </Fade>
                </Modal>
                {/* Edit Validation Modal */}
                <Modal
                  open={openEditModal}
                  onClose={handleCloseEditModal}
                  closeAfterTransition
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Fade in={openEditModal}>
                    <Box
                      sx={{
                        bgcolor: 'white',
                        borderRadius: 2,
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                        p: 4,
                        width: { xs: '90%', sm: '500px' },
                        maxWidth: '500px',
                        position: 'relative',
                      }}
                    >
                      <IconButton
                        onClick={handleCloseEditModal}
                        sx={{ position: 'absolute', top: 8, right: 8 }}
                      >
                        <CloseIcon />
                      </IconButton>
                      <Typography
                        variant="h5"
                        sx={{ color: '#050D31', fontWeight: 600, mb: 3 }}
                      >
                        Edit Validasi
                      </Typography>
                      <TextField
                        fullWidth
                        label="Judul"
                        name="title"
                        value={editData.title}
                        onChange={handleEditInputChange}
                        sx={{
                          mb: 3,
                          '& .MuiInputLabel-root': { color: 'black' },
                          '& .MuiInputBase-input': { color: 'black' },
                        }}
                      />
                      <TextField
                        fullWidth
                        label="Deskripsi"
                        name="description"
                        value={editData.description}
                        onChange={handleEditInputChange}
                        multiline
                        rows={4}
                        sx={{
                          mb: 3,
                          '& .MuiInputLabel-root': { color: 'black' },
                          '& .MuiInputBase-input': { color: 'black' },
                        }}
                      />
                      <Button
                        variant="contained"
                        component="label"
                        sx={{ mb: 3, bgcolor: '#050D31', '&:hover': { bgcolor: '#0A1A5C' } }}
                      >
                        Upload File Baru (Opsional)
                        <input
                          type="file"
                          hidden
                          onChange={handleEditFileChange}
                          accept="image/*,application/pdf"
                        />
                      </Button>
                      {editData.file && (
                        <Typography variant="body2" sx={{ color: '#64748b', mb: 3 }}>
                          File: {editData.file.name}
                        </Typography>
                      )}
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={handleEditSubmit}
                        sx={{
                          bgcolor: '#050D31',
                          textTransform: 'none',
                          fontWeight: 600,
                          py: 1.5,
                          borderRadius: 2,
                          '&:hover': { bgcolor: '#0A1A5C' },
                        }}
                      >
                        Update
                      </Button>
                    </Box>
                  </Fade>
                </Modal>
              </Box>
            </Fade>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default TeamKBK;