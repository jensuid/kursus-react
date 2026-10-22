# Dokumen Hand-off — Kursus React + Hub Terpadu

> **Untuk:** developer/pengajar yang melanjutkan proyek ini
> **Lokasi:** folder hasil clone (`react-ui/`)
> **Status:** Fitur lengkap & terverifikasi. **Repo publik:** `github.com/jensuid/kursus-react` (branch `main`). Siap dilanjutkan.
> **Baca pertama:** bagian [Mulai Cepat](#mulai-cepat) lalu [Hutang Teknis](#hutang-teknis--kendala-yang-diketahui).

---

## 1. Ringkasan Proyek

Kursus React berbahasa Indonesia terdiri dari **12 modul bertahap** (ES6 → fundamental → state/data → hooks → proyek akhir), dibungkus oleh **satu app utama ("hub")** yang memuat semua modul dalam satu dev server dengan sidebar + routing.

Dua cara memakai proyek ini (keduanya sengaja dipertahankan):

| Model | Untuk siapa | Perintah |
|---|---|---|
| **Hub** (root) | Pembelajar — jelajah semua modul tanpa pindah folder | `npm install && npm run dev` di root |
| **Modul mandiri** | Pengajar — izolate satu modul, uji build sendiri | `cd 03-events-state && npm install && npm run dev` |

Prinsip desain yang **jangan dilanggar** saat mengembangkan:

1. Modul pembelajaran tetap **JavaScript murni** (tanpa TypeScript) agar fokus konsep.
2. Tiap modul berdiri sendiri dan **tidak boleh di-import silang** oleh modul lain.
3. Modul hanya bergantung pada `react` + `react-dom` — **tanpa router/axios/UI-kit**, supaya ringan dan tidak membingungkan pemula. Router hanya hidup di hub.
4. Komentar kode & README memakai **bahasa Indonesia**; penamaan identifier tetap **Inggris**.
5. Yang diajarkan adalah **model mental React**, bukan hafalan API.

---

## 2. Mulai Cepat

```bash
cd react-ui            # folder hasil clone
npm install          # sekali di root (±20 detik)
npm run dev          # http://localhost:5173
```

Verifikasi build produksi:

```bash
npm run build        # harus lolos; hasil di dist/ (abaikan, sudah .gitignore)
```

Jalankan latihan ES6 (tidak lewat browser — ini skrip Node):

```bash
cd 00-es6-crash-course
node 01-let-const-arrow.js
```

Hentikan dev server: `Ctrl + C`.

---

## 3. Arsitektur

### 3.1 Bentuk besar

```
                        ┌──────────────────────────────────┐
   root src/            │  HUB (Vite app di ROOT folder)   │
   ───────────          │  main.jsx → BrowserRouter        │
                        │  Hub.jsx   → sidebar + Routes    │
                        │  modules.js→ registry 12 modul   │
                        └────────┬────────────────┬────────┘
                                 │                │
              ┌──────────────────┴───┐     ┌──────┴───────────────┐
              │ React.lazy (01-10)   │     │ import ?raw (00, 11) │
              │ mount App.jsx modul  │     │ baca teks file asli  │
              └──────────┬───────────┘     └──────────┬───────────┘
                         │                            │
        01-hello-component/src/App.jsx      00-es6-crash-course/*.js
        ...                                 11-next-steps.md
        10-final-project/src/App.jsx
```

### 3.2 Keputusan teknis kunci (dan alasannya)

| Keputusan | Alasan | Kalau diubah, risikonya |
|---|---|---|
| **Hub ditaruh di ROOT**, bukan subfolder | Semua folder modul jadi berada di dalam Vite root sehingga bisa di-import tanpa konfigurasi `server.fs.allow` | Kalau hub dipindah ke subfolder, import `../01-.../src/App.jsx` keluar dari root → Vite dev menolak serve, perlu `server.fs.allow` + path troubleshooting |
| Hub meng-import **`App.jsx` langsung**, bukan `main.jsx` | Menghindari 10× duplikasi `createRoot` dan CSS global rangkap | Import `main.jsx` → tiap modul mencoba `createRoot` ke `#root` yang sama, saling menimpa |
| **`React.lazy` + `Suspense`** per modul | Code-splitting; hub enteng, modul dimuat saat diklik | Static import → 1 bundle raksasa + semua efek modul jalan sekaligus |
| Modul 00/11 via **`?raw`** | Konten selalu sinkron dengan file asli, tanpa salinan | Hardcode string di komponen → isinya cepat basi |
| `hub.css` **menyalin** base styles dari `styles.css` modul | Demo modul mengandalkan elemen mentah (`button`, `input`, `h1`) yang sebelumnya diberi gaya oleh `styles.css` milik modul (yang tidak dimuat hub) | Tanpa salinan ini, semua demo terlihat polos/rusak |
| `StrictMode` dipertahankan di hub | Menjaga perilaku yang sama seperti saat modul belajar `useEffect` (dipanggil 2× di dev) | Efek modul 07/09 berperilaku berbeda dari README |

### 3.3 Inventaris file hub

| File | Tanggung jawab |
|---|---|
| `package.json` | Dep hub (react, react-dom, react-router-dom) + script dev/build/preview |
| `vite.config.js` | Plugin React saja; root = folder ini |
| `index.html` | Entry, `<div id="root">` → `/src/main.jsx` |
| `src/main.jsx` | `createRoot` + `StrictMode` + `BrowserRouter` |
| `src/Hub.jsx` | Layout sidebar (3 grup) + definisi `<Routes>` |
| `src/modules.js` | **Satu-satunya registry modul** — sumber kebenaran untuk sidebar, rute, dan kartu overview |
| `src/hub.css` | Base styles modul + seluruh kelas layout `hub-*` |
| `src/pages/Overview.jsx` | Dashboard kartu semua modul |
| `src/pages/ModulePage.jsx` | Mount demo 01-10 + header + tombol "Salin" jalur file |
| `src/pages/Es6Page.jsx` | Tab per file `.js` modul 00 + isi mentah |
| `src/pages/NextStepsPage.jsx` | Render isi `11-next-steps.md` |

**Aturan penamaan CSS:** semua kelas hub wajib berawalan `hub-` agar tidak menabrak kelas milik modul (`.tombol`, `.keranjang`, dsb).

---

### 3.4 Tooling kualitas kode (ESLint + Prettier)

Dipasang **hanya di root** — folder modul 01-10 tetap bebas dependensi (prinsip no.3 di §1).

| Perintah | Fungsi |
|---|---|
| `npm run lint` | ESLint seluruh repo (exit 0 = bersih) |
| `npm run lint:fix` | Perbaikan otomatis |
| `npm run format` | Prettier write |
| `npm run format:check` | Cek gaya tanpa mengubah |

Versi terpasang: ESLint **10.13.0**, `@eslint/js` 10.0.1, `eslint-plugin-react-hooks` **7.1.1**, `eslint-plugin-react-refresh` 0.5.7, Prettier **3.9.10**, `eslint-config-prettier` 10.1.8, `globals` 17.13.0. Config memakai **flat config** (`eslint.config.js`), bukan `.eslintrc`.

**Status lint saat ini: 0 error, 11 warning.** Semuanya `no-unused-vars` di modul 00 dan memang sah (fixture LATIHAN seperti `anggota`/`data`, dan perbandingan sintaks side-by-side). Jangan "membersihkan" warning ini dengan menghapus variabelnya — itu merusak pelajaran.

#### Keputusan penting: Prettier TIDAK menyentuh materi kursus

`.prettierignore` mengecualikan `00-es6-crash-course/`, semua folder modul `01-*/`–`10-*/`, `docs/`, dan file markdown. Prettier **hanya** memformat infrastruktur hub (`src/**`, `*.config.js`).

Alasannya, dan ini bukan pilihan estetika: banyak file kursus memakai **penyelarasan manual yang merupakan bagian dari materi**. Bukti nyata di `00-es6-crash-course/01-let-const-arrow.js`:

```js
function biasa(x) { return x * 2; }   // fungsi klasik
const expr = function (x) { return x * 2; };  // function expression
const arrow = (x) => { return x * 2; };       // arrow function
const arrowPendek = (x) => x * 2;             // implicit return!
```

Kalau diformat Prettier, tiap baris dipecah jadi 3-4 baris dan komentar penjelasnya **terlepas dari barisnya** — tabel perbandingan yang menjadi inti pelajaran rusak. Karena itu jangan memperlebar cakupan Prettier ke folder modul tanpa alasan yang sangat kuat.

#### Aturan yang sengaja dilonggarkan (dan kenapa)

Di blok `00-es6-crash-course/**` pada `eslint.config.js`:

| Aturan | Setelan | Alasan |
|---|---|---|
| `no-console` | `off` | File ini memang alat bantu cetak/log |
| `no-unused-vars` | `warn` (bukan `error`) | Fixture latihan & perbandingan sintaks sengaja tak dipakai |
| `no-constant-binary-expression` | `off` | Menghukum justru hal yang diajarkan: `0 \|\| 100` dan `null ?? "x"` untuk menunjukkan beda `\|\|` vs `??` |

Kode React (hub + modul) memakai preset `react-hooks.configs.recommended` — yaitu `rules-of-hooks` (error) dan `exhaustive-deps` (warn). **Sengaja tidak** memakai `recommended-latest` yang tersedia di react-hooks 7: preset itu membawa aturan era React Compiler (`purity`, `immutability`, `set-state-in-effect`, `static-components`, `use-memo`) yang akan menyalahi pola ajar yang disengaja dan menenggelamkan pemula dalam pesan yang belum relevan bagi mereka.

### 3.5 CI — `.github/workflows/ci.yml`

Dua job:

| Job | Kapan | Isi |
|---|---|---|
| `hub` | push ke `main`, tiap PR, dispatch tanpa isian | matriks Node **20 / 22 / 24** × (`npm ci` → `lint` → `format:check` → jalankan script Modul 00 → `build`) |
| `probe` | dispatch dengan isian `node_version` | satu versi Node bebas, untuk menguji klaim dukungan. Semua pemeriksaan jalan tanpa berhenti dini; hasilnya jadi tabel di Run Summary. `continue-on-error: true` di level job karena hasilnya informasi, bukan gerbang |

Cara memakai probe: `gh workflow run ci.yml --ref main -f node_version=18`, lalu baca `gh run view <id> --log` (baris `| ... | GAGAL |`) — jangan percaya status hijau job-nya. Probe juga meninggalkan annotation di halaman run (`[warning] \`npm run lint\` gagal pada Node 18`), yang bisa dibaca lewat `gh api repos/jensuid/kursus-react/check-runs/<job_id>/annotations`.

Status terverifikasi (run pertama di `main`): ketiga kaki matriks **lulus** — `Hub (Node 20/22/24)`, `79 modules transformed` pada masing-masing, `OK: 10 script Modul 00 berjalan tanpa error`, job `probe` ter-*skip* sesuai desain. Annotation lint di run hijau berisi 11 warning `no-unused-vars` Modul 00 — persis seperti yang didokumentasikan di §3.4, bukti bahwa lint benar-benar dieksekusi di CI dan tidak hanya lulus karena tidak ada yang diperiksa.

Perubahan yang lahir dari menemukan warning CI, bukan dari niat awal:

- `actions/checkout` dan `actions/setup-node` dinaikkan **v4 → v7**. CI memuntahkan warning bahwa keduanya menargetkan Node 20 dan dipaksa jalan di Node 24. Setelah kenaikan, warning hilang dan matriks tetap hijau (diverifikasi ulang lewat API annotation).
- **Yang perlu diawasi:** ada notice bahwa label `ubuntu-latest` bermigrasi ke Ubuntu 26 mulai 19 Okt 2026. Sengaja tidak meng-*pin* image secara eksplisit — mengikuti `latest` lebih murah perawatan untuk proyek kecil, dan job ini tidak bergantung pada tool sistem khusus. Kalau CI tiba-tiba merah tanpa perubahan kode, cek ini lebih dulu.

Poin yang tidak terlihat dari sekilas baca:

- **`fail-fast: false`** — sengaja, supaya satu versi Node yang gagal tidak menyembunyikan hasil versi lain.
- **`cache-dependency-path: package-lock.json`** — wajib. Repo ini punya **11 lockfile**; tanpa baris itu cache ikut menyeret lockfile modul yang tidak dipakai job ini.
- **`npm ci`, bukan `npm install`** — range `^` di `package.json` membuat `install` bisa naik versi sendiri, sehingga hasil CI tidak bisa diulang. Lihat §4: yang tertulis `^19.1.0` tapi terpasang `19.3.1`.
- **Langkah "Jalankan script Modul 00"** — Modul 00 adalah script Node murni dan **tidak masuk `vite build`**, jadi tanpa langkah ini kerusakannya tak pernah kelihatan. Langkah ini menjalankan seluruh `00-es6-crash-course/*.js` (10 file, termasuk `format.js`/`utils.js`).
- **Batas bawah Node: 20 untuk tooling, tapi kursus tetap jalan di 18** — ini diverifikasi lewat job probe, bukan dari field `engines` saja. Hasil pada Node **18.20.8**: `npm ci` lulus (dengan hujan `npm warn EBADENGINE`), `npm run build` **lulus** (79 modul, 1.06s), hanya `npm run lint` **gagal** dengan `TypeError: util.styleText is not a function` — API itu baru ada di Node ≥20.12, sesuai `engines` ESLint 10. Kesimpulan praktis: pembelajar aman di 18; 20+ dibutuhkan untuk mengembangkan/menjalankan lint. Angka `engines` `react-router-dom` (`>=20`) tidak menjadi penghalang karena router dipakai di browser, dan build-nya lolos.
- **`concurrency` harus menyertakan `github.event_name`** — bukan estetika. Grup yang hanya berisi `ref` membuat `workflow_dispatch` ke `main` dan push ke `main` saling membatalkan (ref-nya sama: `refs/heads/main`); ini benar-benar terjadi dan run push saya berstatus `cancelled` gara-gara probe manual.
- **Jangan pakai `continue-on-error` per langkah kalau hasilnya dibaca lewat API** — dengan opsi itu aktif, API GitHub melapor langkah sebagai `success` walaupun perintahnya gagal. Sinyal hilang, dan saya nyaris menyimpulkan "Node 18 lulus semua" dari situ. Karena itu probe memakai satu langkah yang mengumpulkan hasil sendiri (array `hasil[]`) lalu menulis tabel ke `$GITHUB_STEP_SUMMARY`.
- **Input `workflow_dispatch` disanitasi** lewat step validasi (`grep -Eq '^[0-9]+(\.[0-9]+){0,2}$'`) sebelum dipakai `setup-node`, dan tidak pernah disisipkan langsung ke shell atau `name:` job.

**Yang TIDAK dicakup CI ini** (jangan sampai salah baca sebagai "semua sudah terjaga"):

1. Build mandiri modul 01-10 — masih manual, belum matriks folder.
2. Kebenaran runtime / perilaku aplikasi — belum ada test sama sekali.
3. **Keutuhan materi ajar.** `format:check` juga membaca `.prettierignore`, jadi kalau tabel perbandingan sintaks di Modul 01 rusak atau terformat ulang, **build tetap sukses dan lint tetap hijau**. Kerusakan jenis ini hanya tertangkap jika pemeriksaannya ditulis sendiri (mis. uji yang mengasumsikan `01-let-const-arrow.js` masih memuat baris pembandingnya).

Badge untuk README: `![CI](https://github.com/jensuid/kursus-react/actions/workflows/ci.yml/badge.svg)` — nama file workflow menentukan URL badge ini.

---

## 4. Dependensi & Runtime

Terekam saat verifikasi (root):

| Paket | Range di `package.json` | Versi terpasang |
|---|---|---|
| react | ^19.1.0 | 19.3.1 |
| react-dom | ^19.1.0 | 19.3.1 |
| react-router-dom | ^7.1.1 | 7.18.4 |
| vite | ^6.3.5 | 6.4.5 |
| @vitejs/plugin-react | ^4.4.1 | 4.7.0 |

Runtime teruji: **Node v24.19.0 / npm 11.17.0**. Untuk versi minimum, fakta berasal dari field `engines` paket yang terpasang (bukan dugaan):

| Paket | `engines.node` |
|---|---|
| react-router-dom 7.18.4 | `>=20.0.0` |
| eslint 10.13.0 | `^20.19.0 \|\| ^22.13.0 \|\| >=24` |
| vite 6.4.5 | `^18.0.0 \|\| ^20.0.0 \|\| >=22.0.0` |

Konsekuensinya, **dan sudah diuji nyata lewat job probe** (lihat §3.5): hub butuh Node 20+ **hanya untuk tooling lint**. Di Node **18.20.8**, `npm ci` dan `npm run build` untuk hub tetap lulus (79 modul ter-transform), `npm run lint` yang gagal (`util.styleText is not a function`). Modul 00 dan modul 01-10 mandiri juga aman di 18 (hanya Vite + React; `grep` memastikan tidak ada modul yang bergantung pada router/eslint). README dahulu menulis "Node v18+" tanpa dasar — sekarang sudah dikoreksi berdasarkan fakta ini, dan angka 18 sengaja tidak masuk matriks `hub` karena akan merah permanen di langkah lint.

> Catatan: `@vitejs/plugin-react` **wajib** ada untuk React 19 + Vite 6 (JSX transform). Jangan dihapus saat rapikan dependensi.

### Ukuran disk (penting untuk CI / clone)

Tiap modul punya `node_modules` **sendiri** (±43–47 MB per modul) + root hub (± sama). Total bisa **>500 MB** dan **11 `package-lock.json`** terpisah. Ini konsekuensi sadar dari "modul mandiri", tapi memberatkan. Lihat [Hutang Teknis](#hutang-teknis--kendala-yang-diketahui) opsi A.

---

## 5. Cara Menambah / Mengubah Modul

### 5.1 Menambah modul React baru (mis. `12-reducer`)

1. **Scaffold** — salin kerangka modul yang sudah ada:
   ```bash
   mkdir 12-reducer && cp -r 07-useeffect/{vite.config.js,index.html} 12-reducer/
   mkdir -p 12-reducer/src
   ```
   Lalu buat `12-reducer/package.json` sendiri (ubah `name`), dan isi `src/main.jsx`, `src/App.jsx`, `src/styles.css`.
2. **`App.jsx` wajib default-export** dan hanya pakai **import relatif** ke dalam foldernya:
   ```jsx
   export default function App() { ... }
   ```
   Jangan mengembalikan JSX dari `main.jsx`; hub meng-import `App.jsx`.
3. **Daftarkan** di `src/modules.js`:
   ```js
   {
     num: "12", folder: "12-reducer", title: "useReducer",
     desc: "Reducer untuk state kompleks.", type: "react",
     Component: lazy(() => import("../12-reducer/src/App.jsx")),
   },
   ```
   Sidebar, rute, dan kartu overview **otomatis** muncul — tidak ada file lain yang perlu diubah.
4. **Tulis README** modul (konsep + latihan di bagian akhir).
5. **Verifikasi**: `npm run build` di root, lalu klik modulnya di hub.

### 5.2 Menambah halaman hub non-React (mis. glosarium)

1. Buat `src/pages/GlosariumPage.jsx`.
2. Tambah entri `{ num: "12", type: "md", ... }` di `modules.js`.
3. Tambah `<Route path="/modul/XX" element={<GlosariumPage/>} />` di `Hub.jsx`.

Tipe `es6`/`md` **tidak punya** `Component` — ia di-route manual di `Hub.jsx`. Kalau menambah tipe baru, perhatikan `ModulePage.jsx` yang me-*redirect* tipe non-`react`; tambahkan cabang redirect-nya di sana.

### 5.3 Mengubah isi modul 00 atau 11

Cukup edit file aslinya (`00-es6-crash-course/*.js` atau `11-next-steps.md`). **Hub otomatis menampilkan versi terbaru** karena memakai `?raw` — tidak perlu sinkron manual.

---

## 6. Status Verifikasi (yang sudah dibuktikan)

Diverifikasi pada kondisi saat ini (dev server + browser headless):

| Item | Metode | Hasil |
|---|---|---|
| Build hub | `npm run build` | ✅ 79 modul ter-transform, **0 error**, chunk `App-*.js` terpisah → lazy-loading terbukti |
| Demo 01-10 | Browser, per rute `/modul/01…10` | ✅ Semuanya mount; heading & jumlah elemen cocok (mis. 04: 13 `<li>`, 05: 8 input, 08: 7 tombol + 2 input) |
| Data API nyata | Rute `/modul/09` | ✅ 5 item dari `jsonplaceholder` ter-render |
| Interaksi state | Rute `/modul/10` | ✅ Tambah tugas mengubah daftar **3 → 4** item |
| Modul baca-saja | `/modul/00`, `/modul/11` | ✅ 10 file ES6 + tab, markdown tampil penuh |
| Runtime cleanliness | Console | ✅ **0 error / 0 warning** |
| Latihan ES6 | `node` per file | ✅ 8 file jalan |

Perintah re-verifikasi cepat untuk pengembang berikutnya:

```bash
npm run build
npm run dev
# lalu cek: / , /modul/00 , /modul/10 (tambah tugas) , /modul/09 (data API) , /modul/11
```

---

## 7. Hutang Teknis & Kendala yang Diketahui

Ditulis jujur apa adanya. **H1 dan H2 sudah dibereskan** (lihat kolom Status);
sisanya masih terbuka.

| # | Status | Temuan | Dampak | Saran penanganan |
|---|---|---|---|---|
| H1 | ✅ **Beres** | Dahulu: tidak ada repository Git | — | Repo aktif & **sudah publik** di `github.com/jensuid/kursus-react` (branch `main`, tracking `origin/main`). `.gitignore` terbukti bekerja: remote memuat 148 entri dengan **0 `node_modules` dan 0 `dist`**. Path absolut lokal sudah digeneralisasi dari dokumen sebelum push |
| H2 | ✅ **Beres** | Dahulu: 10 folder `dist/` basi dari build verifikasi lama | — | Sudah dihapus semuanya; 10 folder `src/` modul tetap utuh. Build berikutnya menghasilkan `dist/` baru yang memang boleh diabaikan git |
| H3 | ⬜ Terbuka | **Duplikasi `node_modules` per modul** (±11 salinan, >500 MB) | Clone/install berat | *Opsi A:* jadikan **workspace monorepo** (`npm workspaces` di root) supaya 1 `node_modules`. *Catatan:* mengubah model "modul mandiri", jadi putuskan sadar |
| H4 | ⬜ Terbuka | **Base styles diduplikasi**: `src/hub.css` menyalin isi `styles.css` tiap modul | Ubah gaya global → harus ubah di 11 tempat | Ekstrak `styles.css` ke satu file bersama (mis. `shared/base.css`) yang di-`@import` modul & hub. Perlu sedikit refactor jalur import |
| H5 | ⬜ Terbuka | **Modul 00 tidak bisa dijalankan dari hub** (butuh Node) | Pembelajar harus buka terminal | Opsional: tambah panel "output" yang menjalankan skrip lewat Web Worker/`new Function`, **tapi** hati-hati: `import/export` antar-file tidak jalan tanpa bundler. Nilai edukatif model saat ini justru "ES6 murni = jalan di Node" |
| H6 | ⬜ Terbuka | **Markdown 11 dirender mentah** di `<pre>`, bukan HTML | Kurang nyaman dibaca, heading/code block polos | Tambah renderer ringan (`marked`/`react-markdown`) **hanya di hub** agar modul tetap bebas dependensi |
| H7 | ⬜ Terbuka | **Tombol "Salin" butuh secure context** (`navigator.clipboard`) | Gagal diam-diam saat diakses via HTTP non-localhost/jaringan | Sudah ada `try/catch`, tapi beri fallback `document.execCommand('copy')` atau tampilkan teks saja |
| H8 | 🟡 **Sebagian beres** | Dahulu: tidak ada ESLint/Prettier/CI | Regresi tak terdeteksi | **Sudah ada**: ESLint 10 flat config (§3.4), Prettier 3, CI dengan matriks Node (§3.5). Sisa: **automated testing** (Vitest + React Testing Library) dan perluasan cakupan CI ke build mandiri tiap modul |
| H9 | ✅ **Beres** | Dahulu: `docs/panduan.md` kosong 0 byte | Membingungkan | Sekarang **Panduan Pakai untuk Pembelajar**. Sudah dirapikan dari tempelan chat awal: judul + isi disinkronkan ke model hub, kalimat penutup percakapan dihapus. `docs/plan.md` = snapshot rencana awal (arsip) |
| H10 | ⬜ Terbuka | **Tidak ada `README` untuk hub itu sendiri** di `src/` | Arsitektur hub hanya terdokumentasi di sini | Pertimbangkan `src/README.md` singkat |
| H11 | ⬜ Terbuka | Port dev **5173** dipakai hub; modul mandiri juga 5173 | Tidak bisa menjalankan hub + modul bersamaan tanpa berebut port | Jalankan salah satu, atau `npm run dev -- --port 5180` |

---

## 8. Backlog Pengembangan Lanjutan

Diurutkan dari rasio nilai/tenaga tertinggi.

### near — selesai dalam hitungan jam

- [x] ~~**Bereskan H1 + H2**~~ — **selesai**: repo Git di branch `main`, commit awal `772d5c7`, 10 folder `dist/` basi dihapus.
- [x] ~~**Tambah remote + push**~~ — **selesai**: `origin` = `https://github.com/jensuid/kursus-react` (public), `main` tracking `origin/main`.
- [x] ~~**Bereskan H9**~~ — **selesai**: `docs/panduan.md` jadi Panduan Pakai untuk pembelajar, sudah termasuk bagian hub.
- [x] ~~**ESLint + Prettier (H8)**~~ — **selesai**: lihat §3.4 untuk cara pakai & keputusan cakupannya.
- [x] ~~**CI sederhana**~~ — **selesai**: `.github/workflows/ci.yml` (lihat §3.5). Matriks Node 20/22/24 + probe manual, mencakup lint, `format:check`, eksekusi script Modul 00, dan build hub.
- [ ] **Automated testing**: Vitest + React Testing Library (minimal uji modul 10: tambah/toggle/hapus todo).

### mid — 1–2 hari masing-masing

- [ ] **Render markdown hub (H6)** dengan `react-markdown` + syntax highlight untuk code block.
- [ ] **Ekstrak base CSS (H4)** ke satu sumber bersama.
- [ ] **Pencarian/filter di sidebar**: saring modul berdasarkan judul & deskripsi, plus penanda progres.
- [ ] **Status "dipelajari" per modul** yang disimpan di localStorage (hub-level, `useState` + hook) — pengingat bagi pembelajar sudah sampai mana.
- [ ] **Dua tema (light/dark) untuk hub** — memakai pola Context dari Modul 06, sekaligus jadi contoh nyata Context di app "sesungguhnya".

### later — perlu keputusan desain

- [ ] **Monorepo workspaces (H3)** — hapus duplikasi `node_modules`; putuskan apakah model "modul mandiri" tetap dipertahankan.
- [ ] **KUIS di akhir tiap modul** di hub (soal pilihan ganda per modul), data disimpan di `modules.js`.
- [ ] **Halaman "sandi/penjelasan istilah"** (glosarium) hasil ekstraksi dari semua README.
- [ ] **Deploy hub** ke Vercel/Netlify sebagai situs kursus publik (build statis; modul 00/11 tetap terbaca).
- [ ] **Versi TypeScript paralel** (mis. folder `ts/`) tanpa mengubah jalur belajar JS murni.

---

## 9. Konvensi Kode (wajib diikuti)

- **Komponen**: fungsi + hooks. Tidak ada class component.
- **Penamaan**: file komponen PascalCase (`TodoItem.jsx`), hook diawali `use` (`useFetch.js`, `useLocalStorage.js`), kelas CSS hub berawalan `hub-`.
- **Impor di hub**: pakai jalur **ekstensi lengkap** (`../01-hello-component/src/App.jsx`) agar jelas dan tidak ambigu.
- **State**: jangan pernah ubah objek/array langsung — selalu spread (ini yang diajarkan Modul 03/04; hub pun harus memberi contoh).
- **Komentar**: bahasa Indonesia, menjelaskan *kenapa* bukan *apa*. Setiap modul React diawali blok komentar konsep.
- **README per modul**: konsep → jalankan → ubah → latihan (format yang sudah ada).
- **Jangan** menambah dependensi ke folder modul 01-10.
- **Jangan** menjalankan Prettier pada materi kursus (modul 00-10 & `docs/`). Sebelum `npm run format`, pastikan entri pengecualian di `.prettierignore` masih ada — lihat §3.4.
- Sebelum push: `npm run lint` harus exit 0. Warning `no-unused-vars` di modul 00 adalah normal dan jangan dihapus dengan menghilangkan variabel pelajarannya.

---

## 10. Runbook Troubleshooting

| Gejala | Penyebab paling mungkin | Solusi |
|---|---|---|
| Layar demo modul putih/berhenti di "Memuat modul…" | Gagal memuat chunk lazy; nama folder di `modules.js` tidak cocok | Cek `folder` + jalur `Component:` di `src/modules.js`; pastikan `<folder>/src/App.jsx` ada & ada `export default` |
| Demo tampil tapi **polos tanpa gaya** | `hub.css` tidak terimpor / kelas berubah | Pastikan `src/main.jsx` mengimpor `./hub.css`; cek kelas `button`, `input`, `h1` di `hub.css` |
| Error `fs.allow` / file di luar root saat dev | Ada yang memindah hub ke subfolder | Kembalikan hub ke root, atau tambahkan `server.fs.allow` |
| Sidebar tidak menampilkan modul baru | Modul belum didaftarkan di `modules.js` | Tambah entri (lihat §5.1) — restart dev server |
| Tombol "Salin" tidak menyalin | Bukan secure context (HTTP via IP) | Akses via `localhost`, atau implementasikan fallback H7 |
| Modul 09 tidak menampilkan data | Tidak ada jaringan ke `jsonplaceholder` | Butuh internet; atau ganti URL ke fixture lokal |
| Port 5173 sudah dipakai | Hub + modul jalan bersamaan | `npm run dev -- --port 5180` |
| Build lambat / memory tinggi | Semua modul ikut ter-bundle saat glob `?raw` | Normal (modul 00 kecil); kalau bertambah besar, batasi pola glob |

Log dev server bisa dialihkan: `npm run dev > /tmp/hub-dev.log 2>&1 &`.

---

## 11. Peta Belajar (konteks untuk pengajar)

Urutan kurikulum dan konsep yang ditanam — berguna kalau mau menambah modul agar tidak melompat tingkat:

| Modul | Konsep inti | Titik rawan pembelajar |
|---|---|---|
| 00 | ES6: arrow, destructuring, spread, map/filter/reduce, async | `map` untuk render list; `const` vs `let` |
| 01 | JSX, komponen, props, children | Aturan JSX (`className`, ekspresi `{}`) |
| 02 | Styling: import CSS, conditional class, inline | `className` vs `class` |
| 03 | Event, `useState`, re-render, updater fn | **Paling krusial**: kenapa state tak boleh diubah langsung |
| 04 | `.map()` + `key` | Kenapa `key` bukan indeks |
| 05 | Controlled component, submit | `value` tanpa `onChange` bikin input terkunci |
| 06 | Lifting up, props drilling, Context | Arah data (satu arah ke bawah, callback ke atas) |
| 07 | `useEffect`, dependency array, cleanup | Infinite loop; StrictMode double-invoke |
| 08 | Custom hooks, aturan hooks, `useRef` | Hooks tak boleh di dalam `if`/loop |
| 09 | Fetch async, loading/error/empty | AbortController & cleanup |
| 10 | **Sintesis**: Todo App + localStorage | Merangkai banyak komponen & alur data |
| 11 | Arah lanjutan (Router, TS, Next.js, deploy) | — |

---

## 12. Referensi Silang

- `README.md` (root) — peta kurikulum + cara pakai untuk **pembelajar** (lebih ringkas dari dokumen ini).
- `docs/panduan.md` — langkah demi langkah memakai kursus, untuk **pembelajar**.
- `docs/plan.md` — snapshot rencana awal (arsip; jangan diedit sebagai sumber kebenaran).
- `11-next-steps.md` — kurikulum lanjutan, dirender di rute `/modul/11`.
- Tiap `<modul>/README.md` — teori per modul.
- Laporan visual penyelesaian (canvas): `react-hub-completion-report.canvas.tsx` di direktori canvas Qoder proyek ini.

---

## 13. Ringkasan Satu Paragraf

Proyek ini adalah kursus React 12 modul berbahasa Indonesia yang berjalan di dua mode: hub terpadu di root (Vite + React 19 + React Router 7, semua demo 01-10 dimuat via `React.lazy`, modul 00/11 dibaca via `?raw`) dan modul mandiri per folder. Semua sudah terverifikasi lewat build dan browser dengan 0 error, kini berada di repository Git publik (`main` di `github.com/jensuid/kursus-react`), dan sudah punya ESLint + Prettier + CI bermatriks Node. Yang tersisa bukan fitur, tapi fondasi rekayasa: **belum ada automated testing**, cakupan CI belum menyentuh build mandiri tiap modul, artefak duplikat (base CSS, `node_modules` per modul), dan markdown hub yang masih dirender mentah. Mulai dari backlog *near* di §8.
