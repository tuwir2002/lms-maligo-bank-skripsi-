import axios from 'axios';

// Use Vite environment variable with fallback
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:1337/api';

const api = axios.create({
  baseURL: API_URL,
});

export const createMatakuliah = async (data) => {
  try {
    const response = await api.post('/matakuliahs', { data });
    return response.data;
  } catch (error) {
    console.error('Error creating matakuliah:', error.response?.data || error.message);
    throw error;
  }
};

export const getMatakuliahList = async () => {
  try {
    const response = await api.get('/matakuliahs?populate=*');
    return response.data;
  } catch (error) {
    console.error('Error fetching matakuliah list:', error.response?.data || error.message);
    throw error;
  }
};

export const updateMatakuliah = async (documentId, data) => {
  try {
    console.log(`Fetching matakuliah with URL: ${API_URL}/matakuliahs/${documentId}?populate=*`);
    const currentMatakuliahResponse = await api.get(`/matakuliahs/${documentId}?populate=*`);
    console.log('API response:', JSON.stringify(currentMatakuliahResponse.data, null, 2));

    const currentMatakuliah = currentMatakuliahResponse.data?.data;
    if (!currentMatakuliah) {
      throw new Error(`Invalid matakuliah data received from server: ${JSON.stringify(currentMatakuliahResponse.data)}`);
    }

    const kodeCheckResponse = await api.get(`/matakuliahs?filters[kode][$eq]=${data.kode}&filters[documentId][$ne]=${documentId}`);
    if (kodeCheckResponse.data.data.length > 0) {
      throw new Error(`Kode ${data.kode} sudah digunakan oleh mata kuliah lain`);
    }

    const newData = {
      nama: data.nama,
      kode: data.kode,
      semester: data.semester,
      sks: data.sks,
      dosens: currentMatakuliah.dosens?.map(dosen => dosen.id) || [],
      program_studi: currentMatakuliah.program_studi?.id || null,
      pertemuans: currentMatakuliah.pertemuans?.map(pertemuan => pertemuan.id) || [],
      ujians: currentMatakuliah.ujians?.map(ujian => ujian.id) || [],
      undangan_mahasiswas: currentMatakuliah.undangan_mahasiswas?.map(undangan => undangan.id) || [],
      rekap_nilais: currentMatakuliah.rekap_nilais?.map(rekap => rekap.id) || [],
    };
    await api.delete(`/matakuliahs/${documentId}`);
    const response = await api.post('/matakuliahs', { data: newData });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getProgramStudiList = async () => {
  try {
    const response = await api.get('/program-studis');
    return response.data;
  } catch (error) {
    console.error('Error fetching program studi list:', error.response?.data || error.message);
    throw error;
  }
};

export const getDosenList = async (programStudiId = '') => {
  try {
    let url = '/dosens?populate[users_permissions_user][fields][0]=username&populate[program_studi][fields][0]=nama';
    if (programStudiId && !isNaN(programStudiId)) {
      url += `&filters[program_studi][id][$eq]=${programStudiId}`;
    }
    console.log('Fetching dosen list with URL:', `${API_URL}${url}`);
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching dosen list:', error.response?.data || error.message);
    throw error;
  }
};

export const getMaterisList = async () => {
  try {
    const response = await api.get('/materis?populate=*');
    return response.data;
  } catch (error) {
    console.error('Error fetching materis list:', error.response?.data || error.message);
    throw error;
  }
};

export const createPertemuan = async (data) => {
  try {
    const response = await api.post('/pertemuans', { data });
    return response.data;
  } catch (error) {
    console.error('Error creating pertemuan:', error.response?.data || error.message);
    throw error;
  }
};

export const updatePertemuan = async (documentId, data) => {
  try {
    console.log('Updating pertemuan with payload:', JSON.stringify(data, null, 2));
    const response = await api.put(`/pertemuans/${documentId}`, { data });
    return response.data;
  } catch (error) {
    console.error('Error updating pertemuan:', error.response?.data || error.message);
    throw error;
  }
};

export const deletePertemuan = async (documentId) => {
  try {
    const response = await api.delete(`/pertemuans/${documentId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting pertemuan:', error.response?.data || error.message);
    throw error;
  }
};

export const getPertemuanList = async (matakuliahId = '') => {
  try {
    let url = '/pertemuans?populate[matakuliah][fields][0]=nama';
    if (matakuliahId && !isNaN(matakuliahId)) {
      url += `&filters[matakuliah][id][$eq]=${matakuliahId}`;
    }
    console.log('Fetching pertemuan list with URL:', `${API_URL}${url}`);
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching pertemuan list:', error.response?.data || error.message);
    throw error;
  }
};

export const createMateri = async (data) => {
  try {
    console.log('Creating materi with payload:', JSON.stringify(data, null, 2));
    const payload = {
      data: {
        judul: data.judul,
        deskripsi: data.deskripsi,
        videoYoutubeUrl: data.videoYoutubeUrl,
        isiTeks: data.isiTeks,
        pertemuan: data.pertemuan,
        fileUrl: data.fileUrl ? data.fileUrl : null,
        documentUrl: data.documentUrl ? data.documentUrl : null,
      },
    };
    const response = await api.post('/materis', payload);
    return response.data;
  } catch (error) {
    console.error('Error creating materi:', error.response?.data || error.message);
    if (error.response?.data?.error?.details?.errors) {
      console.error('Validation errors:', JSON.stringify(error.response.data.error.details.errors, null, 2));
    }
    throw error;
  }
};

export const deleteMateri = async (documentId) => {
  try {
    const response = await api.delete(`/materis/${documentId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting materi:', error.response?.data || error.message);
    throw error;
  }
};

export const getMateriList = async (matakuliahId = '') => {
  try {
    let url = '/materis?populate[pertemuan][fields][0]=topik&populate[pertemuan][populate][matakuliah][fields][0]=nama';
    if (matakuliahId && !isNaN(matakuliahId)) {
      url += `&filters[pertemuan][matakuliah][id][$eq]=${matakuliahId}`;
    }
    console.log('Fetching materi list with URL:', `${API_URL}${url}`);
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching materi list:', error.response?.data || error.message);
    throw error;
  }
};

export const uploadFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append('files', file);
    const response = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading file:', error.response?.data || error.message);
    throw error;
  }
};

export const getKuisList = async (matakuliahId = '') => {
  try {
    let url = '/kuises?populate=*';
    if (matakuliahId && !isNaN(matakuliahId)) {
      url += `&filters[pertemuan][matakuliah][id][$eq]=${matakuliahId}`;
    }
    console.log('Fetching kuis list with URL:', `${API_URL}${url}`);
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching kuis list:', error.response?.data || error.message);
    throw error;
  }
};

export const createKuis = async (data) => {
  try {
    console.log('Creating kuis with payload:', JSON.stringify(data, null, 2));
    const response = await api.post('/kuises', data);
    return response.data;
  } catch (error) {
    console.error('Error creating kuis:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      details: error.response?.data?.error?.details,
    });
    const errorMessage =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      'Failed to create kuis';
    throw new Error(errorMessage);
  }
};

export const createSoalKuis = async (data) => {
  try {
    console.log('Creating soal_kuis with payload:', JSON.stringify(data, null, 2));
    const response = await api.post('/soal-kuises', data);
    return response.data;
  } catch (error) {
    console.error('Error creating soal_kuis:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      details: error.response?.data?.error?.details,
    });
    const errorMessage =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      'Failed to create soal_kuis';
    throw new Error(errorMessage);
  }
};

export const deleteKuis = async (documentId) => {
  try {
    console.log(`Deleting kuis with documentId: ${documentId}`);
    const response = await api.delete(`/kuises/${documentId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting kuis:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      details: error.response?.data?.error?.details,
    });
    const errorMessage =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      'Failed to delete kuis';
    throw new Error(errorMessage);
  }
};