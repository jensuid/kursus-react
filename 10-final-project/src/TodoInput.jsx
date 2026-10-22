// TodoInput.jsx — form menambah todo (Controlled Component dari Modul 05)
// state input LOKAL di sini (hanya komponen ini yang butuh) → lifting ke
// App lewat callback `onTambah` saat submit.
import { useState } from "react";

export default function TodoInput({ onTambah }) {
  const [teks, setTeks] = useState("");

  function kirim(e) {
    e.preventDefault();
    const bersih = teks.trim();
    if (!bersih) return;      // tolak spasi kosong
    onTambah(bersih);          // laporkan ke App (lifting up — Modul 06)
    setTeks("");               // reset
  }

  return (
    <form className="todo-input" onSubmit={kirim}>
      <input
        value={teks}
        onChange={(e) => setTeks(e.target.value)}
        placeholder="Tambah tugas baru…"
        aria-label="Tugas baru"
        autoFocus
      />
      <button type="submit" disabled={!teks.trim()}>Tambah</button>
    </form>
  );
}
