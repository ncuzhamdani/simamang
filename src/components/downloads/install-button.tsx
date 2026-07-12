"use client";

import { useEffect, useState } from "react";
import { Download, CheckCircle2 } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function InstallButton() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [supported, setSupported] = useState<null | boolean>(null);

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS Safari
      window.navigator.standalone === true;
    if (isStandalone) setInstalled(true);

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setSupported(true);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    const t = setTimeout(() => setSupported((s) => (s === null ? false : s)), 1500);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
      clearTimeout(t);
    };
  }, []);

  if (installed) {
    return (
      <div className="chip-success">
        <CheckCircle2 className="h-3.5 w-3.5" /> Sudah terpasang
      </div>
    );
  }

  if (deferred) {
    return (
      <button
        className="btn-primary text-sm w-full justify-center"
        onClick={async () => {
          await deferred.prompt();
          await deferred.userChoice;
          setDeferred(null);
        }}
      >
        <Download className="h-4 w-4" /> Install SiMamang
      </button>
    );
  }

  return (
    <div className="text-xs text-surface-500">
      {supported === false
        ? "Browser Anda tidak mendukung install otomatis. Gunakan opsi menu browser (Add to Home Screen / Install)."
        : "Menunggu browser…"}
    </div>
  );
}
