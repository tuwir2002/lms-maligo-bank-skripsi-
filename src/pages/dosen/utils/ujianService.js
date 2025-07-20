import axios from 'axios';

const API_URL = 'http://localhost:1337/api';

export const getExamsByDosen = async (nip) => {
  try {
    console.log(`Fetching exams for NIP: ${nip}`);
    const response = await axios.get(
      `${API_URL}/ujians?populate=*&filters[matakuliah][dosens][nip][$eq]=${nip}`
    );
    console.log('API response for exams:', JSON.stringify(response.data, null, 2));
    // Validasi apakah data.data kosong
    if (!response.data.data || response.data.data.length === 0) {
      console.log('No exams found for this NIP');
      return { data: [] };
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching exams by dosen:', error.response?.data || error.message);
    throw new Error('Failed to fetch exams');
  }
};

// Fungsi lainnya tetap sama
export const getExams = async () => {
  try {
    const response = await axios.get(`${API_URL}/ujians?populate=*`);
    return response.data;
  } catch (error) {
    console.error('Error fetching exams:', error.response?.data || error.message);
    throw new Error('Failed to fetch exams');
  }
};

export const createExam = async (examData) => {
  try {
    const payload = {
      data: {
        judul: examData.judul,
        instruksi: examData.instruksi,
        waktuMulai: examData.waktuMulai,
        waktuSelesai: examData.waktuSelesai,
        timer: examData.timer,
        matakuliah: examData.matakuliah,
      },
    };
    console.log('Create exam payload:', JSON.stringify(payload, null, 2));
    const response = await axios.post(`${API_URL}/ujians`, payload);
    return response.data;
  } catch (error) {
    console.error('Error creating exam:', error.response?.data || error.message);
    throw new Error('Failed to create exam');
  }
};

export const updateExam = async (documentId, examData) => {
  try {
    const payload = {
      data: {
        judul: examData.judul,
        instruksi: examData.instruksi,
        waktuMulai: examData.waktuMulai,
        waktuSelesai: examData.waktuSelesai,
        timer: examData.timer,
        matakuliah: examData.matakuliah,
      },
    };
    console.log('Update exam payload:', JSON.stringify(payload, null, 2));
    const response = await axios.put(`${API_URL}/ujians/${documentId}`, payload);
    return response.data;
  } catch (error) {
    console.error('Error updating exam:', error.response?.data || error.message);
    throw new Error('Failed to update exam');
  }
};

export const deleteExam = async (documentId) => {
  try {
    const response = await axios.delete(`${API_URL}/ujians/${documentId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting exam:', error.response?.data || error.message);
    throw new Error('Failed to delete exam');
  }
};

export const validateMatakuliah = async (nip) => {
  try {
    const response = await axios.get(`${API_URL}/matakuliahs?populate=*&filters[dosens][nip][$eq]=${nip}`);
    return response.data;
  } catch (error) {
    console.error('Error validating matakuliah:', error.response?.data || error.message);
    throw new Error('Failed to fetch matakuliah');
  }
};

export const createSoalUjian = async (soalData) => {
  try {
    const payload = {
      data: {
        pertanyaan: soalData.pertanyaan,
        jenis: soalData.jenis,
        pilihan: soalData.pilihan,
        jawabanBenar: soalData.jawabanBenar,
        bobot: soalData.bobot,
        ujian: soalData.ujian,
      },
    };
    console.log('Create soal payload:', JSON.stringify(payload, null, 2));
    const response = await axios.post(`${API_URL}/soal-ujians`, payload);
    return response.data;
  } catch (error) {
    console.error('Error creating soal:', error.response?.data || error.message);
    throw new Error('Failed to create soal');
  }
};

export const getSoalByUjian = async (ujianId) => {
  try {
    const response = await axios.get(`${API_URL}/soal-ujians?populate=*&filters[ujian][id][$eq]=${ujianId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching soal by ujian:', error.response?.data || error.message);
    throw new Error('Failed to fetch soal');
  }
};