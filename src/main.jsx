import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import Hub from "./Hub.jsx";
import "./hub.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Hub />
    </BrowserRouter>
  </StrictMode>
);
