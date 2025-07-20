import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Button,
  Grid,
  IconButton,
  Collapse,
  Tooltip,
  Divider,
  Chip,
  Fade,
} from '@mui/material';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import QuizIcon from '@mui/icons-material/Quiz';
import TambahMahasiswa from './TambahMahasiswa';
import LihatMahasiswa from './LihatMahasiswa';
import AddPertemuanModal from './AddPertemuanModal';
import AddMateriModal from './AddMateriModal';
import AddKuisModal from './AddKuisModal';
import EditMatakuliahModal from './EditMatakuliahModal';
import EditPertemuanModal from './EditPertemuanModal';
import HapusPertemuanModal from './HapusPertemuanModal';
import HapusMateriModal from './HapusMateriModal';
import HapusKuisModal from './HapusKuisModal';
import { useSnackbar } from 'notistack';

const truncateDeskripsi = (text, maxLength = 100) => {
  if (!text) return 'Tidak ada deskripsi';
  if (text.length <= maxLength) return text;
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
};

const renderTiptapContent = (content) => {
  if (!content || !Array.isArray(content)) {
    return <Typography sx={{ color: '#64748b', fontStyle: 'italic', fontSize: '0.875rem' }}>Tidak ada isi teks</Typography>;
  }

  return content.map((node, index) => {
    switch (node.type) {
      case 'paragraph':
        return (
          <Typography
            key={index}
            variant="body2"
            sx={{ color: '#1a202c', mb: 1, fontSize: '0.875rem', lineHeight: 1.6 }}
          >
            {node.content
              ? node.content.map((child, childIndex) => {
                  if (child.type === 'text') {
                    let style = {};
                    let element = 'span';
                    const props = {};

                    if (child.marks) {
                      child.marks.forEach((mark) => {
                        if (mark.type === 'bold') style.fontWeight = 600;
                        if (mark.type === 'italic') style.fontStyle = 'italic';
                        if (mark.type === 'link') {
                          element = 'a';
                          props.href = mark.attrs.href;
                          props.target = mark.attrs.target || '_blank';
                          props.rel = mark.attrs.rel || 'noopener noreferrer';
                          style.color = '#4db6ac';
                          style.textDecoration = 'underline';
                        }
                      });
                    }

                    return (
                      <React.Fragment key={childIndex}>
                        {React.createElement(element, { ...props, style }, child.text)}
                      </React.Fragment>
                    );
                  } else if (child.type === 'hardBreak') {
                    return <br key={childIndex} />;
                  } else if (child.type === 'image') {
                    return (
                      <img
                        key={childIndex}
                        src={child.attrs.src}
                        alt={child.attrs.alt || 'Materi Image'}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '200px',
                          objectFit: 'contain',
                          borderRadius: '8px',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                          margin: '8px 0',
                        }}
                      />
                    );
                  }
                  return null;
                })
              : 'Tidak ada isi teks'}
          </Typography>
        );

      case 'bulletList':
        return (
          <Box
            key={index}
            component="ul"
            sx={{ pl: 4, color: '#1a202c', mb: 1, fontSize: '0.875rem', lineHeight: 1.6 }}
          >
            {node.content?.map((item, itemIndex) => (
              <Typography
                key={itemIndex}
                component="li"
                variant="body2"
                sx={{ color: '#1a202c', mb: 0.5 }}
              >
                {item.content?.map((child, childIndex) =>
                  child.type === 'text' ? child.text : renderTiptapContent([child])
                )}
              </Typography>
            ))}
          </Box>
        );

      case 'orderedList':
        return (
          <Box
            key={index}
            component="ol"
            sx={{ pl: 4, color: '#1a202c', mb: 1, fontSize: '0.875rem', lineHeight: 1.6 }}
          >
            {node.content?.map((item, itemIndex) => (
              <Typography
                key={itemIndex}
                component="li"
                variant="body2"
                sx={{ color: '#1a202c', mb: 0.5 }}
              >
                {item.content?.map((child, childIndex) =>
                  child.type === 'text' ? child.text : renderTiptapContent([child])
                )}
              </Typography>
            ))}
          </Box>
        );

      case 'image':
        return (
          <img
            key={index}
            src={node.attrs.src}
            alt={node.attrs.alt || 'Materi Image'}
            style={{
              maxWidth: '100%',
              maxHeight: '200px',
              objectFit: 'contain',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              margin: '8px 0',
            }}
          />
        );

      default:
        return null;
    }
  });
};

const CourseAccordion = ({ matakuliahList, setSelectedMatakuliah, refreshMatakuliah }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [openInviteModal, setOpenInviteModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openPertemuanModal, setOpenPertemuanModal] = useState(false);
  const [openMateriModal, setOpenMateriModal] = useState(false);
  const [openKuisModal, setOpenKuisModal] = useState(false);
  const [openEditMatakuliahModal, setOpenEditMatakuliahModal] = useState(false);
  const [openEditPertemuanModal, setOpenEditPertemuanModal] = useState(false);
  const [openHapusPertemuanModal, setOpenHapusPertemuanModal] = useState(false);
  const [openHapusMateriModal, setOpenHapusMateriModal] = useState(false);
  const [openHapusKuisModal, setOpenHapusKuisModal] = useState(false);
  const [selectedMatakuliahForModal, setSelectedMatakuliahForModal] = useState(null);
  const [selectedPertemuan, setSelectedPertemuan] = useState(null);
  const [selectedMateri, setSelectedMateri] = useState(null);
  const [selectedKuis, setSelectedKuis] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);
  const [pendingMatakuliah, setPendingMatakuliah] = useState(null);

  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const userNip = user?.username || null;

  const filteredMatakuliah = matakuliahList.filter((matakuliah) =>
    matakuliah.dosens?.some((dosen) => dosen.nip === userNip)
  );

  const handleOpenInviteModal = (matakuliah) => {
    if (!matakuliah || !matakuliah.id || !matakuliah.program_studi?.id || !matakuliah.semester) {
      console.error('Invalid matakuliah:', matakuliah);
      enqueueSnackbar('Data mata kuliah tidak valid', { variant: 'error' });
      return;
    }
    setPendingMatakuliah({
      id: matakuliah.id,
      nama: matakuliah.nama,
      program_studi: {
        id: matakuliah.program_studi.id,
        nama: matakuliah.program_studi.nama,
      },
      semester: matakuliah.semester,
    });
  };

  const handleOpenViewModal = (matakuliah) => {
    if (!matakuliah || !matakuliah.id) {
      console.error('Invalid matakuliah:', matakuliah);
      enqueueSnackbar('Data mata kuliah tidak valid', { variant: 'error' });
      return;
    }
    setSelectedMatakuliahForModal({
      id: matakuliah.id,
      nama: matakuliah.nama,
    });
    setOpenViewModal(true);
  };

  const handleOpenKuisModal = (matakuliah, pertemuan) => {
    if (!matakuliah || !matakuliah.id || !pertemuan || !pertemuan.id) {
      console.error('Invalid matakuliah or pertemuan:', { matakuliah, pertemuan });
      enqueueSnackbar('Data mata kuliah atau pertemuan tidak valid', { variant: 'error' });
      return;
    }
    setSelectedMatakuliahForModal(matakuliah);
    setSelectedPertemuan(pertemuan);
    setOpenKuisModal(true);
  };

  const handleOpenHapusKuisModal = (matakuliah, pertemuan, kuis) => {
    if (!matakuliah || !matakuliah.id || !pertemuan || !pertemuan.id || !kuis || !kuis.documentId) {
      console.error('Invalid matakuliah, pertemuan, or kuis:', { matakuliah, pertemuan, kuis });
      enqueueSnackbar('Data mata kuliah, pertemuan, atau kuis tidak valid', { variant: 'error' });
      return;
    }
    setSelectedMatakuliahForModal(matakuliah);
    setSelectedPertemuan(pertemuan);
    setSelectedKuis(kuis);
    setOpenHapusKuisModal(true);
  };

  useEffect(() => {
    if (pendingMatakuliah) {
      setSelectedMatakuliahForModal(pendingMatakuliah);
      setOpenInviteModal(true);
      setPendingMatakuliah(null);
    }
  }, [pendingMatakuliah]);

  const handleCloseInviteModal = () => {
    setOpenInviteModal(false);
    setSelectedMatakuliahForModal(null);
  };

  const handleCloseViewModal = () => {
    setOpenViewModal(false);
    setSelectedMatakuliahForModal(null);
  };

  const handleOpenPertemuanModal = (matakuliah) => {
    if (!matakuliah || !matakuliah.id) {
      console.error('Invalid matakuliah:', matakuliah);
      enqueueSnackbar('Data mata kuliah tidak valid', { variant: 'error' });
      return;
    }
    setSelectedMatakuliahForModal(matakuliah);
    setOpenPertemuanModal(true);
  };

  const handleOpenMateriModal = (matakuliah, pertemuan) => {
    if (!matakuliah || !matakuliah.id || !pertemuan || !pertemuan.id) {
      console.error('Invalid matakuliah or pertemuan:', { matakuliah, pertemuan });
      enqueueSnackbar('Data mata kuliah atau pertemuan tidak valid', { variant: 'error' });
      return;
    }
    setSelectedMatakuliahForModal(matakuliah);
    setSelectedPertemuan(pertemuan);
    setOpenMateriModal(true);
  };

  const handleOpenEditMatakuliahModal = (matakuliah) => {
    if (!matakuliah || !matakuliah.documentId) {
      console.error('Invalid matakuliah:', matakuliah);
      enqueueSnackbar('Data mata kuliah tidak valid', { variant: 'error' });
      return;
    }
    setSelectedMatakuliahForModal(matakuliah);
    setOpenEditMatakuliahModal(true);
  };

  const handleOpenEditPertemuanModal = (matakuliah, pertemuan) => {
    if (!matakuliah || !matakuliah.id || !pertemuan || !pertemuan.documentId) {
      console.error('Invalid matakuliah or pertemuan:', { matakuliah, pertemuan });
      enqueueSnackbar('Data mata kuliah atau pertemuan tidak valid', { variant: 'error' });
      return;
    }
    setSelectedMatakuliahForModal(matakuliah);
    setSelectedPertemuan(pertemuan);
    setOpenEditPertemuanModal(true);
  };

  const handleOpenHapusPertemuanModal = (matakuliah, pertemuan) => {
    if (!matakuliah || !matakuliah.id || !pertemuan || !pertemuan.documentId) {
      console.error('Invalid matakuliah or pertemuan:', { matakuliah, pertemuan });
      enqueueSnackbar('Data mata kuliah atau pertemuan tidak valid', { variant: 'error' });
      return;
    }
    setSelectedMatakuliahForModal(matakuliah);
    setSelectedPertemuan(pertemuan);
    setOpenHapusPertemuanModal(true);
  };

  const handleOpenHapusMateriModal = (matakuliah, pertemuan, materi) => {
    if (!matakuliah || !matakuliah.id || !pertemuan || !pertemuan.id || !materi || !materi.documentId) {
      console.error('Invalid matakuliah, pertemuan, or materi:', { matakuliah, pertemuan, materi });
      enqueueSnackbar('Data mata kuliah, pertemuan, atau materi tidak valid', { variant: 'error' });
      return;
    }
    setSelectedMatakuliahForModal(matakuliah);
    setSelectedPertemuan(pertemuan);
    setSelectedMateri(materi);
    setOpenHapusMateriModal(true);
  };

  const handleExpandCard = (matakuliahId) => {
    setExpandedCard(expandedCard === matakuliahId ? null : matakuliahId);
  };

  return (
    <Box sx={{ maxWidth: '100%', mx: 'auto', mt: 2, px: { xs: 1, sm: 2 } }}>
      {filteredMatakuliah.length === 0 ? (
        <Fade in timeout={600}>
          <Box
            sx={{
              textAlign: 'center',
              py: 6,
              bgcolor: '#ffffff',
              borderRadius: 3,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              border: '1px solid #e0e7ff',
            }}
          >
            <Typography
              sx={{
                color: '#1a202c',
                fontWeight: 500,
                fontSize: { xs: '1.25rem', md: '1.5rem' },
              }}
            >
              Tidak ada mata kuliah yang tersedia saat ini.
            </Typography>
            <Typography
              sx={{
                color: '#64748b',
                mt: 1,
                fontSize: '0.875rem',
                maxWidth: '600px',
                mx: 'auto',
              }}
            >
              Tambahkan mata kuliah baru untuk mulai mengelola materi dan pertemuan.
            </Typography>
          </Box>
        </Fade>
      ) : (
        <Grid container spacing={2}>
          {filteredMatakuliah.map((matakuliah) => (
            <Grid item xs={12} key={matakuliah.id}>
              <Fade in timeout={600}>
                <Card
                  onClick={() => setSelectedMatakuliah(matakuliah)}
                  sx={{
                    bgcolor: '#ffffff',
                    border: '1px solid #e0e7ff',
                    borderRadius: 3,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                      transform: 'translateY(-4px)',
                    },
                    overflow: 'hidden',
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{
                            color: '#050D31',
                            fontWeight: 600,
                            fontSize: { xs: '1.25rem', md: '1.5rem' },
                          }}
                        >
                          {matakuliah.nama}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
                          <Chip
                            label={`Kode: ${matakuliah.kode}`}
                            size="small"
                            sx={{
                              bgcolor: '#e0e7ff',
                              color: '#050D31',
                              fontWeight: 500,
                              fontSize: '0.75rem',
                            }}
                          />
                          <Chip
                            label={`Semester: ${matakuliah.semester}`}
                            size="small"
                            sx={{
                              bgcolor: '#e0e7ff',
                              color: '#050D31',
                              fontWeight: 500,
                              fontSize: '0.75rem',
                            }}
                          />
                          <Chip
                            label={`${matakuliah.sks} SKS`}
                            size="small"
                            sx={{
                              bgcolor: '#e0e7ff',
                              color: '#050D31',
                              fontWeight: 500,
                              fontSize: '0.75rem',
                            }}
                          />
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Edit Mata Kuliah">
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditMatakuliahModal(matakuliah);
                            }}
                            sx={{
                              color: '#4db6ac',
                              '&:hover': { bgcolor: 'rgba(77, 182, 172, 0.1)' },
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Lihat Mahasiswa">
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenViewModal(matakuliah);
                            }}
                            sx={{
                              color: '#4db6ac',
                              '&:hover': { bgcolor: 'rgba(77, 182, 172, 0.1)' },
                            }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Undang Mahasiswa">
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenInviteModal(matakuliah);
                            }}
                            sx={{
                              color: '#4db6ac',
                              '&:hover': { bgcolor: 'rgba(77, 182, 172, 0.1)' },
                            }}
                          >
                            <GroupAddIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#64748b',
                        fontSize: '0.875rem',
                        mb: 2,
                      }}
                    >
                      Jumlah Mahasiswa: {matakuliah.undangan_mahasiswas?.length || 0} | Jumlah Pertemuan: {matakuliah.pertemuans?.length || 0}
                    </Typography>
                    <Collapse in={expandedCard === matakuliah.id} timeout={300}>
                      <Divider sx={{ my: 2, borderColor: '#e0e7ff' }} />
                      <Typography
                        variant="subtitle1"
                        sx={{
                          color: '#1a202c',
                          fontWeight: 500,
                          mb: 2,
                          fontSize: '1.125rem',
                        }}
                      >
                        Daftar Pertemuan
                      </Typography>
                      {matakuliah.pertemuans?.length === 0 ? (
                        <Typography
                          sx={{
                            color: '#64748b',
                            fontStyle: 'italic',
                            fontSize: '0.875rem',
                            textAlign: 'center',
                            py: 2,
                          }}
                        >
                          Belum ada pertemuan yang ditambahkan.
                        </Typography>
                      ) : (
                        <List sx={{ mt: 1 }}>
                          {matakuliah.pertemuans.map((pertemuan) => (
                            <ListItem
                              key={pertemuan.id}
                              sx={{
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                bgcolor: '#f8fafc',
                                border: '1px solid #e0e7ff',
                                borderRadius: 2,
                                mb: 2,
                                p: 2,
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  bgcolor: '#f1f5f9',
                                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                                },
                              }}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mb: 1 }}>
                                <ListItemText
                                  primary={`Pertemuan ${pertemuan.pertemuanKe}: ${pertemuan.topik}`}
                                  secondary={
                                    pertemuan.tanggal
                                      ? `Tanggal: ${new Date(pertemuan.tanggal).toLocaleDateString('id-ID', {
                                          day: 'numeric',
                                          month: 'long',
                                          year: 'numeric',
                                        })}`
                                      : 'Tanggal: Belum ditentukan'
                                  }
                                  primaryTypographyProps={{
                                    color: '#1a202c',
                                    fontWeight: 500,
                                    fontSize: '1rem',
                                  }}
                                  secondaryTypographyProps={{
                                    color: '#64748b',
                                    fontSize: '0.75rem',
                                  }}
                                />
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Tooltip title="Edit Pertemuan">
                                    <IconButton
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenEditPertemuanModal(matakuliah, pertemuan);
                                      }}
                                      sx={{
                                        color: '#4db6ac',
                                        '&:hover': { bgcolor: 'rgba(77, 182, 172, 0.1)' },
                                      }}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Tambah Materi">
                                    <IconButton
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenMateriModal(matakuliah, pertemuan);
                                      }}
                                      sx={{
                                        color: '#4db6ac',
                                        '&:hover': { bgcolor: 'rgba(77, 182, 172, 0.1)' },
                                      }}
                                    >
                                      <AddIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Tambah Kuis">
                                    <IconButton
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenKuisModal(matakuliah, pertemuan);
                                      }}
                                      sx={{
                                        color: '#4db6ac',
                                        '&:hover': { bgcolor: 'rgba(77, 182, 172, 0.1)' },
                                      }}
                                    >
                                      <QuizIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Hapus Pertemuan">
                                    <IconButton
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenHapusPertemuanModal(matakuliah, pertemuan);
                                      }}
                                      sx={{
                                        color: '#d32f2f',
                                        '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.1)' },
                                      }}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </Box>
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  color: '#1a202c',
                                  mt: 1,
                                  mb: 1,
                                  fontWeight: 500,
                                  fontSize: '0.875rem',
                                }}
                              >
                                Materi:
                              </Typography>
                              {!pertemuan.materis || pertemuan.materis.length === 0 ? (
                                <Typography
                                  sx={{
                                    color: '#64748b',
                                    fontStyle: 'italic',
                                    ml: 2,
                                    fontSize: '0.75rem',
                                  }}
                                >
                                  Belum ada materi yang ditambahkan.
                                </Typography>
                              ) : (
                                pertemuan.materis.map((materi) => (
                                  <Box
                                    key={materi.id}
                                    sx={{
                                      width: '95%',
                                      mb: 1,
                                      bgcolor: '#ffffff',
                                      p: 2,
                                      borderRadius: 2,
                                      border: '1px solid #e0e7ff',
                                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                                    }}
                                  >
                                    <Grid container spacing={2}>
                                      <Grid item xs={12} md={8}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                          <Typography
                                            variant="body1"
                                            sx={{
                                              color: '#1a202c',
                                              fontWeight: 600,
                                              fontSize: '0.875rem',
                                            }}
                                          >
                                            {materi.judul}
                                          </Typography>
                                          <Tooltip title="Hapus Materi">
                                            <IconButton
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenHapusMateriModal(matakuliah, pertemuan, materi);
                                              }}
                                              sx={{
                                                color: '#d32f2f',
                                                '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.1)' },
                                              }}
                                            >
                                              <DeleteIcon fontSize="small" />
                                            </IconButton>
                                          </Tooltip>
                                        </Box>
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            color: '#64748b',
                                            mb: 1,
                                            fontSize: '0.75rem',
                                          }}
                                        >
                                          {truncateDeskripsi(materi.deskripsi?.[0]?.children?.[0]?.text)}
                                        </Typography>
                                        {materi.isiTeks?.content && (
                                          <>
                                            <Typography
                                              variant="subtitle2"
                                              sx={{
                                                color: '#1a202c',
                                                fontWeight: 500,
                                                mb: 1,
                                                fontSize: '0.75rem',
                                              }}
                                            >
                                              Isi Materi:
                                            </Typography>
                                            {renderTiptapContent(materi.isiTeks?.content)}
                                          </>
                                        )}
                                        {materi.fileUrl && materi.fileUrl.length > 0 && (
                                          <Box sx={{ mt: 1 }}>
                                            <Typography
                                              variant="subtitle2"
                                              sx={{
                                                color: '#1a202c',
                                                fontWeight: 500,
                                                mb: 1,
                                                fontSize: '0.75rem',
                                              }}
                                            >
                                              Gambar:
                                            </Typography>
                                            <img
                                              src={`http://localhost:1337${materi.fileUrl[0].url}`}
                                              alt={materi.fileUrl[0].name || 'Materi Image'}
                                              style={{
                                                maxWidth: '100%',
                                                maxHeight: '150px',
                                                objectFit: 'contain',
                                                borderRadius: '8px',
                                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                              }}
                                            />
                                          </Box>
                                        )}
                                        {materi.documentUrl && materi.documentUrl.length > 0 && (
                                          <Box sx={{ mt: 1 }}>
                                            <Button
                                              variant="outlined"
                                              href={`http://localhost:1337${materi.documentUrl[0].url}`}
                                              download={materi.documentUrl[0].name}
                                              size="small"
                                              sx={{
                                                textTransform: 'none',
                                                color: '#4db6ac',
                                                borderColor: '#4db6ac',
                                                fontSize: '0.75rem',
                                                '&:hover': {
                                                  bgcolor: 'rgba(77, 182, 172, 0.1)',
                                                  borderColor: '#4db6ac',
                                                },
                                              }}
                                            >
                                              Unduh {materi.documentUrl[0].name}
                                            </Button>
                                          </Box>
                                        )}
                                      </Grid>
                                      <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        {materi.videoYoutubeUrl ? (
                                          <iframe
                                            width="100%"
                                            height="120"
                                            src={materi.videoYoutubeUrl.replace('youtu.be/', 'www.youtube.com/embed/').split('?')[0]}
                                            title={materi.judul}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            style={{
                                              borderRadius: '8px',
                                              maxWidth: '200px',
                                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                            }}
                                          />
                                        ) : (
                                          <Typography
                                            sx={{
                                              color: '#64748b',
                                              textAlign: 'center',
                                              fontStyle: 'italic',
                                              fontSize: '0.75rem',
                                            }}
                                          >
                                            Tidak ada video tersedia.
                                          </Typography>
                                        )}
                                      </Grid>
                                    </Grid>
                                  </Box>
                                ))
                              )}
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  color: '#1a202c',
                                  mt: 2,
                                  mb: 1,
                                  fontWeight: 500,
                                  fontSize: '0.875rem',
                                }}
                              >
                                Kuis:
                              </Typography>
                              {!pertemuan.kuises || pertemuan.kuises.length === 0 ? (
                                <Typography
                                  sx={{
                                    color: '#64748b',
                                    fontStyle: 'italic',
                                    ml: 2,
                                    fontSize: '0.75rem',
                                  }}
                                >
                                  Belum ada kuis yang ditambahkan.
                                </Typography>
                              ) : (
                                pertemuan.kuises.map((kuis) => (
                                  <Box
                                    key={kuis.id}
                                    sx={{
                                      width: '95%',
                                      mb: 1,
                                      bgcolor: '#ffffff',
                                      p: 2,
                                      borderRadius: 2,
                                      border: '1px solid #e0e7ff',
                                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                                    }}
                                  >
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                      <Typography
                                        variant="body1"
                                        sx={{
                                          color: '#1a202c',
                                          fontWeight: 600,
                                          fontSize: '0.875rem',
                                        }}
                                      >
                                        Kuis: {kuis.jenis.charAt(0).toUpperCase() + kuis.jenis.slice(1).replace('_', ' ')}
                                      </Typography>
                                      <Tooltip title="Hapus Kuis">
                                        <IconButton
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenHapusKuisModal(matakuliah, pertemuan, kuis);
                                          }}
                                          sx={{
                                            color: '#d32f2f',
                                            '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.1)' },
                                          }}
                                        >
                                          <DeleteIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    </Box>
                                    {kuis.instruksi && (
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          color: '#64748b',
                                          mb: 1,
                                          fontSize: '0.75rem',
                                        }}
                                      >
                                        Instruksi: {truncateDeskripsi(kuis.instruksi?.[0]?.children?.[0]?.text)}
                                      </Typography>
                                    )}
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        color: '#64748b',
                                        fontSize: '0.75rem',
                                      }}
                                    >
                                      Waktu: {new Date(kuis.waktuMulai).toLocaleString('id-ID')} -{' '}
                                      {new Date(kuis.waktuSelesai).toLocaleString('id-ID')}
                                    </Typography>
                                    {kuis.timer && (
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          color: '#64748b',
                                          fontSize: '0.75rem',
                                        }}
                                      >
                                        Durasi: {kuis.timer}
                                      </Typography>
                                    )}
                                  </Box>
                                ))
                              )}
                            </ListItem>
                          ))}
                        </List>
                      )}
                    </Collapse>
                  </CardContent>
                  <CardActions sx={{ p: 2, bgcolor: '#f8fafc', justifyContent: 'space-between', borderRadius: '0 0 12px 12px' }}>
                    <Button
                      variant="outlined"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExpandCard(matakuliah.id);
                      }}
                      endIcon={<ExpandMoreIcon sx={{ transform: expandedCard === matakuliah.id ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 500,
                        borderColor: '#4db6ac',
                        color: '#4db6ac',
                        px: 3,
                        py: 1,
                        fontSize: '0.875rem',
                        borderRadius: 2,
                        '&:hover': {
                          bgcolor: 'rgba(77, 182, 172, 0.1)',
                          borderColor: '#4db6ac',
                        },
                      }}
                    >
                      {expandedCard === matakuliah.id ? 'Sembunyikan Detail' : 'Lihat Detail'}
                    </Button>
                    <Button
                      variant="contained"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenPertemuanModal(matakuliah);
                      }}
                      startIcon={<AddIcon />}
                      sx={{
                        bgcolor: '#050D31',
                        color: '#ffffff',
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3,
                        py: 1,
                        fontSize: '0.875rem',
                        borderRadius: 2,
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: '#0A1A5C',
                          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      Tambah Pertemuan
                    </Button>
                  </CardActions>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>
      )}

      {selectedMatakuliahForModal && (
        <TambahMahasiswa
          open={openInviteModal}
          handleClose={handleCloseInviteModal}
          matakuliah={selectedMatakuliahForModal}
          refreshMatakuliah={refreshMatakuliah}
        />
      )}
      {selectedMatakuliahForModal && (
        <LihatMahasiswa
          open={openViewModal}
          handleClose={handleCloseViewModal}
          matakuliah={selectedMatakuliahForModal}
        />
      )}
      <AddPertemuanModal
        open={openPertemuanModal}
        onClose={() => {
          setOpenPertemuanModal(false);
          setSelectedMatakuliahForModal(null);
        }}
        matakuliah={selectedMatakuliahForModal}
        refreshMatakuliah={refreshMatakuliah}
      />
      <AddMateriModal
        open={openMateriModal}
        onClose={() => {
          setOpenMateriModal(false);
          setSelectedMatakuliahForModal(null);
          setSelectedPertemuan(null);
        }}
        matakuliah={selectedMatakuliahForModal}
        pertemuan={selectedPertemuan}
        refreshMatakuliah={refreshMatakuliah}
      />
      <AddKuisModal
        open={openKuisModal}
        onClose={() => {
          setOpenKuisModal(false);
          setSelectedMatakuliahForModal(null);
          setSelectedPertemuan(null);
        }}
        matakuliah={selectedMatakuliahForModal}
        pertemuan={selectedPertemuan}
        refreshMatakuliah={refreshMatakuliah}
      />
      <EditMatakuliahModal
        open={openEditMatakuliahModal}
        onClose={() => {
          setOpenEditMatakuliahModal(false);
          setSelectedMatakuliahForModal(null);
        }}
        matakuliah={selectedMatakuliahForModal}
        refreshMatakuliah={refreshMatakuliah}
      />
      <EditPertemuanModal
        open={openEditPertemuanModal}
        onClose={() => {
          setOpenEditPertemuanModal(false);
          setSelectedMatakuliahForModal(null);
          setSelectedPertemuan(null);
        }}
        matakuliah={selectedMatakuliahForModal}
        pertemuan={selectedPertemuan}
        refreshMatakuliah={refreshMatakuliah}
      />
      <HapusPertemuanModal
        open={openHapusPertemuanModal}
        onClose={() => {
          setOpenHapusPertemuanModal(false);
          setSelectedMatakuliahForModal(null);
          setSelectedPertemuan(null);
        }}
        matakuliah={selectedMatakuliahForModal}
        pertemuan={selectedPertemuan}
        refreshMatakuliah={refreshMatakuliah}
      />
      <HapusMateriModal
        open={openHapusMateriModal}
        onClose={() => {
          setOpenHapusMateriModal(false);
          setSelectedMatakuliahForModal(null);
          setSelectedPertemuan(null);
          setSelectedMateri(null);
        }}
        matakuliah={selectedMatakuliahForModal}
        pertemuan={selectedPertemuan}
        materi={selectedMateri}
        refreshMatakuliah={refreshMatakuliah}
      />
      <HapusKuisModal
        open={openHapusKuisModal}
        onClose={() => {
          setOpenHapusKuisModal(false);
          setSelectedMatakuliahForModal(null);
          setSelectedPertemuan(null);
          setSelectedKuis(null);
        }}
        matakuliah={selectedMatakuliahForModal}
        pertemuan={selectedPertemuan}
        kuis={selectedKuis}
        refreshMatakuliah={refreshMatakuliah}
      />
    </Box>
  );
};

export default CourseAccordion;