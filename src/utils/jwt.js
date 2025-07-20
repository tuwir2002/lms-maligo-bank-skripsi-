// src/utils/jwt.js
import * as jwtDecodeModule from 'jwt-decode';

const jwtDecode = jwtDecodeModule.default || jwtDecodeModule.jwtDecode;

export const decodeToken = (token) => {
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error('Invalid token', error);
    return null;
  }
};

export const isTokenValid = (token) => {
  if (!token) {
    console.log('Token validation: No token provided');
    return false;
  }
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiry = payload.exp * 1000;
    const isValid = expiry > Date.now();
    console.log('Token validation:', { expiry, now: Date.now(), isValid });
    return isValid;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};