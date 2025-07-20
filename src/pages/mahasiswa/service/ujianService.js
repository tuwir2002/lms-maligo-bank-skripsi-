import axios from 'axios';

const API_URL = 'http://localhost:1337/api';

const fetchUjians = async () => {
  try {
    const response = await axios.get(`${API_URL}/ujians?populate=*`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching ujians:', error);
    throw error;
  }
};

const fetchUjiansByMahasiswa = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.username) {
      throw new Error('User data not found in localStorage');
    }
    const nim = user.username;

    // Fetch mahasiswa data
    const mahasiswaResponse = await axios.get(`${API_URL}/mahasiswas?filters[nim][$eq]=${nim}&populate=*`);
    const mahasiswa = mahasiswaResponse.data.data[0];
    if (!mahasiswa) {
      throw new Error('Mahasiswa not found');
    }
    const semester = mahasiswa.semester;
    const mahasiswaId = mahasiswa.id;
    const undanganIds = mahasiswa.undangan_mahasiswas?.map(u => u.id) || [];

    // Fetch matakuliah data
    const matakuliahResponse = await axios.get(`${API_URL}/matakuliahs?populate=*`);
    const matakuliahs = matakuliahResponse.data.data;

    // Filter matakuliah by semester and student's undangan_mahasiswas
    const enrolledMatakuliahs = matakuliahs.filter(matakuliah => 
      matakuliah.semester === semester &&
      matakuliah.undangan_mahasiswas?.some(u => undanganIds.includes(u.id))
    );

    // Fetch exams
    const ujianResponse = await axios.get(`${API_URL}/ujians?populate=*`);
    const ujians = ujianResponse.data.data.filter(ujian => 
      enrolledMatakuliahs.some(matakuliah => 
        matakuliah.ujians?.some(u => u.id === ujian.id)
      )
    );

    // Fetch jawaban-ujians for the mahasiswa
    const jawabanResponse = await axios.get(
      `${API_URL}/jawaban-ujians?filters[mahasiswa][id][$eq]=${mahasiswaId}&populate[soal_ujian][populate]=*`
    );
    const jawabanUjians = jawabanResponse.data.data;

    // Add hasSubmitted flag to each exam
    const ujiansWithStatus = ujians.map(ujian => {
      const hasSubmitted = jawabanUjians.some(jawaban => 
        jawaban.soal_ujian?.ujian?.id === ujian.id
      );
      return { ...ujian, hasSubmitted };
    });

    return ujiansWithStatus;
  } catch (error) {
    console.error('Error fetching ujians by mahasiswa:', error);
    throw error;
  }
};

const fetchMahasiswas = async () => {
  try {
    const response = await axios.get(`${API_URL}/mahasiswas?populate=*`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching mahasiswas:', error);
    throw error;
  }
};

const fetchMatakuliahs = async () => {
  try {
    const response = await axios.get(`${API_URL}/matakuliahs?populate=*`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching matakuliahs:', error);
    throw error;
  }
};

const submitJawabanUjian = async (jawabanData) => {
  try {
    console.log('Submitting jawaban data:', jawabanData);
    const response = await Promise.all(
      jawabanData.map(async (item) => {
        return await axios.post(
          `${API_URL}/jawaban-ujians`,
          {
            data: {
              jawaban: item.jawaban,
              soal_ujian: item.soal_ujian,
              mahasiswa: item.mahasiswa,
            },
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      })
    );
    console.log('Submit response:', response);
    return response.map(res => res.data);
  } catch (error) {
    console.error('Error submitting jawaban ujian:', error.response?.data || error);
    throw new Error(
      error.response
        ? `HTTP error! status: ${error.response.status}, message: ${JSON.stringify(error.response.data)}`
        : error.message
    );
  }
};

export { fetchUjians, fetchUjiansByMahasiswa, fetchMahasiswas, fetchMatakuliahs, submitJawabanUjian };