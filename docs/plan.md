# Kursus React Terstruktur — Dari ES6 Sampai Mampu Membuat App Sendiri

## Ringkasan
Membuat 12 modul pembelajaran bertahap di `/Volumes/JensData/Jensu-Projects/frontend-basic/react-ui`. Setiap modul = folder dengan **README penjelasan konseptus (bahasa Indonesia)** + **kode yang bisa langsung dijalankan**. Alur: pra-ES6 → fundamental React → state & data → hooks lanjutan → proyek akhir.

## Struktur Folder

```
react-ui/
├── README.md                  # Peta kurikulum + cara pakai + urutan belajar
├── 00-es6-crash-course/       # Crash course ES6 (dijalankan dengan `node`, tanpa bundler)
│   ├── README.md
│   └── 01-let-const.js ... 08-misc.js
├── 01-hello-component/        # JSX, component, props, children
│   ├── README.md
│   └── src/...
├── 02-styling/                # CSS import, conditional class, inline style
├── 03-events-state/           # Event handling, useState, re-render
├── 04-lists-keys/             # map + keys, list rendering
├── 05-forms/                  # Controlled components, form submit
├── 06-lifting-context/        # Lifting state up, Props drilling, Context API
├── 07-useeffect/              # side effect, dependency array, cleanup
├── 08-custom-hooks/           # Hook kustom, aturan penggunaan hooks
├── 09-api-data/               # fetch async, loading/error state
├── 10-final-project/          # Todo Appgabungan semua konsep + localStorage
└── 11-next-steps.md           # Panduan lanjutan: router, TypeScript, Next.js, Zustand/React Query
```

Modul 01–10 masing-masing adalah app Vite mandiri (React 19 + JavaScript, tanpa TypeScript agar fokus konsep).

## Detail Modul

### 00 — ES6 Crash Course (8 file `.js` yang dijalankan `node 01-let-const.js`)
- `let`/`const`, template literals, arrow functions
- Destructuring (object & array), default parameters, spread/rest
- **Map/filter/reduce** (krucial untuk rendering list di React)
- ES modules (`import`/`export`)
- Promises & async/await (bekal untuk modul API)
- Setiap file: komentar penjelasan + latihan kecil di bagian bawah.

### 01–02 — Fundamental: Komponen, JSX, Props, Styling
- Kenapa React ada (deklaratif vs imperatif, komponenisasi)
- JSX = HTML di JS; aturan JSX (`className`, self-closing, ekspresi `{}`)
- Props, children, komposisi komponen, reusable component
- Styling: import CSS, conditional classing, inline styles
- Latihan: komponen `Card` yang menerima props.

### 03–05 — Interaksi: Events, State, Lists, Forms
- `onClick`, `onChange`, event object; kenapa state tidak boleh diubah langsung
- `useState` lengkap: cara kerja, re-render, updater function, state objek/array
- Rendering list dengan `.map()`, kenapa `key` penting
- Controlled components (input ⇄ state), submit form, validasi sederhana
- Latihan mini: counter, ganti warna, daftar hobi, form pendaftar.

### 06 — State Management Dasar: Lifting Up & Context
- Prinsip "single source of truth"; lift state ke parent bersama
- Masalah props drilling → solusi Context API (`createContext`, `useContext`)
- Pola: state provider component
- Latihan: tema (light/dark) yang diakses komponen anak sedalam apa pun.

### 07–09 — Hooks Lanjutan & Data Asinkron
- `useEffect`: kapan berjalan, dependency array, cleanup, common pitfalls (infinite loop)
- Custom hooks: abstraksi logika (`useCounter`, `useLocalStorage`) + aturan hooks
- Fetch data dari API publik (jsonplaceholder) dengan `useEffect` + async/await, status loading/error/empty
- Refs sekilas (`useRef`) untuk konteks.

### 10 — Proyek Akhir: Todo App Lengkap
Menggabungkan semua konsep dalam 1 app yang layak dipakai:
- Struktur multi-komponen (App → Header/InputList/List/Item/Footer)
- CRUD todo, filter (all/active/done), hitung statistik
- Persistensi dengan localStorage via custom hook `useLocalStorage`
- README berisi: arsitektur app, diagram alur data (teks), dan **tantangan lanjutan** (tambah due date, edit item).

### 11 — Next Steps (dokumen panduan saja)
Arah belajar setelah kursus: React Router, TypeScript, Next.js, React Query/Zustand, deployment (Vercel/Netlify).

## Root README
Peta kurikulum 12 modul, estimasi waktu per modul, cara menjalankan (`cd 01-hello-component && npm install && npm run dev`), dan saran metode belajar (baca README → jalankan → modifikasi kode → kerjakan latihan).

## Konfigurasi Teknis
- React 19 + `react-dom` + `@vitejs/plugin-react` (devDependency) per modul
- `vite.config.js`, `index.html`, `src/main.jsx`, `src/App.jsx` minimal dan seragam antar modul
- Tanpa react-router/axios — tetap ringan; dependency tambahan hanya disebut di modul 11

## Verifikasi
- `npm install` di satu modul contoh, lalu `npm run dev` untuk memastikan app berjalan
- `node` pada 1–2 file ES6 untuk memastikan tidak ada syntax error
- Tidak ada server yang dibiarkan berjalan; hasil akhir = source code siap dijalankan sendiri

## Asumsi
- Bahasa pengantar README & komentar: **Indonesia**; penamaan kode tetap Inggris
- JavaScript murni (tanpa TypeScript) sesuai fokus "mengerti konsep"
- Node.js sudah terpasang di sistem (dipakai untuk Vite dan modul 00)