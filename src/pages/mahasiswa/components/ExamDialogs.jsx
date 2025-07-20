import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography } from '@mui/material';
import { Warning, CheckCircle } from '@mui/icons-material';

const ExamDialogs = ({
  submitDialogOpen,
  setSubmitDialogOpen,
  successDialogOpen,
  setSuccessDialogOpen,
  timeUpDialogOpen,
  warningDialogOpen,
  setWarningDialogOpen,
  answers,
  questions,
  handleSubmitExam,
  handleTimeUp,
  navigate,
  violationCount,
  violationHistory,
}) => {
  const handleSuccessDialogClose = () => {
    setSuccessDialogOpen(false);
    navigate('/mahasiswa/exams');
  };

  // Get the latest violation type
  const latestViolation = violationHistory[violationHistory.length - 1]?.type || 'Unknown';

  return (
    <>
      <Dialog open={submitDialogOpen} onClose={() => setSubmitDialogOpen(false)} sx={{ zIndex: 1500 }}>
        <DialogTitle sx={{ bgcolor: '#050D31', color: '#FFFFFF' }}>
          Konfirmasi Pengumpulan
        </DialogTitle>
        <DialogContent sx={{ bgcolor: '#050D31', color: '#FFFFFF' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Warning sx={{ color: '#efbf04', mr: 1, fontSize: 24 }} />
            <Typography sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              Apakah Anda yakin ingin mengumpulkan ujian? Pastikan semua jawaban telah diperiksa.
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ opacity: 0.7, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
            Soal terjawab: {Object.keys(answers).length} dari {questions.length}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#050D31' }}>
          <Button
            onClick={() => setSubmitDialogOpen(false)}
            sx={{ color: '#efbf04', fontSize: { xs: '0.8rem', sm: '0.875rem' }, zIndex: 1500 }}
          >
            Batal
          </Button>
          <Button
            onClick={() => {
              setSubmitDialogOpen(false);
              handleSubmitExam();
            }}
            sx={{
              bgcolor: '#efbf04',
              color: '#050D31',
              '&:hover': { bgcolor: '#d4a703' },
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              zIndex: 1500,
            }}
          >
            Kumpulkan
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={successDialogOpen} onClose={handleSuccessDialogClose} sx={{ zIndex: 1500 }}>
        <DialogTitle sx={{ bgcolor: '#050D31', color: '#FFFFFF' }}>
          Pengumpulan Berhasil
        </DialogTitle>
        <DialogContent sx={{ bgcolor: '#050D31', color: '#FFFFFF' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CheckCircle sx={{ color: '#efbf04', mr: 1, fontSize: { xs: 24, sm: 30 } }} />
            <Typography sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              Jawaban Anda telah berhasil disimpan. Ujian ini hanya dapat diakses satu kali, sehingga Anda tidak dapat
              mengikuti ujian ini lagi.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#050D31' }}>
          <Button
            onClick={handleSuccessDialogClose}
            sx={{
              bgcolor: '#efbf04',
              color: '#050D31',
              '&:hover': { bgcolor: '#d4a703' },
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              zIndex: 1500,
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={timeUpDialogOpen} sx={{ zIndex: 1500 }}>
        <DialogTitle sx={{ bgcolor: '#050D31', color: '#FFFFFF' }}>
          Waktu Ujian Habis
        </DialogTitle>
        <DialogContent sx={{ bgcolor: '#050D31', color: '#FFFFFF' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Warning sx={{ color: '#efbf04', mr: 1, fontSize: 24 }} />
            <Typography sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              Waktu ujian telah habis. Jawaban Anda akan otomatis dikumpulkan.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#050D31' }}>
          <Button
            onClick={handleTimeUp}
            sx={{
              bgcolor: '#efbf04',
              color: '#050D31',
              '&:hover': { bgcolor: '#d4a703' },
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              zIndex: 1500,
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={warningDialogOpen} onClose={() => setWarningDialogOpen(false)} sx={{ zIndex: 1500 }}>
        <DialogTitle sx={{ bgcolor: '#050D31', color: '#FFFFFF' }}>
          Peringatan Kecurangan
        </DialogTitle>
        <DialogContent sx={{ bgcolor: '#050D31', color: '#FFFFFF' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Warning sx={{ color: '#efbf04', mr: 1, fontSize: 24 }} />
            <Typography sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              Tindakan tidak diizinkan terdeteksi: {latestViolation}. Ini adalah peringatan ke-{violationCount}. Jika
              Anda mencapai 3 pelanggaran, ujian Anda akan otomatis dikumpulkan.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#050D31' }}>
          <Button
            onClick={() => setWarningDialogOpen(false)}
            sx={{
              bgcolor: '#efbf04',
              color: '#050D31',
              '&:hover': { bgcolor: '#d4a703' },
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              zIndex: 1500,
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ExamDialogs;