// Uji halaman Modul 11 (H6): markdown harus menjadi HTML, bukan tempelan teks.
//
// Berkas ini lahir dari temuan verifikasi browser sungguhan: setelah
// react-markdown dipasang, halaman ternyata punya DUA <h1> — judul header hub
// ("Next Steps") dan judul di dalam file markdown. Build sukses, lint hijau,
// dan tidak ada yang menganggap itu masalah; padahal urutan heading untuk
// pembaca layar jadi tidak jelas dan kedua judul nyaris sama besar.
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import NextStepsPage from "../src/pages/NextStepsPage.jsx";
import nextSteps from "../11-next-steps.md?raw";

const renderHalaman = () => render(<NextStepsPage />).container;

describe("halaman Next Steps (modul 11)", () => {
  it("isi markdown benar-benar terbaca sampai ke halaman", () => {
    const halaman = renderHalaman();
    // Kalau impor `?raw` gagal diproses, halaman tetap "sukses" tapi kosong.
    expect(halaman.textContent).toContain("React Router");
    expect(halaman.textContent.length).toBeGreaterThan(500);
  });

  it("menghasilkan heading nyata, bukan tanda # yang masih mentah", () => {
    const halaman = renderHalaman();
    expect(halaman.querySelectorAll("h2").length).toBeGreaterThan(0);
    expect(halaman.querySelectorAll("h3").length).toBeGreaterThanOrEqual(10);

    for (const el of halaman.querySelectorAll("h1, h2, h3, p, li")) {
      const teks = el.textContent.trim();
      expect(teks.startsWith("#"), `masih mentah: ${teks.slice(0, 40)}`).toBe(
        false
      );
    }
  });

  it("tepat satu <h1> — judul file markdown sudah turun tingkat", () => {
    const halaman = renderHalaman();
    const h1 = halaman.querySelectorAll("h1");
    expect(h1).toHaveLength(1);
    expect(h1[0].textContent).toBe("Next Steps");
    // Judul file markdown sekarang menempati h2, tepat di bawahnya.
    expect(halaman.querySelector("h2").textContent).toContain("Modul 11");
  });

  it("daftar dan blok kode ikut ter-render", () => {
    const halaman = renderHalaman();
    expect(halaman.querySelectorAll("ul, ol").length).toBeGreaterThan(0);

    // Jumlah blok kode di HTML harus sama dengan jumlah pagar ``` di file
    // aslinya, dibagi dua. Sebelumnya saya menulis "tautan ikut ter-render"
    // di sini, padahal file ini tidak punya satu pun tautan (terverifikasi:
    // `grep http 11-next-steps.md` = 0) -- uji seperti itu akan hijau tanpa
    // memeriksa apa pun.
    const fence = nextSteps
      .split("\n")
      .filter((baris) => baris.trimStart().startsWith("```")).length;
    expect(fence % 2).toBe(0);
    expect(halaman.querySelectorAll("pre").length).toBe(fence / 2);
  });

  it("KONTROL NEGATIF: tidak ada <pre> tunggal yang membungkus seluruh isi", () => {
    // Ini bentuk lama (sebelum H6): seluruh file markdown dituang ke satu <pre>.
    // Tanpa pemeriksaan ini, mengembalikan `<pre>` itu tetap lolos tiga uji di
    // atas selama tanda "#" tidak dianggap heading.
    const halaman = renderHalaman();
    const anakPertama = halaman.querySelector(".hub-md").firstElementChild;
    expect(anakPertama.tagName).not.toBe("PRE");
  });
});
