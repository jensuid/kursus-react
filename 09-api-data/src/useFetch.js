// useFetch.js — custom hook mengambil data dari API
// Inilah "pola fetch data React" yang akan kamu tulis seumur hidup:
// state (data, loading, error) + useEffect + AbortController.
import { useEffect, useState } from "react";

export function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController(); // bisa batalkan fetch

    async function jalan() {
      setLoading(true);
      setError(null);
      try {
        const respons = await fetch(url, { signal: controller.signal });
        if (!respons.ok) throw new Error(`HTTP ${respons.status}`);
        const json = await respons.json();
        if (!controller.signal.aborted) setData(json);
      } catch (err) {
        // abort = dibatalkan sengaja (bukan error sungguhan)
        if (err.name !== "AbortError") setError(err);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    jalan();
    return () => controller.abort(); // cleanup: batalkan kalau unmount/refetch
  }, [url]);

  return { data, loading, error };
}
