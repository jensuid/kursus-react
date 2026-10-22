# Modul 03 — Events & useState ⭐

Modul paling penting di seluruh kursus. Kalau kamu paham ini, kamu paham React.

## 1. Event

Handler event di React = fungsi biasa yang diberikan ke atribut `onXxx` (camelCase):

```jsx
<button onClick={handleClick}>Klik</button>   {/* ✅ referensi fungsi */}
<button onClick={handleClick()}>Klik</button> {/* ❌ error: langsung terpanggil saat render */}
```

Sering pakai arrow function inline:

```jsx
<button onClick={() => setCount(count + 1)}>+1</button>
```

Objek event (`e`) sama seperti vanilla JS: `e.target.value`, `e.preventDefault()`, dll.

## 2. useState — state = data yang hidup

```jsx
import { useState } from "react";

const [count, setCount] = useState(0);
//      ^nilai    ^fungsi pengubah    ^nilai awal
```

Cara kerjanya (HAFAL POLA INI):

1. User beraksi → handler memanggil `setCount(nilaiBaru)`
2. React menyimpan nilai baru, lalu **merender ulang komponen** (fungsi dijalankan dari awal)
3. Fungsi dijalankan lagi → `count` sekarang bernilai baru → UI terbarui

Ini sebabnya di dalam fungsi komponenmu, kamu boleh menulis `console.log` untuk melihat setiap render.

## 3. Aturan emas: JANGAN mutasi state langsung

```jsx
// ❌ SALAH
user.umur = user.umur + 1;
setUser(user);              // React tidak melihat perubahan (objeknya sama!)

// ✅ BENAR — selalu buat salinan baru (spread dari ES6 03!)
setUser({ ...user, umur: user.umur + 1 });
setTodos([...todos, itemBaru]);
```

## 4. Jebakan setState beruntun

```jsx
setN(n + 1); setN(n + 1); setN(n + 1);  // n nilai render lama → cuma +1!
setN((prev) => prev + 1);               // updater function → +3 dengan benar
```

Aturan praktis: **kalau nilai baru bergantung pada nilai lama, pakai updater function** `setX(prev => ...)`.

## 5. Bentuk state yang sah

- string → input text
- boolean → toggle, show/hide
- number → counter
- objek → `{ ...user, field: baru }`
- array → `[...arr, tambah]` / `arr.filter(...)` / `arr.map(...)`

State boleh apa pun yang nilainya bisa berubah dan UI harus ikut berubah.

## Mental model yang benar

Komponen = **fungsi dari state ke UI**:

```
UI = f(state)
```

Kamu tidak pernah "mengubah tampilan". Kamu mengubah **state**, dan React mengubah tampilan. Setiap handler sebaiknya berpikir: *"state apa yang perlu berubah di sini?"*

## Menjalankan

```bash
npm install && npm run dev
```

Penting: buka DevTools Console, lalu uncomment `console.log("render!")` di dalam komponen `Counter` untuk **melihat sendiri** setiap setState memicu render ulang.

## Latihan

1. **Buat `Counter` dengan tombol ×2** yang menggandakan nilai.
2. Tambahkan fitur "Reset" pada counter.
3. Buat **Stopwatch**: satu state `detik`, tombol Mulai (pakai `setInterval` di handler — coba dulu, kita perbaiki di modul 07) dan Reset. (Tidak perlu presisi.)
4. Reflexi: kenapa `GantiWarna` pakai `(indeks + 1) % warnaList.length`?

<details>
<summary>Solusi latihan 1</summary>

```jsx
<button onClick={() => setCount(count * 2)}>×2</button>
```
</details>

## Cek pemahaman

- [ ] Saya bisa menjelaskan alur: klik → setState → rerender → UI baru
- [ ] Saya tahu kenapa harus buat salinan baru saat update objek/array
- [ ] Saya tahu kapan pakai updater function `setX(prev => ...)`
- [ ] Saya tidak lagi menulis `state.x = y` (mutasi langsung)

Kalau sudah → lanjut ke [Modul 04 — Lists & Keys](../04-lists-keys).
