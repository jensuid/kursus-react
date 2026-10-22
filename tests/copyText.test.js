// Uji copyText — dua jalur clipboard, dan kegagalan yang tidak diam-diam.
import { describe, expect, it, vi } from "vitest";
import { copyText } from "../src/copyText.js";

// navigator.clipboard boleh diatur ulang per uji: di jsdom prop-nya punya
// descriptor default, jadi defineProperty harus eksplisit + configurable.
function pasangClipboard(clipboard) {
  Object.defineProperty(window.navigator, "clipboard", {
    value: clipboard,
    configurable: true,
  });
}

function pasangExecCommand(fn) {
  Object.defineProperty(document, "execCommand", {
    value: fn,
    configurable: true,
    writable: true,
  });
}

describe("copyText", () => {
  it("memakai Clipboard API ketika tersedia", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    pasangClipboard({ writeText });
    pasangExecCommand(vi.fn().mockReturnValue(false));

    expect(await copyText("modul-01/src/App.jsx")).toBe(true);
    expect(writeText).toHaveBeenCalledWith("modul-01/src/App.jsx");
  });

  it("jatuh ke execCommand ketika clipboard tidak ada (http non-localhost)", async () => {
    // Ini kasus memperagakan hub di kelas lewat http://192.168.x.x:5200:
    // navigator.clipboard tidak eksis sama sekali, bukan sekadar gagal.
    pasangClipboard(undefined);
    const execCommand = vi.fn().mockReturnValue(true);
    pasangExecCommand(execCommand);

    expect(await copyText("jalur/backup")).toBe(true);
    expect(execCommand).toHaveBeenCalledWith("copy");
  });

  it("tetap mencoba execCommand ketika Clipboard API menolak (izin ditolak)", async () => {
    pasangClipboard({
      writeText: vi.fn().mockRejectedValue(new Error("NotAllowed")),
    });
    const execCommand = vi.fn().mockReturnValue(true);
    pasangExecCommand(execCommand);

    expect(await copyText("dua-kaki")).toBe(true);
    expect(execCommand).toHaveBeenCalledWith("copy");
  });

  it("mengembalikan false ketika kedua jalur gagal — bukan diam-diam", async () => {
    pasangClipboard(undefined);
    pasangExecCommand(vi.fn().mockReturnValue(false));

    expect(await copyText("gagal")).toBe(false);
  });

  it("tidak meninggalkan textarea titipan di DOM", async () => {
    pasangClipboard(undefined);
    pasangExecCommand(vi.fn().mockReturnValue(true));

    await copyText("bersih");
    await copyText("bersih lagi");

    expect(document.querySelectorAll("textarea")).toHaveLength(0);
  });
});
