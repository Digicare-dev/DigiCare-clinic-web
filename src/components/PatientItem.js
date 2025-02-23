import React, { useState } from "react";
import "./PatientItem.css";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button as MuiButton,
  CircularProgress,
} from "@mui/material";
import DragHandleIcon from "@mui/icons-material/DragHandle";

const PatientItem = ({
  position,
  appointment,
  late,
  currentPosition,
  handleNextPatient,
  handleLatePatient,
  isDraggable,
}) => {
  const [confirmAction, setConfirmAction] = useState(null);
  const [loadingType, setLoadingType] = useState(null);
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: `${appointment.appointment_id}-${position}`,
    });

  const handleConfirm = async () => {
    if (!confirmAction) return;

    try {
      setLoadingType(confirmAction);
      switch (confirmAction) {
        case "late":
          await handleLatePatient(appointment.appointment_id);
          break;
        case "next":
          await handleNextPatient(appointment.appointment_id);
          break;
      }
    } finally {
      setConfirmAction(null);
      setLoadingType(null);
    }
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    position: "relative",
  };

  const type =
    position === currentPosition
      ? "current"
      : position < currentPosition
      ? "done"
      : "upcoming";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`patient-item ${type} ${late ? "late" : ""}`}
    >
      <div className="patient-content">
        <div className="patient-info">
          <div className="token-badge">Token {appointment.token}</div>
          <div>
            <h3>{appointment.name}</h3>
            <p>Type: {appointment.appointment_type}</p>
          </div>
        </div>

        {type === "current" && (
          <div className="action-buttons">
            <MuiButton
              variant="contained"
              color="error"
              onClick={() => setConfirmAction("late")}
              disabled={loadingType}
            >
              {loadingType === "late" ? (
                <CircularProgress size={20} />
              ) : (
                "Mark Late"
              )}
            </MuiButton>
            <MuiButton
              variant="contained"
              color="success"
              onClick={() => setConfirmAction("next")}
              disabled={loadingType}
            >
              {loadingType === "next" ? (
                <CircularProgress size={20} />
              ) : (
                "Next Patient"
              )}
            </MuiButton>
          </div>
        )}

        {isDraggable && type === "upcoming" && (
          <div className="drag-handle" {...attributes} {...listeners}>
            <DragHandleIcon />
          </div>
        )}
      </div>

      <Dialog open={!!confirmAction} onClose={() => setConfirmAction(null)}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          Are you sure you want to {confirmAction} this patient?
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setConfirmAction(null)}>Cancel</MuiButton>
          <MuiButton onClick={handleConfirm} color="primary">
            Confirm
          </MuiButton>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PatientItem;
