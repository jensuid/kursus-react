// Panduan "next steps" dirender sebagai HTML, bukan teks mentah.
//
// Isinya tetap dibaca dari file yang sama (`?raw`), jadi hub dan file
// 11-next-steps.md tidak pernah bisa berbeda — tidak ada salinan kedua.
//
// Kenapa react-markdown dan bukan renderer string-ke-HTML: react-markdown
// menghasilkan elemen React dan secara default mengabaikan HTML mentah yang
// mungkin tertulis di dalam markdown. Tidak ada penyuntikan string HTML ke
// DOM di sini, jadi tidak ada permukaan XSS kalau file markdown ini nanti
// ikut diedit orang lain.
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import nextSteps from "../../11-next-steps.md?raw";

// Setiap heading di file markdown diturunkan satu tingkat saat jadi HTML.
// Alasannya konkret: header hub di atas sudah memakai <h1> ("Next Steps"),
// sedangkan file punya judulnya sendiri. Kalau keduanya dibiarkan h1, dokumen
// ini punya dua judul -- urutan heading untuk pembaca layar jadi tidak jelas,
// dan secara visual keduanya nyaris sama besar (terukur: 27.2px vs 25.6px).
// Setelah turun tingkat: `#` jadi h2, `##` jadi h3. Bagian `.hub-md` di
// src/hub.css sudah ditulis mengikuti tingkat yang baru ini.
const headingTurunTingkat = { h1: "h2", h2: "h3", h3: "h4", h4: "h5" };

export default function NextStepsPage() {
  return (
    <div className="hub-content">
      <div className="hub-page-head">
        <div className="hub-eyebrow">
          Modul 11 · <span className="hub-badge md">Panduan</span>
        </div>
        <h1 className="hub-title">Next Steps</h1>
        <p className="hub-desc">
          Arah belajar setelah menyelesaikan kursus. Diedit di file{" "}
          <code className="hub-path">11-next-steps.md</code>.
        </p>
      </div>

      <div className="hub-md">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={headingTurunTingkat}
        >
          {nextSteps}
        </ReactMarkdown>
      </div>
    </div>
  );
}
