# Modul 10 — Proyek Akhir: Todo App 🎯

Selamat! Ini tempat semua modul bertemu. Kamu membangun aplikasi React **nyata** yang memakai setiap konsep dari modul 01–09. Baca README ini SESUDAH mencoba memahami kodenya — di sinilah pengetahuanmu "klik".

## Menjalankan

```bash
cd 10-final-project
npm install
npm run dev
```

## Fitur app

- Tambah, centang selesai, hapus, **dan edit** tugas (klik dua kali teks / tombol ✏️)
- Filter: Semua / Belum selesai / Selesai
- Statistik + progress bar di header
- "Bersihkan selesai" di footer
- **Persistensi**: semua tersimpan di localStorage — refresh tidak hilang

## Arsitektur — peta komponen

```
App.jsx  (OTAK — memegang state `todos` & `filter`)
│
├─ Header.jsx      terima { total, selesai }         → progress bar
├─ TodoInput.jsx   kirim onTambah                   → form controlled
├─ TodoList.jsx    terima todos + callback aksi
│    └─ TodoItem.jsx  state LOKAL `mengedit`        → list + keys
└─ Footer.jsx      terima { filter, sisa, ... }      → tabs conditional class
```

## Alur data (dua arah, satu sumber kebenaran)

```
   state di App
   ┌───────────────┐
   │  todos:[...]  │
   │  filter:"all" │
   └───────┬───────┘
   turun ↓ props        ↑ naik callback (aksi)
   ke komponen         onTambah/onToggle/
   anak                 onHapus/onEdit
```

**Setiap aksi mengubah state di App, bukan di anak.** Anak hanya bilang "terjadi sesuatu", parent yang memutuskan state baru. Inilah yang membuat data selalu konsisten.

## Pemetaan modul → kode

| Konsep | Modul | Di mana di app ini |
|--------|-------|--------------------|
| Komponen & props | 01 | semua file `.jsx` |
| Conditional class | 02 | `tab.aktif`, `todo-item.selesai` |
| useState + salinan baru | 03 | `tambah`, `toggle`, `edit` |
| map + key | 04 | `todos.map(...)` di TodoList |
| Controlled form | 05 | `TodoInput` |
| Lifting state + callback | 06 | `onTambah`, `onToggle`, dsb |
| Derive tanpa effect | 07 | `yangDitampilkan`, `selesaiCount` |
| Custom hook + localStorage | 08 | `useLocalStorage` |
| useMemo | (bonus) | menyaring list secara efisien |

## Tantangan lanjutan (latihan sungguhan!)

Pilih satu dan coba sendiri — ini menguji pemahamanmu:

1. **Tambah prioritas**: setiap todo punya `prioritas: "low"|"med"|"high"` dengan warna berbeda.
2. **due date**: input tanggal; todo overdue ditandai merah.
3. **cari tugas**: input di atas list yang memfilter `todos` (bukan state baru — cukup derive!).
4. **drag to reorder** atau tombol ↑↓ untuk memindahkan posisi.
5. **undo hapus**: simpan yang dihapus, beri jendela 5 detik untuk "batalkan".

## Ide pengembangan (kalau mau lebih jauh)

- Ubah todo jadi tersimpan dari API (Modul 09 `useFetch`)
- Tambah dark mode lewat Context (Modul 06)
- Pisahkan logika aksi ke custom hook `useTodos()` agar App makin ramping

## Cek akhir — apakah kamu sudah "bisa React"?

Coba jawab TANPA melihat kode:

- [ ] Bisa menjelaskan kenapa state `todos` ada di App, bukan di TodoList?
- [ ] Bisa menulis ulang fungsi `toggle` dari nol?
- [ ] Tahu apa yang terjadi kalau `key` di TodoList dihapus?
- [ ] Paham kenapa `yangDitampilkan` TIDAK perlu `useState`/`useEffect`?

Kalau semua terjawab, kamu sudah melewati tujuan kursus ini: **mengerti konsep dan mampu membuat app React sendiri.** Lanjut ke [Modul 11 — Next Steps](./11-next-steps.md) untuk arah berikutnya.
