// ThemeContext.js — Context untuk tema, disimpan terpisah dari App
// (konvensi: satu context = satu file khusus)
import { createContext, useContext } from "react";

// 1. Buat context. Nilai awalnya objek dengan BENTUK yang konsisten
//    dengan apa yang nanti kita provide.
export const ThemeContext = createContext(null);

// 2. Custom hook kecil agar komponen anak gampang mengambil context
//    (pola yang sangat lazim di project React nyata)
export function useTema() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTema harus dipakai di dalam <ThemeContext.Provider>");
  return ctx;
}
