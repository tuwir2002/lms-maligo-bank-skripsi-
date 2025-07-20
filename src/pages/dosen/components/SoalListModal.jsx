import React from 'react';
import {
  Modal,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
} from '@mui/material';

const SoalListModal = ({ open, onClose, soalList }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
      >
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: '#050D31' }}>
          Daftar Soal Ujian
        </Typography>
        {soalList.length === 0 ? (
          <Typography variant="body1" sx={{ color: '#050D31' }}>
            Tidak ada soal untuk ujian ini.
          </Typography>
        ) : (
          <List>
            {soalList.map((soal, index) => (
              <React.Fragment key={soal.documentId}>
                <ListItem>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {index + 1}. {soal.pertanyaan}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          <strong>Jenis:</strong> {soal.jenis === 'esai' ? 'Esai' : 'Pilihan Ganda'}
                        </Typography>
                        {soal.jenis === 'multiple_choice' && (
                          <>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              <strong>Pilihan:</strong>
                            </Typography>
                            <List dense>
                              {soal.pilihan?.map((pilihan, idx) => (
                                <ListItem key={idx}>
                                  <ListItemText primary={pilihan.children[0].text} />
                                </ListItem>
                              ))}
                            </List>
                            <Typography variant="body2">
                              <strong>Jawaban Benar:</strong> {soal.jawabanBenar}
                            </Typography>
                          </>
                        )}
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          <strong>Bobot:</strong> {soal.bobot}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                {index < soalList.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{ color: '#050D31', borderColor: '#050D31' }}
          >
            Tutup
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default SoalListModal;