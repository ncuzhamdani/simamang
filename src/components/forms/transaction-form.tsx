"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Account, Category, Transaction } from "@/lib/types";
import { cn } from "@/lib/cn";
import { inputDateTimeValue } from "@/lib/format";

export function TransactionForm({
  accounts,
  categories,
  initial,
  onSubmit,
  onDelete,
  submitLabel = "Simpan",
}: {
  accounts: Account[];
  categories: Category[];
  initial?: Transaction | null;
  onSubmit: (fd: FormData) => Promise<void>;
  onDelete?: () => Promise<void>;
  submitLabel?: string;
}) {
  const router = useRouter();
  const [type, setType] = useState<Transaction["type"]>(initial?.type ?? "expense");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const filteredCats = useMemo(
    () =>
      categories.filter((c) =>
        type === "income" ? c.kind === "income" : c.kind === "expense",
      ),
    [categories, type],
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("type", type);
    startTransition(async () => {
      try {
        await onSubmit(fd);
        router.push("/transaksi");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
      }
    });
  }

  const typeButtons: Array<{ v: Transaction["type"]; label: string; cls: string }> = [
    { v: "expense", label: "Pengeluaran", cls: "data-[a=true]:bg-red-600 data-[a=true]:text-white" },
    { v: "income", label: "Pemasukan", cls: "data-[a=true]:bg-emerald-600 data-[a=true]:text-white" },
    { v: "transfer", label: "Transfer", cls: "data-[a=true]:bg-sky-600 data-[a=true]:text-white" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-3 gap-2">
        {typeButtons.map((b) => (
          <button
            key={b.v}
            type="button"
            data-a={type === b.v}
            onClick={() => setType(b.v)}
            className={cn(
              "rounded-lg border border-surface-200 py-2 text-sm font-medium bg-white hover:bg-surface-50 transition-colors",
              b.cls,
              "data-[a=true]:border-transparent",
            )}
          >
            {b.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Nominal (Rp)</label>
          <input
            className="input text-lg tabular-nums"
            type="number"
            name="amount"
            defaultValue={initial?.amount ?? ""}
            min="0"
            step="0.01"
            required
            placeholder="0"
          />
        </div>
        <div>
          <label className="label">Waktu Transaksi</label>
          <input
            className="input"
            type="datetime-local"
            name="occurred_at"
            defaultValue={inputDateTimeValue(initial?.occurred_at ?? undefined)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">{type === "transfer" ? "Dari Rekening" : "Rekening"}</label>
          <select
            className="input"
            name="account_id"
            required
            defaultValue={initial?.account_id ?? accounts[0]?.id}
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        {type === "transfer" ? (
          <div>
            <label className="label">Ke Rekening</label>
            <select
              className="input"
              name="to_account_id"
              defaultValue={initial?.to_account_id ?? ""}
              required
            >
              <option value="">Pilih rekening tujuan</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label className="label">Kategori</label>
            <select
              className="input"
              name="category_id"
              defaultValue={initial?.category_id ?? ""}
            >
              <option value="">Tanpa kategori</option>
              {filteredCats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div>
        <label className="label">Catatan</label>
        <input
          className="input"
          name="note"
          defaultValue={initial?.note ?? ""}
          placeholder="Deskripsi singkat transaksi"
        />
      </div>

      <div>
        <label className="label">Tag (pisahkan dengan koma)</label>
        <input
          className="input"
          name="tags"
          defaultValue={initial?.tags ?? ""}
          placeholder="mis. rutin, urgent, dinas"
        />
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-800 text-sm px-3 py-2">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button type="submit" className="btn-primary" disabled={pending}>
            {pending ? "Menyimpan..." : submitLabel}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => router.back()}
          >
            Batal
          </button>
        </div>
        {onDelete && (
          <button
            type="button"
            className="btn-danger"
            disabled={pending}
            onClick={() => {
              if (!confirm("Hapus transaksi ini?")) return;
              startTransition(async () => {
                await onDelete();
                router.push("/transaksi");
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
