// Import all exports from the original dummyDataService.js
import * as originalService from './dummyDataService';

// Re-export everything from the original service
export * from './dummyDataService';

// Override the fetchPastPrescriptions function
export const fetchPastPrescriptions = (patientId) => {
  console.log("Fixed fetchPastPrescriptions called with patientId:", patientId);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      // First try to get prescriptions from the original service
      let prescriptions = originalService.dummyPastPrescriptions[patientId] || [];
      
      // If no prescriptions found, create default ones for this patient
      if (!prescriptions || prescriptions.length === 0) {
        console.log("No prescriptions found for patient ID:", patientId, "Creating default prescriptions");
        
        // Create default prescriptions for this patient
        prescriptions = [
          {
            id: `PRESC_${patientId}_1`,
            date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
            doctor: "Dr. Johnson",
            diagnoses: [
              { diagnosis: "General Checkup", duration: "2 weeks", notes: "Initial diagnosis" }
            ],
            medications: [
              { medicine: "Paracetamol", dose: "500mg", timing: "After meals", frequency: "Three times daily", duration: "7 days", notes: "For fever and pain" },
              { medicine: "Vitamin C", dose: "1000mg", timing: "Morning", frequency: "Once daily", duration: "30 days", notes: "Immunity booster" }
            ],
            instructions: "Rest well. Drink plenty of fluids. Follow up in 2 weeks."
          },
          {
            id: `PRESC_${patientId}_2`,
            date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days ago
            doctor: "Dr. Smith",
            diagnoses: [
              { diagnosis: "Seasonal Allergies", duration: "Seasonal", notes: "Triggered by pollen" }
            ],
            medications: [
              { medicine: "Cetirizine", dose: "10mg", timing: "Night", frequency: "Once daily", duration: "14 days", notes: "For allergic symptoms" },
              { medicine: "Nasal Spray", dose: "2 sprays", timing: "Morning and Night", frequency: "Twice daily", duration: "14 days", notes: "For nasal congestion" }
            ],
            instructions: "Avoid allergens. Use air purifier if possible. Return if symptoms worsen."
          }
        ];
        
        // Store these prescriptions for future use
        try {
          originalService.dummyPastPrescriptions[patientId] = prescriptions;
          console.log("Stored new prescriptions for patient ID:", patientId);
        } catch (error) {
          console.error("Error storing prescriptions:", error);
        }
      }
      
      console.log("Returning prescriptions:", prescriptions);
      resolve(prescriptions);
    }, 500);
  });
}; 