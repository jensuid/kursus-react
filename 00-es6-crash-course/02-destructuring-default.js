// =====================================================================
// PELAJARAN 02 — Destructuring & Default Parameters
// Jalankan: node 02-destructuring-default.js
// =====================================================================
// Destructuring = "membongkar" objek/array menjadi variabel terpisah.
// Di React, ini ADA DI MANA-MANA: props komponen, hasil useState,
// hasil useContext — semuanya dibongkar dengan destructuring.

// ---------------------------------------------------------------
// 1. Destructuring Objek
// ---------------------------------------------------------------
const user = { nama: "Budi", umur: 30, kota: "Bandung", admin: false };

// Cara lama:
const namaLama = user.nama;
const umurLama = user.umur;

// Cara destructuring (bisa banyak sekaligus!):
const { nama, umur, kota, admin } = user;

console.log("1. Destructuring objek");
console.log("   ", nama, umur, kota, admin); // Budi 30 Bandung false

// Ambil sebagian saja, dan ganti nama variabel:
const { nama: namaPanjang, kota: domisili } = user;
console.log("   renamed ->", namaPanjang, "di", domisili);

// ---------------------------------------------------------------
// 2. Destructuring di fungsi (inilah gaya props React!)
// ---------------------------------------------------------------
// Parameter dengan tanda kurung = otomatis membongkar objek argumen.
function Profil({ nama, umur, kota }) {
  return `${nama}, ${umur} tahun, tinggal di ${kota}`;
}

// Pemanggilnya cukup lempar objek:
console.log("\n2. Destructuring parameter");
console.log("  ", Profil({ nama: "Sari", umur: 27, kota: "Surabaya", hobi: "coding" }));
// Perhatikan: `hobi` dikirim tapi tidak diambil — tidak masalah.

// Di React nanti ini akan terlihat sangat familiar:
// function Profil({ nama, umur }) {
//   return <div>{nama} berumur {umur}</div>;
// }

// ---------------------------------------------------------------
// 3. Default Parameters
// ---------------------------------------------------------------
// Nilai cadangan kalau tidak diisi / nilainya undefined:
function Daftar({ judul = "Daftar Tanpa Judul", items = [], tampilEmpty = true }) {
  const jumlah = items.length;
  if (jumlah === 0 && !tampilEmpty) return null; // komponen boleh return null!
  return `${judul} (${jumlah} item)`;
}

console.log("\n3. Default parameters");
console.log("  ", Daftar({ judul: "Todo Hari Ini", items: ["belajar", "praktik"] }));
console.log("  ", Daftar({}));            // semua pakai default
console.log("  ", Daftar({ items: [] })); // judul otomatis

// ---------------------------------------------------------------
// 4. Destructuring Array — ini cara useState bekerja!
// ---------------------------------------------------------------
const pasangan = ["merah", 5];
const [warna, hitungan] = pasangan;
console.log("\n4. Destructuring array");
console.log("   warna:", warna, "| hitungan:", hitungan);

// Skip elemen tengah dengan koma:
const [, kedua] = ["a", "b", "c"];
console.log("   skip pertama ->", kedua);

// Tukar nilai dua variabel dalam satu baris (trik keren):
let x = 1;
let y = 2;
[x, y] = [y, x];
console.log("   tukar x,y ->", x, y);

// Di React, useState SELALU destructuring array dua elemen:
// const [count, setCount] = useState(0);
//   -> elemen pertama = nilainya, elemen kedua = fungsi pengubahnya.

// ---------------------------------------------------------------
// 5. Rest / Spread pada objek — salin + ubah sekaligus
// ---------------------------------------------------------------
const base = { theme: "dark", fontSize: 14, lang: "id" };
const override = { fontSize: 18 };

// {...} menyebar isi objek ke objek baru (bukan referensi!)
const gabungan = { ...base, ...override };
console.log("\n5. Spread objek");
console.log("   base:", base);
console.log("   gabungan:", gabungan); // fontSize jadi 18, yang lain tetap

// Ini pola update state objek di React (ingatkan! state tidak boleh
// diubah langsung, selalu buat salinan baru — modul 03 menjelaskan).

// =====================================================================
// LATIHAN
// =====================================================================
// L1. Destructure produk di bawah menjadi `nama`, `harga`, dan
//     ` stok` yang diganti namanya jadi `sisa`:
// const produk = { nama: "Keyboard", harga: 450000, stok: 3 };
// const { nama, harga, stok: sisa } = produk;

// L2. Buat fungsi `banner({ judul, subjudul = "..." })` yang
//     mengembalikan `${judul} — ${subjudul}`. default subjudul: "Selamat datang".

// L3. Dengan array [100, 200, 300], ambil hanya elemen KEDUA dan KETIGA
//     lewat destructuring array (skip yang pertama).

// L4. Salin objek `config` lalu ubah `debug` jadi true TANPA mengubah
//     config asli: const config = { debug: false, retries: 2 };
