import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  IconButton, 
  Box,
  Typography,
  CircularProgress
} from '@mui/material';
import { 
  Close as CloseIcon, 
  Download as DownloadIcon, 
  Print as PrintIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon
} from '@mui/icons-material';

const PDFViewer = ({ open, onClose, pdfUrl, title }) => {
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1);

  // Handle download
  const handleDownload = () => {
    // Create a link element
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = title || 'document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle print
  const handlePrint = () => {
    const printWindow = window.open(pdfUrl, '_blank');
    printWindow.addEventListener('load', () => {
      printWindow.print();
    });
  };

  // Handle zoom in
  const handleZoomIn = () => {
    setZoom(prevZoom => Math.min(prevZoom + 0.2, 2.5));
  };

  // Handle zoom out
  const handleZoomOut = () => {
    setZoom(prevZoom => Math.max(prevZoom - 0.2, 0.5));
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: { 
          height: '90vh',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h6">{title || 'Document Viewer'}</Typography>
        <Box>
          <IconButton onClick={handleZoomOut} disabled={zoom <= 0.5}>
            <ZoomOutIcon />
          </IconButton>
          <Typography variant="body2" component="span" sx={{ mx: 1 }}>
            {Math.round(zoom * 100)}%
          </Typography>
          <IconButton onClick={handleZoomIn} disabled={zoom >= 2.5}>
            <ZoomInIcon />
          </IconButton>
          <IconButton onClick={onClose} sx={{ ml: 1 }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers sx={{ 
        flex: 1, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        overflow: 'auto',
        bgcolor: '#f5f5f5'
      }}>
        {loading && (
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <CircularProgress />
          </Box>
        )}
        <Box sx={{ 
          transform: `scale(${zoom})`, 
          transformOrigin: 'center top',
          transition: 'transform 0.2s',
          maxWidth: '100%',
          height: 'auto'
        }}>
          <iframe
            src={`${pdfUrl}#toolbar=0`}
            title={title || "PDF Viewer"}
            width="800px"
            height="600px"
            style={{ border: 'none', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}
            onLoad={() => setLoading(false)}
          />
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ justifyContent: 'space-between', px: 3, py: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Use the controls to zoom, download, or print this document
        </Typography>
        <Box>
          <Button 
            startIcon={<DownloadIcon />} 
            onClick={handleDownload} 
            variant="outlined" 
            sx={{ mr: 1 }}
          >
            Download
          </Button>
          <Button 
            startIcon={<PrintIcon />} 
            onClick={handlePrint} 
            variant="contained"
          >
            Print
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default PDFViewer; 