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