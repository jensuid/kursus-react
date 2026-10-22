// =====================================================================
// PELAJARAN 06 — ES Modules (import / export)
// Jalankan: node 06-modules.js
// =====================================================================
// File ini mengimpor dari utils.js dan format.js — persis seperti
// kamu mengimpor komponen antar-file di project React nanti.
// (folder ini punya package.json dengan "type": "module", makanya
//  `import` bisa langsung jalan di Node)

// Default export ditulis PERTAMA (tanpa kurung), named lainnya dalam kurung:
import hitungLuas, { tambah, kurangi, PI, namaFolder } from "./utils.js";
import formatRupiah from "./format.js";

// ---------------------------------------------------------------
// 1. Named exports — diekspor dengan NAMA, diimpor dalam kurung
// ---------------------------------------------------------------
console.log("1. Named exports");
console.log("   tambah(10, 5) =", tambah(10, 5));
console.log("   kurangi(10, 5) =", kurangi(10, 5));
console.log("   PI =", PI);
console.log("   namaFolder =", namaFolder);

// Boleh diimpor dengan nama lain (alias):
import { tambah as plus } from "./utils.js";
console.log("   alias -> plus(2,2) =", plus(2, 2));

// ---------------------------------------------------------------
// 2. Default export — SATU per file, tidak pakai kurung
// ---------------------------------------------------------------
console.log("\n2. Default export");
console.log("   hitungLuas(3, 4) =", hitungLuas(3, 4));
console.log("   formatRupiah(150000) =", formatRupiah(150000));

// ---------------------------------------------------------------
// 3. Import * as — semua sekaligus dalam satu objek
// ---------------------------------------------------------------
import * as utils from "./utils.js";
console.log("\n3. Namespace import");
console.log("   utils.PI =", utils.PI);
console.log("   utils.tambah =", typeof utils.tambah);

// ---------------------------------------------------------------
// 4. Kenapa ini penting di React?
// ---------------------------------------------------------------
// Setiap komponen React adalah module yang di-export & di-impor:
//
//   // Tombol.jsx
//   export default function Tombol() { return <button>Klik</button>; }
//
//   // App.jsx
//   import Tombol from "./Tombol";   ← tanpa .jsx karena Vite yang urus
//
// Konvensi: komponen = default export (satu per file),
//           helper/hooks = boleh named export.

// =====================================================================
// LATIHAN
// =====================================================================
// L1. Buat file `kalkulator.js` di folder ini:
//       - named export: `kali` dan `bagi`
//       - default export: fungsi `pangkat`
//     Lalu impor dan pakai di file ini. (Buat file baru, jangan
//     edit file yang sudah ada — biasakan begitu di project React!)
