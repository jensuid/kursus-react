# Modul 00 — Crash Course JavaScript Modern (ES6)

Sebelum menyentuh React, kuasai dulu fitur JavaScript yang **pasti** kamu pakai di setiap baris kode React. Modul ini tanpa browser — cukup Node.

## Cara Pakai

Jalankan tiap file urut nomornya:

```bash
node 01-let-const-arrow.js
node 02-destructuring-default.js
# ... dst
```

Baca komentar sambil melihat output di terminal. Kerjakan bagian **LATIHAN** di tiap file (tambahkan kode di bawah, atau buat file `latihan-01.js` sendiri).

## Daftar Pelajaran

| File | Isi | Kenapa penting untuk React |
|------|-----|----------------------------|
| `01-let-const-arrow.js` | const/let, template literal, arrow function | Komponen = arrow function; handler event |
| `02-destructuring-default.js` | Bongkar objek/array, default params | Menerima props, hasil useState & useContext |
| `03-spread-rest.js` | Spread `...` dan rest | Update state tanpa mutasi |
| `04-map-filter-reduce.js` | The Big Three | Render list, filter, statistik |
| `05-optional-nullish.js` | `?.` dan `??` | Data API yang belum lengkap |
| `06-modules.js` (+ `utils.js`, `format.js`) | import/export | Pecah komponen jadi banyak file |
| `07-promise-async.js` | Promise, async/await | Fetch data di useEffect |
| `08-misc.js` | Ternary, `&&`, ekspresi vs statement | Conditional rendering |

## Target Setelah Modul Ini

Kamu harus bisa menjawab tanpa berpikir:

1. Apa bedanya `const` dan `let`, dan kenapa React hampir selalu `const`?
2. Tuliskan arrow function satu baris yang menerima `name` dan mengembalikan sapaan.
3. Dari array `users`, ambil nama yang aktif: apa hasilnya `users.filter(u => u.aktif).map(u => u.nama)`?
4. Bagaimana menyalin objek `form` lalu mengubah satu field tanpa menyentuh `form` asli?
5. Kapan pakai `??` dan kapan pakai `||`?
6. Apa yang dikembalikan fungsi `async`?

Kalau semua bisa → lanjut ke [Modul 01](../01-hello-component).
