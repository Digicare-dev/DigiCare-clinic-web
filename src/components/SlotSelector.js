import React from 'react';
import { FormControl, Select, MenuItem, InputLabel } from '@mui/material';
import { format } from 'date-fns';

export const SlotSelector = ({ slots, currentSlot, onSlotChange }) => {
  if (!slots || slots.length === 0) return null;

  return (
    <FormControl size="small" sx={{ minWidth: 200 }}>
      <InputLabel>Current Session</InputLabel>
      <Select
        value={currentSlot || ''}
        onChange={(e) => onSlotChange(e.target.value)}
        label="Current Session"
      >
        {slots.map((slot) => (
          <MenuItem key={slot} value={slot}>
            {format(new Date(slot), 'PPP p')}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}; 