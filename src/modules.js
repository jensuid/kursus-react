import { lazy } from "react";

/**
 * Registry semua modul kursus. Hub membaca array ini untuk membangun
 * sidebar, rute, dan kartu overview.
 *
 * Tambah modul baru cukup dengan menambah satu objek di sini.
 *
 * Tipe:
 *  - "react" → punya App.jsx yang di-mount langsung (modul 01-10)
 *  - "es6"   → halaman baca-saja berisi file .js (modul 00)
 *  - "md"    → halaman baca-saja berisi markdown (modul 11)
 */
export const modules = [
  {
    num: "00",
    folder: "00-es6-crash-course",
    title: "ES6 Crash Course",
    desc: "Fondasi JavaScript modern: arrow, destructuring, map/filter/reduce, module, async.",
    type: "es6",
    // Component tidak perlu; dirender oleh Es6Page.
  },
  {
    num: "01",
    folder: "01-hello-component",
    title: "Hello Component",
    desc: "JSX, komponen fungsional, props, children, dan komposisi.",
    type: "react",
    Component: lazy(() => import("../01-hello-component/src/App.jsx")),
  },
  {
    num: "02",
    folder: "02-styling",
    title: "Styling",
    desc: "Import CSS, conditional class, dan inline style.",
    type: "react",
    Component: lazy(() => import("../02-styling/src/App.jsx")),
  },
  {
    num: "03",
    folder: "03-events-state",
    title: "Events & State",
    desc: "onClick/onChange, useState, re-render, dan updater function.",
    type: "react",
    Component: lazy(() => import("../03-events-state/src/App.jsx")),
  },
  {
    num: "04",
    folder: "04-lists-keys",
    title: "Lists & Keys",
    desc: "Rendering daftar dengan .map() dan pentingnya key.",
    type: "react",
    Component: lazy(() => import("../04-lists-keys/src/App.jsx")),
  },
  {
    num: "05",
    folder: "05-forms",
    title: "Forms",
    desc: "Controlled component, dua-arah input, submit, dan validasi sederhana.",
    type: "react",
    Component: lazy(() => import("../05-forms/src/App.jsx")),
  },
  {
    num: "06",
    folder: "06-lifting-context",
    title: "Lifting & Context",
    desc: "Lifting state up, masalah props drilling, dan Context API.",
    type: "react",
    Component: lazy(() => import("../06-lifting-context/src/App.jsx")),
  },
  {
    num: "07",
    folder: "07-useeffect",
    title: "useEffect",
    desc: "Side effect, dependency array, dan cleanup.",
    type: "react",
    Component: lazy(() => import("../07-useeffect/src/App.jsx")),
  },
  {
    num: "08",
    folder: "08-custom-hooks",
    title: "Custom Hooks",
    desc: "Membuat hook kustom (useCounter, useLocalStorage) & aturan hooks.",
    type: "react",
    Component: lazy(() => import("../08-custom-hooks/src/App.jsx")),
  },
  {
    num: "09",
    folder: "09-api-data",
    title: "API & Data",
    desc: "Fetch data async, status loading/error/empty, dan hook useFetch.",
    type: "react",
    Component: lazy(() => import("../09-api-data/src/App.jsx")),
  },
  {
    num: "10",
    folder: "10-final-project",
    title: "Proyek Akhir: Todo App",
    desc: "Menggabungkan semua konsep: CRUD, filter, statistik, localStorage.",
    type: "react",
    Component: lazy(() => import("../10-final-project/src/App.jsx")),
  },
  {
    num: "11",
    folder: "11-next-steps.md",
    title: "Next Steps",
    desc: "Arah belajar lanjutan: Router, TypeScript, Next.js, React Query/Zustand.",
    type: "md",
    // Component tidak perlu; dirender oleh NextStepsPage.
  },
];

// Cari satu modul berdasarkan nomor (mis. "03").
export function findModule(num) {
  return modules.find((m) => m.num === num);
}
