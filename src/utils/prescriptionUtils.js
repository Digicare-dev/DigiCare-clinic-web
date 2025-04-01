/**
 * Utility functions for handling prescriptions across the application
 */

/**
 * Helper function to format a date string to dd/mm/yyyy format
 * 
 * @param {string|Date} dateInput - Date input as string or Date object
 * @returns {string} Formatted date string
 */
const formatDateToDDMMYYYY = (dateInput) => {
  if (!dateInput) return '';
  
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return dateInput; // Return original if invalid
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateInput; // Return original if error
  }
};

/**
 * Helper function to convert gender abbreviation to full form
 * 
 * @param {string} gender - Gender abbreviation (m, f, o) or full form
 * @returns {string} Full form gender
 */
const getFullGender = (gender) => {
  if (!gender) return '';
  
  const genderLower = gender.toString().trim().toLowerCase();
  
  switch(genderLower) {
    case 'm':
    case 'male':
      return 'Male';
    case 'f':
    case 'female':
      return 'Female';
    case 'o':
    case 'other':
    case 'others':
      return 'Others';
    default:
      return gender; // Return original if not matching
  }
};

/**
 * Generates a standardized prescription HTML template that can be used for printing
 * 
 * @param {Object} prescriptionData - The prescription data object
 * @param {Object} prescriptionData.patientInfo - Patient information
 * @param {Object} prescriptionData.appointmentInfo - Appointment information
 * @param {Array} prescriptionData.complaints - Patient complaints
 * @param {Array} prescriptionData.diagnoses - Diagnosis information
 * @param {Array} prescriptionData.medications - Medication information
 * @param {Array} prescriptionData.tests - Recommended tests
 * @returns {string} HTML content for the prescription
 */
export const generatePrescriptionTemplate = (prescriptionData) => {
  if (!prescriptionData) return '';

  // Format the date as dd/mm/yyyy
  const formattedDate = formatDateToDDMMYYYY(prescriptionData.appointmentInfo?.date);
  
  // Get full gender
  const fullGender = getFullGender(prescriptionData.patientInfo?.gender);
  
  // Safely handle age (show only if available)
  const ageDisplay = prescriptionData.patientInfo?.age 
    ? `<strong>Age:</strong> ${prescriptionData.patientInfo?.age} years` 
    : '';
  
  // Join gender and age with comma only if both exist
  const genderAgeDisplay = fullGender && ageDisplay 
    ? `<strong>Gender:</strong> ${fullGender}, ${ageDisplay}` 
    : fullGender 
      ? `<strong>Gender:</strong> ${fullGender}` 
      : ageDisplay;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title></title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          color: #333;
          line-height: 1.5;
          max-width: 800px;
          margin: 0 auto;
        }
        .prescription-container {
          border: 1px solid #e0e0e0;
          border-radius: 5px;
          padding: 20px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }
        .patient-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          padding: 10px;
          background-color: #f8f9fa;
          border-radius: 5px;
          font-size: 14px;
        }
        .patient-details, .appointment-details {
          flex: 1;
        }
        .patient-details p, .appointment-details p {
          margin: 5px 0;
        }
        .section-title {
          font-size: 16px;
          font-weight: bold;
          margin: 15px 0 10px 0;
          color: #2196f3;
          border-bottom: 1px solid #eee;
          padding-bottom: 5px;
        }
        .medication-table {
          width: 100%;
          border-collapse: collapse;
          margin: 10px 0;
          font-size: 14px;
        }
        .medication-table th, .medication-table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        .medication-table th {
          background-color: #f5f5f5;
          font-weight: 600;
        }
        .medication-table tr:nth-child(even) {
          background-color: #fafafa;
        }
        .tests-list {
          margin: 10px 0;
          padding: 10px;
          background-color: #f8f9fa;
          border-radius: 5px;
          font-size: 14px;
        }
        @media print {
          body {
            margin: 0;
            padding: 15px;
          }
          .prescription-container {
            border: none;
            box-shadow: none;
          }
          @page {
            margin: 0;
            size: auto;
          }
          html, body {
            height: auto;
            overflow: hidden;
          }
        }
      </style>
    </head>
    <body>
      <div class="prescription-container">
        <div class="patient-info">
          <div class="patient-details">
            <p><strong>Patient Name:</strong> ${prescriptionData.patientInfo?.name || ''}</p>
            <p><strong>Patient ID:</strong> ${prescriptionData.patientInfo?.id || ''}</p>
            ${genderAgeDisplay ? `<p>${genderAgeDisplay}</p>` : ''}
          </div>
          <div class="appointment-details">
            <p><strong>Appointment Date:</strong> ${formattedDate}</p>
          </div>
        </div>

        <div class="section-title">Complaints</div>
        <table class="medication-table">
          <thead>
            <tr>
              <th>Complaint</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            ${prescriptionData.complaints && prescriptionData.complaints.length > 0 ? 
              prescriptionData.complaints.map(c => `
              <tr>
                <td>${c.complaint || ''}</td>
                <td>${c.duration || ''}</td>
              </tr>
            `).join('') 
            : '<tr><td colspan="2">No complaints recorded</td></tr>'}
          </tbody>
        </table>
        
        <div class="section-title">Diagnosis</div>
        <table class="medication-table">
          <thead>
            <tr>
              <th>Diagnosis</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            ${prescriptionData.diagnoses && prescriptionData.diagnoses.length > 0 ? 
              prescriptionData.diagnoses.map(d => `
              <tr>
                <td>${d.diagnosis || ''}</td>
                <td>${d.notes || ''}</td>
              </tr>
            `).join('') 
            : '<tr><td colspan="2">No diagnosis provided</td></tr>'}
          </tbody>
        </table>
        
        <div class="section-title">Medications</div>
        <table class="medication-table">
          <thead>
            <tr>
              <th>Medicine</th>
              <th>Dose</th>
              <th>Frequency</th>
              <th>Duration</th>
              <th>Instructions</th>
            </tr>
          </thead>
          <tbody>
            ${prescriptionData.medications && prescriptionData.medications.length > 0 ? 
              prescriptionData.medications.map(med => `
              <tr>
                <td>${med.medicine || ''}</td>
                <td>${med.dose || ''}</td>
                <td>${med.frequency || ''}</td>
                <td>${med.duration || ''}</td>
                <td>${med.notes || med.timing || ''}</td>
              </tr>
            `).join('') 
            : '<tr><td colspan="5">No medications prescribed</td></tr>'}
          </tbody>
        </table>
        
        <div class="section-title">Tests Recommended</div>
        <div class="tests-list">
          ${prescriptionData.tests && prescriptionData.tests.length > 0 ? 
            prescriptionData.tests.map(test => `<p>• ${test}</p>`).join('') 
            : 'No tests recommended'}
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Opens a new window and prints the prescription
 * 
 * @param {Object} prescriptionData - The prescription data object
 */
export const printPrescription = (prescriptionData) => {
  // Create a new window with the prescription content
  const printWindow = window.open('', '_blank');
  
  // Generate the prescription template
  const prescriptionContent = generatePrescriptionTemplate(prescriptionData);
  
  // Write the content to the new window
  printWindow.document.open();
  printWindow.document.write(prescriptionContent);
  printWindow.document.close();
  
  // Wait for the content to load and then automatically print
  printWindow.onload = function() {
    printWindow.print();
    
    // Close the window after printing
    printWindow.onfocus = function() { 
      setTimeout(function() { 
        printWindow.close(); 
      }, 500);
    };
  };
}; 