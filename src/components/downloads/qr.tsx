"use client";

import { useEffect, useState } from "react";
import { Copy, Check } from "lucide-react";

/**
 * Simple QR generator using the goqr.me API for reliability without JS deps.
 * If offline, we show the URL as text/link instead.
 */
export function QrBlock() {
  const [url, setUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") setUrl(window.location.origin);
  }, []);

  const qr = url
    ? `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=4&data=${encodeURIComponent(url)}`
    : "";

  return (
    <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 items-center">
      <div className="rounded-2xl border border-surface-200 bg-white p-3 grid place-items-center">
        {url ? (
          <img src={qr} alt="QR code" width={280} height={280} className="rounded-lg" />
        ) : (
          <div className="h-[280px] w-[280px] rounded-lg bg-surface-100 animate-pulse" />
        )}
      </div>
      <div className="space-y-3">
        <div>
          <div className="text-xs uppercase font-medium text-surface-500">URL Instalasi</div>
          <div className="mt-1 flex items-center gap-2">
            <code className="text-sm bg-surface-100 rounded-lg px-3 py-2 flex-1 break-all">
              {url || "…"}
            </code>
            <button
              className="btn-secondary text-xs"
              disabled={!url}
              onClick={async () => {
                if (!url) return;
                try {
                  await navigator.clipboard.writeText(url);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                } catch {
                  // ignore
                }
              }}
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" /> Tersalin
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" /> Salin
                </>
              )}
            </button>
          </div>
        </div>
        <ol className="text-sm text-surface-600 space-y-1 list-decimal list-inside">
          <li>Buka kamera iPhone / aplikasi kamera Android.</li>
          <li>Arahkan ke QR code di sebelah.</li>
          <li>Ketuk notifikasi yang muncul, lalu buka di Safari / Chrome.</li>
          <li>
            Ikuti panduan <b>"Tambah ke Layar Utama"</b> di atas.
          </li>
        </ol>
      </div>
    </div>
  );
}
