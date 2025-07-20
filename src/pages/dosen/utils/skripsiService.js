import axios from 'axios';

const API_URL = 'http://localhost:1337/api';
const STRAPI_UPLOADS_URL = 'http://localhost:1337';

const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user?.token ? { Authorization: `Bearer ${user.token}` } : {};
};

export const getDosenIdByNip = async (nip) => {
  try {
    console.log('Fetching dosen ID for NIP:', nip);
    const response = await axios.get(
      `${API_URL}/dosens?filters[nip][$eq]=${nip}`,
      { headers: getAuthHeader() }
    );
    const dosen = response.data.data[0];
    if (!dosen) throw new Error('Dosen tidak ditemukan untuk NIP tersebut');
    console.log('Dosen ID:', dosen.id);
    return dosen.id;
  } catch (error) {
    console.error('Error fetching dosen ID:', error.response?.data || error.message);
    throw error.response?.data?.error?.message || error.message;
  }
};

export const createTopic = async (topicData) => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    const dosenId = await getDosenIdByNip(user.username);
    console.log('Creating topic:', topicData);
    const response = await axios.post(
      `${API_URL}/topics`,
      {
        data: {
          title: topicData.title,
          description: topicData.description,
          dosen: dosenId,
        },
      },
      { headers: getAuthHeader() }
    );
    console.log('Topic created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating topic:', error.response?.data || error.message);
    throw error.response?.data?.error?.message || error.message;
  }
};

export const getAllProposals = async () => {
  try {
    console.log('Fetching all proposals');
    const response = await axios.get(
      `${API_URL}/proposals?populate=*`,
      { headers: getAuthHeader() }
    );
    console.log('Fetched all proposals:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching all proposals:', error.response?.data || error.message);
    throw error.response?.data?.error?.message || error.message;
  }
};

export const getTopicsByDosenNip = async (nip) => {
  try {
    console.log('Fetching topics for NIP:', nip);
    const response = await axios.get(
      `${API_URL}/topics?populate=*&filters[dosen][nip][$eq]=${nip}`,
      { headers: getAuthHeader() }
    );
    console.log('Fetched topics:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching topics:', error.response?.data || error.message);
    throw error.response?.data?.error?.message || error.message;
  }
};

export const updateProposalStatus = async (documentId, statusData) => {
  try {
    console.log('Updating proposal:', { documentId, statusData });

    // Step 1: Fetch the existing proposal with populated relations
    const existingProposalResponse = await axios.get(
      `${API_URL}/proposals/${documentId}?populate=*`,
      { headers: getAuthHeader() }
    );

    console.log('Full existing proposal response:', existingProposalResponse.data);

    // Validate response structure
    if (!existingProposalResponse?.data?.data) {
      throw new Error('Proposal tidak ditemukan atau respons API tidak valid');
    }

    const existingData = existingProposalResponse.data.data; // Use data directly
    const existingId = existingData.id; // Numeric ID for relations

    if (!existingData) {
      throw new Error('Data proposal tidak ditemukan dalam respons');
    }

    console.log('Existing proposal data:', existingData);

    // Step 2: Prepare new proposal data, excluding id
    const newData = {
      data: {
        // Explicitly include only necessary fields, excluding id
        judul: statusData.judul || existingData.judul || 'Belum diisi',
        description: statusData.description || existingData.description || 'Belum diisi',
        status_class: statusData.status,
        dosen: existingData.dosen?.id || null,
        topic: existingData.topic?.id || null,
        mahasiswa: existingData.mahasiswa?.id || null,
        skripsi: existingData.skripsi?.id || null,
        // Optionally include documentId if required by your Strapi setup
        // documentId: existingData.documentId,
      },
    };

    console.log('New proposal data:', newData);

    // Step 3: Create new proposal
    const createResponse = await axios.post(
      `${API_URL}/proposals`,
      newData,
      { headers: getAuthHeader() }
    );
    console.log('New proposal created:', createResponse.data);

    // Step 4: Delete the old proposal
    await axios.delete(
      `${API_URL}/proposals/${documentId}`,
      { headers: getAuthHeader() }
    );
    console.log('Old proposal deleted:', documentId);

    return createResponse.data;
  } catch (error) {
    console.error('Error updating proposal:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    let errorMessage = 'Gagal memperbarui status proposal: ';
    if (error.message.includes('Proposal tidak ditemukan')) {
      errorMessage += 'Proposal tidak ditemukan. Pastikan ID proposal valid.';
    } else if (error.response?.status === 400) {
      errorMessage += 'Permintaan tidak valid. Pastikan data yang dikirim benar.';
    } else if (error.response?.status === 403) {
      errorMessage += 'Akses ditolak. Anda tidak memiliki izin untuk memperbarui atau menghapus proposal.';
    } else if (error.response?.status === 404) {
      errorMessage += 'Proposal tidak ditemukan. Pastikan ID proposal valid.';
    } else if (error.response?.status === 401) {
      errorMessage += 'Autentikasi gagal. Silakan login ulang.';
    } else if (error.response?.status === 500) {
      errorMessage += 'Kesalahan server internal. Periksa log server Strapi untuk detail.';
    } else {
      errorMessage += error.response?.data?.error?.message || error.message;
    }
    throw new Error(errorMessage);
  }
};

const getAuthToken = () => {
  return localStorage.getItem('token') || null;
};

const formatThesisData = (thesis) => ({
  id: thesis.id,
  documentId: thesis.documentId,
  title: thesis.title,
  author: thesis.author,
  year: thesis.year,
  category: thesis.category,
  abstract: thesis.abstract?.[0]?.children?.[0]?.text || '',
  program: thesis.program_studi?.nama || '',
  fileUrl: thesis.file?.[0]?.url ? `${STRAPI_UPLOADS_URL}${thesis.file[0].url}` : null,
  createdAt: thesis.createdAt,
  updatedAt: thesis.updatedAt,
});

export const fetchAllTheses = async (page = 1, pageSize = 10, filters = {}) => {
  try {
    const params = {
      'pagination[page]': page,
      'pagination[pageSize]': pageSize,
      'populate[0]': 'program_studi',
      'populate[1]': 'file',
    };

    if (filters.keyword) {
      params['filters[title][$containsi]'] = filters.keyword;
    }
    if (filters.program) {
      params['filters[program_studi][nama][$eq]'] = filters.program;
    }
    if (filters.year) {
      params['filters[year][$eq]'] = filters.year;
    }
    if (filters.category) {
      params['filters[category][$eq]'] = filters.category;
    }
    if (filters.sortBy) {
      params['sort[0]'] = filters.sortBy === 'newest' ? 'createdAt:desc' : 'year:desc';
    }

    console.log('Fetching theses with params:', params);
    const response = await axios.get(`${API_URL}/theses`, { params });
    console.log('Fetched theses:', response.data);
    return {
      data: response.data.data.map(formatThesisData),
      totalPages: response.data.meta.pagination.pageCount,
      totalItems: response.data.meta.pagination.total,
    };
  } catch (error) {
    console.error('Error fetching theses:', error.response?.data || error.message);
    const errorMessage = error.response?.status === 400
      ? 'Permintaan tidak valid. Pastikan filter dan parameter pengurutan benar.'
      : 'Gagal mengambil data skripsi: ' + error.message;
    throw new Error(errorMessage);
  }
};

export const searchTheses = async (keyword) => {
  try {
    console.log('Searching theses with keyword:', keyword);
    const response = await axios.get(`${API_URL}/theses`, {
      params: {
        'filters[title][$containsi]': keyword,
        'populate[0]': 'program_studi',
        'populate[1]': 'file',
      },
    });
    console.log('Search results:', response.data);
    return response.data.data.map(formatThesisData);
  } catch (error) {
    console.error('Error searching theses:', error.response?.data || error.message);
    throw new Error('Gagal mencari skripsi: ' + error.message);
  }
};

export const fetchFilterOptions = async () => {
  try {
    console.log('Fetching filter options');
    const response = await axios.get(`${API_URL}/theses`, {
      params: {
        'populate[0]': 'program_studi',
      },
    });
    const theses = response.data.data;

    const programs = [...new Set(theses.map((thesis) => thesis.program_studi?.nama).filter(Boolean))].sort();
    const years = [...new Set(theses.map((thesis) => thesis.year).filter(Boolean))].sort((a, b) => b - a);
    const categories = [...new Set(theses.map((thesis) => thesis.category).filter(Boolean))].sort();

    console.log('Filter options:', { programs, years, categories });
    return {
      programs,
      years,
      categories,
    };
  } catch (error) {
    console.error('Error fetching filter options:', error.response?.data || error.message);
    throw new Error('Gagal mengambil opsi filter: ' + error.message);
  }
};

export const downloadThesis = async (thesisId) => {
  try {
    const checkUrl = `${API_URL}/theses?filters[id][$eq]=${thesisId}&populate[0]=file`;
    console.log('Checking thesis existence:', checkUrl);

    const token = getAuthToken();
    const checkResponse = await axios.get(checkUrl, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!checkResponse.data.data || checkResponse.data.data.length === 0) {
      throw new Error('Thesis not found');
    }

    const thesisData = checkResponse.data.data[0];
    const fileData = thesisData.file?.[0];

    if (!fileData?.url) {
      throw new Error('No file found for this thesis');
    }

    const fileUrl = `${STRAPI_UPLOADS_URL}${fileData.url}`;
    console.log('Downloading file from:', fileUrl);

    const fileResponse = await fetch(fileUrl, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!fileResponse.ok) {
      throw new Error(`Failed to download file: ${fileResponse.status} ${fileResponse.statusText}`);
    }

    const blob = await fileResponse.blob();
    const urlBlob = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = urlBlob;
    link.download = fileData.name || `thesis_${thesisId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(urlBlob);
  } catch (error) {
    console.error('Error in downloadThesis:', error);
    let errorMessage = 'Gagal mengunduh skripsi: ';
    if (error.message.includes('Thesis not found') || error.response?.status === 404) {
      errorMessage += 'Skripsi tidak ditemukan. Pastikan ID skripsi valid atau sudah dipublikasikan.';
    } else if (error.message.includes('No file found')) {
      errorMessage += 'File skripsi tidak tersedia.';
    } else if (error.response?.status === 401) {
      errorMessage += 'Autentikasi gagal. Silakan login ulang.';
    } else if (error.response?.status === 403) {
      errorMessage += 'Akses ditolak. Pastikan Anda memiliki izin untuk mengunduh file.';
    } else {
      errorMessage += error.message;
    }
    throw new Error(errorMessage);
  }
};

export const getProposalsByDosenNip = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user?.username) throw new Error('User tidak ditemukan di localStorage');

    const dosenId = await getDosenIdByNip(user.username);
    console.log('Fetching proposals for dosenId:', dosenId);
    const response = await axios.get(
      `${API_URL}/proposals?populate=*&filters[dosen][id][$eq]=${dosenId}`,
      { headers: getAuthHeader() }
    );
    console.log('Fetched proposals:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching proposals:', error.response?.data || error.message);
    throw error.response?.data?.error?.message || error.message;
  }
};