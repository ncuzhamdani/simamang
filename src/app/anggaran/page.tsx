import Link from "next/link";
import { PiggyBank } from "lucide-react";
import { PageHeader, Card } from "@/components/ui/section";
import { Empty } from "@/components/ui/empty";
import { DynamicIcon } from "@/components/ui/icon";
import {
  listBudgetsForMonth,
  listCategories,
} from "@/lib/queries";
import { addMonth, currentMonth, formatCurrency, formatMonth } from "@/lib/format";
import { deleteBudgetAction, upsertBudgetAction } from "@/app/actions/budgets";
import { BudgetForm } from "@/components/forms/budget-form";
import { ConfirmButton } from "@/components/ui/confirm-button";

export const dynamic = "force-dynamic";

export default function BudgetsPage({
  searchParams,
}: {
  searchParams: { month?: string };
}) {
  const month = searchParams.month || currentMonth();
  const budgets = listBudgetsForMonth(month);
  const categories = listCategories("expense");

  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const remaining = totalBudget - totalSpent;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Anggaran Bulanan"
        description="Tetapkan batas pengeluaran per kategori dan pantau progresnya."
        actions={
          <>
            <Link href={`/anggaran?month=${addMonth(month, -1)}`} className="btn-secondary">
              ← {formatMonth(addMonth(month, -1))}
            </Link>
            <div className="btn-secondary pointer-events-none">{formatMonth(month)}</div>
            <Link href={`/anggaran?month=${addMonth(month, 1)}`} className="btn-secondary">
              {formatMonth(addMonth(month, 1))} →
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card card-pad">
          <div className="text-xs text-surface-500 uppercase font-medium">Total Anggaran</div>
          <div className="mt-2 text-2xl font-semibold tabular-nums">{formatCurrency(totalBudget)}</div>
        </div>
        <div className="card card-pad">
          <div className="text-xs text-surface-500 uppercase font-medium">Terpakai</div>
          <div className="mt-2 text-2xl font-semibold tabular-nums text-red-600">
            {formatCurrency(totalSpent)}
          </div>
        </div>
        <div className="card card-pad">
          <div className="text-xs text-surface-500 uppercase font-medium">Sisa</div>
          <div
            className={`mt-2 text-2xl font-semibold tabular-nums ${
              remaining < 0 ? "text-red-600" : "text-emerald-600"
            }`}
          >
            {formatCurrency(remaining)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Tetapkan Anggaran" description={`Untuk ${formatMonth(month)}`}>
          <BudgetForm month={month} categories={categories} onSubmit={upsertBudgetAction} />
        </Card>

        <Card
          className="lg:col-span-2"
          title="Progress Anggaran"
          description="Warna merah menandakan pengeluaran melebihi batas."
        >
          {budgets.length === 0 ? (
            <Empty
              title="Belum ada anggaran"
              description="Gunakan form di kiri untuk menambahkan anggaran per kategori."
              icon={<PiggyBank className="h-6 w-6" />}
            />
          ) : (
            <ul className="space-y-4">
              {budgets.map((b) => {
                const pct = b.amount ? Math.min(100, (b.spent / b.amount) * 100) : 0;
                const over = b.spent > b.amount;
                const del = async () => {
                  "use server";
                  await deleteBudgetAction(b.id);
                };
                return (
                  <li key={b.id} className="rounded-lg border border-surface-200 p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="h-9 w-9 rounded-lg text-white grid place-items-center"
                        style={{ backgroundColor: b.category_color }}
                      >
                        <DynamicIcon name={b.category_icon} className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{b.category_name}</div>
                        {b.note && (
                          <div className="text-xs text-surface-500 truncate">{b.note}</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold tabular-nums">
                          {formatCurrency(b.spent)} / {formatCurrency(b.amount)}
                        </div>
                        <div className={`text-xs ${over ? "text-red-600" : "text-surface-500"}`}>
                          {over
                            ? `Lebih ${formatCurrency(b.spent - b.amount)}`
                            : `Sisa ${formatCurrency(b.amount - b.spent)}`}
                        </div>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-surface-100 overflow-hidden">
                      <div
                        className="h-full"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: over ? "#ef4444" : b.category_color,
                        }}
                      />
                    </div>
                    <div className="mt-2 flex justify-end">
                      <ConfirmButton className="btn-ghost text-xs" action={del}>
                        Hapus anggaran
                      </ConfirmButton>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
