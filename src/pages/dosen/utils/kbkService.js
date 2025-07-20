// kbkService.js
import axios from 'axios';

const API_URL = 'http://localhost:1337/api';
const getToken = () => localStorage.getItem('token');

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
axiosInstance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getKbkInfoList = async () => {
  try {
    const response = await axiosInstance.get('/kbk-infos?populate=*');
    if (!response.data || !Array.isArray(response.data.data)) {
      throw new Error('Invalid response format from API');
    }
    console.log('Raw API response:', response.data); // Debug log
    return response.data;
  } catch (error) {
    console.error('Error fetching KBK info:', error);
    throw new Error('Failed to fetch KBK info list');
  }
};

export const createKbkInfo = async (formData) => {
  try {
    // Step 1: Upload file to /api/upload
    const fileFormData = new FormData();
    fileFormData.append('files', formData.get('files.file')); // Get file from FormData
    const fileResponse = await axiosInstance.post('/upload', fileFormData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('File upload response:', fileResponse.data); // Debug log
    const fileId = fileResponse.data[0]?.id;
    if (!fileId) {
      throw new Error('File upload failed: No file ID returned');
    }

    // Step 2: Create kbk-infos entry with file ID
    const kbkData = JSON.parse(formData.get('data')); // Get data from FormData
    const kbkResponse = await axiosInstance.post('/kbk-infos', {
      data: {
        title: kbkData.title,
        description: kbkData.description,
        date: kbkData.date,
        file: fileId, // Link file ID
      },
    });
    console.log('Create kbk-infos response:', kbkResponse.data); // Debug log
    return kbkResponse.data;
  } catch (error) {
    console.error('Error creating KBK info:', error);
    throw new Error('Failed to create KBK info');
  }
};

export const updateKbkInfo = async (documentId, formData) => {
  try {
    let fileId = null;
    const file = formData.get('files.file');
    
    // Step 1: If a new file is provided, upload it
    if (file) {
      const fileFormData = new FormData();
      fileFormData.append('files', file);
      const fileResponse = await axiosInstance.post('/upload', fileFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('File upload response:', fileResponse.data); // Debug log
      fileId = fileResponse.data[0]?.id;
      if (!fileId) {
        throw new Error('File upload failed: No file ID returned');
      }
    }

    // Step 2: Update kbk-infos entry
    const kbkData = JSON.parse(formData.get('data')); // Get data from FormData
    const updateData = {
      data: {
        title: kbkData.title,
        description: kbkData.description,
        date: kbkData.date,
      },
    };
    if (fileId) {
      updateData.data.file = fileId; // Include file ID if a new file was uploaded
    }

    const kbkResponse = await axiosInstance.put(`/kbk-infos/${documentId}`, updateData);
    console.log('Update kbk-infos response:', kbkResponse.data); // Debug log
    return kbkResponse.data;
  } catch (error) {
    console.error('Error updating KBK info:', error);
    throw new Error('Failed to update KBK info');
  }
};