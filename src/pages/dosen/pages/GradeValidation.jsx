import React, { useState, useEffect, useContext, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Grid,
  Tabs,
  Tab,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  InputAdornment,
  Chip,
  Skeleton,
} from '@mui/material';
import { motion } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { AuthContext } from '../../../context/AuthContext';
import {
  fetchCoursesByDosen,
  fetchQuizzesByDosen,
  fetchQuizAnswersByDosen,
  updateQuizAnswerGrade,
  fetchExamsByDosen,
  fetchExamQuestionsByDosen,
  fetchExamAnswersByDosen,
  updateExamAnswerGrade,
} from '../utils/gradeService';
import GradeModalStudent from '../components/GradeModalStudent';
import GradeModalExam from '../components/GradeModalExam';
import { debounce } from 'lodash';

const TabPanel = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const StudentCard = ({ student, onOpenModal }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <Card
      sx={{
        borderRadius: 2,
        boxShadow: '0 4px 12px rgba(5, 13, 49, 0.1)',
        '&:hover': { boxShadow: '0 6px 16px rgba(5, 13, 49, 0.2)' },
      }}
    >
      <CardContent>
        <Typography variant="h6">{student.namaLengkap}</Typography>
        <Typography variant="body2" color="text.secondary">
          NIM: {student.nim}
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={() => onOpenModal(student)}
        >
          Detail
        </Button>
      </CardActions>
    </Card>
  </motion.div>
);

const GradeValidation = () => {
  const { user, token, loading: authLoading } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [courses, setCourses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [exams, setExams] = useState([]);
  const [examQuestions, setExamQuestions] = useState([]);
  const [examAnswers, setExamAnswers] = useState([]);
  const [filters, setFilters] = useState({
    matakuliahIds: [],
    pertemuanId: '',
    examId: '',
    searchNama: '',
  });
  const [editGrades, setEditGrades] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalOpenQuiz, setModalOpenQuiz] = useState(false);
  const [modalOpenExam, setModalOpenExam] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Debounced search handler
  const debouncedSearch = debounce((value) => {
    setFilters((prev) => ({ ...prev, searchNama: value }));
  }, 300);

  // Fetch data
  useEffect(() => {
    const loadData = async () => {
      if (authLoading) return;
      if (!token || !user || user.peran?.toLowerCase() !== 'dosen') {
        setError('Please log in as a dosen to access this page.');
        return;
      }
      if (!user.username) {
        setError('User NIP not found. Please log in again.');
        return;
      }
      setLoading(true);
      try {
        console.log('Fetching data for NIP:', user.username);
        const [
          coursesDataResponse,
          quizzesDataResponse,
          quizAnswersDataResponse,
          examsDataResponse,
          examQuestionsDataResponse,
          examAnswersDataResponse,
        ] = await Promise.all([
          fetchCoursesByDosen(user.username, token),
          fetchQuizzesByDosen(user.username, token),
          fetchQuizAnswersByDosen(user.username, token),
          fetchExamsByDosen(user.username, token),
          fetchExamQuestionsByDosen(user.username, token),
          fetchExamAnswersByDosen(user.username, token),
        ]);

        const coursesData = Array.isArray(coursesDataResponse?.data) ? coursesDataResponse.data : [];
        const quizzesData = Array.isArray(quizzesDataResponse?.data) ? quizzesDataResponse.data : [];
        const quizAnswersData = Array.isArray(quizAnswersDataResponse?.data) ? quizAnswersDataResponse.data : [];
        const examsData = Array.isArray(examsDataResponse?.data) ? examsDataResponse.data : [];
        const examQuestionsData = Array.isArray(examQuestionsDataResponse?.data) ? examQuestionsDataResponse.data : [];
        const examAnswersData = Array.isArray(examAnswersDataResponse?.data) ? examAnswersDataResponse.data : [];

        console.log('Filtered Data:', {
          coursesData,
          quizzesData,
          quizAnswersData,
          examsData,
          examQuestionsData,
          examAnswersData,
        });

        setCourses(coursesData);
        setQuizzes(quizzesData);
        setQuizAnswers(quizAnswersData);
        setExams(examsData);
        setExamQuestions(examQuestionsData);
        setExamAnswers(examAnswersData);
        setError(null);
      } catch (err) {
        setError(
          err.message.includes('Invalid key')
            ? 'Failed to load data due to incorrect database relations. Please contact the administrator.'
            : `Failed to load data: ${err.message}`
        );
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [authLoading, token, user]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setFilters((prev) => ({ ...prev, searchNama: '', pertemuanId: '', examId: '' }));
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value };
      if (key === 'matakuliahIds') {
        newFilters.pertemuanId = '';
        newFilters.examId = '';
      }
      return newFilters;
    });
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      matakuliahIds: [],
      pertemuanId: '',
      examId: '',
      searchNama: '',
    });
  };

  // Get unique meetings
  const meetings = useMemo(() => {
    const meetingMap = new Map();
    quizzes
      .filter((quiz) => {
        if (!quiz?.pertemuan) return false;
        if (filters.matakuliahIds.length === 0) return true;
        const course = courses.find((c) => {
          const pertemuans = c.attributes?.pertemuans?.data || c.pertemuans || [];
          return pertemuans.some((p) => p.id === quiz.pertemuan.id);
        });
        return course && filters.matakuliahIds.includes(String(course.id));
      })
      .forEach((quiz) => {
        const meeting = {
          id: quiz.pertemuan.id,
          pertemuanKe: quiz.pertemuan.pertemuanKe,
          topik: quiz.pertemuan.topik,
          tanggal: quiz.pertemuan.tanggal,
        };
        meetingMap.set(meeting.id, meeting);
      });
    return Array.from(meetingMap.values()).sort((a, b) => a.pertemuanKe - b.pertemuanKe);
  }, [quizzes, courses, filters.matakuliahIds]);

  // Get unique exams
  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      if (filters.matakuliahIds.length === 0) return true;
      return filters.matakuliahIds.includes(String(exam.attributes?.matakuliah?.data?.id || exam.matakuliah?.id));
    });
  }, [exams, filters.matakuliahIds]);

  // Filter answers (quiz or exam)
  const filterAnswers = (answers, type) => {
    return answers.filter((answer) => {
      if (type === 'quiz' && (!answer?.soal_kui || !answer?.mahasiswa)) return false;
      if (type === 'exam' && (!answer?.soal_ujian || !answer?.mahasiswa)) return false;

      const item = type === 'quiz' ? answer.soal_kui : answer.soal_ujian;
      const parent = type === 'quiz' ? quizzes.find((q) => q.id === item?.kuis?.id) : exams.find((e) => e.id === (item?.ujian?.id || item?.ujian?.data?.id));
      const courseId = type === 'quiz' ? parent?.pertemuan?.matakuliah?.id : (parent?.attributes?.matakuliah?.data?.id || parent?.matakuliah?.id);
      const mahasiswa = answer.mahasiswa;

      const matchesMatakuliah = filters.matakuliahIds.length === 0 || (courseId && filters.matakuliahIds.includes(String(courseId)));
      const matchesParent = type === 'quiz' ? 
        (filters.pertemuanId === '' || (parent && String(parent.pertemuan?.id) === filters.pertemuanId)) :
        (filters.examId === '' || (parent && String(parent.id) === filters.examId));
      const matchesSearchNama =
        filters.searchNama === '' ||
        (mahasiswa?.namaLengkap?.toLowerCase().includes(filters.searchNama.toLowerCase()) ||
          mahasiswa?.nim?.toLowerCase().includes(filters.searchNama.toLowerCase()));

      return matchesMatakuliah && matchesParent && matchesSearchNama;
    });
  };

  const filteredQuizAnswers = useMemo(() => filterAnswers(quizAnswers, 'quiz'), [quizAnswers, filters, courses, quizzes]);
  const filteredExamAnswers = useMemo(() => filterAnswers(examAnswers, 'exam'), [examAnswers, filters, exams]);

  // Group answers by student
  const uniqueStudents = useMemo(() => {
    const answers = tabValue === 0 ? filteredQuizAnswers : filteredExamAnswers;
    return Array.from(
      new Map(
        answers
          .filter((answer) => answer.mahasiswa?.nim)
          .map((answer) => [
            answer.mahasiswa.nim,
            {
              nim: answer.mahasiswa.nim || 'N/A',
              namaLengkap: answer.mahasiswa.namaLengkap || 'N/A',
              answers: answers.filter((a) => a.mahasiswa?.nim === answer.mahasiswa.nim),
            },
          ])
      ).values()
    );
  }, [filteredQuizAnswers, filteredExamAnswers, tabValue]);

  const handleGradeChange = (answerId, value, type) => {
    const numValue = parseFloat(value);
    if (value === '' || (numValue >= 0 && numValue <= 100)) {
      setEditGrades((prev) => ({
        ...prev,
        [`${type}_${answerId}`]: value,
      }));
    }
  };

  const handleSaveGrade = async (documentId, answerId, type) => {
    const key = `${type}_${answerId}`;
    const grade = editGrades[key];
    if (grade === undefined || grade === '' || isNaN(grade) || grade < 0 || grade > 100) {
      setError('Please enter a valid grade (0-100).');
      return;
    }
    setLoading(true);
    try {
      console.log(`Saving ${type} grade: documentId=${documentId}, answerId=${answerId}, grade=${grade}`);
      const updateFn = type === 'quiz' ? updateQuizAnswerGrade : updateExamAnswerGrade;
      const updatedAnswer = await updateFn(documentId, parseFloat(grade), token);
      if (type === 'quiz') {
        setQuizAnswers((prev) =>
          prev.map((answer) =>
            answer.id === answerId ? { ...answer, nilai: parseFloat(grade) } : answer
          )
        );
      } else {
        setExamAnswers((prev) =>
          prev.map((answer) =>
            answer.documentId === documentId ? { ...answer, ...updatedAnswer } : answer
          )
        );
      }
      setEditGrades((prev) => {
        const newGrades = { ...prev };
        delete newGrades[key];
        return newGrades;
      });
      setError(null);
    } catch (err) {
      console.error(`Failed to save ${type} grade:`, err);
      setError(`Failed to update grade: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (student, type) => {
    if (!student || !student.nim) {
      setError('Cannot open modal: Invalid student data.');
      return;
    }
    setSelectedStudent(student);
    if (type === 'quiz') {
      setModalOpenQuiz(true);
    } else {
      setModalOpenExam(true);
    }
  };

  const handleCloseModal = (type) => {
    if (type === 'quiz') {
      setModalOpenQuiz(false);
    } else {
      setModalOpenExam(false);
    }
    setSelectedStudent(null);
  };

  const handleDrawerToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Sidebar open={sidebarOpen} handleDrawerToggle={handleDrawerToggle} role="dosen" />
      <Box
        sx={{
          flexGrow: 1,
          ml: sidebarOpen ? { xs: 0, md: '0px' } : { xs: 0, md: '0px' },
          transition: 'margin-left 0.3s ease-in-out',
          width: '100%',
        }}
      >
        <Header title="Validasi Nilai" />
        <Box sx={{ p: { xs: 2, md: 4 }, mt: '64px', minHeight: 'calc(100vh - 64px)' }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: '#050D31' }}>
            Validasi Nilai
          </Typography>

          {authLoading && (
            <Box sx={{ my: 4 }}>
              <Skeleton variant="rectangular" height={400} />
            </Box>
          )}

          {!authLoading && error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {!authLoading && !error && (
            <>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab label="Validasi Nilai Kuis" />
                <Tab label="Validasi Nilai Ujian" />
              </Tabs>

              <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center', flexWrap: 'wrap' }}>
                <FormControl sx={{ minWidth: 200 }} size="small">
                  <InputLabel id="course-select-label">Mata Kuliah</InputLabel>
                  <Select
                    labelId="course-select-label"
                    multiple
                    value={filters.matakuliahIds}
                    label="Mata Kuliah"
                    onChange={(e) => handleFilterChange('matakuliahIds', e.target.value)}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip
                            key={value}
                            label={courses.find((c) => c.id === Number(value))?.attributes?.nama || value}
                          />
                        ))}
                      </Box>
                    )}
                  >
                    {courses.map((course) => (
                      <MenuItem key={course.id} value={String(course.id)}>
                        {course.attributes?.nama || course.nama || 'N/A'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {tabValue === 0 ? (
                  <FormControl sx={{ minWidth: 200 }} size="small">
                    <InputLabel id="pertemuan-select-label">Pertemuan</InputLabel>
                    <Select
                      labelId="pertemuan-select-label"
                      value={filters.pertemuanId}
                      label="Pertemuan"
                      onChange={(e) => handleFilterChange('pertemuanId', e.target.value)}
                    >
                      <MenuItem value="">Semua Pertemuan</MenuItem>
                      {meetings.map((meeting) => (
                        <MenuItem key={meeting.id} value={String(meeting.id)}>
                          Pertemuan {meeting.pertemuanKe} - {meeting.topik}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <FormControl sx={{ minWidth: 200 }} size="small">
                    <InputLabel id="exam-select-label">Ujian</InputLabel>
                    <Select
                      labelId="exam-select-label"
                      value={filters.examId}
                      label="Ujian"
                      onChange={(e) => handleFilterChange('examId', e.target.value)}
                    >
                      <MenuItem value="">Semua Ujian</MenuItem>
                      {filteredExams.map((exam) => (
                        <MenuItem key={exam.id} value={String(exam.id)}>
                          {exam.judul || 'N/A'}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                <TextField
                  size="small"
                  placeholder="Cari Mahasiswa atau NIM"
                  defaultValue={filters.searchNama}
                  onChange={(e) => debouncedSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ width: 250, '& .MuiInputBase-input': {
                  color: '#000000 !important', 
                }, }}
                />
                <Button
                  variant="outlined"
                  onClick={handleResetFilters}
                  sx={{ height: 'fit-content', alignSelf: 'center', color:'#fff' }}
                >
                  Reset Filters
                </Button>
              </Box>

              {loading ? (
                <Grid container spacing={2}>
                  {[...Array(6)].map((_, i) => (
                    <Grid item xs={12} sm={6} md={4} key={i}>
                      <Skeleton variant="rectangular" height={150} />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Grid container spacing={2}>
                  {uniqueStudents.length === 0 ? (
                    <Grid item xs={12}>
                      <Typography variant="h6" align="center" sx={{ mt: 4, color: '#050D31' }}>
                        Belum ada data!
                      </Typography>
                    </Grid>
                  ) : (
                    uniqueStudents.map((student) => (
                      <Grid item xs={12} sm={6} md={4} key={student.nim}>
                        <StudentCard
                          student={student}
                          onOpenModal={() => handleOpenModal(student, tabValue === 0 ? 'quiz' : 'exam')}
                        />
                      </Grid>
                    ))
                  )}
                </Grid>
              )}
            </>
          )}
        </Box>
      </Box>

      {selectedStudent && (
        <>
          <GradeModalStudent
            open={modalOpenQuiz}
            onClose={() => handleCloseModal('quiz')}
            student={selectedStudent}
            quizzes={quizzes}
            meetings={meetings}
            editGrades={editGrades}
            onGradeChange={(id, value) => handleGradeChange(id, value, 'quiz')}
            onSaveGrade={(docId, id) => handleSaveGrade(docId, id, 'quiz')}
            loading={loading}
          />
          <GradeModalExam
            open={modalOpenExam}
            onClose={() => handleCloseModal('exam')}
            student={selectedStudent}
            exams={exams}
            examAnswers={filteredExamAnswers}
            editGrades={editGrades}
            onGradeChange={(id, value) => handleGradeChange(id, value, 'exam')}
            onSaveGrade={(docId, id) => handleSaveGrade(docId, id, 'exam')}
            loading={loading}
          />
        </>
      )}
    </Box>
  );
};

export default GradeValidation;