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
  Typography,
  Box,
} from "@mui/material";

const QueueContainer = ({
  loading,
  patients,
  setPatients,
  currentPosition,
  handleNextPatient,
  handleLatePatient,
  shufflePosition,
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
      .filter((p) => p.status === "pending" || p.status === "late")
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
    setIsShifting(true);
    await shufflePosition({
      appointment_id: dragActiveId,
      new_position: mergedGroup.find(
        (p) => p.appointment?.appointment_id === dragOverId
      )?.position,
    });
    setIsShifting(false);
    setConfirmDrag(false);
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
              <Skeleton variant="rectangular" height={100} />
            </div>
          ))}
        </div>
      ) : mergedGroup.length === 0 ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100%',
          flexDirection: 'column',
          gap: 2,
          p: 4,
          textAlign: 'center'
        }}>
          <Typography variant="h6" color="text.secondary">
            No patients in queue
          </Typography>
          <Typography variant="body2" color="text.secondary">
            All patients have been processed or no appointments are scheduled.
          </Typography>
        </Box>
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
            {mergedGroup.map((patient) => (
              <PatientItem
                key={patient.appointment.appointment_id}
                position={patient.position}
                appointment={patient.appointment}
                late={patient.status === "late"}
                currentPosition={currentPosition}
                handleNextPatient={handleNextPatient}
                handleLatePatient={handleLatePatient}
                isDraggable={patient.position > currentPosition}
                paid={patient.paid}
                status={patient.status}
                checkin={patient.checkin}
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
