export const getLatestCabinSlot = (cabinSlots) => {
  if (!cabinSlots || cabinSlots.length === 0) return null;

  // Find the slot where is_active is true
  const activeSlot = cabinSlots.find(slot => slot.is_active === true);
  
  // If there's an active slot, return it
  if (activeSlot) {
    return activeSlot.slot;
  }

  // Fallback to the old logic if no active slot is found
  // Convert all slots to Date objects and sort them
  const sortedSlots = [...cabinSlots].map(slot => typeof slot === 'string' ? slot : slot.slot)
    .sort((a, b) => {
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

  // Find the active slot
  const activeSlot = cabinSlots.find(slot => slot.is_active === true);
  if (activeSlot) {
    return { cabinId, selectedSlot: activeSlot.slot };
  }

  // Fallback to the old logic if no active slot is found
  // Convert all slots to Date objects
  const slotStrings = cabinSlots.map(slot => typeof slot === 'string' ? slot : slot.slot);
  const slotDates = slotStrings.map(slot => new Date(slot));
  
  // Sort slots by date (ascending)
  slotDates.sort((a, b) => a - b);
  
  // Get current date and time
  const now = new Date();
  
  // Case 1: If current time is greater than all slots, return the last/latest slot
  if (now > slotDates[slotDates.length - 1]) {
    return { 
      cabinId, 
      selectedSlot: slotStrings[slotStrings.length - 1] 
    };
  }
  
  // Case 2: If current time is less than all slots, return the first slot
  if (now < slotDates[0]) {
    return { 
      cabinId, 
      selectedSlot: slotStrings[0] 
    };
  }
  
  // Case 3: If current time falls between slots, find the older slot
  for (let i = 0; i < slotDates.length - 1; i++) {
    if (now >= slotDates[i] && now < slotDates[i + 1]) {
      return { 
        cabinId, 
        selectedSlot: slotStrings[i] 
      };
    }
  }
  
  // Fallback to the first slot if no match found (shouldn't reach here given the cases above)
  return { 
    cabinId, 
    selectedSlot: slotStrings[0] 
  };
};

/**
 * Standardized function to get cabin information from user data
 * This function is the recommended way to extract cabin information and should be
 * used in place of direct access, getLatestCabinSlot, or getCabinInfoFromUser
 * 
 * @param {Object} user - The user object containing checkupcabindata
 * @returns {Object} - An object containing cabinId and selectedSlot
 */
export const getCabinInfo = (user) => {
  if (!user?.checkupcabindata || !user.checkupcabindata.length) {
    return { cabinId: null, selectedSlot: null };
  }

  // Extract the cabinId from the first checkupcabindata entry
  const cabinId = user.checkupcabindata[0].id;
  const cabinSlots = user.checkupcabindata[0].cabin_slots || [];

  if (!cabinSlots.length) {
    return { cabinId, selectedSlot: null };
  }

  // Get the selected slot using getLatestCabinSlot
  const selectedSlot = getLatestCabinSlot(cabinSlots);
  
  return { cabinId, selectedSlot };
};