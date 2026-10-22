// =====================================================================
// PELAJARAN 08 — Misc: Ternary, Gerbang Render, Penutup
// Jalankan: node 08-misc.js
// =====================================================================
// Material terakhir: operator kondisional yang menjadi "tulang"
// logika tampilan di React (conditional rendering).

// ---------------------------------------------------------------
// 1. Ternary operator — if/else dalam satu ekspresi
// ---------------------------------------------------------------
const umur = 17;

// if/else biasa (statement — tidak mengembalikan nilai):
let status;
if (umur >= 17) {
  status = "boleh ikut";
} else {
  status = "belum boleh";
}

// Ternary (EKSPRESI — menghasilkan nilai, bisa langsung dipakai):
const status2 = umur >= 17 ? "boleh ikut" : "belum boleh";

console.log("1. Ternary");
console.log("   status:", status, "| status2:", status2);

// Di React, ternary adalah cara standar menampilkan UI kondisional:
//   {isLogin ? <Dashboard /> : <HalamanLogin />}
//   <span>{items.length > 0 ? `${items.length} item` : "Kosong"}</span>

// ---------------------------------------------------------------
// 2. Short-circuit && — "kalau benar, render ini"
// ---------------------------------------------------------------
const adaError = true;
const pesanError = adaError ? "Password salah!" : null;

// && berhenti di nilai pertama yang falsy:
console.log("\n2. Short-circuit &&");
console.log("   true && 'ya':", true && "ya");
console.log("   false && 'ya':", false && "ya");

// Di React: {isProcessing && <Spinner />}
// HATI-HATI jebakan klasik: {count && <List />} akan merender "0"
// kalau count = 0! Gunakan {count > 0 && <List />}.

// ---------------------------------------------------------------
// 3. Ekspresi vs Statement — konsep di balik aturan JSX
// ---------------------------------------------------------------
// Ekspresi  = menghasilkan nilai → boleh di dalam { } JSX
//   a + b, x ? y : z, arr.map(...), val ?? 0
// Statement = perintah → TIDAK boleh di dalam { } JSX
//   if (...) {...}, for (...) {...}, const x = ...
// Makanya di JSX pakai ternary/& & bukan if, dan .map() bukan for.

// ---------------------------------------------------------------
// 4. Penutup: peta ES6 → React
// ---------------------------------------------------------------
const peta = [
  ["Arrow function", "definisi komponen, event handler, callback .map()"],
  ["const/let", "semua deklarasi; variabel props & state"],
  ["Template literal", "teks dinamis di JSX: `${first} ${last}`"],
  ["Destructuring", "props komponen, useState, useContext"],
  ["Spread/Rest", "update state objek/array tanpa mutasi"],
  ["map", "render daftar item jadi elemen JSX"],
  ["filter", "fitur pencarian & tab filter"],
  ["reduce", "hitung statistik/total"],
  ["?. dan ??", "akses data API yang mungkin belum lengkap"],
  ["import/export", "memecah komponen ke banyak file"],
  ["Promise/async-await", "useEffect + fetch data di modul 09"],
  ["Ternary/&&", "conditional rendering"],
];

console.log("\n3. Peta ES6 → React:");
peta.forEach(([topik, kegunaan]) => console.log(`   ${topik.padEnd(18)} → ${kegunaan}`));

// Selamat — fondasi JavaScript-mu sudah cukup!
// Lanjut ke Modul 01: Hello Component. React time! 🚀

// =====================================================================
// LATIHAN
// =====================================================================
// L1. Ubah jadi ternary satu baris:
//     let emoji; if (suhu > 30) { emoji = "🥵"; } else { emoji = "🙂"; }
//     dengan const suhu = 32.

// L2. Diberi const items = []. Tulis ekspresi yang menghasilkan
//     "Tidak ada item" kalau items kosong, tanpa if — pakai ||.

// L3. Prediksi lalu uji: apa hasil ekspresi ini?
//     const n = 0; console.log(n || "nol!");     → ?
//     const m = 5; console.log(m && "lima!");    → ?
