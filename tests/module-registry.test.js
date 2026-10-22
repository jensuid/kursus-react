// Uji registry modul (src/modules.js) — satu-satunya daftar yang menggerakkan
// sidebar, rute, dan kartu ringkasan.
import { describe, expect, it } from "vitest";
import { modules, findModule } from "../src/modules.js";

describe("registry modul", () => {
  it("mencatat 12 entri (00 ES6 + 01-10 React + 11 panduan)", () => {
    expect(modules).toHaveLength(12);
  });

  it("nomornya unik dan berurutan 00..11", () => {
    const nomor = modules.map((m) => m.num);
    expect(nomor).toEqual([...nomor].sort());
    expect(new Set(nomor).size).toBe(nomor.length);
    expect(nomor[nomor.length - 1]).toBe("11");
  });

  it("tiap entri punya field yang dipakai sidebar & kartu ringkasan", () => {
    for (const m of modules) {
      expect(m.num).toMatch(/^\d{2}$/);
      expect(m.title.length).toBeGreaterThan(0);
      expect(m.desc.length).toBeGreaterThan(0);
      expect(["es6", "react", "md"]).toContain(m.type);
    }
  });

  it("hanya entri React yang punya komponen malas", () => {
    const reaktif = modules.filter((m) => m.type === "react");
    expect(reaktif).toHaveLength(10);
    for (const m of reaktif) {
      // React.lazy mengembalikan objek, bukan fungsi biasa.
      expect(m.Component).toBeDefined();
    }
    for (const m of modules.filter((m) => m.type !== "react")) {
      expect(m.Component).toBeUndefined();
    }
  });

  it("findModule mengenali nomor yang ada dan mengembalikan undefined untuk yang tidak", () => {
    // Judulnya memang hanya "useEffect" (folder: 07-useeffect); "& Data Fetching"
    // ada di Modul 09. Diuji eksplisit supaya perubahan judul disengaja,
    // bukan lolos diam-diam.
    expect(findModule("07").title).toBe("useEffect");
    expect(findModule("99")).toBeUndefined();
    expect(findModule("")).toBeUndefined();
  });
});
