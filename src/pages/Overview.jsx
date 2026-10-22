import { Link } from "react-router-dom";
import { modules } from "../modules.js";

const badgeLabel = {
  react: "React",
  es6: "ES6",
  md: "Panduan",
};

export default function Overview() {
  return (
    <div className="hub-content">
      <div className="hub-page-head">
        <div className="hub-eyebrow">Ringkasan Kursus</div>
        <h1 className="hub-title">Semua modul dalam satu tempat</h1>
        <p className="hub-desc">
          Klik modul di sidebar, atau pilih kartu di bawah. Modul 01-10 adalah
          demo interaktif yang benar-benar berjalan di sini; modul 00 &amp; 11
          ditampilkan sebagai bacaan.
        </p>
      </div>

      <div className="hub-banner">
        <strong>Cara pakai:</strong> kerjakan urut dari <b>00</b> sampai{" "}
        <b>10</b>. Untuk tiap modul React, baca komentar di samping hasilnya,
        lalu coba ubah kodenya. Modul 00 (ES6) dijalankan di terminal, bukan di
        browser — buka halamannya untuk melihat perintah{" "}
        <span className="hub-kbd">node</span>.
      </div>

      <div className="hub-grid">
        {modules.map((m) => (
          <Link key={m.num} to={`/modul/${m.num}`} className="hub-card">
            <div className="hub-card-top">
              <span className="hub-card-num">Modul {m.num}</span>
              <span className={`hub-badge ${m.type}`}>
                {badgeLabel[m.type]}
              </span>
            </div>
            <h3 className="hub-card-title">{m.title}</h3>
            <p className="hub-card-desc">{m.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
