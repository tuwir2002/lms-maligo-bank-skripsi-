import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import ConfirmEmailPage from '../pages/auth/ConfirmEmailPage';
import RegisterSuccessPage from '../pages/auth/RegisterSuccessPage';
import LandingPage from '../pages/landing/LandingPage';
import DashboardDosen from '../pages/dosen/DashboardDosen';
import CourseManagement from '../pages/dosen/pages/CourseManagement';
import Rekapitulasi from '../pages/dosen/pages/Rekapitulasi';
import GradeValidation from '../pages/dosen/pages/GradeValidation';
import ExamManagement from '../pages/dosen/pages/ExamManagement';
import ProfilePage from '../pages/auth/ProfilePage';
import DashboardMahasiswa from '../pages/mahasiswa/DashboardMahasiswa';
import EnrolledCourses from '../pages/mahasiswa/pages/EnrolledCourses';
import CourseDetail from '../pages/mahasiswa/pages/CourseDetail';
import MeetingDetail from '../pages/mahasiswa/components/MeetingDetail';
import QuizDetail from '../pages/mahasiswa/components/QuizDetail';
import Assignments from '../pages/mahasiswa/pages/Assignments';
import ExamPage from '../pages/mahasiswa/pages/ExamPage';
import ExamDetail from '../pages/mahasiswa/pages/ExamDetail';
import ExamInterface from '../pages/mahasiswa/pages/ExamInterface';
import DosenLayout from '../layouts/DosenLayout';
import MahasiswaLayout from '../layouts/MahasiswaLayout';
import NotFound from '../pages/NotFound';
import BankSkripsi from '../pages/mahasiswa/pages/BankSkripsi';
import StudentProgress from '../pages/mahasiswa/pages/StudentProgress';
import DosenProfilePage from '../pages/dosen/pages/ProfilePage';
import MahasiswaProfilePage from '../pages/mahasiswa/pages/ProfilePage';
import SkripsiManagement from '../pages/dosen/pages/SkripsiManagement';
import TeamKBK from '../pages/dosen/pages/TimKBK';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/register-success" element={<RegisterSuccessPage />} />
      <Route path="/email-confirmation" element={<ConfirmEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="profile" element={<ProfilePage />} />

      {/* Role-Based Redirect Route */}
      <Route path="/dashboard" element={<PrivateRoute />} />

      {/* Dosen Routes */}
      <Route
        path="/dosen/*"
        element={
          <PrivateRoute requiredRole="dosen">
            <DosenLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardDosen />} />
        <Route path="courses" element={<CourseManagement />} />
        <Route path="progress" element={<Rekapitulasi />} />
        <Route path="grade-validation" element={<GradeValidation />} />
        <Route path="exams" element={<ExamManagement />} />
        <Route path="profile" element={<DosenProfilePage />} />
        <Route path="bank-skripsi" element={<SkripsiManagement/>} />
        <Route path="kbk" element={<TeamKBK/>} />
      </Route>

      {/* Mahasiswa Routes */}
      <Route
        path="/mahasiswa/*"
        element={
          <PrivateRoute requiredRole="mahasiswa">
            <MahasiswaLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardMahasiswa />} />
        <Route path="courses" element={<EnrolledCourses />} />
        <Route path="courses/:code" element={<CourseDetail />}>
          <Route path="pertemuan/:meetingNumber" element={<MeetingDetail />} />
          <Route path="pertemuan/:meetingNumber/quiz/:quizId" element={<QuizDetail />} />
        </Route>
        <Route path="assignments" element={<Assignments />} />
        <Route path="exams" element={<ExamPage role="mahasiswa" />} />
        <Route path="exams/:examId" element={<ExamDetail role="mahasiswa" />} />
        <Route path="exams/:examId/start" element={<ExamInterface />} />
        <Route path="bank-skripsi" element={<BankSkripsi />} />
        <Route path="progress" element={<StudentProgress />} />
        <Route path="profile" element={<MahasiswaProfilePage />} />
        
      </Route>

      {/* Admin Route */}
      <Route
        path="/admin"
        element={
          <PrivateRoute requiredRole="admin">
            <NotFound /> {/* Ganti dengan AdminDashboard jika tersedia */}
          </PrivateRoute>
        }
      />

      {/* Fallback Route for 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;