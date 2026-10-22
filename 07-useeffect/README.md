# Modul 07 — useEffect

## Apa itu "side effect"?

Komponen React seharusnya hanya **menghitung UI dari data**. Segala hal lain — mengatur timer, memanggil API, mengubah `document.title`, berlangganan event — disebut **side effect**, dan tidak boleh dilakukan sembarangan di badan komponen (karena komponen bisa dijalankan berulang kali).

`useEffect` adalah tempat resminya: "setelah render ini, lakukan pekerjaan sampingan tersebut".

```jsx
useEffect(() => {
  // efek jalan SETELAH render
  return () => {
    // cleanup jalan SEBELUM efek berikutnya / saat unmount
  };
}, [dependensi]);
```

## Kapan efek berjalan? (dependency array)

| Penulisan | Kapan jalan |
|-----------|-------------|
| tanpa argumen kedua | **setiap** render (jarang diinginkan) |
| `[a, b]` | mount + setiap `a`/`b` berubah |
| `[]` | hanya sekali saat mount (cleanup saat unmount) |

## Tiga pola yang wajib paham

### 1. Mount sekali + cleanup

```jsx
useEffect(() => {
  const id = setInterval(() => setWaktu(...), 1000);
  return () => clearInterval(id);   // ⭐ tanpa ini: interval menumpuk!
}, []);
```

Aturannya: **apa pun yang kamu mulai, harus kamu hentikan di cleanup** — timer, subscription, listener, AbortController.

### 2. Sinkron dengan state/props

```jsx
useEffect(() => {
  document.title = `Klik: ${count}`;
}, [count]);
```

Semua variabel yang dibaca efek harus ada di dependency array (ESLint `react-hooks/exhaustive-deps` membantumu).

### 3. Membatalkan pekerjaan yang belum selesai

Kalau data bisa datang setelah komponen hilang/unmount — gunakan flag `batal` atau `AbortController` di cleanup agar tidak setState "ke komponen yang sudah tiada".

## Jebakan paling umum

1. **Infinite loop**: `setState` di dalam effect tanpa dependency array, atau men-set state yang jadi dependency-nya sendiri.
2. **Overclocking**: menaruh data turunan ke state + sync via effect. Salah besar — hitung saja saat render:

```jsx
// ❌
const [total, setTotal] = useState(0);
useEffect(() => setTotal(items.reduce(...)), [items]);

// ✅ tanpa effect sama sekali
const total = items.reduce(...);
```

3. **Lupa cleanup** → timer/listener bocor.

## Catatan StrictMode

Di development, `<React.StrictMode>` menjalankan mount → unmount → mount **dua kali** untuk menemukan efek tidak bersih. Kamu akan melihat log dobel — itu normal, bukan bug kode. Produksi hanya sekali.

## Menjalankan

```bash
npm install && npm run dev
```

Wajib: buka Console, lalu main-main dengan bagian 1 (sembunyikan/tampilkan jam) dan 3 (tekan a vs b) untuk "merasakan" kapan efek jalan.

## Latihan

1. Buat stopwatch sungguhan: `useEffect` + `setInterval` + cleanup, tombol mulai/berhenti/reset (state `berjalan` sebagai dependency).
2. Tambahkan efek yang menyimpan `count` ke `localStorage.setItem("count", count)` setiap berubah.
3. Refleksi: pada komponen `Jam`, apa yang terjadi kalau dependency array `[]` dihapus? Coba dan lihat console.

<details>
<summary>Solusi latihan 1</summary>

```jsx
useEffect(() => {
  if (!berjalan) return;
  const id = setInterval(() => setDetik((d) => d + 1), 1000);
  return () => clearInterval(id);
}, [berjalan]);
```
</details>

## Cek pemahaman

- [ ] Saya bisa menjelaskan tiga perilaku dependency array
- [ ] Saya tahu kenapa cleanup wajib dan apa akibatnya kalau lupa
- [ ] Saya tahu bahwa data turunan TIDAK perlu useEffect
- [ ] Saya tidak panik melihat efek berjalan dua kali saat dev

Kalau sudah → lanjut ke [Modul 08 — Custom Hooks](../08-custom-hooks).
