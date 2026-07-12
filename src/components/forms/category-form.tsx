"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AVAILABLE_ICONS, DynamicIcon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import type { Category } from "@/lib/types";

const PRESET_COLORS = [
  "#28a668", "#22c55e", "#0ea5e9", "#2563eb", "#8b5cf6",
  "#ec4899", "#f97316", "#f59e0b", "#eab308", "#ef4444",
  "#14b8a6", "#64748b",
];

export function CategoryForm({
  initial,
  onSubmit,
  submitLabel = "Simpan",
}: {
  initial?: Category | null;
  onSubmit: (fd: FormData) => Promise<void>;
  submitLabel?: string;
}) {
  const router = useRouter();
  const [icon, setIcon] = useState(initial?.icon ?? "tag");
  const [color, setColor] = useState(initial?.color ?? "#64748b");
  const [pending, startTransition] = useTransition();

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("icon", icon);
    fd.set("color", color);
    startTransition(async () => {
      await onSubmit(fd);
      (e.target as HTMLFormElement).reset();
      router.refresh();
    });
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      <div>
        <label className="label">Nama Kategori</label>
        <input className="input" name="name" defaultValue={initial?.name ?? ""} required />
      </div>
      <div>
        <label className="label">Jenis</label>
        <select className="input" name="kind" defaultValue={initial?.kind ?? "expense"}>
          <option value="expense">Pengeluaran</option>
          <option value="income">Pemasukan</option>
        </select>
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
                "h-7 w-7 rounded-full ring-offset-2 transition",
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
            className="h-7 w-8 rounded border border-surface-200"
          />
        </div>
      </div>
      <div>
        <label className="label">Ikon</label>
        <div className="grid grid-cols-6 gap-2 max-h-40 overflow-auto">
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
      <button className="btn-primary w-full" type="submit" disabled={pending}>
        {pending ? "Menyimpan..." : submitLabel}
      </button>
    </form>
  );
}
