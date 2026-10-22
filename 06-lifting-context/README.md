# Modul 06 — Lifting State Up & Context API

## Masalah yang dipecahkan modul ini

Beberapa komponen butuh **data yang sama**. Pertanyaannya hanya satu: *state ini harus hidup di mana?*

## A. Lifting state up — jawaban default

Kalau dua komponen saudara butuh data sama, **angkat state ke parent terdekat** mereka:

```
        App (punya state `total`)
       / | \
  Penambah Pengurang Penampil   ← semua cuma props + callback
```

- Data turun lewat **props**
- Aksi naik lewat **callback** (props berupa fungsi: `onTambah={(n) => setTotal(...)}`)

Ini pola paling sering kamu tulis seumur hidup sebagai React developer. Anak tidak "memiliki" data — parent yang memiliki.

### Aturan penempatan state

1. Mulai: state di komponen paling dalam yang memakainya
2. Saat komponen lain mulai membutuhkannya: angkat ke parent bersama
3. Jangan angkat lebih tinggi dari yang perlu

## B. Props drilling — efek samping yang menyakitkan

Data harus dilewatkan **setiap level** di pohon, walau banyak perantara tidak memakainya sama sekali:

```jsx
<Layout tema={tema}>      // Layout tidak peduli dengan tema...
  <Sidebar tema={tema}>   // Sidebar cuma meneruskan...
    <Menu tema={tema}>    // ...terus sampai
      <ItemMenu tema={tema} />  // yang MEMANG butuh
```

Untuk 2–3 level tidak masalah. Untuk 8 level + rename field = neraka.

## C. Context API — lift tanpa drill

Tiga langkah:

```jsx
// 1. Buat (file terpisah)
const ThemeContext = createContext(null);

// 2. Sediakan di atas (biasanya komponen Provider yang menyimpan state)
<ThemeContext.Provider value={{ tema, ganti }}>
  {children}
</ThemeContext.Provider>

// 3. Ambil di anak sedalam apa pun — tanpa perantara
const { tema, ganti } = useContext(ThemeContext);
```

Pola terbaik: bungkus dalam custom hook (`useTema()`) supaya semua pemanggil dapat pesan error yang jelas kalau lupa Provider.

### Kapan Context TEPAT

- tema, bahasa, user login, permissions — jarang berubah, dipakai di mana-mana
- **Tidak** untuk data yang sering berubah atau state halaman spesifik → itu ranah state management (Redux/Zustand) atau cukup lifting biasa

### Peringatan performa

Semua konsumen context rerender saat `value` berubah. Untuk aplikasi belajar: tidak masalah. Untuk aplikasi besar: pecah context per domain.

## Menjalankan

```bash
npm install && npm run dev
```

Bandingkan bagian B dan C: hasilnya sama, tapi jumlah props yang lewat berbeda drastis. Buka file `src/ThemeContext.js` juga — konvensi memisahkan context ke file sendiri.

## Latihan

1. Tambahkan tombol "reset" di `DemoLifting` — siapa yang menerima callback `onReset`?
2. Buat `UserContext` sederhana: sediakan `{ nama, login, logout }`, tampilkan di header dan tombol logout di footer (dua cabang jauh dari pohon).
3. Refleksi: komponen mana di bagian C yang TIDAK butuh context sama sekali? Apakah dia ikut menerima props `tema` sekarang?

## Cek pemahaman

- [ ] Saya bisa menjelaskan ke mana mengangkat state dan kenapa
- [ ] Saya tahu apa itu props drilling dan gejalanya
- [ ] Saya bisa membuat Context + Provider + hook pengambil
- [ ] Saya tahu kapan Context bukan alat yang tepat

Kalau sudah → lanjut ke [Modul 07 — useEffect](../07-useeffect).
