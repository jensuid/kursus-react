# Modul 02 — Styling di React

Ada tiga cara memberi gaya pada komponen, dan semua dipakai di dunia nyata — kamu perlu tahu kapan memakai masing-masing.

## 1. File CSS biasa + `className` (paling umum)

Tulis CSS seperti biasa di file terpisah, lalu impor di komponen:

```jsx
import "./Tombol.css";

<button className="tombol tombol-primary">Kirim</button>
```

Perhatikan: di JSX atributnya `className`, bukan `class` (karena `class` adalah kata kunci JS).

`:hover`, animasi, media query — semuanya **tetap di file CSS**, bukan di JS.

## 2. Conditional class (class yang tergantung kondisi)

Gaya berbeda untuk kondisi berbeda — biasanya lewat template literal atau ternary:

```jsx
const kelas = `tombol tombol-${variant}`;
<div className={ganjil ? "baris baris-ganjil" : "baris"}>
```

Ini adalah fondasi dari semua UI dinamis: tab aktif, baris terpilih, tombol disabled, badge error. Di project besar orang pakai library `clsx`, tapi intinya sama saja.

## 3. Inline style (objek JS)

`style` menerima **objek JavaScript**, bukan string CSS:

```jsx
<div style={{ width: `${persen}%`, backgroundColor: warna }} />
```

- Nama properti jadi camelCase: `background-color` → `backgroundColor`
- Angka satuan px boleh langsung: `padding: 12`
- Tidak bisa `:hover` atau media query di sini

**Kapan pakai inline?** Hanya untuk nilai yang baru diketahui saat render — lebar progress bar dari data, warna dari input user, posisi dari koordinat. Sisanya lebih baik class.

## Aturan tidak tertulis (best practice)

1. Gaya statis → class di file CSS
2. Gaya tergantung kondisi → conditional class
3. Gaya dengan nilai dinamis dari data → inline style
4. CSS global (font, reset) → taruh di satu file yang diimpor `main.jsx`

## Menjalankan

```bash
npm install && npm run dev
```

Baca `src/App.jsx` dan `src/Tombol.css` berdampingan dengan halaman yang tampil.

## Latihan

1. Tambahkan varian `tombol-success` di `Tombol.css`, lalu pakai di App.
2. Modifikasi `Baris` agar baris ke-2 mendapat class `baris-selected` (background biru muda, teks putih).
3. Buat komponen `LabelStatus({ aktif })` yang menampilkan dot hijau (aktif) atau abu-abu (tidak) — pakai conditional class ATAU inline style, coba dua-duanya.
4. Refleksi: kenapa `width: ${persen}%` pada progress bar tidak bisa dibuat sebagai class statis?

## Cek pemahaman

- [ ] Saya tahu bedanya `class` dan `className` dan kenapa
- [ ] Saya bisa membuat class yang berubah tergantung props
- [ ] Saya tahu kapan inline style tepat dipakai (nilai dinamis)

Kalau sudah → lanjut ke [Modul 03 — Events & State](../03-events-state), modul paling penting di seluruh kursus ini.
