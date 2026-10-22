// =====================================================================
// MODUL 07 — useEffect
// useEffect = cara React melakukan "side effect": segala hal yang
// bukan menghitung UI — timer, fetch, subscribe, ubah document.title.
// Aturan utama: efek harus BERSIH — bersihkan apa yang kamu mulai!
// =====================================================================
import { useEffect, useState } from "react";

// ---------------------------------------------------------------
// 1. Anatomy useEffect
// ---------------------------------------------------------------
// useEffect(fungsiEfek, [dependensi])
//
// Kapan efek berjalan:
//   ()         → SETIAP render (jarang diinginkan!)
//   ([a, b])   → render pertama + saat a atau b berubah
//   ([])       → hanya sekali, saat komponen "mount" (muncul di layar)
//
// Cara membaca: "setelah render ini, JANGAN lupa lakukan efek ini
// bila nilai di daftar dependensi berubah."

function Jam() {
  const [waktu, setWaktu] = useState(new Date().toLocaleTimeString());

  // Efek mount: buat interval SEKALI. Cleanup (return) dijalankan
  // saat komponen hilang — interval dibersihkan, tidak bocor.
  useEffect(() => {
    console.log("[Jam] effect: interval dimulai");
    const id = setInterval(() => {
      setWaktu(new Date().toLocaleTimeString());
    }, 1000);

    // ⭐ CLEANUP FUNCTION — tanpa ini: interval menumpuk tiap mount!
    return () => {
      console.log("[Jam] cleanup: interval dibersihkan");
      clearInterval(id);
    };
  }, []); // array kosong = hanya saat mount/unmount

  return <p>🕐 {waktu}</p>;
}

// ---------------------------------------------------------------
// 2. Efek yang bergantung pada state — judul tab browser ikut
// ---------------------------------------------------------------
function JudulDinamis() {
  const [count, setCount] = useState(0);

  // Setiap count berubah, efek jalan lagi → tab browser berubah.
  // (Efek selalu jalan SETELAH render, jadi aman mengubah DOM.)
  useEffect(() => {
    document.title = `Klik: ${count} ×`;
  }, [count]);

  // Kalau dependency-nya state dari render ini, tidak akan meleset:
  // efek membaca nilai terbaru.
  return <button onClick={() => setCount(count + 1)}>Klik & lihat judul tab!</button>;
}

// ---------------------------------------------------------------
// 3. Dependency array — perhatikan kapan efek jalan
// ---------------------------------------------------------------
const renderLog = [];

function LogRender() {
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);

  useEffect(() => {
    renderLog.push("effect [a] jalan");
    console.log("effect [a] jalan, a =", a);
  }, [a]); // hanya saat a berubah

  useEffect(() => {
    renderLog.push("effect [b] jalan");
    console.log("effect [b] jalan, b =", b);
  }, [b]);

  useEffect(() => {
    console.log("effect [] jalan — sekali seumur hidup komponen");
  }, []);

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button onClick={() => setA(a + 1)}>a: {a} (hanya effect [a] yang ikut jalan)</button>
      <button onClick={() => setB(b + 1)}>b: {b}</button>
    </div>
  );
}

// ---------------------------------------------------------------
// 4. Jebakan #1: INFINITE LOOP — setState tanpa syarat di effect
// ---------------------------------------------------------------
// function LoopMaut() {
//   const [n, setN] = useState(0);
//   useEffect(() => {
//     setN(n + 1);       // ← effect → setState → rerender → effect → ...
//   });                   // ← TANPA dependency array!
//   return <p>{n}</p>;
// }
// Coba uncomment dan amati React langsung memblokir: "Too many re-renders".
// Pelajaran: JANGAN set state yang kamu baca sendiri sebagai dependency
// tanpa kondisi berhenti.

// ---------------------------------------------------------------
// 5. Jebakan #2: efek yang "ketinggalan" — cleanup untuk balapan
// ---------------------------------------------------------------
// Kasus umum: komponen unmount saat fetch belum selesai → setState
// ke komponen yang sudah hilang. Solusi: flag / AbortController.
function FetchBatal() {
  const [hasil, setHasil] = useState("");
  const [muat, setMuat] = useState(false);

  useEffect(() => {
    if (!muat) return;
    let batal = false;

    // Simulasi fetch lambat (500ms)
    const t = setTimeout(() => {
      if (!batal) setHasil("Data datang! Kalau tombol diklik lalu komponen unmount sebelum selesai, hasil tidak akan di-set (lihat console).");
      setMuat(false);
    }, 500);

    // Cleanup: kalau efek diulang/unmount sebelum selesai → batalkan
    return () => {
      batal = true;
      clearTimeout(t);
    };
  }, [muat]);

  return (
    <div>
      <button onClick={() => setMuat(true)} disabled={muat}>
        {muat ? "memuat..." : "Muatkan data (batal jika klik lagi cepat)"}
      </button>
      <p>{hasil}</p>
    </div>
  );
}

// ---------------------------------------------------------------
// 6. Kapan TIDAK perlu useEffect (paling penting!)
// ---------------------------------------------------------------
// ❌ Data diturunkan dari props/state → cukup hitung saat render:
//    const total = harga * jumlah;   ← BUKAN useEffect + setState
// ❌ Derive state dari state lain → hitung saja, jangan sinkronkan:
//    const listTersaring = items.filter(...)  ← bukan diset di effect
// ✅ useEffect untuk: sinkronisasi dengan DUNIA LUAR (timer, DOM API,
//    network, subscription) atau efek yang harus terjadi setelah render.

function TanpaUseEffect({ items = [1, 2, 3] }) {
  // Total dihitung, bukan disimpan. Tidak perlu effect sama sekali!
  const total = items.reduce((a, b) => a + b, 0);
  return <p>Total items (dihitung, bukan state): {total}</p>;
}

export default function App() {
  const [tampilkanJam, setTampilkanJam] = useState(true);

  return (
    <main>
      <h1>Modul 07 — useEffect</h1>
      <p>Buka DevTools Console — banyak log yang menunjukkan kapan efek/cleanup jalan.</p>
      <p style={{ background: "#fff3cd", borderRadius: 8, padding: "8px 12px" }}>
        ⚠ <strong>StrictMode</strong> (dipasang di <code>main.jsx</code>) membuat efek
        berjalan <em>dua kali</em> saat development: mount → cleanup → mount lagi. Ini
        sengaja, untuk memperlihatkan efek yang tidak bersih. Jadi jangan panik kalau
        log “[Jam] effect” muncul dua baris — di production hanya sekali.
      </p>

      <h2>1. Mount + cleanup (jam dengan interval)</h2>
      <button onClick={() => setTampilkanJam(!tampilkanJam)}>
        {tampilkanJam ? "Sembunyikan" : "Tampilkan"} jam
      </button>
      {tampilkanJam && <Jam />}
      <p style={{ color: "#777", fontSize: "0.9rem" }}>
        Sembunyikan jam → lihat log cleanup di console. Inilah makna "bersih".
      </p>

      <h2>2. Efek bergantung state (judul tab)</h2>
      <JudulDinamis />

      <h2>3. Dependency array: a vs b vs []</h2>
      <LogRender />

      <h2>4. (Dokumentasi) infinite loop — lihat kode di App.jsx</h2>

      <h2>5. Cleanup untuk membatalkan pekerjaan</h2>
      <FetchBatal />

      <h2>6. Derive data: TIDAK perlu effect</h2>
      <TanpaUseEffect />
    </main>
  );
}
