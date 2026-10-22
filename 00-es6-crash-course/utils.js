// utils.js — contoh file dengan named exports + default export

// NAMED EXPORTS: tiap deklarasi diawali `export`
export const PI = 3.14159;

export const namaFolder = "00-es6-crash-course";

export function tambah(a, b) {
  return a + b;
}

export function kurangi(a, b) {
  return a - b;
}

// DEFAULT EXPORT: satu per file, dipakai tanpa kurung saat impor.
// Konvensi React: satu komponen per file = default export.
export default function hitungLuasPersegiPanjang(a, b) {
  return a * b;
}
