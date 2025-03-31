import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import App from "./App.tsx";
import LoginPage from "./pages/login/login.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LoginPage />
  </StrictMode>
);
