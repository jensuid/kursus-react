// =====================================================================
// MODUL 01 — Hello Component
// Komponen, JSX, Props, dan Children.
// Semua contoh dalam satu file ini agar mudah dibaca berurutan.
// =====================================================================

// ---------------------------------------------------------------
// 1. KOMPONEN = fungsi JavaScript yang mengembalikan JSX
// ---------------------------------------------------------------
// Nama komponen SELALU huruf besar. Satu file = satu komponen
// (konvensi), tapi untuk belajar kita kumpulkan beberapa di sini.

function Halo() {
  // Yang dikembalikan fungsi ini disebut JSX: "HTML" di dalam JS.
  // Sebenarnya bukan HTML — JSX akan diubah React menjadi element.
  return <h2>Halo dari komponen React!</h2>;
}

// Versi arrow function (sama persis, selera tim biasanya):
const Sapaan = () => <p>Components are just functions that return UI.</p>;

// ---------------------------------------------------------------
// 2. JSX = HTML + ekspresi JavaScript di dalam { }
// ---------------------------------------------------------------
const nama = "Andi";
const angka = 7;

function ContohJSX() {
  return (
    <div>
      {/* Sisipkan nilai dengan kurung kurawal */}
      <p>Nama saya {nama}</p>

      {/* Yang di dalam { } adalah EKSPRESI JavaScript: */}
      <p>7 × 6 = {angka * 6}</p>
      <p>Sapaan: {nama.toUpperCase()}!</p>
      <p>Genap? {angka % 2 === 0 ? "iya" : "tidak"} </p>

      {/* Teks biasa TIDAK perlu kurawal. Template literal juga boleh: */}
      <p>{`Halo ${nama}, umurmu ${25 + angka} tahun`}</p>

      {/* ATRIBUT pakai camelCase, bukan HTML murni:
          class → className, for → htmlFor, onclick → onClick */}
      <p className="catatan">Perhatikan className di baris kode.</p>

      {/* Tag harus tertutup: <img /> bukan <img> */}
      {/* Satu return harus SATU elemen akar — makanya dibungkus <div>.
          Alternatif ringan: fragment <> ... </> (tidak menambah elemen) */}
    </div>
  );
}

// ---------------------------------------------------------------
// 3. PROPS = data yang dikirim KE komponen (read-only!)
// ---------------------------------------------------------------
// Props datang sebagai satu objek — kita bongkar dengan destructuring
// (ingat pelajaran ES6 02!). Props TIDAK BOLEH diubah di dalam komponen.

function KartuProfil({ nama, kota, emoji = "🧑" }) {
  return (
    <div style={{ border: "1px solid #ccc", borderRadius: 12, padding: 16, margin: "8px 0" }}>
      <h3>{emoji} {nama}</h3>
      <p>Tinggal di {kota}</p>
    </div>
  );
}

// Props bisa berupa apa saja: string, angka, boolean, fungsi, objek...
function Daftar({ judul, items }) {
  return (
    <div>
      <strong>{judul}</strong>
      <ul>
        {/* Rendering list pakai .map() — preview dari modul 04! */}
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------
// 4. CHILDREN = konten yang "diselipkan" di antara tag komponen
// ---------------------------------------------------------------
// <Kotak>ISI DI SINI</Kotak>  →  ISI masuk ke props.children
function Kotak({ warna = "#fff", children }) {
  return (
    <div style={{ background: warna, padding: 16, borderRadius: 12, margin: "8px 0" }}>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------
// 5. KOMPONISASI — komponen besar disusun dari komponen kecil
// ---------------------------------------------------------------
// Inilah "jiwa" React: bagi UI jadi bagian kecil yang reusable,
// lalu susun seperti balok LEGO.
function HalamanProfil() {
  const hobi = ["memanah", "masker anime", "koding"];
  return (
    <div>
      <KartuProfil nama="Sari" kota="Denpasar" emoji="👩‍🎨" />
      <KartuProfil nama="Budi" kota="Yogyakarta" />
      <Daftar judul="Hobi Sari" items={hobi} />
      <Kotak warna="#ffe9c4">
        <p>Children bisa berupa komponen lain juga:</p>
        <KartuProfil nama="Riko" kota="Makassar" emoji="🧑‍🚀" />
      </Kotak>
      <Kotak>
        Teks biasa, <strong>bold</strong>, dan komponen — semua boleh!
      </Kotak>
    </div>
  );
}

// =====================================================================
// App = komponen akar project ini. Perhatikan bagaimana semua contoh
// di atas "dipanggil" seperti tag HTML: <NamaKomponen />
// =====================================================================
export default function App() {
  return (
    <main>
      <h1>Modul 01 — Hello Component</h1>
      <p>
        Buka <code>src/App.jsx</code> dan baca komentar sambil melihat halaman
        ini. Setiap bagian di bawah adalah contoh dari file yang sama.
      </p>

      <h2>1. Komponen sederhana</h2>
      <Halo />
      <Sapaan />

      <h2>2. JSX & ekspresi {"{ }"}</h2>
      <ContohJSX />

      <h2>3 & 4. Props dan Children</h2>
      <HalamanProfil />
    </main>
  );
}
