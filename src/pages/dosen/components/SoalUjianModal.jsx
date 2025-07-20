import React, { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { useSnackbar } from 'notistack';

const SoalUjianModal = ({ open, onClose, onSave }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    pertanyaan: '',
    jenis: 'esai',
    pilihan: [],
    jawabanBenar: '',
    bobot: '',
  });
  const [newPilihan, setNewPilihan] = useState('');
  const [soalList, setSoalList] = useState([]);

  const resetForm = () => {
    setFormData({
      pertanyaan: '',
      jenis: 'esai',
      pilihan: [],
      jawabanBenar: '',
      bobot: '',
    });
    setNewPilihan('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddPilihan = () => {
    if (!newPilihan.trim()) {
      enqueueSnackbar('Pilihan tidak boleh kosong', { variant: 'warning' });
      return;
    }
    setFormData((prev) => ({
      ...prev,
      pilihan: [
        ...prev.pilihan,
        {
          type: 'paragraph',
          children: [{ text: newPilihan, type: 'text' }],
        },
      ],
    }));
    setNewPilihan('');
  };

  const handleDeletePilihan = (index) => {
    setFormData((prev) => ({
      ...prev,
      pilihan: prev.pilihan.filter((_, i) => i !== index),
    }));
  };

  const validateAndSave = () => {
    if (!formData.pertanyaan || !formData.bobot) {
      enqueueSnackbar('Pertanyaan dan bobot harus diisi', { variant: 'warning' });
      return false;
    }

    if (formData.jenis === 'multiple_choice') {
      if (formData.pilihan.length < 2) {
        enqueueSnackbar('Pilihan minimal 2 untuk soal multiple choice', { variant: 'warning' });
        return false;
      }
      if (!formData.jawabanBenar) {
        enqueueSnackbar('Jawaban benar harus dipilih', { variant: 'warning' });
        return false;
      }
    }

    if (!/^\d+$/.test(formData.bobot) || parseInt(formData.bobot) <= 0) {
      enqueueSnackbar('Bobot harus berupa angka positif', { variant: 'warning' });
      return false;
    }

    return true;
  };

  const handleAddNext = () => {
    if (!validateAndSave()) return;

    const soalData = {
      pertanyaan: formData.pertanyaan,
      jenis: formData.jenis,
      pilihan: formData.jenis === 'multiple_choice' ? formData.pilihan : null,
      jawabanBenar: formData.jenis === 'multiple_choice' ? formData.jawabanBenar : null,
      bobot: parseInt(formData.bobot),
    };

    setSoalList((prev) => [...prev, soalData]);
    enqueueSnackbar('Soal ditambahkan ke daftar, silakan tambah soal berikutnya', { variant: 'info' });
    resetForm();
  };

  const handleSubmit = () => {
    if (!validateAndSave()) return;

    const soalData = {
      pertanyaan: formData.pertanyaan,
      jenis: formData.jenis,
      pilihan: formData.jenis === 'multiple_choice' ? formData.pilihan : null,
      jawabanBenar: formData.jenis === 'multiple_choice' ? formData.jawabanBenar : null,
      bobot: parseInt(formData.bobot),
    };

    const allSoal = [...soalList, soalData];
    console.log('All soal to save:', JSON.stringify(allSoal, null, 2));
    onSave(allSoal);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 500,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: '#050D31' }}>
          Tambah Soal Ujian
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: '#050D31' }}>
          Soal yang ditambahkan: {soalList.length}
        </Typography>
        <TextField
          fullWidth
          label="Pertanyaan"
          name="pertanyaan"
          value={formData.pertanyaan}
          onChange={handleChange}
          margin="normal"
          multiline
          rows={3}
          required
        />
        <FormControl fullWidth margin="normal" required>
          <InputLabel>Jenis Soal</InputLabel>
          <Select
            name="jenis"
            value={formData.jenis}
            onChange={handleChange}
            label="Jenis Soal"
          >
            <MenuItem value="esai">Esai</MenuItem>
            <MenuItem value="multiple_choice">Pilihan Ganda</MenuItem>
          </Select>
        </FormControl>
        {formData.jenis === 'multiple_choice' && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 2 }}>
              <TextField
                fullWidth
                label="Tambah Pilihan"
                value={newPilihan}
                onChange={(e) => setNewPilihan(e.target.value)}
                margin="normal"
              />
              <IconButton
                color="primary"
                onClick={handleAddPilihan}
                sx={{ ml: 1 }}
              >
                <Add />
              </IconButton>
            </Box>
            <List>
              {formData.pilihan.map((pilihan, index) => (
                <ListItem
                  key={index}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      color="error"
                      onClick={() => handleDeletePilihan(index)}
                    >
                      <Delete />
                    </IconButton>
                  }
                >
                  <ListItemText primary={pilihan.children[0].text} />
                </ListItem>
              ))}
            </List>
            <FormControl fullWidth margin="normal">
              <InputLabel>Jawaban Benar</InputLabel>
              <Select
                name="jawabanBenar"
                value={formData.jawabanBenar}
                onChange={handleChange}
                label="Jawaban Benar"
              >
                {formData.pilihan.map((pilihan, index) => (
                  <MenuItem key={index} value={pilihan.children[0].text}>
                    {pilihan.children[0].text}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        )}
        <TextField
          fullWidth
          label="Bobot"
          name="bobot"
          type="number"
          value={formData.bobot}
          onChange={handleChange}
          margin="normal"
          required
        />
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{ color: '#050D31', borderColor: '#050D31' }}
          >
            Batal
          </Button>
          <Button
            variant="contained"
            onClick={handleAddNext}
            sx={{ bgcolor: '#0288d1', color: '#fff', '&:hover': { bgcolor: '#0277bd' } }}
          >
            Tambah Berikutnya
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{ bgcolor: '#050D31', color: '#efbf04', '&:hover': { bgcolor: '#1a237e' } }}
          >
            Simpan
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default SoalUjianModal;