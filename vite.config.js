import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Hub berada di root folder ini. Setiap modul (01-10) adalah subfolder,
// jadi App.jsx mereka bisa di-import langsung tanpa masalah fs.allow.
export default defineConfig({
  plugins: [react()],
  server: {
    // H11: modul mandiri memakai port default 5173. Kalau hub ikut 5173,
    // menjalankan hub + satu modul bersamaan membuat yang kedua naik ke
    // 5174 tanpa peringatan -- membingungkan saat mengajar. Hub dapat port
    // sendiri, dan strictPort membuat ia GAGAL KERAS alih-alih diam-diam
    // pindah port kalau 5200 sudah terpakai.
    port: 5200,
    strictPort: true,
  },
  // Konfigurasi Vitest ditaruh di file ini dengan sengaja: test memakai
  // plugin React yang SAMA dengan app. Kalau dipisah ke vitest.config.js,
  // ada dua daftar plugin yang bisa diam-diam berbeda dan JSX tertransformasi
  // beda waktu di uji vs di build.
  test: {
    environment: "jsdom",
    // globals: true supaya afterEach/cleanup otomatis dan setup file cukup
    // meng-import jest-dom sekali.
    globals: true,
    setupFiles: "./src/test/setup.js",
    // Berkas uji tinggal di tests/ (bukan src/) karena ada juga yang menguji
    // isi folder modul, bukan hanya kode hub.
    include: ["tests/**/*.test.{js,jsx}"],
    clearMocks: true,
    // Batas waktu per uji dinaikkan dari bawaan 5 detik. Terukur di mesin ini:
    // "merender tiga tugas bawaan" butuh ±3 detik kalau berkas itu jalan
    // sendirian, dan pernah MELEWATI 5 detik (merah sekali di suite penuh,
    // hijau saat diulang) ketika suite dedup spawn puluhan proses bash/find/node
    // bersamaan. Yang longgar adalah lingkungannya, bukan ujininya -- jangan
    // dibaca sebagai "uji ini memang lambat". Sumber sesungguhnya tercatat di
    // §3.6 HANDOFF: jsdom dibuat 7 kali.
    testTimeout: 20000,
  },
});
