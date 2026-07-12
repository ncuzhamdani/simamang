"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Download, X, Smartphone } from "lucide-react";

const DISMISS_KEY = "simamang-install-banner-dismissed";

export function InstallBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(DISMISS_KEY) === "1") return;
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS Safari
      window.navigator.standalone === true;
    if (isStandalone) return;
    setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div className="rounded-2xl border border-brand-200 bg-gradient-to-r from-brand-50 to-white p-4 flex items-center gap-3">
      <div className="h-10 w-10 rounded-xl bg-brand-600 text-white grid place-items-center">
        <Smartphone className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-surface-900">
          Pasang SiMamang sebagai aplikasi
        </div>
        <div className="text-xs text-surface-600">
          Akses instan dari home screen — iOS, Android, atau desktop. Bekerja offline setelah dimuat.
        </div>
      </div>
      <Link href="/unduh" className="btn-primary text-xs whitespace-nowrap">
        <Download className="h-3.5 w-3.5" /> Pasang
      </Link>
      <button
        aria-label="Sembunyikan"
        className="btn-ghost text-xs"
        onClick={() => {
          localStorage.setItem(DISMISS_KEY, "1");
          setVisible(false);
        }}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
