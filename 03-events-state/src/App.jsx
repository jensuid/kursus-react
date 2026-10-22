// =====================================================================
// MODUL 03 — Events & State (jantungnya React!)
// Dua ide yang mengubah aplikasimu dari "statis" jadi "hidup":
//   1. Event    = reaksi terhadap aksi user (klik, ketik, dsb)
//   2. useState = data yang berubah seiring waktu → UI ikut berubah
// =====================================================================
import { useState } from "react";

// ---------------------------------------------------------------
// 1. EVENT HANDLER — fungsi yang dipanggil saat user beraksi
// ---------------------------------------------------------------
// Di JSX: onXxx (camelCase) dan beri REFERENSI fungsi, bukan hasil call!
//   onClick={sapa}   ← benar: panggil nanti saat diklik
//   onClick={sapa()}  ← salah: langsung panggil saat render!

function ContohEvent() {
  function handleClick(e) {
    // e = event object, sama seperti vanilla JS
    console.log("Diklik pada koordinat:", e.clientX, e.clientY);
  }
  return <button onClick={handleClick}>Klik saya (buka console!)</button>;
}

// ---------------------------------------------------------------
// 2. useState — cara React menyimpan data yang "hidup"
// ---------------------------------------------------------------
function Counter() {
  // useState(0) mengembalikan array [nilai, fungsiSet].
  // Kita bongkar dengan destructuring (ES6 02 — sudah pernah, kan?)
  const [count, setCount] = useState(0);

  // aturannya:
  //   count      → baca nilainya
  //   setCount() → ubah nilainya (selalu lewat fungsi ini!)
  //   setCount mencetuskan RERENDER: fungsi Counter dijalankan ulang
  //   dengan nilai count baru, dan UI ikut terbarui.

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <button onClick={() => setCount(count - 1)}>−</button>
      <strong style={{ fontSize: "1.5rem", minWidth: 40, textAlign: "center" }}>{count}</strong>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  );
}

// ---------------------------------------------------------------
// 3. KENAPA state tidak boleh diubah langsung
// ---------------------------------------------------------------
// const [n, setN] = useState(0);
// n = 5;          → ERROR: n itu const
// setN(n + 1);    → benar, tapi ada jebakan kalau dipanggil beruntun.
// Perhatikan contoh "salah" berikut untuk memahami mekanismenya:
function JebakanDirect() {
  const [angka, setAngka] = useState(0);

  function naikkanTiga() {
    // Ini TIDAK akan menaikkan 3 — coba tebak kenapa sebelum klik!
    // (Jawaban: tiga set di bawah memakai `angka` yang SAMA karena
    //  render belum terjadi; React hanya "melihat" +1.)
    setAngka(angka + 1);
    setAngka(angka + 1);
    setAngka(angka + 1);
  }

  return (
    <div>
      <p>angka: {angka}</p>
      <button onClick={naikkanTiga}>naikkanTiga() → coba, apa yang terjadi?</button>
    </div>
  );
}

// Solusinya: UPDATER FUNCTION. Kalau perubahan bergantung pada nilai
// sebelumnya, beri fungsi ke setState — React menjamin nilainya terbaru.
function Perbaikan() {
  const [angka, setAngka] = useState(0);
  function naikkanTiga() {
    setAngka((prev) => prev + 1);
    setAngka((prev) => prev + 1);
    setAngka((prev) => prev + 1); // sekarang benar-benar +3!
  }
  return (
    <div>
      <p>angka: {angka}</p>
      <button onClick={naikkanTiga}>naikkanTiga() yang benar</button>
    </div>
  );
}

// ---------------------------------------------------------------
// 4. STATE BISA APA SAJA — string, boolean, objek, array
// ---------------------------------------------------------------
function GantiWarna() {
  const warnaList = ["#e05656", "#f5a623", "#2fbf71", "#3f8cff", "#8e5bd6"];
  const [indeks, setIndeks] = useState(0);

  // Pola "siklus": sisa bagi membuat indeks berputar balik ke 0
  return (
    <div>
      <button
        onClick={() => setIndeks((indeks + 1) % warnaList.length)}
        style={{ background: warnaList[indeks], color: "#fff", border: "none" }}
      >
        Ganti warna ({warnaList[indeks]})
      </button>
    </div>
  );
}

// State objek: selalu ganti dengan OBJEK BARU (spread!), jangan mutate
function Profil() {
  const [user, setUser] = useState({ nama: "Anon", umur: 20 });

  // const user2 = user; user2.umur += 1; ← SALAH: mutasi objek yang sama
  function ultah() {
    setUser({ ...user, umur: user.umur + 1 }); // ← benar: objek baru
  }
  function gantiNama(e) {
    setUser({ ...user, nama: e.target.value }); // input event → ES6 terasa gunanya
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "start" }}>
      <p>
        {emoji(user.nama)} <strong>{user.nama}</strong>, {user.umur} tahun
      </p>
      <input value={user.nama} onChange={gantiNama} placeholder="nama..." />
      <button onClick={ultah}>Ultah 🎂</button>
    </div>
  );
}

function emoji(nama) {
  return nama.length > 0 ? "👤" : "🙂";
}

// State array: sama principle — array baru!
function Catatan() {
  const [catatan, setCatatan] = useState(["belajar ES6", "belajar React"]);
  const [teks, setTeks] = useState("");

  function tambah(e) {
    e.preventDefault();
    if (!teks.trim()) return;
    setCatatan([...catatan, teks.trim()]); // array baru via spread
    setTeks(""); // reset input
  }

  return (
    <div>
      <form onSubmit={tambah} style={{ display: "flex", gap: 8 }}>
        <input value={teks} onChange={(e) => setTeks(e.target.value)} placeholder="tulis catatan..." />
        <button type="submit">Tambah</button>
      </form>
      <ul>
        {catatan.map((c, i) => (
          <li key={i}>{c}</li>
        ))}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------
// 5. SEMUA BERSAMA-SAMA: "lampu"
// ---------------------------------------------------------------
// state boolean + conditional rendering (ternary) + event.
function Lampu() {
  const [menyala, setMenyala] = useState(false);
  return (
    <div>
      <div
        style={{
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: menyala ? "#ffd93d" : "#444",
          boxShadow: menyala ? "0 0 40px #ffd93d" : "none",
          transition: "all 0.3s",
          margin: "8px 0",
        }}
      />
      {/* Ternary: teks berubah sesuai state */}
      <button onClick={() => setMenyala(!menyala)}>
        {menyala ? "Matikan" : "Nyalakan"}
      </button>
    </div>
  );
}

// =====================================================================
// Notice: setiap setXxx di atas akan menyebabkan RERENDER.
// Untuk membuktinya, uncomment baris di bawah dan perhatikan console:
// console.log("render Counter!"); // di dalam Counter()
// =====================================================================

export default function App() {
  return (
    <main>
      <h1>Modul 03 — Events & State</h1>

      <h2>1. Event handling</h2>
      <ContohEvent />

      <h2>2. useState — counter klasik</h2>
      <Counter />

      <h2>3. Jebakan setState beruntun</h2>
      <p style={{ color: "#666" }}>Klik keduanya, bandingkan hasilnya:</p>
      <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
        <JebakanDirect />
        <Perbaikan />
      </div>

      <h2>4. State objek & array</h2>
      <GantiWarna />
      <div style={{ height: 12 }} />
      <Profil />
      <div style={{ height: 12 }} />
      <Catatan />

      <h2>5. Semuanya bersama: lampu</h2>
      <Lampu />
    </main>
  );
}
