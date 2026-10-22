# Kursus React Terstruktur — Dari Nol Sampai Mampu Membuat App Sendiri

[![CI](https://github.com/jensuid/kursus-react/actions/workflows/ci.yml/badge.svg)](https://github.com/jensuid/kursus-react/actions/workflows/ci.yml)

Selamat datang! Ini adalah kursus praktis belajar front-end dengan **React**.
Setiap modul berisi **README penjelasan konsep (bahasa Indonesia)** + **kode yang bisa langsung dijalankan**. Belajar paling efektif: baca → jalankan → modifikasi → kerjakan latihan.

## Prasyarat

- Node.js **v20 atau lebih baru** terpasang (cek dengan `node -v`)
  Angka ini untuk **hub**. Modul 00 (script Node) dan modul 01-10 yang dijalankan
  sendiri masih mendukung **Node 18**, karena hanya memakai Vite + React.
  Hub butuh 20 akibat dua dependensinya: `react-router-dom@7` (`>=20`) dan
  `eslint@10` (`^20.19 || ^22.13 || >=24`). Batas ini dijaga otomatis oleh
  CI di `.github/workflows/ci.yml`.
- Editor kode (VS Code / Qoder / lainnya)
- Pengetahuan HTML & CSS dasar

## Peta Kurikulum

| Modul | Topik | Estimasi |
|-------|-------|----------|
| [00-es6-crash-course](./00-es6-crash-course) | JavaScript modern (ES6): arrow function, destructuring, map/filter, module, async | 2–3 hari |
| [01-hello-component](./01-hello-component) | Apa itu React, JSX, komponen, props, children | 1–2 hari |
| [02-styling](./02-styling) | Styling di React: CSS import, conditional class, inline style | 1 hari |
| [03-events-state](./03-events-state) | Event handling & `useState` — jantungnya React | 2 hari |
| [04-lists-keys](./04-lists-keys) | Rendering list dengan `.map()` dan `key` | 1 hari |
| [05-forms](./05-forms) | Controlled components & form | 1–2 hari |
| [06-lifting-context](./06-lifting-context) | Lifting state up & Context API | 2 hari |
| [07-useeffect](./07-useeffect) | Side effects, dependency array, cleanup | 2 hari |
| [08-custom-hooks](./08-custom-hooks) | Membuat custom hook sendiri | 1–2 hari |
| [09-api-data](./09-api-data) | Fetch data dari API + loading/error state | 2 hari |
| [10-final-project](./10-final-project) | **Todo App** — menggabungkan semua konsep | 3–5 hari |
| [11-next-steps](./11-next-steps.md) | Ke mana selanjutnya: Router, TypeScript, Next.js, deploy | baca saja |

Total: ± 3–4 minggu jika belajar santai 1–2 jam/hari.

## Cara Cepat: Hub (satu app untuk semua modul)

Tidak perlu `cd` ke tiap folder. Ada **app utama (hub)** di root yang memuat
semua modul 01–10 sebagai halaman interaktif dalam satu dev server, plus
menampilkan modul 00 & 11 sebagai bacaan.

```bash
# dari folder react-ui (root)
npm install      # sekali saja
npm run dev      # buka http://localhost:5173
```

Di dalam hub: klik sidebar untuk berpindah modul, dan gunakan tombol **Salin**
untuk menyalur jalur file sumber/README yang ingin kamu buka & edit di editor.

> Metode per-modul di bawah tetap bisa dipakai kalau kamu ingin mengisolasi
> satu modul (misalnya untuk menguji build). Keduanya tidak bentrok.

## Cara Menjalankan Sebuah Modul

Modul 01–10 adalah aplikasi React mandiri berbasis [Vite](https://vitejs.dev):

```bash
cd 01-hello-component   # masuk ke folder modul yang diinginkan
npm install             # sekali saja per modul (mengunduh dependency)
npm run dev             # jalankan dev server → buka http://localhost:5173
```

Edit file di folder `src/` — browser otomatis ter-update (hot reload).

Modul 00 dijalankan langsung dengan Node, tanpa bundler:

```bash
cd 00-es6-crash-course
node 01-let-const-arrow.js
```

## Metode Belajar yang Disarankan

> Langkah demi langkah cara memakai kursus ini (persiapan, hub, urutan modul):
> lihat **[docs/panduan.md](./docs/panduan.md)**.

Untuk tiap modul:

1. **Baca README-nya** sampai paham konsep intinya (tidak harus hafal).
2. **Jalankan kodenya**, lihat hasilnya di browser, dan baca source-nya sambil mencocokkan dengan README.
3. **Modifikasi iseng** — ganti teks, ubah warna, tambah tombol. Lihat apa yang error. Ini cara tercepat memahami.
4. **Kerjakan bagian "Latihan"** di akhir README. Kalau stuck, boleh lihat solusi di spoiler/catatan.
5. Lanjut ke modul berikutnya hanya kalau sudah merasa nyaman — lebih lambat tapi mantap, daripada cepat tapi bolong.

## Struktur Project Ini

```
react-ui/
├── README.md                ← kamu di sini
├── package.json             ← hub (app utama)
├── index.html               ← titik masuk hub
├── src/                     ← sumber hub (sidebar, routing, halaman)
│   ├── main.jsx
│   ├── Hub.jsx
│   ├── modules.js
│   └── pages/
├── 00-es6-crash-course/     ← fondasi JavaScript modern
├── 01-hello-component/      ← mulai React
├── 02-styling/
├── 03-events-state/
├── 04-lists-keys/
├── 05-forms/
├── 06-lifting-context/
├── 07-useeffect/
├── 08-custom-hooks/
├── 09-api-data/
├── 10-final-project/        ← Todo App lengkap
└── 11-next-steps.md         ← panduan lanjutan
```

Setiap modul React punya struktur yang sama:

```
modul-x/
├── README.md         penjelasan konsep
├── index.html        halaman masuk
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx      titik awal aplikasi
    ├── App.jsx       komponen utama
    ├── ...           komponen & CSS per modul
    └── styles.css    gaya global
```

Semangat! Setelah 12 modul ini, kamu akan mampu membangun dan menjelaskan aplikasi React sendiri dari nol. 🚀

---

## Untuk Pengembang / Pengajar

Kalau kamu melanjutkan proyek ini (menambah modul, mengubah hub, menyiapkan CI),
baca **[docs/HANDOFF.md](./docs/HANDOFF.md)** — berisi arsitektur, keputusan teknis,
status verifikasi, hutang teknis, backlog, konvensi kode, dan runbook pemecahan masalah.
