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
npm run test         # 91 uji di 7 berkas, lihat §3.6
npm run format:check # gaya kode infra (materi ajar sengaja dikecualikan)
```

Jalankan latihan ES6 (tidak lewat browser — ini skrip Node):

```bash
cd 00-es6-crash-course
node 01-let-const-arrow.js
```

Hentikan dev server: `Ctrl + C`.

Opsional, hanya untuk maintainer di mesin macOS/APFS: `npm run setup:shared`
mengisi `node_modules` folder modul sebagai clone APFS dari satu pohon, dan
`--akar` membuat paket yang sama di `node_modules` root ikut berbagi blok (±436
MB lebih hemat di mesin ini, §4). Ditambah stamen di tiap hasil isian, jadi
menjalankannya lagi tidak menimpa pohon yang sudah diutak-atik. Bukan syarat apa
pun — `npm install` per folder tetap benar, dan pembelajar tidak perlu tahu
perintah ini ada.

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
| `vercel.json` | Config deploy: `framework: vite`, `buildCommand`, `outputDirectory: dist`, plus rewrite SPA `/(.*) → /index.html` supaya deep link `/modul/05` tidak 404 di situs live (§3.7) |
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
| `tests/*.test.{js,jsx}` | 7 berkas, 91 uji — rinciannya di §3.6 |

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

Merah yang pertama (dan justru yang paling berguna) terjadi karena bentuknya tidak rapuh — run `39752865532` (commit `d39e44b`, berkas uji dedup baru): **dua kaki `hub` gagal, 4 uji `dedup-modules` merah di Node 22 dan 24**, sementara suite lokal hijau penuh. Penyebabnya lingkungan, bukan logika: runner CI memakai ext4, `cp -c` tidak ada di sana, jadi skrip menolak sebelum sempat memilih folder — sementara ujiannya mengira sedang menguji keputusan. Perbaikan & pelajarannya dicatat di §3.6 dan §4; suite sesudah itu 7 berkas / 72 uji. Run perbaikannya (`ea9776f`, run `39755787630`) hijau lagi dengan bentuk yang sama (14 job, 13 lulus + probe ter-*skip*), dan kedua kaki `hub` melaporkan `Test Files 7 passed (7)` + `Tests 67 passed | 5 skipped (72)`. Angka *skip* itu harus dibaca benar: yang di-*skip* hanyalah **mekanika klon** (`describe.runIf` reflink) dan uji "repo sebenarnya" (runner tidak punya `node_modules` modul) — lima penjaga keputusan tetap jalan di ext4, dan itulah yang tadinya merah.

Run berikutnya yang menyentuh berkas uji dedup (stamen, §4) melewati gerbang yang
sama dari arah berlawanan: `ab57857` + `e9af062`, run `39767564475` — **14 job,
0 gagal**, kedua kaki `hub` melaporkan `Test Files 7 passed (7)` + `Tests 76
passed | 5 skipped (81)`, dengan `tests/dedup-modules.test.js (28 tests | 5
skipped)`. Angka skip-nya tetap yang lama (mekanika klon + uji "repo sebenarnya"),
yang berarti sembilan uji stamen baru memang dijalankan di ext4 — bukan di-*skip*
oleh lingkungan. Cara mereproduksi kondisi itu di mesin APFS: bikin `cp` palsu yang
hanya menolak `-c`, taruh di depan `PATH`, lalu `npx vitest run
tests/dedup-modules.test.js` → dulu `24 passed | 4 skipped (28)` (4, bukan 5, karena
blok "repo sebenarnya" ikut jalan di mesin yang modulnya ter-install). Angka itu
sendiri sudah tua: sesudah perbaikan merah yang ketiga (lihat di bawah) dan uji
`cp` palsunya, reproduksi yang sama memberi `34 passed | 4 skipped (38)`, dan
keempat yang di-*skip* semuanya berlabel `jalur clone sungguhan` — tidak satu pun
penjaga keputusan, termasuk sepuluh keputusan `--akar`, ikut ter-*skip*.

Merah yang ketiga mengulang penyakit yang sama dari arah yang lebih halus —
`e4ce457` + lintasan `--akar`, run `39795900782`: **dua kaki `hub` gagal**, gejalanya
`AssertionError: expected '…' to match /0 paket sekarang berbagi blok/` dengan
`+ Received` yang berisi `AKAR dilewati — tanpa reflink…`. Suite lokal hijau penuh
(karena APFS), dan kali ini bukan `cp -c` yang hilang — skripnya memang **memilih**
menolak lintasan root di volume tanpa reflink. Itu kesalahan desain, bukan lingkungan:
`--copy` ada justru supaya keputusan teruji di mana pun (§4), dan blok uji ini
membawa `--copy` lewat `jalankan()`. Sembilan uji blok itu karenanya cuma hijau
di APFS. Perbaikannya dua bagian (lintasan root tetap
jalan dengan mekanika salinan + kata ringkasan yang jujur per mekanika) dan
kontrol negatif yang membuktikan penjaga barunya bisa gagal tercatat di §4. Run
perbaikannya (`3ee61bf`, run `39800172722`) hijau: **14 job, 0 gagal**, kedua kaki
`hub` melaporkan `Test Files 7 passed (7)` + `Tests 86 passed | 5 skipped (91)`
dengan `tests/dedup-modules.test.js (38 tests | 5 skipped)` — artinya **33 penjaga
keputusan jalan di ext4**, termasuk sepuluh keputusan `--akar` dan uji `cp` palsu
yang baru; yang di-*skip* tetap hanya mekanika klon + uji "repo sebenarnya".

> Cara membaca hasil run ini juga mengecoh dan perlu dicatat: `gh run view
> --json status,conclusion` melaporkan `completed`/`failure` sementara 12 dari 13
> job masih berstatus `queued`/`in_progress` (yang selesai baru `Build 02-styling`).
> Jangan simpulkan "runner rusak" dari sana — ambil `--log-failed`; di situlah
> `##[error]AssertionError …` muncul dengan `+ Received` lengkap. `annotations`
> juga mengembalikan 404 untuk run ini, jadi itu bukan jalan masuk yang bisa
> diandalkan. Sisi satunya juga perlu dicatat karena mengecoh dengan cara
> terbalik: pada run hijau `39800172722`, `gh run view --json conclusion` sudah
> melaporkan `success` dan `watch --exit-status` sudah keluar sejak awal, sementara
> sembilan job masih berstatus `queued` di API jobs — angka `Tests` per kaki baru
> terbaca beberapa menit kemudian lewat `--log` (dan escape ANSI-nya hanya
> hilang dengan `perl -pe 's/\e\[[0-9;]*m//g'`, `sed` biasa tidak cukup).

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
4. **Deploy bukan bagian dari CI.** Hub memang sudah live di `https://kursus-react.vercel.app`, tapi naik lewat `vercel deploy --prod` manual dari mesin maintainer (§3.7). Tidak ada job CI yang melakukan ini, jadi push ke `main` **tidak** mengubah situs — dan situs yang live tidak menjamin situs berisi kode `main` terkini.

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
| `tests/dedup-modules.test.js` | 38 | Perilaku `scripts/dedup-modules.sh` (perkakas hemat disk, §4): folder mana yang boleh disentuh, penjaga lockfile, `--dry-run`, `--force`, `--copy`, penolakan di volume tanpa reflink, **stamen** (`SIAP`/`BEDA`/`LEWAT`: pohon sudah diisi, berubah sendiri, atau donornya yang berubah), dan **lintasan root `--akar`** (10 uji: opt-in saja, paket identik termasuk yang `@scope/…` ditukar, `.bin`/`.vite` tak pernah disentuh, `BEDA` menahan tambalan lokal, `--force` boleh menimpa, run kedua tidak mengerjakan apa pun, dan **keputusan root tetap ditegakkan di volume tanpa reflink tanpa mengklaim hemat blok** — pakai `cp` palsu, jadi jalur ini teruji bahkan di mesin APFS). Berlingkungan `node` — membaca/menulis disk, tidak pakai DOM |

Enam kebiasaan yang membuat uji ini bernilai, dan yang harus dipertahankan
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
  ujinya benar. Kontrol negatif untuk `dedup-modules` lebih luas karena yang
  dijaga keputusan, bukan tampilan: penjaga lockfile saya matikan → uji
  "melewati folder yang lockfile-nya tidak setara" MERAH; bug urutan
  (`kunci_of` dipakai sebelum daftarnya dihitung) saya kembalikan → uji
  `Donor: … (lockfile …)` MERAH. Tiga mutasi juga dijalankan untuk blok `--akar`
  sebelum blok itu dianggap selesai: baris `if (e.name === ".dedup-shared")
  continue;` di dalam penghitung sidik saya hapus → **2 uji MERAH** dengan gejala
  yang persis seperti bug aslinya (`3 BEDA tidak disentuh`, paket yang sudah
  berbagi dilaporkan berbeda); penjaga `[ "$force" -eq 1 ]` pada cabang `BEDA`
  saya longgarkan → uji "tambalan bertahan" MERAH; dan cabang non-reflink saya
  kembalikan ke perilaku "dilewati" → uji `1 paket sekarang disalin dari` MERAH
  (ini yang membuktikan bahwa Merah CI di §3.5 bisa tertangkap di mesin sendiri
  kalau ujinya ada). Ketiganya dikembalikan.
- **Uji yang menembak perkakas filesystem tidak boleh bergantung pada reflink.** `jalankan()` selalu mengirim `--copy` supaya keputusan teruji di ext4 (CI) maupun APFS (mesin penulis), dan blok `describe.runIf(mendukungClone)` khusus untuk MEKANIKA klon saja. Dua merah pertama di §3.5 lahir dari pelanggaran aturan ini; yang ketiga juga, bentuknya lebih halus: lintasan `--akar` menolak bekerja tanpa reflink sementara ujiannya mengirim `--copy` — hijau di laptop, MERAH di CI. Kontrol negatifnya harus dijalankan lewat `cp` palsu, bukan cuma lewat `runIf` (lihat §4).
- **Uji perilaku bisa menemukan bug di perkakas yang diujinya.** Itu terjadi
  nyata di `tests/dedup-modules.test.js`. Fixture-nya menulis lockfile satu
  baris (minified), sementara skrip menormalisasi dengan `grep -v '"name"'` —
  pada satu baris, grep membuang **seluruh isi**, jadi semua lockfile tampak
  setara dan folder dengan dependensi BEDA ikut mendapat pohon donor. Build
  tidak akan mengeluh. Perbaikannya: buang field `name` (top-level dan
  `packages[""]`) lewat parser JSON, bukan lewat teks mentah.
- **Baca hasil perkakas itu di objek sungguhan, bukan hanya di fixture.** Bug
  berikutnya justru lolos dari 28 uji fixture. `sidik_donor=$(sidik_donor_kini)`
  terlihat seperti pemanggilan fungsi biasa, padahal `$()` menjalankan fungsi di
  child process: baris pohon donor yang ditulis fungsi itu hilang bersama anaknya,
  jadi `berkas=` di stamen tertulis **kosong** dan donor disidik sembilan kali
  (jalan kedua yang harusnya ±5 detik jadi 24 detik). Di fixture, `sidik=` tetap
  terisi (nilainya lewat `printf`, bukan lewat variabel induk) sehingga tidak ada
  satu pun uji yang mengeluh — yang membongkarnya adalah `cat` satu berkas stamen
  di repo nyata. Dua perbaikan: pisahkan "isi cache" (dipanggil sebagai pernyataan)
  dari "baca cache" (`sidik_donor_siapkan` vs `sidik_donor_kini`), dan tambahkan
  `expect(isi).toMatch(/^berkas=[1-9][0-9]*$/m)` — lalu buktikan assertion itu bisa
  gagal dengan membuang panggilan `siapkan` (uji langsung MERAH).
- **Uji yang menyentuh filesystem harus lolos di DUA jenis filesystem.** Suite
  ini hijau di mesin (APFS) dan MERAH di runner CI (ext4, run `39752865532`):
  empat uji penjaga memanggil skrip sungguhan, dan di ext4 skrip menolak lebih
  dulu sebelum sempat memilih folder — yang diuji diam-diam bukan keputusan,
  tapi ketersediaan `cp -c`. Solusinya bukan `runIf` (itu akan kehilangan
  keempat penjaga tepat di CI), tapi `--copy` pada fixture: keputusan diuji di
  mana pun, mekanika klon tetap dijaga `describe.runIf(mendukungClone)` dan
  sebuah peraga `cp` palsu yang meniru ext4 secara deterministik.
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
menyumbang ±60% durasi `npm run test`). Vitest menawarkan `pool: "vmThreads"`
untuk membuatnya sekali per worker; sengaja tidak dipakai — suite ini ±40 detik
dan isolasi per berkas lebih berharga daripada memangkasnya, tapi konsekuensinya
harus diterima: 7 berkas = 7 jsdom, dan satu uji DOM pernah melewati `testTimeout`
bawaan 5 detik ketika suite penuh bersaing dengan puluhan proses yang di-spawn uji
dedup (merah sekali, hijau saat diulang). `vite.config.js` menaikkan batasnya ke 20
detik — itu kelonggaran lingkungan, bukan perbaikan uji lambat.

### 3.7 Deploy hub ke Vercel

Live di **<https://kursus-react.vercel.app>** (alias produksi; proyek `kursus-react`,
account `wyiing01-8628`). Build dikerjakan di cluster Vercel (`vite build`, ±20 detik),
bukan diunggah dari laptop.

```bash
vercel deploy --prod     # dari folder repo, setelah `vercel login` sekali
```

`vercel link --project kursus-react --yes` pernah dijalankan dan meninggalkan
`.vercel/project.json` + `.env.local` (berisi `VERCEL_OIDC_TOKEN`). Keduanya tidak
masuk git — terbuktikan, bukan diasumsikan:
`git check-ignore -v` membalas `.gitignore:4:.vercel/` untuk `.vercel/project.json`
dan `.gitignore:7:.env*` untuk `.env.local` (baris 6 `*.local` juga cocok; yang
dilaporkan pola terakhir). `framework: vite` membuat `npm run build` dan `dist/`
terdeteksi sendiri; `buildCommand`/`outputDirectory` diulang eksplisit supaya
perubahan struktur `dist` nanti kelihatan sebagai perubahan config, bukan kejutan.

**Kenapa `vercel.json` ada (dan kenapa gejalanya tidak muncul di dev).** Hub memakai
React Router, jadi `/modul/05` bukan berkas di dalam `dist/`. Tanpa rewrite, memuat
URL itu secara langsung berarti meminta file yang tidak ada. `npm run dev` tidak
pernah menangkapnya karena dev server Vite sudah melakukan fallback SPA sendiri —
jenis bug yang hanya hidup di produksi. Rewrite `/(.*) → /index.html` tetap aman
untuk aset: di Vercel filesystem menang atas rewrite, jadi `/assets/*` dilayani
seperti biasa dan hanya path tanpa berkas yang jatuh ke `index.html`.

Verifikasi pada 22 Okt 2026 (deploy dari `ba9056d` + `vercel.json`), semuanya lewat
**request anonim** — tidak ada login di jalur ini:

- `curl -o /dev/null -w "%{http_code}"`: `/` **200**, `/modul/05` **200**, `/modul/11` **200**, tanpa redirect ke halaman login.
- HTML `/` menyebut `<title>Kursus React — Hub Modul</title>` dan `/assets/index-DMrxvv-X.js` — **hash yang sama dengan build lokal**, jadi yang tersaji benar-benar hasil `npm run build` repo ini, bukan artefak lama.
- `/assets/index-Cvg6vY31.css` (5.118 byte) berisi `system-ui` + `box-sizing`: rantai `styles/base.css` utuh sampai produksi.
- Browser nyata: `/` (sidebar 3 grup + 12 kartu), `/modul/05` (form ter-render & ber-gaya), `/modul/10` (3 tugas bawaan; menambah "uji deploy" → **3 → 4** dan ringkasan ikut "1 dari 4"), `/modul/11` (1 `h2` + 10 `h3` + 8 `pre`, nol sisa pagar markdown). **0 error console, 0 request 4xx/5xx.**
- Catatan jujur dari verifikasi itu: screenshot tidak bisa diambil (viewport browser headless/lagi tersembunyi), jadi bukti visual datang dari accessibility tree + `getComputedStyle`, bukan dari gambar. Dan chunk lazy membuat snapshot pertama `/modul/10` & `/modul/11` masih berisi "Memuat modul…" — yang menunggu dulu baru menyimpulkan.

**Yang sengaja BELUM dipasang:**

- **Auto-deploy saat push.** Jalur Git Vercel butuh Login Connection GitHub di akun ini; `vercel link` pernah membalas `Failed to link jensuid/kursus-react. You need to add a Login Connection to your GitHub account first. (400)`. Sisanya tinggal `vercel git connect` atau job CI dengan secret `VERCEL_API_TOKEN` — keduanya menambah permukaan akses/secret untuk proyek kecil, jadi belum diambil. Konsekuensinya dicatat di §3.5 butir 4: CI hijau ≠ situs hijau-terkini.
- **`vercel.json` tidak menambah `.vercelignore`.** Upload mengikuti `.gitignore`, jadi 10 folder `node_modules` dan `dist/` tidak ikut naik — yang membuat upload kecil dan build-nya di cluster benar-benar berarti.

**Folder kerja deploy harus diabaikan di TIGA tempat**, dan yang ketiga hampir tidak
terlihat: `.gitignore` (`.vercel/`, `.vercel-tmp/`, `.env*`), `.prettierignore`, dan
`ignores` di `eslint.config.js`. Yang terakhir sungguh dibutuhkan: ESLint flat config
tidak mengabaikan dot-folder dengan sendirinya, begitu `.vercel-tmp/vercel-login.cjs`
ada maka `npm run lint` langsung melaporkan **7 error `no-undef`** (`process`,
`console`, `setTimeout`) — skrip Node dinilai dengan globals browser. Gejalanya cuma
muncul di mesin yang pernah menjalankan deploy; di CI tidak, karena foldernya
tidak ikut ter-checkout. Sesudah `"**/.vercel/**", "**/.vercel-tmp/**"` ditambahkan,
lint kembali **0 error / 11 warning** (11 warning itu materi ajar, §3.4).

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

### Ukuran disk & perkakas `setup:shared`

Angka nyata di mesin pengembangan (macOS, volume APFS), dijumlah dari ukuran
berkas, bukan taksiran: 11 pohon `node_modules` berisi **±598 MB** (root hub
**126,0 MB** + sepuluh modul **472,0 MB**) dengan **11 `package-lock.json`**
terpisah. Ini konsekuensi sadar dari "modul mandiri" (H3, §7.1) — tapi bagian
fisiknya tidak harus mahal.

**Satu cara ukur, dipakai di seluruh bab ini.** Yang dijumlah hanyalah ukuran
berkas biasa lewat `lstat`: symlink tidak diikuti (kalau diikuti, target di
`.bin` terhitung dua kali dan angkanya membengkak ±10 MB tanpa ada yang berubah),
dan cache `node_modules/.vite` tingkat-toping dihitung terpisah — di mesin ini
8,7 MB untuk sebelas pohon, dan isinya dibuat ulang oleh Vite sendiri jadi ia
memang bukan bagian dari yang ingin dihemat. Perlu satu metode yang ditulis
terang: dua angka yang saling bertentangan (130,6 vs 141,2 MB untuk pohon yang
sama, keduanya pernah tercatat di dokumen ini) lahir dari `statSync` yang
mengikuti symlink, dan dari cara `.vite` kadang ikut kadang tidak dihitung.

Yang membuat duplikasi ini aman dihemat: kesepuluh lockfile modul **identik
setelah field `name` dibuang** (md5-nya berbeda hanya karena baris itu), dan
versi yang terpasang sama di semua folder (react 19.3.1, vite 6.4.5 — dicek dari
`node_modules/*/package.json` di donor, root, dan satu modul). Isi
`node_modules` tiap modul **47,2 MB** (terukur, cara ukur di atas); yang
tersimpan sepuluh kali itu satu pohon yang sama.

**Perkakasnya: `npm run setup:shared`** (`scripts/dedup-modules.sh`). Ia mengisi
`node_modules` folder modul sebagai **clone APFS** (`cp -c`) dari satu donor —
bukan symlink, bukan hardlink, bukan workspaces. Inodenya berbeda dan CoW
membuatnya independen (terbukti: menulis ke salinan tidak mengubah md5 donor).
Pembelajar tetap memakai `npm install` seperti biasa; ini perkakas maintainer di
satu mesin.

| Perintah | Tingkah |
|---|---|
| `npm run setup:shared` | Isi folder yang **belum** punya `node_modules`; yang sudah terisi dilaporkan `SIAP`/`BEDA`/`LEWAT` dan **tidak disentuh** |
| `npm run setup:shared -- --dry-run` | Cetak rencana (`RENCANA` / `LEWAT` / `SIAP` per folder), nol perubahan di disk |
| `npm run setup:shared -- --force` | Juga mengganti pohon yang sudah ada, asal lockfile-nya setara donor |
| `npm run setup:shared -- --copy` | Di volume tanpa reflink: salinan penuh. **Tidak menghemat disk** — justru menambah; dibuat eksplisit supaya tidak pernah terjadi tanpa disengaja |
| `npm run setup:shared -- --akar` | Setelah modul, tukar paket yang **isinya identik** di `node_modules` root dengan clone dari donor. Opt-in, satu paket dalam satu waktu (lihat "Lintasan root" di bawah) |

**Stamen (`node_modules/.dedup-stamp`) — supaya menjalankan ini kedua kalinya
tidak buta.** Setiap pengisian menulis tujuh baris teks: `donor`, `mekanika`,
`lockfile`, `berkas`, `sidik`, `waktu`, dan tanda versi. `sidik` adalah md5 dari
daftar **jalur relatif + ukuran berkas** (symlink dicatat sebagai targetnya, `.vite`
dan stamen itu sendiri dikecualikan) untuk **pohon donor saat itu** — dan karena
pohon hasil salinan identik dengan angka itu pada detik pengisian, satu angka
mengabdi dua arah: sidik pohon ini tidak cocok → klonnya diutak-atik; sidik donor
sekarang tidak cocok → semua klon dari donor itu basi. Saat membaca, skrip
melapor salah satu dari:

| Laporan | Artinya | Yang dilakukan skrip |
|---|---|---|
| `SIAP <modul>` | sudah `clone`/`salin` dari donor dan **belum berubah** | tidak menyentuh apa pun; tidak perlu `--force` |
| `BEDA <modul>` | stamen ada tapi sidik/lockfile donor tidak cocok lagi, lengkap dengan angkanya | dilewati; `--force` akan mengisi ulang **dan membuang perubahan di dalam pohon itu** |
| `LEWAT <modul>` | pohon ada tapi tidak tercatat oleh stamen (hasil `npm install`, atau stamen rusak/tidak dikenali) | dilewati |

Batas yang jujur: sidik adalah **jalur + ukuran, bukan isi**. Tambalan yang
ukurannya persis sama tidak terdeteksi. Itu disengaja — membaca ±472 MB (sepuluh
pohon modul, cara ukur yang sama dengan angka di atas: symlink tidak dihitung
berkali) tiap `--dry-run` lebih mahal daripada manfaatnya, dan kegagalan yang
ingin dicegah ("saya `npm install` di satu modul, lalu `--force` menghapusnya
diam-diam") justru mengubah ukuran.

Terukur di repo ini, sesudah kesembilan pohon diisi ulang: satu kali jalan penuh
tanpa bendera butuh **5,3 detik** dan melaporkan `Diisi: 0 \| Siap: 9 \| Lewat: 0
\| Gagal: 0`; `--force` penuh butuh **94 detik** dengan delta `df` hanya
**−1.848 KB** (klon baru tetap berbagi blok yang sama — yang dihemat sudah
dihemat pada run pertama); menyisipkan satu berkas di
`03-events-state/node_modules` mengubah laporan menjadi `BEDA 03 … (2267 berkas,
sidik 6cc0c292 vs 8b31d52a)` dengan **delapan lainnya tetap `SIAP`** dan berkas
sisipan itu **tidak terhapus**.

Empat penjaga yang membuatnya layak dipakai (semuanya dijaga uji perilaku di
`tests/dedup-modules.test.js` — 38 uji, lihat §3.6 dan lintasan `--akar` di
bawah):

1. **Lockfile harus setara donor** — dinormalisasi lewat parser JSON (buang
   `name`), di-md5, dibandingkan. Yang tidak setara selalu `LEWAT`, bahkan dengan
   `--force`; lockfile rusak/absen dapat kunci `TANPA-LOCKFILE` dan ikut dilewati.
2. **Jangan hancurkan kerja orang** — tanpa `--force` pohon yang ada tidak disentuh,
   dan sejak ada stamen skrip tahu perbedaan "sudah jadi clone dan masih setara"
   (`SIAP`), "sudah diutak-atik sejak diisi" (`BEDA`), dan "hasil `npm install`
   sendiri" (`LEWAT`) — jadi `--force` tidak lagi satu-satunya jalan dan tidak lagi
   buta. Dengan `--force` penggantian lewat `node_modules.clone-tmp` → verifikasi
   struktural (`react/package.json`, `vite/package.json`, `.bin/vite`, jumlah
   berkas sama dengan donor) → `mv` atomik; pohon lama dibuang hanya setelah
   verifikasi lolos.
3. **Reflink diprobe dulu, di dalam volume repo** — `cp -c` gagal `Cross-device
   link` antar volume dan tidak ada di GNU coreutils (ext4/NFS/FAT), jadi kalau
   probe gagal skrip berhenti (exit 1) dengan petunjuk "install per folder" dan
   nama jalur alternatifnya (`--copy`). Pernah terbukti di CI: runner ext4 membuat
   skrip menolak, dan itu jalur yang benar — yang salah adalah uji yang mengira
   penolakan itu sebagai keputusan folder (§3.6).
4. **Cache `.vite` tidak ikut pindah** — `node_modules/.vite/deps/_metadata.json`
   menyimpan jalur absolut donor; ia dibuang dari hasil klon (donor tetap punya
   miliknya sendiri).

Hasil nyata saat dijalankan di repo ini (`--force`): `Diisi: 9 | Lewat: 0 | Gagal: 0`
dan ruang tersedia di volume naik **412.884 KB (±403 MB)** — `df -k` 35.090.728 →
35.503.612. Folder hasil klon tetap berfungsi: `05-forms` dan `10-final-project`
lulus `npm run build` (CSS 0,76 kB / 2,17 kB, berisi `system-ui` dari base.css),
dan dev server `05-forms` melayani `/src/styles.css` HTTP 200 dengan header
base.css ter-inline.

> **Jangan mengukur hematnya dengan `du`.** Setelah klon, `du -sh` per modul
> justru membaca 46–58 MB untuk isi yang sama — `du` menghitung blok per pohon
> tanpa peduli blok itu dibagi dengan siapa. Satu-satunya angka jujur di volume
> reflink adalah **delta ruang tersedia `df`**, dan itu yang dilaporkan skrip di
> baris terakhirnya.

**Lintasan root (`--akar`) — dan kenapa ia bukan bagian dari perulangan modul.**
Setelah sembilan pohon modul berbagi blok, masih ada satu duplikasi yang tersisa:
`node_modules` root hub menyimpan react/vite/esbuild yang sama dengan donor.
Tetapi root **bukan pohon yang setara** — kuncinya terukur `fcd67c04` sedangkan
modul `2cb6e7db`, dan isinya 317 paket vs 64 paket donor. Jadi tidak ada jalan
untuk mengganti seluruh pohon; penjaga utamanya bukan lockfile (tidak akan pernah
sama) melainkan **sidik per paket tingkat-satu**, satu per satu (nama `@scope/…`
hitungannya dua tingkat). `.bin`, `.vite`, dan berkas titik tidak pernah dianggap
paket.

| Laporan | Artinya | Yang dilakukan skrip |
|---|---|---|
| `RENCANA akar -- bagikan <paket>` / ditukar diam-diam | isi paket root **sama persis** dengan donor | klon → verifikasi jumlah entri → `mv`/`mv`/`rm`, lalu tulis penanda `paket/.dedup-shared` |
| `SUDAH` | sudah ditandai pada run sebelumnya | tidak disentuh; dilaporkan di baris `AKAR` |
| `BEDA <prefix>/<paket>` | nama ada di dua sisi, isinya tidak sama | **tidak disentuh** kecuali `--force` (maka paket itu ditimpa salinan donor) |
| `ASLI` | hanya ada di root (vitest, express, mongodb, …) | tidak disentuh — memang tidak ada duanya |
| `HANYA-DONOR` | hanya ada di donor | tidak disentuh |

Asimetri kebijakannya sengaja dan diuji: isi yang **identik** boleh ditukar tanpa
berteriak (tidak ada informasi yang hilang), isi yang **berbeda** tidak pernah
ditimpa tanpa `--force` — sama seperti pohon modul. Menjalankan dua kali tidak
mengubah apa pun, dan itu butuh satu perbaikan nyata: penanda `.dedup-shared`
ditulis **di dalam** paket hasil pembagian, jadi kalau ikut terhitung oleh sidik,
run berikutnya melihat 64 BEDA palsu dan mengisi ulang selamanya. Ia dilewati
dari penghitung rekursif — bukan dari daftar `ABAIKAN` tingkat-toping, yang
pernah dicoba dan tidak bekerja. Setelah sidik cocok, penanda tetap dibaca,
sehingga pembedaan `SUDAH`/`BEDA` tidak ikut longgar.

Terukur di repo ini (`npm run setup:shared -- --akar`): rencana `64 paket identik
akan berbagi (49459766 byte)`, `253 hanya ada di root`, `0 belum ada di root`;
eksekusi melepas **32.928 KB** blok fisik (`Diisi: 0 \| Siap: 9 \| Lewat: 0 \|
Gagal: 0`, tanpa sisa `*.dedup-tmp`); run ketiga `0 paket sekarang berbagi \| 64
sudah berbagi \| 0 BEDA` (mesin ini sudah terisi penuh, `--dry-run` tanpa `--akar`
6,3 detik dan dengan `--akar` 7,5 detik — perbandingan dua pohon adalah tambahan
±1,2 detik itu). Bukti bahwa yang dibagikan benar-benar berbagi blok:
menulis **1 byte** (nilai yang sama, jadi isi tidak berubah) di tengah berkas
`node_modules/esbuild/bin/esbuild` 10.611.232 byte milik root menurunkan ruang
tersedia `df` hanya **4 KB** — granularitas CoW APFS adalah blok 4 KB, bukan
berkas penuh — sementara md5 berkas itu tetap `83195c97…` dan sama persis dengan
salinannya di `01-hello-component`, `05-forms`, dan `10-final-project` (keduanya
masih bisa dijalankan: `--version` → `0.25.12`).

Blok 4 KB itu sekaligus menegaskan batas sidik di lintasan ini: ukuran berkas tidak
berubah, jadi `--dry-run` setelah penulisan tetap melaporkan `64 sudah berbagi`
dan `0 BEDA`. Yang dijaga metode ini adalah **pertukaran pohon yang salah**, bukan
setiap bayangan perbedaan isi — persis seperti kompromi yang sudah diterima untuk
stamen modul.

**Lintasan ini TETAP jalan di volume tanpa reflink** (`--copy`), dan itu bukan
kebakaran. Isi paket yang ditukar sudah terbukti identik, jadi salinan penuh tidak
menambah apa pun yang sudah ada — hanya tidak menghemat. Versi pertama skrip
menolaknya (`AKAR dilewati — tanpa reflink…`) dan akibatnya langsung tertangkap
CI: run `39795900782` **MERAH** karena sembilan uji blok ini mengirim `--copy`
(seperti yang selalu dilakukan `jalankan()`, lihat §3.6) sehingga di ext4 tidak ada
pekerjaan yang berjalan sama sekali — suite hijau di APFS saja, persis kegagalan
yang sudah dua kali terjadi di repo ini. Karena itu ringkasan `AKAR` memakai kata
menurut mekanika: `berbagi blok dengan <donor>` saat clone, `disalin dari <donor>` +
`TIDAK ada blok yang dihemat (mekanika salinan penuh)` saat `--copy` — skrip tidak
pernah mengklaim hemat blok kalau tidak ada blok yang dibagi. Penjaganya: uji
`di volume tanpa reflink keputusan root TETAP jalan…` memakai `cp` palsu sehingga
jalur ini teruji lebih dulu di mesin APFS, tanpa harus menunggu CI; ia terbukti bisa
gagal (dijalankan melawan kode lama → MERAH pada `1 paket sekarang disalin dari`).

Yang tidak boleh disimpulkan dari angka itu: 49,4 MB adalah ukuran **logis** yang
berhenti disimpan dua kali, sedangkan 32,9 MB adalah delta `df` yang terukur —
selalu lebih kecil dari angka logis karena volume ini juga dipakai proses lain
saat skrip berjalan, dan sebagian blok root memang sudah tidak terpakai. Setelah
lintasan ini, fisik di mesin ini ±126 MB untuk sebelas pohon (78,8 MB unik root +
47,2 MB satu pohon yang dipakai bersama), dari 598 MB logis.

Batas uji yang jujur: cabang **rollback** pertukaran paket (klon sudah dibuat, `mv`
gagal di tengah) tidak ditutup uji otomatis — `mv` antara dua direktori pada
filesystem yang sama tidak bisa dibuat gagal secara andal di fixture, dan jalur
yang tersedia (`chflags uchg`) tidak ada di ext4 tempat CI berjalan, jadi tesnya
akan diam-diam ter-*skip*. Yang diuji adalah keputusan di sekitarnya (mana yang
ditukar, mana yang tidak, dan tidak ada sisa `*.dedup-tmp`/`*.lama-tmp` setelah
run sukses). Bug yang ditemukan di cabang ini terjadi sebelum kode ini ditulis:
pohon lama di-`mv` ke jalur paket yang **sudah terisi klon** akan menumpuknya ke
dalam paket baru — diperbaiki dengan menjaga pemulihan hanya berjalan kalau
paketnya memang hilang dari tempatnya (`[ ! -e … ]`).

**Ini tidak mengubah keputusan H3.** Struktur "modul mandiri" tetap utuh: tiap
folder masih punya `package.json`, lockfile, dan `node_modules` sendiri, jadi job
CI `modul` dan cerita "salin folder, langsung jalan" tidak tersentuh. Yang dihemat
cuma blok fisik di satu mesin; klon ini tidak ikut ter-commit (`node_modules`
sudah dikecualikan `.gitignore`) dan tidak berarti apa-apa di mesin orang lain.
Keputusan & pemicu tinjau ulangnya tetap di §7.1.

---

## 5. Cara Menambah / Mengubah Modul

### 5.1 Menambah modul React baru (mis. `12-reducer`)

1. **Scaffold** — salin kerangka modul yang sudah ada:
   ```bash
   mkdir 12-reducer && cp -r 07-useeffect/{vite.config.js,index.html} 12-reducer/
   mkdir -p 12-reducer/src
   ```
   Lalu buat `12-reducer/package.json` sendiri (ubah `name`), dan isi `src/main.jsx`, `src/App.jsx`, `src/styles.css`.
   Begitu folder ini punya `package.json` + lockfile yang setara dengan modul lain,
   `npm run setup:shared` (§4) bisa mengisi `node_modules`-nya dari clone donor —
   tanpa `--force`, karena skrip hanya menyentuh folder yang belum punya pohon.
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
| Uji otomatis | `npm run test` | ✅ **91 uji pada 7 berkas**; penjaga uji pernah dibuktikan bisa gagal lewat mutasi (§3.6, termasuk tiga mutasi untuk blok `--akar`). Angka **53** yang muncul di §3.5 adalah hasil run CI pada commit sebelum berkas uji dedup ada — bukan angka yang salah |
| CI bentuk sekarang | `gh run view 39739605225 --json jobs` | ✅ **14 job: 13 lulus + `probe` ter-*skip*** — dua kaki `hub` (Node 22/24) dengan langkah uji, `isi-matriks` menghasilkan 10 folder dari disk, 10 job `Build <modul>` lulus dengan CSS 666-2173 byte |
| Batas versi uji | job probe A/B (`node_version=20` vs `22`) | ✅ Node 20.20.2: `npm run test` **GAGAL** (26 uji node-only lulus, 4 berkas DOM mati); Node 22.23.3: **53 lulus**. Rinciannya di §3.5 |
| Perkakas hemat disk (H3) | `npm run setup:shared -- --dry-run --force`, `npm run setup:shared -- --akar`, `df -k`, build & dev folder hasil klon | ✅ Rencana 9 folder terbaca benar; eksekusi `--force` → `Diisi: 9 \| Lewat: 0 \| Gagal: 0`, ruang tersedia volume naik **412.884 KB** (§4). `05-forms`/`10-final-project` tetap bisa `build` + dev dari pohon klon. Lintasan **`--akar`** terukur melepas **32.928 KB** lagi (64 paket root, 49.459.766 byte logis) dan run keduanya `0 paket \| 64 sudah berbagi \| 0 BEDA`. 38 uji perilaku menutup jalur non-reflink (direkam dengan `cp` palsu), tiga keputusan stamen (`SIAP`/`BEDA`/`LEWAT`, lihat §4), dan sepuluh keputusan `--akar`. Yang sudah terbukti di CI (ext4, run `39767564475`): `76 passed \| 5 skipped (81)` per kaki hub, `dedup-modules.test.js (28 tests \| 5 skipped)` — yang di-skip cuma mekanika klon; keputusan tetap jalan di ext4 (rinciannya §3.5). Blok `--akar` sendiri sudah punya riwayat CI dan tidak bersih: `e4ce457` memberi **merah yang ketiga** (run `39795900782`, dua kaki `hub`) karena lintasan root menolak jalan tanpa reflink sementara ujiannya selalu membawa `--copy` — hijau di APFS, MERAH di ext4 (gejala & perbaikannya di §3.5). Perbaikan yang membuatnya teruji di dua filesystem itu menambah uji ke-10 (`cp` palsu) dan **sudah hijau di CI**: `3ee61bf`, run `39800172722` — 14 job, 0 gagal, `86 passed \| 5 skipped (91)` per kaki hub dengan `dedup-modules.test.js (38 tests \| 5 skipped)`; yang di-skip tetap mekanika klon + uji "repo sebenarnya", jadi 33 penjaga keputusan (sepuluh di antaranya `--akar`) sungguh dijalankan di ext4. |
| Situs live (Vercel) | `curl` anonim + browser nyata di `https://kursus-react.vercel.app` | ✅ `/`, `/modul/05`, `/modul/10`, `/modul/11` semuanya **200 tanpa login**; hash bundle produksi (`index-DMrxvv-X.js`) identik dengan build lokal; CSS 5.118 byte berisi `system-ui`; interaksi Todo terukur di produksi (**3 → 4** item, ringkasan "1 dari 4"); **0 error console, 0 request 4xx/5xx**; deep link tidak 404 karena rewrite `vercel.json` (§3.7) |

Perintah re-verifikasi cepat untuk pengembang berikutnya:

```bash
npm run lint && npm run test && npm run build
npm run dev            # hub di http://localhost:5200
# lalu cek: / , /modul/00 , /modul/05 (tombol Salin) , /modul/10 (tambah tugas) , /modul/11 (markdown)
cd 05-forms && npm run dev && npm run build   # modul mandiri tetap hidup sendiri
curl -o /dev/null -w "%{http_code}\n" https://kursus-react.vercel.app/modul/05   # rewrite SPA masih hidup? (§3.7)
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
| H3 | 🟨 **Won't-fix (sadar), harganya diperkecil** | **Duplikasi `node_modules` per modul** (11 pohon, ±598 MB isi logis — terukur di §4) | Clone/install berat di mesin lokal | Struktur TETAP tidak diubah (alasan & pemicu tinjau ulang di §7.1). Harga fisiknya diturunkan `npm run setup:shared` — clone APFS per mesin, ±436 MB dilepas (9 pohon modul + 64 paket di root lewat `--akar`), model mandiri tidak tersentuh (§4). Opsi A tetap tertulis di §7.1 kalau keputusan kurikulum diubah |
| H4 | ✅ **Beres** | Dahulu: base styles diduplikasi — `src/hub.css` menyalin isi `styles.css` tiap modul | Ubah gaya global harus dilakukan di 11 tempat | Sekarang: satu `styles/base.css`, di-`@import` oleh 10 modul + `src/hub.css` (yang lalu menimpa `#root`). Modul tinggal berisi aturan khusus (05: `.sukses`; 08: `.keranjang`; 09: `.grid-card`/`.card`). Terbukti jalan di **tiga jalur**: dev server modul (CSS ter-inline berisi `system-ui`), build mandiri Modul 05 (`dist` memuat `.sukses`), dan dev hub (`#root: none` tetap ada). Dijaga `tests/struktur-modul.test.js` + langkah CI |
| H5 | 🟨 **Won't-fix (sadar)** | **Modul 00 tidak bisa dijalankan dari hub** (butuh Node) | Pembelajar harus buka terminal | Tidak dikerjakan; alasan & jalan keluar murah kalau terpaksa di §7.1 |
| H6 | ✅ **Beres** | Dahulu: markdown 11 dirender mentah di `<pre>` | Sulit dibaca | Sekarang `react-markdown` + `remark-gfm` (hanya di hub), GFM aktif, gaya lewat blok `.hub-md`. Heading markdown **turun satu tingkat** karena verifikasi browser menemukan halaman punya dua `<h1>` (header hub + judul file). Dijaga `tests/next-steps.test.jsx` |
| H7 | ✅ **Beres** | Dahulu: tombol "Salin" butuh secure context dan menelan kegagalan diam-diam | Gagal tanpa kabar lewat HTTP non-localhost | Sekarang `src/copyText.js`: clipboard modern → fallback `textarea` + `execCommand` → status **tiga keadaan** di tombol (`Salin` / `Tersalin!` / `Gagal menyalin`, dengan `aria-live`). Dijaga `tests/copyText.test.js` (5 uji, termasuk jalur tanpa clipboard) |
| H8 | ✅ **Beres** | Dahulu: tidak ada ESLint/Prettier/CI/test | Regresi tak terdeteksi | **Sudah lengkap**: ESLint 10 flat config + cakupan `tests/**` (§3.4), Prettier 3, CI empat job dengan matriks Node + matriks folder modul (§3.5), dan 91 uji otomatis (§3.6) |
| H9 | ✅ **Beres** | Dahulu: `docs/panduan.md` kosong 0 byte | Membingungkan | Sekarang **Panduan Pakai untuk Pembelajar**. Sudah dirapikan dari tempelan chat awal: judul + isi disinkronkan ke model hub, kalimat penutup percakapan dihapus. `docs/plan.md` = snapshot rencana awal (arsip) |
| H10 | ✅ **Beres** | Dahulu: tidak ada README untuk hub itu sendiri | Arsitektur hub hanya terdokumentasi di dokumen ini | Sekarang `src/README.md`: peta file + dua keputusan yang mudah salah paham (hub meng-import `App.jsx` bukan `main.jsx`; demo dimuat malas). Tautan dua arah sudah dipasang dari/ke §12 dokumen ini |
| H11 | ✅ **Beres** | Dahulu: port dev **5173** dipakai hub dan modul mandiri bersamaan | Tidak bisa menjalankan keduanya barengan | Hub kini di **5200** dengan `strictPort: true`; modul tetap 5173. Terbukti: instance hub kedua mati dengan "Port 5200 is already in use" dan **tidak** diam-diam pindah ke 5201 |

### 7.1 Dua keputusan won't-fix (H3 dan H5)

Keduanya **bukan** "nanti kalau sempat". Tulisannya di sini supaya yang
melanjutkan proyek ini tidak mengiranya lupa.

**H3 — `node_modules` ganda, TIDAK dijadikan npm workspaces.**

- Yang dikorbankan: ±598 MB isi logis (11 pohon `node_modules`; angka terukur &
  cara menurunkannya ada di §4) dan satu `npm install` per folder modul.
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
- [x] ~~**Automated testing**~~ — **selesai**: Vitest 5 + React Testing Library, 7 berkas / 91 uji, mutasi-terbukti (lihat §3.6). Minimal yang diminta (Modul 10: tambah/toggle/hapus) sudah ada, plus penjaga struktur, materi ajar, dan perkakas disk.
- [x] ~~**Reduksi duplikasi `node_modules`**~~ (permintaan pemilik, di luar daftar ini) — **selesai, lalu diperluas**: `scripts/dedup-modules.sh` + `npm run setup:shared`, 38 uji perilaku, stamen anti-run-butabuta, dan lintasan `--akar` yang membuat 64 paket di `node_modules` root ikut berbagi blok dengan donor — **±436 MB** blok fisik dilepas di mesin ini (412.884 KB dari sembilan pohon modul + 32.928 KB dari root; lihat §4). Bukan perubahan struktur: H3 tetap won't-fix (§7.1), tiap modul tetap mandiri.
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
- [x] ~~**Deploy hub** ke Vercel/Netlify sebagai situs kursus publik~~ — **SELESAI** via Vercel: <https://kursus-react.vercel.app>, deploy manual `vercel deploy --prod` (§3.7). Modul 00/11 tetap terbaca di produksi. Yang masih terbuka cuma **auto-deploy saat push** (butuh Login Connection GitHub / token di CI — alasan & pilihan di §3.7).
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
- **Skrip `scripts/*.sh` harus jalan di bash 3.2 yang dikirim macOS.** `/bin/bash` di mesin pengembangan adalah 3.2.57 dan **tidak mendukung `declare -A`**; CI runner memakai bash 5, jadi desain berbasis associative array akan hijau di CI dan mati diam-diam di laptop penulisnya sendiri (dibuktikan dengan `bash --version`, dan homebrew bash tidak terpasang di sini). Pola yang dipakai `dedup-modules.sh` sebagai gantinya: satu panggilan `node` menghasilkan **tabel gabungan** (`aksi\tpaket\tbyte`) lalu dibaca `while read` — sekaligus menghindari beberapa proses anak **per paket** (versi tengahnya butuh `awk`/`cut` untuk tiap baris). Harganya terukur: membandingkan 64 paket donor dengan 317 paket root menambah **±1,2 detik** pada `--dry-run` penuh di mesin ini (6,3 → 7,5 detik) — satu proses node, bukan ratusan fork. Dua jebakan turunannya tercatat di Runbook: `node -e` memakai `process.argv.slice(1)` (tidak ada slot path skrip), dan kolom tabel tidak boleh bergantung pada **karakter tak terlihat** seperti tab di `IFS=<tab>` — spasi+tab sudah cukup dan tidak bisa hilang saat berkas disunting.
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
| Satu uji DOM merah di suite penuh, hijau waktu berkas itu dijalankan sendiri | Bukan regresi perilaku: `testTimeout` bawaan 5 detik kehabisan waktu saat 7 jsdom dibuat beruntun dan uji dedup ikut spawn proses bash/node. Pernah terjadi: `merender tiga tugas bawaan` merah sekali lalu hijau pada run berikutnya | `vite.config.js` sudah menaikkan ke 20 detik — jangan diturunkan lagi tanpa mengurangi jumlah berkas ber-DOM. Yang jujur: coba lagi dulu sebelum menyalahkan kodenya (`npx vitest run tests/<berkas>`) |
| `npm run setup:shared` berhenti dengan "Volume ini tidak mendukung clone APFS/reflink" | Filesystem bukan APFS/btrfs (ext4, NFS, drive USB ber-format FAT), atau probe menyentuh volume lain | Bukan kegagalan yang perlu diatasi: skrip memang menolak menyalin 500 MB diam-diam. Install per folder seperti biasa (`cd <modul> && npm install`), atau `--copy` kalau memang mau pohon duplikat (tidak hemat disk) |
| `setup:shared` melaporkan `LEWAT <modul> … lockfile tidak setara` | Folder itu sungguh punya dependensi berbeda dari donor — dan itu harus begitu | Jangan pakai `--force` untuk memaksa. `npm install` di folder itu. Penjaga ini pernah terbukti diperlukan: normalisasi berbasis `grep` salah untuk lockfile satu baris (§3.6) |
| `setup:shared` melaporkan `BEDA <modul> … pohon ini berubah sejak diisi` | Ada yang `npm install` atau menambal `node_modules` modul itu setelah pengisian | Baca dulu, jangan refleks `--force`: `BEDA` tidak berbahaya, pohon itu tetap dipakai modul seperti biasa. `--force` hanya kalau memang mau kembali ke pohon donor — perubahan di dalam `node_modules` itu ikut hilang |
| `setup:shared -- --akar` melaporkan `BEDA node_modules/<paket>` | Paket itu di root isinya tidak sama dengan donor — biasanya karena `npm install` root menaikkan versi satu paket | Biarkan: skrip tidak akan menimpanya tanpa `--force`. Yang menyesatkan adalah **jumlahnya**: kalau `BEDA` muncul untuk SEMUA paket (ratusan) padahal tidak ada yang berubah, itu hampir pasti bug di pembacaan pohon, bukan keadaan disk — pernah terjadi nyata lewat `process.argv.slice(2)` di dalam `node -e` (argv `-e` tidak punya slot path skrip, jadi `slice(1)`), yang membuat root terbaca KOSONG tanpa error — satu-satunya jejaknya waktu itu peringatan deprecation `DEP0187` dari node |
| `--akar` melaporkan `BEDA node_modules/<paket>` untuk satu paket yang tidak masuk akal (mis. `esbuild` berukuran dua kali lipat) | Isi `node_modules` root pernah dirusak eksperimen di dokumen ini sendiri: menyisip 10 MB byte nol ke berkas `esbuild/bin/esbuild` untuk membuktikan CoW. Yang harus diketahui: pohon ini **tidak ada di git**, jadi `git checkout` tidak akan memulihkannya | Pemulihan yang benar justru lewat perkakas ini: `cp -c <donor>/node_modules/<paket> node_modules/<paket>` (atau `npm run setup:shared -- --akar --force` untuk semua paket yang menyimpang), lalu buktikan dengan `./node_modules/esbuild/bin/esbuild --version` (`0.25.12`) — bukan hanya dengan md5. Untuk menguji CoW, tulis byte **yang sama nilainya** seperti sudah terukur di §4: isi tidak berubah, hanya bloknya yang terpisah |
| `--akar` melaporkan `0 paket sekarang berbagi \| 64 sudah berbagi` padahal run ini run pertama | Tidak mungkin terjadi pada run pertama yang benar; yang paling mungkin adalah run **berikutnya** setelah pengisian — dan memang tidak ada kerja tersisa | Bukan kegagalan. Kalau sebaliknya (muncul `BEDA` untuk paket yang baru saja ditandai bersama), periksa apakah penanda `.dedup-shared` ikut terhitung oleh sidik: ia harus dilewati dari **penghitung rekursif**, bukan dari daftar `ABAIKAN` tingkat-toping |
| `--akar --copy` melaporkan `N paket sekarang disalin dari …` dan `TIDAK ada blok yang dihemat (mekanika salinan penuh)` | Volume tanpa reflink, jadi pertukaran root memakai salinan penuh. Ini **bukan** penolakan: keputusan paket mana yang boleh ditukar tetap ditegakkan, hanya hematnya yang tidak ada | Biarkan kalau memang sedang di ext4/NFS (di CI inilah jalur itu diuji). Kalau ingin hemat blok, jalankan di volume ber-reflink tanpa `--copy`. Jangan "memperbaiki" skripnya dengan mengembalikan cabang `AKAR dilewati — tanpa reflink`: itu perilaku versi pertama `e4ce457`, dan persis itu yang membuat run `39795900782` MERAH di CI sementara laptop APFS hijau (§3.5) |
| **Semua** modul dilaporkan `BEDA` sekaligus, padahal tidak ada yang menyentuhnya | Yang berubah pohon **donor** (mis. `01-hello-component` habis `npm install`) — sidik tiap klon masih cocok dengan salinannya sendiri, tapi tidak dengan donor sekarang | Bukan tanda rusak; justru ini yang tidak bisa dilihat tanpa stamen. Isi ulang dari donor sekarang: `npm run setup:shared -- --force` |
| `npm run setup:shared` terasa lambat di mesin yang sudah terisi (±5 detik, padahal dulunya <1 detik) | Dia menyidik sepuluh pohon (jalur + ukuran, bukan isi) untuk membuktikan "masih setara" | Bukan regresi: itulah harga informasi yang membuat `--force` tidak lagi buta, dan mesin yang belum pernah diisi tidak membayar apa pun (tidak ada stamen → tidak ada penyidikan) |
| Field `berkas=` di `node_modules/.dedup-stamp` kosong | Stamen ditulis oleh versi skrip sebelum perbaikan bug subshell (§3.6) | Tidak ada konsekuensi fungsional (`sidik=` tetap benar); jalankan `--force` sekali untuk menulis ulang stamen yang lengkap |
| Folder hasil klon tiba-tiba `Cannot find module` atau cache Vite basi | CoW tidak mengubah isi, tapi siapa pun bisa `npm install` ulang di folder itu dan pohonnya tidak lagi setara donor | Ganti dengan install biasa: `rm -rf <modul>/node_modules && cd <modul> && npm install`. Tidak ada yang rusak permanen — klon memang cuma hemat ruang, bukan state yang harus dijaga. Dev server yang tetap salah: `npm run dev -- --force` |
| `/modul/05` diketik langsung di browser lokal → okay, tapi di situs live → 404 | Rewrite SPA di `vercel.json` hilang atau tertimpa; `dist/` memang hanya berisi `index.html` di root | Pulihkan `"rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]` (§3.7) lalu `vercel deploy --prod`. Jangan cuma cek `npm run dev` — dev server Vite melakukan fallback sendiri, jadi gejalanya tidak pernah muncul di sana |
| `vercel deploy` melapor `Failed to link … You need to add a Login Connection to your GitHub account first. (400)` | Akun Vercel ini belum punya Login Connection GitHub, jadi integrasi Git tidak bisa dipakai | **Bukan kegagalan deploy** — `vercel link --project <nama> --yes` tetap membuat proyek dan menghubungkan folder; hanya auto-deploy dari push yang tidak tersedia. Jalur lain: `vercel deploy --prod` manual (§3.7) atau job CI dengan token |
| Pembelajar melaporkan tidak bisa membuka kursus | (Kemungkinan) Deployment Protection Vercel aktif dan minta login | Ukur dulu, jangan langsung menyalahkan: `curl -o /dev/null -w "%{http_code}\n" https://kursus-react.vercel.app/modul/05` tanpa login. **200** = bukan itu penyebabnya (saat §3.7 ditulis, request anonim lolos). **401/302 ke halaman login Vercel** = ubah Settings → Deployment Protection di proyek |
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
- `tests/` — 7 berkas uji (§3.6). `npm run test` adalah gerbang tercepat sebelum push.
- `scripts/dedup-modules.sh` — perkakas hemat disk untuk maintainer, dipanggil lewat `npm run setup:shared` (§4). Tidak dipakai oleh CI; dijaga `tests/dedup-modules.test.js`. Menulis `node_modules/.dedup-stamp` (sidik pohon donor) supaya jalan kedua melaporkan `SIAP`/`BEDA` alih-alih buta.
- `vercel.json` — config deploy produksi; situs kursus yang bisa dibuka pembelajar: <https://kursus-react.vercel.app> (§3.7).
- `docs/plan.md` — snapshot rencana awal (arsip; jangan diedit sebagai sumber kebenaran).
- `11-next-steps.md` — kurikulum lanjutan, dirender sebagai HTML di rute `/modul/11`.
- Tiap `<modul>/README.md` — teori per modul.
- Laporan visual penyelesaian (canvas): `react-hub-completion-report.canvas.tsx` di direktori canvas Qoder proyek ini.

---

## 13. Ringkasan Satu Paragraf

Proyek ini adalah kursus React 12 modul berbahasa Indonesia yang berjalan di dua mode: hub terpadu di root (Vite + React 19 + React Router 7 + react-markdown, semua demo 01-10 dimuat via `React.lazy`, modul 00/11 dibaca via `?raw`, port 5200) dan modul mandiri per folder (port 5173). Semua terverifikasi lewat build, browser, dan **91 uji otomatis**, di repository Git publik dengan CI empat job yang hijau di `main` (terakhir: 14 job, 13 lulus + probe ter-*skip*): matriks Node, probe versi, sepuluh build modul mandiri, dan pemeriksaan gaya dasar di `dist`. Kursusnya sendiri sudah terbuka untuk pembelajar di <https://kursus-react.vercel.app>, di-deploy manual dari CLI dan **bukan** dari CI (§3.7). Hutang teknis yang terdaftar di §7 sudah tertutup semua: yang tersisa bukan pekerjaan tertunda, tapi **keputusan yang sengaja diambil** (H3 dan H5 won't-fix, §7.1 — harga duplikasi H3 sudah diturunkan perkakas §4 tanpa mengubah strukturnya; Prettier tidak menyentuh materi ajar, §3.4) dan fitur baru di backlog §8 yang nilainya pedagogis, bukan rekayasa. Mulailah dari sana kalau memang mau menambah fitur -- bukan dari merapikan yang sudah ada.
