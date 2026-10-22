// TodoList.jsx — merender daftar todo (list + keys dari Modul 04).
import TodoItem from "./TodoItem";

export default function TodoList({ todos, onToggle, onHapus, onEdit }) {
  if (todos.length === 0) {
    return <p className="kosong">Tidak ada tugas di sini. 🎉</p>;
  }
  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}          // ⭐ key stabil — tanpa ini edit/hapus kacau
          todo={todo}
          onToggle={onToggle}
          onHapus={onHapus}
          onEdit={onEdit}
        />
      ))}
    </ul>
  );
}
