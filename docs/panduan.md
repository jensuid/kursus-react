Berikut cara menggunakan kursus React ini dari awal sampai akhir.

## 1. Persiapan (sekali saja)

Pastikan Node.js terpasang. Buka terminal, ketik:
```bash
node -v
```
Kalau muncul versi (misal `v22.x`), siap. Kursus ini sudah ada di folder yang sedang kamu buka.

## 2. Mulai dari Modul 00 (yang sedang kamu buka)

Modul 00 adalah **crash course JavaScript ES6** — fondasi sebelum sentuh React. Modul ini **tidak perlu browser**, cukup terminal:

```bash
cd 00-es6-crash-course
node 01-let-const-arrow.js
node 02-destructuring-default.js
# ... lanjut urut sampai 08
```

Setiap file punya komentar penjelasan + bagian **LATIHAN** di bawah. Kerjakan latihannya (ketik kode tambahan di file itu sendiri).

## 3. Masuk Modul React (01–10) — tiap modul = app yang jalan

Untuk modul mana pun (misal Modul 01):

```bash
cd 01-hello-component
npm install        # sekali saja per modul (unduh dependency)
npm run dev        # jalankan → buka http://localhost:5173
```

Lalu di browser kamu akan melihat app-nya, dan **sambil itu buka file `src/App.jsx`** di editor. Baca komentar di kode berdampingan dengan hasilnya di layar.

## 4. Metode belajar per modul (urutan yang disarankan)

1. **Baca `README.md`** modul itu → pahami konsep intinya
2. **Jalankan** (`npm run dev`) → lihat hasilnya
3. **Baca `src/App.jsx`** sambil cocokkan dengan yang tampil
4. **Modifikasi iseng** → ganti teks/warna/tambah tombol, lihat apa yang error (ini cara tercepat paham)
5. **Kerjakan bagian "Latihan"** di akhir README
6. Lanjut modul berikutnya kalau sudah nyaman

## 5. Urutan lengkap

| Kalau kamu... | Ke modul |
|---|---|
| Belum yakin JS modern | `00-es6-crash-course` dulu |
| Sudah siap React | `01` → `02` → `03` → ... → `10` berurutan |
| Ingin bikin app sungguhan | `10-final-project` (Todo App) |
| Sudah selesai, mau lanjut | baca `11-next-steps.md` |

**Modul 03 (useState) dan 10 (Todo App)** adalah yang paling penting — jangan buru-buru lewat.

## 6. Berhenti & bersih

- Untuk menghentikan server dev: tekan `Ctrl + C` di terminal
- Untuk menjalankan modul lain: `cd` ke foldernya, `npm install` sekali, lalu `npm run dev`

---

Ringkasnya: **README untuk konsep → `npm run dev` untuk melihat → edit kode untuk mencoba → Latihan untuk menguji.** Mulai sekarang dengan menjalankan `node 01-let-const-arrow.js` di folder Modul 00.

Mau saya jalankan salah satu modul sekarang supaya kamu langsung lihat hasilnya?