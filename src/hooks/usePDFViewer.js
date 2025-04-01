import { useState } from 'react';

// Custom hook to manage PDF viewer state
const usePDFViewer = () => {
  const [pdfViewerState, setPdfViewerState] = useState({
    open: false,
    pdfUrl: '',
    title: ''
  });

  // Open the PDF viewer
  const openPdfViewer = (pdfUrl, title) => {
    setPdfViewerState({
      open: true,
      pdfUrl,
      title
    });
  };

  // Close the PDF viewer
  const closePdfViewer = () => {
    setPdfViewerState({
      ...pdfViewerState,
      open: false
    });
  };

  return {
    pdfViewerState,
    openPdfViewer,
    closePdfViewer
  };
};

export default usePDFViewer; 