import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useSnackbar } from 'notistack';
import LoadingScreen from './LoadingScreen';

const PrivateRoute = ({ requiredRole }) => {
  const { user, token, loading } = useContext(AuthContext);
  const { enqueueSnackbar } = useSnackbar();

  console.log('PrivateRoute: Auth check', { user, token, loading, requiredRole });

  // Show loading screen while auth is initializing
  if (loading) {
    return <LoadingScreen />;
  }

  // Check if user is authenticated
  const isAuthenticated = !!token && !!user;

  // Normalize user role
  const normalizedUserRole = user?.peran?.toLowerCase() || 'unknown';
  console.log('PrivateRoute: User role check', { normalizedUserRole, requiredRole, user });

  // Handle unauthenticated users
  if (!isAuthenticated) {
    enqueueSnackbar('Silakan masuk untuk mengakses halaman ini.', { variant: 'error' });
    return <Navigate to="/login" replace />;
  }

  // Handle role-based navigation if no specific requiredRole is provided
  if (!requiredRole) {
    switch (normalizedUserRole) {
      case 'mahasiswa':
        return <Navigate to="/mahasiswa" replace />;
      case 'dosen':
        return <Navigate to="/dosen" replace />;
      case 'admin':
        window.location.href = 'http://localhost:1337/admin';
        return null;
      default:
        enqueueSnackbar('Role pengguna tidak valid.', { variant: 'error' });
        return <Navigate to="/" replace />;
    }
  }

  // Check if user has the required role
  if (normalizedUserRole !== requiredRole.toLowerCase()) {
    enqueueSnackbar('Akses ditolak: Anda tidak memiliki izin untuk halaman ini.', { variant: 'error' });
    return <Navigate to="/" replace />;
  }

  // Render the protected route
  return <Outlet />;
};

export default PrivateRoute;