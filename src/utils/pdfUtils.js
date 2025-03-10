// Import the PDF files
import dummyBloodTestReport from '../assets/dummy-blood-test-report.pdf';
import dummyEcgTestReport from '../assets/dummy-ecg-test-report.pdf';

// Function to get the PDF URL based on the type
export const getPdfUrl = (type) => {
  switch (type) {
    case 'blood-test':
      return dummyBloodTestReport;
    case 'ecg-test':
      return dummyEcgTestReport;
    // Add more cases for different types of reports
    default:
      return dummyBloodTestReport; // Default to blood test report
  }
};

// Function to get the PDF title based on the type
export const getPdfTitle = (type) => {
  switch (type) {
    case 'blood-test':
      return 'Blood Test Report';
    case 'ecg-test':
      return 'ECG Test Report';
    // Add more cases for different types of reports
    default:
      return 'Medical Report';
  }
}; 