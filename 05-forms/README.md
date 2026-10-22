# Modul 05 — Forms (Controlled Components)

## Konsep: siapa yang memiliki nilai input?

Di HTML biasa, browser yang menyimpan nilai input. Di React, polanya dibalik: **state yang menyimpan, input hanya menampilkan dan melaporkan**. Ini disebut *controlled component*.

```jsx
<input
  value={nama}                          {/* nilai dari state */}
  onChange={(e) => setNama(e.target.value)} {/* ketikan → update state */}
/>
```

Kenapa repot? Karena dengan kendali penuh kamu bisa:

- validasi saat mengetik
- live preview / hitung karakter
- reset, isi otomatis, disable tombol — semua dari state
- satu sumber kebenaran untuk data form

## Checklist form di React

1. `value={state}` pada tiap input (checkbox/radio pakai `checked`)
2. `onChange` memanggil setState dengan `e.target.value`
3. `<form onSubmit={...}>` dan **`e.preventDefault()`** di handler — tanpa ini browser reload!
4. Tombol disabled dengan `disabled={!valid}` (conditional dari state)

## Form banyak field: satu objek state

```jsx
const [form, setForm] = useState({ nama: "", email: "", setuju: false });

function ubah(e) {
  const { name, value, type, checked } = e.target;
  setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
}
```

Trik `name` + computed key `[name]` membuat SATU handler menangani semua field. `type === "checkbox" ? checked : value` wajib karena checkbox menyimpan di `.checked`, bukan `.value`.

## Validasi sederhana

- Simpan pesan error di state (`error`)
- Cek saat submit; set error bila gagal
- Hapus error saat user mengetik lagi (UX lebih enak)
- Library validasi besar (Yup, Zod) muncul di project nyata — konsepnya tetap sama

## Menjalankan

```bash
npm install && npm run dev
```

Perhatikan di App.jsx: komponen `InputTerkontrol` menampilkan input controlled vs uncontrolled berdampingan. Ketik di keduanya, lalu bandingkan nilainya saat kamu "reload state" — hanya yang controlled yang bisa kamu baca dari kode.

## Latihan

1. Tambahkan field "nomor HP" di `FormDaftar` dengan validasi: wajib 10–13 digit angka.
2. Buat "konfirmasikan password" — submit gagal kalau keduanya beda.
3. Pada `TodoMini`: tambahkan tombol "Hapus semua" dengan `window.confirm`.
4. Refleksi: apa akibatnya kalau kamu lupa `e.preventDefault()` di submit? Coba dan lihat sendiri.

<details>
<summary>Petunjuk latihan 2</summary>

```jsx
if (form.password !== form.konfirmasi) {
  setError("Password tidak cocok.");
  return;
}
```
</details>

## Cek pemahaman

- [ ] Saya bisa menjelaskan "controlled" vs "uncontrolled" input
- [ ] Saya selalu ingat `e.preventDefault()` di submit
- [ ] Saya bisa menulis satu handler untuk form multi-field
- [ ] Saya tahu `checked` untuk checkbox, `value` untuk sisanya

Kalau sudah → lanjut ke [Modul 06 — Lifting State & Context](../06-lifting-context).
