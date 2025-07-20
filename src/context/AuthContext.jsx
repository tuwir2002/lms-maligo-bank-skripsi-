import React, { createContext, useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const { enqueueSnackbar } = useSnackbar();

  // Load user and token from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('jwt');
        const storedUser = localStorage.getItem('user');
        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);

          // Optional: Validate token with server (uncomment if API is available)
          /*
          const response = await fetch('http://localhost:1337/api/auth/validate', {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          if (!response.ok) {
            throw new Error('Token invalid');
          }
          */
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('jwt');
        localStorage.removeItem('user');
        enqueueSnackbar('Sesi telah kedaluwarsa. Silakan masuk kembali.', { variant: 'error' });
      } finally {
        setLoading(false); // Set loading to false after initialization
      }
    };

    initializeAuth();
  }, [enqueueSnackbar]);

  const login = (jwt, userData) => {
    setToken(jwt);
    setUser(userData);
    localStorage.setItem('jwt', jwt);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
    enqueueSnackbar('Anda telah keluar.', { variant: 'success' });
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};