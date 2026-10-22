// useLocalStorage.js — dari Modul 08. State yang otomatis tersimpan.
import { useEffect, useState } from "react";

export function useLocalStorage(kunci, nilaiAwal) {
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
      /* abaikan (mode privat / kuota penuh) */
    }
  }, [kunci, nilai]);

  return [nilai, setNilai];
}
