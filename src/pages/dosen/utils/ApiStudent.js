import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:1337/api';

// Fungsi untuk membuat entri Rekapitulasi
export const createRekapitulasi = async (mahasiswaId, matakuliahId) => {
  try {
    // Cek apakah entri rekapitulasi sudah ada
    const existingRekap = await axios.get(`${API_URL}/rekapitulasis`, {
      params: {
        'filters[mahasiswa][id][$eq]': mahasiswaId,
        'filters[matakuliah][id][$eq]': matakuliahId,
      },
    });

    if (existingRekap.data.data.length > 0) {
      console.log(`Rekapitulasi sudah ada untuk mahasiswa ${mahasiswaId} dan matakuliah ${matakuliahId}`);
      return existingRekap.data.data[0];
    }

    // Buat entri rekapitulasi baru
    const response = await axios.post(`${API_URL}/rekapitulasis`, {
      data: {
        mahasiswa: mahasiswaId,
        matakuliah: matakuliahId,
        publishedAt: new Date().toISOString(),
      },
    });
    console.log('Created rekapitulasi:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating rekapitulasi:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error(error.message || 'Gagal membuat entri rekapitulasi');
  }
};

// Fetch students filtered by program_studi and semester
export const fetchStudents = async (programStudi, semester) => {
  try {
    console.log('fetchStudents called with:', { programStudi, semester });
    let programStudiId;
    if (typeof programStudi === 'object' && programStudi?.id) {
      programStudiId = programStudi.id;
    } else if (typeof programStudi === 'number' || (typeof programStudi === 'string' && !isNaN(programStudi))) {
      programStudiId = parseInt(programStudi, 10);
    } else {
      throw new Error('Invalid program_studi: ID is missing or invalid');
    }

    const queryParams = {
      'filters[program_studi][id][$eq]': programStudiId,
      'filters[semester][$eq]': semester,
      'populate': 'program_studi',
    };
    console.log('Fetching students with params:', queryParams);

    const response = await axios.get(`${API_URL}/mahasiswas`, { params: queryParams });
    console.log('Fetch students raw response:', JSON.stringify(response.data, null, 2));

    const students = response.data.data || [];
    if (!students.length) {
      console.warn('No students found for program_studi:', programStudiId, 'semester:', semester);
    }

    return students;
  } catch (error) {
    console.error('Error fetching students:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      programStudi,
      semester,
    });
    throw error;
  }
};

// Search students by name or NIM
export const searchStudents = async (programStudi, semester, query) => {
  try {
    console.log('searchStudents called with:', { programStudi, semester, query });
    let programStudiId;
    if (typeof programStudi === 'object' && programStudi?.id) {
      programStudiId = programStudi.id;
    } else if (typeof programStudi === 'number' || (typeof programStudi === 'string' && !isNaN(programStudi))) {
      programStudiId = parseInt(programStudi, 10);
    } else {
      throw new Error('Invalid program_studi: ID is missing or invalid');
    }

    const queryParams = {
      'filters[program_studi][id][$eq]': programStudiId,
      'filters[semester][$eq]': semester,
      'filters[$or][0][namaLengkap][$containsi]': query,
      'filters[$or][1][nim][$containsi]': query,
      'populate': 'program_studi',
    };
    console.log('Searching students with params:', queryParams);

    const response = await axios.get(`${API_URL}/mahasiswas`, { params: queryParams });
    console.log('Search students raw response:', JSON.stringify(response.data, null, 2));

    const students = response.data.data || [];
    if (!students.length) {
      console.warn('No students found for query:', query);
    }

    return students;
  } catch (error) {
    console.error('Error searching students:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      programStudi,
      semester,
      query,
    });
    throw error;
  }
};

// Fetch invited students for a matakuliah
export const fetchInvitedStudents = async (matakuliahId) => {
  try {
    const queryParams = {
      'filters[matakuliah][id][$eq]': matakuliahId,
      'populate': '*',
      '_': Date.now(),
    };
    console.log('Fetching invited students with params:', queryParams);

    const response = await axios.get(`${API_URL}/undangan-mahasiswas`, { params: queryParams });
    console.log('Fetch invited students raw response:', JSON.stringify(response.data, null, 2));

    const invitedStudents = (response.data.data || []).filter((invited) => {
      const mahasiswa = invited.mahasiswa;
      const hasMahasiswa = mahasiswa?.id && mahasiswa.nim;
      if (!hasMahasiswa) {
        console.warn('Invalid undangan-mahasiswa record:', {
          invited: JSON.stringify(invited, null, 2),
          mahasiswa,
          hasId: !!mahasiswa?.id,
          hasNim: !!mahasiswa?.nim,
          hasNamaLengkap: !!mahasiswa?.namaLengkap,
        });
      }
      return hasMahasiswa;
    }).map((invited) => {
      const mahasiswa = invited.mahasiswa;
      return {
        id: invited.id,
        mahasiswaId: Number(mahasiswa.id),
        nim: mahasiswa.nim || 'N/A',
        namaLengkap: mahasiswa.namaLengkap || mahasiswa.nama_lengkap || 'N/A',
        semester: mahasiswa.semester || 'N/A',
        status_class: invited.status_class || 'N/A',
      };
    });

    console.log('Formatted invited students:', JSON.stringify(invitedStudents, null, 2));

    if (!invitedStudents.length) {
      console.warn('No valid invited students found for matakuliah:', matakuliahId);
    }

    return invitedStudents;
  } catch (error) {
    console.error('Error fetching invited students:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      request: {
        url: error.config?.url,
        params: error.config?.params,
      },
    });
    throw new Error(error.message || 'Gagal memuat daftar mahasiswa yang diundang');
  }
};

// Invite students to a matakuliah and create rekapitulasi entries
export const inviteStudents = async (matakuliahId, studentIds, diundangOleh) => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    const userResponse = await axios.get(`${API_URL}/users/${user.id}?populate=dosen`);
    const dosen = userResponse.data.dosen;
    if (!dosen?.id) {
      throw new Error('Pengguna bukan dosen atau tidak terkait dengan data dosen');
    }
    const diundangOlehId = dosen.id;

    console.log('Inviting students:', {
      matakuliahId,
      studentIds,
      diundangOlehId,
      userId: user.id,
    });

    const promises = studentIds.map(async (studentId) => {
      // 1. Buat entri undangan
      const undanganResponse = await axios.post(`${API_URL}/undangan-mahasiswas`, {
        data: {
          matakuliah: matakuliahId,
          mahasiswa: studentId,
          status_class: 'pending',
          diundang_oleh: diundangOlehId,
          tanggalUndangan: new Date().toISOString(),
        },
      });

      // 2. Buat entri rekapitulasi
      await createRekapitulasi(studentId, matakuliahId);

      return undanganResponse;
    });

    const responses = await Promise.all(promises);
    console.log('Successfully invited students and created rekapitulasi:', studentIds, responses.map((res) => res.data));
  } catch (error) {
    console.error('Error inviting students:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    throw new Error(error.message || 'Gagal mengundang mahasiswa');
  }
};