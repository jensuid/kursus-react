// =====================================================================
// MODUL 02 — Styling di React
// Tiga cara memberi gaya: CSS biasa (import), conditional class,
// dan inline style. Baca kode sambil melihat hasilnya di browser.
// =====================================================================
import "./Tombol.css"; // file CSS biasa — Vite yang mengurus muatnya

// ---------------------------------------------------------------
// 1. CARA PALING UMUM: tulis CSS di file, pakai className
// ---------------------------------------------------------------
// className (bukan class!) merujuk ke aturan CSS di Tombol.css.
function Tombol({ children, variant = "primary" }) {
  // -------------------------------------------------------------
  // 2. CONDITIONAL CLASS — gaya berbeda tergantung props/state
  // -------------------------------------------------------------
  // Cara paling sederhana: template literal.
  const kelas = `tombol tombol-${variant}`;

  // (Di project nyata sering pakai library `clsx`, tapi pola manual
  //  ini yang perlu kamu pahami dulu.)
  return <button className={kelas}>{children}</button>;
}

// Gabung banyak class berdasarkan kondisi boolean — pola penting!
function Baris({ ganjil, children }) {
  return (
    <div className={ganjil ? "baris baris-ganjil" : "baris"}>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------
// 3. INLINE STYLE — objek JavaScript, bukan string CSS
// ---------------------------------------------------------------
// - Props CSS jadi camelCase: background-color → backgroundColor
// - Angka untuk px boleh langsung: padding: 12 → "12px"
// Kapan cocok? Nilai yang BARU DIKETAHUI saat render (dinamis),
// misal warna dari data, lebar progress bar, dsb.
function BarProgress({ persen, warna }) {
  const gayaOuter = {
    background: "#e6e8f0",
    borderRadius: 999,
    overflow: "hidden",
    height: 18,
  };
  const gayaInner = {
    width: `${persen}%`,        // ← nilai dinamis! Tidak bisa via class biasa
    height: "100%",
    background: warna,
    transition: "width 0.4s",
  };
  return (
    <div style={gayaOuter}>
      <div style={gayaInner} />
    </div>
  );
}

// Kartu produk: gabungan className statis + inline style dinamis
function KartuProduk({ nama, harga, stok }) {
  const habis = stok === 0;
  return (
    <div
      className="kartu"
      style={{
        opacity: habis ? 0.45 : 1,          // dinamis → inline
        borderColor: habis ? "#e05656" : "#d5d9ea", // dinamis → inline
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <strong>{nama}</strong>
        <span>Rp{harga.toLocaleString("id-ID")}</span>
      </div>
      <div style={{ margin: "10px 0" }}>
        <BarProgress persen={Math.min(stok * 10, 100)} warna="#3f8cff" />
      </div>
      <Tombol variant={habis ? "danger" : "primary"}>
        {habis ? "Stok Habis" : "Beli"}
      </Tombol>
    </div>
  );
}

// ---------------------------------------------------------------
// 4. Apa yang TIDAK berlaku di React
// ---------------------------------------------------------------
// :hover, ::before, media query, animasi — tetap CSS biasa di file!
// Lihat Tombol.css: hover dan keyframes ada di sana, bukan di JS.

export default function App() {
  return (
    <main>
      <h1>Modul 02 — Styling</h1>

      <h2>1 & 2. CSS file + conditional class</h2>
      <p style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Tombol>Primary</Tombol>
        <Tombol variant="ghost">Ghost</Tombol>
        <Tombol variant="danger">Danger</Tombol>
      </p>

      <h2>Garis selang-seling (conditional class dari props)</h2>
      <div className="tabel">
        {[1, 2, 3, 4].map((n) => (
          <Baris key={n} ganjil={n % 2 === 1}>
            Baris ke-{n} {n % 2 === 1 ? "(ganjil → kuning)" : ""}
          </Baris>
        ))}
      </div>

      <h2>3. Inline style dinamis</h2>
      <BarProgress persen={35} warna="#f5a623" />
      <div style={{ height: 10 }} />
      <BarProgress persen={80} warna="#2fbf71" />

      <h2>Gabungan: kartu produk</h2>
      <div style={{ display: "grid", gap: 12 }}>
        <KartuProduk nama="Mechanical Keyboard" harga={850000} stok={7} />
        <KartuProduk nama="Mouse Wireless" harga={150000} stok={0} />
      </div>
    </main>
  );
}
