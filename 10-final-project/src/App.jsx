// =====================================================================
// MODUL 10 — Todo App (Proyek Akhir)
// Semua konsep bersatu. App = "otak": memegang state, membagikan data
// lewat props, dan menerima aksi lewat callback (lifting state up).
//
//   App (state: todos + filter)
//    ├─ Header        ← membaca (total, selesai)
//    ├─ TodoInput     ← onTambah (naik ke App)
//    ├─ TodoList      ← membaca + onToggle/onHapus/onEdit
//    │    └─ TodoItem (state lokal: mengedit)
//    └─ Footer        ← membaca + onFilter/onBersihkan
// =====================================================================
import { useMemo, useState } from "react";
import Header from "./Header";
import TodoInput from "./TodoInput";
import TodoList from "./TodoList";
import Footer from "./Footer";
import { useLocalStorage } from "./useLocalStorage";
import "./todo.css";

// id unik sederhana untuk tugas baru
const buatId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Date.now() + Math.random();

export default function App() {
  // State utama — tersimpan otomatis di localStorage (Modul 08)
  const [todos, setTodos] = useLocalStorage("todo:items", [
    { id: buatId(), teks: "Belajar komponen & props", selesai: true },
    { id: buatId(), teks: "Kuasai useState & event", selesai: false },
    { id: buatId(), teks: "Bangun Todo App ini", selesai: false },
  ]);
  const [filter, setFilter] = useState("all");

  // ---- AKSI (semua mengubah state lewat salinan baru — Modul 03) ----
  const tambah = (teks) =>
    setTodos([{ id: buatId(), teks, selesai: false }, ...todos]);

  const toggle = (id) =>
    setTodos(todos.map((t) => (t.id === id ? { ...t, selesai: !t.selesai } : t)));

  const hapus = (id) => setTodos(todos.filter((t) => t.id !== id));

  const edit = (id, teks) =>
    setTodos(todos.map((t) => (t.id === id ? { ...t, teks } : t)));

  const bersihkanSelesai = () => setTodos(todos.filter((t) => !t.selesai));

  // ---- DATA TURUNAN (hitung saat render, TANPA useEffect — Modul 07) ----
  // useMemo: hanya dihitung ulang saat `todos`/`filter` berubah.
  const yangDitampilkan = useMemo(() => {
    if (filter === "active") return todos.filter((t) => !t.selesai);
    if (filter === "done") return todos.filter((t) => t.selesai);
    return todos;
  }, [todos, filter]);

  const selesaiCount = todos.filter((t) => t.selesai).length;

  return (
    <div className="app">
      <Header total={todos.length} selesai={selesaiCount} />

      <TodoInput onTambah={tambah} />

      <TodoList
        todos={yangDitampilkan}
        onToggle={toggle}
        onHapus={hapus}
        onEdit={edit}
      />

      <Footer
        filter={filter}
        onFilter={setFilter}
        sisaAktif={todos.length - selesaiCount}
        selesaiCount={selesaiCount}
        onBersihkan={bersihkanSelesai}
      />
    </div>
  );
}
