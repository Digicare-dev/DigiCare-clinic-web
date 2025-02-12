import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";

export default function SuccessAlert({ title, message }) {
  return (
    <div
      style={{
        margin: "auto",
        margin: "auto",
        height: "60vh",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Alert severity="success">
        <AlertTitle>{title}</AlertTitle>
        {message}
      </Alert>
    </div>
  );
}
