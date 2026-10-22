import { NavLink, Route, Routes } from "react-router-dom";
import { modules } from "./modules.js";
import Overview from "./pages/Overview.jsx";
import ModulePage from "./pages/ModulePage.jsx";
import Es6Page from "./pages/Es6Page.jsx";
import NextStepsPage from "./pages/NextStepsPage.jsx";

// Kelompok sidebar berdasarkan tipe modul agar enak dibaca.
const groups = [
  { label: "Persiapan", items: modules.filter((m) => m.type === "es6") },
  { label: "Modul React", items: modules.filter((m) => m.type === "react") },
  { label: "Penutup", items: modules.filter((m) => m.type === "md") },
];

function Sidebar() {
  return (
    <aside className="hub-sidebar">
      <p className="hub-brand">Kursus React</p>
      <p className="hub-brand-sub">Hub modul — klik untuk membuka</p>

      <NavLink to="/" end className="hub-nav-link">
        <span className="hub-nav-num">•</span>
        Ringkasan
      </NavLink>

      {groups.map((group) =>
        group.items.length === 0 ? null : (
          <nav key={group.label}>
            <div className="hub-nav-group-label">{group.label}</div>
            {group.items.map((m) => (
              <NavLink
                key={m.num}
                to={`/modul/${m.num}`}
                className="hub-nav-link"
              >
                <span className="hub-nav-num">{m.num}</span>
                {m.title}
              </NavLink>
            ))}
          </nav>
        )
      )}
    </aside>
  );
}

export default function Hub() {
  return (
    <div className="hub">
      <Sidebar />
      <main className="hub-main">
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/modul/00" element={<Es6Page />} />
          <Route path="/modul/11" element={<NextStepsPage />} />
          <Route path="/modul/:num" element={<ModulePage />} />
          <Route path="*" element={<Overview />} />
        </Routes>
      </main>
    </div>
  );
}
