// Baca isi panduan "next steps" sebagai teks mentah, tetap sinkron dengan file.
import nextSteps from "../../11-next-steps.md?raw";

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

      <pre className="hub-pre">
        <code>{nextSteps}</code>
      </pre>
    </div>
  );
}
