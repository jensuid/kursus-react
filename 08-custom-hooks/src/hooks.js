// =====================================================================
// hooks.js — rumah untuk custom hooks project ini
// Custom hook = fungsi biasa yang (1) namanya diawali "use" dan
// (2) boleh memanggil hook lain. Gunanya: MEMBUANG logika berulang
// dari komponen agar bisa dipakai di banyak tempat.
// =====================================================================
import { useEffect, useState } from "react";

// ---------------------------------------------------------------
// useCounter — logika counter + step + batas, dipakai berkali-kali
// ---------------------------------------------------------------
// Tanpa hook ini, setiap komponen counter harus menulis ulang
// setState updater, reset, batas minimal...
export function useCounter(nilaiAwal = 0, { step = 1, min = -Infinity } = {}) {
  const [count, setCount] = useState(nilaiAwal);

  return {
    count,
    naik: () => setCount((prev) => prev + step),
    turun: () => setCount((prev) => Math.max(min, prev - step)),
    reset: () => setCount(nilaiAwal),
  };
}

// ---------------------------------------------------------------
// useLocalStorage — state yang otomatis tersimpan di browser
// ---------------------------------------------------------------
// Membaca nilai saat awal (lazy initializer), menulis tiap berubah.
export function useLocalStorage(kunci, nilaiAwal) {
  // Fungsi ke useState = lazy init: hanya dijalankan sekali saat mount
  const [nilai, setNilai] = useState(() => {
    try {
      const tersimpan = localStorage.getItem(kunci);
      return tersimpan !== null ? JSON.parse(tersimpan) : nilaiAwal;
    } catch {
      return nilaiAwal;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(kunci, JSON.stringify(nilai));
    } catch {
      // penyimpanan penuh / privat mode — diamkan saja untuk demo
    }
  }, [kunci, nilai]);

  return [nilai, setNilai];
}

// ---------------------------------------------------------------
// useTitle — side effect super kecil yang sering ditulis manual
// ---------------------------------------------------------------
export function useTitle(teks) {
  useEffect(() => {
    const lama = document.title;
    document.title = teks;
    return () => {
      document.title = lama; // kembalikan saat unmount
    };
  }, [teks]);
}
