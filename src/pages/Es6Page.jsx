import { useState } from "react";

// Baca semua file .js modul 00 sebagai teks mentah (?raw), sinkron dengan aslinya.
const raw = import.meta.glob("../../00-es6-crash-course/*.js", {
  eager: true,
  query: "?raw",
  import: "default",
});

// Ubah { path: isi } menjadi array terurut berdasarkan nama file.
const files = Object.entries(raw)
  .map(([path, content]) => ({
    name: path.split("/").pop(),
    content,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

export default function Es6Page() {
  const [aktif, setAktif] = useState(0);
  const file = files[aktif];

  return (
    <div className="hub-content">
      <div className="hub-page-head">
        <div className="hub-eyebrow">
          Modul 00 · <span className="hub-badge es6">ES6</span>
        </div>
        <h1 className="hub-title">ES6 Crash Course</h1>
        <p className="hub-desc">
          Fondasi JavaScript modern yang dipakai di sepanjang kursus. File-file
          ini adalah <b>skrip Node</b>, jadi tidak berjalan di browser — halaman
          ini hanya menampilkan isinya.
        </p>
        <div className="hub-meta">
          <span>Jalankan di terminal:</span>
          <code className="hub-path">cd 00-es6-crash-course</code>
          <code className="hub-path">node {file?.name ?? "01-let-const-arrow.js"}</code>
        </div>
      </div>

      <div className="hub-code-list">
        {files.map((f, i) => (
          <button
            key={f.name}
            type="button"
            className={`hub-code-tab${i === aktif ? " active" : ""}`}
            onClick={() => setAktif(i)}
          >
            {f.name}
          </button>
        ))}
      </div>

      <pre className="hub-pre">
        <code>{file?.content}</code>
      </pre>

      <p className="hub-note">
        Tip: kerjakan urut dari <b>01</b> sampai <b>08</b>. Buka file yang sama
        di editor untuk membaca komentar dan mengerjakan bagian LATIHAN di
        bawah tiap file.
      </p>
    </div>
  );
}
