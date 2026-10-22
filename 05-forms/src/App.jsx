// =====================================================================
// MODUL 05 — Forms: Controlled Components
// Di React, input tidak "menyimpan nilainya sendiri" — KITALAH yang
// menyimpannya di state, lalu menyambungkannya bolak-balik.
// =====================================================================
import { useState } from "react";

// ---------------------------------------------------------------
// 1. POLA controlled component (hafalkan bentuknya!)
// ---------------------------------------------------------------
// value={state}        → tampilan input mengikuti state
// onChange={set...}    → ketikan user updating state
// Hasilnya: state = satu-satunya sumber kebenaran ("single source of truth")
function InputTerkontrol() {
  const [nama, setNama] = useState("");

  return (
    <div>
      <input
        value={nama}
        onChange={(e) => setNama(e.target.value)} // e.target.value = ketikan terbaru
        placeholder="ketik sesuatu..."
      />
      {/* Nilai bisa langsung dipakai untuk hal lain: live preview! */}
      <p style={{ marginTop: 8 }}>
        Kamu mengetik: <strong>{nama || "(kosong)"}</strong> · {nama.length} karakter
      </p>
      {/* Bandingkan dengan input biasa (uncontrolled): */}
      <input placeholder="input BIASA (uncontrolled) — nilainya tidak kita pegang" />
    </div>
  );
}

// ---------------------------------------------------------------
// 2. FORM multi-field — satu objek state untuk semua
// ---------------------------------------------------------------
// Dengan `name` pada input + spread, SATU handler menangani semua field.
const formAwal = { nama: "", email: "", kategori: "umum", setuju: false };

function FormDaftar() {
  const [form, setForm] = useState(formAwal);
  const [terkirim, setTerlirim] = useState(false);

  // Handler serbaguna: pakai nama field sebagai kunci objek
  function ubah(e) {
    const { name, value, type, checked } = e.target; // destructuring — ES6 02!
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value, // computed key!
    }));
  }

  function kirim(e) {
    e.preventDefault(); // CEGAH reload browser — wajib di React!
    setTerlirim(true);
    console.log("Data terkirim:", form);
  }

  if (terkirim) {
    return (
      <div className="sukses">
        ✅ Terima kasih, {form.nama}! Konfirmasi dikirim ke {form.email}.
        <div>
          <button onClick={() => { setTerlirim(false); setForm(formAwal); }}>
            Isi lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={kirim} style={{ display: "grid", gap: 10, maxWidth: 380 }}>
      <label>
        Nama<br />
        <input name="nama" value={form.nama} onChange={ubah} required style={{ width: "100%" }} />
      </label>

      <label>
        Email<br />
        <input name="email" type="email" value={form.email} onChange={ubah} required style={{ width: "100%" }} />
      </label>

      <label>
        Kategori<br />
        {/* select juga controlled — value mengikuti state */}
        <select name="kategori" value={form.kategori} onChange={ubah}>
          <option value="umum">Umum</option>
          <option value="kerja">Pekerjaan</option>
          <option value="hobi">Hobi</option>
        </select>
      </label>

      <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input name="setuju" type="checkbox" checked={form.setuju} onChange={ubah} />
        Saya setuju dengan syarat
      </label>

      <button type="submit" disabled={!form.setuju || !form.nama}>
        Kirim
      </button>
    </form>
  );
}

// ---------------------------------------------------------------
// 3. Validasi sederhana (state-based, error muncul saat submit)
// ---------------------------------------------------------------
function FormCariPassword() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function cek(e) {
    e.preventDefault();
    // Aturan: minimal 8 karakter, ada angka
    if (password.length < 8) {
      setError("Minimal 8 karakter.");
      return;
    }
    if (!/\d/.test(password)) {
      setError("Harus mengandung angka.");
      return;
    }
    setError("");
    alert("Password diterima! (demo)");
  }

  return (
    <form onSubmit={cek} style={{ display: "grid", gap: 8, maxWidth: 320 }}>
      <input
        type="password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          setError(""); // error hilang saat user mengetik lagi — UX lebih baik
        }}
        placeholder="password"
      />
      {error && <p style={{ color: "#e05656", margin: 0 }}>⚠ {error}</p>}
      <button type="submit">Daftar</button>
    </form>
  );
}

// ---------------------------------------------------------------
// 4. Latihan penggabungan: to-do mini dengan form
// ---------------------------------------------------------------
// (Versi lengkap ada di Modul 10 — ini versi satu file dulu)
function TodoMini() {
  const [todos, setTodos] = useState([]);
  const [teks, setTeks] = useState("");

  function tambah(e) {
    e.preventDefault();
    if (!teks.trim()) return;
    setTodos([{ id: Date.now(), teks: teks.trim(), selesai: false }, ...todos]);
    setTeks("");
  }

  return (
    <div>
      <form onSubmit={tambah} style={{ display: "flex", gap: 8 }}>
        <input value={teks} onChange={(e) => setTeks(e.target.value)} placeholder="apa yang perlu dikerjakan?" style={{ flex: 1 }} />
        <button type="submit">+</button>
      </form>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {todos.map((t) => (
          <li key={t.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={t.selesai}
              onChange={() =>
                setTodos(todos.map((x) => (x.id === t.id ? { ...x, selesai: !x.selesai } : x)))
              }
            />
            <span style={{ textDecoration: t.selesai ? "line-through" : "none", color: t.selesai ? "#999" : "inherit" }}>
              {t.teks}
            </span>
            <button onClick={() => setTodos(todos.filter((x) => x.id !== t.id))} style={{ marginLeft: "auto" }}>✕</button>
          </li>
        ))}
      </ul>
      {todos.length === 0 && <p style={{ color: "#888" }}>Belum ada tugas.</p>}
    </div>
  );
}

export default function App() {
  return (
    <main>
      <h1>Modul 05 — Forms (Controlled Components)</h1>

      <h2>1. value + onChange = kendali penuh</h2>
      <InputTerkontrol />

      <h2>2. Form multi-field dengan satu handler</h2>
      <FormDaftar />

      <h2>3. Validasi sederhana</h2>
      <FormCariPassword />

      <h2>4. Gabungan: Todo mini</h2>
      <TodoMini />
    </main>
  );
}
