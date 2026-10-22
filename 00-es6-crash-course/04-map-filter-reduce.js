// =====================================================================
// PELAJARAN 04 — map, filter, reduce (THE BIG THREE untuk React)
// Jalankan: node 04-map-filter-reduce.js
// =====================================================================
// Ketiganya adalah method array yang TIDAK mengubah array asli
// (non-mutating) dan mengembalikan HASIL baru. Di React:
//   .map()   → mengubah data jadi elemen tampilan (list jsx!)
//   .filter() → menyaring data (pencarian, tab filter)
//   .reduce() → menghitung ringkasan (total, statistik)

// Data contoh yang akan kita olah:
const produk = [
  { id: 1, nama: "Keyboard", harga: 450000, kategori: "elektronik", stok: 3 },
  { id: 2, nama: "Mouse", harga: 150000, kategori: "elektronik", stok: 10 },
  { id: 3, nama: "Notebook", harga: 15000, kategori: "atk", stok: 0 },
  { id: 4, nama: "Tas", harga: 200000, kategori: "aksesori", stok: 2 },
  { id: 5, nama: "Monitor", harga: 2000000, kategori: "elektronik", stok: 1 },
];

// ---------------------------------------------------------------
// 1. map — "ubah setiap elemen jadi bentuk baru"
// ---------------------------------------------------------------
// Proses 1-ke-1: jumlah item hasil SELALU sama dengan input.
const namaProduk = produk.map((p) => p.nama);
console.log("1. map");
console.log("   semua nama:", namaProduk);

// Ubah jadi objek baru:
const label = produk.map((p) => ({
  value: p.id,
  text: `${p.nama} — Rp${p.harga.toLocaleString("id-ID")}`,
}));
console.log("   label dropdown:", label[0]);

// Di React, .map() adalah SATU-SATUNYA cara merender list:
// {produk.map((p) => <li key={p.id}>{p.nama}</li>)}

// ---------------------------------------------------------------
// 2. filter — "ambil yang memenuhi syarat saja"
// ---------------------------------------------------------------
// Fungsinya mengembalikan true/false. true = disimpan.
const elektronik = produk.filter((p) => p.kategori === "elektronik");
console.log("\n2. filter");
console.log("   elektronik:", elektronik.map((p) => p.nama));

const tersedia = produk.filter((p) => p.stok > 0);
console.log("   masih ada stok:", tersedia.map((p) => p.nama));

// Kombinasi map + filter (sangat sering!):
// "Tampilkan nama produk elektronik yang mahal (> 100rb), huruf besar"
const report = produk
  .filter((p) => p.kategori === "elektronik" && p.harga > 100000)
  .map((p) => p.nama.toUpperCase());
console.log("   elektronik mahal:", report);

// Di React: ini persis cara kerja fitur pencarian dan tab filter.

// ---------------------------------------------------------------
// 3. reduce — "ringkas array menjadi SATU nilai"
// ---------------------------------------------------------------
// Parameter fungsi: (akumulator, elemenSekarang) dan nilai awal.
const totalNilaiStok = produk.reduce((acc, p) => acc + p.harga * p.stok, 0);
console.log("\n3. reduce");
console.log("   nilai seluruh stok:", `Rp${totalNilaiStok.toLocaleString("id-ID")}`);

// Rata-rata harga:
const rataRata = produk.reduce((acc, p) => acc + p.harga, 0) / produk.length;
console.log("   rata-rata harga:", `Rp${Math.round(rataRata).toLocaleString("id-ID")}`);

// reduce bisa juga menghasilkan objek — kelompokkan per kategori:
const perKategori = produk.reduce((acc, p) => {
  acc[p.kategori] = (acc[p.kategori] || 0) + 1;
  return acc;
}, {});
console.log("   jumlah per kategori:", perKategori);

// Di React: hitung statistik, group data, dsb.

// ---------------------------------------------------------------
// 4. Method pendukung lain yang sering muncul di codebase React
// ---------------------------------------------------------------
const adaYangHabis = produk.some((p) => p.stok === 0);   // ada yang benar?
const semuaMurah = produk.every((p) => p.harga < 3000000); // semua benar?
const cariMonitor = produk.find((p) => p.nama === "Monitor"); // elemen pertama
const idxTas = produk.findIndex((p) => p.nama === "Tas");    // indeks pertama

console.log("\n4. Method pendukung");
console.log("   some (ada yang habis?):", adaYangHabis);
console.log("   every (semua < 3jt?):", semuaMurah);
console.log("   find Monitor:", cariMonitor?.nama);
console.log("   findIndex Tas:", idxTas);

// Chain lengkap — pola "dapatkan & format data" yang biasa di API:
const ringkasan = produk
  .filter((p) => p.stok > 0)
  .sort((a, b) => b.harga - a.harga)
  .slice(0, 3)
  .map((p) => `${p.nama} (Rp${p.harga.toLocaleString("id-ID")})`);
console.log("   top 3 termahal yang tersedia:", ringkasan);

// =====================================================================
// LATIHAN
// =====================================================================
const anggota = [
  { id: 1, nama: "Amin", umur: 17, skor: 85 },
  { id: 2, nama: "Bella", umur: 22, skor: 92 },
  { id: 3, nama: "Candra", umur: 15, skor: 78 },
  { id: 4, nama: "Dila", umur: 19, skor: 88 },
];

// L1. Buat array berisi HANYA nama anggota yang umur >= 18.
//     (petunjuk: filter lalu map — urutan terserah, hasilnya sama)

// L2. Hitung rata-rata skor semua anggota dengan reduce.

// L3. Cek: apakah ADA anggota di bawah umur (some)?

// L4. Buat array objek { id, label } dengan label = "Nama: 92/100".
//     Contoh: { id: 2, label: "Bella: 92/100" }
