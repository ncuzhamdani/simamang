import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/format";
import type { ReactNode } from "react";

export function Stat({
  label,
  value,
  hint,
  tone = "neutral",
  icon,
  currency = "IDR",
  raw,
}: {
  label: string;
  value: number | string;
  hint?: string;
  tone?: "neutral" | "success" | "danger" | "info" | "warning";
  icon?: ReactNode;
  currency?: string;
  raw?: boolean;
}) {
  const toneMap: Record<string, string> = {
    neutral: "text-surface-900",
    success: "text-emerald-600",
    danger: "text-red-600",
    info: "text-sky-600",
    warning: "text-amber-600",
  };
  const bgMap: Record<string, string> = {
    neutral: "bg-surface-100 text-surface-600",
    success: "bg-emerald-50 text-emerald-600",
    danger: "bg-red-50 text-red-600",
    info: "bg-sky-50 text-sky-600",
    warning: "bg-amber-50 text-amber-600",
  };
  const displayValue =
    typeof value === "number" && !raw ? formatCurrency(value, currency) : String(value);
  return (
    <div className="card card-pad">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-wide text-surface-500 font-medium">{label}</div>
        {icon && (
          <div className={cn("h-8 w-8 grid place-items-center rounded-lg", bgMap[tone])}>{icon}</div>
        )}
      </div>
      <div className={cn("mt-2 text-2xl font-semibold tabular-nums", toneMap[tone])}>
        {displayValue}
      </div>
      {hint && <div className="mt-1 text-xs text-surface-500">{hint}</div>}
    </div>
  );
}
