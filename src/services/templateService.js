// Template Service for saving and loading table templates
// This service uses localStorage to persist templates

// Initialize templates storage if not exists
const initTemplateStorage = (tableType) => {
  if (!localStorage.getItem(`${tableType}Templates`)) {
    localStorage.setItem(`${tableType}Templates`, JSON.stringify([]));
  }
  return JSON.parse(localStorage.getItem(`${tableType}Templates`));
};

// Initialize with dummy templates
const initDummyTemplates = () => {
  // Dummy templates for medications
  const medicationTemplates = [
    {
      name: "Medications for Dengue",
      data: [
        { medicine: "Paracetamol", dose: "650mg", timing: "After meals", frequency: "Three times daily", duration: "5 days", notes: "For fever and body pain", isEditing: false },
        { medicine: "Vitamin C", dose: "500mg", timing: "After breakfast", frequency: "Once daily", duration: "10 days", notes: "For immunity", isEditing: false },
        { medicine: "ORS Solution", dose: "1 sachet", timing: "As needed", frequency: "4-5 times daily", duration: "3 days", notes: "For hydration", isEditing: false }
      ],
      timestamp: new Date().toISOString()
    },
    {
      name: "Medications for Hypertension",
      data: [
        { medicine: "Amlodipine", dose: "5mg", timing: "Morning", frequency: "Once daily", duration: "30 days", notes: "For blood pressure control", isEditing: false },
        { medicine: "Aspirin", dose: "75mg", timing: "After dinner", frequency: "Once daily", duration: "30 days", notes: "Blood thinner", isEditing: false }
      ],
      timestamp: new Date().toISOString()
    },
    {
      name: "Medications for Common Cold",
      data: [
        { medicine: "Cetirizine", dose: "10mg", timing: "Night", frequency: "Once daily", duration: "7 days", notes: "For allergic symptoms", isEditing: false },
        { medicine: "Vitamin C", dose: "1000mg", timing: "After breakfast", frequency: "Once daily", duration: "10 days", notes: "For immunity", isEditing: false },
        { medicine: "Xylometazoline Nasal Spray", dose: "2 sprays", timing: "Morning and Night", frequency: "Twice daily", duration: "5 days", notes: "For nasal congestion", isEditing: false }
      ],
      timestamp: new Date().toISOString()
    }
  ];

  // Dummy templates for diagnoses
  const diagnosisTemplates = [
    {
      name: "Diagnosis for Viral Fever",
      data: [
        { diagnosis: "Viral Fever", duration: "Acute", notes: "Self-limiting viral infection", isEditing: false }
      ],
      timestamp: new Date().toISOString()
    },
    {
      name: "Diagnosis for Type 2 Diabetes",
      data: [
        { diagnosis: "Type 2 Diabetes Mellitus", duration: "Chronic", notes: "Requires lifestyle modifications", isEditing: false },
        { diagnosis: "Hypertension", duration: "Chronic", notes: "Secondary to diabetes", isEditing: false }
      ],
      timestamp: new Date().toISOString()
    },
    {
      name: "Diagnosis for URTI",
      data: [
        { diagnosis: "Upper Respiratory Tract Infection", duration: "Acute", notes: "Viral in origin", isEditing: false },
        { diagnosis: "Allergic Rhinitis", duration: "Intermittent", notes: "Seasonal variation", isEditing: false }
      ],
      timestamp: new Date().toISOString()
    }
  ];

  // Dummy templates for complaints
  const complaintTemplates = [
    {
      name: "Complaints for Fever",
      data: [
        { complaint: "Fever", severity: "Moderate", duration: "3 days", isEditing: false },
        { complaint: "Body Pain", severity: "Mild", duration: "2 days", isEditing: false },
        { complaint: "Headache", severity: "Mild", duration: "2 days", isEditing: false }
      ],
      timestamp: new Date().toISOString()
    },
    {
      name: "Complaints for Respiratory Infection",
      data: [
        { complaint: "Cough", severity: "Moderate", duration: "5 days", isEditing: false },
        { complaint: "Sore Throat", severity: "Mild", duration: "3 days", isEditing: false },
        { complaint: "Nasal Congestion", severity: "Moderate", duration: "4 days", isEditing: false }
      ],
      timestamp: new Date().toISOString()
    },
    {
      name: "Complaints for Gastrointestinal",
      data: [
        { complaint: "Stomach Pain", severity: "Severe", duration: "2 days", isEditing: false },
        { complaint: "Vomiting", severity: "Moderate", duration: "1 day", isEditing: false },
        { complaint: "Diarrhea", severity: "Moderate", duration: "2 days", isEditing: false }
      ],
      timestamp: new Date().toISOString()
    }
  ];

  // Save templates if they don't exist yet
  const tableTypes = ['medications', 'diagnoses', 'complaints'];
  const templates = {
    medications: medicationTemplates,
    diagnoses: diagnosisTemplates,
    complaints: complaintTemplates
  };

  tableTypes.forEach(type => {
    const existingTemplates = JSON.parse(localStorage.getItem(`${type}Templates`) || '[]');
    if (existingTemplates.length === 0) {
      localStorage.setItem(`${type}Templates`, JSON.stringify(templates[type]));
      console.log(`Initialized dummy templates for ${type}`);
    }
  });
};

// Initialize dummy templates on service load
initDummyTemplates();

// Save a template
export const saveTemplate = (tableType, templateName, templateData) => {
  const templates = initTemplateStorage(tableType);
  
  // Check if template with same name exists
  const existingIndex = templates.findIndex(t => t.name === templateName);
  
  if (existingIndex >= 0) {
    // Update existing template
    templates[existingIndex] = {
      name: templateName,
      data: templateData,
      timestamp: new Date().toISOString()
    };
  } else {
    // Add new template
    templates.push({
      name: templateName,
      data: templateData,
      timestamp: new Date().toISOString()
    });
  }
  
  localStorage.setItem(`${tableType}Templates`, JSON.stringify(templates));
  return templates;
};

// Get all templates for a table type
export const getTemplates = (tableType) => {
  return initTemplateStorage(tableType);
};

// Get a specific template by name
export const getTemplateByName = (tableType, templateName) => {
  const templates = initTemplateStorage(tableType);
  return templates.find(t => t.name === templateName);
};

// Delete a template
export const deleteTemplate = (tableType, templateName) => {
  const templates = initTemplateStorage(tableType);
  const filteredTemplates = templates.filter(t => t.name !== templateName);
  localStorage.setItem(`${tableType}Templates`, JSON.stringify(filteredTemplates));
  return filteredTemplates;
};

// Force reset templates (useful for development/testing)
export const resetToDefaultTemplates = () => {
  // Clear existing templates
  const tableTypes = ['medications', 'diagnoses', 'complaints'];
  tableTypes.forEach(type => {
    localStorage.removeItem(`${type}Templates`);
  });
  
  // Initialize with defaults
  initDummyTemplates();
  
  return {
    medications: getTemplates('medications'),
    diagnoses: getTemplates('diagnoses'),
    complaints: getTemplates('complaints')
  };
}; 