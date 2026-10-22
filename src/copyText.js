// copyText.js — salin teks ke clipboard lewat dua jalur, kembalikan true/false.
//
// Kenapa perlu dua: `navigator.clipboard` HANYA tersedia di secure context
// (https, atau localhost). Memperagakan hub di kelas lewat
// `http://192.168.x.x:5200` adalah kasus nyata — dan di situ jalur pertama
// tidak ada sama sekali, bukan sekadar gagal.
//
// Fungsi ini mengembalikan boolean, bukan melempar, supaya pemanggil bisa
// menampilkan status yang jujur alih-alih gagal diam-diam.

export async function copyText(teks) {
  // Jalur 1: Clipboard API modern.
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(teks);
      return true;
    } catch {
      // Izin ditolak / tab di latar belakang: coba jalur 2.
    }
  }

  // Jalur 2: textarea tak terlihat + execCommand('copy'). Deprecated, tapi
  // tetap satu-satunya yang bekerja tanpa secure context.
  try {
    const ta = document.createElement("textarea");
    ta.value = teks;
    ta.setAttribute("readonly", "");
    // Di luar layar, bukan display:none — beberapa browser tidak mau
    // menyeleksi elemen yang tidak di-render sama sekali.
    ta.style.position = "fixed";
    ta.style.top = "-1000px";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const tersalin = document.execCommand("copy");
    ta.remove();
    return tersalin;
  } catch {
    return false;
  }
}
