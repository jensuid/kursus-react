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
#   npm run setup:shared            # isi folder yang belum punya node_modules
#   npm run setup:shared -- --force # ganti pohon yang sudah ada asal versinya setara
#   npm run setup:shared -- --dry-run
#   npm run setup:shared -- --copy  # salinan penuh (bukan clone) di volume tanpa reflink
#
# Kenapa ada --copy: tanpa reflink, alat ini tidak menghemat apa pun -- ia malah
# menambah salinan. Karena itu volume tanpa reflink DITOLAK secara default, dan
# --copy harus ditulis terang-terangan. Nilai praktisnya: keputusan "folder mana
# yang boleh disentuh" bisa diuji di filesystem mana pun (CI runner ext4), bukan
# cuma di APFS.
set -uo pipefail

repo_dir="${REPO_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
cd "$repo_dir" || { echo "REPO_DIR tidak bisa dibuka: $repo_dir" >&2; exit 1; }

dry_run=0
force=0
copy=0
for arg in "$@"; do
  case "$arg" in
    --dry-run) dry_run=1 ;;
    --force) force=1 ;;
    --copy) copy=1 ;;
    *)
      echo "Argumen tidak dikenal: $arg (yang ada: --dry-run, --force, --copy)" >&2
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

kb_tersedia() { df -k . | awk 'NR==2{print $4}'; }
sebelum_kb="$(kb_tersedia)"

diisi=0
dilewati=0
gagal=0
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
  if [ "$ada" -eq 1 ] && [ "$force" -eq 0 ]; then
    echo "LEWAT  $m — sudah punya node_modules sendiri (pakai --force untuk menggantinya dengan salinan donor)"
    dilewati=$((dilewati + 1))
    continue
  fi

  if [ "$dry_run" -eq 1 ]; then
    if [ "$ada" -eq 1 ]; then
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

  echo "ISI    $m ← $mekanika $donor (cache .vite dibuang)"
  diisi=$((diisi + 1))
done

sesudah_kb="$(kb_tersedia)"
echo ""
echo "Diisi: $diisi | Lewat: $dilewati | Gagal: $gagal"
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
