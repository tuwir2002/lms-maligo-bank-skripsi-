/**
 * Service functions for interacting with the thesis bank API
 */
const API_BASE_URL = 'http://localhost:1337/api'; // Sesuaikan jika backend di host lain

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user?.token || '';
};

// Fetch mahasiswa to get program_studi ID
const fetchMahasiswaProgramStudi = async (nim) => {
  try {
    const url = `${API_BASE_URL}/mahasiswas?filters[nim][$eq]=${encodeURIComponent(nim)}&populate=program_studi`;
    console.log('Fetching mahasiswa program studi from:', url); // Debug log

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(getAuthToken() && { 'Authorization': `Bearer ${getAuthToken()}` }),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch mahasiswa: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    if (data.data.length === 0) {
      throw new Error(`Mahasiswa with NIM ${nim} not found`);
    }

    const programStudiId = data.data[0]?.program_studi?.id;
    if (!programStudiId) {
      throw new Error('Program studi not found for the student');
    }

    console.log('Mahasiswa program studi fetched:', { nim, programStudiId }); // Debug log
    return programStudiId;
  } catch (error) {
    console.error('Error in fetchMahasiswaProgramStudi:', error);
    throw error;
  }
};

// Fetch proposals to validate student and get category
const fetchProposalsByNim = async (nim) => {
  try {
    const url = `${API_BASE_URL}/proposals?filters[mahasiswa][nim][$eq]=${encodeURIComponent(nim)}&populate=*`;
    console.log('Fetching proposals from:', url); // Debug log

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(getAuthToken() && { 'Authorization': `Bearer ${getAuthToken()}` }),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch proposals: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error in fetchProposalsByNim:', error);
    throw new Error(`Failed to fetch proposals: ${error.message}`);
  }
};

// Upload thesis function (updated to handle file upload separately)
export const uploadThesis = async ({ title, author, year, file, abstract, proposalId, mahasiswaId }) => {
  try {
    // Validate student and fetch approved proposal
    const proposals = await fetchProposalsByNim(mahasiswaId);
    const approvedProposal = proposals.find(
      (p) => p.id === proposalId && p.status_class === 'approved' && p.topic?.title
    );

    if (!approvedProposal) {
      throw new Error('No approved proposal found for the provided student NIM');
    }

    // Get category from topic title
    const category = approvedProposal.topic.title.toLowerCase();

    // Get program_studi ID from mahasiswa
    const programStudiId = await fetchMahasiswaProgramStudi(mahasiswaId);

    // Step 1: Upload file to /api/upload
    const fileFormData = new FormData();
    fileFormData.append('files', file); // Strapi expects 'files' for /api/upload

    console.log('Uploading file to:', `${API_BASE_URL}/upload`); // Debug log
    const fileUploadResponse = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        ...(getAuthToken() && { 'Authorization': `Bearer ${getAuthToken()}` }),
      },
      body: fileFormData,
    });

    if (!fileUploadResponse.ok) {
      const errorText = await fileUploadResponse.text();
      throw new Error(`Failed to upload file: ${fileUploadResponse.status} ${fileUploadResponse.statusText} - ${errorText}`);
    }

    const fileData = await fileUploadResponse.json();
    console.log('File upload response:', fileData); // Debug log
    if (!fileData[0]?.id) {
      throw new Error('File upload failed: No file ID returned');
    }

    const fileId = fileData[0].id; // Get the uploaded file ID

    // Step 2: Prepare form data for thesis creation
    const thesisFormData = new FormData();
    thesisFormData.append('data[title]', title);
    thesisFormData.append('data[author]', author);
    thesisFormData.append('data[year]', year);
    thesisFormData.append('data[category]', category);
    thesisFormData.append('data[abstract]', JSON.stringify([
      {
        type: 'paragraph',
        children: [{ text: abstract, type: 'text' }],
      },
    ]));
    thesisFormData.append('data[program_studi]', programStudiId);
    thesisFormData.append('data[file]', fileId); // Reference the uploaded file ID

    // Debug: Log FormData contents
    console.log('Thesis FormData contents:');
    for (const [key, value] of thesisFormData.entries()) {
      console.log(`${key}: ${value}`);
    }

    // Step 3: Create thesis entry
    const url = `${API_BASE_URL}/theses?populate=*`;
    console.log('Creating thesis at:', url); // Debug log
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(getAuthToken() && { 'Authorization': `Bearer ${getAuthToken()}` }),
      },
      body: thesisFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create thesis: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Thesis creation response:', data); // Debug log
    return data.data;
  } catch (error) {
    console.error('Error in uploadThesis:', error);
    throw new Error(`Failed to create thesis: ${error.message}`);
  }
};

/**
 * Fetch all skripsis with pagination and filters
 * @param {number} page - Current page number
 * @param {number} itemsPerPage - Number of items per page
 * @param {Object} filters - Filter parameters (keyword, program, year, category, sortBy)
 * @returns {Promise<Object>} - Object containing skripsis data, totalPages, and totalItems
 */
export const fetchAllTheses = async (page = 1, itemsPerPage = 10, filters = {}) => {
  try {
    const queryParams = new URLSearchParams({
      'pagination[page]': page,
      'pagination[pageSize]': itemsPerPage,
      'filters[title][$containsi]': filters.keyword || '',
      'filters[program_studi][nama][$eq]': filters.program || '', // Filter pada nama program_studi
      'filters[year][$eq]': filters.year || '',
      'filters[category][$eq]': filters.category || '',
      'sort': filters.sortBy === 'newest' ? 'createdAt:desc' : 'createdAt:asc',
      'populate': '*' // Populate semua relasi (file, program_studi)
    });

    const url = `${API_BASE_URL}/skripsis?${queryParams}`;
    console.log('Fetching skripsis from:', url); // Debug log

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(getAuthToken() && { 'Authorization': `Bearer ${getAuthToken()}` }),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch skripsis: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const skripsis = data.data.map(item => ({
      id: item.id,
      title: item.title,
      author: item.mahasiswa?.namaLengkap || '',
      year: item.year,
      program: item.program_studi?.nama || '',
      category: item.category,
      file: item.file?.url ? `http://localhost:1337${item.file.url}` : null,
      abstract: item.abstract ? item.abstract : ''
    }));

    return {
      data: skripsis,
      totalPages: data.meta?.pagination?.pageCount || 1,
      totalItems: data.meta?.pagination?.total || 0,
    };
  } catch (error) {
    console.error('Error in fetchAllTheses:', error);
    throw error;
  }
};

/**
 * Search skripsis based on filters
 * @param {Object} filters - Filter parameters (keyword, program, year, category, sortBy)
 * @returns {Promise<Object>} - Object containing skripsis data
 */
export const searchTheses = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams({
      'filters[title][$containsi]': filters.keyword || '',
      'filters[program_studi][nama][$eq]': filters.program || '',
      'filters[year][$eq]': filters.year || '',
      'filters[category][$eq]': filters.category || '',
      'sort': filters.sortBy === 'newest' ? 'createdAt:desc' : 'createdAt:asc',
      'populate': '*'
    });

    const url = `${API_BASE_URL}/skripsis/search?${queryParams}`;
    console.log('Searching skripsis from:', url); // Debug log

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(getAuthToken() && { 'Authorization': `Bearer ${getAuthToken()}` }),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to search skripsis: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const skripsis = data.data.map(item => ({
      id: item.id,
      title: item.title,
      author: item.mahasiswa?.namaLengkap || '',
      year: item.year,
      program: item.program_studi?.nama || '',
      category: item.category,
      file: item.file?.url ? `http://localhost:1337${item.file.url}` : null,
      abstract: item.abstract ? item.abstract : ''
    }));

    return {
      data: skripsis,
    };
  } catch (error) {
    console.error('Error in searchTheses:', error);
    throw error;
  }
};

/**
 * Fetch all lecturers
 * @returns {Promise<Object>} - Object containing lecturers data
 */
export const fetchLecturers = async () => {
  try {
    const url = `${API_BASE_URL}/dosens?populate=*`;
    console.log('Fetching lecturers from:', url); // Debug log

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(getAuthToken() && { 'Authorization': `Bearer ${getAuthToken()}` }),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch lecturers: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const lecturers = data.data.map(item => ({
      id: item.id,
      name: item.namaLengkap,
    }));

    return {
      data: lecturers,
    };
  } catch (error) {
    console.error('Error in fetchLecturers:', error);
    throw error;
  }
};

/**
 * Fetch topics by lecturer ID
 * @param {string} lecturerId - ID of the lecturer
 * @returns {Promise<Object>} - Object containing topics data
 */
export const fetchTopicsByLecturer = async (lecturerId) => {
  try {
    const queryParams = new URLSearchParams({
      'filters[dosen][id][$eq]': lecturerId,
      'populate': '*',
    });

    const url = `${API_BASE_URL}/topics?${queryParams}`;
    console.log('Fetching topics from:', url); // Debug log

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(getAuthToken() && { 'Authorization': `Bearer ${getAuthToken()}` }),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch topics: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const topics = data.data.map(item => ({
      id: item.id,
      title: item.title,
    }));

    return {
      data: topics,
    };
  } catch (error) {
    console.error('Error in fetchTopicsByLecturer:', error);
    throw error;
  }
};

/**
 * Submit a thesis proposal
 * @param {Object} proposalData - Proposal data containing lecturerId, topicId, judul, and description
 * @returns {Promise<Object>} - Response data from the server
 */
export const submitThesisProposal = async (proposalData) => {
  try {
    // Validate input
    if (!proposalData.judul || typeof proposalData.judul !== 'string' || proposalData.judul.trim() === '') {
      throw new Error('Judul is required and must be a non-empty string');
    }
    if (!proposalData.description || typeof proposalData.description !== 'string' || proposalData.description.trim() === '') {
      throw new Error('Description is required and must be a non-empty string');
    }
    if (!proposalData.lecturerId || !proposalData.topicId) {
      throw new Error('Lecturer ID and Topic ID are required');
    }

    const userData = localStorage.getItem('user');
    if (!userData) {
      throw new Error('User data not found in localStorage');
    }

    let nim;
    try {
      // Handle both string and JSON user data
      nim = userData.startsWith('{') ? JSON.parse(userData).username : userData;
    } catch (parseError) {
      console.error('Failed to parse user data:', parseError);
      throw new Error('Invalid user data format in localStorage');
    }

    if (!nim || typeof nim !== 'string') {
      throw new Error('Invalid NIM: NIM is missing or not a string');
    }

    console.log('Fetching mahasiswa with NIM:', nim); // Debug log
    const mahasiswa = await fetchMahasiswaByNim(nim);
    if (!mahasiswa?.id) {
      throw new Error('Mahasiswa data not found or invalid');
    }

    console.log('Submitting proposal with data:', {
      lecturerId: proposalData.lecturerId,
      topicId: proposalData.topicId,
      judul: proposalData.judul,
      description: proposalData.description,
      mahasiswaId: mahasiswa.id,
    }); // Debug log

    const url = `${API_BASE_URL}/proposals`;
    console.log('Submitting proposal to:', url); // Debug log

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(getAuthToken() && { 'Authorization': `Bearer ${getAuthToken()}` }),
      },
      body: JSON.stringify({
        data: {
          dosen: proposalData.lecturerId,
          topic: proposalData.topicId,
          judul: proposalData.judul,
          description: proposalData.description,
          mahasiswa: mahasiswa.id,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to submit proposal: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Proposal submission response:', data); // Debug log
    return data;
  } catch (error) {
    console.error('Error in submitThesisProposal:', error);
    throw error;
  }
};

/**
 * Fetch thesis proposals for the logged-in student, filtered by status (optional)
 * @param {string} [status] - Optional status filter (e.g., 'approved', 'pending')
 * @returns {Promise<Object>} - Object containing proposals data
 */
export const fetchThesisProposals = async (status = '') => {
  try {
    // Retrieve user data from localStorage
    const userData = localStorage.getItem('user');
    let nim;
    if (!userData) {
      throw new Error('User data not found in localStorage');
    }

    try {
      // Handle both string and JSON user data
      nim = userData.startsWith('{') ? JSON.parse(userData).username : userData;
    } catch (parseError) {
      console.error('Failed to parse user data:', parseError);
      throw new Error('Invalid user data format in localStorage');
    }

    if (!nim || typeof nim !== 'string') {
      throw new Error('Invalid NIM: NIM is missing or not a string');
    }

    // Construct query parameters
    const queryParams = new URLSearchParams({
      'filters[mahasiswa][nim][$eq]': encodeURIComponent(nim), // Filter by student's NIM
      ...(status && { 'filters[status_class][$eq]': status }), // Optional status filter
      'populate': '*', // Populate all relations (dosen, topic, etc.)
    });

    const url = `${API_BASE_URL}/proposals?${queryParams}`;
    console.log('Fetching proposals from:', url); // Debug log

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(getAuthToken() && { 'Authorization': `Bearer ${getAuthToken()}` }),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch proposals: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const proposals = data.data.map(item => ({
      id: item.id,
      dosen: item.dosen?.namaLengkap || 'Unknown',
      dosenId: item.dosen?.id || null,
      topic: item.topic?.title || 'Unknown',
      topicId: item.topic?.id || null,
      status: item.status_class || 'pending',
      skripsi: item.skripsi || null,
      judul: item.judul || '',
      description: item.description || '',
    }));

    return {
      data: proposals,
    };
  } catch (error) {
    console.error('Error in fetchThesisProposals:', error);
    throw error;
  }
};

/**
 * Check for active thesis submission
 * @returns {Promise<Object>} - Object containing active submission data or null
 */
export const checkActiveSubmission = async () => {
  try {
    const url = `${API_BASE_URL}/proposals?filters[status_class][$eq]=approved&populate=*`;
    console.log('Checking active submission from:', url); // Debug log

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(getAuthToken() && { 'Authorization': `Bearer ${getAuthToken()}` }),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to check active submission: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    if (data.data.length > 0) {
      const item = data.data[0];
      return {
        data: {
          id: item.id,
          dosenId: item.dosen?.id || null,
          topicId: item.topic?.id || null,
          topicTitle: item.topic?.title || null,
          status: item.status_class || 'pending',
          judul: item.judul || '',
          description: item.description || '',
        },
      };
    }

    return { data: null };
  } catch (error) {
    console.error('Error in checkActiveSubmission:', error);
    throw error;
  }
};

/**
 * Check if mahasiswa has submitted a thesis
 * @returns {Promise<boolean>} - True if mahasiswa has submitted a thesis, false otherwise
 */
export const checkSubmittedThesis = async () => {
  try {
    const userData = localStorage.getItem('user');
    let nim = userData;
    if (userData.startsWith('{')) {
      try {
        nim = JSON.parse(userData).username;
      } catch (parseError) {
        throw new Error('Invalid user data in localStorage: ' + parseError.message);
      }
    }

    if (!nim || typeof nim !== 'string') {
      throw new Error('Invalid NIM format');
    }

    const mahasiswa = await fetchMahasiswaByNim(nim);
    const url = `${API_BASE_URL}/skripsis?filters[mahasiswa][id][$eq]=${mahasiswa.id}&populate=*`;
    console.log('Checking submitted thesis from:', url); // Debug log

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(getAuthToken() && { 'Authorization': `Bearer ${getAuthToken()}` }),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to check submitted thesis: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Submitted thesis response:', data); // Debug log
    return data.data.length > 0;
  } catch (error) {
    console.error('Error in checkSubmittedThesis:', error);
    return false;
  }
};

/**
 * Fetch mahasiswa by NIM
 * @param {string} nimInput - NIM of the mahasiswa or JSON string containing NIM
 * @returns {Promise<Object>} - Mahasiswa data
 */
export const fetchMahasiswaByNim = async (nimInput) => {
  try {
    let nim = nimInput;
    if (typeof nimInput === 'string' && nimInput.startsWith('{')) {
      try {
        const userData = JSON.parse(nimInput);
        nim = userData.username || userData.nim;
        console.log('Parsed user data:', { userData, extractedNim: nim }); // Debug log
      } catch (parseError) {
        console.error('Failed to parse user data:', parseError);
        throw new Error('Invalid user data in localStorage: ' + parseError.message);
      }
    }

    // Allow 'saepulloh' to map to '21254322017' for testing
    if (nim === 'saepulloh') {
      nim = '21254322017';
      console.log('Mapped username "saepulloh" to NIM:', nim); // Debug log
    }

    if (!nim || typeof nim !== 'string' || nim.trim() === '') {
      throw new Error('Invalid NIM: NIM is missing, not a string, or empty');
    }

    const url = `${API_BASE_URL}/mahasiswas?filters[nim][$eq]=${encodeURIComponent(nim)}&populate=*`;
    console.log('Fetching mahasiswa from:', url); // Debug log

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(getAuthToken() && { 'Authorization': `Bearer ${getAuthToken()}` }),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch mahasiswa: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    if (data.data.length === 0) {
      throw new Error(`Mahasiswa with NIM ${nim} not found`);
    }

    const mahasiswaData = data.data[0];
    if (!mahasiswaData.id) {
      throw new Error('Mahasiswa data missing ID');
    }

    console.log('Mahasiswa data fetched:', mahasiswaData); // Debug log
    return mahasiswaData;
  } catch (error) {
    console.error('Error in fetchMahasiswaByNim:', error);
    throw error;
  }
};

/**
 * Submit a thesis title and description
 * @param {Object} submissionData - Submission data containing proposalId, title, description, and mahasiswaId
 * @returns {Promise<Object>} - Response data from the server
 */
export const submitThesisTitle = async (submissionData) => {
  try {
    const url = `${API_BASE_URL}/skripsis`;
    console.log('Submitting skripsi title to:', url, submissionData); // Debug log

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(getAuthToken() && { 'Authorization': `Bearer ${getAuthToken()}` }),
      },
      body: JSON.stringify({
        data: {
          title: submissionData.title,
          abstract: submissionData.description,
          proposal: submissionData.proposalId,
          mahasiswa: submissionData.mahasiswaId,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to submit skripsi title: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in submitThesisTitle:', error);
    throw error;
  }
};

/**
 * Fetch proposal by ID
 * @param {string} proposalId - ID of the proposal
 * @returns {Promise<Object>} - Proposal data
 */
export const fetchProposalById = async (proposalId) => {
  try {
    const url = `${API_BASE_URL}/proposals/${proposalId}?populate=*`;
    console.log('Fetching proposal from:', url); // Debug log

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(getAuthToken() && { 'Authorization': `Bearer ${getAuthToken()}` }),
      },
    });

    const responseText = await response.text();
    console.log('Proposal fetch response:', { status: response.status, body: responseText }); 

    if (!response.ok) {
      throw new Error(`Failed to fetch proposal with ID ${proposalId}: ${response.status} ${response.statusText} - ${responseText}`);
    }

    const data = JSON.parse(responseText);
    if (!data.data) {
      throw new Error(`Proposal with ID ${proposalId} not found`);
    }

    const proposal = {
      id: data.data.id,
      dosen: data.data.dosen?.namaLengkap || 'Unknown',
      dosenId: data.data.dosen?.id || null,
      topic: data.data.topic?.title || 'Unknown',
      topicId: data.data.topic?.id || null,
      status: data.data.status_class || 'pending',
      skripsi: data.data.skripsi || null,
      judul: data.data.judul || '',
      description: data.data.description || '',
    };

    console.log('Proposal data fetched:', proposal); // Debug log
    return proposal;
  } catch (error) {
    console.error('Error in fetchProposalById:', error);
    throw error;
  }
};