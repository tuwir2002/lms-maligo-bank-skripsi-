const API_BASE_URL = 'http://localhost:1337/api';

const getAuthHeaders = (token) => {
  if (!token) {
    console.warn('No authentication token provided. API requests may fail.');
  }
  return {
    Authorization: token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
  };
};

// --- Mata Kuliah ---
export const fetchCoursesByDosen = async (nip, token) => {
  try {
    console.log(`Fetching courses for NIP: ${nip}`);
    const response = await fetch(
      `${API_BASE_URL}/matakuliahs?populate[pertemuans]=true&populate[dosens]=true&populate[program_studi]=true&filters[dosens][nip][$eq]=${nip}`,
      {
        headers: getAuthHeaders(token),
      }
    );
    const data = await handleResponse(response);
    console.log('Filtered Courses Response:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Error fetching courses by dosen:', error);
    throw error;
  }
};

// --- Kuis ---
export const fetchQuizzesByDosen = async (nip, token) => {
  try {
    console.log(`Fetching quizzes for NIP: ${nip}`);
    const response = await fetch(
      `${API_BASE_URL}/kuises?populate[pertemuan][populate][matakuliah]=true&populate[soal_kuis]=true&filters[pertemuan][matakuliah][dosens][nip][$eq]=${nip}`,
      {
        headers: getAuthHeaders(token),
      }
    );
    const data = await handleResponse(response);
    console.log('Filtered Quizzes Response:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Error fetching quizzes by dosen:', error);
    throw error;
  }
};

export const fetchQuizAnswersByDosen = async (nip, token) => {
  try {
    console.log(`Fetching quiz answers for NIP: ${nip}`);
    const response = await fetch(
      `${API_BASE_URL}/jawaban-kuises?populate[soal_kui][populate][kuis][populate][pertemuan][populate][matakuliah]=true&populate[mahasiswa]=true&filters[soal_kui][kuis][pertemuan][matakuliah][dosens][nip][$eq]=${nip}`,
      {
        headers: getAuthHeaders(token),
      }
    );
    const data = await handleResponse(response);
    console.log('Filtered Quiz Answers Response:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Error fetching quiz answers by dosen:', error);
    throw error;
  }
};

export const updateQuizAnswerGrade = async (documentId, grade, token) => {
  try {
    console.log(`Updating quiz answer grade for documentId: ${documentId}, grade: ${grade}`);
    const response = await fetch(`${API_BASE_URL}/jawaban-kuises/${documentId}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify({
        data: { nilai: grade },
      }),
    });
    const data = await handleResponse(response);
    console.log('Updated Quiz Answer Response:', JSON.stringify(data, null, 2));
    return data.data;
  } catch (error) {
    console.error('Error updating quiz answer grade:', error);
    throw error;
  }
};

// --- Ujian ---
export const fetchExamsByDosen = async (nip, token) => {
  try {
    console.log(`Fetching exams for NIP: ${nip}`);
    const response = await fetch(
      `${API_BASE_URL}/ujians?populate[matakuliah][populate][dosens]=true&filters[matakuliah][dosens][nip][$eq]=${nip}`,
      {
        headers: getAuthHeaders(token),
      }
    );
    const data = await handleResponse(response);
    if (!data.data || data.data.length === 0) {
      console.log('No exams found for this NIP');
      return { data: [] };
    }
    console.log('Filtered Exams Response:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Error fetching exams by dosen:', error);
    throw error;
  }
};

export const fetchExamQuestionsByDosen = async (nip, token) => {
  try {
    console.log(`Fetching exam questions for NIP: ${nip}`);
    const response = await fetch(
      `${API_BASE_URL}/soal-ujians?populate[ujian][populate][matakuliah][populate][dosens]=true&filters[ujian][matakuliah][dosens][nip][$eq]=${nip}`,
      {
        headers: getAuthHeaders(token),
      }
    );
    const data = await handleResponse(response);
    if (!data.data || data.data.length === 0) {
      console.log('No exam questions found for this NIP');
      return { data: [] };
    }
    console.log('Filtered Exam Questions Response:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Error fetching exam questions by dosen:', error);
    throw error;
  }
};

export const fetchExamAnswersByDosen = async (nip, token) => {
  try {
    console.log(`Fetching exam answers for NIP: ${nip}`);
    const response = await fetch(
      `${API_BASE_URL}/jawaban-ujians?populate[soal_ujian][populate][ujian][populate][matakuliah][populate][dosens]=true&populate[mahasiswa]=true&filters[soal_ujian][ujian][matakuliah][dosens][nip][$eq]=${nip}`,
      {
        headers: getAuthHeaders(token),
      }
    );
    const data = await handleResponse(response);
    if (!data.data || data.data.length === 0) {
      console.log('No exam answers found for this NIP');
      return { data: [] };
    }
    console.log('Filtered Exam Answers Response:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Error fetching exam answers by dosen:', error);
    throw error;
  }
};

export const updateExamAnswerGrade = async (documentId, grade, token) => {
  try {
    console.log(`Updating exam answer grade for documentId: ${documentId}, grade: ${grade}`);
    const response = await fetch(`${API_BASE_URL}/jawaban-ujians/${documentId}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify({
        data: { nilai: grade },
      }),
    });
    const data = await handleResponse(response);
    console.log('Updated Exam Answer Response:', JSON.stringify(data, null, 2));
    return data.data;
  } catch (error) {
    console.error('Error updating exam answer grade:', error);
    throw error;
  }
};

const handleResponse = async (response) => {
  console.log('API Response Status:', response.status, response.statusText);
  if (!response.ok) {
    const error = await response.json();
    console.error('API Error:', error);
    throw new Error(`API error: ${error.error?.message || 'Unknown error'}`);
  }
  const data = await response.json();
  console.log('API Response Data:', JSON.stringify(data, null, 2));
  return data;
};