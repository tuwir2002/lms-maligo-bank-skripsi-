import React, { useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

// Set worker for react-pdf using a reliable CDN
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const ThesisPreview = ({ fileUrl }) => {
  const [numPages, setNumPages] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const onDocumentLoadError = (error) => {
    setError('Gagal memuat preview dokumen: ' + error.message);
    setLoading(false);
  };

  return (
    <Box
      sx={{
        maxHeight: '400px',
        overflow: 'auto',
        bgcolor: '#ffffff',
        borderRadius: 1,
        p: 1,
      }}
    >
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {error && (
        <Typography color="error" sx={{ textAlign: 'center' }}>
          {error}
        </Typography>
      )}

      <Document
        file={fileUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        loading={null}
      >
        {Array.from(new Array(Math.min(numPages || 1, 3)), (el, index) => (
          <Page
            key={`page_${index + 1}`}
            pageNumber={index + 1}
            width={300}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        ))}
      </Document>
    </Box>
  );
};

export default ThesisPreview;