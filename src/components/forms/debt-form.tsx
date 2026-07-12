"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export function DebtForm({
  onSubmit,
}: {
  onSubmit: (fd: FormData) => Promise<void>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await onSubmit(fd);
      (e.target as HTMLFormElement).reset();
      router.refresh();
    });
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      <div>
        <label className="label">Jenis</label>
        <select className="input" name="kind" defaultValue="hutang">
          <option value="hutang">Hutang (saya pinjam)</option>
          <option value="piutang">Piutang (saya pinjamkan)</option>
        </select>
      </div>
      <div>
        <label className="label">Nama Pihak</label>
        <input className="input" name="party" required placeholder="mis. Andi, Bank X" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Nominal</label>
          <input className="input tabular-nums" type="number" name="amount" step="1000" required />
        </div>
        <div>
          <label className="label">Sudah Dibayar</label>
          <input
            className="input tabular-nums"
            type="number"
            name="paid"
            step="1000"
            defaultValue="0"
          />
        </div>
      </div>
      <div>
        <label className="label">Jatuh Tempo</label>
        <input className="input" type="date" name="due_date" />
      </div>
      <div>
        <label className="label">Catatan</label>
        <input className="input" name="note" />
      </div>
      <button className="btn-primary w-full" type="submit" disabled={pending}>
        {pending ? "Menyimpan..." : "Tambah"}
      </button>
    </form>
  );
}
