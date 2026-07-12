"use client";

import { useTransition } from "react";
import { Download } from "lucide-react";

export function ExportButton({ exportFn }: { exportFn: () => Promise<string> }) {
  const [pending, startTransition] = useTransition();
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <button
        type="button"
        className="btn-primary"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const json = await exportFn();
            const blob = new Blob([json], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
            a.download = `simamang-backup-${stamp}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          })
        }
      >
        <Download className="h-4 w-4" />
        {pending ? "Menyiapkan..." : "Unduh JSON"}
      </button>
      <div className="text-xs text-surface-500">
        File berisi semua akun, kategori, transaksi, anggaran, target, hutang, dan pengaturan.
      </div>
    </div>
  );
}
