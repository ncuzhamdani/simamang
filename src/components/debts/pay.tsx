"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { payDebtAction } from "@/app/actions/debts";

export function DebtPayButton({ id }: { id: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [pending, startTransition] = useTransition();
  return (
    <div className="relative">
      <button className="btn-primary text-xs" onClick={() => setOpen((v) => !v)}>
        Bayar
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-20 w-64 bg-white border border-surface-200 rounded-lg shadow-lg p-3">
          <div className="text-xs font-medium mb-2">Nominal pembayaran</div>
          <input
            type="number"
            className="input mb-2 tabular-nums"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
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
                  await payDebtAction(id, n);
                  setAmount("");
                  setOpen(false);
                  router.refresh();
                })
              }
            >
              {pending ? "..." : "Bayar"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
