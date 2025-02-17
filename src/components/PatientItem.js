import { useState } from "react";
import "./PatientItem.css";
import { useMediaQuery, CircularProgress } from "@mui/material";
import DoneIcon from "@mui/icons-material/Done";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import DragHandleIcon from "@mui/icons-material/DragHandle";

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

export default function PatientItem({
  firstName,
  lastName,
  guardian,
  late,
  position,
  token,
  onNext,
  appointmentId,
  type,
  handleLatePatient,
  droppedItem,
  appointmentType,
  currentPosition,
  changedPosition,
  dob,
  age,
}) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [loading, setLoading] = useState(null);
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

  const handleNextclick = async (appointmentId) => {
    setLoading(2);
    const result = await onNext(appointmentId);
    if (result) {
      setLoading(null);
    }
  };

  const handleLateClick = async (appointmentId) => {
    setLoading(1);
    const result = await handleLatePatient(appointmentId);
    if (result) {
      setLoading(null);
    }
  };

  const getAge = (dob) => {
    const date = new Date(dob);
    const diffMs = Date.now() - date.getTime();
    const ageDt = new Date(diffMs);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
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
                <strong>
                  {capitalizeFirstLetter(firstName)}{" "}
                  {capitalizeFirstLetter(lastName)}
                </strong>
              </p>
              <p>[{capitalizeFirstLetter(guardian)}]</p>

              <p>Token : {token}</p>
              <p>Age : {age}</p>

              {appointmentType === "E" && position > currentPosition && (
                <span className="emergency-label">Emergency</span>
              )}
              {late && position > currentPosition && (
                <span className="late-label">Running Late</span>
              )}
            </div>
            {type === "done" && (
              <div className="patient-list-item-icon-right">
                <DoneIcon />
              </div>
            )}
            {position > currentPosition && (
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
                className="patient-item-button late-button"
                onClick={() => {
                  handleLateClick(appointmentId);
                }}
              >
                {loading === 1 ? (
                  <CircularProgress size={20} color="white" />
                ) : (
                  "Mark Late"
                )}{" "}
              </button>
              <button
                className="patient-item-button next-button"
                onClick={() => {
                  handleNextclick(appointmentId);
                }}
              >
                {loading === 2 ? (
                  <CircularProgress size={20} color="white" />
                ) : (
                  "Next"
                )}
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
          } ${late === true ? "late" : ""} ${
            changedPosition === position ? "changed-position" : ""
          }`}
        >
          <div className="patient-details">
            <div
              style={{ display: "flex", flexDirection: "column", gap: "2px" }}
            >
              <p>
                {position}
                {". "}
                <strong>
                  {firstName} {lastName}
                </strong>
              </p>
              <p>[{guardian}]</p>
              {/* <p>Token - {token}</p> */}
              {/* <p>Age - {getAge(dob)}</p> */}
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
                className="patient-item-button late-button"
                onClick={() => {
                  handleLatePatient(appointmentId);
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="white" />
                ) : (
                  "Mark Late"
                )}{" "}
              </button>
            )}
            {type === "current" && (
              <button
                className="patient-item-button next-button"
                onClick={() => {
                  onNext(appointmentId);
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="white" />
                ) : (
                  "Next"
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
