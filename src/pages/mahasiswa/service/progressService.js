const getUserFromLocalStorage = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      return user && user.username ? user : null;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  };
  
  const getProgressData = async () => {
    const user = getUserFromLocalStorage();
    if (!user) {
      throw new Error('No user found in localStorage');
    }
  
    try {
      const [mahasiswasResponse, matakuliahsResponse] = await Promise.all([
        fetch('http://localhost:1337/api/mahasiswas?populate=*', {
          headers: { 'Content-Type': 'application/json' },
        }),
        fetch('http://localhost:1337/api/matakuliahs?populate=*', {
          headers: { 'Content-Type': 'application/json' },
        }),
      ]);
  
      if (!mahasiswasResponse.ok || !matakuliahsResponse.ok) {
        throw new Error('Failed to fetch data from Strapi API');
      }
  
      const mahasiswasData = await mahasiswasResponse.json();
      const matakuliahsData = await matakuliahsResponse.json();
  
      const studentNim = user.username;
      const student = mahasiswasData.data.find((m) => m.nim === studentNim);
      if (!student) {
        throw new Error('Student not found in API data');
      }
  
      const rekapMap = {
        4: 97,
        6: 103,
        8: 107,
      };
  
      const rekapData = student.rekapitulasis.map((rekap) => ({
        id: rekap.id,
        mahasiswa: {
          namaLengkap: student.namaLengkap,
          nim: student.nim,
        },
        matakuliah: {
          id: rekapMap[rekap.id] || rekap.id,
          nama: matakuliahsData.data.find((mk) => mk.id === rekapMap[rekap.id])?.nama || 'Unknown',
          pertemuans: matakuliahsData.data.find((mk) => mk.id === rekapMap[rekap.id])?.pertemuans || [],
        },
      }));
  
      return {
        rekapData,
        matakuliahData: matakuliahsData.data.map((mk) => ({
          id: mk.id,
          nama: mk.nama,
          pertemuans: mk.pertemuans || [],
        })),
        mahasiswaData: [{
          id: student.id,
          namaLengkap: student.namaLengkap,
          nim: student.nim,
          semester: student.semester,
          program_studi: { nama: student.program_studi?.nama || '-' },
        }],
        jawabanKuis: student.jawaban_kuis || [],
        jawabanUjians: student.jawaban_ujians || [],
        progressBelajars: student.progress_belajars || [],
        undanganMahasiswas: student.undangan_mahasiswas || [],
      };
    } catch (error) {
      console.error('Error fetching progress data:', error);
      throw error;
    }
  };
  
  export const progressService = {
    getProgressData,
    getUserFromLocalStorage,
  };