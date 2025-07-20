import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Box,
  Alert,
  Chip,
  Modal,
  Fade,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tabs,
  Tab,
} from '@mui/material';
import { Add, CheckCircle, Cancel } from '@mui/icons-material';
import { createTopic, getProposalsByDosenNip, getTopicsByDosenNip, updateProposalStatus } from '../utils/skripsiService';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import SkripsiSearch from '../components/SkripsiSearch';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 500 },
  bgcolor: '#050D31',
  border: '1px solid #efbf04',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  color: '#FFFFFF',
};

const SkripsiManagement = () => {
  const [topicForm, setTopicForm] = useState({ title: '', description: '' });
  const [proposals, setProposals] = useState([]);
  const [topics, setTopics] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, proposalId: null, status: '', judul: '', description: '' });
  const [tabValue, setTabValue] = useState(0);
  const cache = useRef({ proposals: null, topics: null });
  const isFetching = useRef(false);

  const user = JSON.parse(localStorage.getItem('user'));

  const fetchData = useCallback(async (force = false) => {
    if (isFetching.current || !user?.username) return;
    if (!force && cache.current.proposals && cache.current.topics) {
      setProposals(cache.current.proposals);
      setTopics(cache.current.topics);
      return;
    }

    isFetching.current = true;
    setLoading(true);
    try {
      const [proposalsResponse, topicsResponse] = await Promise.all([
        getProposalsByDosenNip(),
        getTopicsByDosenNip(user.username),
      ]);
      cache.current = {
        proposals: proposalsResponse.data,
        topics: topicsResponse.data,
      };
      setProposals(proposalsResponse.data);
      setTopics(topicsResponse.data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Gagal mengambil data');
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, [user?.username]);

  useEffect(() => {
    if (tabValue === 0) {
      fetchData();
    }
  }, [fetchData, tabValue]);

  const handleInputChange = (e) => {
    setTopicForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddTopic = async (e) => {
    e.preventDefault();
    if (!topicForm.title.trim() || !topicForm.description.trim()) {
      setError('Judul dan deskripsi harus diisi');
      return;
    }
    setLoading(true);
    try {
      await createTopic({ ...topicForm, dosenNip: user.username });
      setSuccess('Topik berhasil ditambahkan');
      setTopicForm({ title: '', description: '' });
      setModalOpen(false);
      cache.current.topics = null;
      await fetchData(true);
      setError(null);
    } catch (err) {
      setError(err.message || 'Gagal menambahkan topik');
      setSuccess(null);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenConfirmDialog = (proposalId, status) => {
    const proposal = proposals.find((p) => p.documentId === proposalId);
    console.log('Opening confirm dialog:', { proposalId, status, proposal });
    if (!proposal) {
      setError('Proposal tidak ditemukan');
      return;
    }
    setConfirmDialog({
      open: true,
      proposalId,
      status,
      judul: proposal.judul || 'Belum diisi',
      description: proposal.description || 'Belum diisi',
    });
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialog({ open: false, proposalId: null, status: '', judul: '', description: '' });
  };

  const handleUpdateStatus = async () => {
    setLoading(true);
    try {
      console.log('Confirming status update:', confirmDialog);
      const proposal = proposals.find((p) => p.documentId === confirmDialog.proposalId);
      if (!proposal) {
        throw new Error('Proposal tidak ditemukan');
      }
      await updateProposalStatus(confirmDialog.proposalId, {
        status: confirmDialog.status,
        judul: proposal.judul || 'Belum diisi',
        description: proposal.description || 'Belum diisi',
      });
      setSuccess(`Proposal berhasil ${confirmDialog.status === 'approved' ? 'disetujui' : 'ditolak'}`);
      cache.current.proposals = null;
      await fetchData(true);
      setError(null);
    } catch (err) {
      console.error('Error in handleUpdateStatus:', err);
      setError(err.message || `Gagal ${confirmDialog.status === 'approved' ? 'menyetujui' : 'menolak'} proposal`);
      setSuccess(null);
    } finally {
      setLoading(false);
      setConfirmDialog({ open: false, proposalId: null, status: '', judul: '', description: '' });
    }
  };

  const handleDrawerToggle = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setTopicForm({ title: '', description: '' });
    setError(null);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError(null);
    setSuccess(null);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#ffffff' }}>
      <Sidebar open={sidebarOpen} handleDrawerToggle={handleDrawerToggle} role="dosen" />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: '64px',
          ml: sidebarOpen ? '0px' : '0px',
          transition: 'margin-left 0.3s ease-in-out',
          width: sidebarOpen ? 'calc(100% - 260px)' : 'calc(100% - 70px)',
        }}
      >
        <Header title="Manajemen Skripsi" sx={{ fontFamily: '"Orbitron", sans-serif', color: '#FFFFFF' }} />
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{
              mb: 3,
              '& .MuiTab-root': {
                color: '#000000',
                fontWeight: 600,
                fontFamily: '"Orbitron", sans-serif',
                textTransform: 'none',
              },
              '& .Mui-selected': {
                color: '#efbf04',
              },
              '& .MuiTabs-indicator': {
                bgcolor: '#efbf04',
              },
            }}
          >
            <Tab label="Manajemen Skripsi" />
            <Tab label="Pencarian Skripsi" />
          </Tabs>

          {tabValue === 0 && (
            <>
              <Typography
                variant="h4"
                gutterBottom
                sx={{ fontFamily: '"Orbitron", sans-serif', color: '#050D31' }}
              >
                Manajemen Skripsi
              </Typography>

              {error && <Alert severity="error" sx={{ mb: 2, bgcolor: '#d32f2f', color: '#FFFFFF' }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ mb: 2, bgcolor: '#4caf50', color: '#FFFFFF' }}>{success}</Alert>}

              {/* Topics Section */}
              <Card
                sx={{
                  borderRadius: 2,
                  bgcolor: '#050D31',
                  color: '#FFFFFF',
                  border: '1px solid #efbf04',
                  mb: 4,
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography
                      variant="h6"
                      sx={{ fontFamily: '"Orbitron", sans-serif', color: '#FFFFFF' }}
                    >
                      Daftar Topik
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={handleOpenModal}
                      disabled={loading}
                      sx={{
                        bgcolor: '#efbf04',
                        color: '#ffffff',
                        textTransform: 'none',
                        fontWeight: 600,
                        borderRadius: 2,
                        px: 3,
                        '&:hover': { bgcolor: '#d4a503' },
                        '&:disabled': { bgcolor: '#b0bec5' },
                      }}
                    >
                      Tambah Topik
                    </Button>
                  </Box>
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                      <Typography sx={{ color: '#FFFFFF' }}>Loading...</Typography>
                    </Box>
                  ) : topics.length === 0 ? (
                    <Typography
                      variant="body1"
                      sx={{ color: '#FFFFFF', opacity: 0.7, textAlign: 'center', mt: 2 }}
                    >
                      Tidak ada topik yang tersedia
                    </Typography>
                  ) : (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: '#050D31' }}>
                            <TableCell sx={{ color: '#FFFFFF', fontWeight: 600, fontFamily: '"Orbitron", sans-serif' }}>
                              Judul Topik
                            </TableCell>
                            <TableCell sx={{ color: '#FFFFFF', fontWeight: 600, fontFamily: '"Orbitron", sans-serif' }}>
                              Deskripsi
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {topics.map((topic) => (
                            <TableRow
                              key={topic.documentId}
                              sx={{
                                '&:hover': { bgcolor: '#1a237e' },
                                bgcolor: '#050D31',
                              }}
                            >
                              <TableCell sx={{ color: '#FFFFFF', fontFamily: '"Orbitron", sans-serif' }}>
                                {topic.title}
                              </TableCell>
                              <TableCell sx={{ color: '#FFFFFF', fontFamily: '"Orbitron", sans-serif' }}>
                                {topic.description}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </CardContent>
              </Card>

              {/* Modal for Adding Topic */}
              <Modal open={modalOpen} onClose={handleCloseModal}>
                <Fade in={modalOpen}>
                  <Box sx={modalStyle}>
                    <Typography
                      variant="h6"
                      sx={{ mb: 3, fontFamily: '"Orbitron", sans-serif' }}
                    >
                      Tambah Topik Baru
                    </Typography>
                    {error && <Alert severity="error" sx={{ mb: 2, bgcolor: '#d32f2f', color: '#FFFFFF' }}>{error}</Alert>}
                    <Box component="form" onSubmit={handleAddTopic}>
                      <TextField
                        fullWidth
                        label="Judul Topik"
                        name="title"
                        value={topicForm.title}
                        onChange={handleInputChange}
                        margin="normal"
                        required
                        disabled={loading}
                        sx={{
                          mb: 2,
                          input: { color: '#FFFFFF' },
                          label: { color: '#FFFFFF' },
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': { borderColor: '#efbf04' },
                            '&:hover fieldset': { borderColor: '#d4a503' },
                            '&.Mui-focused fieldset': { borderColor: '#efbf04' },
                          },
                        }}
                      />
                      <TextField
                        fullWidth
                        label="Deskripsi"
                        name="description"
                        value={topicForm.description}
                        onChange={handleInputChange}
                        margin="normal"
                        multiline
                        rows={4}
                        required
                        disabled={loading}
                        sx={{
                          mb: 2,
                          input: { color: '#FFFFFF' },
                          label: { color: '#FFFFFF' },
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': { borderColor: '#efbf04' },
                            '&:hover fieldset': { borderColor: '#d4a503' },
                            '&.Mui-focused fieldset': { borderColor: '#efbf04' },
                          },
                        }}
                      />
                      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                        <Button
                          variant="contained"
                          onClick={handleAddTopic}
                          disabled={loading}
                          sx={{
                            flex: 1,
                            bgcolor: '#efbf04',
                            color: '#ffffff',
                            textTransform: 'none',
                            fontWeight: 600,
                            borderRadius: 2,
                            '&:hover': { bgcolor: '#d4a503' },
                            '&:disabled': { bgcolor: '#b0bec5' },
                          }}
                        >
                          {loading ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={handleCloseModal}
                          disabled={loading}
                          sx={{
                            flex: 1,
                            color: '#FFFFFF',
                            borderColor: '#efbf04',
                            textTransform: 'none',
                            fontWeight: 600,
                            borderRadius: 2,
                            '&:hover': { borderColor: '#d4a503', bgcolor: '#1a237e' },
                          }}
                        >
                          Batal
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </Fade>
              </Modal>

              {/* Proposals Section */}
              <Card
                sx={{
                  borderRadius: 2,
                  bgcolor: '#050D31',
                  color: '#FFFFFF',
                  border: '1px solid #efbf04',
                }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontFamily: '"Orbitron", sans-serif', color: '#FFFFFF' }}
                  >
                    Daftar Proposal
                  </Typography>
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                      <Typography sx={{ color: '#FFFFFF' }}>Loading...</Typography>
                    </Box>
                  ) : proposals.length === 0 ? (
                    <Typography
                      variant="body1"
                      sx={{ color: '#FFFFFF', opacity: 0.7, textAlign: 'center', mt: 2 }}
                    >
                      Tidak ada proposal yang tersedia
                    </Typography>
                  ) : (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: '#050D31' }}>
                            <TableCell sx={{ color: '#FFFFFF', fontWeight: 600, fontFamily: '"Orbitron", sans-serif' }}>
                              Mahasiswa
                            </TableCell>
                            <TableCell sx={{ color: '#FFFFFF', fontWeight: 600, fontFamily: '"Orbitron", sans-serif' }}>
                              Topik
                            </TableCell>
                            <TableCell sx={{ color: '#FFFFFF', fontWeight: 600, fontFamily: '"Orbitron", sans-serif' }}>
                              Judul
                            </TableCell>
                            <TableCell sx={{ color: '#FFFFFF', fontWeight: 600, fontFamily: '"Orbitron", sans-serif' }}>
                              Deskripsi
                            </TableCell>
                            <TableCell sx={{ color: '#FFFFFF', fontWeight: 600, fontFamily: '"Orbitron", sans-serif' }}>
                              Status
                            </TableCell>
                            <TableCell sx={{ color: '#FFFFFF', fontWeight: 600, fontFamily: '"Orbitron", sans-serif' }}>
                              Aksi
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {proposals.map((proposal) => (
                            <TableRow
                              key={proposal.documentId}
                              sx={{
                                '&:hover': { bgcolor: '#1a237e' },
                                bgcolor: '#050D31',
                              }}
                            >
                              <TableCell sx={{ color: '#FFFFFF', fontFamily: '"Orbitron", sans-serif' }}>
                                {proposal.mahasiswa?.namaLengkap || '-'}
                              </TableCell>
                              <TableCell sx={{ color: '#FFFFFF', fontFamily: '"Orbitron", sans-serif' }}>
                                {proposal.topic?.title || '-'}
                              </TableCell>
                              <TableCell sx={{ color: '#FFFFFF', fontFamily: '"Orbitron", sans-serif' }}>
                                {proposal.judul || 'Belum diisi'}
                              </TableCell>
                              <TableCell sx={{ color: '#FFFFFF', fontFamily: '"Orbitron", sans-serif' }}>
                                {proposal.description || 'Belum diisi'}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  icon={
                                    proposal.status_class === 'approved' ? (
                                      <CheckCircle />
                                    ) : proposal.status_class === 'rejected' ? (
                                      <Cancel />
                                    ) : null
                                  }
                                  label={
                                    proposal.status_class === 'approved'
                                      ? 'Disetujui'
                                      : proposal.status_class === 'rejected'
                                      ? 'Ditolak'
                                      : 'Menunggu'
                                  }
                                  sx={{
                                    bgcolor:
                                      proposal.status_class === 'approved'
                                        ? '#4caf50'
                                        : proposal.status_class === 'rejected'
                                        ? '#d32f2f'
                                        : '#efbf04',
                                    color:
                                      proposal.status_class === 'approved' || proposal.status_class === 'rejected'
                                        ? '#FFFFFF'
                                        : '#000000',
                                    fontWeight: 500,
                                    fontFamily: '"Orbitron", sans-serif',
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                {!proposal.status_class && (
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button
                                      variant="contained"
                                      startIcon={<CheckCircle />}
                                      onClick={() => handleOpenConfirmDialog(proposal.documentId, 'approved')}
                                      disabled={loading}
                                      sx={{
                                        bgcolor: '#4caf50',
                                        color: '#FFFFFF',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        borderRadius: 2,
                                        '&:hover': { bgcolor: '#388e3c' },
                                        '&:disabled': { bgcolor: '#b0bec5' },
                                      }}
                                    >
                                      Setujui
                                    </Button>
                                    <Button
                                      variant="contained"
                                      startIcon={<Cancel />}
                                      onClick={() => handleOpenConfirmDialog(proposal.documentId, 'rejected')}
                                      disabled={loading}
                                      sx={{
                                        bgcolor: '#d32f2f',
                                        color: '#FFFFFF',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        borderRadius: 2,
                                        '&:hover': { bgcolor: '#b71c1c' },
                                        '&:disabled': { bgcolor: '#b0bec5' },
                                      }}
                                    >
                                      Tolak
                                    </Button>
                                  </Box>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </CardContent>
              </Card>

              {/* Confirmation Dialog */}
              <Dialog
                open={confirmDialog.open}
                onClose={handleCloseConfirmDialog}
                aria-labelledby="confirm-dialog-title"
                PaperProps={{
                  sx: {
                    bgcolor: '#050D31',
                    color: '#FFFFFF',
                    border: '1px solid #efbf04',
                    borderRadius: 2,
                  },
                }}
              >
                <DialogTitle id="confirm-dialog-title" sx={{ fontFamily: '"Orbitron", sans-serif' }}>
                  Konfirmasi {confirmDialog.status === 'approved' ? 'Persetujuan' : 'Penolakan'}
                </DialogTitle>
                <DialogContent>
                  <DialogContentText sx={{ color: '#FFFFFF', fontFamily: '"Orbitron", sans-serif' }}>
                    Apakah Anda yakin ingin {confirmDialog.status === 'approved' ? 'menyetujui' : 'menolak'} proposal ini?
                  </DialogContentText>
                  <Box sx={{ mt: 2 }}>
                    <Typography
                      variant="body1"
                      sx={{ color: '#FFFFFF', fontFamily: '"Orbitron", sans-serif', fontWeight: 600 }}
                    >
                      Judul: {confirmDialog.judul}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: '#FFFFFF', fontFamily: '"Orbitron", sans-serif', mt: 1 }}
                    >
                      Deskripsi: {confirmDialog.description}
                    </Typography>
                  </Box>
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={handleCloseConfirmDialog}
                    sx={{
                      color: '#FFFFFF',
                      borderColor: '#efbf04',
                      textTransform: 'none',
                      fontFamily: '"Orbitron", sans-serif',
                      '&:hover': { bgcolor: '#1a237e' },
                    }}
                  >
                    Batal
                  </Button>
                  <Button
                    onClick={handleUpdateStatus}
                    variant="contained"
                    disabled={loading}
                    sx={{
                      bgcolor: confirmDialog.status === 'approved' ? '#4caf50' : '#d32f2f',
                      color: '#FFFFFF',
                      textTransform: 'none',
                      fontWeight: 600,
                      borderRadius: 2,
                      '&:hover': {
                        bgcolor: confirmDialog.status === 'approved' ? '#388e3c' : '#b71c1c',
                      },
                      '&:disabled': { bgcolor: '#b0bec5' },
                    }}
                  >
                    {loading ? 'Mengonfirmasi...' : 'Konfirmasi'}
                  </Button>
                </DialogActions>
              </Dialog>
            </>
          )}

          {tabValue === 1 && <SkripsiSearch />}
        </Container>
      </Box>
    </Box>
  );
};

export default SkripsiManagement;