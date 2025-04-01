import { useContext } from 'react';
import { PDFViewerContext } from '../App';

// Custom hook to use the PDF viewer context
const usePDFViewerContext = () => {
  const context = useContext(PDFViewerContext);
  
  if (!context) {
    throw new Error('usePDFViewerContext must be used within a PDFViewerProvider');
  }
  
  return context;
};

export default usePDFViewerContext; 