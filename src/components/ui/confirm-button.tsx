"use client";

import { useState, useTransition, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export function ConfirmButton({
  action,
  children,
  confirm = "Yakin ingin melanjutkan?",
  className,
  disabled,
}: {
  action: () => Promise<void>;
  children: ReactNode;
  confirm?: string;
  className?: string;
  disabled?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [asking, setAsking] = useState(false);
  return (
    <div className="relative inline-flex">
      <button
        type="button"
        disabled={disabled || pending}
        className={cn(className)}
        onClick={() => setAsking((v) => !v)}
      >
        {children}
      </button>
      {asking && (
        <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-surface-200 rounded-lg shadow-lg p-3 w-64 text-left">
          <div className="text-sm mb-2">{confirm}</div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              className="btn-ghost text-xs"
              onClick={() => setAsking(false)}
            >
              Batal
            </button>
            <button
              type="button"
              className="btn-danger text-xs"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await action();
                  setAsking(false);
                })
              }
            >
              {pending ? "Memproses..." : "Ya, lanjutkan"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
