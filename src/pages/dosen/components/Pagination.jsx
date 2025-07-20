import React from 'react';
import { Pagination as MuiPagination } from '@mui/material';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <MuiPagination
      count={totalPages}
      page={currentPage}
      onChange={(event, page) => onPageChange(page)}
      color="primary"
      sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}
    />
  );
};

export default Pagination;