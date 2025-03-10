// Sample data for the demo version
export const dummyPatients = [
  {
    appointment: {
      appointment_id: "20240310_0900",
      name: "John Smith",
      token: "1",
      disease: "Fever",
      appointment_type: "Consultation",
      fees_paid: 500,
      mode: "cash"
    },
    paid: true,
    checkin: true,
    status: "pending",
    position: 1,
    patient: {
      age: 45,
      gender: "M",
      phone_number: "9876543210",
      location: "New York",
      guardian: "NULL"
    }
  },
  {
    appointment: {
      appointment_id: "20240310_0915",
      name: "Sarah Johnson",
      token: "2",
      disease: "Headache",
      appointment_type: "Follow-up",
      fees_paid: 300,
      mode: "online"
    },
    paid: true,
    checkin: true,
    status: "pending",
    position: 2,
    patient: {
      age: 32,
      gender: "F",
      phone_number: "8765432109",
      location: "Chicago",
      guardian: "NULL"
    }
  },
  {
    appointment: {
      appointment_id: "20240310_0930",
      name: "Michael Brown",
      token: "3",
      disease: "Back pain",
      appointment_type: "Consultation",
      fees_paid: 500,
      mode: "cash"
    },
    paid: false,
    checkin: true,
    status: "pending",
    position: 3,
    patient: {
      age: 58,
      gender: "M",
      phone_number: "7654321098",
      location: "Boston",
      guardian: "NULL"
    }
  },
  {
    appointment: {
      appointment_id: "20240310_0945",
      name: "Emily Davis",
      token: "4",
      disease: "Allergies",
      appointment_type: "Consultation",
      fees_paid: 500,
      mode: "card"
    },
    paid: true,
    checkin: false,
    status: "pending",
    position: 4,
    patient: {
      age: 27,
      gender: "F",
      phone_number: "6543210987",
      location: "Seattle",
      guardian: "NULL"
    }
  },
  {
    appointment: {
      appointment_id: "20240310_1000",
      name: "David Wilson",
      token: "5",
      disease: "Cough",
      appointment_type: "Follow-up",
      fees_paid: 300,
      mode: "cash"
    },
    paid: true,
    checkin: true,
    status: "pending",
    position: 5,
    patient: {
      age: 12,
      gender: "M",
      phone_number: "5432109876",
      location: "Denver",
      guardian: "Mary Wilson"
    }
  }
];

export const dummyUser = {
  username: "demo_doctor",
  name: "Dr. Demo User",
  role: "doctor",
  checkupcabindata: [
    {
      id: "DEMO001",
      name: "General Medicine",
      cabin_slots: [
        "2024-03-10T09:00:00.000Z",
        "2024-03-10T14:00:00.000Z",
        "2024-03-11T09:00:00.000Z"
      ]
    }
  ]
};

export const dummyPastAppointments = [
  // March 5, 2024
  {
    appointment_id: "20240305_0900",
    name: "Robert Miller",
    token: "1",
    disease: "Hypertension",
    appointment_type: "Follow-up",
    fees_paid: 300,
    mode: "cash",
    status: "done_checkup",
    date: "2024-03-05",
    time: "09:00 AM",
    patient: {
      age: 62,
      gender: "M",
      phone_number: "9876543210",
      location: "New York",
      guardian: "NULL"
    }
  },
  {
    appointment_id: "20240305_0930",
    name: "Jennifer Lee",
    token: "2",
    disease: "Diabetes",
    appointment_type: "Consultation",
    fees_paid: 500,
    mode: "online",
    status: "done_checkup",
    date: "2024-03-05",
    time: "09:30 AM",
    patient: {
      age: 45,
      gender: "F",
      phone_number: "8765432109",
      location: "Chicago",
      guardian: "NULL"
    }
  },
  // March 6, 2024
  {
    appointment_id: "20240306_1000",
    name: "Thomas Anderson",
    token: "1",
    disease: "Arthritis",
    appointment_type: "Follow-up",
    fees_paid: 300,
    mode: "cash",
    status: "done_checkup",
    date: "2024-03-06",
    time: "10:00 AM",
    patient: {
      age: 70,
      gender: "M",
      phone_number: "7654321098",
      location: "Boston",
      guardian: "NULL"
    }
  },
  {
    appointment_id: "20240306_1030",
    name: "Sophia Martinez",
    token: "2",
    disease: "Migraine",
    appointment_type: "Consultation",
    fees_paid: 500,
    mode: "card",
    status: "done_checkup",
    date: "2024-03-06",
    time: "10:30 AM",
    patient: {
      age: 35,
      gender: "F",
      phone_number: "6543210987",
      location: "Seattle",
      guardian: "NULL"
    }
  },
  // March 7, 2024
  {
    appointment_id: "20240307_1100",
    name: "William Johnson",
    token: "1",
    disease: "Asthma",
    appointment_type: "Follow-up",
    fees_paid: 300,
    mode: "cash",
    status: "done_checkup",
    date: "2024-03-07",
    time: "11:00 AM",
    patient: {
      age: 28,
      gender: "M",
      phone_number: "5432109876",
      location: "Denver",
      guardian: "NULL"
    }
  },
  {
    appointment_id: "20240307_1130",
    name: "Emma Thompson",
    token: "2",
    disease: "Allergies",
    appointment_type: "Consultation",
    fees_paid: 500,
    mode: "online",
    status: "done_checkup",
    date: "2024-03-07",
    time: "11:30 AM",
    patient: {
      age: 22,
      gender: "F",
      phone_number: "4321098765",
      location: "Miami",
      guardian: "NULL"
    }
  },
  // March 8, 2024
  {
    appointment_id: "20240308_1400",
    name: "James Wilson",
    token: "1",
    disease: "Lower back pain",
    appointment_type: "Follow-up",
    fees_paid: 300,
    mode: "cash",
    status: "done_checkup",
    date: "2024-03-08",
    time: "02:00 PM",
    patient: {
      age: 55,
      gender: "M",
      phone_number: "3210987654",
      location: "Phoenix",
      guardian: "NULL"
    }
  },
  {
    appointment_id: "20240308_1430",
    name: "Olivia Garcia",
    token: "2",
    disease: "Thyroid issues",
    appointment_type: "Consultation",
    fees_paid: 500,
    mode: "card",
    status: "done_checkup",
    date: "2024-03-08",
    time: "02:30 PM",
    patient: {
      age: 42,
      gender: "F",
      phone_number: "2109876543",
      location: "Dallas",
      guardian: "NULL"
    }
  },
  // March 9, 2024
  {
    appointment_id: "20240309_0900",
    name: "Ethan Brown",
    token: "1",
    disease: "Common cold",
    appointment_type: "Consultation",
    fees_paid: 500,
    mode: "cash",
    status: "done_checkup",
    date: "2024-03-09",
    time: "09:00 AM",
    patient: {
      age: 8,
      gender: "M",
      phone_number: "1098765432",
      location: "Atlanta",
      guardian: "Sarah Brown"
    }
  },
  {
    appointment_id: "20240309_0930",
    name: "Ava Davis",
    token: "2",
    disease: "Skin rash",
    appointment_type: "Follow-up",
    fees_paid: 300,
    mode: "online",
    status: "done_checkup",
    date: "2024-03-09",
    time: "09:30 AM",
    patient: {
      age: 30,
      gender: "F",
      phone_number: "0987654321",
      location: "San Francisco",
      guardian: "NULL"
    }
  },
  // March 4, 2024
  {
    appointment_id: "20240304_0900",
    name: "Noah Wilson",
    token: "1",
    disease: "Ear infection",
    appointment_type: "Consultation",
    fees_paid: 500,
    mode: "cash",
    status: "done_checkup",
    date: "2024-03-04",
    time: "09:00 AM",
    patient: {
      age: 6,
      gender: "M",
      phone_number: "1234567890",
      location: "Portland",
      guardian: "Lisa Wilson"
    }
  },
  {
    appointment_id: "20240304_0930",
    name: "Isabella Moore",
    token: "2",
    disease: "Pregnancy checkup",
    appointment_type: "Follow-up",
    fees_paid: 300,
    mode: "card",
    status: "done_checkup",
    date: "2024-03-04",
    time: "09:30 AM",
    patient: {
      age: 32,
      gender: "F",
      phone_number: "2345678901",
      location: "Austin",
      guardian: "NULL"
    }
  },
  // March 3, 2024
  {
    appointment_id: "20240303_1000",
    name: "Liam Taylor",
    token: "1",
    disease: "Sprained ankle",
    appointment_type: "Consultation",
    fees_paid: 500,
    mode: "cash",
    status: "done_checkup",
    date: "2024-03-03",
    time: "10:00 AM",
    patient: {
      age: 24,
      gender: "M",
      phone_number: "3456789012",
      location: "Nashville",
      guardian: "NULL"
    }
  },
  {
    appointment_id: "20240303_1030",
    name: "Charlotte White",
    token: "2",
    disease: "Sore throat",
    appointment_type: "Consultation",
    fees_paid: 500,
    mode: "online",
    status: "done_checkup",
    date: "2024-03-03",
    time: "10:30 AM",
    patient: {
      age: 19,
      gender: "F",
      phone_number: "4567890123",
      location: "Orlando",
      guardian: "NULL"
    }
  }
];

// Dummy appointment table data (combines current and past appointments)
export const dummyAppointmentTableData = [
  ...dummyPatients.map(p => ({
    appointment_id: p.appointment.appointment_id,
    name: p.appointment.name,
    token: p.appointment.token,
    disease: p.appointment.disease,
    appointment_type: p.appointment.appointment_type,
    fees_paid: p.appointment.fees_paid,
    mode: p.appointment.mode,
    status: p.status,
    date: "2024-03-10", // Today
    time: `${9 + Math.floor(p.position / 2)}:${p.position % 2 === 0 ? '30' : '00'} AM`,
    patient: p.patient
  })),
  ...dummyPastAppointments
];

// Mock API functions
export const fetchDummyPatients = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...dummyPatients]);
    }, 800); // Simulate network delay
  });
};

export const fetchDummyCurrentPosition = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ current_number: 1 });
    }, 600);
  });
};

export const dummyMarkPatientAsDone = (appointmentId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: "Patient marked as done" });
    }, 1000);
  });
};

export const dummyMarkPatientAsLate = (appointmentId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: "Patient marked as late" });
    }, 1000);
  });
};

export const dummyShufflePatientPosition = (payload) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: "Patient position updated" });
    }, 1000);
  });
};

export const dummyAddAppointment = (payload) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Generate a unique appointment ID
      const appointmentId = `20240310_${Math.floor(1000 + Math.random() * 9000)}`;
      const tokenNumber = `${dummyPatients.length + 1}`;
      
      // Extract patient information from payload
      const nameParts = payload.patientName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Default patient ID (if no phone number provided)
      let patientId = null;
      
      // Create a new patient profile if phone number is provided
      if (payload.phone_number) {
        // Generate a unique patient ID
        patientId = `PT${String(patientProfiles.length + 1).padStart(3, '0')}`;
        
        // Create new patient profile
        const newPatientProfile = {
          id: patientId,
          firstName: firstName,
          lastName: lastName,
          fullName: payload.patientName,
          age: payload.age || 30,
          gender: payload.gender || "Not specified",
          phone_number: payload.phone_number,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
          address: payload.location || "Address not provided",
          bloodGroup: "Not specified",
          allergies: [],
          chronicConditions: [],
          emergencyContact: payload.guardian || "Not provided",
          registrationDate: new Date().toISOString().split('T')[0],
          lastVisit: new Date().toISOString().split('T')[0]
        };
        
        // Add to patient profiles
        patientProfiles.push(newPatientProfile);
        
        // Create past prescriptions for the new patient
        const pastDate1 = new Date();
        pastDate1.setDate(pastDate1.getDate() - 30); // 30 days ago
        
        const pastDate2 = new Date();
        pastDate2.setDate(pastDate2.getDate() - 90); // 90 days ago
        
        // Create dummy past prescriptions for the new patient
        const newPatientPrescriptions = [
          {
            id: `PRESC_${patientId}_1`,
            date: pastDate1.toISOString().split('T')[0],
            doctor: "Dr. Johnson",
            diagnoses: [
              { diagnosis: payload.disease || "General Checkup", duration: "2 weeks", notes: "Initial diagnosis" }
            ],
            medications: [
              { medicine: "Paracetamol", dose: "500mg", timing: "After meals", frequency: "Three times daily", duration: "7 days", notes: "For fever and pain" },
              { medicine: "Vitamin C", dose: "1000mg", timing: "Morning", frequency: "Once daily", duration: "30 days", notes: "Immunity booster" }
            ],
            instructions: "Rest well. Drink plenty of fluids. Follow up in 2 weeks."
          },
          {
            id: `PRESC_${patientId}_2`,
            date: pastDate2.toISOString().split('T')[0],
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
        
        // Add the prescriptions to the dummyPastPrescriptions object
        dummyPastPrescriptions[patientId] = newPatientPrescriptions;
        
        // Create new patient for queue
        const newPatient = {
          appointment: {
            appointment_id: appointmentId,
            name: payload.patientName,
            token: tokenNumber,
            disease: payload.disease || "General checkup",
            appointment_type: payload.appointment_type || "Consultation",
            fees_paid: payload.fees_paid || 500,
            mode: payload.mode || "cash"
          },
          paid: payload.paid || false,
          checkin: payload.checkin || false,
          status: "pending",
          position: dummyPatients.length + 1,
          patient: {
            id: patientId,
            age: payload.age || 30,
            gender: payload.gender || "Not specified",
            phone_number: payload.phone_number,
            location: payload.location || "Not provided",
            guardian: payload.guardian || "NULL"
          }
        };
        
        // Add to patients queue
        dummyPatients.push(newPatient);
        
        // Add to appointment table data for persistence
        const newAppointmentTableEntry = {
          token: tokenNumber,
          appointment_id: appointmentId,
          name: payload.patientName,
          disease: payload.disease || "General checkup",
          appointment_type: payload.appointment_type || "Consultation",
          status: "pending",
          fees_paid: payload.fees_paid || 500,
          mode: payload.mode || "cash",
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          patient: {
            id: patientId,
            age: payload.age || 30,
            gender: payload.gender?.charAt(0) || "Not specified",
            phone_number: payload.phone_number,
            location: payload.location || "Not provided",
            guardian: payload.guardian || "NULL"
          },
          patientId: patientId
        };
        
        // Add to appointment table data
        dummyAppointmentTableData.push(newAppointmentTableEntry);
      }
      
      resolve({ 
        success: true, 
        message: "Appointment added successfully",
        appointment: {
          appointment_id: appointmentId,
          name: payload.patientName || "New Patient",
          token: tokenNumber,
          disease: payload.disease || "General checkup",
          appointment_type: payload.appointment_type || "Consultation",
          fees_paid: payload.fees_paid || 500,
          mode: payload.mode || "cash"
        },
        patientId: patientId
      });
    }, 1000);
  });
};

// Mock API functions for past appointments
export const fetchDummyPastAppointments = (date = null) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (date) {
        // Filter by date if provided
        const filtered = dummyPastAppointments.filter(app => app.date === date);
        
        if (filtered.length > 0) {
          resolve(filtered);
        } else {
          // If no data for the requested date, generate some dummy data
          const requestedDate = new Date(date);
          // Only generate data for past dates
          if (requestedDate < new Date()) {
            const generatedData = generateDummyDataForDate(requestedDate);
            resolve(generatedData);
          } else {
            resolve([]);
          }
        }
      } else {
        resolve([...dummyPastAppointments]);
      }
    }, 800); // Simulate network delay
  });
};

// Function to generate dummy data for a specific date
const generateDummyDataForDate = (date) => {
  const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
  const patientNames = [
    "John Smith", "Sarah Johnson", "Michael Brown", "Emily Davis", 
    "David Wilson", "Jennifer Lee", "Robert Miller", "Sophia Martinez",
    "William Johnson", "Emma Thompson", "James Wilson", "Olivia Garcia"
  ];
  const diseases = [
    "Common cold", "Fever", "Headache", "Back pain", "Allergies", 
    "Hypertension", "Diabetes", "Arthritis", "Migraine", "Asthma"
  ];
  const appointmentTypes = ["Consultation", "Follow-up"];
  const locations = [
    "New York", "Chicago", "Boston", "Seattle", "Denver", 
    "Miami", "Phoenix", "Dallas", "Atlanta", "San Francisco"
  ];
  
  // Generate 2-4 appointments for the date
  const count = 2 + Math.floor(Math.random() * 3);
  const appointments = [];
  
  for (let i = 1; i <= count; i++) {
    const hour = 9 + Math.floor((i-1) / 2);
    const minute = ((i-1) % 2) * 30;
    const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${hour < 12 ? 'AM' : 'PM'}`;
    const formattedHour = hour.toString().padStart(2, '0');
    const formattedMinute = minute.toString().padStart(2, '0');
    
    appointments.push({
      appointment_id: `${formattedDate.replace(/-/g, '')}_${formattedHour}${formattedMinute}`,
      name: patientNames[Math.floor(Math.random() * patientNames.length)],
      token: i.toString(),
      disease: diseases[Math.floor(Math.random() * diseases.length)],
      appointment_type: appointmentTypes[Math.floor(Math.random() * appointmentTypes.length)],
      fees_paid: appointmentTypes[Math.floor(Math.random() * appointmentTypes.length)] === "Consultation" ? 500 : 300,
      mode: Math.random() > 0.5 ? "cash" : "online",
      status: "done_checkup",
      date: formattedDate,
      time: timeStr,
      patient: {
        age: 20 + Math.floor(Math.random() * 50),
        gender: Math.random() > 0.5 ? "M" : "F",
        phone_number: Math.floor(Math.random() * 10000000000).toString().padStart(10, '0'),
        location: locations[Math.floor(Math.random() * locations.length)],
        guardian: Math.random() > 0.8 ? "Family Member" : "NULL"
      }
    });
  }
  
  return appointments;
};

// Mock API function for appointment table
export const fetchDummyAppointmentTable = (filters = {}) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filteredData = [...dummyAppointmentTableData];
      
      // Apply filters if provided
      if (filters.date) {
        filteredData = filteredData.filter(app => app.date === filters.date);
      }
      
      if (filters.status) {
        filteredData = filteredData.filter(app => app.status === filters.status);
      }
      
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredData = filteredData.filter(app => 
          app.name.toLowerCase().includes(searchTerm) || 
          app.token.toLowerCase().includes(searchTerm) ||
          app.disease.toLowerCase().includes(searchTerm)
        );
      }
      
      resolve(filteredData);
    }, 1000); // Simulate network delay
  });
};

export const dummyLogin = (credentials) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (credentials.username === "demo" && credentials.password === "demo") {
        resolve({ 
          success: true, 
          user: dummyUser,
          token: "dummy-auth-token-12345"
        });
      } else {
        resolve({ 
          success: false, 
          message: "Invalid credentials. Use username: 'demo' and password: 'demo'"
        });
      }
    }, 1000);
  });
};

// Comprehensive patient profiles database for search functionality
export const patientProfiles = [
  {
    id: "PT001",
    firstName: "John",
    lastName: "Smith",
    fullName: "John Smith",
    age: 45,
    gender: "Male",
    phone_number: "9876543210",
    email: "john.smith@example.com",
    address: "123 Main St, New York, NY 10001",
    bloodGroup: "O+",
    allergies: ["Penicillin", "Peanuts"],
    chronicConditions: ["Hypertension"],
    emergencyContact: "Mary Smith (Wife) - 9876543211",
    registrationDate: "2023-01-15",
    lastVisit: "2024-03-01"
  },
  {
    id: "PT002",
    firstName: "Sarah",
    lastName: "Johnson",
    fullName: "Sarah Johnson",
    age: 32,
    gender: "Female",
    phone_number: "8765432109",
    email: "sarah.johnson@example.com",
    address: "456 Park Ave, Chicago, IL 60601",
    bloodGroup: "A+",
    allergies: ["Sulfa drugs"],
    chronicConditions: ["Asthma"],
    emergencyContact: "Michael Johnson (Husband) - 8765432108",
    registrationDate: "2023-02-20",
    lastVisit: "2024-02-15"
  },
  {
    id: "PT003",
    firstName: "Michael",
    lastName: "Brown",
    fullName: "Michael Brown",
    age: 58,
    gender: "Male",
    phone_number: "7654321098",
    email: "michael.brown@example.com",
    address: "789 Oak St, Boston, MA 02108",
    bloodGroup: "B-",
    allergies: [],
    chronicConditions: ["Diabetes Type 2", "Arthritis"],
    emergencyContact: "Jennifer Brown (Daughter) - 7654321097",
    registrationDate: "2022-11-05",
    lastVisit: "2024-02-28"
  },
  {
    id: "PT004",
    firstName: "Emily",
    lastName: "Davis",
    fullName: "Emily Davis",
    age: 27,
    gender: "Female",
    phone_number: "6543210987",
    email: "emily.davis@example.com",
    address: "321 Pine St, Seattle, WA 98101",
    bloodGroup: "AB+",
    allergies: ["Latex", "Shellfish"],
    chronicConditions: [],
    emergencyContact: "Robert Davis (Father) - 6543210986",
    registrationDate: "2023-03-10",
    lastVisit: "2024-01-20"
  },
  {
    id: "PT005",
    firstName: "David",
    lastName: "Wilson",
    fullName: "David Wilson",
    age: 41,
    gender: "Male",
    phone_number: "5432109876",
    email: "david.wilson@example.com",
    address: "654 Maple Ave, San Francisco, CA 94102",
    bloodGroup: "O-",
    allergies: [],
    chronicConditions: ["Migraine"],
    emergencyContact: "Lisa Wilson (Wife) - 5432109875",
    registrationDate: "2022-12-18",
    lastVisit: "2024-03-05"
  },
  {
    id: "PT006",
    firstName: "Jennifer",
    lastName: "Martinez",
    fullName: "Jennifer Martinez",
    age: 35,
    gender: "Female",
    phone_number: "4321098765",
    email: "jennifer.martinez@example.com",
    address: "987 Cedar St, Miami, FL 33101",
    bloodGroup: "A-",
    allergies: ["Aspirin"],
    chronicConditions: ["Hypothyroidism"],
    emergencyContact: "Carlos Martinez (Husband) - 4321098764",
    registrationDate: "2023-04-25",
    lastVisit: "2024-02-10"
  },
  {
    id: "PT007",
    firstName: "Robert",
    lastName: "Anderson",
    fullName: "Robert Anderson",
    age: 62,
    gender: "Male",
    phone_number: "3210987654",
    email: "robert.anderson@example.com",
    address: "159 Elm St, Denver, CO 80202",
    bloodGroup: "B+",
    allergies: ["Codeine"],
    chronicConditions: ["Hypertension", "High Cholesterol"],
    emergencyContact: "Susan Anderson (Wife) - 3210987653",
    registrationDate: "2022-10-12",
    lastVisit: "2024-03-02"
  },
  {
    id: "PT008",
    firstName: "Lisa",
    lastName: "Thomas",
    fullName: "Lisa Thomas",
    age: 29,
    gender: "Female",
    phone_number: "2109876543",
    email: "lisa.thomas@example.com",
    address: "753 Birch St, Austin, TX 78701",
    bloodGroup: "AB-",
    allergies: [],
    chronicConditions: ["Anxiety"],
    emergencyContact: "Mark Thomas (Brother) - 2109876542",
    registrationDate: "2023-05-30",
    lastVisit: "2024-01-15"
  },
  {
    id: "PT009",
    firstName: "William",
    lastName: "Jackson",
    fullName: "William Jackson",
    age: 53,
    gender: "Male",
    phone_number: "1098765432",
    email: "william.jackson@example.com",
    address: "426 Spruce St, Philadelphia, PA 19102",
    bloodGroup: "O+",
    allergies: ["Ibuprofen"],
    chronicConditions: ["GERD"],
    emergencyContact: "Emma Jackson (Daughter) - 1098765431",
    registrationDate: "2023-01-05",
    lastVisit: "2024-02-20"
  },
  {
    id: "PT010",
    firstName: "Jessica",
    lastName: "White",
    fullName: "Jessica White",
    age: 38,
    gender: "Female",
    phone_number: "0987654321",
    email: "jessica.white@example.com",
    address: "852 Walnut St, Atlanta, GA 30303",
    bloodGroup: "A+",
    allergies: ["Dairy"],
    chronicConditions: ["Fibromyalgia"],
    emergencyContact: "Daniel White (Husband) - 0987654320",
    registrationDate: "2022-09-15",
    lastVisit: "2024-03-10"
  },
  {
    id: "PT011",
    firstName: "James",
    lastName: "Harris",
    fullName: "James Harris",
    age: 47,
    gender: "Male",
    phone_number: "9876543219",
    email: "james.harris@example.com",
    address: "741 Aspen St, Portland, OR 97201",
    bloodGroup: "B-",
    allergies: [],
    chronicConditions: ["Sleep Apnea"],
    emergencyContact: "Patricia Harris (Wife) - 9876543218",
    registrationDate: "2023-02-10",
    lastVisit: "2024-01-25"
  },
  {
    id: "PT012",
    firstName: "Mary",
    lastName: "Clark",
    fullName: "Mary Clark",
    age: 71,
    gender: "Female",
    phone_number: "8765432198",
    email: "mary.clark@example.com",
    address: "369 Redwood St, Phoenix, AZ 85001",
    bloodGroup: "O-",
    allergies: ["Sulfa drugs", "Penicillin"],
    chronicConditions: ["Osteoporosis", "Hypertension", "Diabetes Type 2"],
    emergencyContact: "Thomas Clark (Son) - 8765432197",
    registrationDate: "2022-08-20",
    lastVisit: "2024-02-05"
  },
  {
    id: "PT013",
    firstName: "Christopher",
    lastName: "Lewis",
    fullName: "Christopher Lewis",
    age: 33,
    gender: "Male",
    phone_number: "7654321987",
    email: "christopher.lewis@example.com",
    address: "258 Sequoia St, Nashville, TN 37201",
    bloodGroup: "AB+",
    allergies: ["Peanuts"],
    chronicConditions: [],
    emergencyContact: "Elizabeth Lewis (Wife) - 7654321986",
    registrationDate: "2023-03-15",
    lastVisit: "2024-03-08"
  },
  {
    id: "PT014",
    firstName: "Elizabeth",
    lastName: "Walker",
    fullName: "Elizabeth Walker",
    age: 42,
    gender: "Female",
    phone_number: "6543219876",
    email: "elizabeth.walker@example.com",
    address: "147 Cypress St, Las Vegas, NV 89101",
    bloodGroup: "A-",
    allergies: [],
    chronicConditions: ["Migraine", "IBS"],
    emergencyContact: "Richard Walker (Husband) - 6543219875",
    registrationDate: "2022-11-25",
    lastVisit: "2024-01-30"
  },
  {
    id: "PT015",
    firstName: "Daniel",
    lastName: "Hall",
    fullName: "Daniel Hall",
    age: 56,
    gender: "Male",
    phone_number: "5432198765",
    email: "daniel.hall@example.com",
    address: "963 Magnolia St, New Orleans, LA 70112",
    bloodGroup: "B+",
    allergies: ["Shellfish"],
    chronicConditions: ["Hypertension"],
    emergencyContact: "Nancy Hall (Wife) - 5432198764",
    registrationDate: "2023-01-20",
    lastVisit: "2024-02-25"
  }
];

// Dummy past prescriptions data for patients
export const dummyPastPrescriptions = {
  // Patient IDs as keys
  "PT001": [
    {
      id: "PRESC001",
      date: "2024-02-15",
      doctor: "Dr. Smith",
      diagnoses: [
        { diagnosis: "Hypertension", duration: "Chronic", notes: "Monitor regularly" },
        { diagnosis: "Seasonal Allergies", duration: "2 weeks", notes: "Triggered by pollen" }
      ],
      medications: [
        { medicine: "Amlodipine", dose: "5mg", timing: "Morning", frequency: "Once daily", duration: "30 days", notes: "Take after breakfast" },
        { medicine: "Cetirizine", dose: "10mg", timing: "Night", frequency: "Once daily", duration: "14 days", notes: "Take if allergies worsen" }
      ],
      instructions: "Avoid salty foods. Stay hydrated. Follow up in 1 month."
    },
    {
      id: "PRESC002",
      date: "2024-01-10",
      doctor: "Dr. Johnson",
      diagnoses: [
        { diagnosis: "Common Cold", duration: "1 week", notes: "Viral infection" }
      ],
      medications: [
        { medicine: "Paracetamol", dose: "500mg", timing: "As needed", frequency: "Up to 4 times daily", duration: "5 days", notes: "For fever and pain" },
        { medicine: "Vitamin C", dose: "1000mg", timing: "Morning", frequency: "Once daily", duration: "10 days", notes: "To boost immunity" },
        { medicine: "Chlorpheniramine", dose: "4mg", timing: "Night", frequency: "Once daily", duration: "5 days", notes: "For runny nose" }
      ],
      instructions: "Rest well. Drink plenty of fluids. Avoid cold beverages."
    }
  ],
  "PT002": [
    {
      id: "PRESC003",
      date: "2024-03-01",
      doctor: "Dr. Williams",
      diagnoses: [
        { diagnosis: "Asthma exacerbation", duration: "Acute", notes: "Triggered by recent weather change" }
      ],
      medications: [
        { medicine: "Salbutamol", dose: "2 puffs", timing: "As needed", frequency: "Up to 4 times daily", duration: "PRN", notes: "For breathlessness" },
        { medicine: "Prednisolone", dose: "20mg", timing: "Morning", frequency: "Once daily", duration: "5 days", notes: "Tapering dose" },
        { medicine: "Montelukast", dose: "10mg", timing: "Night", frequency: "Once daily", duration: "30 days", notes: "Continue regular medication" }
      ],
      instructions: "Avoid triggers. Use peak flow meter daily. Follow up in 2 weeks."
    }
  ],
  "PT003": [
    {
      id: "PRESC004",
      date: "2024-02-20",
      doctor: "Dr. Brown",
      diagnoses: [
        { diagnosis: "Bacterial Sinusitis", duration: "10 days", notes: "Severe congestion" }
      ],
      medications: [
        { medicine: "Amoxicillin", dose: "500mg", timing: "After meals", frequency: "Three times daily", duration: "10 days", notes: "Complete full course" },
        { medicine: "Pseudoephedrine", dose: "60mg", timing: "Morning and Night", frequency: "Twice daily", duration: "7 days", notes: "For nasal congestion" }
      ],
      instructions: "Steam inhalation twice daily. Complete full course of antibiotics."
    }
  ],
  // Default prescriptions for any new patient
  "DEFAULT": [
    {
      id: "PRESC_DEFAULT_1",
      date: "2024-02-10",
      doctor: "Dr. Default",
      diagnoses: [
        { diagnosis: "General Checkup", duration: "N/A", notes: "Routine examination" }
      ],
      medications: [
        { medicine: "Multivitamin", dose: "1 tablet", timing: "Morning", frequency: "Once daily", duration: "30 days", notes: "With breakfast" },
        { medicine: "Vitamin D", dose: "1000 IU", timing: "Morning", frequency: "Once daily", duration: "30 days", notes: "For deficiency" }
      ],
      instructions: "Maintain healthy diet and exercise regularly."
    }
  ]
};

// Function to fetch past prescriptions for a patient
export const fetchPastPrescriptions = (patientId) => {
  console.log("fetchPastPrescriptions called with patientId:", patientId);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      // Try to get prescriptions for the specific patient ID
      let prescriptions = dummyPastPrescriptions[patientId];
      
      // If no prescriptions found and it's not the DEFAULT key itself
      if ((!prescriptions || prescriptions.length === 0) && patientId !== "DEFAULT") {
        // Use the default prescriptions but customize them for this patient
        const defaultPrescriptions = JSON.parse(JSON.stringify(dummyPastPrescriptions["DEFAULT"]));
        
        // Customize the prescriptions for this patient
        defaultPrescriptions.forEach(prescription => {
          prescription.id = `PRESC_${patientId}_${Math.floor(Math.random() * 1000)}`;
        });
        
        prescriptions = defaultPrescriptions;
        
        // Store these prescriptions for future use
        dummyPastPrescriptions[patientId] = prescriptions;
      }
      
      console.log("Returning prescriptions:", prescriptions);
      resolve(prescriptions || []);
    }, 500);
  });
}; 