import React, { useRef, useEffect, useState } from "react";
import PatientItem from "./PatientItem";
import "./QueueContainer.css";
import { DndContext } from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { Typography, Divider } from "@mui/material";

const QueueContainer = ({
  patients,
  setPatients,
  currentPosition,
  handleNextPatient,
  handleLatePatient,
  shufflePosition,
  fetchPatientsData, // Added prop for refetch
}) => {
  const [droppedItem, setDroppedItem] = useState(null);
  const sortedPatients = [...patients].sort((a, b) => a.position - b.position);

  // Calculate max position to show
  const positions = sortedPatients.map((p) => p.position);
  const maxPosition = Math.max(...positions, currentPosition + 4);

  // Create array of all positions with empty slots
  const allSlots = Array.from({ length: maxPosition }, (_, i) => {
    const position = i + 1;
    const patient = sortedPatients.find((p) => p.position === position);
    return patient || { position, isEmpty: true };
  });

  // Split into current and upcoming groups
  const currentGroupEnd = Math.min(currentPosition + 4, maxPosition);
  const currentGroup = allSlots.slice(currentPosition - 1, currentGroupEnd);
  const upcomingGroup = allSlots.slice(currentGroupEnd);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const draggedPatient = sortedPatients.find(
        (p) => p.appointment.appointment_id === active.id.split("-")[0]
      );
      const targetPosition = parseInt(over.id.split("-")[1]);

      if (draggedPatient && targetPosition) {
        const payload = {
          appointment_id: draggedPatient.appointment.appointment_id,
          new_position: targetPosition,
        };

        await shufflePosition(payload);
        fetchPatientsData(); // Refresh data after shuffle
      }
    }
  };

  return (
    <div className="queue-container">
      {sortedPatients.length === 0 ? (
        <div className="empty-queue">
          <Typography variant="h6">Queue is currently empty</Typography>
        </div>
      ) : (
        <>
          <div className="current-group">
            {currentGroup.map((slot) =>
              slot.isEmpty ? (
                <div key={`empty-${slot.position}`} className="empty-slot">
                  Available
                </div>
              ) : (
                <PatientItem
                  key={slot.appointment.appointment_id}
                  {...slot}
                  currentPosition={currentPosition}
                  handleNextPatient={async (id) => {
                    await handleNextPatient(id);
                    fetchPatientsData(); // Refresh after action
                  }}
                  handleLatePatient={async (id) => {
                    await handleLatePatient(id);
                    fetchPatientsData(); // Refresh after action
                  }}
                  isDraggable={false}
                />
              )
            )}
          </div>

          {upcomingGroup.length > 0 && (
            <>
              <Divider sx={{ my: 2 }}>
                <Typography variant="subtitle1">Upcoming Patients</Typography>
              </Divider>

              <DndContext
                modifiers={[restrictToVerticalAxis]}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={upcomingGroup
                    .filter((slot) => !slot.isEmpty)
                    .map(
                      (p) => `${p.appointment.appointment_id}-${p.position}`
                    )}
                >
                  {upcomingGroup.map((slot) =>
                    slot.isEmpty ? (
                      <div
                        key={`empty-${slot.position}`}
                        className="empty-slot"
                      >
                        Available
                      </div>
                    ) : (
                      <PatientItem
                        key={`${slot.appointment.appointment_id}-${slot.position}`}
                        {...slot}
                        currentPosition={currentPosition}
                        handleNextPatient={async (id) => {
                          await handleNextPatient(id);
                          fetchPatientsData();
                        }}
                        handleLatePatient={async (id) => {
                          await handleLatePatient(id);
                          fetchPatientsData();
                        }}
                        isDraggable={true}
                      />
                    )
                  )}
                </SortableContext>
              </DndContext>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default QueueContainer;
