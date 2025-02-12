import { useEffect } from "react";
import "./PatientItem.css";
import { useMediaQuery } from "@mui/material";
import DoneIcon from "@mui/icons-material/Done";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import DragHandleIcon from "@mui/icons-material/DragHandle";

export default function PatientItem({
  firstName,
  lastName,
  late,
  position,
  token,
  onNext,
  appointmentId,
  type,
  handleLatePatient,
  droppedItem,
}) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: position });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: isDragging ? "none" : "auto",
  };

  return (
    <>
      {!isMobile && (
        <div
          ref={setNodeRef}
          style={style}
          className={`patient-item-container ${type} ${
            droppedItem === position ? "dropped-effect" : ""
          } ${late === true ? "late" : ""}`}
        >
          <div className="patient-details">
            <div style={{ display: "flex", width: "100%", gap: "30px" }}>
              <p>
                {position}.{" "}
                <strong>
                  {firstName} {lastName}
                </strong>
              </p>
              <p>Token : {token}</p>
            </div>
            {type === "done" && (
              <div className="patient-list-item-icon-right">
                <DoneIcon />
              </div>
            )}
            {type === "upcoming" && (
              <div
                {...attributes}
                {...listeners}
                className="patient-list-item-icon-right icon-drag-handle"
              >
                <DragHandleIcon />
              </div>
            )}

            {/* <p>Age: {age}</p> */}
            {/* <p>Gender: {gender}</p> */}
            {/* <p>Condition: {medicalCondition}</p> */}
          </div>
          {type === "current" && (
            <div className="button-container">
              <button
                className="late-button"
                onClick={() => {
                  handleLatePatient(appointmentId, position);
                }}
              >
                Mark Late
              </button>
              <button
                className="next-button"
                onClick={() => {
                  onNext(appointmentId);
                }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {isMobile && (
        <div
          ref={setNodeRef}
          style={style}
          className={`patient-item-container ${type} ${
            droppedItem === position ? "dropped-effect" : ""
          }`}
        >
          <div className="patient-details">
            <div style={{ display: "flex", flexDirection: "column" }}>
              <p>
                {position}
                {". "}
                <strong>
                  {firstName} {lastName}
                </strong>
              </p>
              <p>Token - {token}</p>
              {/* <p>Position - {position}</p> */}
            </div>
            {type === "upcoming" && (
              <div {...attributes} {...listeners} className="icon-drag-handle">
                <DragHandleIcon />
              </div>
            )}
            {type === "done" && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginRight: "20px",
                }}
              >
                <DoneIcon />
              </div>
            )}

            {/* <p>Age - {age}</p> */}
          </div>
          <div className="button-container">
            {type === "current" && (
              <button
                className="late-button"
                onClick={() => {
                  handleLatePatient(appointmentId);
                }}
              >
                Mark Late
              </button>
            )}
            {type === "current" && (
              <button
                className="next-button"
                onClick={() => {
                  onNext(appointmentId);
                }}
              >
                Next
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
