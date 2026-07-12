"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Category } from "@/lib/types";

export function BudgetForm({
  month,
  categories,
  onSubmit,
}: {
  month: string;
  categories: Category[];
  onSubmit: (fd: FormData) => Promise<void>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("month", month);
    startTransition(async () => {
      await onSubmit(fd);
      (e.target as HTMLFormElement).reset();
      router.refresh();
    });
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      <div>
        <label className="label">Kategori</label>
        <select className="input" name="category_id" required>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Batas Anggaran (Rp)</label>
        <input
          className="input tabular-nums"
          type="number"
          name="amount"
          min="0"
          step="1000"
          required
        />
      </div>
      <div>
        <label className="label">Catatan</label>
        <input className="input" name="note" placeholder="opsional" />
      </div>
      <button className="btn-primary w-full" disabled={pending} type="submit">
        {pending ? "Menyimpan..." : "Simpan / Perbarui"}
      </button>
      <p className="text-[11px] text-surface-500">
        Jika kategori sudah punya anggaran untuk bulan ini, nominal akan diperbarui.
      </p>
    </form>
  );
}
