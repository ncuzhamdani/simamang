"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { contributeGoalAction } from "@/app/actions/goals";

export function ContributeGoalButton({ id }: { id: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <div className="relative">
      <button className="btn-primary text-xs" type="button" onClick={() => setOpen((v) => !v)}>
        <Plus className="h-3.5 w-3.5" /> Menabung
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-20 bg-white border border-surface-200 rounded-lg shadow-lg p-3 w-64">
          <div className="text-xs font-medium mb-2">Tambah tabungan</div>
          <input
            type="number"
            className="input mb-2"
            placeholder="Nominal (Rp)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step="1000"
          />
          <div className="flex gap-2 justify-end">
            <button className="btn-ghost text-xs" onClick={() => setOpen(false)}>
              Batal
            </button>
            <button
              className="btn-primary text-xs"
              disabled={!amount || pending}
              onClick={() =>
                startTransition(async () => {
                  const n = Number(amount);
                  if (!Number.isFinite(n) || n <= 0) return;
                  await contributeGoalAction(id, n);
                  setOpen(false);
                  setAmount("");
                  router.refresh();
                })
              }
            >
              {pending ? "..." : "Simpan"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
