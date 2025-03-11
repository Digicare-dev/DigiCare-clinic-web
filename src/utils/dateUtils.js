export const getLatestCabinSlot = (cabinSlots) => {
  if (!cabinSlots || cabinSlots.length === 0) return null;

  // Convert all slots to Date objects and sort them
  const sortedSlots = [...cabinSlots].sort((a, b) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateB - dateA; // Sort in descending order (latest first)
  });

  // Get the most recent slot that's not in the past
  const now = new Date();
  const validSlot = sortedSlots.find(slot => {
    const slotDate = new Date(slot);
    return slotDate >= now;
  }) || sortedSlots[0]; // Fallback to first slot if all are in the past

  return validSlot;
}; 

/**
 * Extracts cabin ID and selects the appropriate cabin slot from user data
 * @param {Object} user - The user object containing checkupcabindata
 * @returns {Object} - An object containing cabinId and selectedSlot
 */
export const getCabinInfoFromUser = (user) => {
  if (!user?.checkupcabindata || !user.checkupcabindata.length) {
    return { cabinId: null, selectedSlot: null };
  }

  // Extract the cabinId from the first checkupcabindata entry
  const cabinId = user.checkupcabindata[0].id;
  const cabinSlots = user.checkupcabindata[0].cabin_slots || [];

  if (!cabinSlots.length) {
    return { cabinId, selectedSlot: null };
  }

  // Convert all slots to Date objects
  const slotDates = cabinSlots.map(slot => new Date(slot));
  
  // Sort slots by date (ascending)
  slotDates.sort((a, b) => a - b);
  
  // Get current date and time
  const now = new Date();
  
  // Case 1: If current time is greater than all slots, return the last/latest slot
  if (now > slotDates[slotDates.length - 1]) {
    return { 
      cabinId, 
      selectedSlot: cabinSlots[cabinSlots.length - 1] 
    };
  }
  
  // Case 2: If current time is less than all slots, return the first slot
  if (now < slotDates[0]) {
    return { 
      cabinId, 
      selectedSlot: cabinSlots[0] 
    };
  }
  
  // Case 3: If current time falls between slots, find the older slot
  for (let i = 0; i < slotDates.length - 1; i++) {
    if (now >= slotDates[i] && now < slotDates[i + 1]) {
      return { 
        cabinId, 
        selectedSlot: cabinSlots[i] 
      };
    }
  }
  
  // Fallback to the first slot if no match found (shouldn't reach here given the cases above)
  return { 
    cabinId, 
    selectedSlot: cabinSlots[0] 
  };
};