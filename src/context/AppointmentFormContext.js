import React, { createContext, useState, useContext } from 'react';

// Create the context
const AppointmentFormContext = createContext();

// Create a provider component
export function AppointmentFormProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialData, setInitialData] = useState(null);

  // Function to open the appointment form
  const openAppointmentForm = (data = null) => {
    setInitialData(data);
    setIsOpen(true);
  };

  // Function to close the appointment form
  const closeAppointmentForm = () => {
    setIsOpen(false);
    setInitialData(null);
  };

  return (
    <AppointmentFormContext.Provider
      value={{
        isOpen,
        initialData,
        openAppointmentForm,
        closeAppointmentForm
      }}
    >
      {children}
    </AppointmentFormContext.Provider>
  );
}

// Custom hook to use the appointment form context
export function useAppointmentForm() {
  return useContext(AppointmentFormContext);
} 