// =====================================================================
// PELAJARAN 07 — Promises & async/await
// Jalankan: node 07-promise-async.js
// =====================================================================
// Semua pengambilan data di React (fetch API, kirim form) bersifat
// ASINKRON: hasilnya tidak langsung ada. Konsep ini WAJIB dipahami
// sebelum masuk modul 09-api-data.

// ---------------------------------------------------------------
// 1. Bayangkan masalahnya: fungsi yang hasilnya "nanti"
// ---------------------------------------------------------------
// Fungsi ini meniru panggilan ke server yang butuh 1 detik:
function ambilDataUserLama() {
  return "SEDANG MEMPROSES..."; // jelas salah — hasil belum ada!
}

// ---------------------------------------------------------------
// 2. Promise — "janji" akan menghasilkan nilai di masa depan
// ---------------------------------------------------------------
// Promise punya 3 status: pending (belum selesai), fulfilled (sukses),
// rejected (gagal). Dibuat baru dengan `new Promise`, diselesaikan
// dengan resolve()/reject().
function ambilDataUser(id) {
  return new Promise((resolve, reject) => {
    // Simulasi kerja asinkron (network, database) selama 300ms:
    setTimeout(() => {
      if (id > 0) {
        resolve({ id, nama: `User-${id}`, role: "member" }); // SUKSES
      } else {
        reject(new Error("id tidak valid"));                  // GAGAL
      }
    }, 300);
  });
}

// Cara lama: .then() / .catch() (callback chain)
console.log("2. Promise dengan .then()");
ambilDataUser(7)
  .then((user) => {
    console.log("   sukses:", user.nama);
    return user.role; // nilai yang dikembalikan jadi input .then berikutnya
  })
  .then((role) => console.log("   role:", role))
  .catch((err) => console.log("   error:", err.message));

// ---------------------------------------------------------------
// 3. async/await — tulis kode async seperti kode sinkron
// ---------------------------------------------------------------
// `await` hanya boleh di dalam fungsi bertanda `async`.
// Ini gaya yang dipakai di React modern karena lebih mudah dibaca.
async function contohAsyncAwait() {
  console.log("\n3. async/await");
  try {
    const user = await ambilDataUser(42); // "tunggu" sampai janji selesai
    console.log("   dapat user:", user.nama, `(${user.role})`);

    const user2 = await ambilDataUser(43); // berurutan
    console.log("   dapat user lagi:", user2.nama);
  } catch (err) {
    console.log("   tertangkap error:", err.message);
  }

  // Paralel! Kalau beberapa fetch TIDAK saling bergantung,
  // jangan await satu-satu — jalankan bersamaan dengan Promise.all:
  const mulai = Date.now();
  const [a, b] = await Promise.all([ambilDataUser(1), ambilDataUser(2)]);
  console.log(`   Promise.all -> ${a.nama}, ${b.nama} dalam ${Date.now() - mulai}ms`);
  // Berurutan akan makan ±600ms; paralel hanya ±300ms.

  // Fungsi async SENDIRI mengembalikan Promise:
  const hasil = await contohNilai();
  console.log("   async function mengembalikan Promise:", hasil);
}

async function contohNilai() {
  return "lihat — return biasa otomatis jadi Promise";
}

// reject demo:
async function demoGagal() {
  try {
    await ambilDataUser(-1);
  } catch (err) {
    console.log("   catch bekerja untuk reject:", err.message);
  }
}

// Jalankan (node menunggu microtask selesai sendiri):
contohAsyncAwait();
demoGagal();

// ---------------------------------------------------------------
// 4. Rasa React — nanti di modul 09 kamu akan menulis:
// ---------------------------------------------------------------
// async function ambilPosts() {
//   const respons = await fetch("https://jsonplaceholder.typicode.com/posts");
//   if (!respons.ok) throw new Error("HTTP " + respons.status);
//   const data = await respons.json();
//   return data;
// }
// `fetch` = built-in browser untuk memanggil API. Ia mengembalikan
// Promise, jadi perlu await / .then.

// =====================================================================
// LATIHAN
// =====================================================================
// L1. Buat async function `ambilDua()` yang await ambilDataUser(100)
//     dan ambilDataUser(200) secara PARALEL dengan Promise.all,
//     lalu cetak kedua nama.

// L2. Apa yang terjadi kalau kamu menulis await di top-level file
//     ini (di luar async function)? Coba — di Node modern sebenarnya
//     boleh (top-level await), catat hasilnya.
