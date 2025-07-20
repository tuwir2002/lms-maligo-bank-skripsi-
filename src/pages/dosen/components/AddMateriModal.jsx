import React, { useState, useEffect } from 'react';
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
  Grid,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  School as SchoolIcon,
  Event as EventIcon,
  Title as TitleIcon,
  Description as DescriptionIcon,
  YouTube as YouTubeIcon,
  Image as ImageIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  FormatBold as FormatBoldIcon,
  FormatItalic as FormatItalicIcon,
  FormatListBulleted as FormatListBulletedIcon,
  FormatListNumbered as FormatListNumberedIcon,
  AddPhotoAlternate as AddPhotoAlternateIcon,
  AttachFile as AttachFileIcon,
  Link as LinkIcon, // Added LinkIcon import
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import LoadingScreen from '../../../routes/LoadingScreen';
import { createMateri, getPertemuanList, getMateriList, uploadFile } from '../utils/CourseService';

// Professional color palette
const theme = {
  primary: '#1976d2',
  secondary: '#f5f5f5',
  accent: '#ffd700',
  text: '#1a202c',
  border: '#e0e0e0',
  error: '#d32f2f',
};

// Convert plain text to Strapi rich text JSON
const textToStrapiJson = (text) => {
  if (!text) {
    return [{ type: 'paragraph', children: [{ type: 'text', text: '' }] }];
  }
  return [
    {
      type: 'paragraph',
      children: [{ type: 'text', text }],
    },
  ];
};

// Updated modal style
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 900,
  maxWidth: '95vw',
  bgcolor: '#ffffff',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  p: 4,
  borderRadius: 3,
  border: `1px solid ${theme.border}`,
  maxHeight: '90vh',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
};

const AddMateriModal = ({ open, onClose, matakuliah, pertemuan, refreshMatakuliah }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    matakuliah: matakuliah?.id || '',
    pertemuan: pertemuan?.id || '',
    judul: '',
    deskripsi: '',
    videoYoutubeUrl: '',
    isiTeks: { type: 'doc', content: [] },
    image: null,
    document: null,
  });
  const [pertemuanList, setPertemuanList] = useState([]);
  const [materiList, setMateriList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }), // Disable headings for simplicity
      Link.configure({ openOnClick: false }),
      Image.configure({
        inline: true,
        allowBase64: false,
      }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      setFormData((prev) => ({
        ...prev,
        isiTeks: editor.getJSON(),
      }));
    },
  });

  useEffect(() => {
    const fetchPertemuanAndMateri = async () => {
      if (matakuliah?.id) {
        setLoading(true);
        try {
          const [pertemuanRes, materiRes] = await Promise.all([
            getPertemuanList(matakuliah.id),
            getMateriList(matakuliah.id),
          ]);
          setPertemuanList(pertemuanRes.data || []);
          setMateriList(materiRes.data || []);
          setFormData((prev) => ({
            ...prev,
            matakuliah: matakuliah.id,
            pertemuan: pertemuan?.id || '',
          }));
        } catch (error) {
          enqueueSnackbar('Gagal mengambil data pertemuan atau materi', { variant: 'error' });
        } finally {
          setLoading(false);
        }
      } else {
        setPertemuanList([]);
        setMateriList([]);
        setFormData((prev) => ({ ...prev, pertemuan: '' }));
      }
    };
    fetchPertemuanAndMateri();
  }, [matakuliah, pertemuan, enqueueSnackbar]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'image') {
      if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        setErrors((prev) => ({ ...prev, image: 'Hanya file JPEG, PNG, atau GIF yang diizinkan' }));
        return;
      }
      setFormData((prev) => ({ ...prev, image: file }));
      setErrors((prev) => ({ ...prev, image: '' }));
    } else if (type === 'document') {
      if (
        ![
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ].includes(file.type)
      ) {
        setErrors((prev) => ({
          ...prev,
          document: 'Hanya file PDF, DOCX, XLSX yang diizinkan',
        }));
        return;
      }
      setFormData((prev) => ({ ...prev, document: file }));
      setErrors((prev) => ({ ...prev, document: '' }));
    }
  };

  const handleInsertImage = () => {
    if (!editor) return;
    if (imageUrl && isValidImageUrl(imageUrl)) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl('');
      setImageDialogOpen(false);
    } else {
      enqueueSnackbar('Masukkan URL gambar yang valid (misal: https://example.com/image.jpg)', {
        variant: 'error',
      });
    }
  };

  const isValidImageUrl = (url) => {
    return url.match(/\.(jpg|jpeg|png|gif|webp)$/i) && url.startsWith('http');
  };

  const handleLink = () => {
    if (!editor) return;
    const url = window.prompt('Masukkan URL:');
    if (url) {
      editor.chain().focus().toggleLink({ href: url }).run();
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.matakuliah) newErrors.matakuliah = 'Mata kuliah wajib dipilih';
    if (!formData.pertemuan) newErrors.pertemuan = 'Pertemuan wajib dipilih';
    if (!formData.judul) newErrors.judul = 'Judul wajib diisi';
    if (formData.judul.length > 255) newErrors.judul = 'Judul tidak boleh lebih dari 255 karakter';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      enqueueSnackbar('Harap lengkapi semua field wajib', { variant: 'warning' });
      return;
    }
    setLoading(true);
    try {
      let imageId = null;
      let documentId = null;

      if (formData.image) {
        const uploadResponse = await uploadFile(formData.image);
        console.log('Image upload response:', uploadResponse);
        if (!uploadResponse[0]?.id) {
          throw new Error('Failed to upload image: No ID returned');
        }
        imageId = uploadResponse[0].id;
      }

      if (formData.document) {
        const uploadResponse = await uploadFile(formData.document);
        console.log('Document upload response:', uploadResponse);
        if (!uploadResponse[0]?.id) {
          throw new Error('Failed to upload document: No ID returned');
        }
        documentId = uploadResponse[0].id;
      }

      const submitData = {
        judul: formData.judul,
        deskripsi: textToStrapiJson(formData.deskripsi),
        videoYoutubeUrl: formData.videoYoutubeUrl || undefined,
        isiTeks: formData.isiTeks,
        pertemuan: { connect: [{ id: parseInt(formData.pertemuan) }] },
        fileUrl: imageId ? [imageId] : undefined,
        documentUrl: documentId ? [documentId] : undefined,
      };

      console.log('Submitting materi with payload:', JSON.stringify(submitData, null, 2));
      await createMateri(submitData);
      enqueueSnackbar('Materi berhasil ditambahkan', { variant: 'success' });
      refreshMatakuliah();
      onClose();
      setFormData({
        matakuliah: matakuliah?.id || '',
        pertemuan: pertemuan?.id || '',
        judul: '',
        deskripsi: '',
        videoYoutubeUrl: '',
        isiTeks: { type: 'doc', content: [] },
        image: null,
        document: null,
      });
      setPertemuanList([]);
      setMateriList([]);
      editor?.commands.clearContent();
    } catch (error) {
      console.error('Submission error:', error.response?.data || error.message);
      const validationErrors = error.response?.data?.error?.details?.errors;
      if (validationErrors) {
        const errorMessages = validationErrors.map((err) => err.message).join('; ');
        enqueueSnackbar(`Gagal menambahkan materi: ${errorMessages}`, { variant: 'error' });
      } else {
        enqueueSnackbar(
          `Gagal menambahkan materi: ${error.response?.data?.error?.message || error.message}`,
          { variant: 'error' }
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="add-materi-modal">
      <Box sx={modalStyle}>
        {loading ? (
          <LoadingScreen />
        ) : (
          <>
            <Typography
              variant="h5"
              id="add-materi-modal"
              sx={{ color: theme.text, fontWeight: 600, mb: 1 }}
            >
              Tambah Materi Baru
            </Typography>
            {!matakuliah || !matakuliah.id || !pertemuan || !pertemuan.id ? (
              <Typography sx={{ color: theme.error, opacity: 0.7 }}>
                Mata kuliah atau pertemuan tidak valid. Silakan pilih dari daftar.
              </Typography>
            ) : (
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <FormControl fullWidth error={!!errors.matakuliah}>
                        <InputLabel sx={{ color: theme.text }}>Mata Kuliah</InputLabel>
                        <Select
                          name="matakuliah"
                          value={formData.matakuliah}
                          onChange={handleChange}
                          disabled
                          required
                          sx={{
                            color: theme.text,
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.border },
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.primary },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.primary },
                          }}
                          startAdornment={
                            <InputAdornment position="start">
                              <SchoolIcon sx={{ color: theme.primary }} />
                            </InputAdornment>
                          }
                        >
                          <MenuItem value={matakuliah.id}>
                            {matakuliah.attributes?.nama || matakuliah.nama}
                          </MenuItem>
                        </Select>
                        {errors.matakuliah && (
                          <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                            {errors.matakuliah}
                          </Typography>
                        )}
                      </FormControl>

                      <FormControl fullWidth error={!!errors.pertemuan}>
                        <InputLabel sx={{ color: theme.text }}>Pertemuan</InputLabel>
                        <Select
                          name="pertemuan"
                          value={formData.pertemuan}
                          onChange={handleChange}
                          disabled
                          required
                          sx={{
                            color: theme.text,
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.border },
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.primary },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: theme.primary },
                          }}
                          startAdornment={
                            <InputAdornment position="start">
                              <EventIcon sx={{ color: theme.primary }} />
                            </InputAdornment>
                          }
                        >
                          <MenuItem value={pertemuan.id}>
                            {pertemuan.attributes?.topik || pertemuan.topik} (Pertemuan{' '}
                            {pertemuan.attributes?.pertemuanKe || pertemuan.pertemuanKe})
                          </MenuItem>
                        </Select>
                        {errors.pertemuan && (
                          <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                            {errors.pertemuan}
                          </Typography>
                        )}
                      </FormControl>

                      <TextField
                        fullWidth
                        label="Judul"
                        name="judul"
                        value={formData.judul}
                        onChange={handleChange}
                        required
                        error={!!errors.judul}
                        helperText={errors.judul || 'Masukkan judul materi (misal: Pengenalan AI)'}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <TitleIcon sx={{ color: theme.primary }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': { borderColor: theme.primary },
                            '&.Mui-focused fieldset': { borderColor: theme.primary },
                          },
                          input: { color: theme.text },
                        }}
                      />

                      <TextField
                        fullWidth
                        label="Deskripsi"
                        name="deskripsi"
                        multiline
                        rows={3}
                        value={formData.deskripsi}
                        onChange={handleChange}
                        helperText="Masukkan deskripsi singkat materi"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <DescriptionIcon sx={{ color: theme.primary }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': { borderColor: theme.primary },
                            '&.Mui-focused fieldset': { borderColor: theme.primary },
                          },
                          textarea: { color: theme.text },
                        }}
                      />

                      <TextField
                        fullWidth
                        label="URL Video YouTube"
                        name="videoYoutubeUrl"
                        value={formData.videoYoutubeUrl}
                        onChange={handleChange}
                        helperText="Masukkan URL video YouTube (opsional)"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <YouTubeIcon sx={{ color: theme.primary }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': { borderColor: theme.primary },
                            '&.Mui-focused fieldset': { borderColor: theme.primary },
                          },
                          input: { color: theme.text },
                        }}
                      />

                      <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1, color: theme.text, fontWeight: 500 }}>
                          Isi Teks
                        </Typography>
                        <Box
                          sx={{
                            border: `1px solid ${theme.border}`,
                            borderRadius: 2,
                            bgcolor: '#fff',
                            overflow: 'hidden',
                          }}
                        >
                          <Box
                            sx={{
                              borderBottom: `1px solid ${theme.border}`,
                              p: 1,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              bgcolor: theme.secondary,
                            }}
                          >
                            <IconButton
                              onClick={() => editor?.chain().focus().toggleBold().run()}
                              sx={{ color: editor?.isActive('bold') ? theme.primary : theme.text }}
                            >
                              <FormatBoldIcon />
                            </IconButton>
                            <IconButton
                              onClick={() => editor?.chain().focus().toggleItalic().run()}
                              sx={{ color: editor?.isActive('italic') ? theme.primary : theme.text }}
                            >
                              <FormatItalicIcon />
                            </IconButton>
                            <IconButton
                              onClick={() => editor?.chain().focus().toggleBulletList().run()}
                              sx={{ color: editor?.isActive('bulletList') ? theme.primary : theme.text }}
                            >
                              <FormatListBulletedIcon />
                            </IconButton>
                            <IconButton
                              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                              sx={{ color: editor?.isActive('orderedList') ? theme.primary : theme.text }}
                            >
                              <FormatListNumberedIcon />
                            </IconButton>
                            <IconButton
                              onClick={() => setImageDialogOpen(true)}
                              sx={{ color: theme.text }}
                            >
                              <AddPhotoAlternateIcon />
                            </IconButton>
                            <IconButton
                              onClick={handleLink}
                              sx={{ color: editor?.isActive('link') ? theme.primary : theme.text }}
                            >
                              <LinkIcon />
                            </IconButton>
                          </Box>
                          <EditorContent
                            editor={editor}
                            style={{
                              padding: '16px',
                              minHeight: '150px',
                              color: theme.text,
                              backgroundColor: '#fff',
                              borderRadius: '0 0 8px 8px',
                              '& .ProseMirror': {
                                outline: 'none',
                              },
                              '& img': {
                                maxWidth: '100%',
                                height: 'auto',
                                margin: '8px 0',
                                borderRadius: '4px',
                              },
                            }}
                          />
                        </Box>
                        <Typography variant="caption" sx={{ mt: 1, color: theme.text, opacity: 0.7 }}>
                          Gunakan toolbar untuk memformat teks dan menyisipkan gambar
                        </Typography>
                      </Box>

                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<ImageIcon />}
                        sx={{
                          borderColor: theme.border,
                          color: theme.primary,
                          '&:hover': {
                            borderColor: theme.primary,
                            bgcolor: 'rgba(25, 118, 210, 0.04)',
                          },
                        }}
                      >
                        Unggah Gambar (Opsional)
                        <input
                          type="file"
                          hidden
                          accept="image/jpeg,image/png,image/gif"
                          onChange={(e) => handleFileChange(e, 'image')}
                        />
                      </Button>
                      {formData.image && (
                        <Typography variant="caption" sx={{ color: theme.text }}>
                          File gambar terpilih: {formData.image.name}
                        </Typography>
                      )}
                      {errors.image && (
                        <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                          {errors.image}
                        </Typography>
                      )}

                      <Button
                        variant="outlined"
                        component="label"
                        startIcon={<AttachFileIcon />}
                        sx={{
                          borderColor: theme.border,
                          color: theme.primary,
                          '&:hover': {
                            borderColor: theme.primary,
                            bgcolor: 'rgba(25, 118, 210, 0.04)',
                          },
                        }}
                      >
                        Unggah Dokumen (PDF, DOCX, XLSX) (Opsional)
                        <input
                          type="file"
                          hidden
                          accept=".pdf,.doc,.docx,.xls,.xlsx"
                          onChange={(e) => handleFileChange(e, 'document')}
                        />
                      </Button>
                      {formData.document && (
                        <Typography variant="caption" sx={{ color: theme.text }}>
                          File dokumen terpilih: {formData.document.name}
                        </Typography>
                      )}
                      {errors.document && (
                        <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                          {errors.document}
                        </Typography>
                      )}
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" sx={{ mb: 1, color: theme.text, fontWeight: 500 }}>
                      Daftar Materi
                    </Typography>
                    <Typography variant="caption" sx={{ mb: 2, color: theme.text, opacity: 0.7, display: 'block' }}>
                      Materi yang telah ditambahkan untuk mata kuliah ini
                    </Typography>
                    <Box
                      sx={{
                        maxHeight: 400,
                        overflowY: 'auto',
                        border: `1px solid ${theme.border}`,
                        borderRadius: 2,
                        p: 2,
                        bgcolor: theme.secondary,
                      }}
                    >
                      {materiList.length === 0 ? (
                        <Typography sx={{ color: theme.text, opacity: 0.7 }}>
                          Belum ada materi untuk mata kuliah ini
                        </Typography>
                      ) : (
                        materiList.map((materi) => (
                          <Box
                            key={materi.id}
                            sx={{
                              p: 1,
                              borderRadius: 1,
                              mb: 1,
                              bgcolor: '#fff',
                              '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.04)' },
                            }}
                          >
                            <Typography variant="body2" sx={{ color: theme.text }}>
                              {materi.attributes?.judul || materi.judul} (
                              {materi.attributes?.pertemuan?.data?.attributes?.topik || materi.pertemuan?.topik})
                            </Typography>
                          </Box>
                        ))
                      )}
                    </Box>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    onClick={onClose}
                    startIcon={<CancelIcon />}
                    variant="outlined"
                    sx={{
                      color: 'rgb(253, 238, 30)',
                      borderColor: theme.border,
                      '&:hover': { bgcolor: theme.secondary },
                    }}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    disabled={
                      !formData.matakuliah ||
                      !formData.pertemuan ||
                      !formData.judul ||
                      !!errors.judul
                    }
                    sx={{
                      bgcolor: theme.primary,
                      '&:hover': { bgcolor: '#1565c0' },
                      boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
                      '&.Mui-disabled': { bgcolor: '#bdbdbd', color: '#fff' },
                    }}
                  >
                    Simpan
                  </Button>
                </Box>
              </form>
            )}

            {/* Image URL Dialog */}
            <Dialog open={imageDialogOpen} onClose={() => setImageDialogOpen(false)}>
              <DialogTitle>Tambahkan Gambar</DialogTitle>
              <DialogContent>
                <TextField
                  fullWidth
                  label="URL Gambar"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  helperText="Masukkan URL gambar (misal: https://example.com/image.jpg)"
                  sx={{ mt: 1 }}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setImageDialogOpen(false)}>Batal</Button>
                <Button onClick={handleInsertImage} variant="contained">
                  Sisipkan
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}
      </Box>
    </Modal>
  );
};

export default AddMateriModal;