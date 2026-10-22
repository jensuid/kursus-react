// =====================================================================
// PELAJARAN 01 — let, const, Template Literals, Arrow Functions
// Jalankan: node 01-let-const-arrow.js
// =====================================================================

// ---------------------------------------------------------------
// 1. let dan const (pengganti var)
// ---------------------------------------------------------------
// Aturan praktis di React: HAMPIR SELALU pakai const.
// Gunakan let hanya kalau nilainya memang akan diganti nanti.
// var sudah ketinggalan zaman — jangan dipakai.

const appName = "React Belajar"; // konstan: tidak bisa diubah lagi
let visitCount = 0;              // mutable: bisa diubah

visitCount = visitCount + 1; // OK
// appName = "Lain";         // ERROR kalau uncomment: TypeError!

console.log("1. let & const");
console.log("   appName:", appName, "| visitCount:", visitCount);

// ---------------------------------------------------------------
// 2. Template Literals — menyisipkan nilai ke dalam string
// ---------------------------------------------------------------
// Pakai backtick (`) bukan quote biasa. Sintaks sisip: ${ekspresi}
// Bandingkan cara lama: "Halo " + name + ", umurmu " + age
const name = "Andi";
const age = 25;

const lama = "Halo " + name + ", umurmu " + age + " tahun";
const baru = `Halo ${name}, umurmu ${age} tahun`; // lebih bersih!

// Bisa juga berisi ekspresi, bukan cuma variabel:
const pesan = `${name} akan dewasa dalam ${100 - age} tahun.`;

console.log("\n2. Template Literals");
console.log("   ", lama);
console.log("   ", baru);
console.log("   ", pesan);

// ---------------------------------------------------------------
// 3. Arrow Functions — bentuk pendek fungsi
// ---------------------------------------------------------------
// Ini BENTUK PALING SERING kamu temui di React.
// Semua versi di bawah MELAKUKAN HAL SAMA:

function biasa(x) { return x * 2; }               // fungsi klasik
const expr = function (x) { return x * 2; };      // function expression
const arrow = (x) => { return x * 2; };           // arrow function
const arrowPendek = (x) => x * 2;                 // implicit return!

// Kalau cuma satu parameter, tanda kurung boleh dihilangkan:
const sapa = (nama) => `Halo ${nama}!`;
const duaKalinya = (x) => x * 2;

// Tanpa parameter:
const wakuSekarang = () => new Date().toLocaleTimeString();

console.log("\n3. Arrow Functions");
console.log("   arrowPendek(5) =", arrowPendek(5));
console.log("   sapa('Rina') =", sapa("Rina"));
console.log("   wakuSekarang() =", wakuSekarang());

// ---------------------------------------------------------------
// 4. PENTING: arrow function TIDAK punya `this` sendiri
// ---------------------------------------------------------------
// Di kelas klasik, `this` bisa bermasalah. Arrow function warisi
// `this` dari lingkungan tempat ia dibuat. Di React fungsi modern
// (hooks) kamu hampir tidak menyentuh `this`, jadi cukup tahu saja.

// ---------------------------------------------------------------
// 5. Kenapa ini penting untuk React?
// ---------------------------------------------------------------
// Di React kamu akan menulis hal-hal seperti ini:

// (a) komponen fungsi — ya, cuma arrow function biasa!
// Di React (nanti di modul 01), komponen akan terlihat seperti ini:
//   const Halo = () => <h1>Halo dunia!</h1>;
// Tanda <h1>...</h1> disebut JSX — "HTML di dalam JS" — dan hanya sah
// di file React (.jsx), tidak bisa dijalankan langsung dengan node.

// (b) handler event:
const handleClick = () => console.log("Tombol diklik!");

// (c) transform data untuk tampilan (sangat sering!):
const angka = [1, 2, 3, 4];
const doubled = angka.map((n) => n * 2);
console.log("\n5. Contoh rasa React:");
console.log("   doubled:", doubled);

// =====================================================================
// LATIHAN — coba kerjakan sendiri, lalu hapus komentar untuk mengecek
// =====================================================================

// L1. Buat const `city` = "Jakarta" dan let `temp` = 27.
//     Cetak: "Hari ini Jakarta bersuhu 27 derajat" pakai template literal.
// const city = "Jakarta";
// let temp = 27;
// console.log(`Hari ini ${city} bersuhu ${temp} derajat`);

// L2. Naikkan `temp` dengan temp = temp + 1, cetak lagi.
// temp = temp + 1;
// console.log(`Besok ${city} bersuhu ${temp} derajat`);

// L3. Buat arrow function `kuadrat` yang menerima x dan mengembalikan x*x.
//     Gunakan untuk mencetak kuadrat dari 7.
// const kuadrat = (x) => x * x;
// console.log(kuadrat(7));

// L4. Dengan array [10, 20, 30], buat array baru berisi nilainya / 10,
//     pakai .map() dan arrow function satu baris.
// const hasil = [10, 20, 30].map((n) => n / 10);
// console.log(hasil);
