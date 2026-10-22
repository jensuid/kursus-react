// =====================================================================
// PELAJARAN 05 — Optional Chaining (?.) & Nullish Coalescing (??)
// Jalankan: node 05-optional-chaining-nullish.js
// =====================================================================
// Keduanya menyelamatkanmu dari error "Cannot read properties of
// undefined" — bugs paling klasik saat data belum datang (misal
// hasil fetch API di modul 09).

// ---------------------------------------------------------------
// 1. Masalah klasik
// ---------------------------------------------------------------
const pengguna = {
  nama: "Fitri",
  alamat: { kota: "Semarang" },
  // telepon TIDAK ada
};

// Cara lama yang bertele-tele:
const kotaLama = pengguna.alamat && pengguna.alamat.kota ? pengguna.alamat.kota : "-";

// Cara modern dengan ?. — kalau di tengah path ada null/undefined,
// hasilnya langsung undefined, tidak error:
const kota = pengguna?.alamat?.kota ?? "-";
console.log("1. Optional chaining");
console.log("   kota:", kota);

// Aman walau `pengguna` sendiri undefined:
const x = undefined;
console.log("   x?.nama:", x?.nama); // undefined, BUKAN error!

// Berlaku juga untuk pemanggilan method:
const sapa = pengguna.sapa?.(); // undefined (method tidak ada, tidak error)
console.log("   panggil method yang tidak ada:", sapa);

// ---------------------------------------------------------------
// 2. Nullish Coalescing (??) — default hanya untuk null/undefined
// ---------------------------------------------------------------
// Bandingkan dengan || (OR lama):

console.log("\n2. ?? vs ||");
console.log("   0 || 100      →", 0 || 100);    // 100 (!!) 0 dianggap "false"
console.log("   0 ?? 100      →", 0 ?? 100);    // 0   ← 0 nilai sah!
console.log("   '' || 'kosong'→", "" || "kosong");   // 'kosong'
console.log("   '' ?? 'kosong'→", "" ?? "kosong");   // ''  ← string kosong sah
console.log("   undefined ?? 5→", undefined ?? 5);   // 5

// Kapan pakai yang mana?
// - ?: untuk akses properti yang MUNGKIN TIDAK ADA
// - ??: memberi nilai default yang HANYA terpicu oleh null/undefined
//   (penting kalau 0, "", false adalah nilai yang sah!)

// ---------------------------------------------------------------
// 3. Contoh realistis di React
// ---------------------------------------------------------------
// Data dari API bisa belum lengkap. Pola tahan-banting:
const post = {
  userId: 1,
  title: "Judul artikel",
  // body belum dikirim server
  author: { name: "Admin" },
};

const excerpt = post?.body ?? "(tidak ada isi)";
const penulis = post?.author?.name ?? "Anonim";
const jumlahLike = post?.stats?.likes ?? 0; // angka 0 sah → pakai ??

console.log("\n3. Rasa React:");
console.log("   excerpt:", excerpt);
console.log("   penulis:", penulis);
console.log("   likes:", jumlahLike);

// ??= dan ||= — assign default hanya kalau perlu:
let config = { retries: undefined };
config.retries ??= 3;
console.log("   config.retries setelah ??=:", config.retries);

// =====================================================================
// LATIHAN
// =====================================================================
const data = { user: { name: "Joko", prefs: null } };

// L1. Ambil theme dari data.user.prefs.theme dengan aman,
//     default "light". (Coba tanpa ?. dulu, rasanya error!)

// L2. Ambil data.user.name, default "Tamu" pakai ?? — apa hasilnya?

// L3. Jika ditulis `data.user.age ?? 18`, berapa hasilnya? Kenapa?
//     Lalu apa bedanya dengan `data.user.age || 18` kalau age = 0?
