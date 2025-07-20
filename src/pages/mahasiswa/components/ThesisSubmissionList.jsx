import React, { useState, useEffect } from 'react';
import { fetchThesisProposals, checkActiveSubmission, uploadThesis, fetchMahasiswaByNim, checkSubmittedThesis, fetchLecturers, fetchTopicsByLecturer, submitThesisProposal } from '../service/bankService';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Modal,
  TextField,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

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

const ThesisSubmissionList = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSubmission, setActiveSubmission] = useState(null);
  const [hasSubmittedThesis, setHasSubmittedThesis] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [proposalModalOpen, setProposalModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [uploadData, setUploadData] = useState({
    title: '',
    author: '',
    nim: '',
    year: '',
    file: null,
    abstract: '',
  });
  const [proposalData, setProposalData] = useState({
    lecturerId: '',
    topicId: '',
    judul: '',
    description: '',
  });
  const [lecturers, setLecturers] = useState([]);
  const [topics, setTopics] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);
  const [mahasiswa, setMahasiswa] = useState(null);
  const [selectedLecturers, setSelectedLecturers] = useState([]);
  const [approvedProposal, setApprovedProposal] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [proposalsResponse, activeSubmissionResponse, submittedThesis, lecturersResponse] = await Promise.all([
          fetchThesisProposals(),
          checkActiveSubmission(),
          checkSubmittedThesis(),
          fetchLecturers(),
        ]);
        setProposals(proposalsResponse.data);
        setActiveSubmission(activeSubmissionResponse.data);
        setHasSubmittedThesis(submittedThesis);
        setLecturers(lecturersResponse.data);

        const userData = localStorage.getItem('user');
        if (!userData) {
          throw new Error('User data not found in localStorage');
        }

        const mahasiswaResponse = await fetchMahasiswaByNim(userData);
        if (!mahasiswaResponse?.nim) {
          throw new Error('Invalid mahasiswa data: NIM is missing');
        }
        console.log('Fetched mahasiswa:', mahasiswaResponse);
        setMahasiswa(mahasiswaResponse);
        setUploadData(prev => ({ ...prev, nim: mahasiswaResponse.nim || '' }));

        const selectedLecturerIds = proposalsResponse.data.map(proposal => proposal.dosenId).filter(id => id);
        setSelectedLecturers(selectedLecturerIds);

        const approved = proposalsResponse.data.find(proposal => proposal.status === 'approved');
        console.log('Approved proposal:', approved);
        setApprovedProposal(approved || null);

        console.log('Initial state:', {
          hasSubmittedThesis: submittedThesis,
          mahasiswa: mahasiswaResponse,
          activeSubmission: activeSubmissionResponse.data,
          proposals: proposalsResponse.data,
          selectedLecturers: selectedLecturerIds,
          approvedProposal: approved,
        });

        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Gagal memuat data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleOpenUploadModal = (proposal) => {
    console.log('Opening upload modal for proposal:', proposal);
    setSelectedProposal(proposal);
    setUploadModalOpen(true);
  };

  const handleCloseUploadModal = () => {
    setUploadModalOpen(false);
    setUploadData({
      title: '',
      author: '',
      nim: mahasiswa?.nim || '',
      year: '',
      file: null,
      abstract: '',
    });
    setSelectedProposal(null);
    setSubmissionError(null);
  };

  const handleOpenProposalModal = () => {
    setProposalModalOpen(true);
  };

  const handleCloseProposalModal = () => {
    setProposalModalOpen(false);
    setProposalData({ lecturerId: '', topicId: '', judul: '', description: '' });
    setTopics([]);
    setSubmissionError(null);
  };

  const handleLecturerChange = async (event) => {
    const lecturerId = event.target.value;
    setProposalData({ ...proposalData, lecturerId, topicId: '' });
    try {
      const topicsResponse = await fetchTopicsByLecturer(lecturerId);
      setTopics(topicsResponse.data);
    } catch (err) {
      setSubmissionError('Gagal memuat topik: ' + err.message);
    }
  };

  const handleSubmitProposal = async () => {
    if (!mahasiswa) {
      setSubmissionError('Data mahasiswa tidak ditemukan. Silakan login ulang.');
      return;
    }
    try {
      setSubmitting(true);
      setSubmissionError(null);
      await submitThesisProposal(proposalData);
      handleCloseProposalModal();
      const response = await fetchThesisProposals();
      setProposals(response.data);
      const selectedLecturerIds = response.data.map(proposal => proposal.dosenId).filter(id => id);
      setSelectedLecturers(selectedLecturerIds);
      const approved = response.data.find(proposal => proposal.status === 'approved');
      console.log('Approved proposal after submit:', approved);
      setApprovedProposal(approved || null);
      const activeSubmissionResponse = await checkActiveSubmission();
      setActiveSubmission(activeSubmissionResponse.data);
      console.log('After submit proposal:', { activeSubmission: activeSubmissionResponse.data });
    } catch (err) {
      setSubmissionError('Gagal mengajukan proposal: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadThesis = async () => {
    if (!mahasiswa) {
      setSubmissionError('Data mahasiswa tidak ditemukan. Silakan login ulang.');
      return;
    }
    if (!mahasiswa.nim || typeof mahasiswa.nim !== 'string' || mahasiswa.nim.trim() === '') {
      console.error('Invalid mahasiswa.nim:', mahasiswa.nim);
      setSubmissionError('NIM mahasiswa tidak valid. Silakan login ulang.');
      return;
    }
    if (!approvedProposal) {
      setSubmissionError('Pengajuan proposal yang disetujui tidak ditemukan.');
      return;
    }
    if (!selectedProposal || !selectedProposal.id) {
      console.error('Invalid selectedProposal:', selectedProposal);
      setSubmissionError('Proposal tidak valid. Silakan pilih ulang.');
      return;
    }
    if (selectedProposal.id !== approvedProposal.id) {
      console.error('Selected proposal does not match approved proposal:', { selectedProposal, approvedProposal });
      setSubmissionError('Proposal yang dipilih bukan proposal yang disetujui.');
      return;
    }
    try {
      setSubmitting(true);
      setSubmissionError(null);
      console.log('Calling uploadThesis with:', {
        ...uploadData,
        proposalId: selectedProposal.id,
        mahasiswaId: mahasiswa.nim,
      });
      await uploadThesis({
        ...uploadData,
        proposalId: selectedProposal.id,
        mahasiswaId: mahasiswa.nim,
      });
      handleCloseUploadModal();
      const response = await fetchThesisProposals();
      setProposals(response.data);
      const activeSubmissionResponse = await checkActiveSubmission();
      setActiveSubmission(activeSubmissionResponse.data);
      const submittedThesis = await checkSubmittedThesis();
      setHasSubmittedThesis(submittedThesis);
      const approved = response.data.find(proposal => proposal.status === 'approved');
      console.log('Approved proposal after upload:', approved);
      setApprovedProposal(approved || null);
      console.log('After upload thesis:', {
        activeSubmission: activeSubmissionResponse.data,
        hasSubmittedThesis: submittedThesis,
        approvedProposal: approved,
      });
    } catch (err) {
      console.error('Error in handleUploadThesis:', err);
      setSubmissionError('Gagal mengunggah skripsi: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setUploadData({ ...uploadData, file });
    console.log('File selected:', file ? file.name : 'No file');
  };

  const isUploadButtonDisabled = (proposal) => {
    if (!mahasiswa || !approvedProposal || !mahasiswa.nim) return true;
    if (proposal.status !== 'approved') return true; // Only show button for approved proposals
    if (hasSubmittedThesis) return true; // Disable if thesis already submitted
    // Find the first approved proposal by sorting by id or creation date
    const approvedProposals = proposals.filter(p => p.status === 'approved').sort((a, b) => a.id - b.id);
    const firstApprovedProposal = approvedProposals[0];
    // Only enable the button for the first approved proposal
    return proposal.id !== firstApprovedProposal?.id;
  };

  const isModalUploadButtonDisabled = () => {
    const isFormFilled = uploadData.title && uploadData.author && uploadData.nim && uploadData.year && uploadData.file && uploadData.abstract;
    console.log('Modal upload button state:', {
      submitting,
      isFormFilled,
      mahasiswa: !!mahasiswa,
      mahasiswaNim: mahasiswa?.nim,
      approvedProposal: !!approvedProposal,
      selectedProposal,
      uploadData,
    });
    return submitting || !isFormFilled || !mahasiswa || !mahasiswa.nim || !approvedProposal || !selectedProposal || !selectedProposal.id;
  };

  const isModalProposalButtonDisabled = () => {
    return submitting || !proposalData.lecturerId || !proposalData.topicId || !proposalData.judul || !proposalData.description;
  };

  return (
    <Card
      sx={{
        borderRadius: 2,
        bgcolor: '#050D31',
        color: '#FFFFFF',
        border: '1px solid #efbf04',
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography
            variant="h4"
            sx={{ fontFamily: '"Orbitron", sans-serif', color: '#FFFFFF' }}
          >
            Daftar Pengajuan Proposal
          </Typography>
          <Button
            variant="contained"
            onClick={handleOpenProposalModal}
            sx={{ bgcolor: '#efbf04', color: '#000000', '&:hover': { bgcolor: '#d4a503' } }}
          >
            Pilih Topik Proposal
          </Button>
        </Box>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Typography>Loading...</Typography>
          </Box>
        ) : proposals.length === 0 ? (
          <Typography
            variant="body1"
            sx={{ color: '#FFFFFF', opacity: 0.7, textAlign: 'center', mt: 2 }}
          >
            Belum ada pengajuan proposal.
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#FFFFFF' }}>Dosen</TableCell>
                  <TableCell sx={{ color: '#FFFFFF' }}>Topik</TableCell>
                  <TableCell sx={{ color: '#FFFFFF' }}>Judul</TableCell>
                  <TableCell sx={{ color: '#FFFFFF' }}>Deskripsi</TableCell>
                  <TableCell sx={{ color: '#FFFFFF' }}>Status</TableCell>
                  <TableCell sx={{ color: '#FFFFFF' }}>Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {proposals.map((proposal) => (
                  <TableRow key={proposal.id}>
                    <TableCell sx={{ color: '#FFFFFF' }}>{proposal.dosen}</TableCell>
                    <TableCell sx={{ color: '#FFFFFF' }}>{proposal.topic}</TableCell>
                    <TableCell sx={{ color: '#FFFFFF' }}>{proposal.judul || 'Belum diisi'}</TableCell>
                    <TableCell sx={{ color: '#FFFFFF' }}>{proposal.description || 'Belum diisi'}</TableCell>
                    <TableCell>
                      <Chip
                        label={proposal.status}
                        sx={{
                          bgcolor: proposal.status === 'pending' ? '#efbf04' : '#4caf50',
                          color: proposal.status === 'pending' ? '#000000' : '#FFFFFF',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {proposal.status === 'approved' && (
                        <Button
                          variant="contained"
                          onClick={() => handleOpenUploadModal(proposal)}
                          disabled={isUploadButtonDisabled(proposal)}
                          sx={{ bgcolor: '#4caf50', color: '#FFFFFF', '&:hover': { bgcolor: '#388e3c' } }}
                        >
                          Upload Skripsi
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>

      <Modal open={uploadModalOpen} onClose={handleCloseUploadModal}>
        <Box sx={modalStyle}>
          <Typography variant="h6" sx={{ mb: 3, fontFamily: '"Orbitron", sans-serif' }}>
            Upload Skripsi
          </Typography>
          {submissionError && (
            <Typography color="error" sx={{ mb: 2 }}>
              {submissionError}
            </Typography>
          )}
          <TextField
            label="Judul Proposal"
            value={uploadData.title}
            onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
            fullWidth
            sx={{ mb: 2, input: { color: '#FFFFFF' }, label: { color: '#FFFFFF' } }}
          />
          <TextField
            label="Penulis"
            value={uploadData.author}
            onChange={(e) => setUploadData({ ...uploadData, author: e.target.value })}
            fullWidth
            sx={{ mb: 2, input: { color: '#FFFFFF' }, label: { color: '#FFFFFF' } }}
          />
          <TextField
            label="NIM"
            value={uploadData.nim}
            InputProps={{ readOnly: true }}
            fullWidth
            sx={{ mb: 2, input: { color: '#FFFFFF' }, label: { color: '#FFFFFF' } }}
          />
          <TextField
            label="Tahun"
            value={uploadData.year}
            onChange={(e) => setUploadData({ ...uploadData, year: e.target.value })}
            fullWidth
            sx={{ mb: 2, input: { color: '#FFFFFF' }, label: { color: '#FFFFFF' } }}
          />
          <Button
            variant="contained"
            component="label"
            sx={{ mb: 2, bgcolor: '#efbf04', color: '#000000', '&:hover': { bgcolor: '#d4a503' } }}
          >
            Pilih File
            <input type="file" hidden accept=".pdf" onChange={handleFileChange} />
          </Button>
          {uploadData.file && (
            <Typography sx={{ mb: 2, color: '#FFFFFF' }}>{uploadData.file.name}</Typography>
          )}
          <TextField
            label="Abstrak"
            value={uploadData.abstract}
            onChange={(e) => setUploadData({ ...uploadData, abstract: e.target.value })}
            fullWidth
            multiline
            rows={4}
            sx={{ mb: 2, input: { color: '#FFFFFF' }, label: { color: '#FFFFFF' } }}
          />
          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button
              variant="contained"
              onClick={handleUploadThesis}
              disabled={isModalUploadButtonDisabled()}
              sx={{ flex: 1 }}
            >
              {submitting ? <CircularProgress size={24} /> : 'Unggah'}
            </Button>
            <Button
              variant="outlined"
              onClick={handleCloseUploadModal}
              sx={{ flex: 1, color: '#FFFFFF', borderColor: '#efbf04' }}
            >
              Batal
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal open={proposalModalOpen} onClose={handleCloseProposalModal}>
        <Box sx={modalStyle}>
          <Typography variant="h6" sx={{ mb: 3, fontFamily: '"Orbitron", sans-serif' }}>
            Pilih Topik Proposal
          </Typography>
          {submissionError && (
            <Typography color="error" sx={{ mb: 2 }}>
              {submissionError}
            </Typography>
          )}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel sx={{ color: '#FFFFFF' }}>Dosen</InputLabel>
            <Select
              value={proposalData.lecturerId}
              onChange={handleLecturerChange}
              sx={{ color: '#FFFFFF', '.MuiSvgIcon-root': { color: '#FFFFFF' } }}
            >
              {lecturers
                .filter(lecturer => !selectedLecturers.includes(lecturer.id))
                .map((lecturer) => (
                  <MenuItem key={lecturer.id} value={lecturer.id}>
                    {lecturer.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel sx={{ color: '#FFFFFF' }}>Topik</InputLabel>
            <Select
              value={proposalData.topicId}
              onChange={(e) => setProposalData({ ...proposalData, topicId: e.target.value })}
              sx={{ color: '#FFFFFF', '.MuiSvgIcon-root': { color: '#FFFFFF' } }}
              disabled={!proposalData.lecturerId}
            >
              {topics.map((topic) => (
                <MenuItem key={topic.id} value={topic.id}>
                  {topic.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Judul"
            value={proposalData.judul}
            onChange={(e) => setProposalData({ ...proposalData, judul: e.target.value })}
            fullWidth
            sx={{ mb: 2, input: { color: '#FFFFFF' }, label: { color: '#FFFFFF' } }}
          />
          <TextField
            label="Deskripsi"
            value={proposalData.description}
            onChange={(e) => setProposalData({ ...proposalData, description: e.target.value })}
            fullWidth
            multiline
            rows={4}
            sx={{ mb: 2, input: { color: '#FFFFFF' }, label: { color: '#FFFFFF' } }}
          />
          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button
              variant="contained"
              onClick={handleSubmitProposal}
              disabled={isModalProposalButtonDisabled()}
              sx={{ flex: 1 }}
            >
              {submitting ? <CircularProgress size={24} /> : 'Kirim'}
            </Button>
            <Button
              variant="outlined"
              onClick={handleCloseProposalModal}
              sx={{ flex: 1, color: '#FFFFFF', borderColor: '#efbf04' }}
            >
              Batal
            </Button>
          </Box>
        </Box>
      </Modal>
    </Card>
  );
};

export default ThesisSubmissionList;