// =====================================================================
// MODUL 06 — Lifting State Up & Context API
// Masalah: dua (atau lebih) komponen perlu MEMBAGAI data yang sama.
// Solusi 1: angkat state ke parent bersama (lifting state up).
// Solusi 2: Context — lewati semua perantara tanpa props drilling.
// =====================================================================
import { useState } from "react";
import { ThemeContext, useTema } from "./ThemeContext";

// #####################################################################
// BAGIAN A — LIFTING STATE UP
// #####################################################################

// Komponen anak: TIDAK punya state sendiri — cuma terima props
// dan lapor ke atas lewat callback (props berupa fungsi!).
function Penambah({ onTambah }) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button onClick={() => onTambah(1)}>+1</button>
      <button onClick={() => onTambah(10)}>+10</button>
    </div>
  );
}

function Pengurang({ onKurangi }) {
  return <button onClick={() => onKurangi(1)}>−1</button>;
}

function Penampil({ nilai }) {
  return <strong style={{ fontSize: "1.4rem" }}>{nilai}</strong>;
}

// PARENT memegang state satu-satunya. Anak-anak "berkomunikasi"
// lewat parent — bukan langsung satu sama lain. Ini pola paling
// penting dalam penempatan state di React.
function DemoLifting() {
  const [total, setTotal] = useState(0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "start" }}>
      <Penambah onTambah={(n) => setTotal((prev) => prev + n)} />
      <Pengurang onKurangi={(n) => setTotal((prev) => Math.max(0, prev - n))} />
      <p>
        Total: <Penampil nilai={total} />
      </p>
      <p style={{ color: "#777", fontSize: "0.9rem" }}>
        state `total` HANYA ada di sini (parent, baris atas). Kedua tombol anak
        melihat dan mengubahnya lewat props + callback.
      </p>
    </div>
  );
}

// #####################################################################
// BAGIAN B — PROPS DRILLING (saksikan masalahnya)
// #####################################################################
// Tree: DemoDrilling > Layout > Sidebar > Menu > ItemMenu
// Hanya ItemMenu yang butuh `tema` — tapi harus "diselundupkan"
// lewat SEMUA perantara. Bayangkan 8 level dalam project nyata.

function ItemMenuDrill({ tema }) {
  return <li style={{ color: tema === "gelap" ? "#8be9fd" : "#0b7285" }}>Beranda</li>;
}

function Menu({ tema }) {
  return (
    <ul style={{ padding: 0, listStyle: "none", margin: 0 }}>
      <ItemMenuDrill tema={tema} />
    </ul>
  );
}

function Sidebar({ tema }) {
  return (
    <aside style={{ borderRight: "1px solid #ccc", padding: 12 }}>
      <h4 style={{ margin: "0 0 8px" }}>Menu</h4>
      <Menu tema={tema} />
    </aside>
  );
}

function LayoutDrill({ tema }) {
  // Layout TIDAK memakai tema sama sekali...
  return (
    <div style={{ display: "flex", gap: 12 }}>
      <Sidebar tema={tema} /> {/* ...tapi harus meneruskannya */}
      <div style={{ flex: 1 }}>
        <p>Konten... (props `tema` dilewatkan di sini walau tidak dipakai)</p>
      </div>
    </div>
  );
}

function DemoDrilling() {
  const [tema, setTema] = useState("terang");
  return (
    <div>
      <button onClick={() => setTema(tema === "terang" ? "gelap" : "terang")}>
        Ganti tema (sekarang: {tema})
      </button>
      <div style={{ marginTop: 12, border: "1px dashed #bbb", borderRadius: 10, padding: 12 }}>
        <LayoutDrill tema={tema} />
      </div>
    </div>
  );
}

// #####################################################################
// BAGIAN C — CONTEXT (solusi drilling)
// #####################################################################
// Data "ditembak" lewat Provider di atas, lalu diambil LANGSUNG oleh
// anak sedalam apa pun dengan useContext — tanpa perantara.

function TombolTema() {
  const { tema, ganti } = useTema(); // ambil dari context — tanpa props!
  return <button onClick={ganti}>Tema: {tema} — klik untuk ganti</button>;
}

function ItemMenuContext() {
  const { tema } = useTema(); // langsung "loncat" ke provider
  return <li style={{ color: tema === "gelap" ? "#8be9fd" : "#0b7285" }}>Beranda</li>;
}

function MenuContext() {
  return (
    <ul style={{ padding: 0, listStyle: "none", margin: 0 }}>
      <ItemMenuContext />
    </ul>
  );
}

function SidebarContext() {
  const { tema } = useTema();
  return (
    <aside
      style={{
        borderRight: "1px solid #ccc",
        padding: 12,
        background: tema === "gelap" ? "#1e1e2e" : "#fafafa",
        borderRadius: 8,
        transition: "background 0.3s",
      }}
    >
      <h4 style={{ margin: "0 0 8px" }}>Menu</h4>
      <MenuContext />
    </aside>
  );
}

function LayoutContext() {
  const { tema } = useTema();
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        background: tema === "gelap" ? "#2b2b3c" : "#fff",
        color: tema === "gelap" ? "#e6e6e6" : "inherit",
        padding: 12,
        borderRadius: 10,
        transition: "background 0.3s",
      }}
    >
      <SidebarContext />
      <div style={{ flex: 1 }}>
        <p>Tema {tema} — dan TIDAK ADA satu pun props `tema` di pohon komponen ini!</p>
        <TombolTema />
      </div>
    </div>
  );
}

// Provider = komponen yang MENYIMPAN state dan MENYEDIAKANNYA ke bawah.
// Ini contoh pertama pola "state provider" yang akan sering kamu temui.
function ThemeProvider({ children }) {
  const [tema, setTema] = useState("terang");
  const nilai = {
    tema,
    ganti: () => setTema(tema === "terang" ? "gelap" : "terang"),
  };
  return <ThemeContext.Provider value={nilai}>{children}</ThemeContext.Provider>;
}

// =====================================================================
// Kapan pakai yang mana?
// - Lifting + props/callback: DEFAULT. Eksplisit, mudah dilacak.
//   Angkat state ke parent TERDEKAT yang bisa menjangkau semua yang butuh.
// - Context: data "infrastruktur" yang dipakai banyak tempat & jarang
//   berubah — tema, user login, bahasa. BUKAN pengganti state management
//   untuk segala hal!
// =====================================================================

export default function App() {
  return (
    <main>
      <h1>Modul 06 — Lifting State & Context</h1>

      <h2>A. Lifting state up (props + callback)</h2>
      <DemoLifting />

      <h2>B. Props drilling — masalahnya</h2>
      <DemoDrilling />

      <h2>C. Context — solusinya</h2>
      <ThemeProvider>
        <LayoutContext />
      </ThemeProvider>
    </main>
  );
}
