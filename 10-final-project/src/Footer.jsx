// Footer.jsx — filter (all/active/done) + tombol bersihkan yang selesai.
// Conditional class (Modul 02) untuk tab aktif.
const FILTERS = [
  { key: "all", label: "Semua" },
  { key: "active", label: "Belum selesai" },
  { key: "done", label: "Selesai" },
];

export default function Footer({ filter, onFilter, sisaAktif, selesaiCount, onBersihkan }) {
  return (
    <footer className="todo-footer">
      <span className="sisa">{sisaAktif} tugas tersisa</span>

      <div className="tabs">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={"tab" + (filter === f.key ? " aktif" : "")}
            onClick={() => onFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <button className="bersihkan" onClick={onBersihkan} disabled={selesaiCount === 0}>
        Bersihkan selesai
      </button>
    </footer>
  );
}
