import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Hub berada di root folder ini. Setiap modul (01-10) adalah subfolder,
// jadi App.jsx mereka bisa di-import langsung tanpa masalah fs.allow.
export default defineConfig({
  plugins: [react()],
});
