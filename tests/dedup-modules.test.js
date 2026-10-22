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
  return spawnSync("bash", [skrip, ...argumen, "--copy"], {
    encoding: "utf8",
    env: { ...process.env, REPO_DIR: fixture, ...env },
  });
}

// `cp -c` hanya berhasil di filesystem yang mendukung reflink (APFS/btrfs).
// Yang tidak bisa diuji di luar APFS adalah MEKANIKA klon (CoW, hemat blok) --
// untuk itu blok "jalur clone sungguhan" pakai describe.runIf. Keputusan "folder
// mana yang boleh disentuh" tetap diuji di filesystem mana pun karena semua
// pemanggilan skrip lewat jalankan() membawa --copy: tanpa itu, empat uji
// penjaga mati di runner CI (ext4) karena skrip menolak sebelum sempat memilih
// folder. Pernah terjadi nyata: suite hijau di mesin, MERAH di CI untuk alasan
// lingkungan, bukan alasan logika.
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

  it("menerima --copy sebagai jalur salinan penuh yang sah", () => {
    // Tanpa flag ini, `jalankan()` akan selalu kena "Argumen tidak dikenal" dan
    // seluruh blok di atas tidak menguji apa pun.
    const hasil = jalankan(["--dry-run"]);
    expect(hasil.stderr).not.toMatch(/Argumen tidak dikenal/);
  });

  it("tidak meninggalkan berkas sementara di mana pun", () => {
    const sisa = jalankanSisa();
    expect(sisa).toEqual([]);
  });
});

describe("stamen: mengenali pohon yang sudah pernah diisi", () => {
  // Tanpa stamen, menjalankan perkakas ini untuk kedua kalinya buta: satu-satunya
  // jalan adalah --force, yang mengganti SEMUA pohon dan membuang perubahan lokal
  // tanpa peringatan. Blok ini menguji bahwa keputusan itu sekarang diambil dari
  // bukti di disk -- dan bahwa bukti itu tidak bisa berbohong halus.
  //
  // Jalur ini diuji lewat jalankan() (selalu bawa --copy) supaya jalan di
  // filesystem mana pun: yang diuji di sini adalah KEPUTUSAN kelas pohon, bukan
  // mekanika klonnya.
  const pohon = join(fixture, "02-kosong", "node_modules");
  const isiStamen = () => readFileSync(join(pohon, ".dedup-stamp"), "utf8");

  beforeAll(() => {
    rmSync(fixture, { recursive: true, force: true });
    mkdirSync(fixture, { recursive: true });
    bikinModul("01-donor", sama, true);
    bikinModul("02-kosong", sama);
  });

  it("--dry-run tidak menulis stamen di folder yang belum diisi", () => {
    const hasil = jalankan(["--dry-run"]);
    expect(hasil.status).toBe(0);
    expect(hasil.stdout).toMatch(/RENCANA 02-kosong/);
    expect(existsSync(pohon)).toBe(false);
  });

  it("pengisian menulis stamen yang menyebut donor, mekanika, dan sidik", () => {
    const hasil = jalankan();
    expect(hasil.status).toBe(0);
    expect(hasil.stdout).toMatch(/ISI\s+02-kosong/);
    const isi = isiStamen();
    expect(isi).toMatch(/^dedup-stamp-v1$/m);
    expect(isi).toMatch(/^donor=01-donor$/m);
    expect(isi).toMatch(/^mekanika=(clone|salin)$/m);
    expect(isi).toMatch(/^sidik=[0-9a-f]{32}$/m);
    expect(isi).toMatch(/^lockfile=[0-9a-f]{32}$/m);
    // Penanganan subshell: `sidik_donor=$(sidik_donor_kini)` dulu menyidik donor di
    // child process, jadi barisnya tidak pernah sampai ke shell induk dan `berkas=`
    // tertulis kosong -- tanpa uji ini gejalanya cuma satu angka yang hilang.
    expect(isi).toMatch(/^berkas=[1-9][0-9]*$/m);
  });

  it("pohon hasil isian dilaporkan SIAP dan tidak disentuh lagi", () => {
    const hasil = jalankan();
    expect(hasil.stdout).toMatch(/SIAP\s+02-kosong/);
    expect(hasil.stdout).not.toMatch(/RENCANA/);
    expect(hasil.stdout).toMatch(/Diisi: 0 \| Siap: 1 \| Lewat: 0 \| Gagal: 0/);
  });

  it("cache .vite yang dibuat ulang bukan penyimpangan", () => {
    // Vite menulis node_modules/.vite tiap kali dev server jalan. Kalau itu
    // dihitung, setiap pembelajar yang menjalankan `npm run dev` akan melihat
    // klonnya "basi" -- dan godaan selanjutnya adalah --force.
    mkdirSync(join(pohon, ".vite", "deps"), { recursive: true });
    writeFileSync(
      join(pohon, ".vite", "deps", "_metadata.json"),
      JSON.stringify({ root: join(fixture, "02-kosong") })
    );
    const hasil = jalankan();
    expect(hasil.stdout).toMatch(/SIAP\s+02-kosong/);
  });

  it("perubahan di dalam pohon dilaporkan BEDA, dan tidak dihapus", () => {
    writeFileSync(
      join(pohon, "tambalan-debug.txt"),
      "diubah manual di node_modules"
    );
    const hasil = jalankan();
    expect(hasil.stdout).toMatch(/BEDA\s+02-kosong/);
    expect(hasil.stdout).toMatch(/berubah sejak diisi/);
    expect(existsSync(join(pohon, "tambalan-debug.txt"))).toBe(true);
  });

  it("--force mengisi ulang dan membuang tambalan lokal", () => {
    const hasil = jalankan(["--force"]);
    expect(hasil.status).toBe(0);
    expect(hasil.stdout).toMatch(/ISI\s+02-kosong/);
    expect(existsSync(join(pohon, "tambalan-debug.txt"))).toBe(false);
    // Sidik di stamen sengaja TIDAK berubah: yang dicatat adalah sidik pohon donor,
    // dan donor tidak ikut diutak-atik. Buktinya justru pohonnya sendiri yang
    // kembali setara, yaitu laporan SIAP di bawah.
    expect(jalankan().stdout).toMatch(/SIAP\s+02-kosong/);
  });

  it("stamen yang tidak dikenali diperlakukan seperti pohon install sendiri", () => {
    writeFileSync(join(pohon, ".dedup-stamp"), "bukan stamen versi 1\n");
    const hasil = jalankan();
    // Tidak ada klaim palsu: skrip tidak boleh bilang SIAP/BEDA dari berkas yang
    // tidak bisa dibacanya, dan juga tidak boleh menghapus pohonnya.
    expect(hasil.stdout).toMatch(/LEWAT\s+02-kosong/);
    expect(hasil.stdout).not.toMatch(/SIAP|BEDA/);
    expect(existsSync(join(pohon, "react", "package.json"))).toBe(true);
    jalankan(["--force"]); // pulihkan supaya uji berikutnya mulai dari pohon bersih
  });

  it("donor yang berubah membuat klon-nya dilaporkan BEDA (lalu pulih sendiri)", () => {
    expect(jalankan().stdout).toMatch(/SIAP\s+02-kosong/);
    writeFileSync(
      join(fixture, "01-donor", "node_modules", "tambahan-donor.txt"),
      "npm install di donor"
    );
    const hasil = jalankan();
    // Sidik pohon ini masih sama, lockfile masih sama -- yang berubah pohon donor.
    expect(hasil.stdout).toMatch(/BEDA\s+02-kosong/);
    expect(hasil.stdout).toMatch(/donor 01-donor berubah/);
    rmSync(join(fixture, "01-donor", "node_modules", "tambahan-donor.txt"), {
      force: true,
    });
    expect(jalankan().stdout).toMatch(/SIAP\s+02-kosong/);
  });

  it("stamen tidak meninggalkan berkas sementara", () => {
    expect(jalankanSisa()).toEqual([]);
  });
});

describe("berbagi blok di node_modules root (--akar)", () => {
  // Root hub bukan pohon yang setara dengan donor: kunci lockfile-nya berbeda
  // (terukur fcd67c04 vs 2cb6e7db di repo ini), jadi satu-satunya yang aman
  // dikerjakan adalah paket tingkat-satu yang isinya identik. Blok ini menjaga
  // KEPUTUSAN itu: mana yang boleh ditukar, mana yang tidak boleh disentuh,
  // dan bahwa menjalankan dua kali tidak mengubah apa pun.
  //
  // Perhatian: "02-kosong" akan diisi ulang oleh perulangan modul setiap kali
  // skrip jalan, jadi pohon akar peraga dibangun di "09-akar" -- modul yang
  // tidak pernah disentuh perulangan itu.
  const donor = join(fixture, "01-donor", "node_modules");
  const akar = join(fixture, "node_modules");
  const jalanAkar = (extra = []) =>
    jalankan(["--akar", ...extra], { PREFIX_DIR: "node_modules" });
  const penanda = (paket) => join(akar, paket, ".dedup-shared");
  // Yang dijaga blok ini adalah KEPUTUSAN (paket mana yang boleh ditukar), dan
  // keputusan itu harus terbukti di kedua mekanika: di APFS paketnya berbagi blok,
  // di CI (ext4, `--copy` selalu dipakai jalankan()) isinya disalin ulang. Skrip
  // sengaja memakai kata yang berbeda supaya tidak pernah mengklaim "berbagi blok"
  // saat tidak ada blok yang dibagi -- karena itu ujinya menerima kedua bentuk.
  const paketDitukar = (n) =>
    new RegExp(`${n} paket sekarang (berbagi blok dengan|disalin dari)`);

  beforeAll(() => {
    rmSync(fixture, { recursive: true, force: true });
    mkdirSync(fixture, { recursive: true });
    bikinModul("01-donor", sama, true);
    bikinModul("09-akar", sama);
    // bikinModul hanya membuat react/vite; paket scoped harus ditambahkan sendiri
    // supaya jalur "dua tingkat" di peta_bandup benar-benar teruji, bukan cuma disebut.
    mkdirSync(join(donor, "@scope", "util"), { recursive: true });
    writeFileSync(
      join(donor, "@scope", "util", "package.json"),
      '{"name":"@scope/util"}'
    );
    // root punya salinan identik untuk `react` dan `@scope/util`
    for (const [paket, isi] of [
      ["react", '{"name":"react","version":"19.3.1"}'],
      ["@scope/util", '{"name":"@scope/util"}'],
    ]) {
      mkdirSync(join(akar, paket), { recursive: true });
      writeFileSync(join(akar, paket, "package.json"), isi);
    }
    // `vite` sengaja TIDAK ada di akar -> hanya ada di donor
    // `.bin` dan `.vite` ada di dua sisi dan harus tidak pernah disentuh
    mkdirSync(join(akar, ".bin"), { recursive: true });
    writeFileSync(join(akar, ".bin", "vite"), "#!/bin/sh\n");
    mkdirSync(join(akar, ".vite", "deps"), { recursive: true });
    writeFileSync(join(akar, ".vite", "deps", "cache.js"), "// cache\n");
    // `eksklusif-root` cuma ada di akar: tidak boleh disentuh sama sekali
    mkdirSync(join(akar, "eksklusif-root"), { recursive: true });
    writeFileSync(join(akar, "eksklusif-root", "package.json"), '{"name":"x"}');
  });

  it("tidak aktif tanpa --akar (perilaku lama tidak berubah)", () => {
    const hasil = jalankan();
    expect(hasil.status).toBe(0);
    expect(hasil.stdout).not.toMatch(/AKAR/);
    expect(existsSync(penanda("react"))).toBe(false);
  });

  it("--dry-run hanya melaporkan, tidak menyentuh pohon akar", () => {
    const hasil = jalanAkar(["--dry-run"]);
    expect(hasil.status).toBe(0);
    expect(hasil.stdout).toMatch(
      /RENCANA akar -- bagikan node_modules\/react /
    );
    expect(hasil.stdout).toMatch(
      /RENCANA akar -- bagikan node_modules\/@scope\/util /
    );
    expect(hasil.stdout).toMatch(/2 paket identik akan berbagi/);
    expect(hasil.stdout).toMatch(/1 belum ada di root/);
    expect(existsSync(penanda("react"))).toBe(false);
  });

  it("paket yang isinya identik ditandai berbagi, termasuk yang scoped", () => {
    const hasil = jalanAkar();
    expect(hasil.status).toBe(0);
    expect(hasil.stdout).toMatch(paketDitukar(2));
    expect(existsSync(penanda("react"))).toBe(true);
    expect(existsSync(penanda("@scope/util"))).toBe(true);
    // isi tetap sama seperti donor
    expect(readFileSync(join(akar, "react", "package.json"), "utf8")).toBe(
      readFileSync(join(donor, "react", "package.json"), "utf8")
    );
  });

  it(".bin dan .vite di akar tidak pernah ikut dibagi", () => {
    expect(existsSync(join(akar, ".bin", ".dedup-shared"))).toBe(false);
    expect(existsSync(join(akar, ".vite", ".dedup-shared"))).toBe(false);
    expect(existsSync(join(akar, ".vite", "deps", "cache.js"))).toBe(true);
  });

  it("paket yang hanya ada di akar dibiarkan apa adanya", () => {
    const isi = readFileSync(
      join(akar, "eksklusif-root", "package.json"),
      "utf8"
    );
    expect(isi).toBe('{"name":"x"}');
    expect(existsSync(penanda("eksklusif-root"))).toBe(false);
  });

  it("paket akar yang isinya berbeda dilaporkan BEDA dan tambalan bertahan", () => {
    mkdirSync(join(donor, "hanya-donor"), { recursive: true });
    writeFileSync(
      join(donor, "hanya-donor", "package.json"),
      '{"name":"react"}'
    );
    mkdirSync(join(akar, "hanya-donor"), { recursive: true });
    writeFileSync(
      join(akar, "hanya-donor", "package.json"),
      '{"name":"react","lok":"saya"}'
    );
    const hasil = jalanAkar();
    expect(hasil.stdout).toMatch(/BEDA\s+node_modules\/hanya-donor/);
    expect(
      readFileSync(join(akar, "hanya-donor", "package.json"), "utf8")
    ).toMatch("saya");
    rmSync(join(donor, "hanya-donor"), { recursive: true, force: true });
    rmSync(join(akar, "hanya-donor"), { recursive: true, force: true });
  });

  it("--force atas BEDA akar memang menimpa dengan salinan donor", () => {
    mkdirSync(join(donor, "hanya-donor"), { recursive: true });
    writeFileSync(
      join(donor, "hanya-donor", "package.json"),
      '{"name":"react"}'
    );
    mkdirSync(join(akar, "hanya-donor"), { recursive: true });
    writeFileSync(
      join(akar, "hanya-donor", "package.json"),
      '{"name":"react","lok":"saya"}'
    );
    const hasil = jalanAkar(["--force"]);
    expect(hasil.stdout).toMatch(paketDitukar(1));
    expect(
      readFileSync(join(akar, "hanya-donor", "package.json"), "utf8")
    ).not.toMatch("saya");
    rmSync(join(donor, "hanya-donor"), { recursive: true, force: true });
    rmSync(join(akar, "hanya-donor"), { recursive: true, force: true });
  });

  it("menjalankan lagi tidak mengerjakan apa pun (idempoten)", () => {
    const hasil = jalanAkar();
    expect(hasil.stdout).toMatch(paketDitukar(0));
    expect(hasil.stdout).toMatch(/2 sudah berbagi dari sebelumnya/);
    expect(hasil.stdout).toMatch(/0 BEDA tidak disentuh/);
  });

  it("di volume tanpa reflink keputusan root TETAP jalan, tanpa mengklaim hemat blok", () => {
    // cp palsu meniru CI/ext4 secara deterministik, bahkan di mesin APFS sekali
    // pun: `-c` selalu gagal, sisanya diteruskan ke /bin/cp. Uji ini adalah regresi
    // yang MERAH di run 39795900782: lintasan --akar dulu memilih "dilewati" saat
    // tidak ada reflink, jadi sembilan keputusan di blok ini hanya hijau di laptop.
    const binPalsu = join(tmpdir(), "uji-dedup-fakebin-akar");
    mkdirSync(binPalsu, { recursive: true });
    writeFileSync(
      join(binPalsu, "cp"),
      '#!/bin/sh\nfor a in "$@"; do if [ "$a" = "-c" ]; then echo "cp: clonefile failed: Operation not supported" >&2; exit 1; fi; done\nexec /bin/cp "$@"\n',
      { mode: 0o755 }
    );
    // satu paket identik yang belum pernah ditandai, supaya ada yang ditukar
    mkdirSync(join(donor, "peraga-salin"), { recursive: true });
    writeFileSync(join(donor, "peraga-salin", "package.json"), '{"name":"x"}');
    mkdirSync(join(akar, "peraga-salin"), { recursive: true });
    writeFileSync(join(akar, "peraga-salin", "package.json"), '{"name":"x"}');
    const hasil = spawnSync("bash", [skrip, "--akar", "--copy"], {
      encoding: "utf8",
      env: {
        ...process.env,
        REPO_DIR: fixture,
        PREFIX_DIR: "node_modules",
        PATH: `${binPalsu}:${process.env.PATH}`,
      },
    });
    rmSync(binPalsu, { recursive: true, force: true });
    expect(hasil.status).toBe(0);
    expect(hasil.stdout).toMatch(/1 paket sekarang disalin dari 01-donor/);
    expect(hasil.stdout).toMatch(/TIDAK ada blok yang dihemat/);
    expect(hasil.stdout).not.toMatch(/berbagi blok dengan 01-donor/);
    // keputusannya sendiri tetap ditegakkan: paket ditandai, isinya jadi donor
    expect(existsSync(penanda("peraga-salin"))).toBe(true);
    rmSync(join(donor, "peraga-salin"), { recursive: true, force: true });
    rmSync(join(akar, "peraga-salin"), { recursive: true, force: true });
  });

  it("tidak meninggalkan berkas sementara di pohon akar", () => {
    expect(jalankanSisa()).toEqual([]);
    expect(
      readdirSync(akar).filter((n) => /\.(dedup-tmp|lama-tmp)$/.test(n))
    ).toEqual([]);
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
      const hasil = spawnSync(
        "bash",
        [skrip, "--dry-run", "--force", "--copy"],
        {
          encoding: "utf8",
          env: { ...process.env, REPO_DIR: repoRoot },
        }
      );
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

describe("volume tanpa reflink: penolakan dulu, --copy belakangan", () => {
  // cp palsu meniru ext4/NFS/dosfs secara DETERMINISTIK: `-c` selalu gagal,
  // sisanya diteruskan ke /bin/cp. Ini satu-satunya cara menguji jalur
  // non-reflink di mesin APFS juga -- runner CI membuktikannya dari sisi lain.
  const binPalsu = join(tmpdir(), "uji-dedup-fakebin");
  beforeAll(() => {
    rmSync(fixture, { recursive: true, force: true });
    mkdirSync(fixture, { recursive: true });
    bikinModul("01-donor", sama, true);
    bikinModul("02-kosong", sama);
    rmSync(binPalsu, { recursive: true, force: true });
    mkdirSync(binPalsu, { recursive: true });
    writeFileSync(
      join(binPalsu, "cp"),
      '#!/bin/sh\nfor a in "$@"; do if [ "$a" = "-c" ]; then echo "cp: clonefile failed: Operation not supported" >&2; exit 1; fi; done\nexec /bin/cp "$@"\n',
      { mode: 0o755 }
    );
  });

  afterAll(() => {
    rmSync(binPalsu, { recursive: true, force: true });
  });

  const tanpaReflink = (argumen) =>
    spawnSync("bash", [skrip, ...argumen], {
      encoding: "utf8",
      env: {
        ...process.env,
        REPO_DIR: fixture,
        PATH: `${binPalsu}:${process.env.PATH}`,
      },
    });

  it("tanpa --copy: berhenti sebelum ada yang menghapus, dan mengarahkan ke npm install", () => {
    const hasil = tanpaReflink([]);
    expect(hasil.status).toBe(1);
    const keluaran = hasil.stdout + hasil.stderr;
    expect(keluaran).toMatch(/tidak mendukung clone/);
    expect(keluaran).toMatch("npm install");
    // Petunjuk jalurnya harus disebut, kalau tidak pengguna dibiarkan menebak.
    expect(keluaran).toMatch(/--copy/);
    expect(existsSync(join(fixture, "02-kosong", "node_modules"))).toBe(false);
  });

  it("dengan --copy: keputusan yang sama tetap jalan, mekanikanya salinan penuh", () => {
    const hasil = tanpaReflink(["--copy"]);
    expect(hasil.status).toBe(0);
    // Regresi urutan kunci donor juga terbukti di jalur ini, bukan cuma di APFS.
    expect(hasil.stdout).toMatch(/Donor: 01-donor \(lockfile [0-9a-f]{32}\)/);
    expect(hasil.stdout).toMatch(/ISI\s+02-kosong/);
    expect(hasil.stdout).toMatch(/salinan penuh/);
    for (const berkas of [
      "react/package.json",
      "vite/package.json",
      ".bin/vite",
    ]) {
      expect(
        existsSync(join(fixture, "02-kosong", "node_modules", berkas))
      ).toBe(true);
    }
    expect(jalankanSisa()).toEqual([]);
  });

  it("--copy tetap menghormati penjaga lockfile dan folder yang sudah terisi", () => {
    mkdirSync(join(fixture, "03-bedanya", "src"), { recursive: true });
    writeFileSync(join(fixture, "03-bedanya", "vite.config.js"), "x\n");
    writeFileSync(join(fixture, "03-bedanya", "package.json"), "{}");
    writeFileSync(
      join(fixture, "03-bedanya", "package-lock.json"),
      `{ "name": "03-bedanya", "lockfileVersion": 3, "packages": ${beda} }\n`
    );
    const hasil = tanpaReflink(["--copy", "--force"]);
    expect(hasil.stdout).toMatch(/LEWAT\s+03-bedanya/);
    expect(existsSync(join(fixture, "03-bedanya", "node_modules"))).toBe(false);
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
    "-o",
    "-name",
    "*.dedup-tmp",
    "-o",
    "-name",
    "*.lama-tmp",
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
