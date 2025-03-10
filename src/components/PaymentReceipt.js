import React, { useEffect } from "react";

const PaymentReceipt = React.forwardRef(({ patient }, ref) => {
  return (
    <div ref={ref} style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>Booking Payment Receipt</h2>
      <p>
        <strong>Name:</strong> {patient?.firstName} {patient?.lastName}
      </p>
      <p>
        <strong>Token:</strong> {patient?.token}
      </p>
      <p>
        <strong>Appointment Type:</strong> {patient?.appointment_type}
      </p>
      <p>
        <strong>Disease:</strong> {patient?.disease}
      </p>
      <p>
        <strong>Payment Status:</strong> {patient?.paid ? "Paid" : "Unpaid"}
      </p>
      <p>
        <strong>Amount Paid:</strong> ₹{patient?.fees_paid}
      </p>
      <p>
        <strong>Payment Mode:</strong> {patient?.mode}
      </p>
      <p>
        <strong>Date:</strong> {new Date().toLocaleDateString()}
      </p>
    </div>
  );
});

export default PaymentReceipt;
