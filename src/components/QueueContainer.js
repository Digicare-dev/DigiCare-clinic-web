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
  Typography,
  Divider,
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
  fetchPatientsData,
  fetchPatientsDataWithoutLoader,
  fetchCurrentPositionDataWithoutLoader,
}) => {
  const [currentGroup, setCurrentGroup] = useState([]);
  const [upcomingGroup, setUpcomingGroup] = useState([]);
  const [queueStarted, setQueueStarted] = useState(false); // Track if queue is started
  const [confirmDrag, setConfirmDrag] = useState(false);
  const [dragActiveId, setDragActiveId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const originalPatientsRef = useRef([]);
  const [isShifting, setIsShifting] = useState(false);

  const sortedPatients = [...patients]
    .filter((p) => p.status === "pending")
    .sort((a, b) => a.position - b.position);

  // Calculate all slots whenever patients change
  useEffect(() => {
    const sortedPatients = [...patients]
      .filter((p) => p.status === "pending")
      .sort((a, b) => a.position - b.position);

    const positions = sortedPatients.map((p) => p.position);
    const maxPosition = Math.max(...positions, currentPosition + 4);
    const allSlots = Array.from({ length: maxPosition }, (_, i) => {
      const position = i + 1;
      const patient = sortedPatients.find((p) => p.position === position);
      return patient || { position, isEmpty: true };
    });

    const currentEnd = Math.min(currentPosition + 4, maxPosition);
    setCurrentGroup(allSlots.slice(currentPosition - 1, currentEnd));
    setUpcomingGroup(allSlots.slice(currentEnd));
  }, [patients, currentPosition]); // Added patients and currentPosition as dependencies

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    originalPatientsRef.current = [...patients];

    const activePatient = patients.find(
      (p) => p.appointment.appointment_id === active.id
    );
    const overPatient = patients.find(
      (p) => p.appointment.appointment_id === over.id
    );

    setConfirmDrag(true);
    setDragActiveId(active.id);
    setDragOverId(over.id);
  };

  const handleConfirmDrag = async () => {
    try {
      setLock(false);
      setIsShifting(true);
      await shufflePosition({
        appointment_id: dragActiveId,
        new_position: patients.find(
          (p) => p.appointment.appointment_id === dragOverId
        ).position,
      });
      setLock(true);
      setIsShifting(false);
      setConfirmDrag(false);
    } catch (error) {
      console.error("Drag failed:", error);
      setPatients(originalPatientsRef.current);
    }
  };

  const handleCancelDrag = () => {
    setConfirmDrag(false);
  };

  const handleStartQueue = async () => {
    try {
      //  await startQueueApi();
      //  fetchPatientsData();
      setQueueStarted(true);
    } catch (error) {
      console.error("Failed to start queue:", error);
    }
  };
  return (
    <div className="queue-container">
      {!queueStarted && (
        <Button
          variant="contained"
          color="primary"
          onClick={handleStartQueue}
          sx={{ mb: 2 }}
        >
          Start Queue
        </Button>
      )}

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
      ) : !queueStarted ? (
        <div className="empty-queue">
          <Typography variant="h6">Queue is currently empty</Typography>
        </div>
      ) : (
        <>
          {/* Current Patients */}
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
                  handleNextPatient={handleNextPatient}
                  handleLatePatient={handleLatePatient}
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

          {/* Upcoming Patients */}
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
                        handleNextPatient={handleNextPatient}
                        handleLatePatient={handleLatePatient}
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
