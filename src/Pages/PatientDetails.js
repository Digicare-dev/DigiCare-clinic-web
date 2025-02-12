import React, { useEffect, useState } from "react";
import "./PatientDetails.css";
import { putData } from "../services/apiService";

export default function PatientDetails({ currentPatient, handleNextPatient }) {
  const [doctorsRemark, setDoctorsRemark] = useState("");

  const addDoctorsRemark = (id) => {
    const payload = {
      appointment_id: id,
      remarks: doctorsRemark,
    };
    putData("queueinfo/add-remarks/", payload);
    setDoctorsRemark("");
  };

  const handleOnNext = (id) => {
    addDoctorsRemark(id);
    handleNextPatient(id);
  };

  return (
    <>
      {currentPatient != null && (
        <div className="patient-details-container">
          <div className="card">
            {/* Patient Photo and Basic Info */}
            <div className="patient-header">
              <div className="avatar">
                {currentPatient.gender === "male" ? "👨" : "👩"}
              </div>
            </div>
            <div className="patient-info">
              <h2 className="patient-name">
                {currentPatient.first_name} {currentPatient.last_name}
              </h2>
              <p>Token Number - {currentPatient.token}</p>
              <p>{currentPatient.gender}</p>
            </div>

            {/* Disease */}
            {/* <div className="section">
          <span className="label">Disease - </span>
          <span className="value">{currentPatient.disease}</span>
        </div> */}

            {/* Doctor's Remark */}
            <div className="section">
              <span className="label">Doctor's Remark - </span>
              <textarea
                className="remark-input"
                value={doctorsRemark}
                onChange={(e) => setDoctorsRemark(e.target.value)}
                placeholder="Add remarks here..."
              ></textarea>
            </div>

            {/* Next Patient Button */}
            <button
              className="button"
              onClick={() => handleOnNext(currentPatient.appointment_id)}
            >
              Next Patient
            </button>
          </div>
        </div>
      )}

      {currentPatient == null && (
        <div
          className="patient-details-container"
          style={{
            height: "30rem",
            justifyContent: "center",
            alignItems: "center",
            display: "flex",
            width: "100%",
          }}
        >
          <div
            className="card"
            style={{
              width: "100%",
              height: "70%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <p>Queue is currently empty</p>
          </div>
        </div>
      )}
    </>
  );
}
