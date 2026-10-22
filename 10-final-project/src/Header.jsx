// Header.jsx — bagian atas app. Murni tampilan, tidak punya state.
export default function Header({ total, selesai }) {
  const persen = total === 0 ? 0 : Math.round((selesai / total) * 100);
  return (
    <header className="app-header">
      <h1>✅ Todo Saya</h1>
      <p className="ringkas">
        {selesai} dari {total} selesai ({persen}%)
      </p>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${persen}%` }} />
      </div>
    </header>
  );
}
