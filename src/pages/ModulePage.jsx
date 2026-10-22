import { Suspense, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { findModule } from "../modules.js";

function CopyPath({ path }) {
  const [copied, setCopied] = useState(false);

  async function salin() {
    try {
      await navigator.clipboard.writeText(path);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard bisa gagal di beberapa browser; abaikan diam-diam */
    }
  }

  return (
    <>
      <code className="hub-path">{path}</code>{" "}
      <button className="hub-copy-btn" onClick={salin} type="button">
        {copied ? "Tersalin!" : "Salin"}
      </button>
    </>
  );
}

export default function ModulePage() {
  const { num } = useParams();
  const modul = findModule(num);

  // Nomor tak dikenal → kembali ke ringkasan.
  if (!modul) return <Navigate to="/" replace />;

  // Modul 00 & 11 punya halaman khusus; di sini hanya 01-10.
  if (modul.type !== "react") {
    if (modul.type === "es6") return <Navigate to="/modul/00" replace />;
    if (modul.type === "md") return <Navigate to="/modul/11" replace />;
  }

  const Demo = modul.Component;

  return (
    <div className="hub-content">
      <div className="hub-page-head">
        <div className="hub-eyebrow">
          Modul {modul.num} · <span className={`hub-badge ${modul.type}`}>React</span>
        </div>
        <h1 className="hub-title">{modul.title}</h1>
        <p className="hub-desc">{modul.desc}</p>

        <div className="hub-meta">
          <span>Sumber:</span>
          <CopyPath path={`${modul.folder}/src/App.jsx`} />
          <span aria-hidden="true">·</span>
          <span>Teori:</span>
          <CopyPath path={`${modul.folder}/README.md`} />
        </div>
      </div>

      <p className="hub-note">
        Demo di bawah adalah app modul yang sebenarnya. Buka file sumbernya di
        editor untuk membaca komentar, dan sesuaikan dengan yang tampil.
      </p>
      <hr className="hub-divider" />

      <div className="hub-demo">
        <Suspense fallback={<p className="hub-loading">Memuat modul…</p>}>
          <Demo />
        </Suspense>
      </div>
    </div>
  );
}
