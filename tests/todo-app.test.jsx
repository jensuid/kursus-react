// Uji perilaku Todo App (Modul 10) — tambah / toggle / hapus / filter / simpan.
//
// Komponennya sudah punya nama aksesibel (aria-label), jadi ujiannya mencari
// lewat peran & label, bukan lewat class atau urutan DOM. Itu disengaja: uji
// yang menempel pada class akan merah setiap kali gaya diubah, padahal
// perilakunya tidak berubah.
import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../10-final-project/src/App.jsx";

const daftarBaris = () => screen.queryAllByRole("listitem");

const barisDengan = (teks) =>
  daftarBaris().find((li) => li.textContent.includes(teks));

function renderApp() {
  render(<App />);
  return {
    input: screen.getByLabelText("Tugas baru"),
    tombolTambah: screen.getByRole("button", { name: "Tambah" }),
  };
}

describe("Todo App — kondisi awal", () => {
  it("merender tiga tugas bawaan dan ringkasan progresnya", () => {
    renderApp();
    expect(daftarBaris()).toHaveLength(3);
    expect(screen.getByText(/1 dari 3 selesai \(33%\)/)).toBeInTheDocument();
  });

  it("tombol Tambah belum bisa dipakai selama input kosong", () => {
    const { tombolTambah } = renderApp();
    expect(tombolTambah).toBeDisabled();
  });
});

describe("Todo App — menambah", () => {
  it("menambahkan tugas baru, lalu mengosongkan inputnya", async () => {
    const user = userEvent.setup();
    const { input, tombolTambah } = renderApp();

    await user.type(input, "Uji otomatis");
    await user.click(tombolTambah);

    expect(barisDengan("Uji otomatis")).toBeTruthy();
    expect(daftarBaris()).toHaveLength(4);
    expect(input).toHaveValue("");
    // Tugas baru belum selesai, jadi jumlah selesai tidak ikut naik.
    expect(screen.getByText(/1 dari 4 selesai \(25%\)/)).toBeInTheDocument();
  });

  it("menolak spasi kosong saja (tidak menambah baris hantu)", async () => {
    const user = userEvent.setup();
    const { input, tombolTambah } = renderApp();

    await user.type(input, "   ");
    expect(tombolTambah).toBeDisabled();
    expect(input).toHaveValue("   ");
    expect(daftarBaris()).toHaveLength(3);
  });
});

describe("Todo App — menandai selesai", () => {
  it("mencentang checkbox mengubah status dan ringkasannya", async () => {
    const user = userEvent.setup();
    renderApp();

    const belum = barisDengan("Kuasai useState & event");
    await user.click(within(belum).getByLabelText("tandai selesai"));

    expect(belum).toHaveClass("selesai");
    expect(screen.getByText(/2 dari 3 selesai/)).toBeInTheDocument();
  });

  it("menandai dua tugas sisanya membuat progres jadi 100%", async () => {
    const user = userEvent.setup();
    renderApp();

    for (const teks of ["Kuasai useState & event", "Bangun Todo App ini"]) {
      await user.click(
        within(barisDengan(teks)).getByLabelText("tandai selesai")
      );
    }
    expect(screen.getByText(/3 dari 3 selesai \(100%\)/)).toBeInTheDocument();
  });
});

describe("Todo App — menghapus", () => {
  it("menghapus satu tugas membuang barisnya dan mengurangi total", async () => {
    const user = userEvent.setup();
    renderApp();

    const target = barisDengan("Belajar komponen & props");
    await user.click(within(target).getByLabelText("hapus"));

    expect(barisDengan("Belajar komponen & props")).toBeFalsy();
    expect(daftarBaris()).toHaveLength(2);
    expect(screen.getByText(/0 dari 2 selesai/)).toBeInTheDocument();
  });

  it("menampilkan pesan kosong setelah semua tugas dihapus", async () => {
    const user = userEvent.setup();
    renderApp();

    for (const li of [...daftarBaris()]) {
      await user.click(within(li).getByLabelText("hapus"));
    }

    expect(daftarBaris()).toHaveLength(0);
    expect(screen.getByText(/Tidak ada tugas di sini/)).toBeInTheDocument();
  });
});

describe("Todo App — filter", () => {
  it("filter 'Selesai' hanya menampilkan tugas yang sudah beres", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole("button", { name: "Selesai" }));

    expect(daftarBaris()).toHaveLength(1);
    expect(barisDengan("Belajar komponen & props")).toBeTruthy();
  });

  it("filter 'Belum selesai' menyisakan dua tugas lainnya", async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole("button", { name: "Belum selesai" }));

    expect(daftarBaris()).toHaveLength(2);
    expect(barisDengan("Belajar komponen & props")).toBeFalsy();
  });
});

describe("Todo App — tersimpan di localStorage", () => {
  it("tambahan tugas langsung tertulis ke localStorage", async () => {
    const user = userEvent.setup();
    const { input, tombolTambah } = renderApp();

    await user.type(input, "Tersimpan");
    await user.click(tombolTambah);

    const tersimpan = JSON.parse(localStorage.getItem("todo:items"));
    expect(tersimpan).toHaveLength(4);
    expect(tersimpan.some((t) => t.teks === "Tersimpan")).toBe(true);
  });

  it("memakai isi localStorage yang sudah ada, bukan nilai bawaan", async () => {
    localStorage.setItem(
      "todo:items",
      JSON.stringify([{ id: "x1", teks: "Dari penyimpanan", selesai: false }])
    );
    renderApp();

    expect(daftarBaris()).toHaveLength(1);
    expect(barisDengan("Dari penyimpanan")).toBeTruthy();
    // Nilai bawaan tidak boleh ikut muncul.
    expect(barisDengan("Belajar komponen & props")).toBeFalsy();
  });
});
