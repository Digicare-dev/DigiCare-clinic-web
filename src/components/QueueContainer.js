import React, { useRef, useEffect, useState } from "react";
import PatientItem from "../components/PatientItem";
import "./QueueContainer.css";
import { DndContext } from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

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

  useEffect(() => {
    if (patientRefs.current[currentPosition]) {
      const element = patientRefs.current[currentPosition];
      const targetScroll = element.offsetTop - 100;
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
      setPatients(() => {
        const oldIndex = patients.findIndex(
          (patient) => patient.position === active.id
        );
        const newIndex = patients.findIndex(
          (patient) => patient.position === over.id
        );
        console.log(patients, arrayMove(patients, oldIndex, newIndex));
        return arrayMove(patients, oldIndex, newIndex);
      });

      const payload = {
        appointment_id: patients[active.id - 1].appointment_id,
        new_position: over.id,
      };
      await shufflePosition(payload);
    }

    if (event.over) {
      setTimeout(() => {
        setDroppedItem(event.over.id);
        setTimeout(() => setDroppedItem(null), 500); // Remove effect after 0.5s
      }, 200);
    }
  };

  return (
    <div className="queue-container">
      {!patients.length && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <h3>No patients currently.</h3>
        </div>
      )}

      {patients.length !== 0 && (
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
                    late={patient.late}
                    position={patient.position}
                    token={patient.token}
                    appointmentId={patient.appointment_id}
                    onNext={handleNextPatient}
                    type={type}
                    handleLatePatient={handleLatePatient}
                    droppedItem={droppedItem}
                  />
                </div>
              );
            })}
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

export default QueueContainer;
