// =====================================================================
// MODUL 09 — API & Data (fetch async di React)
// Mengambil data dari internet = side effect → pakai useEffect.
// Kita bangun bertahap: (A) pola manual yang berantakan,
// (B) dibersihkan jadi custom hook, (C) dipakai dengan elegan.
// API gratis: https://jsonplaceholder.typicode.com (data palsu untuk demo)
// =====================================================================
import { useEffect, useState } from "react";
import { useFetch } from "./useFetch";

const API = "https://jsonplaceholder.typicode.com";

// ---------------------------------------------------------------
// A. POLA MANUAL — tiga state wajib: data, loading, error
// ---------------------------------------------------------------
// Perhatikan bagaimana efeknya harus menangani: mulai, sukses, gagal,
// dan pembatalan (unmount). Ini yang nanti kita ringkas di bagian B.
function DaftarPostsManual() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let aktif = true; // flag: masihkah komponen ini "hidup"?

    async function ambil() {
      try {
        setLoading(true);
        const res = await fetch(`${API}/posts?_limit=5`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (aktif) setPosts(json); // jangan setState kalau sudah unmount
      } catch (err) {
        if (aktif) setError(err);
      } finally {
        if (aktif) setLoading(false);
      }
    }

    ambil();
    return () => {
      aktif = false;
    };
  }, []);

  // TAMPILAN kondisional berdasarkan status — POLA WAJIB data async:
  if (loading) return <p>⏳ Memuat data…</p>;
  if (error) return <p style={{ color: "#e05656" }}>⚠ Gagal: {error.message}</p>;
  return (
    <ul>
      {posts.map((p) => (
        <li key={p.id}>{p.title}</li>
      ))}
    </ul>
  );
}

// ---------------------------------------------------------------
// B. POLA BERSIH — pakai custom hook, komponen jadi rapi
// ---------------------------------------------------------------
function DaftarPostsHook() {
  // Semua kerumitan A dibungkus jadi satu baris:
  const { data: posts, loading, error } = useFetch(`${API}/posts?_limit=5`);

  if (loading) return <p>⏳ Memuat…</p>;
  if (error) return <p style={{ color: "#e05656" }}>⚠ {error.message}</p>;

  return (
    <div className="grid-card">
      {posts.map((p) => (
        <article key={p.id} className="card">
          <h4 style={{ margin: "0 0 6px" }}>{p.title}</h4>
          <p style={{ margin: 0, color: "#666", fontSize: "0.9rem" }}>{p.body.slice(0, 80)}…</p>
        </article>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------
// C. Mengirim data (POST) — pola form → API
// ---------------------------------------------------------------
function TambahTodo() {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | ok | error

  async function kirim(e) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch(`${API}/todos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, completed: false }),
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      console.log("Tersimpan di server (palsu):", data);
      setStatus("ok");
      setTitle("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={kirim} style={{ display: "flex", gap: 8 }}>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="judul todo…" required />
      <button type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Mengirim…" : "Kirim"}
      </button>
      {status === "ok" && <span style={{ color: "#2fbf71" }}>✓ terkirim</span>}
      {status === "error" && <span style={{ color: "#e05656" }}>⚠ gagal</span>}
    </form>
  );
}

// ---------------------------------------------------------------
// D. Refetch — memaksa pengambilan ulang saat tombol ditekan
// ---------------------------------------------------------------
// Trik: dependency berupa "counter" yang kamu naikkan → efek jalan lagi.
function Weather() {
  const [nonce, setNonce] = useState(0);
  const { data, loading, error } = useFetch(`${API}/users/1?_nonce=${nonce}`);

  return (
    <div>
      <button onClick={() => setNonce((n) => n + 1)}>🔄 Muat ulang</button>
      {loading && <p>⏳ Memuat…</p>}
      {error && <p style={{ color: "#e05656" }}>⚠ {error.message}</p>}
      {data && (
        <p>
          Data user: <strong>{data[0]?.name ?? data.name}</strong> · email {data[0]?.email ?? data.email}
        </p>
      )}
      <p style={{ color: "#888", fontSize: "0.85rem" }}>
        Tiap klik mengubah `nonce` → URL baru → useFetch refetch. (Cek Network tab!)
      </p>
    </div>
  );
}

export default function App() {
  return (
    <main>
      <h1>Modul 09 — API & Data</h1>
      <p>
        Butuh koneksi internet. Jika gagal, periksa tab Network di DevTools —
        itu alat utama mendiagnosis masalah data.
      </p>

      <h2>A. Fetch manual (pahami dulu kerumitannya)</h2>
      <DaftarPostsManual />

      <h2>B. Dibungkus custom hook <code>useFetch</code></h2>
      <DaftarPostsHook />

      <h2>C. Mengirim data (POST)</h2>
      <TambahTodo />

      <h2>D. Refetch manual</h2>
      <Weather />
    </main>
  );
}
