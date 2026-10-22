import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import prettier from "eslint-config-prettier/flat";

/**
 * Config ESLint 10 (flat config) untuk seluruh repo:
 *  - hub (src/**)
 *  - semua modul React (NN-nama/src/**)
 *  - skrip ES6 Node (00-es6-crash-course/**)
 *  - uji otomatis (tests/**)
 *
 * node_modules diabaikan bawaan oleh ESLint; dist/ eksplisit diabaikan.
 * Begitu juga dua folder kerja perkakas deploy: `.vercel` (berisi project.json)
 * dan `.vercel-tmp` (berisi skrip `.cjs` sementara). Keduanya sudah
 * di-gitignore sehingga TIDAK akan ada di checkout CI — tapi di mesin
 * maintainer ada, dan ESLint flat config mengabaikan dot-folder secara tidak
 * otomatis: tanpa baris ini `npm run lint` mendadak 7 error `no-undef`
 * (`process`/`console`/`setTimeout`) dari skrip deploy yang memang milik Node.
 */
export default [
  {
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "docs/**",
      "**/.vercel/**",
      "**/.vercel-tmp/**",
    ],
  },

  // --- Dasar untuk semua sumber kode ---
  js.configs.recommended,

  // --- Kode React (hub + modul 01-10): browser + JSX ---
  {
    files: ["src/**/*.{js,jsx}", "*-*/src/**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },

  // --- Skrip ES6 dijalankan dengan Node (bukan browser) ---
  {
    files: ["00-es6-crash-course/**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.node,
    },
    rules: {
      // Sengaja longgar: file ini alat bantu cetak/log untuk pembelajaran.
      "no-console": "off",

      // File latihan menyisipkan fixture (mis. `anggota`, `data`) yang sengaja
      // belum dipakai sampai pembelajar mengerjakannya, dan mendemokan bentuk
      // sintaks berdampingan (`biasa` vs `arrow`) yang tidak semuanya dipanggil.
      // Jadi: peringatan, bukan error — sinyal tetap ada, tanpa suara palsu.
      "no-unused-vars": "warn",

      // Aturan ini melarang hal yang justru DIAJARKAN di modul 00, misalnya
      // `0 || 100` dan `null ?? "x"` untuk menunjukkan bedanya || dan ??.
      // Sisi kiri memang harus konstan supaya perbandingannya terlihat.
      "no-constant-binary-expression": "off",
    },
  },

  // --- Konfig & skrip tooling di root ---
  {
    files: ["*.config.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.node,
    },
  },

  // --- Uji otomatis: JSX + campuran globals browser (jsdom) dan Node ---
  // Berkas uji di-eksekusi Vitest, bukan browser atau Node polos. Diperlukan
  // eksplisit: tanpa blok ini, `tests/**` tidak cocok dengan blok mana pun dan
  // ESLint diam-diam tidak memeriksa apa pun di dalamnya.
  {
    files: ["tests/**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      // Dalam uji, memanggil `render()` tanpa memakai hasil return-nya adalah
      // pola normal (kita ambil elemennya lewat `screen`).
      "no-unused-expressions": "off",
    },
  },

  // --- Matikan aturan yang bentrok dengan Prettier (paling akhir) ---
  prettier,
];
