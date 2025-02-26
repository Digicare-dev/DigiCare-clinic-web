import React, { useRef, useEffect, useState } from "react";
import PatientItem from "./PatientItem";
import "./QueueContainer.css";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { Typography, Divider, Skeleton } from "@mui/material";

const QueueContainer = ({
  loading,
  patients,
  setPatients,
  currentPosition,
  handleNextPatient,
  handleLatePatient,
  shufflePosition,
  fetchPatientsData,
  fetchPatientsDataWithoutLoader,
  fetchCurrentPositionDataWithoutLoader,
}) => {
  const [droppedItem, setDroppedItem] = useState(null);
  const sortedPatients = [...patients]
    .filter((p) => p.status === "pending")
    .sort((a, b) => a.position - b.position);

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

  // QueueContainer.js
  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    try {
      const draggedAppointmentId = active.id;
      const targetAppointmentId = over.id;

      const draggedPatient = patients.find(
        (p) => p.appointment.appointment_id === draggedAppointmentId
      );

      const targetPatient = patients.find(
        (p) => p.appointment.appointment_id === targetAppointmentId
      );

      if (!draggedPatient || !targetPatient) return;

      const payload = {
        appointment_id: draggedAppointmentId,
        new_position: targetPatient.position,
      };

      await shufflePosition(payload);
      await fetchPatientsData();

      // Optimistic update
      setPatients((prev) => {
        const newPatients = [...prev];
        const draggedIndex = newPatients.findIndex(
          (p) => p.appointment.appointment_id === draggedAppointmentId
        );
        const targetIndex = newPatients.findIndex(
          (p) => p.appointment.appointment_id === targetAppointmentId
        );

        return arrayMove(newPatients, draggedIndex, targetIndex);
      });
    } catch (error) {
      console.error("Drag failed:", error);
      fetchPatientsData();
    }
  };

  return (
    <div className="queue-container">
      {loading ? (
        // Loading skeleton
        <div className="skeleton-container">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="skeleton-item">
              <Skeleton
                variant="rectangular"
                width="100%"
                height={100}
                sx={{
                  borderRadius: 2,
                  mb: 2,
                  bgcolor: loading ? "grey.200" : "transparent",
                }}
              />
            </div>
          ))}
        </div>
      ) : sortedPatients.length === 0 ? (
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
                  }}
                  handleLatePatient={async (id) => {
                    await handleLatePatient(id);
                  }}
                  isDraggable={false}
                  paid={slot.paid}
                  status={slot.status}
                  checkin={slot.checkin}
                  fetchPatientsDataWithoutLoader={
                    fetchPatientsDataWithoutLoader
                  }
                  fetchCurrentPositionDataWithoutLoader={
                    fetchCurrentPositionDataWithoutLoader
                  }
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
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={upcomingGroup
                    .filter((slot) => !slot.isEmpty)
                    .map((p) => p.appointment.appointment_id)}
                  strategy={verticalListSortingStrategy}
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
                        fetchPatientsDataWithoutLoader={
                          fetchPatientsDataWithoutLoader
                        }
                        fetchCurrentPositionDataWithoutLoader={
                          fetchCurrentPositionDataWithoutLoader
                        }
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
