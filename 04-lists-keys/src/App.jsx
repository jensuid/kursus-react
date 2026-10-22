// =====================================================================
// MODUL 04 — Lists & Keys
// Merender daftar data dengan .map(), dan memahami peran `key`.
// =====================================================================
import { useState } from "react";

// Data contoh: daftar kontak dengan ID unik (pola data dari API dunia nyata)
const kontakAwal = [
  { id: 1, nama: "Adit", kota: "Bandung", online: true },
  { id: 2, nama: "Bela", kota: "Jakarta", online: false },
  { id: 3, nama: "Cokie", kota: "Surabaya", online: true },
];

// ---------------------------------------------------------------
// 1. .map() mengubah data → daftar elemen JSX
// ---------------------------------------------------------------
// Tidak ada "loop khusus React" — cukup JavaScript:
function DaftarSederhana() {
  const namaTim = ["Adit", "Bela", "Cokie", "Dila"];
  return (
    <ul>
      {namaTim.map((nama, indeks) => (
        // `key` = identitas unik tiap item. Untuk array statis seperti
        // ini, indeks boleh — tapi lihat bagian 3 untuk kasus dinamis.
        <li key={indeks}>{nama}</li>
      ))}
    </ul>
  );
}

// ---------------------------------------------------------------
// 2. Item list jadi komponen sendiri (pola yang benar!)
// ---------------------------------------------------------------
// Setiap baris list biasanya punya tampilan/logika sendiri →
// pecah jadi komponen. Perhatikan props & children dipadukan.
function ItemKontak({ kontak, onSelect }) {
  const [terbuka, setTerbuka] = useState(false);

  return (
    <li className="item-kontak" style={{
      border: "1px solid #dfe3f0",
      borderRadius: 10,
      padding: "10px 14px",
      marginBottom: 8,
      background: "#fff",
      cursor: "pointer",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between" }} onClick={() => onSelect(kontak.id)}>
        <strong>
          <span style={{ color: kontak.online ? "#2fbf71" : "#aaa" }}>●</span>{" "}
          {kontak.nama}
        </strong>
        <span style={{ color: "#777" }}>{kontak.kota}</span>
      </div>
      {/* Conditional rendering dari state per-item */}
      {terbuka && <p style={{ margin: "8px 0 0" }}>ID: {kontak.id} · {kontak.online ? "sedang online" : "offline"}</p>}
      <button onClick={() => setTerbuka(!terbuka)} style={{ marginTop: 6 }}>
        {terbuka ? "Sembunyikan" : "Detail"}
      </button>
    </li>
  );
}

// ---------------------------------------------------------------
// 3. KENAPA KEY PENTING — demo yang bikin paham
// ---------------------------------------------------------------
// Key memberi React "identitas stabil" antar render. Tanpa key yang
// benar (misal pakai indeks pada list yang bisa diurut/dihapus),
// React bisa salah mencocokkan item — dan STATE DI DALAM ITEM-nya
// jadi kacau. Kita buktikan:
function DemoKey() {
  const [items, setItems] = useState([
    { id: 1, label: "Apel" },
    { id: 2, label: "Jeruk" },
    { id: 3, label: "Mangga" },
  ]);
  const [pakaiIndeks, setPakaiIndeks] = useState(true);

  // Tiap item punya checkbox (state per-item!) — kalau key salah,
  // centak "melompat" ke item yang salah saat dihapus.
  const [centang, setCentang] = useState({});

  function hapus(id) {
    setItems(items.filter((it) => it.id !== id));
  }

  return (
    <div>
      <label style={{ display: "block", marginBottom: 8 }}>
        <input
          type="checkbox"
          checked={!pakaiIndeks}
          onChange={() => setPakaiIndeks(!pakaiIndeks)}
        />{" "}
        pakai key yang benar (id) — coba matikan/nyalakan
      </label>

      {items.map((item, i) => (
        <div
          key={pakaiIndeks ? i : item.id}
          style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}
        >
          <input
            type="checkbox"
            checked={!!centang[item.id]}
            onChange={() => setCentang({ ...centang, [item.id]: !centang[item.id] })}
          />
          <span>{item.label}</span>
          <button onClick={() => hapus(item.id)} style={{ fontSize: "0.8rem" }}>✕ hapus</button>
        </div>
      ))}

      <button onClick={() => setItems(kontakAwal.map((k, i) => ({ id: i + 10, label: k.nama })))}>
        reset list
      </button>

      <p style={{ color: "#777", fontSize: "0.9rem" }}>
        🧪 Eksperimen: centang "Mangga", lalu hapus "Apel". Dengan key=indeks,
        centakmu pindah! Dengan key=id, centak tetap di Mangga.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------
// 4. Pola CRUD list lengkap (tambah, hapus, ganti posisi)
// ---------------------------------------------------------------
function KelolaKontak() {
  const [kontak, setKontak] = useState(kontakAwal);
  const [namaBaru, setNamaBaru] = useState("");
  const [kotaBaru, setKotaBaru] = useState("");

  function tambah(e) {
    e.preventDefault();
    if (!namaBaru.trim()) return;
    // id unik sederhana: angka terbesar sekarang + 1 (praktis untuk demo;
    // di app nyata pakai library seperti `nanoid`)
    const idBaru = Math.max(...kontak.map((k) => k.id), 0) + 1;
    setKontak([...kontak, { id: idBaru, nama: namaBaru.trim(), kota: kotaBaru.trim() || "-", online: false }]);
    setNamaBaru("");
    setKotaBaru("");
  }

  function hapus(id) {
    setKontak(kontak.filter((k) => k.id !== id)); // ES6 04: filter = "kebalikan hapus"
  }

  function toggleOnline(id) {
    // map = "ubah satu item di tengah array" (array baru, item berubah via spread)
    setKontak(
      kontak.map((k) => (k.id === id ? { ...k, online: !k.online } : k))
    );
  }

  return (
    <div>
      <form onSubmit={tambah} style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input value={namaBaru} onChange={(e) => setNamaBaru(e.target.value)} placeholder="nama" />
        <input value={kotaBaru} onChange={(e) => setKotaBaru(e.target.value)} placeholder="kota" />
        <button type="submit">+ Tambah</button>
      </form>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {kontak.map((k) => (
          <li key={k.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <button onClick={() => toggleOnline(k.id)} title="toggle online" style={{ width: 34 }}>
              {k.online ? "🟢" : "⚪"}
            </button>
            <span style={{ flex: 1 }}>
              {k.nama} <small style={{ color: "#888" }}>({k.kota})</small>
            </span>
            <button onClick={() => hapus(k.id)}>✕</button>
          </li>
        ))}
      </ul>

      {kontak.length === 0 && <p>Kontak kosong. Tambahkan seseorang!</p>}
    </div>
  );
}

// ---------------------------------------------------------------
// 5. List + search (filter dari data, ES6 04 jadi nyata)
// ---------------------------------------------------------------
function CariKontak() {
  const [q, setQ] = useState("");
  const hasil = kontakAwal.filter(
    (k) => k.nama.toLowerCase().includes(q.toLowerCase()) || k.kota.toLowerCase().includes(q.toLowerCase())
  );
  return (
    <div>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="cari nama atau kota..." style={{ width: "100%" }} />
      <ul>
        {hasil.map((k) => (
          <li key={k.id}>{k.nama} — {k.kota}</li>
        ))}
        {hasil.length === 0 && <li>Tidak ada hasil untuk "{q}"</li>}
      </ul>
    </div>
  );
}

export default function App() {
  return (
    <main>
      <h1>Modul 04 — Lists & Keys</h1>

      <h2>1. Array → daftar dengan .map()</h2>
      <DaftarSederhana />

      <h2>2. Item list sebagai komponen</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {kontakAwal.map((k) => (
          <ItemKontak key={k.id} kontak={k} onSelect={(id) => console.log("dipilih:", id)} />
        ))}
      </ul>

      <h2>3. Demo: kenapa key harus stabil</h2>
      <DemoKey />

      <h2>4. CRUD list: tambah / hapus / ubah</h2>
      <KelolaKontak />

      <h2>5. List + pencarian</h2>
      <CariKontak />
    </main>
  );
}
