/**
 * This script adds helper functions to restructure the PatientItem in mobile view
 * This fixes the issue with action buttons appearing above content
 */

// Run this function when the page loads to fix mobile patient items
export function fixMobilePatientItems() {
  // Only run in mobile view
  if (window.innerWidth > 768) return;
  
  // Wait for DOM to be ready
  setTimeout(() => {
    const patientItems = document.querySelectorAll('.patient-item');
    
    patientItems.forEach(item => {
      // Only process items that haven't been fixed yet
      if (item.dataset.mobilefixed) return;
      
      const content = item.querySelector('.patient-content');
      if (!content) return;
      
      // Get token badge and patient details
      const tokenBadge = content.querySelector('.token-badge');
      const patientDetails = content.querySelector('.patient-details');
      const actionButtons = content.querySelector('.action-buttons');
      
      if (!tokenBadge || !patientDetails || !actionButtons) return;
      
      // Create wrapper for token and details
      const wrapper = document.createElement('div');
      wrapper.className = 'token-and-details';
      
      // Move elements into new structure
      wrapper.appendChild(tokenBadge.cloneNode(true));
      wrapper.appendChild(patientDetails.cloneNode(true));
      
      // Clear content and rebuild
      while (content.firstChild) {
        content.removeChild(content.firstChild);
      }
      
      content.appendChild(wrapper);
      content.appendChild(actionButtons);
      
      // Mark as fixed
      item.dataset.mobilefixed = 'true';
    });
  }, 500);
}

// Run on resize to catch new items
window.addEventListener('resize', () => {
  if (window.innerWidth <= 768) {
    fixMobilePatientItems();
  }
});

// Export the fix function so it can be imported and used
export default fixMobilePatientItems; 