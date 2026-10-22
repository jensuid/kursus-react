# Hub — peta file

Aplikasi Vite di root yang memuat demo semua modul dalam satu halaman
ber-sidebar.
Ini file milik **pengembang/pengajar**; untuk memakai kursus sebagai
pembelajar, lihat [`docs/panduan.md`](../docs/panduan.md).

Jalankan: `npm install && npm run dev` → **http://localhost:5200**
(port 5200 khusus hub; modul mandiri tetap di 5173 — lihat `vite.config.js`).

Versi produksi: **https://kursus-react.vercel.app** — di-deploy dari repo ini lewat
`vercel.json` di root. Berkas config itu ada karena rute `/modul/:num` bukan file di
`dist/`; tanpa rewrite SPA, memuat `/modul/05` langsung dari URL berujung 404
di produksi padahal di dev tidak pernah kelihatan. Cara deploy & hasil verifikasinya:
`docs/HANDOFF.md` §3.7.

| File | Isi |
|---|---|
| `modules.js` | **Satu-satunya daftar modul.** Tambah modul = tambah entri di sini; sidebar, rute, dan kartu ringkasan ikut muncul sendiri. Entri punya `type`: `react` (dimuat malas), `es6`, atau `md`. |
| `Hub.jsx` | Layout sidebar + `<Routes>`. Rute khusus `/modul/00` dan `/modul/11`; sisanya `/modul/:num`. Halaman 11 diimpor **malas** di sini. |
| `main.jsx` | Titik masuk: `createRoot`, `StrictMode`, `BrowserRouter`, import `hub.css`. |
| `pages/Overview.jsx` | Ringkasan 12 kartu modul di `/`. |
| `pages/ModulePage.jsx` | Merender demo modul 01-10 + penyalin jalur file. |
| `pages/Es6Page.jsx` | Baca `00-es6-crash-course/*.js` lewat `?raw`, ditampilkan per tab. |
| `pages/NextStepsPage.jsx` | Render `11-next-steps.md?raw` dengan react-markdown; heading markdown diturunkan satu tingkat (`headingTurunTingkat`). |
| `copyText.js` | Fallback clipboard untuk konteks non-HTTPS. |
| `test/setup.js` | Matcher jest-dom + `cleanup()` + `localStorage.clear()` untuk uji jsdom. |
| `hub.css` | Gaya layout hub. Base styles **tidak** ada di sini — diimpor dari `../styles/base.css`, lalu `#root` ditimpa. |

## Dua keputusan yang mudah salah paham

**1. Hub meng-import `App.jsx` modul, BUKAN `main.jsx`-nya.**
Tiap `main.jsx` memanggil `createRoot` sendiri dan meng-import `styles.css`
global. Kalau hub ikut `main.jsx`, akan ada 11 akar React dalam satu halaman
dan gaya global saling menimpa. Konsekuensinya gaya dasar harus datang dari
tempat lain — itu tugas `styles/base.css` yang sama, yang diimpor oleh kedua
pihak.

**2. Demo dimuat dengan `React.lazy`.**
Setiap modul jadi chunk terpisah (`dist/assets/App-*.js`), jadi membuka Modul 04
tidak membuat browser mengunduh semua modul sekaligus. Jangan mengganti `lazy()`
dengan import langsung tanpa alasan; itu menghapus pemisahan ini. Halaman
`NextStepsPage` ikut aturan yang sama, dengan alasan yang terukur: dia satu-satunya
yang menarik react-markdown, dan sebagai import statis 164 KB pipeline markdown
masuk chunk entry yang dibayar semua pengunjung (terukur: 474 KB → 309 KB
setelah dimuat malas).

Karena hub berada di **root repo**, folder modul adalah subfolder di dalam root
Vite — makanya tidak perlu pengaturan `server.fs.allow`. Sisi lain yang sudah
diuji (bukan asumsi): modul berdiri sendiri yang mengimpor `../../styles/base.css`
— berkas di luar root-nya sendiri — juga tetap jalan tanpa `fs.allow`, karena
Vite memakai root repo sebagai workspace root dan `@import` CSS di-inline saat
transform, bukan diminta browser sebagai URL `/@fs/` terpisah.

Uji & periksa: `npm run lint` · `npm run test` · `npm run build`.
Detail keputusan dan utang teknis: [`docs/HANDOFF.md`](../docs/HANDOFF.md).
