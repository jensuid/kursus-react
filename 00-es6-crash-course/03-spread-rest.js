// =====================================================================
// PELAJARAN 03 — Spread (...) & Rest Parameters
// Jalankan: node 03-spread-rest.js
// =====================================================================
// Tanda yang sama `...` tapi dua peran berbeda:
//   SPREAD : "menyebar" isi → dipakai saat MEMBUAT nilai baru
//   REST   : "mengumpulkan" sisa → dipakai saat MENERIMA parameter

// ---------------------------------------------------------------
// 1. Spread pada array — menyalin & menggabungkan
// ---------------------------------------------------------------
const buahAsli = ["mangga", "jeruk"];
const salinan = [...buahAsli];        // array BARU, bukan referensi
salinan.push("anggur");
console.log("1. Spread array");
console.log("   asli  :", buahAsli);  // tetap 2 item — aman!
console.log("   salinan:", salinan);  // 3 item

// Menambah item di depan/sisip:
const menu = ["nasi", ...buahAsli, "es teh"];
console.log("   menu:", menu);

// Menggabungkan:
const extra = ["kerupuk", "sambal"];
const lengkap = [...menu, ...extra];
console.log("   lengkap:", lengkap);

// PENTING DI REACT: menyalin array sebelum diubah adalah
// cara update state array (lihat modul 03-events-state).

// ---------------------------------------------------------------
// 2. Spread pada objek — salin lalu timpa properti
// ---------------------------------------------------------------
const profil = { nama: "Dewi", umur: 28, kota: "Medan" };

// "Salin profil, tapi ubah kotanya jadi Jakarta":
const profilBaru = { ...profil, kota: "Jakarta" };
console.log("\n2. Spread objek");
console.log("   profil     :", profil);
console.log("   profilBaru :", profilBaru); // kota Jakarta, lainnya sama

// Urutan penting: yang terakhir ditulis menang.
const diubah = { kota: "Surabaya", ...profil };
console.log("   spread belakangan menang:", diubah.kota); // Medan!

// PENTING DI REACT: update satu field state objek:
// setUser({ ...user, kota: "Bandung" })

// ---------------------------------------------------------------
// 3. Rest parameters — kumpulkan sisa argumen jadi array
// ---------------------------------------------------------------
function total(...angka) {
  // `angka` selalu berupa array, berapa pun jumlah argumennya
  return angka.reduce((acc, n) => acc + n, 0);
}
console.log("\n3. Rest parameters");
console.log("   total(1,2) =", total(1, 2));
console.log("   total(1,2,3,4,5) =", total(1, 2, 3, 4, 5));

// Rest juga berlaku di destructuring: ambil beberapa, sisanya dikumpulkan
const [pertama, ...sisa] = [10, 20, 30, 40];
console.log("   pertama:", pertama, "| sisa:", sisa);

const { nama, ...propertiLain } = { nama: "Rian", umur: 22, hobi: "game" };
console.log("   nama:", nama, "| lainnya:", propertiLain);

// ---------------------------------------------------------------
// 4. Studi kasus: menghapus item dari array TANPA mengubah aslinya
// ---------------------------------------------------------------
// Pola ini akan kamu pakai terus-menerus di React (misal hapus todo):
const todos = [
  { id: 1, teks: "Belajar ES6" },
  { id: 2, teks: "Belajar React" },
  { id: 3, teks: "Bikin app" },
];

const yangMauDihapus = 2;
const todosBaru = todos.filter((t) => t.id !== yangMauDihapus);

console.log("\n4. Hapus item tanpa mutate");
console.log("   todos asli (tetap utuh):", todos.length, "item");
console.log("   todos baru:", todosBaru.map((t) => t.teks));

// =====================================================================
// LATIHAN
// =====================================================================
// L1. Diberi const arr = [3, 5, 7]. Buat array baru yang berisi
//     [1, ...arr, 9] — yaitu 1 di awal, isi arr, lalu 9.

// L2. Diberi const settings = { sound: true, volume: 50, theme: "dark" }.
//     Buat salinan dengan volume diubah jadi 80. Settings asli tidak berubah.

// L3. Buat fungsi `gabung(...parts)` yang menerima jumlah argumen bebas
//     dan mengembalikan parts.join(" "). Uji: gabung("belajar", "React", "seru")

// L4. Array `produk` di bawah — buat array baru berisi produk yang
//     harganya < 10000, menggunakan filter.
// const produk = [
//   { id: 1, harga: 5000 },
//   { id: 2, harga: 20000 },
//   { id: 3, harga: 8000 },
// ];
