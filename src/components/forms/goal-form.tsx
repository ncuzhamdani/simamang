"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AVAILABLE_ICONS, DynamicIcon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import { inputDateValue } from "@/lib/format";
import type { Account, Goal } from "@/lib/types";

const PRESET_COLORS = [
  "#28a668", "#22c55e", "#0ea5e9", "#2563eb", "#8b5cf6",
  "#ec4899", "#f97316", "#f59e0b", "#eab308", "#ef4444",
  "#14b8a6", "#64748b",
];

export function GoalForm({
  accounts,
  initial,
  onSubmit,
  submitLabel = "Simpan",
}: {
  accounts: Account[];
  initial?: Goal | null;
  onSubmit: (fd: FormData) => Promise<void>;
  submitLabel?: string;
}) {
  const router = useRouter();
  const [icon, setIcon] = useState(initial?.icon ?? "target");
  const [color, setColor] = useState(initial?.color ?? "#28a668");
  const [pending, startTransition] = useTransition();

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("icon", icon);
    fd.set("color", color);
    startTransition(async () => {
      await onSubmit(fd);
      router.push("/target");
      router.refresh();
    });
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Nama Target</label>
          <input className="input" name="name" defaultValue={initial?.name ?? ""} required />
        </div>
        <div>
          <label className="label">Rekening (opsional)</label>
          <select className="input" name="account_id" defaultValue={initial?.account_id ?? ""}>
            <option value="">— tidak spesifik —</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="label">Nominal Target</label>
          <input
            className="input tabular-nums"
            type="number"
            name="target_amount"
            min="0"
            step="1000"
            defaultValue={initial?.target_amount ?? ""}
            required
          />
        </div>
        <div>
          <label className="label">Sudah Tersimpan</label>
          <input
            className="input tabular-nums"
            type="number"
            name="saved_amount"
            min="0"
            step="1000"
            defaultValue={initial?.saved_amount ?? 0}
          />
        </div>
        <div>
          <label className="label">Deadline</label>
          <input
            className="input"
            type="date"
            name="deadline"
            defaultValue={inputDateValue(initial?.deadline ?? "")}
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
                "h-8 w-8 rounded-full",
                color === c ? "ring-2 ring-brand-500" : "hover:ring-2 hover:ring-surface-300",
              )}
              style={{ backgroundColor: c }}
              aria-label={c}
            />
          ))}
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
                "h-9 rounded-lg border grid place-items-center transition",
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
        <label className="label">Catatan</label>
        <textarea className="input" name="note" rows={2} defaultValue={initial?.note ?? ""} />
      </div>
      <div className="flex gap-2">
        <button className="btn-primary" disabled={pending} type="submit">
          {pending ? "Menyimpan..." : submitLabel}
        </button>
        <button className="btn-secondary" type="button" onClick={() => router.back()}>
          Batal
        </button>
      </div>
    </form>
  );
}
