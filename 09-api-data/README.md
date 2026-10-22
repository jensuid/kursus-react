# Modul 09 — API & Data

## Mengambil data = side effect

Data dari internet tidak langsung ada. Kamu harus: (1) panggil API di `useEffect`, (2) simpan hasilnya di state, (3) handle **tiga keadaan**: `loading`, `error`, `data`. Ini pola paling fundamental di aplikasi React nyata.

```jsx
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  let aktif = true;
  fetch(url)
    .then((r) => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
    .then((json) => aktif && setData(json))
    .catch((e) => aktif && setError(e))
    .finally(() => aktif && setLoading(false));
  return () => { aktif = false; };
}, [url]);
```

## Empat hal yang WAJIB diurus

1. **Loading** — tampilkan spinner/skeleton sebelum data datang
2. **Error** — cek `response.ok`; `fetch` TIDAK menolak promise untuk HTTP 400/500
3. **Pembatalan** — gunakan flag `aktif` atau `AbortController` agar tidak setState ke komponen yang sudah unmount (lihat Modul 07)
4. **Empty** — data kosong ≠ error; beri tampilan "tidak ada data"

## Dari manual → custom hook

Bagian A (manual) sengaja dibuat berantakan — begitu kamu paham setiap barisnya, kita ringkas jadi `useFetch(url)` (file `useFetch.js`) sehingga komponen tinggal:

```jsx
const { data, loading, error } = useFetch(`${API}/posts`);
if (loading) return <p>Memuat…</p>;
if (error) return <p>{error.message}</p>;
return <ul>{data.map((d) => <li key={d.id}>{d.title}</li>)}</ul>;
```

Ini ilustrasi terbaik **kenapa custom hook ada** (Modul 08): komponen kembali fokus ke tampilan, logika data "dilempar" ke hook.

## Mengirim data (POST)

```jsx
await fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(data),
});
```

Simpan status (`idle/sending/ok/error`) di state agar tombol bisa disabled dan pesan bisa muncul.

## Refetch manual

Trik: `useFetch` refetch saat `url` berubah. Untuk "muat ulang" data yang sama, tambahkan query `?_nonce=${n}` dan naikkan `n`.

## Catatan production

Di aplikasi besar, orang pakai **React Query / SWR / TanStack Query** — ia menyelesaikan caching, retry, dedup, invalidation yang tidak bisa diselesaikan `useFetch` sederhana. Tapi konsepnya sama persis dengan modul ini: kamu kuasai fondasinya dulu. `fetch`/axios hanyalah mekanisme; `loading/error/data` adalah mental modelnya.

## API demo

`https://jsonplaceholder.typicode.com` — API gratis untuk latihan (posts, users, todos, comments). Endpoint `/posts/:id/comments`, `/users`, `/todos?_limit=10` menarik dijelajahi.

## Menjalankan

```bash
npm install && npm run dev
```

Buka tab **Network** di DevTools saat halaman loading — lihat request nyata muncul dan kembali.

## Latihan

1. Di `useFetch`, tambahkan dukungan `options` (method, body) agar bisa dipakai untuk POST juga.
2. Ambil `/users` dan tampilkan sebagai daftar kartu (nama, email, website).
3. Tampilkan message error yang bisa di-klik "coba lagi" saat fetch gagal (matikan WiFi untuk mengetes).

## Cek pemahaman

- [ ] Saya tahu kenapa fetch harus di dalam useEffect
- [ ] Saya selalu handle loading, error, data
- [ ] Saya tahu `response.ok` dan kenapa perlu dicek manual
- [ ] Saya paham custom hook menyembunyikan kerumitan dari komponen

Kalau sudah → saatnya **[Modul 10 — Proyek Akhir](../10-final-project)**! 🎯
