# Panduan Pakai — Untuk Pembelajar

Cara menjalankan dan mengerjakan kursus ini dari awal sampai akhir.
Butuh daftar modul & estimasi waktu? Lihat [README.md](../README.md).

## 1. Persiapan (sekali saja)

Pastikan Node.js terpasang. Buka terminal, ketik:
```bash
node -v
```
Kalau muncul versi (misal `v22.x`), siap. Kursus ini sudah ada di folder yang sedang kamu buka.

Versi minimum: **Node 20 ke atas disarankan**. Kalau komputermu masih Node 18,
tidak perlu panik — kursus ini tetap jalan penuh di 18 (sudah diuji di CI);
yang tidak jalan di 18 hanya alat periksa kode untuk pengembang, bukan
applikasinya.

## 2. Cara paling nyaman: Hub (semua modul di satu tempat)

Tidak perlu pindah folder satu-satu. Dari root proyek:

```bash
npm install      # sekali saja
npm run dev      # buka http://localhost:5200
```

Klik modul di sidebar untuk membukanya; demo modul 01-10 benar-benar berjalan
di dalam halaman itu. Modul 00 (ES6) dan 11 (panduan) ditampilkan sebagai bacaan;
Modul 11 dirender rapi (judul, daftar, blok kode), bukan teks mentah.
Tombol **Salin** di tiap halaman modul menyalin jalur file sumbernya, jadi kamu
tinggal membuka file itu di editor — teksnya berubah jadi "Tersalin!" saat
berhasil, dan "Gagal menyalin" kalau browser menolak (mis. akses lewat IP tanpa
HTTPS; di situ masih ada fallback, tapi tidak di semua browser).

Cara manual di bawah tetap berguna kalau kamu ingin mengisolasi satu modul,
atau sedang tidak ingin menjalankan hub. Keduanya tidak bentrok: hub memakai
port **5200**, modul mandiri memakai **5173**, jadi keduanya boleh jalan
bersamaan.

## 3. Mulai dari Modul 00 (fondasi)

Modul 00 adalah **crash course JavaScript ES6** — fondasi sebelum sentuh React. Modul ini **tidak perlu browser**, cukup terminal:

```bash
cd 00-es6-crash-course
node 01-let-const-arrow.js
node 02-destructuring-default.js
# ... lanjut urut sampai 08
```

Setiap file punya komentar penjelasan + bagian **LATIHAN** di bawah. Kerjakan latihannya (ketik kode tambahan di file itu sendiri).

## 4. Masuk Modul React (01–10) — tiap modul = app yang jalan

Untuk modul mana pun (misal Modul 01):

```bash
cd 01-hello-component
npm install        # sekali saja per modul (unduh dependency)
npm run dev        # jalankan → buka http://localhost:5173
```

Lalu di browser kamu akan melihat app-nya, dan **sambil itu buka file `src/App.jsx`** di editor. Baca komentar di kode berdampingan dengan hasilnya di layar.

## 5. Metode belajar per modul (urutan yang disarankan)

1. **Baca `README.md`** modul itu → pahami konsep intinya
2. **Jalankan** (`npm run dev`) → lihat hasilnya
3. **Baca `src/App.jsx`** sambil cocokkan dengan yang tampil
4. **Modifikasi iseng** → ganti teks/warna/tambah tombol, lihat apa yang error (ini cara tercepat paham)
5. **Kerjakan bagian "Latihan"** di akhir README
6. Lanjut modul berikutnya kalau sudah nyaman

## 6. Urutan lengkap

| Kalau kamu... | Ke modul |
|---|---|
| Belum yakin JS modern | `00-es6-crash-course` dulu |
| Sudah siap React | `01` → `02` → `03` → ... → `10` berurutan |
| Ingin bikin app sungguhan | `10-final-project` (Todo App) |
| Sudah selesai, mau lanjut | baca `11-next-steps.md` |

**Modul 03 (useState) dan 10 (Todo App)** adalah yang paling penting — jangan buru-buru lewat.

## 7. Berhenti & bersih

- Untuk menghentikan server dev: tekan `Ctrl + C` di terminal
- Untuk menjalankan modul lain: `cd` ke foldernya, `npm install` sekali, lalu `npm run dev`

---

Ringkasnya: **README untuk konsep → `npm run dev` untuk melihat → edit kode untuk mencoba → Latihan untuk menguji.** Mulai sekarang dengan menjalankan `node 01-let-const-arrow.js` di folder Modul 00, atau langsung `npm install && npm run dev` di root untuk membuka hub.