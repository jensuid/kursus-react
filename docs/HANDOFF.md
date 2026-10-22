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
npm run dev          # http://localhost:5200   (hub; modul mandiri tetap 5173)
```

Verifikasi build produksi + seluruh pemeriksaan kualitas kode:

```bash
npm run build        # harus lolos; hasil di dist/ (abaikan, sudah .gitignore)
npm run lint         # exit 0 (11 warning modul 00 memang sah, lihat §3.4)
npm run test         # 53 uji, lihat §3.6
npm run format:check # gaya kode infra (materi ajar sengaja dikecualikan)
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
| **Gaya global hanya ada di `styles/base.css`**, di-`@import` oleh `src/hub.css` dan tiap `<modul>/src/styles.css` | Menutup duplikasi lama (H4): isi yang sama dahulu disalin di 11 tempat. Ubah gaya global sekarang cukup satu file | Kalau sebuah modul kehilangan impor itu, **build tetap sukses dan lint tetap hijau** -- hanya tampilannya yang hancur. Karena itu dijaga ganda: `tests/struktur-modul.test.js` + langkah CI "Pastikan gaya dasar ikut ter-bundle" |
| **Hub di port 5200 dengan `strictPort: true`** | Modul mandiri memakai 5173; tanpa pemisahan ini keduanya tidak bisa hidup berbarengan (H11) | `strictPort` bukan hiasan: tanpanya Vite diam-diam pindah ke 5201 dan semua tautan di dokumentasi jadi salah. Terbukti: instance kedua keluar dengan "Port 5200 is already in use", bukan menempati 5201 |
| **react-markdown + remark-gfm hanya di hub**, halaman 11 dimuat malas | H6: markdown terbaca sebagai HTML, dan prinsip no.3 tetap utuh (folder modul tidak ikut bertambah dependensi) | Sebagai import statis, 164 KB pipeline markdown masuk chunk `index.js` dan dibayar setiap pengunjung hub (terukur: entry 474 KB -> 309 KB setelah dimuat malas) |
| `StrictMode` dipertahankan di hub | Menjaga perilaku yang sama seperti saat modul belajar `useEffect` (dipanggil 2× di dev) | Efek modul 07/09 berperilaku berbeda dari README |

### 3.3 Inventaris file hub

| File | Tanggung jawab |
|---|---|
| `package.json` | Dep hub (react, react-dom, react-router-dom, react-markdown, remark-gfm) + devDep tooling (ESLint, Prettier, Vitest, jsdom, Testing Library) + script dev/build/preview/lint/format/test |
| `vite.config.js` | Plugin React; `server.port 5200` + `strictPort`; blok `test:` milik Vitest (jsdom, setup, `include: tests/**`) |
| `index.html` | Entry, `<div id="root">` → `/src/main.jsx` |
| `styles/base.css` | **Satu-satunya sumber gaya global** (body, `#root` 760px, h1/h2, button, input, code) — diimpor hub + kesepuluh modul (H4) |
| `src/main.jsx` | `createRoot` + `StrictMode` + `BrowserRouter` |
| `src/Hub.jsx` | Layout sidebar (3 grup) + definisi `<Routes>`; halaman 11 diimpor **malas** di sini |
| `src/modules.js` | **Satu-satunya registry modul** — sumber kebenaran untuk sidebar, rute, dan kartu overview |
| `src/hub.css` | Base styles **tidak** ada di sini (diimpor dari `../styles/base.css`, lalu `#root` ditimpa); sisanya kelas layout `hub-*` + `.hub-md` untuk markdown |
| `src/copyText.js` | Penyalinan teks + fallback `execCommand` untuk konteks non-HTTPS (H7) |
| `src/pages/Overview.jsx` | Dashboard kartu semua modul |
| `src/pages/ModulePage.jsx` | Mount demo 01-10 + header + tombol "Salin" (3 status: diam / tersalin / gagal) |
| `src/pages/Es6Page.jsx` | Tab per file `.js` modul 00 + isi mentah |
| `src/pages/NextStepsPage.jsx` | Render isi `11-next-steps.md` dengan react-markdown; heading markdown **diturunkan satu tingkat** supaya halaman tidak berakhir punya dua `<h1>` |
| `src/test/setup.js` | Matcher jest-dom + `cleanup()` + `localStorage.clear()` tiap uji, hanya bila DOM tersedia |
| `src/README.md` | Peta file hub untuk pengembang/pengajar (H10) |
| `tests/*.test.{js,jsx}` | 6 berkas, 53 uji — rinciannya di §3.6 |

**Aturan penamaan CSS:** semua kelas hub wajib berawalan `hub-` agar tidak menabrak kelas milik modul (`.tombol`, `.keranjang`, dsb). Pengecualian yang disengaja: penimpa `#root` di `src/hub.css` (selektor elemen, bukan kelas) dan gaya element-selector di `styles/base.css` yang memang dipakai bersama.

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

Cakupan lint: hub (`src/**`), modul (`*-*/src/**`), skrip Modul 00, **dan `tests/**`** sejak uji otomatis ditambahkan. Blok `tests/**` di `eslint.config.js` tidak opsional — tanpa itu berkas uji tidak cocok dengan blok mana pun dan ESLint diam-diam tidak memeriksa isinya. Ini diuji dengan probe: berkas `tests/__probe.jsx` berisi variabel tak-defined harus menghasilkan `error` + exit 1 (sudah terbukti begitu; kalau tidak, berarti cakupan hilang).

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

Empat job:

| Job | Kapan | Isi |
|---|---|---|
| `hub` | push ke `main`, tiap PR, dispatch tanpa isian | matriks Node **22 / 24** × (`npm ci` → `lint` → `format:check` → `test` → jalankan script Modul 00 → `build`) |
| `isi-matriks` | sama seperti `hub` | membaca folder `NN-*/` yang punya `vite.config.js` dari disk, menghasilkan JSON untuk matriks di bawah. Gagal kalau jumlah folder < 10 (matriks yang menyusut diam-diam = nol pekerjaan yang tampak sukses) |
| `modul` | sama seperti `hub`, jalan setelah `isi-matriks` | **satu job per folder modul 01-10** (Node 22): `npm ci` dengan lockfile folder itu sendiri → `vite build` → periksa `dist/assets/*.css` benar-benar memuat gaya dasar dari `styles/base.css` |
| `probe` | dispatch dengan isian `node_version` | satu versi Node bebas, untuk menguji klaim dukungan. Semua pemeriksaan (`npm ci`, lint, format, **test**, build) jalan tanpa berhenti dini; hasilnya jadi tabel di Run Summary. `continue-on-error: true` di level job karena hasilnya informasi, bukan gerbang |

Angka bawah matriks (`22`) bermula dari `engines` paket yang terpasang: vitest 5 `^22.12.0 \|\| ^24.0.0 \|\| >=26.0.0` dan jsdom 30 `^22.22.2 \|\| ^24.15.0 \|\| >=26.0.0`. Node 20 tadinya masuk matriks; ia keluar begitu langkah uji ditambahkan, karena yang diuji bukan lagi cuma aplikasi tapi juga tooling ujinya. Angka itu tidak berhenti sebagai pembacaan `engines` -- tabel probe A/B di bawah mengukurnya langsung.

Cara memakai probe: `gh workflow run ci.yml --ref main -f node_version=18`, lalu baca `gh run view <id> --log` (baris `| ... | GAGAL |`) — jangan percaya status hijau job-nya. Probe juga meninggalkan annotation di halaman run (`[warning] \`npm run lint\` gagal pada Node 18`), yang bisa dibaca lewat `gh api repos/jensuid/kursus-react/check-runs/<job_id>/annotations`.

Status terverifikasi pada **run terbaru `main`** (`e93d3a9`, run `39739605225`): **14 job = 13 hijau + 1 `probe` ter-*skip*** sesuai desain. Rinciannya, diambil dari log run, bukan dari harapan (kolom `Isi` di tabel di atas boleh dibaca sebagai hasil, bukan desain lagi):

- `Hub (Node 22)` dan `Hub (Node 24)` lulus, masing-masing dengan langkah `Uji (Vitest)` yang benar-benar memeriksa: `Test Files 6 passed (6)` + `Tests 53 passed (53)` di kedua kaki.
- `Ambil daftar folder modul` mengeluarkan `Matriks yang dipakai: ["01-hello-component",…,"10-final-project"]` -- sepuluh entri hasil baca disk.
- Kesepuluh job `Build <modul>` lulus. Langkah penjaga gaya dasar melaporkan ukuran CSS yang ter-bundle: **666 - 2173 byte** (terbesar `10-final-project` karena punya gaya sendiri; 666 byte adalah modul yang hanya memakai gaya dasar). Angka ini sekaligus bukti bahwa yang dibaca benar isi `dist/assets/*.css`, bukan sekadar keberadaan file.
- Annotation lint di run hijau tetap berisi 11 warning `no-unused-vars` Modul 00 -- persis seperti §3.4, bukti bahwa lint dieksekusi dan tidak lulus karena tidak ada yang diperiksa.

Run sebelumnya (`6919705`, ketika matriks masih 20/22/24 dan job `modul`/langkah uji belum ada) juga hijau: `79 modules transformed` per kaki, `OK: 10 script Modul 00 berjalan tanpa error`, job `probe` ter-*skip*.

Probe A/B yang menutup klaim batas versi uji (`node_version=20` lalu `node_version=22`, job yang sama, tabel yang sama):

| Node | `npm ci` | lint | format | **test** | build | Isi langkah uji |
|---|---|---|---|---|---|---|
| 20.20.2 (npm 10.8.2) | lulus | lulus | lulus | **GAGAL** | lulus | `Test Files 2 passed (2)`: `struktur-modul` + `hygiene` (26 uji) lulus; empat berkas ber-DOM **tidak pernah mulai** -- `[vitest-pool]: Failed to start forks worker`, penyebab `TypeError: Cannot read properties of undefined (reading 'bind')` di `undici/lib/interceptor/decompress.js:78` |
| 22.23.3 (npm 10.9.9) | lulus | lulus | lulus | lulus | lulus | `Test Files 6 passed (6)`, `Tests 53 passed (53)` |

Dua hal yang mengubah cara membaca tabel di atas:

- Kegagalan di Node 20 **bukan** penolakan `engines` yang rapi, tapi crash di dalam undici. Vitest bahkan mencetak "This might cause false positive tests" -- dan memang begitu: `26 passed` itu nyata, tapi cuma separuh dari suite. Jadi angka "passes" pada versi di luar dukungan tidak bisa dibaca sebagai "sisanya aman".
- Job probe `continue-on-error`, sehingga run Node 20 tetap **berwarna hijau** walau `npm run test` GAGAL. Kesimpulan batas versi harus dibaca dari baris tabel di log (`| npm run test | GAGAL |`), bukan dari status run -- ini pengulangan peringatan di bullet `continue-on-error` beberapa baris di bawah, karena kesalahan membacanya hampir terulang dua kali.

Bentuk ini tidak rapuh: push dokumen saja berikutnya (`ebfcb97`, run `39742007767`) menghasilkan 14 job yang sama dengan hasil sama (13 lulus, `probe` ter-*skip*). Kalau nanti berubah merah tanpa ada yang menyentuh CI, curiga pada image runner atau dependensi lebih dulu, bukan pada struktur file ini.

Perubahan yang lahir dari menemukan warning CI, bukan dari niat awal:

- `actions/checkout` dan `actions/setup-node` dinaikkan **v4 → v7**. CI memuntahkan warning bahwa keduanya menargetkan Node 20 dan dipaksa jalan di Node 24. Setelah kenaikan, warning hilang dan matriks tetap hijau (diverifikasi ulang lewat API annotation).
- **Yang perlu diawasi:** ada notice bahwa label `ubuntu-latest` bermigrasi ke Ubuntu 26 mulai 19 Okt 2026. Sengaja tidak meng-*pin* image secara eksplisit — mengikuti `latest` lebih murah perawatan untuk proyek kecil, dan job ini tidak bergantung pada tool sistem khusus. Kalau CI tiba-tiba merah tanpa perubahan kode, cek ini lebih dulu.

Poin yang tidak terlihat dari sekilas baca:

- **`fail-fast: false`** — sengaja, supaya satu versi Node yang gagal tidak menyembunyikan hasil versi lain.
- **`cache-dependency-path: package-lock.json`** — wajib. Repo ini punya **11 lockfile**; tanpa baris itu cache ikut menyeret lockfile modul yang tidak dipakai job ini.
- **`npm ci`, bukan `npm install`** — range `^` di `package.json` membuat `install` bisa naik versi sendiri, sehingga hasil CI tidak bisa diulang. Lihat §4: yang tertulis `^19.1.0` tapi terpasang `19.3.1`.
- **Langkah "Jalankan script Modul 00"** — Modul 00 adalah script Node murni dan **tidak masuk `vite build`**, jadi tanpa langkah ini kerusakannya tak pernah kelihatan. Langkah ini menjalankan seluruh `00-es6-crash-course/*.js` (10 file, termasuk `format.js`/`utils.js`).
- **Batas bawah Node bertingkat: 18 untuk belajar, 20 untuk lint, 22 untuk uji** — semuanya diverifikasi lewat job probe (§3.5), bukan cuma dari field `engines`. Hasil pada Node **18.20.8**: `npm ci` lulus (dengan hujan `npm warn EBADENGINE`), `npm run build` **lulus** (79 modul, 1.06s), hanya `npm run lint` **gagal** dengan `TypeError: util.styleText is not a function` — API itu baru ada di Node ≥20.12, sesuai `engines` ESLint 10. Pada Node **20.20.2**, lint sudah lulus tapi `npm run test` **gagal** (empat berkas uji DOM tidak sempat mulai). Kesimpulan praktis: pembelajar aman di 18; 20+ dibutuhkan untuk mengembangkan/menjalankan lint; 22+ kalau ingin menjalankan suite uji. Angka `engines` `react-router-dom` (`>=20`) tidak menjadi penghalang karena router dipakai di browser, dan build-nya lolos.
- **`concurrency` harus menyertakan `github.event_name`** — bukan estetika. Grup yang hanya berisi `ref` membuat `workflow_dispatch` ke `main` dan push ke `main` saling membatalkan (ref-nya sama: `refs/heads/main`); ini benar-benar terjadi dan run push saya berstatus `cancelled` gara-gara probe manual.
- **Jangan pakai `continue-on-error` per langkah kalau hasilnya dibaca lewat API** — dengan opsi itu aktif, API GitHub melapor langkah sebagai `success` walaupun perintahnya gagal. Sinyal hilang, dan saya nyaris menyimpulkan "Node 18 lulus semua" dari situ. Karena itu probe memakai satu langkah yang mengumpulkan hasil sendiri (array `hasil[]`) lalu menulis tabel ke `$GITHUB_STEP_SUMMARY`.
- **Input `workflow_dispatch` disanitasi** lewat step validasi (`grep -Eq '^[0-9]+(\.[0-9]+){0,2}$'`) sebelum dipakai `setup-node`, dan tidak pernah disisipkan langsung ke shell atau `name:` job.

**Yang TIDAK dicakup CI ini** (jangan sampai salah baca sebagai "semua sudah terjaga"):

Dahulu ada tiga celah di daftar ini. Dua sudah tertutup — build mandiri per folder (job `modul`) dan keutuhan materi ajar (`tests/hygiene.test.js`, jalan di langkah `test`) — sehingga yang tersisa:

1. **Perilaku hanya Modul 10 yang diuji.** Hub (sidebar, routing, tombol Salin di halaman sungguhan) dan modul 01-09 belum punya uji perilaku; yang terjaga baru struktur + keutuhan materi. Tambah uji per fitur, jangan klaim "semua perilaku teruji".
2. **Tampilan sungguhan.** Yang diperiksa adalah ADA-nya aturan CSS di `dist`, bukan bahwa halaman terlihat benar. Regresi visual (kontras, tumpukan, overflow) masih butuh mata manusia / browser.
3. **Kompatibilitas versi kecil modul.** Job `modul` cuma pakai Node 22; ia membuktikan "folder ini bisa di-build sendiri", bukan "di semua versi Node". Matriks Node x matriks folder = 30 job, tidak sepadan untuk proyek ini.
4. **Deploy/preview.** Tidak ada job yang menaikkan hub ke Vercel/Netlify; `dist/` hanya dibuang di runner.

Badge untuk README: `![CI](https://github.com/jensuid/kursus-react/actions/workflows/ci.yml/badge.svg)` — nama file workflow menentukan URL badge ini.

### 3.6 Uji otomatis — Vitest + React Testing Library

```bash
npm run test        # sekali jalan (dipakai CI)
npm run test:watch  # mode jalan terus saat develop
```

Konfigurasinya menumpang di `vite.config.js` (kunci `test:`), BUKAN berkas
`vitest.config.js` sendiri: dengan begitu plugin React yang sama dipakai, jadi
JSX di berkas uji bisa dijalankan tanpa satu pun pengaturan tambahan.

| Berkas | Uji | Yang dijaga |
|---|---|---|
| `tests/todo-app.test.jsx` | 12 | Perilaku Modul 10: tambah / toggle / hapus / filter / localStorage. Ini jawaban untuk backlog "uji Todo App" |
| `tests/next-steps.test.jsx` | 5 | H6: markdown jadi HTML nyata, jumlah blok kode sama dengan jumlah baris pembuka pagar di file sumber, dan **tepat satu `h1`** |
| `tests/copyText.test.js` | 5 | H7: jalur clipboard modern, fallback `execCommand`, dan saat keduanya gagal |
| `tests/module-registry.test.js` | 5 | `src/modules.js`: 12 entri, nomor unik 00-11, hanya entri `react` yang punya komponen malas |
| `tests/struktur-modul.test.js` | 8 | Hubungan registry ↔ disk, rantai `@import` base.css, hub `#root` override, halaman 11 harus tetap malas |
| `tests/hygiene.test.js` | 18 | Yang tidak bisa dijaga lint/build: Prettier tidak menyentuh materi ajar, inti pelajaran Modul 00 masih utuh, tidak ada huruf CJK terselip |

Tiga kebiasaan yang membuat uji ini bernilai, dan yang harus dipertahankan
kalau ada yang menambah berkas uji baru:

- **Cari lewat peran & label, bukan class.** Komponen sudah punya `aria-label`,
  jadi `getByLabelText("tandai selesai")` dipakai alih-alih `.todo-item:nth-child(2)`.
  Uji yang menempel pada class akan merah setiap kali gaya diubah, padahal
  perilakunya tidak berubah.
- **Setiap uji baru harus terbukti bisa gagal.** Uji Todo lolos pada percobaan
  pertama — itu alasan untuk curiga, bukan puas. Mutasi nyata dicoba:
  `selesai: !t.selesai` dihapus dan `hapus` diubah jadi no-op → tepat 4 uji
  toggle/hapus jadi merah, lalu dikembalikan. Catatan metodologis: mutasi
  pertama yang saya coba (`!==` jadi `!=` pada id string) **tidak mengubah
  perilaku sama sekali** — itu bukan mutasi, jadi lolos dari uji bukan berarti
  ujinya benar.
- **Kontrol negatif untuk setiap penjaga berbasis "diabaikan/tidak ada".**
  `tests/hygiene.test.js` tidak hanya menguji bahwa folder materi ajar
  diabaikan Prettier, tapi juga bahwa `src/pages/ModulePage.jsx` TIDAK
  diabaikan. Tanpa yang kedua, seseorang bisa menulis `*` di `.prettierignore`
  dan semua uji tetap hijau tanpa melindungi apa pun.

Jebakan yang benar-benar ditemukan (bukan teoritis): `setupFiles` dijalankan
untuk **semua** berkas uji, termasuk yang `// @vitest-environment node`, dan di
lingkungan Node tidak ada `localStorage` — 25 uji langsung mati dengan
`ReferenceError: localStorage is not defined`. `src/test/setup.js` kini
menjaga bagiannya dengan `typeof window !== "undefined"`. Berkas uji node
(`hygiene`, `struktur-modul`) memakai docblock itu karena mereka membaca disk,
bukan DOM: jsdom tidak dibutuhkan dan pembuatannya mahal (terukur: jsdom
menyumbang ±60% durasi `npm run test`).

---

## 4. Dependensi & Runtime

Terekam saat verifikasi (root):

| Paket | Range di `package.json` | Versi terpasang |
|---|---|---|
| react | ^19.1.0 | 19.3.1 |
| react-dom | ^19.1.0 | 19.3.1 |
| react-router-dom | ^7.1.1 | 7.18.4 |
| react-markdown | ^10.1.0 | 10.1.0 |
| remark-gfm | ^4.0.1 | 4.0.1 |
| vite | ^6.3.5 | 6.4.5 |
| @vitejs/plugin-react | ^4.4.1 | 4.7.0 |
| vitest (dev) | ^5.0.5 | 5.0.5 |
| jsdom (dev) | ^30.1.3 | 30.1.3 |
| @testing-library/react (dev) | ^16.3.3 | 16.3.3 |

`react-markdown` + `remark-gfm` adalah **dependency hub saja** dan tidak boleh
pindah ke folder modul (prinsip no.3 §1). Keduanya menyumbang 164 KB chunk
`NextStepsPage-*.js` — itu alasan halaman 11 diimpor malas (§3.2).

Runtime teruji: **Node v24.19.0 / npm 11.17.0**. Untuk versi minimum, fakta berasal dari field `engines` paket yang terpasang (bukan dugaan):

| Paket | `engines.node` |
|---|---|
| react-router-dom 7.18.4 | `>=20.0.0` |
| eslint 10.13.0 | `^20.19.0 \|\| ^22.13.0 \|\| >=24` |
| vite 6.4.5 | `^18.0.0 \|\| ^20.0.0 \|\| >=22.0.0` |
| vitest 5.0.5 | `^22.12.0 \|\| ^24.0.0 \|\| >=26.0.0` |
| jsdom 30.1.3 | `^22.22.2 \|\| ^24.15.0 \|\| >=26.0.0` |

Konsekuensinya, **dan sudah diuji nyata lewat job probe** (lihat §3.5): hub butuh Node 20+ **hanya untuk tooling lint**, dan 22+ untuk menjalankan `npm run test`. Klaim yang kedua tidak berhenti di tabel `engines` di atas — ia diukur: probe `node_version=20` memberi `npm run test` **GAGAL** pada Node 20.20.2 (empat berkas uji ber-DOM tidak sempat memulai worker), sedangkan probe `node_version=22` memberi kelima pemeriksaan lulus dengan `Tests 53 passed (53)` pada Node 22.23.3. Di Node **18.20.8**, `npm ci` dan `npm run build` untuk hub tetap lulus (79 modul ter-transform), `npm run lint` yang gagal (`util.styleText is not a function`). Modul 00 dan modul 01-10 mandiri juga aman di 18 (hanya Vite + React; `grep` memastikan tidak ada modul yang bergantung pada router/eslint). README dahulu menulis "Node v18+" tanpa dasar — sekarang sudah dikoreksi berdasarkan fakta ini. Angka 18 dan 20 sengaja tidak masuk matriks `hub`: yang pertama merah permanen di langkah lint, yang kedua di langkah uji — dan keduanya sudah dibuktikan dengan probe, bukan asumsi.

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
   Baris **pertama** `src/styles.css` wajib: `@import "../../styles/base.css";` — hanya
   aturan khusus modul yang ditulis di bawahnya (H4, §7).
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
5. **Verifikasi**: `npm run test` (registry & rantai CSS ikut diperiksa), `npm run build` di root, lalu klik modulnya di hub. CI akan langsung ikut membangun folder baru itu tanpa perlu menyunting `.github/workflows/ci.yml` — daftarnya dibaca dari disk oleh job `isi-matriks` (§3.5).

### 5.2 Menambah halaman hub non-React (mis. glosarium)

1. Buat `src/pages/GlosariumPage.jsx`.
2. Tambah entri `{ num: "12", type: "md", ... }` di `modules.js`.
3. Tambah `<Route path="/modul/XX" element={<GlosariumPage/>} />` di `Hub.jsx`.

Tipe `es6`/`md` **tidak punya** `Component` — ia di-route manual di `Hub.jsx`. Kalau menambah tipe baru, perhatikan `ModulePage.jsx` yang me-*redirect* tipe non-`react`; tambahkan cabang redirect-nya di sana.

### 5.3 Mengubah isi modul 00 atau 11

Cukup edit file aslinya (`00-es6-crash-course/*.js` atau `11-next-steps.md`). **Hub otomatis menampilkan versi terbaru** karena memakai `?raw` — tidak perlu sinkron manual.

---

## 6. Status Verifikasi (yang sudah dibuktikan)

Diverifikasi pada kondisi saat ini (dev server + browser headless + uji otomatis):

| Item | Metode | Hasil |
|---|---|---|
| Build hub | `npm run build` | ✅ 336 modul ter-transform, **0 error**, chunk `App-*.js` + `NextStepsPage-*.js` terpisah → lazy-loading terbukti |
| Demo 01-10 | Browser, per rute `/modul/01…10` | ✅ Semuanya mount; heading & jumlah elemen cocok (mis. 04: 13 `<li>`, 05: 8 input, 08: 7 tombol + 2 input) |
| Data API nyata | Rute `/modul/09` | ✅ 5 item dari `jsonplaceholder` ter-render |
| Interaksi state | Rute `/modul/10` | ✅ Tambah tugas mengubah daftar **3 → 4** item — kini juga dijaga 12 uji perilaku (§3.6) |
| Markdown 11 ter-render | Browser di `/modul/11` + uji | ✅ Heading, list, dan blok kode nyata; nol sisa tanda pagar di teks. Setelah heading diturunkan: tepat 1 `h1` (header hub), 1 `h2` (judul file), 10 `h3` (bab), dan 8 `pre` latar gelap — persis separuh dari 16 baris pembuka blok kode di `11-next-steps.md` |
| Gaya bersama (H4) | `curl` dev server modul + `dist` build mandiri | ✅ Modul 05 berdiri sendiri menghasilkan CSS berisi `system-ui` (dari base.css) **dan** `.sukses` (miliknya); dev hub juga meng-inline base.css + `#root { max-width: none }` |
| Port hub (H11) | Dua kali `npm run dev` di root | ✅ Yang pertama di **5200**, yang kedua mati dengan "Port 5200 is already in use" dan tidak menggeser ke 5201 |
| Tombol Salin (H7) | Browser di `/modul/05` | ✅ Berubah jadi "Tersalin!" lalu kembali sendiri; 0 error console |
| Modul baca-saja | `/modul/00`, `/modul/11` | ✅ 10 file ES6 + tab, halaman 11 terbaca sebagai HTML |
| Runtime cleanliness | Console | ✅ **0 error / 0 warning** |
| Latihan ES6 | `node` per file | ✅ 8 bab + `format.js`/`utils.js` jalan (CI menjalankan semuanya) |
| Uji otomatis | `npm run test` | ✅ **53 uji pada 6 berkas**; penjaga uji pernah dibuktikan bisa gagal lewat mutasi (§3.6) |
| CI bentuk sekarang | `gh run view 39739605225 --json jobs` | ✅ **14 job: 13 lulus + `probe` ter-*skip*** — dua kaki `hub` (Node 22/24) dengan langkah uji, `isi-matriks` menghasilkan 10 folder dari disk, 10 job `Build <modul>` lulus dengan CSS 666-2173 byte |
| Batas versi uji | job probe A/B (`node_version=20` vs `22`) | ✅ Node 20.20.2: `npm run test` **GAGAL** (26 uji node-only lulus, 4 berkas DOM mati); Node 22.23.3: **53 lulus**. Rinciannya di §3.5 |

Perintah re-verifikasi cepat untuk pengembang berikutnya:

```bash
npm run lint && npm run test && npm run build
npm run dev            # hub di http://localhost:5200
# lalu cek: / , /modul/00 , /modul/05 (tombol Salin) , /modul/10 (tambah tugas) , /modul/11 (markdown)
cd 05-forms && npm run dev && npm run build   # modul mandiri tetap hidup sendiri
```

---

## 7. Hutang Teknis & Kendala yang Diketahui

Ditulis jujur apa adanya. **H1-H2 dan H4/H6/H7/H9/H10/H11 sudah dibereskan;**
H3 dan H5 ditutup sebagai **won't-fix yang disengaja** (alasan di §7.1);
satu-satunya yang masih benar-benar terbuka adalah H3 kalau pemilik mengubah
keputusan model "modul mandiri".

| # | Status | Temuan | Dampak | Saran penanganan |
|---|---|---|---|---|
| H1 | ✅ **Beres** | Dahulu: tidak ada repository Git | — | Repo aktif & **sudah publik** di `github.com/jensuid/kursus-react` (branch `main`, tracking `origin/main`). `.gitignore` terbukti bekerja: remote memuat 148 entri dengan **0 `node_modules` dan 0 `dist`**. Path absolut lokal sudah digeneralisasi dari dokumen sebelum push |
| H2 | ✅ **Beres** | Dahulu: 10 folder `dist/` basi dari build verifikasi lama | — | Sudah dihapus semuanya; 10 folder `src/` modul tetap utuh. Build berikutnya menghasilkan `dist/` baru yang memang boleh diabaikan git |
| H3 | 🟨 **Won't-fix (sadar)** | **Duplikasi `node_modules` per modul** (±11 salinan, >500 MB) | Clone/install berat di mesin lokal | Tidak dikerjakan; alasan & pemicu tinjau ulang di §7.1. Opsi A tetap tertulis di situ kalau keputusan diubah |
| H4 | ✅ **Beres** | Dahulu: base styles diduplikasi — `src/hub.css` menyalin isi `styles.css` tiap modul | Ubah gaya global harus dilakukan di 11 tempat | Sekarang: satu `styles/base.css`, di-`@import` oleh 10 modul + `src/hub.css` (yang lalu menimpa `#root`). Modul tinggal berisi aturan khusus (05: `.sukses`; 08: `.keranjang`; 09: `.grid-card`/`.card`). Terbukti jalan di **tiga jalur**: dev server modul (CSS ter-inline berisi `system-ui`), build mandiri Modul 05 (`dist` memuat `.sukses`), dan dev hub (`#root: none` tetap ada). Dijaga `tests/struktur-modul.test.js` + langkah CI |
| H5 | 🟨 **Won't-fix (sadar)** | **Modul 00 tidak bisa dijalankan dari hub** (butuh Node) | Pembelajar harus buka terminal | Tidak dikerjakan; alasan & jalan keluar murah kalau terpaksa di §7.1 |
| H6 | ✅ **Beres** | Dahulu: markdown 11 dirender mentah di `<pre>` | Sulit dibaca | Sekarang `react-markdown` + `remark-gfm` (hanya di hub), GFM aktif, gaya lewat blok `.hub-md`. Heading markdown **turun satu tingkat** karena verifikasi browser menemukan halaman punya dua `<h1>` (header hub + judul file). Dijaga `tests/next-steps.test.jsx` |
| H7 | ✅ **Beres** | Dahulu: tombol "Salin" butuh secure context dan menelan kegagalan diam-diam | Gagal tanpa kabar lewat HTTP non-localhost | Sekarang `src/copyText.js`: clipboard modern → fallback `textarea` + `execCommand` → status **tiga keadaan** di tombol (`Salin` / `Tersalin!` / `Gagal menyalin`, dengan `aria-live`). Dijaga `tests/copyText.test.js` (5 uji, termasuk jalur tanpa clipboard) |
| H8 | ✅ **Beres** | Dahulu: tidak ada ESLint/Prettier/CI/test | Regresi tak terdeteksi | **Sudah lengkap**: ESLint 10 flat config + cakupan `tests/**` (§3.4), Prettier 3, CI empat job dengan matriks Node + matriks folder modul (§3.5), dan 53 uji otomatis (§3.6) |
| H9 | ✅ **Beres** | Dahulu: `docs/panduan.md` kosong 0 byte | Membingungkan | Sekarang **Panduan Pakai untuk Pembelajar**. Sudah dirapikan dari tempelan chat awal: judul + isi disinkronkan ke model hub, kalimat penutup percakapan dihapus. `docs/plan.md` = snapshot rencana awal (arsip) |
| H10 | ✅ **Beres** | Dahulu: tidak ada README untuk hub itu sendiri | Arsitektur hub hanya terdokumentasi di dokumen ini | Sekarang `src/README.md`: peta file + dua keputusan yang mudah salah paham (hub meng-import `App.jsx` bukan `main.jsx`; demo dimuat malas). Tautan dua arah sudah dipasang dari/ke §12 dokumen ini |
| H11 | ✅ **Beres** | Dahulu: port dev **5173** dipakai hub dan modul mandiri bersamaan | Tidak bisa menjalankan keduanya barengan | Hub kini di **5200** dengan `strictPort: true`; modul tetap 5173. Terbukti: instance hub kedua mati dengan "Port 5200 is already in use" dan **tidak** diam-diam pindah ke 5201 |

### 7.1 Dua keputusan won't-fix (H3 dan H5)

Keduanya **bukan** "nanti kalau sempat". Tulisannya di sini supaya yang
melanjutkan proyek ini tidak mengiranya lupa.

**H3 — `node_modules` ganda, TIDAK dijadikan npm workspaces.**

- Yang dikorbankan: ±500 MB disk dan satu `npm install` per folder modul.
- Yang dilindungi: prinsip no.2/no.3 di §1. Folder modul harus bisa disalin,
  dibagikan di kelas, atau dibuka sendiri tanpa memahami apa pun tentang root.
  Workspaces akan mengubahnya jadi "potongan repo": `cd 05-forms && npm install`
  berhenti menjadi cerita yang benar, dan `npm i` di folder anak akan mulai
  menulis ke `node_modules` milik root.
- Kenapa tidak mendesak: CI sekarang justru **memakai** keterpisahan itu (job
  `modul` meng-install lockfile masing-masing folder), jadi duplikasi bukan
  cuma harga yang dibayar pembelajar tapi juga bukti bahwa modul benar-benar
  mandiri.
- **Pemicu untuk meninjau ulang:** jumlah modul naik jauh (mis. > 20) sampai
  waktu install jadi keluhan nyata, ATAU ada fitur baru yang butuh dependensi
  sama di banyak modul (mis. semua modul pakai router). Angka teknis saja tidak
  cukup untuk membuka kerja ini -- yang berubah adalah model "modul mandiri",
  jadi ini keputusan kurikulum, bukan keputusan refactor.

**H5 — Modul 00 TETAP dijalankan di terminal, tidak di browser.**

- Yang diminta: tombol "jalankan" untuk skrip ES6 di dalam hub.
- Kenapa tidak: skrip itu memakai `import`/`export` antar-file. Menjalankannya
  di browser butuh transpiler + loader modul di sisi klien (`new Function`
  tidak memuat modul, Web Worker pun tidak) -- hasilnya separuh solusi yang
  mengajarkan model palsu bahwa "ES6 = JavaScript browser". Padahal pelajaran
  intinya justru "ES6 murni jalan di Node, tanpa bundler".
- Nilai yang dipertahankan: pembelajar memisahkan "alat jalankan" (Node) dari
  "alat lihat" (browser) sejak Modul 00 -- pemisahan yang nanti mereka butuhkan
  saat menyentuh bundler/Vite di Modul 01.
- **Kalau suatu saat tetap dibutuhkan**, jangan tulis runner sendiri: tautkan
  file ke playground eksternal (StackBlitz/CodeSandbox sudah memuat Node ESM)
  atau tambah tombol "salin perintah jalan". Itu perubahan kecil di `Es6Page.jsx`
  tanpa menambah dependency baru di folder modul.

---

## 8. Backlog Pengembangan Lanjutan

Diurutkan dari rasio nilai/tenaga tertinggi.

### near — selesai dalam hitungan jam

- [x] ~~**Bereskan H1 + H2**~~ — **selesai**: repo Git di branch `main`, commit awal `772d5c7`, 10 folder `dist/` basi dihapus.
- [x] ~~**Tambah remote + push**~~ — **selesai**: `origin` = `https://github.com/jensuid/kursus-react` (public), `main` tracking `origin/main`.
- [x] ~~**Bereskan H9**~~ — **selesai**: `docs/panduan.md` jadi Panduan Pakai untuk pembelajar, sudah termasuk bagian hub.
- [x] ~~**ESLint + Prettier (H8)**~~ — **selesai**: lihat §3.4 untuk cara pakai & keputusan cakupannya.
- [x] ~~**CI sederhana**~~ — **selesai**: `.github/workflows/ci.yml` (lihat §3.5). Matriks Node + probe manual, mencakup lint, `format:check`, eksekusi script Modul 00, dan build hub.
- [x] ~~**Automated testing**~~ — **selesai**: Vitest 5 + React Testing Library, 6 berkas / 53 uji, mutasi-terbukti (lihat §3.6). Minimal yang diminta (Modul 10: tambah/toggle/hapus) sudah ada, plus penjaga struktur & materi ajar.
- [x] ~~**Perluasan cakupan CI ke build mandiri tiap modul**~~ — **selesai**: job `isi-matriks` + `modul` (§3.5). Daftar folder dibaca dari disk, jadi modul baru tidak bisa lolos tanpa ikut diperiksa.

### mid — 1–2 hari masing-masing

- [x] ~~**Render markdown hub (H6)** dengan `react-markdown`~~ — **selesai**: lihat §3.2 dan `tests/next-steps.test.jsx`. Catatan: syntax highlight untuk code block **tidak** dipasang -- butuh `rehype-highlight`/`shiki` (bertambah besar) dan materi Modul 11 tidak menuntutnya.
- [x] ~~**Ekstrak base CSS (H4)**~~ — **selesai**: `styles/base.css` diimpor 10 modul + hub. Verifikasi tiga jalur (dev modul / build modul / dev hub) lihat §7.
- [ ] **Pencarian/filter di sidebar**: saring modul berdasarkan judul & deskripsi, plus penanda progres.
- [ ] **Status "dipelajari" per modul** yang disimpan di localStorage (hub-level, `useState` + hook) — pengingat bagi pembelajar sudah sampai mana.
- [ ] **Dua tema (light/dark) untuk hub** — memakai pola Context dari Modul 06, sekaligus jadi contoh nyata Context di app "sesungguhnya".

### later — perlu keputusan desain

- [x] ~~**Monorepo workspaces (H3)**~~ — **DITOLAK sadar**, bukan ditunda: lihat §7.1 untuk alasan dan pemicu yang membuat keputusan ini boleh dibuka lagi.
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
- **Gaya global hanya di `styles/base.css`.** Modul dan hub mengimpornya; jangan menyalin ulang aturan `body`/`button`/`input` ke dalam `styles.css` modul (dijaga `tests/struktur-modul.test.js`). Kalau butuh gaya global baru, taruh di sana dan cek **dua** sisi: hub menimpa `#root`, jadi perubahan di luar `#root` lebih aman daripada perubahan yang menyentuh lebar/padding.
- **Uji otomatis ikut konvensi bahasa**: komentar & nama uji dalam bahasa Indonesia, identifier kode tetap Inggris. Setiap penjaga baru perlu kontrol negatif (§3.6).
- **Jangan** menjalankan Prettier pada materi kursus (modul 00-10 & `docs/`). Sebelum `npm run format`, pastikan entri pengecualian di `.prettierignore` masih ada — lihat §3.4.
- Sebelum push: `npm run lint` harus exit 0. Warning `no-unused-vars` di modul 00 adalah normal dan jangan dihapus dengan menghilangkan variabel pelajarannya.

---

## 10. Runbook Troubleshooting

| Gejala | Penyebab paling mungkin | Solusi |
|---|---|---|
| Layar demo modul putih/berhenti di "Memuat modul…" | Gagal memuat chunk lazy; nama folder di `modules.js` tidak cocok | Cek `folder` + jalur `Component:` di `src/modules.js`; pastikan `<folder>/src/App.jsx` ada & ada `export default` |
| Demo modul 01-10 di hub **polos tanpa gaya** | Impor `styles/base.css` terputus (H4) | `src/hub.css` harus tetap punya `@import "../styles/base.css"` dan penimpa `#root { max-width: none }`; uji `npm run test -- struktur` |
| Demo **modul berdiri sendiri** polos, padahal di hub rapi | `@import "../../styles/base.css"` di modul hilang atau jalurnya berubah | Pulihkan baris impor itu (dua tingkat ke atas, bukan satu); `npm run test -- struktur` menangkap ini |
| Error `fs.allow` / file di luar root saat dev | Ada yang memindah hub ke subfolder | Kembalikan hub ke root, atau tambahkan `server.fs.allow`. Catatan terukur: modul mandiri yang mengimpor `../../styles/base.css` TIDAK butuh `fs.allow` -- Vite root-nya adalah root repo (ada `.git` + lockfile di situ) dan CSS `@import` di-inline saat transform, bukan dilayani sebagai URL `/@fs/` terpisah |
| Sidebar tidak menampilkan modul baru | Modul belum didaftarkan di `modules.js` | Tambah entri (lihat §5.1) — restart dev server. Uji `npm run test -- struktur` sudah menangkap ini dari sisi lain (folder di disk tapi tidak terdaftar) |
| Job `modul` CI hilang sebagian / matriks kosong | `isi-matriks` tidak menemukan folder `NN-*/vite.config.js` | Itu memang sengaja gagal (`exit 1` kalau < 10). Cek pola penamaan folder; jangan turunkan angka batasnya tanpa mengurangi modul |
| Tombol "Salin" berbunyi **"Gagal menyalin"** | Bukan secure context DAN `document.execCommand('copy')` juga ditolak browser | Akses via `localhost`/HTTPS, atau seleksi + salin manual. Sekarang ada kabarnya, tidak lagi diam-diam (H7) |
| `npm run test` mati dengan `ReferenceError: localStorage is not defined` | Berkas uji baru berlingkungan `node` (docblock) tapi bagian `afterEach` di setup mengira ada DOM | Jangan hapus penjaganya; `src/test/setup.js` memakai `typeof window !== "undefined"` justru untuk ini |
| `npm run test` hanya menampilkan 2 berkas lulus (26 uji) lalu "Failed to start forks worker" | Node di bawah 22: undici (dipakai jsdom) crash waktu worker dimuat, jadi berkas ber-DOM tidak pernah berjalan. Pernah diukur nyata: Node 20.20.2 gagal, 22.23.3 lulus 53 | Naikkan Node ke 22+ (`nvm use 22`). Jangan baca `26 passed` sebagai "sisanya aman" -- empat berkas lainnya tidak pernah berjalan |
| Modul 09 tidak menampilkan data | Tidak ada jaringan ke `jsonplaceholder` | Butuh internet; atau ganti URL ke fixture lokal |
| Hub menolak start: `Port 5200 is already in use` | Instance hub lain masih jalan, atau port 5200 dipakai proses lain | Matikan yang lama (`pkill -f vite` saat develops lokal). `strictPort` sengaja: tanpanya hub pindah ke 5201 dan tautan di dokumentasi jadi salah (H11) |
| Modul mandiri + hub bersamaan | — | Sudah aman: hub 5200, modul 5173. Dua modul mandiri bersamaan tetap berebut 5173 → `npm run dev -- --port 5180` |
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
- `src/README.md` — peta file & dua keputusan hub yang mudah salah paham, untuk **pengembang** (H10).
- `styles/base.css` — satu-satunya sumber gaya global (H4); header file itu menjelaskan kenapa `#root` diperlakukan beda di hub.
- `tests/` — 6 berkas uji (§3.6). `npm run test` adalah gerbang tercepat sebelum push.
- `docs/plan.md` — snapshot rencana awal (arsip; jangan diedit sebagai sumber kebenaran).
- `11-next-steps.md` — kurikulum lanjutan, dirender sebagai HTML di rute `/modul/11`.
- Tiap `<modul>/README.md` — teori per modul.
- Laporan visual penyelesaian (canvas): `react-hub-completion-report.canvas.tsx` di direktori canvas Qoder proyek ini.

---

## 13. Ringkasan Satu Paragraf

Proyek ini adalah kursus React 12 modul berbahasa Indonesia yang berjalan di dua mode: hub terpadu di root (Vite + React 19 + React Router 7 + react-markdown, semua demo 01-10 dimuat via `React.lazy`, modul 00/11 dibaca via `?raw`, port 5200) dan modul mandiri per folder (port 5173). Semua terverifikasi lewat build, browser, dan **53 uji otomatis**, di repository Git publik dengan CI empat job yang hijau di `main` (terakhir: 14 job, 13 lulus + probe ter-*skip*): matriks Node, probe versi, sepuluh build modul mandiri, dan pemeriksaan gaya dasar di `dist`. Hutang teknis yang terdaftar di §7 sudah tertutup semua: yang tersisa bukan pekerjaan tertunda, tapi **keputusan yang sengaja diambil** (H3 dan H5 won't-fix, §7.1; Prettier tidak menyentuh materi ajar, §3.4) dan fitur baru di backlog §8 yang nilainya pedagogis, bukan rekayasa. Mulailah dari sana kalau memang mau menambah fitur -- bukan dari merapikan yang sudah ada.
