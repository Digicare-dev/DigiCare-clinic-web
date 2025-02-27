import React, { useState, useRef, useEffect } from "react";
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
  Tooltip,
  Chip,
  IconButton,
} from "@mui/material";
import {
  Paid,
  CheckCircle,
  PendingActions,
  AccessTime,
  MedicalServices,
  Lock,
  LockOpen,
} from "@mui/icons-material";
import DragHandleIcon from "@mui/icons-material/DragHandle";

const PatientItem = ({
  position,
  appointment,
  late,
  currentPosition,
  handleNextPatient,
  handleLatePatient,
  isDraggable,
  paid,
  checkin,
  status,
}) => {
  const [confirmAction, setConfirmAction] = useState(null);
  const [loadingType, setLoadingType] = useState(null);
  const [isLocked, setIsLocked] = useState(true);
  const [confirmUnlock, setConfirmUnlock] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: appointment.appointment_id,
      enabled: !isLocked,
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
      setIsLocked(true);
    }
  };

  const handleUnlock = () => {
    setConfirmUnlock(true);
  };

  const handleLock = () => {
    setIsLocked(true);
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
          <Tooltip title={isLocked ? "Unlock to move" : "Lock position"}>
            <IconButton
              onClick={isLocked ? handleUnlock : handleLock}
              sx={{ position: "absolute", left: 8, top: 8 }}
            >
              {isLocked ? (
                <Lock fontSize="small" />
              ) : (
                <LockOpen fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
          <div className="token-badge">
            <MedicalServices fontSize="small" />
            <div className="token-details">
              <span>Token {appointment.token}</span>
            </div>
          </div>

          <div className="patient-details">
            <div className="patient-header">
              <h3>{appointment.name}</h3>
              <div className="status-tags">
                {/* Status Chip */}
                {status === "done_checkup" && (
                  <Tooltip title="Checkup Completed">
                    <Chip
                      label="Completed"
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  </Tooltip>
                )}
                {status === "cancelled" && (
                  <Tooltip title="Appointment Cancelled">
                    <Chip
                      label="Cancelled"
                      size="small"
                      color="error"
                      variant="outlined"
                    />
                  </Tooltip>
                )}

                {/* Payment Status */}
                <Tooltip title={paid ? "Payment Completed" : "Payment Pending"}>
                  <Chip
                    icon={<Paid fontSize="small" />}
                    label={paid ? "Paid" : "Unpaid"}
                    size="small"
                    color={paid ? "success" : "error"}
                    variant="outlined"
                  />
                </Tooltip>

                {/* Check-in Status */}
                {checkin && (
                  <Tooltip title="Checked In">
                    <Chip
                      icon={<CheckCircle fontSize="small" />}
                      label="Checked In"
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Tooltip>
                )}

                {/* Late Status */}
                {late && (
                  <Tooltip title="Patient Running Late">
                    <Chip
                      icon={<AccessTime fontSize="small" />}
                      label="Late"
                      size="small"
                      color="warning"
                      variant="outlined"
                    />
                  </Tooltip>
                )}
              </div>
            </div>

            <div className="appointment-meta">
              <div className="meta-item">
                <PendingActions fontSize="small" />
                <span>{appointment.appointment_type}</span>
              </div>

              {appointment.disease && (
                <div className="meta-item">
                  <MedicalServices fontSize="small" />
                  <span>{appointment.disease}</span>
                </div>
              )}

              {appointment.appointment_time && (
                <div className="meta-item">
                  <AccessTime fontSize="small" />
                  <span>
                    Scheduled:{" "}
                    {new Date(appointment.appointment_time).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Action Buttons */}
        {type === "current" && (
          <div className="action-buttons">
            <MuiButton
              variant="contained"
              color="error"
              onClick={() => setConfirmAction("late")}
              disabled={!!loadingType}
              startIcon={
                loadingType === "late" && (
                  <CircularProgress size={20} color="inherit" />
                )
              }
              sx={{ minWidth: 120 }}
            >
              {loadingType !== "late" && "Mark Late"}
            </MuiButton>
            <MuiButton
              variant="contained"
              color="success"
              onClick={() => setConfirmAction("next")}
              disabled={!!loadingType}
              startIcon={
                loadingType === "next" && (
                  <CircularProgress size={20} color="inherit" />
                )
              }
              sx={{ minWidth: 120 }}
            >
              {loadingType !== "next" && "Done Checkup"}
            </MuiButton>
          </div>
        )}
        {/* "Done Checkup" Button for Non-Current Patients */}
        {type !== "current" && (
          <div className="action-buttons">
            <MuiButton
              variant="contained"
              color="success"
              onClick={() => setConfirmAction("next")}
              disabled={!!loadingType}
              startIcon={
                loadingType === "next" && (
                  <CircularProgress size={20} color="inherit" />
                )
              }
              sx={{
                minWidth: 120,
                marginLeft: "auto", // Align to the right
              }}
            >
              {loadingType !== "next" && "Done Checkup"}
            </MuiButton>
          </div>
        )}
        {
          <div // currently accepting the dragging in top 5
            className="drag-handle"
            {...attributes}
            {...(isLocked ? {} : listeners)}
          >
            <DragHandleIcon />
          </div>
        }
      </div>

      <Dialog open={confirmUnlock} onClose={() => setConfirmUnlock(false)}>
        <DialogTitle>Confirm Unlock</DialogTitle>
        <DialogContent>
          Are you sure you want to unlock this patient's position?
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={() => setConfirmUnlock(false)}>Cancel</MuiButton>
          <MuiButton
            onClick={() => {
              setIsLocked(false);
              setConfirmUnlock(false);
            }}
            color="primary"
          >
            Confirm Unlock
          </MuiButton>
        </DialogActions>
      </Dialog>

      <Dialog open={!!confirmAction} onClose={() => setConfirmAction(null)}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          Are you sure you want to {confirmAction} this patient?
        </DialogContent>
        <DialogActions>
          <MuiButton
            onClick={() => setConfirmAction(null)}
            disabled={!!loadingType}
          >
            Cancel
          </MuiButton>
          <MuiButton
            onClick={handleConfirm}
            color="primary"
            disabled={!!loadingType}
            startIcon={
              loadingType && <CircularProgress size={20} color="inherit" />
            }
          >
            Confirm
          </MuiButton>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PatientItem;
