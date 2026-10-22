# Modul 04 — Lists & Keys

## 1. Render daftar = `.map()` biasa

React tidak punya syntax khusus untuk list. Kamu hanya memetakan data menjadi elemen:

```jsx
<ul>
  {users.map((u) => (
    <li key={u.id}>{u.nama}</li>
  ))}
</ul>
```

Ingat ES6 04: `.map()` mengembalikan array baru — React bisa merender array elemen langsung.

## 2. `key` — identitas tiap baris

`key` adalah props khusus yang membantu React mencocokkan item lama dan baru antar render. Fungsinya: update DOM seefisien mungkin dan **menjaga state internal tiap baris tetap di tempatnya**.

### Aturan key

- **Harus unik** di antara saudara sekandang (sibling)
- **Harus stabil** — jangan pakai `Math.random()`!
- Pakai `id` dari data bila ada; pakai `indeks` HANYA jika list tidak pernah diurut/ditambah/dihapus dari tengah

Kalau key salah, gejalanya aneh: state checkbox "melompat", animasi kacau, input tertukar. Demo `DemoKey` di App.jsx memperlihatkan ini secara langsung — **wajib dicoba!**

## 3. Pecah baris menjadi komponen

Satu baris list yang punya tampilan + logika sendiri layak jadi komponen:

```jsx
{kontak.map((k) => (
  <ItemKontak key={k.id} kontak={k} onSelect={pilih} />
))}
```

Perhatikan `key` diberikan di TEMPAT PEMAKAIAN (file induk), bukan di dalam komponen anak.

## 4. Pola CRUD list yang wajib lancar

```js
// TAMBAH
setList([...list, itemBaru]);

// HAPUS
setList(list.filter((x) => x.id !== id));

// UBAH SATU ITEM
setList(list.map((x) => (x.id === id ? { ...x, field: nilaiBaru } : x)));
```

Tiga baris ini menangani 80% logika list di aplikasi React mana pun.

## 5. Empty state

Jangan lupa tampilan saat list kosong — user bingung melihat ruang hampa:

```jsx
{list.length === 0 && <p>Belum ada data.</p>}
```

## Menjalankan & eksperimen

```bash
npm install && npm run dev
```

Eksperimen wajib: di bagian 3, centang "Mangga", hapus "Apel" dengan key=indeks tercentang-off, lalu bandingkan dengan key=id.

## Latihan

1. Tambahkan fitur **edit nama** pada `KelolaKontak` (klik dua kali pada nama → input).
2. Tambahkan tombol "⬆ naikkan" yang memindahkan item satu posisi lebih atas (petunjuk: slice & concat, atau splice pada salinan).
3. Urutkan list secara alfabetis menggunakan `.sort()` — hati-hati: `sort()` itu mutatif! (Petunjuk: salin dulu: `[...list].sort(...)`.)

<details>
<summary>Solusi latihan 3</summary>

```jsx
const urut = [...kontak].sort((a, b) => a.nama.localeCompare(b.nama));
```
</details>

## Cek pemahaman

- [ ] Saya bisa merender list objek dengan map + key yang benar
- [ ] Saya tahu kenapa key tidak boleh `Math.random()` dan kapan indeks boleh dipakai
- [ ] Saya hafal 3 pola CRUD (tambah/hapus/ubah)
- [ ] Saya tahu di mana menaruh `key` saat item list berupa komponen

Kalau sudah → lanjut ke [Modul 05 — Forms](../05-forms).
