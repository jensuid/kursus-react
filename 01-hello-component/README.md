# Modul 01 — Hello Component

## Kenapa React ada?

Bayangkan kamu membuat halaman dengan vanilla JS: setiap data berubah, kamu harus cari elemen DOM-nya (`document.querySelector`), ubah isinya, tambah/hapus elemen, update hitungan... Manual dan mudah bocor.

React membalik pendekatannya: **kamu hanya mendeskripsikan UI terlihat seperti apa untuk setiap kondisi data**, dan React yang mengurus perubahan DOM-nya. Ini disebut **deklaratif**.

```js
// Imperatif (vanilla): "lakukan langkah-langkah ini"
const el = document.getElementById("judul");
el.textContent = "Halo Budi";
el.classList.add("aktif");

// Deklaratif (React): "UI-nya begini"
<h1 className="aktif">Halo {nama}</h1>
```

## Konsep inti modul ini

### 1. Komponen = fungsi

Sebuah komponen React hanyalah **fungsi JavaScript yang mengembalikan JSX**. Nama selalu diawali huruf besar agar React bisa membedakan `<KartuProfil />` (komponen) dari `<div>` (HTML biasa).

```jsx
function Halo() {
  return <h2>Halo!</h2>;
}
```

### 2. JSX = HTML di dalam JavaScript

- Sisipkan nilai/ekspresi dengan `{ }`: `{nama}`, `{2 + 2}`, `{user.toUpperCase()}`
- Di dalam `{ }` harus **ekspresi** (menghasilkan nilai), bukan statement — tidak boleh `if` atau `for` (pakai ternary dan `.map()`, lihat ES6 04 & 08)
- Atribut khusus JS pakai camelCase: `className`, `htmlFor`, `onClick`
- Tag harus self-closing: `<img />`, `<br />`
- Harus satu elemen akar — bungkus dengan `<div>` atau fragment `<>...</>`

### 3. Props = data masuk (read-only)

Props dikirim dari pemanggil komponen seperti atribut, dan diterima sebagai **satu objek**. Bongkar dengan destructuring:

```jsx
function KartuProfil({ nama, kota }) { ... }

<KartuProfil nama="Sari" kota="Denpasar" />
```

Aturan emas: **komponen tidak boleh mengubah props-nya**. Props mengalir satu arah: parent → child.

### 4. Children = konten sisipan

Apa pun yang ditulis DI ANTARA tag komponen masuk ke `props.children`:

```jsx
<Kotak warna="#ffe9c4">
  <p>Sini jadi children</p>
</Kotak>
```

### 5. Komposisi

UI besar dibangun dari komponen kecil yang disusun seperti LEGO. `App` memanggil komponen, komponen memanggil komponen lagi — membentuk pohon (tree).

## Cara menjalankan

```bash
npm install
npm run dev
```

Buka http://localhost:5173, lalu baca `src/App.jsx` sambil mencocokkan dengan yang tampil di browser.

## Latihan

1. **Buat komponen `KartuBuku({ judul, penulis, tahun })`** yang menampilkan informasi buku dalam sebuah kartu. Panggil 3 kali dengan data berbeda.
2. Tambahkan props `emoji` dengan default value `"📚"` ke `KartuBuku`.
3. Buat komponen `Wrapper` yang menampilkan `children` di dalam kotak bergaris putus-putus. Isi children-nya dengan `KartuBuku`.
4. **Jebakan untuk dipahami:** hapus pembungkus `<div>` di `ContohJSX` sehingga return punya dua tag akar — apa pesan errornya? Perbaiki dengan fragment `<>`.

<details>
<summary>Petunjuk latihan 1</summary>

```jsx
function KartuBuku({ judul, penulis, tahun }) {
  return (
    <div>
      <h3>{judul}</h3>
      <p>{penulis} · {tahun}</p>
    </div>
  );
}
```
</details>

## Cek pemahaman

- [ ] Saya bisa menjelaskan kenapa komponen React adalah "hanya fungsi"
- [ ] Saya tahu bedanya `{nama}` dan `nama` di JSX
- [ ] Saya tahu kenapa props tidak boleh diubah
- [ ] Saya bisa pakai children untuk menyisipkan konten

Kalau sudah → lanjut ke [Modul 02 — Styling](../02-styling).
