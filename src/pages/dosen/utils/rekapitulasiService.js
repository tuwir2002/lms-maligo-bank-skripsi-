import axios from 'axios';

// Use Vite environment variable with fallback
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:1337/api';

const api = axios.create({
  baseURL: API_URL,
});

export const getMatakuliahList = async () => {
  try {
    const response = await api.get('/matakuliahs?populate=*');
    return response.data.data; // Return the data array
  } catch (error) {
    console.error('Error fetching matakuliah list:', error.response?.data || error.message);
    throw error;
  }
};

export const getProgramStudiList = async () => {
  try {
    const response = await api.get('/program-studis');
    return response.data.data; // Return the data array
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
    return response.data.data; // Return the data array
  } catch (error) {
    console.error('Error fetching dosen list:', error.response?.data || error.message);
    throw error;
  }
};

export const getMaterisList = async () => {
  try {
    const response = await api.get('/materis?populate=*');
    return response.data.data; // Return the data array
  } catch (error) {
    console.error('Error fetching materis list:', error.response?.data || error.message);
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
    return response.data.data; // Return the data array
  } catch (error) {
    console.error('Error fetching pertemuan list:', error.response?.data || error.message);
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
    return response.data.data; // Return the data array
  } catch (error) {
    console.error('Error fetching materi list:', error.response?.data || error.message);
    throw error;
  }
};

const getRekapitulasiData = async () => {
  try {
    const response = await api.get(
      '/rekapitulasis?populate[mahasiswa][fields][0]=namaLengkap&populate[mahasiswa][fields][1]=nim&populate[matakuliah][fields][0]=nama&populate[matakuliah][fields][1]=id&populate[matakuliah][populate][pertemuans][fields][0]=id'
    );
    console.log('Rekapitulasi response:', response.data);
    const data = Array.isArray(response.data.data) ? response.data.data : [];
    return data.map((item) => ({
      id: item.id,
      mahasiswa: {
        namaLengkap: item.mahasiswa?.namaLengkap || '',
        nim: item.mahasiswa?.nim || '',
      },
      matakuliah: {
        id: item.matakuliah?.id || null,
        nama: item.matakuliah?.nama || '',
        pertemuans: item.matakuliah?.pertemuans?.map((p) => ({ id: p.id })) || [],
      },
    }));
  } catch (error) {
    console.error('Error fetching rekapitulasi data:', error.response?.data || error.message);
    throw error;
  }
};

const getMatakuliahProgress = async () => {
  try {
    const response = await api.get(
      '/matakuliahs?populate[pertemuans][fields][0]=id'
    );
    console.log('Matakuliah progress response:', response.data);
    const data = Array.isArray(response.data.data) ? response.data.data : [];
    return data.map((item) => ({
      id: item.id,
      nama: item.nama || '',
      pertemuans: item.pertemuans?.map((p) => ({ id: p.id })) || [],
    }));
  } catch (error) {
    console.error('Error fetching matakuliah progress:', error.response?.data || error.message);
    throw error;
  }
};

const getMahasiswaData = async () => {
  try {
    const response = await api.get('/mahasiswas?populate[program_studi][fields][0]=nama');
    console.log('Mahasiswa response:', response.data);
    const data = Array.isArray(response.data.data) ? response.data.data : [];
    return data.map((item) => ({
      id: item.id,
      namaLengkap: item.namaLengkap || '',
      nim: item.nim || '',
      semester: item.semester || 0,
      program_studi: item.program_studi || null,
    }));
  } catch (error) {
    console.error('Error fetching mahasiswa data:', error.response?.data || error.message);
    throw error;
  }
};

const getKuisList = async (matakuliahId = '') => {
  try {
    let url = '/soal-kuises?populate[pertemuan][fields][0]=id';
    if (matakuliahId && !isNaN(matakuliahId)) {
      url += `&filters[pertemuan][matakuliah][id][$eq]=${matakuliahId}`;
    }
    console.log('Fetching kuis list with URL:', `${API_URL}${url}`);
    const response = await api.get(url);
    const data = Array.isArray(response.data.data) ? response.data.data : [];
    return data.map((item) => ({
      id: item.id,
      pertemuan: item.pertemuan || null,
    }));
  } catch (error) {
    console.error('Error fetching kuis list:', error.response?.data || error.message);
    throw error;
  }
};

export const rekapitulasiService = {
  getRekapitulasiData,
  getMatakuliahProgress,
  getMahasiswaData,
  getMatakuliahList,
  getProgramStudiList,
  getDosenList,
  getMaterisList,
  getPertemuanList,
  getMateriList,
  getKuisList,
};