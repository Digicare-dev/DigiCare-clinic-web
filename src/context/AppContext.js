import React, { createContext, useState, useEffect, useCallback } from "react";
import { getCabinInfo } from '../utils/dateUtils';
import { fetchPatients, fetchCurrentPosition, fetchAppointments, updateCabinSlot } from '../services/api';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentCabinSlot, setCurrentCabinSlot] = useState(null);
  const [patients, setPatients] = useState([]);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    if (!user) return;
    
    const { cabinId, selectedSlot } = getCabinInfo(user);
    setCurrentCabinSlot(selectedSlot);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    
    const { cabinId } = getCabinInfo(user);
    if (!currentCabinSlot || !cabinId) return;

    updateCabinSlot(
      cabinId,
      currentCabinSlot,
      currentPosition
    );
  }, [currentCabinSlot, currentPosition]);

  useEffect(() => {
    if (!user) return;
    
    const { cabinId } = getCabinInfo(user);
    if (!currentCabinSlot || !cabinId) return;

    fetchAppointmentData(
      cabinId,
      currentCabinSlot
    );
  }, [currentCabinSlot]);

  const fetchPatientsData = useCallback(async () => {
    if (!currentCabinSlot || !user?.checkupcabindata?.[0]?.id) return;
    
    try {
      setLoading(true);
      const data = await fetchPatients(
        user.checkupcabindata[0].id,
        currentCabinSlot
      );

      const processedData = data.map((patient) => ({
        ...patient,
        paid: patient.paid || false,
        checkin: patient.checkin || false,
        status: patient.status || "pending",
      }));

      processedData.sort((a, b) => a.position - b.position);
      setPatients(processedData);
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  }, [user, currentCabinSlot]);

  const fetchCurrentPositionData = useCallback(async () => {
    if (!currentCabinSlot || !user?.checkupcabindata?.[0]?.id) return;
    
    try {
      setLoading(true);
      const { current_number } = await fetchCurrentPosition(
        user.checkupcabindata[0].id,
        currentCabinSlot
      );

      setCurrentPosition(current_number);
      return current_number;
    } catch (error) {
      console.error("Error fetching current position:", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 200);
    }
  }, [user, currentCabinSlot]);

  const value = {
    user,
    setUser,
    currentCabinSlot,
    setCurrentCabinSlot,
    patients,
    setPatients,
    currentPosition,
    setCurrentPosition,
    loading,
    setLoading,
    fetchPatientsData,
    fetchCurrentPositionData
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}; 