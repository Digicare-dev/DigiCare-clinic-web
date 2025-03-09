import React, { useEffect, useState, useRef } from "react";
import PatientItem from "./PatientItem";
import "./QueueContainer.css";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  Skeleton,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Dialog,
  CircularProgress,
} from "@mui/material";

const QueueContainer = ({
  patients,
  currentPatient,
  currentPosition,
  onNextPatient,
  onLatePatient,
  onShufflePosition,
}) => {
  const [mergedGroup, setMergedGroup] = useState([]);
  const [confirmDrag, setConfirmDrag] = useState(false);
  const [dragActiveId, setDragActiveId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const originalPatientsRef = useRef([]);
  const [isShifting, setIsShifting] = useState(false);

  useEffect(() => {
    console.log('QueueContainer received patients:', patients);
  }, [patients]);

  useEffect(() => {
    const sortedPatients = [...patients]
      .filter((p) => p.status === "pending")
      .sort((a, b) => a.position - b.position);

    setMergedGroup(sortedPatients);
  }, [patients, currentPosition]);

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      // Save original state for potential cancellation
      originalPatientsRef.current = [...mergedGroup];

      const activeItem = mergedGroup.find((item) => item.appointment.appointment_id === active.id);
      const overItem = mergedGroup.find((item) => item.appointment.appointment_id === over.id);

      // Set drag details for confirmation
      setDragActiveId(activeItem);
      setDragOverId(overItem);
    setConfirmDrag(true);
    }
  };

  const handleConfirmDrag = async () => {
    try {
    setIsShifting(true);
      // Local reordering for immediate UI update
      const oldIndex = mergedGroup.findIndex(
        (item) => item.appointment.appointment_id === dragActiveId.appointment.appointment_id
      );
      const newIndex = mergedGroup.findIndex(
        (item) => item.appointment.appointment_id === dragOverId.appointment.appointment_id
      );

      // Create the new ordering
      const newArrangement = arrayMove(mergedGroup, oldIndex, newIndex);
      setMergedGroup(newArrangement);

      // Update positions based on the new order
      const payload = {
        appointment_id: dragActiveId.appointment.appointment_id,
        new_position: dragOverId.position,
      };

      // Call the API to update the position
      await onShufflePosition(payload);
      
    setConfirmDrag(false);
    } catch (error) {
      console.error("Error shifting position:", error);
      // Revert to original order on error
      setMergedGroup(originalPatientsRef.current);
    } finally {
      setIsShifting(false);
    }
  };

  const handleCancelDrag = () => {
    // Revert to original order
    setMergedGroup(originalPatientsRef.current);
    setConfirmDrag(false);
  };

  const handleNext = async (id) => {
    try {
      await onNextPatient(id);
    } catch (error) {
      console.error("Error marking patient as done:", error);
    }
  };

  const handleLate = async (id) => {
    try {
      await onLatePatient(id);
    } catch (error) {
      console.error("Error marking patient as late:", error);
    }
  };

  return (
    <div className="queue-container">
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext
            items={mergedGroup.map((p) => p.appointment.appointment_id)}
            strategy={verticalListSortingStrategy}
          >
          <div className="patient-list">
            {mergedGroup.map((patient) => (
              <PatientItem
                key={patient.appointment.appointment_id}
                patient={patient}
                currentPosition={currentPosition}
                onNextPatient={handleNext}
                onLatePatient={handleLate}
              />
            ))}
          </div>
          </SortableContext>
        </DndContext>

      {/* Confirmation Dialog for Drag and Drop */}
      <Dialog open={confirmDrag} onClose={handleCancelDrag}>
        <DialogTitle>Confirm Position Change</DialogTitle>
        <DialogContent>
          Do you want to move{" "}
          <strong>
            {dragActiveId?.appointment.patient?.name || "this patient"}
          </strong>{" "}
          to position {dragOverId?.position}?
        </DialogContent>
        <DialogActions> 
          <Button onClick={handleCancelDrag} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDrag}
            color="primary"
            disabled={isShifting}
            startIcon={isShifting ? <CircularProgress size={20} /> : null}
          >
            {isShifting ? "Updating..." : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default QueueContainer;
