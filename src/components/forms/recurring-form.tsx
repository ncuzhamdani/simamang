"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Account, Category } from "@/lib/types";

export function RecurringForm({
  accounts,
  categories,
  onSubmit,
}: {
  accounts: Account[];
  categories: Category[];
  onSubmit: (fd: FormData) => Promise<void>;
}) {
  const router = useRouter();
  const [type, setType] = useState<"income" | "expense">("expense");
  const [freq, setFreq] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly");
  const [pending, startTransition] = useTransition();

  const filteredCats = useMemo(
    () => categories.filter((c) => c.kind === type),
    [categories, type],
  );

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("type", type);
    fd.set("frequency", freq);
    startTransition(async () => {
      await onSubmit(fd);
      (e.target as HTMLFormElement).reset();
      router.refresh();
    });
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      <div>
        <label className="label">Nama Jadwal</label>
        <input className="input" name="name" required placeholder="mis. Gaji Bulanan" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Tipe</label>
          <select
            className="input"
            value={type}
            onChange={(e) => setType(e.target.value as typeof type)}
          >
            <option value="expense">Pengeluaran</option>
            <option value="income">Pemasukan</option>
          </select>
        </div>
        <div>
          <label className="label">Nominal</label>
          <input
            className="input tabular-nums"
            type="number"
            name="amount"
            min="0"
            step="1000"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Rekening</label>
          <select className="input" name="account_id" required>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Kategori</label>
          <select className="input" name="category_id">
            <option value="">— tidak spesifik —</option>
            {filteredCats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Frekuensi</label>
          <select
            className="input"
            value={freq}
            onChange={(e) => setFreq(e.target.value as typeof freq)}
          >
            <option value="daily">Harian</option>
            <option value="weekly">Mingguan</option>
            <option value="monthly">Bulanan</option>
            <option value="yearly">Tahunan</option>
          </select>
        </div>
        <div>
          <label className="label">Tanggal Berikutnya</label>
          <input className="input" type="date" name="next_run" required />
        </div>
      </div>
      {freq === "monthly" || freq === "yearly" ? (
        <div>
          <label className="label">Hari dalam bulan (1-31)</label>
          <input
            className="input tabular-nums"
            type="number"
            name="day_of_month"
            min="1"
            max="31"
          />
        </div>
      ) : freq === "weekly" ? (
        <div>
          <label className="label">Hari dalam minggu</label>
          <select className="input" name="day_of_week">
            <option value="0">Minggu</option>
            <option value="1">Senin</option>
            <option value="2">Selasa</option>
            <option value="3">Rabu</option>
            <option value="4">Kamis</option>
            <option value="5">Jumat</option>
            <option value="6">Sabtu</option>
          </select>
        </div>
      ) : null}
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="active" defaultChecked /> Aktifkan jadwal
      </label>
      <div>
        <label className="label">Catatan</label>
        <input className="input" name="note" />
      </div>
      <button className="btn-primary w-full" type="submit" disabled={pending}>
        {pending ? "Menyimpan..." : "Simpan Jadwal"}
      </button>
    </form>
  );
}
