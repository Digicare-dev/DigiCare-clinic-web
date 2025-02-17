import React, { useRef, useEffect, useState } from "react";
import PatientItem from "../components/PatientItem";
import "./QueueContainer.css";
import { DndContext } from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { Typography, Button } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import AssignmentIcon from "@mui/icons-material/Assignment";

const QueueContainer = ({
  patients,
  setPatients,
  currentPosition,
  handleNextPatient,
  handleLatePatient,
  shufflePosition,
}) => {
  const patientRefs = useRef({});
  const [droppedItem, setDroppedItem] = useState(null);
  const [changedPosition, setChangedPosition] = useState(null);

  useEffect(() => {
    if (patientRefs.current[currentPosition]) {
      const element = patientRefs.current[currentPosition];
      const targetScroll = element.offsetTop - 160;
      const container = document.querySelector(".queue-container");
      const startScroll = container.scrollTop;
      const distance = targetScroll - startScroll;
      let startTime = null;

      function animateScroll(time) {
        if (!startTime) startTime = time;
        const progress = Math.min((time - startTime) / 800, 1);
        container.scrollTop = startScroll + distance * progress;
        if (progress < 1) requestAnimationFrame(animateScroll);
      }

      requestAnimationFrame(animateScroll);
    }
  }, [currentPosition]);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setPatients((prevPatients) => {
        const oldIndex = prevPatients.findIndex(
          (patient) => patient.position === active.id
        );
        const newIndex = prevPatients.findIndex(
          (patient) => patient.position === over.id
        );
        const newPatients = arrayMove(prevPatients, oldIndex, newIndex);
        setChangedPosition(active.id); // Set the changed position

        return newPatients;
      });

      setDroppedItem(event.active.id);
      setTimeout(() => setDroppedItem(null), 300); // Remove effect after 0.5s

      const payload = {
        appointment_id: patients[active.id - 1].appointment_id,
        new_position: over.id,
      };
      await shufflePosition(payload);
    }
  };

  return (
    <div className="queue-container">
      {patients.length !== 0 ? (
        <DndContext
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={patients.map((p) => p.position)}>
            {patients.map((patient) => {
              let type;
              if (patient.position < currentPosition) {
                type = "done";
              } else if (patient.position === currentPosition) {
                type = "current";
              } else {
                type = "upcoming";
              }

              if (patient.type === "E" && type === "upcoming") {
                type += " emergency-case";
              }

              return (
                <div
                  key={patient.token}
                  ref={(el) => {
                    if (el) {
                      patientRefs.current[patient.position] = el;
                    } else {
                      delete patientRefs.current[patient.position];
                    }
                  }}
                >
                  <PatientItem
                    firstName={patient.first_name}
                    lastName={patient.last_name}
                    guardian={patient.guardian}
                    late={patient.late}
                    position={patient.position}
                    token={patient.token}
                    appointmentId={patient.appointment_id}
                    onNext={handleNextPatient}
                    type={type}
                    handleLatePatient={handleLatePatient}
                    droppedItem={droppedItem}
                    appointmentType={patient.type}
                    currentPosition={currentPosition}
                    changedPosition={changedPosition}
                    dob={patient.dob}
                  />
                </div>
              );
            })}
          </SortableContext>
        </DndContext>
      ) : (
        <div
          style={{
            textAlign: "center",
            height: "inherit",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-around",
          }}
        >
          <div>
            <Typography variant="h6" gutterBottom>
              Queue is currently empty
            </Typography>
            <AssignmentIcon style={{ fontSize: "60px", color: "#007bff" }} />
            <Typography variant="body1" gutterBottom>
              There are no patients in the queue at the moment.
            </Typography>
          </div>
          <div>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={() => window.location.reload()} // Example action to refresh the page
              sx={{
                width: "fit-content",
                backgroundColor: "#007bff",
              }}
            >
              Refresh
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QueueContainer;
