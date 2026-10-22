// @vitest-environment node
// Uji perilaku scripts/dedup-modules.sh — perkakas hemat disk untuk maintainer.
//
// Skrip ini menghapus dan menyalin pohon node_modules. Kesalahannya tidak
// berbunyi: build tetap sukses, lint tetap hijau, padahal folder berisi pohon
// milik modul lain. Karena yang dijaga adalah KEPUTUSAN (folder mana yang boleh
// disentuh), uji ini menjalankan skripnya sungguhan terhadap fixture kecil di
// temp — bukan memeriksa teks skrip dengan regex, yang cuma membuktikan saya
// sudah menulis deretan kata.
import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { execFileSync, spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const repoRoot = join(import.meta.dirname, "..");
const skrip = join(repoRoot, "scripts", "dedup-modules.sh");

// Fixture dibuat di temp, BUKAN di dalam repo: tests/struktur-modul.test.js
// memindai folder NN-* di root repo, dan folder peraga di sana akan membuatnya
// marah (dengan alasan yang benar).
const fixture = join(tmpdir(), "uji-dedup-modul");
const sama = '{"react":{"version":"19.3.1"},"vite":{"version":"6.4.5"}}';
const beda = '{"react":{"version":"18.2.0"}}';

function bikinModul(nama, isiLockfile, denganNodeModules = false) {
  const d = join(fixture, nama);
  mkdirSync(join(d, "src"), { recursive: true });
  writeFileSync(join(d, "vite.config.js"), "export default {};\n");
  writeFileSync(join(d, "package.json"), JSON.stringify({ name: nama }));
  writeFileSync(
    join(d, "package-lock.json"),
    `{ "name": "${nama}", "lockfileVersion": 3, "packages": ${isiLockfile} }\n`
  );
  if (denganNodeModules) {
    mkdirSync(join(d, "node_modules", "react"), { recursive: true });
    mkdirSync(join(d, "node_modules", "vite"), { recursive: true });
    mkdirSync(join(d, "node_modules", ".bin"), { recursive: true });
    writeFileSync(
      join(d, "node_modules", "react", "package.json"),
      '{"name":"react","version":"19.3.1"}'
    );
    writeFileSync(
      join(d, "node_modules", "vite", "package.json"),
      '{"name":"vite","version":"6.4.5"}'
    );
    writeFileSync(join(d, "node_modules", ".bin", "vite"), "#!/bin/sh\n");
  }
  return d;
}

function jalankan(argumen = [], env = {}) {
  return spawnSync("bash", [skrip, ...argumen], {
    encoding: "utf8",
    env: { ...process.env, REPO_DIR: fixture, ...env },
  });
}

// `cp -c` hanya berhasil di filesystem yang mendukung reflink (APFS/btrfs).
// Di luar itu, jalur klonnya tidak bisa diuji — bukan berarti tidak dijaga:
// kontrol negatif di blok "tanpa dukungan clone" tetap jalan di mana saja.
const mendukungClone = (() => {
  const uji = join(tmpdir(), "uji-dedup-reflink");
  try {
    rmSync(uji, { recursive: true, force: true });
    mkdirSync(uji, { recursive: true });
    writeFileSync(join(uji, "sumber.txt"), "x");
    execFileSync("cp", ["-c", join(uji, "sumber.txt"), join(uji, "clone.txt")]);
    return existsSync(join(uji, "clone.txt"));
  } catch {
    return false;
  } finally {
    rmSync(uji, { recursive: true, force: true });
  }
})();

beforeAll(() => {
  rmSync(fixture, { recursive: true, force: true });
  mkdirSync(fixture, { recursive: true });
});

afterAll(() => {
  rmSync(fixture, { recursive: true, force: true });
});

describe("skrip ada dan terdaftar", () => {
  it("ada di disk dan bisa dieksekusi", () => {
    expect(existsSync(skrip)).toBe(true);
    // statSync().mode portable; `stat -f %Lp` khusus BSD dan akan pecah di runner Linux.
    expect(statSync(skrip).mode & 0o111).not.toBe(0);
  });

  it("terdaftar sebagai npm run setup:shared", () => {
    const pkg = JSON.parse(
      readFileSync(join(repoRoot, "package.json"), "utf8")
    );
    expect(pkg.scripts["setup:shared"]).toMatch(/dedup-modules\.sh$/);
  });
});

describe("pemilihan folder yang boleh disentuh", () => {
  it("menolak argumen yang tidak dikenal", () => {
    bikinModul("01-apa", sama, true);
    const hasil = jalankan(["--hapus-semua"]);
    expect(hasil.status).toBe(2);
    expect(hasil.stderr).toMatch("Argumen tidak dikenal");
  });

  it("berhenti dengan petunjuk kalau belum ada donor", () => {
    rmSync(fixture, { recursive: true, force: true });
    mkdirSync(fixture, { recursive: true });
    bikinModul("01-kosong", sama);
    const hasil = jalankan();
    expect(hasil.status).toBe(1);
    expect(hasil.stdout + hasil.stderr).toMatch("npm install");
  });

  it("berhenti kalau folder peraga tidak berisi modul", () => {
    rmSync(fixture, { recursive: true, force: true });
    mkdirSync(join(fixture, "catatan"), { recursive: true });
    const hasil = jalankan();
    expect(hasil.status).toBe(1);
    expect(hasil.stdout + hasil.stderr).toMatch(/Tidak ada folder modul/);
  });
});

describe("penjaga lockfile dan pohon yang sudah ada", () => {
  beforeAll(() => {
    rmSync(fixture, { recursive: true, force: true });
    mkdirSync(fixture, { recursive: true });
    bikinModul("01-donor", sama, true);
    bikinModul("02-kosong", sama);
    // Lockfile 03 berbeda isinya -> tidak boleh ikut dapat pohon donor.
    bikinModul("03-bedanya", beda);
    // 04 sudah punya node_modules sendiri -> butuh --force.
    bikinModul("04-sudah-ada", sama, true);
    writeFileSync(
      join(fixture, "04-sudah-ada", "node_modules", "penanda-asli.txt"),
      "jangan dihapus tanpa --force"
    );
  });

  it("--dry-run tidak mengubah susunan folder sama sekali", () => {
    const sebelum = daftarPohon();
    const hasil = jalankan(["--dry-run"]);
    expect(hasil.status).toBe(0);
    expect(hasil.stdout).toMatch(/RENCANA 02-kosong/);
    expect(daftarPohon()).toEqual(sebelum);
  });

  it("melewati folder yang lockfile-nya tidak setara dengan donor", () => {
    const hasil = jalankan(["--dry-run"]);
    expect(hasil.stdout).toMatch(/LEWAT\s+03-bedanya/);
    expect(existsSync(join(fixture, "03-bedanya", "node_modules"))).toBe(false);
  });

  it("melewati folder yang sudah punya node_modules tanpa --force", () => {
    const hasil = jalankan();
    expect(hasil.stdout).toMatch(/LEWAT\s+04-sudah-ada/);
    expect(
      existsSync(
        join(fixture, "04-sudah-ada", "node_modules", "penanda-asli.txt")
      )
    ).toBe(true);
  });

  it("--force memang mengganti pohon yang versinya setara", () => {
    const hasil = jalankan(["--force"]);
    expect(hasil.status).toBe(0);
    expect(hasil.stdout).toMatch(/ISI\s+04-sudah-ada/);
    expect(
      existsSync(
        join(fixture, "04-sudah-ada", "node_modules", "penanda-asli.txt")
      )
    ).toBe(false);
    // Kontrol: folder yang lockfile-nya beda TETAP tidak tersentuh walau --force.
    expect(existsSync(join(fixture, "03-bedanya", "node_modules"))).toBe(false);
  });

  it("tidak meninggalkan berkas sementara di mana pun", () => {
    const sisa = jalankanSisa();
    expect(sisa).toEqual([]);
  });
});

describe("data repo yang sebenarnya", () => {
  // Run hanya kalau ada folder modul yang sudah di-install di mesin ini.
  // Di runner CI (job hub) folder modul kosong, dan skrip memang seharusnya
  // menolak tanpa apa-apa -- itu sudah dijaga uji "belum ada donor" di atas.
  const adaDonor = readdirSync(repoRoot, { withFileTypes: true })
    .filter((e) => e.isDirectory() && /^[0-9][0-9]-/.test(e.name))
    .some((e) => existsSync(join(repoRoot, e.name, "node_modules")));

  it.runIf(adaDonor)(
    "kesepuluh lockfile modul dianggap setara oleh normalisasi name",
    () => {
      // Ini inti klaim hemat disk: kalau normalisasi salah, skrip akan bilang
      // "tidak setara" untuk semua folder dan tidak ada yang terisi -- tanpa error.
      const hasil = spawnSync("bash", [skrip, "--dry-run", "--force"], {
        encoding: "utf8",
        env: { ...process.env, REPO_DIR: repoRoot },
      });
      expect(hasil.status).toBe(0);
      const akanDiganti = (hasil.stdout.match(/RENCANA/g) || []).length;
      expect(akanDiganti).toBe(9);
      expect(hasil.stdout).not.toMatch(/lockfile tidak setara/);
      expect(hasil.stdout).not.toMatch(/TANPA-LOCKFILE/);
    }
  );
});

describe.runIf(mendukungClone)("jalur clone sungguhan", () => {
  beforeAll(() => {
    rmSync(fixture, { recursive: true, force: true });
    mkdirSync(fixture, { recursive: true });
    bikinModul("01-donor", sama, true);
    bikinModul("02-kosong", sama);
    // Cache optimizer Vite menyimpan jalur absolut -> harus tidak ikut pindah.
    mkdirSync(join(fixture, "01-donor", "node_modules", ".vite", "deps"), {
      recursive: true,
    });
    writeFileSync(
      join(
        fixture,
        "01-donor",
        "node_modules",
        ".vite",
        "deps",
        "_metadata.json"
      ),
      JSON.stringify({
        root: join(fixture, "01-donor"),
        storeDir: join(fixture, "01-donor", "node_modules", ".vite"),
      })
    );
  });

  it("menghitung kunci donor SEBELUM donor dipakai (regresi urutan)", () => {
    // Pernah rusak sunyi: `kunci_of` dipanggil sebelum daftarnya dihitung, jadi
    // kunci donor kosong dan SEMUA folder tampak "tidak setara" -- skrip tetap
    // exit 0 tanpa mengisi apa pun.
    const hasil = jalankan(["--dry-run"]);
    expect(hasil.stdout).toMatch(/Donor: 01-donor \(lockfile [0-9a-f]{32}\)/);
  });

  it("mengisi folder kosong dengan pohon yang isinya setara donor", () => {
    const hasil = jalankan();
    expect(hasil.status).toBe(0);
    expect(hasil.stdout).toMatch(/ISI\s+02-kosong/);
    const target = join(fixture, "02-kosong", "node_modules");
    for (const berkas of [
      "react/package.json",
      "vite/package.json",
      ".bin/vite",
    ]) {
      expect(readFileSync(join(target, berkas), "utf8")).toBe(
        readFileSync(join(fixture, "01-donor", "node_modules", berkas), "utf8")
      );
    }
  });

  it("cache .vite milik donor tidak ditinggalkan di folder hasil klon", () => {
    expect(
      existsSync(join(fixture, "02-kosong", "node_modules", ".vite"))
    ).toBe(false);
    // ...dan cache donor sendiri tidak boleh ikut terhapus.
    expect(
      existsSync(
        join(
          fixture,
          "01-donor",
          "node_modules",
          ".vite",
          "deps",
          "_metadata.json"
        )
      )
    ).toBe(true);
  });

  it("clone tetap independen: mengubah salinan tidak menyentuh donor", () => {
    const clone = join(
      fixture,
      "02-kosong",
      "node_modules",
      "react",
      "package.json"
    );
    const donor = join(
      fixture,
      "01-donor",
      "node_modules",
      "react",
      "package.json"
    );
    const isiAwalDonor = readFileSync(donor, "utf8");
    writeFileSync(clone, '{"name":"react","version":"DIUBAH-LEWAT-UJI"}');
    expect(readFileSync(clone, "utf8")).toContain("DIUBAH-LEWAT-UJI");
    expect(readFileSync(donor, "utf8")).toBe(isiAwalDonor);
  });
});

describe("kalau filesystem tidak mendukung clone", () => {
  beforeAll(() => {
    rmSync(fixture, { recursive: true, force: true });
    mkdirSync(fixture, { recursive: true });
    bikinModul("01-donor", sama, true);
    bikinModul("02-kosong", sama);
  });

  it("berhenti sebelum ada yang menghapus, dan mengarahkan ke npm install", () => {
    // cp palsu: -c selalu gagal, meniru ext4/NFS/dosfs dan runner CI Linux.
    const binPalsu = join(tmpdir(), "uji-dedup-fakebin");
    rmSync(binPalsu, { recursive: true, force: true });
    mkdirSync(binPalsu, { recursive: true });
    const cpPalsu = join(binPalsu, "cp");
    writeFileSync(
      cpPalsu,
      '#!/bin/sh\nfor a in "$@"; do if [ "$a" = "-c" ]; then echo "cp: clonefile failed: Operation not supported" >&2; exit 1; fi; done\nexec /bin/cp "$@"\n',
      { mode: 0o755 }
    );
    const hasil = spawnSync("bash", [skrip], {
      encoding: "utf8",
      env: {
        ...process.env,
        REPO_DIR: fixture,
        PATH: `${binPalsu}:${process.env.PATH}`,
      },
    });
    rmSync(cpPalsu, { force: true });
    expect(hasil.status).toBe(1);
    expect(hasil.stdout + hasil.stderr).toMatch(/tidak mendukung clone/);
    expect(existsSync(join(fixture, "02-kosong", "node_modules"))).toBe(false);
  });
});

function daftarPohon() {
  return daftarBerkas(["-name", "node_modules", "-type", "d"]);
}

function jalankanSisa() {
  // `-print` di ujung itu wajib, bukan hiasan. Tanpa itu, `find a -name X -o -name Y`
  // hanya mencetak hasil klausa TERAKHIR, jadi uji ini akan selalu melihat [] dan
  // lulus tanpa memeriksa apa pun.
  return daftarBerkas([
    "-name",
    "node_modules.clone-tmp",
    "-o",
    "-name",
    "node_modules.lama",
    "-o",
    "-name",
    ".dedup-probe.*",
    "-print",
  ]);
}

function daftarBerkas(argumenFind) {
  const keluar = spawnSync("find", [fixture, ...argumenFind], {
    encoding: "utf8",
  });
  expect(keluar.status).toBe(0);
  return keluar.stdout
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .sort();
}
