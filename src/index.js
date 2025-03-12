import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App, { PDFViewerProvider } from "./App";
import AuthProvider from "./context/AuthContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <AuthProvider>
      <PDFViewerProvider>
        <App />
      </PDFViewerProvider>
    </AuthProvider>
);
