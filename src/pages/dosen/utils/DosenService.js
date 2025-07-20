const API_URL = 'http://localhost:1337/api';

const DosenService = {
  async getLecturerByNIP(nip) {
    try {
      const response = await fetch(`${API_URL}/dosens?filters[nip][$eq]=${nip}&populate=*`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gagal mengambil data dosen: ${errorData.error?.message || response.statusText}`);
      }
      const data = await response.json();
      console.log('Lecturer API response:', data);
      if (!data.data || data.data.length === 0) {
        throw new Error(`Tidak ada dosen ditemukan untuk NIP: ${nip}`);
      }
      return data.data[0];
    } catch (error) {
      console.error('Error di getLecturerByNIP:', error);
      throw error;
    }
  },

  async getCoursesByIds(courseIds) {
    try {
      const query = courseIds.map(id => `filters[id][$in]=${id}`).join('&');
      const response = await fetch(`${API_URL}/matakuliahs?${query}&populate=*`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gagal mengambil data mata kuliah: ${errorData.error?.message || response.statusText}`);
      }
      const data = await response.json();
      console.log('Courses API response:', data);
      return data.data || [];
    } catch (error) {
      console.error('Error di getCoursesByIds:', error);
      throw error;
    }
  },

  async getAllStudents() {
    try {
      const response = await fetch(`${API_URL}/mahasiswas?populate=*`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gagal mengambil data mahasiswa: ${errorData.error?.message || response.statusText}`);
      }
      const data = await response.json();
      console.log('Students API response:', data);
      return data.data || [];
    } catch (error) {
      console.error('Error di getAllStudents:', error);
      throw error;
    }
  },
};

export default DosenService;