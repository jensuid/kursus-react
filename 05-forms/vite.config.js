import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Konfigurasi standar Vite untuk React.
// plugin-react menambahkan dukungan JSX + hot reload saat development.
export default defineConfig({
  plugins: [react()],
});
