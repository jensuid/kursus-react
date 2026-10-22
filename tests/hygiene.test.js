// @vitest-environment node
// Uji kebersihan repo — hal-hal yang tidak bisa dijaga oleh lint maupun build.
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { getFileInfo } from "prettier";

const REPO = join(import.meta.dirname, "..");

function baca(rel) {
  return readFileSync(join(REPO, rel), "utf8");
}

// Folder yang isinya adalah MATERI AJAR, bukan kode produksi. Bentuknya
// (kolom komentar yang disejajarkan, fixture LATIHAN yang sengaja tidak dipakai)
// punya nilai didaktik, sehingga tidak boleh disentuh formatter.
const DIR_MENIT_AJAR = [
  "00-es6-crash-course",
  ...readdirSync(REPO, { withFileTypes: true })
    .filter((d) => d.isDirectory() && /^[01]\d-/.test(d.name))
    .filter((d) => d.name !== "00-es6-crash-course")
    .map((d) => d.name),
];

describe("Prettier tidak menyentuh materi ajar", () => {
  // Kita tanya ke Prettier langsung, bukan membaca isi .prettierignore:
  // file itu memakai glob (`01-*/`), jadi mencocokkan teksnya akan merah
  // walau pengabaian sebenarnya bekerja.
  for (const dir of DIR_MENIT_AJAR) {
    it(`${dir} diabaikan Prettier`, async () => {
      const sampel =
        dir === "00-es6-crash-course"
          ? join(dir, "01-let-const-arrow.js")
          : join(dir, "src", "App.jsx");
      const info = await getFileInfo(sampel, {
        ignorePath: ".prettierignore",
        config: false,
      });
      expect(info.ignored, `${sampel} ternyata ikut diformat`).toBe(true);
    });
  }

  it("KONTROL NEGATIF: kode hub justru TIDAK diabaikan", async () => {
    // Tanpa pemeriksaan ini, seseorang bisa memasukkan `*` ke .prettierignore
    // dan semua uji di atas tetap hijau tanpa melindungi apa pun.
    const info = await getFileInfo("src/pages/ModulePage.jsx", {
      ignorePath: ".prettierignore",
      config: false,
    });
    expect(info.ignored).toBe(false);
  });

  it("baris pembanding di 01 masih satu baris utuh (bukti bentuk ajar terjaga)", () => {
    // Kalau ignore suatu saat dicabut lalu `npm run format` jalan, Prettier
    // memecah baris ini jadi beberapa baris -- uji ini yang menangkapnya.
    const isi = baca("00-es6-crash-course/01-let-const-arrow.js");
    expect(isi).toMatch(/function biasa\(x\) \{ return x \* 2; \}/);
  });
});

describe("materi ajar Modul 00 tidak kehilangan inti pelajarannya", () => {
  // Ini pemeriksaan yang saya sebut "tidak akan tertangkap CI" di
  // docs/HANDOFF.md §3.5. Sekarang tertangkap: kalau baris pembanding
  // dihapus atau diformat ulang, uji ini merah.
  it("01-let-const-arrow.js masih memuat pasangan fungsi biasa vs arrow", () => {
    const isi = baca("00-es6-crash-course/01-let-const-arrow.js");
    expect(isi).toMatch(/function\s+biasa\s*\(/);
    expect(isi).toMatch(/const\s+arrow\s*=/);
    // Kedua bentuk harus bersebelahan supaya pembacanya bisa membandingkan.
    expect(isi).toMatch(/biasa\(/);
  });

  it("05-optional-nullish.js masih memperdebatkan || lawan ??", () => {
    const isi = baca("00-es6-crash-course/05-optional-nullish.js");
    expect(isi).toMatch(/\?\?/);
    expect(isi).toMatch(/\|\|/);
  });

  it("08-misc.js benar-benar memakai pesanError (bukan cuma mendeklarasikan)", () => {
    // Regresi nyata yang pernah ditemukan ESLint: variabel demo dideklarasikan
    // tapi tidak pernah dicetak, sehingga tidak mengajarkan apa pun.
    const isi = baca("00-es6-crash-course/08-misc.js");
    expect(isi).toMatch(/pesanError\s*&&/);
  });

  it("tiap bab Modul 00 menutup dengan bagian LATIHAN", () => {
    const bab = readdirSync(join(REPO, "00-es6-crash-course")).filter((f) =>
      /^\d\d-.*\.js$/.test(f)
    );
    expect(bab.length).toBeGreaterThanOrEqual(8);
    for (const f of bab) {
      expect(
        baca(join("00-es6-crash-course", f)),
        `${f} tanpa LATIHAN`
      ).toMatch(/LATIHAN/);
    }
  });
});

describe("tidak ada karakter non-Latin yang terselip", () => {
  // Komentar dan pesan commit kursus ini berbahasa Indonesia; huruf Mandarin
  // pernah dua kali lolos ke dokumen dan pesan commit karena kekeliruan input.
  const CJK = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/;

  const ciblek = [];
  function jalan(rel) {
    const abs = join(REPO, rel);
    for (const nama of readdirSync(abs)) {
      if (
        ["node_modules", "dist", ".git", ".vite"].includes(nama) ||
        nama.startsWith(".")
      )
        continue;
      const p = join(rel, nama);
      const st = statSync(join(REPO, p));
      if (st.isDirectory()) jalan(p);
      else if (/\.(js|jsx|css|md|json|yml|yaml)$/.test(nama)) ciblek.push(p);
    }
  }
  jalan(".");

  it("tidak ada file sumber yang memuat huruf Han/Hiragana/Katakana", () => {
    const terserempet = ciblek.filter(
      (rel) => CJK.test(baca(rel)) && rel !== join("tests", "hygiene.test.js")
    );
    // File uji ini dikecualikan karena rentang Unicode-nya ditulis di sini.
    expect(terserempet).toEqual([]);
  });
});
