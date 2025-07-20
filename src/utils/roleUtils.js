export const getRoleRedirectPath = (role) => {
    switch (role) {
      case 'admin':
        return '/admin';
      case 'dosen':
        return '/dosen';
      case 'mahasiswa':
        return '/mahasiswa';
      default:
        return '/';
    }
  };
  
  export const isAuthorized = (userRole, requiredRole) => {
    return userRole === requiredRole;
  };