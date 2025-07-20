import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
} from '@mui/material';
import { fetchLecturers, fetchTopicsByLecturer, submitThesisProposal } from '../service/bankService';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 400 },
  bgcolor: '#050D31',
  border: '1px solid #efbf04',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  color: '#FFFFFF',
};

const ThesisSubmissionModal = ({ open, onClose }) => {
  const [lecturers, setLecturers] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedLecturer, setSelectedLecturer] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadLecturers = async () => {
      try {
        setLoading(true);
        const response = await fetchLecturers();
        setLecturers(response.data);
      } catch (err) {
        setError('Gagal memuat data dosen');
      } finally {
        setLoading(false);
      }
    };
    if (open) {
      loadLecturers();
    }
  }, [open]);

  useEffect(() => {
    const loadTopics = async () => {
      if (selectedLecturer) {
        try {
          setLoading(true);
          const response = await fetchTopicsByLecturer(selectedLecturer);
          setTopics(response.data);
        } catch (err) {
          setError('Gagal memuat data topik');
        } finally {
          setLoading(false);
        }
      }
    };
    loadTopics();
  }, [selectedLecturer]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await submitThesisProposal({
        lecturerId: selectedLecturer,
        topicId: selectedTopic,
      });
      onClose();
      setSelectedLecturer('');
      setSelectedTopic('');
    } catch (err) {
      setError('Gagal mengajukan skripsi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Typography variant="h6" sx={{ mb: 3, fontFamily: '"Orbitron", sans-serif' }}>
          Pengajuan Proposal
        </Typography>
        
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel sx={{ color: '#FFFFFF' }}>Pilih Dosen</InputLabel>
          <Select
            value={selectedLecturer}
            onChange={(e) => setSelectedLecturer(e.target.value)}
            label="Pilih Dosen"
            sx={{ color: '#FFFFFF', '& .MuiSvgIcon-root': { color: '#FFFFFF' } }}
          >
            <MenuItem value="">Pilih Dosen</MenuItem>
            {lecturers.map((lecturer) => (
              <MenuItem key={lecturer.id} value={lecturer.id}>
                {lecturer.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mb: 2 }} disabled={!selectedLecturer}>
          <InputLabel sx={{ color: '#FFFFFF' }}>Pilih Topik</InputLabel>
          <Select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            label="Pilih Topik"
            sx={{ color: '#FFFFFF', '& .MuiSvgIcon-root': { color: '#FFFFFF' } }}
          >
            <MenuItem value="">Pilih Topik</MenuItem>
            {topics.map((topic) => (
              <MenuItem key={topic.id} value={topic.id}>
                {topic.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || !selectedLecturer || !selectedTopic}
            sx={{ flex: 1 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Ajukan'}
          </Button>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{ flex: 1, color: '#FFFFFF', borderColor: '#efbf04' }}
          >
            Batal
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ThesisSubmissionModal;