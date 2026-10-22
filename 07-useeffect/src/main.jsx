// Titik masuk aplikasi React.
// 1. Buat "root" dari elemen <div id="root"> di index.html
// 2. Render komponen <App /> ke dalamnya
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
