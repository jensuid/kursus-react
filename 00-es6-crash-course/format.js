// format.js — contoh file dengan default export saja

// Format angka jadi Rupiah: Rp150.000
export default function formatRupiah(angka) {
  return "Rp" + angka.toLocaleString("id-ID");
}
