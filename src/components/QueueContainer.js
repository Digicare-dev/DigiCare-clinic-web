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
  loading,
  patients,
  setPatients,
  currentPosition,
  handleNextPatient,
  handleLatePatient,
  shufflePosition,
  fetchPatientsDataWithoutLoader,
  fetchCurrentPositionDataWithoutLoader,
}) => {
  const [mergedGroup, setMergedGroup] = useState([]);
  const [confirmDrag, setConfirmDrag] = useState(false);
  const [dragActiveId, setDragActiveId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const originalPatientsRef = useRef([]);
  const [isShifting, setIsShifting] = useState(false);

  useEffect(() => {
    const sortedPatients = [...patients]
      .filter((p) => p.status === "pending")
      .sort((a, b) => a.position - b.position);

    setMergedGroup(sortedPatients);
  }, [patients, currentPosition]);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    originalPatientsRef.current = [...patients];

    const activeIndex = mergedGroup.findIndex(
      (p) => p.appointment?.appointment_id === active.id
    );
    const overIndex = mergedGroup.findIndex(
      (p) => p.appointment?.appointment_id === over.id
    );

    const newMergedGroup = arrayMove(mergedGroup, activeIndex, overIndex);
    setMergedGroup(newMergedGroup);
    setConfirmDrag(true);
    setDragActiveId(active.id);
    setDragOverId(over.id);
  };

  const handleConfirmDrag = async () => {
    try {
      setIsShifting(true);
      await shufflePosition({
        appointment_id: dragActiveId,
        new_position: mergedGroup.find(
          (p) => p.appointment?.appointment_id === dragOverId
        )?.position,
      });
      await fetchPatientsDataWithoutLoader();
      await fetchCurrentPositionDataWithoutLoader();
    } catch (error) {
      setPatients(originalPatientsRef.current);
    } finally {
      setIsShifting(false);
      setConfirmDrag(false);
    }
  };

  const handleCancelDrag = () => {
    setPatients(originalPatientsRef.current);
    setConfirmDrag(false);
  };

  return (
    <div className="queue-container">
      {loading ? (
        <div className="skeleton-container">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="skeleton-item">
              <Skeleton
                variant="rectangular"
                width="100%"
                height={100}
                sx={{ borderRadius: 2, mb: 2, bgcolor: "grey.200" }}
              />
            </div>
          ))}
        </div>
      ) : (
        <DndContext
          modifiers={[restrictToVerticalAxis]}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={mergedGroup.map((p) => p.appointment.appointment_id)}
            strategy={verticalListSortingStrategy}
          >
            {mergedGroup.map((slot) => (
              <PatientItem
                key={slot.appointment.appointment_id}
                {...slot}
                currentPosition={currentPosition}
                handleNextPatient={handleNextPatient}
                handleLatePatient={handleLatePatient}
                isDraggable={slot.position > currentPosition + 3}
                paid={slot.paid}
                status={slot.status}
                checkin={slot.checkin}
                fetchPatientsDataWithoutLoader={fetchPatientsDataWithoutLoader}
                fetchCurrentPositionDataWithoutLoader={
                  fetchCurrentPositionDataWithoutLoader
                }
              />
            ))}
          </SortableContext>
        </DndContext>
      )}

      <Dialog open={confirmDrag} onClose={handleCancelDrag}>
        <DialogTitle>Confirm Position Change</DialogTitle>
        <DialogContent>
          Are you sure you want to move this patient to the new position?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDrag}>Cancel</Button>
          <Button onClick={handleConfirmDrag} color="primary">
            {isShifting ? (
              <CircularProgress size={24} color="white" />
            ) : (
              "Confirm"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default QueueContainer;
