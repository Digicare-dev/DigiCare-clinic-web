import React, { createContext, useState, useContext } from 'react';

// Create the context
const AppointmentFormContext = createContext();

// Create a provider component
export function AppointmentFormProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialData, setInitialData] = useState(null);
  // Store maxToken values in an object where keys are formatted as "cabinId-selectedSlot"
  const [maxTokens, setMaxTokens] = useState({});

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

  // Function to store or update a maxToken value
  const updateMaxToken = (cabinId, selectedSlot, tokenValue) => {
    const key = `${cabinId}-${selectedSlot}`;
    setMaxTokens(prev => ({
      ...prev,
      [key]: tokenValue
    }));
  };

  // Function to get a stored maxToken value
  const getMaxToken = (cabinId, selectedSlot) => {
    const key = `${cabinId}-${selectedSlot}`;
    return maxTokens[key];
  };

  return (
    <AppointmentFormContext.Provider
      value={{
        isOpen,
        initialData,
        openAppointmentForm,
        closeAppointmentForm,
        updateMaxToken,
        getMaxToken,
        maxTokens
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