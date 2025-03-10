import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App, { PDFViewerProvider } from "./App";
import AuthProvider from "./context/AuthContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <AuthProvider>
      <PDFViewerProvider>
        <App />
      </PDFViewerProvider>
    </AuthProvider>
  </StrictMode>
);
