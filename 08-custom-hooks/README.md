# Modul 08 — Custom Hooks

## Kenapa custom hook ada?

Sampai sekarang kamu memakai hook bawaan (`useState`, `useEffect`). Tapi perhatikan: logika "state + aksi" yang sama sering **berulang** di banyak komponen (counter, form, fetch, localStorage…). Daripada copy-paste, bungkus jadi **custom hook** — fungsi biasa yang namanya diawali `use` dan boleh memanggil hook lain.

```js
// hooks.js
export function useCounter(nilaiAwal = 0) {
  const [count, setCount] = useState(nilaiAwal);
  return {
    count,
    naik: () => setCount((c) => c + 1),
    reset: () => setCount(nilaiAwal),
  };
}

// komponen mana pun:
const { count, naik, reset } = useCounter(0);
```

## Dua hal yang bikin hook ≠ fungsi utilitas biasa

1. **Tiap pemanggil dapat state sendiri.** Dua komponen yang sama-sama `useCounter()` tidak saling mengganggu — React memberi "slot" terpisah untuk tiap tempat hook dipanggil.
2. **Hook boleh memanggil hook lain.** Custom hook adalah komposisi: `useLocalStorage` = `useState` + `useEffect`, selesai. Tidak ada kode ajaib.

## Konvensi yang bikin kode rapi

- File: `src/hooks.js` atau folder `src/hooks/` (satu hook per file untuk hook besar)
- Nama selalu `useXxx` — bukan gaya penamaan, tapi **sinyal ke manusia dan ESLint** bahwa ada hook di dalamnya
- Return array `[nilai, setNilai]` untuk hook "mirip useState"; return objek `{a, b, c}` bila aksinya banyak

## Aturan hooks (lagi, karena penting)

- Hanya dipanggil di **level teratas** fungsi komponen atau hook lain
- **Jangan** di dalam `if`, `for`, fungsi bersarang, callback
- Alasan: React melacak state hook berdasarkan **urutan** — urutan berubah = state kacau
- Plugin ESLint `react-hooks/rules-of-hooks` menegakkan ini otomatis

## useRef sekilas

`useRef` = kotak penyimpanan (`.current`) yang **tidak memicu render** saat berubah. Berguna untuk: id timer, menyimpan nilai antar render, dan menunjuk elemen DOM (focus, scroll). Detail tidak wajib sekarang — yang penting tahu ia "kakaknya useState tanpa rerender".

## Menjalankan

```bash
npm install && npm run dev
```

Eksperimen wajib: di bagian 2, ketik nama lalu **refresh browser** — datanya masih ada. Buka DevTools → Application → Local Storage → lihat kuncinya.

## Latihan

1. Buat `useDebounce(value, delay)` — mengembalikan nilai yang tertunda `delay` ms (petunjuk: `useState` + `useEffect` + `setTimeout` + cleanup).
2. Buat `useToggle()` yang mengembalikan `[nilai, toggle]`.
3. Refactor salah satu counter buatanmu di modul 03 agar memakai `useCounter`.

<details>
<summary>Solusi useDebounce</summary>

```js
export function useDebounce(nilai, delay = 500) {
  const [terdebu, setTerdebu] = useState(nilai);
  useEffect(() => {
    const t = setTimeout(() => setTerdebu(nilai), delay);
    return () => clearTimeout(t);
  }, [nilai, delay]);
  return terdebu;
}
```
</details>

## Cek pemahaman

- [ ] Saya bisa menjelaskan kenapa custom hook berbagi logika tanpa berbagi state
- [ ] Saya hafal dua aturan pemanggilan hook
- [ ] Saya tahu kapan pakai `useRef` vs `useState`

Kalau sudah → lanjut ke [Modul 09 — API & Data](../09-api-data).
