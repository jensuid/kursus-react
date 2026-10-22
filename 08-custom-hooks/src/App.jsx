// =====================================================================
// MODUL 08 — Custom Hooks
// Komponen = urusan TAMPILAN. Custom hook = urusan LOGIKA.
// Kalau kamu sering copy-paste potongan useState/useEffect yang sama
// ke komponen berbeda → waktunya bungkus jadi hook sendiri.
// =====================================================================
import { useRef, useState } from "react";
import { useCounter, useLocalStorage, useTitle } from "./hooks";

// ---------------------------------------------------------------
// 1. Satu hook, banyak pemanggil — dan tiap pemanggil PUNYA STATE
//    SENDIRI. Inilah kekuatan custom hook (bukan sekadar fungsi
//    utilitas biasa).
// ---------------------------------------------------------------
function KeranjangBelanja({ nama }) {
  // dua kali pakai hook yang sama → dua counter yang BERBEDA dan
  // tidak saling ganggu, meski logikanya sama persis
  const itemCount = useCounter(0, { step: 1 });
  const totalPrice = useCounter(0, { step: 15000, min: 0 });

  return (
    <div className="keranjang">
      <h4>{nama}</h4>
      <p>
        {itemCount.count} item · Rp{totalPrice.count.toLocaleString("id-ID")}
      </p>
      <div style={{ display: "flex", gap: 6 }}>
        <button onClick={() => { itemCount.naik(); totalPrice.naik(); }}>+ beli</button>
        <button onClick={() => { itemCount.turun(); totalPrice.turun(); }}>− batal</button>
        <button onClick={() => { itemCount.reset(); totalPrice.reset(); }}>reset</button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------
// 2. useLocalStorage — state yang "kekal" meski browser ditutup
// ---------------------------------------------------------------
function ProfilPenyimpan() {
  // Coba isi, refresh halaman, dan datanya MASIH ADA.
  const [nama, setNama] = useLocalStorage("belajar:nama", "");

  return (
    <div>
      <input
        value={nama}
        onChange={(e) => setNama(e.target.value)}
        placeholder="namamu (tersimpan otomatis)"
      />
      <p>Refresh halaman ini — nama tetap "{nama || "(kosong)"}" karena di localStorage.</p>
    </div>
  );
}

// ---------------------------------------------------------------
// 3. Aturan hooks — kenapa "use" di depan itu penting
// ---------------------------------------------------------------
// HOOK HANYA BOLEH DIPANGGIL:
//   ✅ di level teratas fungsi komponen / custom hook lain
//   ❌ di dalam if / for / function bersarang / setelah return awal
// Kenapa? React melacak state hook berdasarkan URUTAN pemanggilannya.
// Boleh pakai banyak useState berurutan — asalkan urutannya SELALU sama.
//   if (sudahLogin) useX();   ← kalau kondisi berubah, urutan berubah → crash
// (Aturan ini ditegakkan otomatis oleh ESLint plugin react-hooks.)

// Contoh PELANGGARAN (dibiarkan sebagai komentar agar app tetap jalan):
// function Salah({ tampilkan }) {
//   if (tampilkan) {
//     const [x, setX] = useState(0);   // ❌ hook di dalam if
//   }                                 //    → urutan hook berubah tiap render → React error!
// }
// Perbaiki dengan memindahkan SELURUH hook ke level teratas, dan
// kondisi hanya dipakai di JSX/logika biasa:
// function Benar({ tampilkan }) {
//   const [x, setX] = useState(0);     // ✅ selalu terpanggil, urutan tetap
//   return tampilkan ? <p>{x}</p> : null;
// }

function AturanHooksDemo() {
  return (
    <p style={{ color: "#777" }}>
      Lihat komentar di App.jsx: hook tidak boleh dipanggil di dalam
      if/loop/fungsi bersarang. Urutan pemanggilan harus selalu sama
      di setiap render.
    </p>
  );
}

// ---------------------------------------------------------------
// 4. useRef sekilas — "kotak penyimpan" yang tidak memicu render
// ---------------------------------------------------------------
// useState → berubah = komponen render ulang
// useRef   → berubah = TIDAK render. Cocok untuk: nilai antar-render,
// id timer, atau menunjuk elemen DOM (fokus input, scroll).
function FokusOtomatis() {
  const [pesan, setPesan] = useState("");
  const inputRef = useRef(null); // .current = nilai yang disimpan

  function teken() {
    inputRef.current.focus();
    setPesan(`Kamu menekan: "${inputRef.current.value}"`);
  }

  return (
    <div>
      <input ref={inputRef} placeholder="ketik lalu tekan Enter" onKeyDown={(e) => e.key === "Enter" && teken()} />
      <p>{pesan}</p>
      <button onClick={() => inputRef.current.focus()}>Fokus ke input</button>
    </div>
  );
}

export default function App() {
  // judul tab dikelola hook — gunakan!
  useTitle("Modul 08 — Custom Hooks (aktif)");

  return (
    <main>
      <h1>Modul 08 — Custom Hooks</h1>

      <h2>1. useCounter dipakai dua kali, state terpisah</h2>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <KeranjangBelanja nama="Keranjang A" />
        <KeranjangBelanja nama="Keranjang B" />
      </div>

      <h2>2. useLocalStorage — data survive refresh</h2>
      <ProfilPenyimpan />

      <h2>3. useRef — kotak tanpa render</h2>
      <FokusOtomatis />

      <h2>4. Demo aturan hooks (baca di App.jsx)</h2>
      <AturanHooksDemo />
    </main>
  );
}
