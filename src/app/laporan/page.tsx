import Link from "next/link";
import { PageHeader, Card } from "@/components/ui/section";
import { DynamicIcon } from "@/components/ui/icon";
import { Empty } from "@/components/ui/empty";
import {
  dailySeries,
  expenseByCategory,
  incomeByCategory,
  monthlySeries,
  monthlyTotals,
} from "@/lib/queries";
import { addMonth, currentMonth, formatCurrency, formatMonth } from "@/lib/format";
import { CategoryDonut, DailyBarChart, MonthlyBarChart } from "@/components/charts";

export const dynamic = "force-dynamic";

export default function ReportsPage({
  searchParams,
}: {
  searchParams: { month?: string };
}) {
  const month = searchParams.month || currentMonth();
  const totals = monthlyTotals(month);
  const daily = dailySeries(month);
  const cashflow = monthlySeries(12);
  const expByCat = expenseByCategory(month);
  const incByCat = incomeByCategory(month);
  const totalExp = expByCat.reduce((s, e) => s + e.total, 0);
  const totalInc = incByCat.reduce((s, e) => s + e.total, 0);

  const savingsRate = totals.income > 0
    ? Math.round(((totals.income - totals.expense) / totals.income) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laporan"
        description="Ringkasan mendalam pemasukan, pengeluaran, dan pola bulanan Anda."
        actions={
          <>
            <Link href={`/laporan?month=${addMonth(month, -1)}`} className="btn-secondary">
              ← {formatMonth(addMonth(month, -1))}
            </Link>
            <div className="btn-secondary pointer-events-none">{formatMonth(month)}</div>
            <Link href={`/laporan?month=${addMonth(month, 1)}`} className="btn-secondary">
              {formatMonth(addMonth(month, 1))} →
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatSimple label="Pemasukan" value={formatCurrency(totals.income)} tone="text-emerald-600" />
        <StatSimple label="Pengeluaran" value={formatCurrency(totals.expense)} tone="text-red-600" />
        <StatSimple
          label="Selisih"
          value={formatCurrency(totals.net)}
          tone={totals.net >= 0 ? "text-emerald-600" : "text-red-600"}
        />
        <StatSimple label="Rasio Menabung" value={`${savingsRate}%`} tone="text-brand-600" />
      </div>

      <Card
        title="Perbandingan 12 Bulan"
        description="Bar untuk pemasukan, pengeluaran, dan selisih."
      >
        <div className="h-72">
          <MonthlyBarChart data={cashflow} />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card
          className="lg:col-span-2"
          title="Pola Harian"
          description={`Rincian harian ${formatMonth(month)}`}
        >
          <div className="h-64">
            <DailyBarChart data={daily} />
          </div>
        </Card>
        <Card title="Kategori Pemasukan" description={`Total ${formatCurrency(totalInc)}`}>
          {incByCat.length ? (
            <div className="h-64">
              <CategoryDonut data={incByCat} />
            </div>
          ) : (
            <Empty title="Belum ada pemasukan" />
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="Distribusi Pengeluaran"
          description={`Total ${formatCurrency(totalExp)}`}
        >
          {expByCat.length ? (
            <div className="h-72">
              <CategoryDonut data={expByCat} />
            </div>
          ) : (
            <Empty title="Belum ada pengeluaran" />
          )}
        </Card>
        <Card title="Rincian Kategori Pengeluaran">
          {expByCat.length === 0 ? (
            <Empty title="Belum ada pengeluaran" />
          ) : (
            <ul className="divide-y divide-surface-100">
              {expByCat.map((c) => {
                const pct = totalExp ? (c.total / totalExp) * 100 : 0;
                return (
                  <li key={c.category_id} className="py-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-8 w-8 rounded-lg text-white grid place-items-center"
                        style={{ backgroundColor: c.category_color }}
                      >
                        <DynamicIcon name={c.category_icon} className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{c.category_name}</div>
                        <div className="text-xs text-surface-500">{pct.toFixed(1)}% dari total</div>
                      </div>
                      <div className="text-sm font-semibold tabular-nums">
                        {formatCurrency(c.total)}
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-surface-100 overflow-hidden">
                      <div
                        className="h-full"
                        style={{ width: `${pct}%`, backgroundColor: c.category_color }}
                      />
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

function StatSimple({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="card card-pad">
      <div className="text-xs text-surface-500 uppercase font-medium">{label}</div>
      <div className={`mt-2 text-2xl font-semibold tabular-nums ${tone}`}>{value}</div>
    </div>
  );
}
