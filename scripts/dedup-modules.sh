#!/usr/bin/env bash
# dedup-modules.sh — mengisi node_modules folder modul 01-10 sebagai CLONE APFS
# dari satu donor, supaya ±440 MB tidak lagi tersimpan sepuluh kali.
#
# Kenapa clone dan bukan npm workspaces:
#   Folder modul harus tetap bisa disalin/dibagikan apa adanya (prinsip no.2 di
#   docs/HANDOFF.md §1). Clone APFS (`cp -c`) menghasilkan pohon yang inode-nya
#   berbeda dan isinya tidak saling memengaruhi — terbukti: mengubah berkas di
#   clone tidak menyentuh donor, dan `npm run build` di folder clone berjalan
#   normal (exit 0, CSS ikut ter-bundle). Yang dihemat cuma blok fisik di disk.
#
# Kenapa penjaga "lockfile harus setara" itu wajib:
#   Tanpa itu, folder yang dependensinya BEDA bisa ikut diisi pohon milik donor.
#   Build-nya mungkin tetap sukses (karena Vite tidak peduli), tapi hasilnya
#   memakai versi yang tidak tertulis di lockfile-nya sendiri — kegagalan yang
#   baru terlihat berbulan-bulan kemudian. Karena itu folder yang lockfile-nya
#   tidak setara dengan donor selalu dilewati, bukan dipaksa.
#
# Pemakaian:
#   npm run setup:shared            # isi folder yang belum punya node_modules;
#                                   #   yang sudah terisi dilaporkan SIAP/BEDA, tidak disentuh
#   npm run setup:shared -- --force # ganti pohon yang sudah ada asal versinya setara
#   npm run setup:shared -- --dry-run
#   npm run setup:shared -- --copy  # salinan penuh (bukan clone) di volume tanpa reflink
#   npm run setup:shared -- --akar  # setelah modul, berbagi blok juga untuk paket yang
#                                   #   sama di node_modules ROOT (butuh reflink, opt-in)
#
# Kenapa ada --copy: tanpa reflink, alat ini tidak menghemat apa pun -- ia malah
# menambah salinan. Karena itu volume tanpa reflink DITOLAK secara default, dan
# --copy harus ditulis terang-terangan. Nilai praktisnya: keputusan "folder mana
# yang boleh disentuh" bisa diuji di filesystem mana pun (CI runner ext4), bukan
# cuma di APFS.
#
# Kenapa ada stamen (node_modules/.dedup-stamp): tanpa itu, menjalankan perkakas
# ini untuk kedua kalinya buta -- dia tidak bisa membedakan "pohon ini sudah
# clone dan masih setara" dari "pohon ini sudah pernah diisi lalu diutak-atik",
# jadi satu-satunya jalan adalah --force yang mengganti SEMUANYA dan membuang
# perubahan lokal tanpa peringatan. Setiap pengisian menulis stamen berisi sidik
# jari pohon donor; saat membaca, skrip menghitung ulang sidik pohon itu sendiri
# dan sidik donor sekarang, lalu melapor SIAP (tidak ada kerja) atau BEDA (apa
# yang berubah). Sidik = jalur + ukuran + target symlink, BUKAN isi berkas: tambalan
# yang ukurannya persis sama tidak terdeteksi, dan itu disengaja -- membaca ±472 MB
# tiap dry-run lebih mahal daripada manfaatnya.
#
# Kenapa pengisian root (--akar) adalah lintasan TERSENDIRI, bukan bagian dari
# perulangan modul: node_modules root bukan pohon yang setara dengan donor. Ia
# punya lockfile sendiri (terukur: kunci fcd67c04 vs 2cb6e7db milik modul) dan
# 317 paket vs 64 paket donor. Jadi tidak bisa ditukar seluruhnya -- yang boleh
# dikerjakan hanyalah paket tingkat-satu yang isinya SAMA persis, satu per satu.
# Karena itu penjaga utamanya bukan lockfile (tidak akan pernah sama) melainkan
# sidik per paket: bila berbeda, paket itu tidak disentuh sama sekali. Sisa
# 253 paket root (vitest, express, mongodb, ...) memang tidak ada duanya.
set -uo pipefail

repo_dir="${REPO_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
cd "$repo_dir" || { echo "REPO_DIR tidak bisa dibuka: $repo_dir" >&2; exit 1; }

dry_run=0
force=0
copy=0
akar=0
# Lintasan --akar bekerja pada direktori mana pun yang ditunjuk PREFIX_DIR; default
# "node_modules" = pohon di root repo. Hook itu ada supaya keputusan "paket mana
# yang identik" bisa diuji terhadap objek sungguhan di runner mana pun, bukan hanya
# di mesin developer yang kebetulan APFS.
prefix_rel="${PREFIX_DIR:-node_modules}"
for arg in "$@"; do
  case "$arg" in
    --dry-run) dry_run=1 ;;
    --force) force=1 ;;
    --copy) copy=1 ;;
    --akar) akar=1 ;;
    *)
      echo "Argumen tidak dikenal: $arg (yang ada: --dry-run, --force, --copy, --akar)" >&2
      exit 2
      ;;
  esac
done

echo "repo: $repo_dir"
[ "$dry_run" -eq 1 ] && echo "[dry-run] tidak ada berkas yang disentuh."

# Kriteria "modul yang berdiri sendiri" sama seperti job CI `isi-matriks`:
# folder NN-* yang punya vite.config.js. Modul 00 (skrip Node) dan 11 (markdown)
# tersaring sendiri, tanpa daftar pengecualian yang bisa basi.
peta=()
for d in [0-9][0-9]-*/; do
  if [ -f "${d}vite.config.js" ] && [ -f "${d}package.json" ]; then
    peta+=("${d%/}")
  fi
done
if [ "${#peta[@]}" -eq 0 ]; then
  echo "Tidak ada folder modul (NN-* dengan vite.config.js) di $repo_dir" >&2
  exit 1
fi

# Lockfile dinormalisasi dengan MENGHILANGKAN field `name` lewat parser JSON,
# bukan `grep -v '"name"'`. Versi grep itu tertangkap oleh uji perilaku dan salah:
# pada lockfile satu baris (minified) baris itu berisi segalanya, jadi grep
# meratakan seluruh isi -> semua lockfile tampak "setara" dan folder dengan
# dependensi BEDA ikut mendapat pohon donor. Yang boleh berbeda hanyalah field
# name (top-level dan packages[""]), itu yang dibuang di sini.
#
# Semua lockfile dihitung dalam SATU panggilan node. Sepuluh panggilan terpisah
# pernah terukur butuh ±5 detik pada volume ini hanya untuk menghitung kunci.
# Lockfile yang rusak/absen dapat kunci TANPA-LOCKFILE: folder itu dilewati,
# bukan dipaksa -- gagal aman lebih murah daripada salah klon.
kunci_peta=""
hitung_semua_kunci() {
  kunci_peta="$(node -e '
    const fs = require("node:fs");
    const crypto = require("node:crypto");
    const baris = [];
    for (const folder of process.argv.slice(1)) {
      let kunci = "TANPA-LOCKFILE";
      try {
        const isian = fs.readFileSync(folder + "/package-lock.json", "utf8");
        const j = JSON.parse(isian);
        delete j.name;
        if (j.packages && j.packages[""]) delete j.packages[""].name;
        kunci = crypto
          .createHash("md5")
          .update(JSON.stringify(j))
          .digest("hex");
      } catch {
        /* sengaja: lockfile tidak ada atau tidak bisa dibaca */
      }
      baris.push(folder + "\t" + kunci);
    }
    process.stdout.write(baris.join("\n"));
  ' "${peta[@]}")"
}

kunci_of() {
  printf "%s\n" "$kunci_peta" | awk -F'\t' -v cari="$1" '$1 == cari { tampil = $2 } END { print tampil }'
}

# Dipanggil sebelum donor dipilih, karena kunci donor juga diambil dari daftar ini.
hitung_semua_kunci

# Donor = folder pertama yang sudah punya node_modules nyata.
donor=""
for m in "${peta[@]}"; do
  if [ -d "${m}/node_modules" ]; then
    donor="$m"
    break
  fi
done
if [ -z "$donor" ]; then
  echo "Belum ada satu pun folder modul yang punya node_modules." >&2
  echo "Isi dulu satu folder sebagai donor, misalnya:" >&2
  echo "  cd ${peta[0]} && npm install" >&2
  exit 1
fi
kunci_donor="$(kunci_of "$donor")"
if [ "$kunci_donor" = "TANPA-LOCKFILE" ]; then
  echo "Donor $donor tidak punya package-lock.json — tidak bisa dibuktikan setara." >&2
  exit 1
fi
echo "Donor: $donor (lockfile $kunci_donor)"

# Uji kemampuan clone pada volume ini. `cp -c` gagal di dua keadaan: filesystem
# tanpa reflink (ext4, NFS, drive MS-DOS) dan antar-volume (mis. /tmp di macOS
# berada di volume lain). Keduanya harus terdeteksi sebelum ada yang menghapus.
# Kalau tidak didukung, defaultnya BERHENTI: menyalin penuh 500 MB per folder
# adalah kebalikan dari tujuan perkakas ini, jadi itu harus permintaan eksplisit.
probe_dir="$(mktemp -d "${repo_dir}/.dedup-probe.XXXXXX")"
echo "satu kata" >"${probe_dir}/sumber.txt"
if cp -c "${probe_dir}/sumber.txt" "${probe_dir}/clone.txt" 2>/dev/null &&
  [ -s "${probe_dir}/clone.txt" ]; then
  mekanika="clone"
  rm -rf "${probe_dir:?}"
  echo "Volume mendukung clone (reflink) — penyalinan tidak memakan blok baru."
else
  rm -rf "${probe_dir:?}"
  if [ "$copy" -eq 0 ]; then
    echo "Volume ini tidak mendukung clone APFS/reflink." >&2
    echo "Jalur resmi tetap: install per folder (cd <modul> && npm install)." >&2
    echo "Sadar risiko? --copy menyalin penuh (±50 MB per folder, TIDAK hemat disk)." >&2
    exit 1
  fi
  mekanika="salin"
  echo "Volume tanpa reflink + --copy: salinan penuh, tidak ada blok yang dihemat."
fi

salin_pohon() {
  if [ "$mekanika" = "clone" ]; then
    cp -c -R "$1" "$2"
  else
    cp -R "$1" "$2"
  fi
}

# ---- sidik jari pohon ---------------------------------------------------------
# Satu pohon = daftar (jalur relatif, ukuran) untuk berkas biasa, (jalur, target)
# untuk symlink, diurutkan lalu di-md5. Kenapa lewat node dan bukan `find -printf`
# atau `stat -f`: keduanya tidak tersedia di kedua sisi. `stat -f` di Linux berarti
# statistik filesystem (output berbeda total, tanpa error), `find -printf` tidak
# ada di macOS. Terukur di volume ini: 10 pohon sekali panggil = 2 detik, `find |
# stat` butuh 5 detik; membaca isi berkas tidak pernah dihitung.
STAMEN=".dedup-stamp"
sidik_peta=""
sidik_sudah_dihitung=" "

hitung_sidik() {
  [ $# -eq 0 ] && return 0
  local hasil
  hasil="$(node -e '
    const fs = require("node:fs");
    const crypto = require("node:crypto");
    const path = require("node:path");
    const keluaran = [];
    for (const root of process.argv.slice(1)) {
      if (!fs.existsSync(root)) {
        keluaran.push(root + "\t0\tTIDAK-ADA\t");
        continue;
      }
      const baris = [];
      const jalan = (dir, rel) => {
        for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
          // .vite dibuang: cache optimizer Vite dibuat ulang sendiri tiap kali dev
          // server jalan, jadi keberadaannya bukan penyimpangan.
          if (!rel && e.name === ".vite") continue;
          if (e.name === ".dedup-stamp") continue; // stamen itu sendiri bukan isi pohon
          const nama = rel ? rel + "/" + e.name : e.name;
          const p = path.join(dir, e.name);
          try {
            if (e.isSymbolicLink()) baris.push(nama + " ->" + fs.readlinkSync(p));
            else if (e.isDirectory()) jalan(p, nama);
            else if (e.isFile()) baris.push(nama + " " + fs.statSync(p).size);
            else baris.push(nama + " lain");
          } catch {
            baris.push(nama + " ?");
          }
        }
      };
      try {
        jalan(root, "");
      } catch {
        // Pohon berubah/terkunci di tengah jalan -> sidik tetap dihitung dari yang
        // sempat terbaca. Efeknya "BEDA", dan itu arah yang aman: tidak ada yang
        // menghapus apa pun berdasarkan sidik.
      }
      baris.sort();
      const sidik = crypto
        .createHash("md5")
        .update(baris.join("\n"))
        .digest("hex");
      keluaran.push(root + "\t" + baris.length + "\t" + sidik + "\t");
    }
    process.stdout.write(keluaran.join("\n"));
  ' "$@")"
  if [ -n "$sidik_peta" ]; then
    sidik_peta="${sidik_peta}"$'\n'"${hasil}"
  else
    sidik_peta="${hasil}"
  fi
  for a in "$@"; do sidik_sudah_dihitung="${sidik_sudah_dihitung}${a} "; done
}

pernah_disidik() {
  case "$sidik_sudah_dihitung" in *" $1 "*) return 0 ;; *) return 1 ;; esac
}

sidik_of() {
  printf "%s\n" "$sidik_peta" | awk -F'\t' -v c="$1" '$1 == c { t = $3 } END { print t }'
}

berkas_of() {
  printf "%s\n" "$sidik_peta" | awk -F'\t' -v c="$1" '$1 == c { t = $2 } END { print t }'
}

# Sidik donor dibutuhkan di banyak tempat (satu pembanding untuk semua klon) dan
# pohon donor tidak diubah skrip ini, jadi dihitung sekali dan disimpan.
#
# Dua fungsi, bukan satu, karena subshell: `sidik_donor=$(sidik_donor_kini)` itu
# menjalankan fungsi di CHILD process, jadi perubahan sidik_peta/sidik_donor_cache
# hilang bersama anak itu. Versi pertama ditulis begitu dan akibatnya nyata: donor
# disidik ulang sembilan kali (±0,6 s tiap kali) dan field `berkas=` di stamen
# tertulis KOSONG karena row donor tidak pernah sampai ke shell induk. Jadi:
# `siapkan` dipanggil sebagai pernyataan (menulis cache di shell induk), `kini`
# hanya membaca.
sidik_donor_cache=""
sidik_donor_siapkan() {
  if [ -z "$sidik_donor_cache" ]; then
    pernah_disidik "${donor}/node_modules" || hitung_sidik "${donor}/node_modules"
    sidik_donor_cache="$(sidik_of "${donor}/node_modules")"
  fi
}

sidik_donor_kini() { printf "%s\n" "$sidik_donor_cache"; }

# Baca satu field `kunci=nilai` dari isi stamen.
nilai_stamen() {
  printf "%s\n" "$1" | awk -F'=' -v k="$2" '$1 == k { print substr($0, length(k) + 2); exit }'
}

# Tabel gabungan donor x root, satu panggilan node untuk dua pohon. Baris:
# <aksi>\t<paket>\t<byte> dengan aksi = BAGI (isi sama, belum ditandai),
# SUDAH (sama dan sudah ditandai sebelumnya), BEDA (nama ada di dua sisi tapi
# isinya tidak sama), ASLI (hanya ada di root).
# Kenapa tidak associative array bash: /bin/bash di macOS adalah 3.2.57 dan tidak
# mendukung `declare -A`, jadi solusi itu akan membuat lintasan ini mati di laptop
# penulisnya sendiri sementara CI (bash 5) tetap hijau -- kegagalan yang justru
# paling sulit terlihat.
peta_bandup() {
  node -e '
    const fs = require("node:fs");
    const crypto = require("node:crypto");
    const path = require("node:path");
    // slice(1), BUKAN slice(2): pada `node -e` tidak ada slot path skrip, jadi
    // argv = [node, arg1, arg2, ...]. Pakai slice(2) di sini diam-diam menelan
    // argumen pertama dan membuat pohon root terbaca sebagai KOSONG -- tanpa error.
    const [donorDir, rootDir] = process.argv.slice(1);
    const ABAIKAN = new Set([".bin", ".vite", ".package-lock.json", ".dedup-stamp"]);
    const sidik = (dir) => {
      const baris = [];
      let byte = 0;
      const jalan = (d, rel) => {
        for (const e of fs.readdirSync(d, { withFileTypes: true })) {
          // Penanda .dedup-shared ditulis skrip ini DI DALAM paket hasil pembagian.
          // Kalau ikut terhitung, run berikutnya melihat sisi root berbeda dari donor
          // (yang tidak punya penanda) dan melaporkan 64 BEDA palsu, lalu mengisi ulang
          // selamanya. Keamanan tetap utuh: penanda hanya dibaca SETELAH sidik cocok,
          // jadi paket yang berubah tetap dilaporkan BEDA dan tidak pernah ditimpa
          // tanpa --force.
          if (e.name === ".dedup-shared") continue;
          const p = path.join(d, e.name);
          const nama = rel ? rel + "/" + e.name : e.name;
          try {
            if (e.isSymbolicLink()) baris.push(nama + " ->" + fs.readlinkSync(p));
            else if (e.isDirectory()) jalan(p, nama);
            else if (e.isFile()) {
              const s = fs.lstatSync(p).size;
              byte += s;
              baris.push(nama + " " + s);
            } else baris.push(nama + " lain");
          } catch {
            baris.push(nama + " ?");
          }
        }
      };
      jalan(dir, "");
      baris.sort();
      return [baris.length, byte, crypto.createHash("md5").update(baris.join("\n")).digest("hex")];
    };
    const perPaket = (base) => {
      const keluaran = new Map();
      if (!fs.existsSync(base)) return keluaran;
      for (const e of fs.readdirSync(base, { withFileTypes: true })) {
        if (ABAIKAN.has(e.name) || e.name.startsWith(".")) continue;
        const p = path.join(base, e.name);
        if (!e.isDirectory()) continue;
        if (e.name.startsWith("@")) {
          for (const f of fs.readdirSync(p, { withFileTypes: true })) {
            if (!f.isDirectory()) continue;
            const r = sidik(path.join(p, f.name));
            keluaran.set(e.name + "/" + f.name, r);
          }
          continue;
        }
        keluaran.set(e.name, sidik(p));
      }
      return keluaran;
    };
    const d = perPaket(donorDir);
    const r = perPaket(rootDir);
    const baris = [];
    for (const [nama, info] of d) {
      if (!r.has(nama)) {
        baris.push("HANYA-DONOR\t" + nama + "\t0");
        continue;
      }
      const ri = r.get(nama);
      if (ri[2] !== info[2]) {
        baris.push("BEDA\t" + nama + "\t" + ri[1]);
        continue;
      }
      const bertanda = fs.existsSync(path.join(rootDir, nama, ".dedup-shared"));
      baris.push((bertanda ? "SUDAH\t" : "BAGI\t") + nama + "\t" + info[1]);
    }
    for (const [nama] of r) {
      if (!d.has(nama)) baris.push("ASLI\t" + nama + "\t" + r.get(nama)[1]);
    }
    baris.sort();
    process.stdout.write(baris.join("\n") + "\n");
  ' "$@"
}

kb_tersedia() { df -k . | awk 'NR==2{print $4}'; }
sebelum_kb="$(kb_tersedia)"
diisi=0
siap=0
dilewati=0
gagal=0

# Pra-baca stamen: yang disidik hanya pohon yang sudah berisi stamen. Mesin yang
# belum pernah diisi sama sekali tidak membayar apa pun, jadi --dry-run di sana
# tetap secepat sebelum stamen ada.
yang_perlu_disidik=()
for m in "${peta[@]}"; do
  if [ -f "${m}/node_modules/${STAMEN}" ]; then
    yang_perlu_disidik+=("${m}/node_modules")
  fi
done
if [ "${#yang_perlu_disidik[@]}" -gt 0 ]; then
  hitung_sidik "${yang_perlu_disidik[@]}"
fi

for m in "${peta[@]}"; do
  if [ "$m" = "$donor" ]; then
    continue
  fi

  kunci="$(kunci_of "$m")"
  if [ "$kunci" != "$kunci_donor" ]; then
    echo "LEWAT  $m — lockfile tidak setara dengan donor (lockfile $kunci)"
    dilewati=$((dilewati + 1))
    continue
  fi

  ada=0
  [ -d "${m}/node_modules" ] && ada=1

  # Kelas pohon yang sudah ada: "siap" (stamen ada dan masih setara), "beda" (stamen
  # ada tapi sesuatu tidak cocok lagi), "mentah" (stamen rusak/tidak terbaca --
  # diperlakukan sama seperti pohon tanpa stamen), "" (belum ada pohon).
  kelas=""
  sebab=""
  stamen_dari=""
  stamen_cara=""
  if [ "$ada" -eq 1 ] && [ -f "${m}/node_modules/${STAMEN}" ]; then
    isi_stamen="$(cat "${m}/node_modules/${STAMEN}" 2>/dev/null)"
    if [ "$(printf "%s\n" "$isi_stamen" | head -1)" = "dedup-stamp-v1" ]; then
      stamen_dari="$(nilai_stamen "$isi_stamen" donor)"
      stamen_cara="$(nilai_stamen "$isi_stamen" mekanika)"
      sidik_lama="$(nilai_stamen "$isi_stamen" sidik)"
      sidik_kini="$(sidik_of "${m}/node_modules")"
      berkas_kini="$(berkas_of "${m}/node_modules")"
      if [ -z "$sidik_lama" ] || [ -z "$sidik_kini" ] || [ "$sidik_kini" = "TIDAK-ADA" ]; then
        kelas="mentah"
      elif [ "$sidik_kini" != "$sidik_lama" ]; then
        kelas="beda"
        sebab="pohon ini berubah sejak diisi ($berkas_kini berkas, sidik ${sidik_kini:0:8} vs ${sidik_lama:0:8})"
      elif [ "$(nilai_stamen "$isi_stamen" lockfile)" != "$kunci_donor" ]; then
        kelas="beda"
        sebab="lockfile donor berubah sejak pohon ini diisi"
      else
        # Sengaja disiapkan sebagai pernyataan, bukan di dalam [ ... ]: lihat
        # catatan subshell di atas.
        sidik_donor_siapkan
        if [ "$sidik_donor_cache" != "$sidik_lama" ]; then
          kelas="beda"
          sebab="pohon donor $stamen_dari berubah sejak pohon ini diisi"
        else
          kelas="siap"
        fi
      fi
    else
      kelas="mentah"
    fi
  fi

  if [ "$ada" -eq 1 ] && [ "$force" -eq 0 ]; then
    if [ "$kelas" = "siap" ]; then
      echo "SIAP   $m ← $stamen_cara $stamen_dari, masih setara ($(berkas_of "${m}/node_modules") berkas) — tidak ada yang perlu dikerjakan"
      siap=$((siap + 1))
    elif [ "$kelas" = "beda" ]; then
      echo "BEDA   $m — stamen ($stamen_cara dari $stamen_dari): $sebab"
      echo "       --force akan mengisi ulang; perubahan di dalam node_modules $m ikut dibuang"
      dilewati=$((dilewati + 1))
    else
      echo "LEWAT  $m — sudah punya node_modules sendiri (pakai --force untuk menggantinya dengan salinan donor)"
      dilewati=$((dilewati + 1))
    fi
    continue
  fi

  if [ "$dry_run" -eq 1 ]; then
    if [ "$kelas" = "siap" ]; then
      echo "RENCANA $m -- $mekanika ulang dari $donor (stamen menunjukkan pohon ini MASIH SETARA; --force tidak diperlukan)"
    elif [ "$kelas" = "beda" ]; then
      echo "RENCANA $m -- $mekanika ulang dari $donor (stamen: $sebab -- perubahan lokal di pohon ini dibuang)"
    elif [ "$ada" -eq 1 ]; then
      echo "RENCANA $m -- ganti node_modules yang sudah ada dengan $mekanika $donor"
    else
      echo "RENCANA $m -- isi node_modules dari $mekanika $donor"
    fi
    diisi=$((diisi + 1))
    continue
  fi

  # Salin ke nama sementara, periksa kelengkapannya, baru bertukar tempat. Dengan
  # begitu pohon lama masih utuh kalau ada yang gagal di tengah jalan.
  tmp="${m}/node_modules.clone-tmp"
  rm -rf "${tmp:?}"
  if ! salin_pohon "${donor}/node_modules" "$tmp" 2>/dev/null; then
    echo "GAGAL  $m — penyalinan ($mekanika) ditolak; pohon lama dibiarkan apa adanya." >&2
    rm -rf "${tmp:?}"
    gagal=$((gagal + 1))
    continue
  fi
  # Periksa hasil salinan SEBELUM pohon lama disentuh: berkas kunci ada dan jumlah
  # paket di tingkat atas sama dengan donor. Pemeriksaan struktural ini dipilih
  # alih-alih `require.resolve` karena yang diuji adalah kelengkapan pohon, bukan
  # cara Node menelusuri jalur.
  jumlah_donor=$(find "${donor}/node_modules" -maxdepth 1 -type d | wc -l | tr -d ' ')
  jumlah_tmp=$(find "$tmp" -maxdepth 1 -type d | wc -l | tr -d ' ')
  if [ ! -f "$tmp/react/package.json" ] || [ ! -f "$tmp/vite/package.json" ] ||
    [ ! -e "$tmp/.bin/vite" ] || [ "$jumlah_tmp" -ne "$jumlah_donor" ]; then
    echo "GAGAL  $m — salinan tidak lengkap (paket: $jumlah_tmp vs donor $jumlah_donor); pohon lama TETAP dipakai." >&2
    rm -rf "${tmp:?}"
    gagal=$((gagal + 1))
    continue
  fi

  if [ "$ada" -eq 1 ]; then
    lama="${m}/node_modules.lama"
    rm -rf "${lama:?}"
    mv "${m}/node_modules" "$lama"
    mv "$tmp" "${m}/node_modules"
    rm -rf "${lama:?}"
  else
    mv "$tmp" "${m}/node_modules"
  fi

  # Buang cache optimizer Vite yang ikut ter-klon. Isi `_metadata.json`-nya
  # menyimpan jalur absolut milik donor; dibiarkan, folder ini bisa saja memakai
  # dependensi hasil optimasi yang menunjuk ke pohon modul lain -- gagal yang
  # baru terasa saat dev server jalan, bukan saat skrip selesai.
  rm -rf "${m}/node_modules/.vite"

  # Tulis stamen SETELAH .vite dibuang, supaya sidik dan isi pohon cocok. Yang
  # dicatat adalah sidik pohon DONOR saat ini: pohon hasil salinan identik dengan
  # angka itu pada detik pengisian, jadi satu angka mengabdi dua arah -- sidik
  # pohon ini tidak cocok berarti klon diutak-atik, sidik donor tidak cocok berarti
  # semua klon dari donor itu basi.
  sidik_donor_siapkan
  sidik_awal="$(sidik_donor_kini)"
  if [ -n "$sidik_awal" ] && [ "$sidik_awal" != "TIDAK-ADA" ]; then
    if {
      printf 'dedup-stamp-v1\n'
      printf 'donor=%s\n' "$donor"
      printf 'mekanika=%s\n' "$mekanika"
      printf 'lockfile=%s\n' "$kunci_donor"
      printf 'berkas=%s\n' "$(berkas_of "${donor}/node_modules")"
      printf 'sidik=%s\n' "$sidik_awal"
      printf 'waktu=%s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    } >"${m}/node_modules/${STAMEN}" 2>/dev/null; then
      catatan="stamen ditulis"
    else
      catatan="STAMEN TIDAK TERTULIS"
    fi
  else
    catatan="STAMEN TIDAK TERTULIS (sidik donor tidak bisa dihitung)"
  fi

  echo "ISI    $m ← $mekanika $donor (cache .vite dibuang, $catatan)"
  diisi=$((diisi + 1))
done

# ---- lintasan paket root (--akar) --------------------------------------------
# Lihat catatan di header: root tidak bisa ditukar seluruhnya karena lockfile-nya
# beda, jadi yang dikerjakan hanyalah paket tingkat-satu yang sidiknya sama persis
# punya donor. Paket yang BEDA tidak disentuh sama sekali.
kb_akar_sebelum=0
if [ "$akar" -eq 1 ]; then
  echo ""
  if [ "$prefix_rel" = "$donor" ]; then
    echo "AKAR   dilewati — PREFIX_DIR menunjuk ke pohon donor itu sendiri."
  elif [ "$mekanika" != "clone" ]; then
    echo "AKAR   dilewati — tanpa reflink, menyalin paket ke root justru MENAMBAH disk."
    echo "       Root dibiarkan apa adanya; pakai default (tanpa --copy) di volume APFS."
  elif [ ! -d "${donor}/node_modules" ]; then
    echo "AKAR   dilewati — pohon donor tidak ada."
  elif [ ! -d "$prefix_rel" ]; then
    echo "AKAR   dilewati — $prefix_rel tidak ada, jadi tidak ada yang bisa dibagi."
  else
    kb_akar_sebelum="$(kb_tersedia)"
    paket_sudah=0
    paket_bagikan=0
    paket_beda=0
    paket_asli=0
    paket_donor_only=0
    byte_bagikan=0
    # Pembacaan pakai IFS bawaan (spasi+tab): kolom peta_bandup tidak pernah
    # mengandung spasi, dan mengandalkan whitespace bawaan berarti tidak ada
    # karakter tak-terlihat yang bisa hilang saat skrip ini disunting.
    while read -r aksi paket byte_p; do
      [ -n "$paket" ] || continue
      case "$aksi" in
        SUDAH) paket_sudah=$((paket_sudah + 1)) ;;
        BEDA)
          echo "BEDA   $prefix_rel/$paket — isi tidak sama dengan donor, tidak disentuh"
          if [ "$force" -eq 1 ]; then
            echo "       --force: paket ini akan ditimpa oleh salinan donor ($paket)"
            aksi="BAGI-PAKSA"
          fi
          paket_beda=$((paket_beda + 1))
          ;;
        ASLI) paket_asli=$((paket_asli + 1)) ;;
        HANYA-DONOR) paket_donor_only=$((paket_donor_only + 1)) ;;
        BAGI) ;;
        *)
          echo "GAGAL  akar — aksi tidak dikenal dari tabel gabungan: $aksi"
          gagal=$((gagal + 1))
          ;;
      esac
      [ "$aksi" = "BAGI" ] || [ "$aksi" = "BAGI-PAKSA" ] || continue
      if [ "$dry_run" -eq 1 ]; then
        echo "RENCANA akar -- bagikan $prefix_rel/$paket dengan $donor ($byte_p byte)"
        paket_bagikan=$((paket_bagikan + 1))
        byte_bagikan=$((byte_bagikan + byte_p))
        continue
      fi
      # Isi terbukti identik (BAGI), atau pengguna meminta penggantian paksa
      # (BAGI-PAKSA lewat --force) walau isinya berbeda. Dua-duanya: klon dulu, periksa, baru sentuh.
      tmp="$prefix_rel/${paket}.dedup-tmp"
      lama="$prefix_rel/${paket}.lama-tmp"
      rm -rf "${tmp:?}" "${lama:?}"
      # Paket scoped (@vueuse/x) butuh direktori induknya ada sebelum `cp -c -R`
      # bisa menulis ke sana; `mkdir -p` pada jalur yang sudah ada tidak berbahaya.
      scope="${paket%"${paket##*[!/]}"}"
      if [ -n "$scope" ] && ! mkdir -p "$prefix_rel/$scope" 2>/dev/null; then
        echo "GAGAL  akar $paket — direktori induk $scope tidak bisa dibuat." >&2
        gagal=$((gagal + 1))
        continue
      fi
      if ! salin_pohon "${donor}/node_modules/$paket" "$tmp" 2>/dev/null; then
        echo "GAGAL  akar $paket — penyalinan ditolak; pohon asli dibiarkan utuh." >&2
        rm -rf "${tmp:?}"
        gagal=$((gagal + 1))
        continue
      fi
      jumlah_tmp="$(find "$tmp" -mindepth 1 | wc -l | tr -d ' ')"
      jumlah_d="$(find "${donor}/node_modules/$paket" -mindepth 1 | wc -l | tr -d ' ')"
      if [ ! -d "$tmp" ] || [ "$jumlah_tmp" -ne "$jumlah_d" ]; then
        echo "GAGAL  akar $paket — klon tidak lengkap ($jumlah_tmp vs donor $jumlah_d); pohon asli TETAP dipakai." >&2
        rm -rf "${tmp:?}"
        gagal=$((gagal + 1))
        continue
      fi
      if mv "$prefix_rel/$paket" "$lama" 2>/dev/null &&
        mv "$tmp" "$prefix_rel/$paket" 2>/dev/null &&
        rm -rf "${lama:?}" 2>/dev/null; then
        printf 'paket ini diisi lewat %s --akar dari %s; isinya identik, hanya blok fisiknya dibagi\n' "$0" "$donor" >"$prefix_rel/$paket/.dedup-shared" 2>/dev/null
        paket_bagikan=$((paket_bagikan + 1))
        byte_bagikan=$((byte_bagikan + byte_p))
        continue
      fi
      # Pertukaran gagal di tengah. Kembalikan HANYA kalau paketnya memang tidak ada
      # di tempat: kalau klon sudah masuk ke posisinya, dia yang dipakai dan sisa
      # pohon lama tinggal dilaporkan -- memindahkannya ke jalur paket saat direktori
      # itu sudah ada akan menumpuknya KE DALAM paket baru (paket/<nama>.lama-tmp),
      # kegagalan yang justru sulit terlihat.
      if [ ! -e "$prefix_rel/$paket" ]; then
        [ -d "$tmp" ] && rm -rf "${tmp:?}"
        [ -d "$lama" ] && mv "$lama" "$prefix_rel/$paket" 2>/dev/null
      fi
      if [ -d "$lama" ] || [ -d "$tmp" ]; then
        echo "GAGAL  akar $paket — pertukaran tidak tuntas, sisa DITINGGALKAN untuk diperiksa: $lama $tmp" >&2
        gagal=$((gagal + 1))
      fi
    done < <(peta_bandup "${donor}/node_modules" "$prefix_rel")

    if [ "$dry_run" -eq 1 ]; then
      echo "AKAR   $prefix_rel: $paket_bagikan paket identik akan berbagi ($byte_bagikan byte), $paket_sudah sudah berbagi, $paket_beda BEDA tidak disentuh, $paket_asli hanya ada di root, $paket_donor_only belum ada di root"
    else
      sesudah_akar_kb="$(kb_tersedia)"
      echo "AKAR   $prefix_rel: $paket_bagikan paket sekarang berbagi blok dengan $donor, $paket_sudah sudah berbagi dari sebelumnya, $paket_beda BEDA tidak disentuh, $paket_asli hanya ada di root"
      if [ "$paket_bagikan" -gt 0 ]; then
        echo "       Isi yang tidak lagi disimpan dua kali: $byte_bagikan byte (logis); blok fisik yang berubah di volume: $((kb_akar_sebelum - sesudah_akar_kb)) KB"
      fi
    fi
  fi
fi

echo ""
echo "Diisi: $diisi | Siap: $siap | Lewat: $dilewati | Gagal: $gagal"
if [ "$siap" -gt 0 ] && [ "$diisi" -eq 0 ] && [ "$dry_run" -eq 0 ]; then
  echo "Semua pohon yang terisi sudah menjadi $mekanika donor dan belum berubah -- menjalankan ini lagi tidak menghemat apa pun."
fi
if [ "$dry_run" -eq 0 ] && [ "$diisi" -gt 0 ]; then
  if [ "$mekanika" = "clone" ]; then
    echo "Blok fisik yang berubah di volume ini: $((sebelum_kb - sesudah_kb)) KB (negatif = hemat; clone memang hampir tidak memakan blok baru)"
  else
    echo "Mekanika salinan penuh (--copy): tidak ada blok yang dihemat — volume ini tidak mendukung reflink."
  fi
fi
if [ "$diisi" -gt 0 ]; then
  echo "Verifikasi salah satu folder:  cd ${peta[1]:-$donor} && npm run build"
fi
[ "$gagal" -eq 0 ] || exit 1
