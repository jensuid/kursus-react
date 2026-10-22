// @vitest-environment node
// Uji struktur di disk: folder modul ↔ registry ↔ rantai CSS bersama.
//
// Berkas ini ada karena dua keputusan baru yang mudah rusak diam-diam:
//   1. H4: gaya global hanya ada di styles/base.css, dan tiap modul mengimpor
//      file itu. Kalau impor hilang, modul tetap BUILD sukses dan lint tetap
//      hijau — hanya tampilannya yang hancur pelan-pelan.
//   2. Modul baru yang dibuat di disk tapi lupa didaftarkan di modules.js tidak
//      akan muncul di hub mana pun, tanpa pesan error.
import { describe, expect, it } from "vitest";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { modules } from "../src/modules.js";

const REPO = join(import.meta.dirname, "..");

const folderModulReact = modules
  .filter((m) => m.type === "react")
  .map((m) => m.folder);

describe("folder modul di disk", () => {
  it("tiap entri registry punya folder dengan App.jsx yang diekspor default", () => {
    for (const folder of folderModulReact) {
      const app = join(REPO, folder, "src", "App.jsx");
      expect(existsSync(app), `tidak ada: ${app}`).toBe(true);
      expect(readFileSync(app, "utf8")).toMatch(/export default/);
    }
  });

  it("tiap modul punya README (sumber teori yang dibaca pembelajar)", () => {
    for (const folder of folderModulReact) {
      expect(
        existsSync(join(REPO, folder, "README.md")),
        `README hilang di ${folder}`
      ).toBe(true);
    }
  });

  it("tidak ada folder modul di disk yang lupa didaftarkan", () => {
    const diDisk = readdirSync(REPO, { withFileTypes: true })
      .filter((d) => d.isDirectory() && /^[01]\d-/.test(d.name))
      .map((d) => d.name)
      // 00 = script Node, 11 = markdown; keduanya bukan app React.
      .filter((n) => !n.startsWith("00-"));
    const terdaftar = modules.map((m) => m.folder);
    for (const folder of diDisk) {
      expect(
        terdaftar.includes(folder),
        `${folder} ada di disk tapi tidak ada di src/modules.js`
      ).toBe(true);
    }
  });
});

describe("rantai CSS bersama", () => {
  it("styles.css tiap modul mengimpor styles/base.css", () => {
    for (const folder of folderModulReact) {
      const cssPath = join(REPO, folder, "src", "styles.css");
      const isi = readFileSync(cssPath, "utf8");
      expect(isi, `${folder}/src/styles.css tidak mengimpor base.css`).toMatch(
        /@import\s+"\.\.\/\.\.\/styles\/base\.css"/
      );
    }
  });

  it("hub.css juga mengimpor base.css dan menimpa batas #root", () => {
    const hub = readFileSync(join(REPO, "src", "hub.css"), "utf8");
    expect(hub).toMatch(/@import\s+"\.\.\/styles\/base\.css"/);
    // Tanpa override ini, layout sidebar hub jadi sempit karena #root dibatasi 760px.
    expect(hub).toMatch(/#root\s*\{[^}]*max-width:\s*none/);
  });

  it("base.css memuat gaya yang diandalkan semua modul", () => {
    const base = readFileSync(join(REPO, "styles", "base.css"), "utf8");
    for (const selektor of ["body", "button", "input", "code", "#root"]) {
      expect(base, `base.css kehilangan ${selektor}`).toMatch(selektor);
    }
  });

  it("gaya global tidak lagi disalin per modul (poin H4)", () => {
    // Penjaga terhadap regresi ke model lama: aturan element selector yang sama
    // ditulis ulang di dalam styles.css modul.
    for (const folder of folderModulReact) {
      const isi = readFileSync(join(REPO, folder, "src", "styles.css"), "utf8");
      expect(isi, `${folder} menduplikasi gaya global lagi`).not.toMatch(
        /^body\s*\{/m
      );
      expect(isi).not.toMatch(/^button\s*\{/m);
    }
  });
});

describe("struktur hub", () => {
  it("halaman Modul 11 dimuat malas, bukan diimpor statis", () => {
    // Pernah terjadi tepat sesudah H6: NextStepsPage diimpor biasa, sehingga
    // react-markdown + micromark masuk chunk `index.js` (474 KB) dan SETIAP
    // pengunjung hub menanggungnya walau tidak membuka /modul/11. Setelah
    // dimuat malas: entry 309 KB, markdown 164 KB di chunk sendiri.
    const hub = readFileSync(join(REPO, "src", "Hub.jsx"), "utf8");
    expect(hub).not.toMatch(/^import\s+NextStepsPage\s+from/m);
    expect(hub).toMatch(/const NextStepsPage = lazy\(/);
    expect(hub).toMatch(/import\("\.\/pages\/NextStepsPage\.jsx"\)/);
    // Malas tanpa Suspense = halaman putih selagi chunk-nya belum tiba.
    // Bentuknya ditulis longgar (bukan `<Suspense ...>` satu baris) karena
    // Prettier bebas memecah atribut JSX ke beberapa baris; yang dijamin di
    // sini adalah urutan & pencocokan tag, bukan gaya penulisannya.
    expect(hub).toMatch(
      /<Suspense[\s\S]{0,200}<NextStepsPage \/>[\s\S]{0,60}<\/Suspense>/
    );
    expect(hub).toMatch(/fallback=\{/);
  });
});
