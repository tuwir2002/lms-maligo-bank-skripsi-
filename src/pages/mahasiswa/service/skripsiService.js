import axios from 'axios';

const API_URL = 'http://localhost:1337/api';
const STRAPI_UPLOADS_URL = 'http://localhost:1337';

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token') || null;
};

// Helper function to format thesis data from Strapi response
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

// Fetch all theses with filters and pagination
export const fetchAllTheses = async (page = 1, pageSize = 10, filters = {}) => {
  try {
    const params = {
      'pagination[page]': page,
      'pagination[pageSize]': pageSize,
      'populate[0]': 'program_studi',
      'populate[1]': 'file',
    };

    // Add filters
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

    const response = await axios.get(`${API_URL}/theses`, { params });
    return {
      data: response.data.data.map(formatThesisData),
      totalPages: response.data.meta.pagination.pageCount,
      totalItems: response.data.meta.pagination.total,
    };
  } catch (error) {
    const errorMessage = error.response?.status === 400
      ? 'Permintaan tidak valid. Pastikan filter dan parameter pengurutan benar.'
      : 'Gagal mengambil data skripsi: ' + error.message;
    throw new Error(errorMessage);
  }
};

// Search theses
export const searchTheses = async (keyword) => {
  try {
    const response = await axios.get(`${API_URL}/theses`, {
      params: {
        'filters[title][$containsi]': keyword,
        'populate[0]': 'program_studi',
        'populate[1]': 'file',
      },
    });
    return response.data.data.map(formatThesisData);
  } catch (error) {
    throw new Error('Gagal mencari skripsi: ' + error.message);
  }
};

// Fetch filter options for program_studi, year, and category
export const fetchFilterOptions = async () => {
  try {
    const response = await axios.get(`${API_URL}/theses`, {
      params: {
        'populate[0]': 'program_studi',
      },
    });
    const theses = response.data.data;

    // Extract unique values
    const programs = [...new Set(theses.map((thesis) => thesis.program_studi?.nama).filter(Boolean))].sort();
    const years = [...new Set(theses.map((thesis) => thesis.year).filter(Boolean))].sort((a, b) => b - a);
    const categories = [...new Set(theses.map((thesis) => thesis.category).filter(Boolean))].sort();

    return {
      programs,
      years,
      categories,
    };
  } catch (error) {
    throw new Error('Gagal mengambil opsi filter: ' + error.message);
  }
};

/**
 * Download a thesis by its ID
 * @param {string} thesisId - ID of the thesis to download
 * @returns {Promise<void>}
 */
export const downloadThesis = async (thesisId) => {
  try {
    // First, verify the thesis exists using the collection endpoint
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

    // Download file
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