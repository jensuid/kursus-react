// Setup Vitest — dijalankan sebelum tiap berkas uji, TERMASUK berkas yang
// memakai `// @vitest-environment node` (uji struktur di disk). Di lingkungan
// Node tidak ada DOM maupun localStorage, jadi bagian di bawah harus dicek
// dulu sebelum dipakai -- kalau tidak, setiap uji di berkas node gagal dengan
// "ReferenceError: localStorage is not defined".
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

const adaDom = typeof window !== "undefined";

afterEach(() => {
  if (!adaDom) return;
  // Bongkar DOM supaya uji berikutnya tidak melihat sisa render sebelumnya.
  cleanup();
  // Modul 10 menyimpan todo di localStorage lewat useLocalStorage. Tanpa
  // dibersihkan, uji ke-2 mewarisi isi uji ke-1 dan gagal acak (flaky) --
  // tergantung urutan berkas, bukan pada kode yang diuji.
  localStorage.clear();
});
