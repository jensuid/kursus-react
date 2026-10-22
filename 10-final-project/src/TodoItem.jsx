// TodoItem.jsx — satu baris todo. Punya state lokal untuk mode edit.
// Menerima todo + callback aksi dari TodoList (yang dapat dari App).
import { useState } from "react";

export default function TodoItem({ todo, onToggle, onHapus, onEdit }) {
  const [mengedit, setMengedit] = useState(false);
  const [draft, setDraft] = useState(todo.teks);

  function simpan() {
    const bersih = draft.trim();
    if (bersih && bersih !== todo.teks) onEdit(todo.id, bersih);
    setDraft(bersih || todo.teks);
    setMengedit(false);
  }

  return (
    <li className={"todo-item" + (todo.selesai ? " selesai" : "")}>
      <input
        type="checkbox"
        checked={todo.selesai}
        onChange={() => onToggle(todo.id)}
        aria-label="tandai selesai"
      />

      {mengedit ? (
        <input
          className="edit-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={simpan}
          onKeyDown={(e) => e.key === "Enter" && simpan()}
          autoFocus
        />
      ) : (
        <span className="teks" onDoubleClick={() => setMengedit(true)} title="klik dua kali untuk edit">
          {todo.teks}
        </span>
      )}

      <div className="aksi">
        {!mengedit && (
          <button onClick={() => setMengedit(true)} aria-label="edit">✏️</button>
        )}
        <button onClick={() => onHapus(todo.id)} aria-label="hapus">🗑️</button>
      </div>
    </li>
  );
}
