"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AVAILABLE_ICONS, DynamicIcon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import type { Account } from "@/lib/types";

const TYPES = [
  { v: "cash", l: "Tunai" },
  { v: "bank", l: "Bank" },
  { v: "ewallet", l: "E-Wallet" },
  { v: "credit", l: "Kartu Kredit" },
  { v: "investment", l: "Investasi" },
  { v: "other", l: "Lain-lain" },
];

const PRESET_COLORS = [
  "#28a668", "#22c55e", "#0ea5e9", "#2563eb", "#8b5cf6",
  "#ec4899", "#f97316", "#f59e0b", "#eab308", "#ef4444",
  "#14b8a6", "#64748b",
];

export function AccountForm({
  initial,
  onSubmit,
  onDelete,
  submitLabel = "Simpan",
}: {
  initial?: Account | null;
  onSubmit: (fd: FormData) => Promise<void>;
  onDelete?: () => Promise<void>;
  submitLabel?: string;
}) {
  const router = useRouter();
  const [color, setColor] = useState(initial?.color ?? "#28a668");
  const [icon, setIcon] = useState(initial?.icon ?? "wallet");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("color", color);
    fd.set("icon", icon);
    startTransition(async () => {
      try {
        await onSubmit(fd);
        router.push("/rekening");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
      }
    });
  }

  return (
    <form className="space-y-5" onSubmit={submit}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Nama Rekening</label>
          <input className="input" name="name" defaultValue={initial?.name ?? ""} required />
        </div>
        <div>
          <label className="label">Tipe</label>
          <select className="input" name="type" defaultValue={initial?.type ?? "bank"} required>
            {TYPES.map((t) => (
              <option key={t.v} value={t.v}>
                {t.l}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Mata Uang</label>
          <input
            className="input"
            name="currency"
            defaultValue={initial?.currency ?? "IDR"}
            required
          />
        </div>
        <div>
          <label className="label">Saldo Awal</label>
          <input
            className="input tabular-nums"
            type="number"
            step="0.01"
            name="opening_balance"
            defaultValue={initial?.opening_balance ?? 0}
          />
        </div>
      </div>

      <div>
        <label className="label">Warna</label>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={cn(
                "h-8 w-8 rounded-full ring-offset-2 transition",
                color === c ? "ring-2 ring-brand-500" : "hover:ring-2 hover:ring-surface-300",
              )}
              style={{ backgroundColor: c }}
              aria-label={c}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-8 w-10 rounded border border-surface-200 bg-white"
          />
        </div>
      </div>

      <div>
        <label className="label">Ikon</label>
        <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
          {AVAILABLE_ICONS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setIcon(n)}
              className={cn(
                "h-10 rounded-lg border grid place-items-center transition",
                icon === n
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-surface-200 hover:bg-surface-50",
              )}
            >
              <DynamicIcon name={n} className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Catatan (opsional)</label>
        <textarea className="input" name="note" rows={2} defaultValue={initial?.note ?? ""} />
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-800 text-sm px-3 py-2">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button className="btn-primary" disabled={pending} type="submit">
            {pending ? "Menyimpan..." : submitLabel}
          </button>
          <button className="btn-secondary" type="button" onClick={() => router.back()}>
            Batal
          </button>
        </div>
        {onDelete && (
          <button
            className="btn-danger"
            type="button"
            disabled={pending}
            onClick={() => {
              if (!confirm("Hapus rekening dan seluruh transaksinya?")) return;
              startTransition(async () => {
                await onDelete();
                router.push("/rekening");
                router.refresh();
              });
            }}
          >
            Hapus
          </button>
        )}
      </div>
    </form>
  );
}
