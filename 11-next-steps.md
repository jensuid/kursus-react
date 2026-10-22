# Modul 11 — Next Steps: Ke Mana Setelah Ini?

Kamu sudah menyelesaikan fondasi React. Dokumen ini memetakan jalan lanjutan — **tidak perlu dipelajari sekaligus**. Pilih sesuai tujuanmu.

## Peta kemampuan

```
react-ui 12 modul (KAMU DI SINI)
   ├─ fondasi kuat: komponen, state, hooks, data async, form
   └─ siap memilih jalur:
        A. Aplikasi lebih besar  → React Router + state management
        B. Keamanan tipe          → TypeScript
        C. Produksi nyata         → Next.js (framework resmi React)
        D. Unggah ke internet     → deploy
```

---

## A. Routing — banyak halaman (React Router)

App React sejatinya satu halaman (SPA). Untuk URL berbeda (`/produk/1`, `/login`) gunakan **React Router**.

```bash
npm install react-router-dom
```

```jsx
import { BrowserRouter, Routes, Route, Link, useParams } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <nav><Link to="/">Beranda</Link> <Link to="/tentang">Tentang</Link></nav>
      <Routes>
        <Route path="/" element={<Beranda />} />
        <Route path="/produk/:id" element={<Produk />} />
        <Route path="/tentang" element={<Tentang />} />
      </Routes>
    </BrowserRouter>
  );
}

// ambil /produk/42 → id
function Produk() {
  const { id } = useParams();
  return <h1>Produk #{id}</h1>;
}
```

Konsep baru: `<Link>`, nested routes, route guard. Semua di atas fondasi yang sudah kamu punya.

---

## B. State management — saat props/callback mulai sesak

Kalau data makin kompleks dan Context terasa berat, gunakan library khusus:

- **Zustand** — paling ringan, mulai dari sini kalau butuh.
  ```bash
  npm install zustand
  ```
- **Redux Toolkit** — standar industri untuk aplikasi besar.
- **Jotai** — gaya atom/recoil, cocok untuk state tersebar.

Aturan praktis: **jangan langsung pakai**. Maksimalkan dulu `useState` + lifting + Context (Modul 06). Library hanya saat kamu benar-benar merasakan sakitnya.

---

## C. Data fetching profesional — React Query / TanStack Query

`useFetch` buatanmu (Modul 09) sudah benar konsepnya. Untuk production, **TanStack Query** menambah caching, retry, background refetch, invalidation:

```bash
npm install @tanstack/react-query
```

```jsx
const { data, isLoading, error } = useQuery({
  queryKey: ["posts"],
  queryFn: () => fetch("/api/posts").then((r) => r.json()),
});
```

---

## D. TypeScript — keamanan tipe (sangat disarankan untuk karier)

React + TypeScript = props & state punya "kontrak" sehingga bug tipe tertangkap sebelum jalan. Setelah kamu nyaman dengan React polos, tambahkan `: type`:

```tsx
interface Props { nama: string; umur?: number; }
function Kartu({ nama, umur = 0 }: Props) { ... }

const [count, setCount] = useState<number>(0);
```

Buat project baru dengan TS: `npm create vite@latest app -- --template react-ts`.
Fokus belajar: tipe props, generics hook, union type, `ReactNode`.

---

## E. Next.js — framework React untuk production

Untuk aplikasi nyata (SEO, server rendering, routing bawaan), komunitas memakai **Next.js**:

- App Router, Server Components, API routes
- Rendering di server → lebih cepat & baik untuk SEO

Ketika siap, ikuti tutorial resmi Next.js ("Learn") — kamu akan kaget betapa banyak yang sudah kamu mengerti.

---

## F. Deploy — unggah karyamu

```bash
npm run build           # hasil statis di folder dist/
```

- **Vercel** / **Netlify** — drag & drop `dist/` atau hubungkan repo Git, otomatis.
- **GitHub Pages** — cocok untuk app statis sederhana.

Vercel paling ramah React/Next.js: push ke GitHub → connect → deploy. Dalam 5 menit appmu online dengan URL sungguhan.

---

## G. Membiasakan alat kerja profesional

- **ESLint + Prettier** — format & aturan kode otomatis (termasuk menegakkan aturan hooks!)
- **Testing**: **Vitest** + **React Testing Library** (uji komponen), **Playwright** (uji alur end-to-end)
- **DevTools React** (ekstensi browser) — inspeksi tree komponen & state

---

## H. Belajar berkelanjutan

- **react.dev** — dokumentasi resmi terbaru (interaktif, sangat bagus). Baca "Thinking in React".
- Bangun **project pribadi kecil**: catatan, cuaca (pakai API), kalkulator, portofolio.
- Kontribusi/baca kode open-source React di GitHub.

## Ide project untuk mengasah

1. **Notes app** — routing (list ↔ detail), localStorage
2. **Cuaca** — API key, loading/error, form lokasi (pakai Modul 09)
3. **Movie search** — TMDB API, pagination, debounce search
4. **E-commerce mini** — cart via Context, routing, filter
5. **Portofolio** — deploy ke Vercel (pakai Modul F!)

---

Ingat: tujuan kursus ini bukan menghafal API, melainkan **memahami model mental React** — deklaratif, state-driven, satu arah data, komponenisasi. Itu yang membuatmu bisa membaca & menulis kode React apa pun, selamanya. 🚀
