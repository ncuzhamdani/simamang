import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Handshake,
  ArrowRight,
  Repeat2,
  Sparkles,
} from "lucide-react";
import { PageHeader, Card } from "@/components/ui/section";
import { Stat } from "@/components/ui/stat";
import { DynamicIcon } from "@/components/ui/icon";
import { Empty } from "@/components/ui/empty";
import {
  dailySeries,
  expenseByCategory,
  incomeByCategory,
  listAccountsWithBalances,
  listBudgetsForMonth,
  listGoals,
  listTransactions,
  monthlySeries,
  monthlyTotals,
  outstandingDebtsSummary,
  totalNetWorth,
  upcomingRecurring,
} from "@/lib/queries";
import { currentMonth, formatCurrency, formatDate, formatMonth } from "@/lib/format";
import { CashflowChart, CategoryDonut, DailyBarChart } from "@/components/charts";
import { InstallBanner } from "@/components/downloads/install-banner";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const month = currentMonth();
  const totals = monthlyTotals(month);
  const accounts = listAccountsWithBalances();
  const netWorth = totalNetWorth();
  const expenseByCat = expenseByCategory(month);
  const incomeByCat = incomeByCategory(month);
  const daily = dailySeries(month);
  const cashflow = monthlySeries(6);
  const recentTx = listTransactions({ limit: 8 });
  const budgets = listBudgetsForMonth(month);
  const goals = listGoals().slice(0, 3);
  const debts = outstandingDebtsSummary();
  const recurring = upcomingRecurring(4);

  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const savingsRate = totals.income > 0 ? Math.round(((totals.income - totals.expense) / totals.income) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Keuangan"
        description={`Ringkasan bulan ${formatMonth(month)} — pantau arus kas, anggaran, dan target Anda secara detail.`}
        actions={
          <Link href="/transaksi/baru" className="btn-primary">
            <Sparkles className="h-4 w-4" /> Catat Cepat
          </Link>
        }
      />

      <InstallBanner />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat
          label="Total Kekayaan Bersih"
          value={netWorth}
          hint={`${accounts.length} rekening aktif`}
          tone={netWorth >= 0 ? "success" : "danger"}
          icon={<Wallet className="h-4 w-4" />}
        />
        <Stat
          label={`Pemasukan · ${formatMonth(month)}`}
          value={totals.income}
          hint={`${totals.txCount} transaksi bulan ini`}
          tone="success"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <Stat
          label={`Pengeluaran · ${formatMonth(month)}`}
          value={totals.expense}
          hint={`Rasio menabung ${savingsRate}%`}
          tone="danger"
          icon={<TrendingDown className="h-4 w-4" />}
        />
        <Stat
          label="Selisih Bulan Ini"
          value={totals.net}
          hint={totals.net >= 0 ? "Surplus" : "Defisit"}
          tone={totals.net >= 0 ? "success" : "danger"}
          icon={<PiggyBank className="h-4 w-4" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card
          className="lg:col-span-2"
          title="Arus Kas 6 Bulan Terakhir"
          description="Perbandingan pemasukan vs pengeluaran per bulan."
        >
          <div className="h-72">
            <CashflowChart data={cashflow} />
          </div>
        </Card>
        <Card
          title="Distribusi Pengeluaran"
          description={`Pengeluaran bulan ${formatMonth(month)} per kategori.`}
        >
          {expenseByCat.length ? (
            <div className="h-72">
              <CategoryDonut data={expenseByCat} />
            </div>
          ) : (
            <Empty
              title="Belum ada pengeluaran"
              description="Catat pengeluaran pertama Anda bulan ini."
            />
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card
          className="lg:col-span-2"
          title="Aktivitas Harian"
          description={`Rincian arus kas harian di bulan ${formatMonth(month)}.`}
        >
          <div className="h-64">
            <DailyBarChart data={daily} />
          </div>
        </Card>
        <Card title="Rekening" description="Saldo terbaru">
          <ul className="divide-y divide-surface-100">
            {accounts.map((a) => (
              <li key={a.id} className="flex items-center gap-3 py-2.5">
                <div
                  className="h-9 w-9 rounded-lg grid place-items-center text-white"
                  style={{ backgroundColor: a.color }}
                >
                  <DynamicIcon name={a.icon} className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{a.name}</div>
                  <div className="text-xs text-surface-500 capitalize">{a.type}</div>
                </div>
                <div className={`tabular-nums text-sm font-medium ${a.balance < 0 ? "text-red-600" : ""}`}>
                  {formatCurrency(a.balance, a.currency)}
                </div>
              </li>
            ))}
          </ul>
          <Link
            href="/rekening"
            className="mt-3 inline-flex items-center text-sm text-brand-700 hover:underline"
          >
            Kelola rekening <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Link>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card
          className="lg:col-span-2"
          title="Transaksi Terbaru"
          description="8 aktivitas terakhir tercatat."
          actions={
            <Link href="/transaksi" className="text-sm text-brand-700 hover:underline">
              Semua transaksi
            </Link>
          }
        >
          {recentTx.length === 0 ? (
            <Empty
              title="Belum ada transaksi"
              description="Mulai catat transaksi pertama Anda."
              action={
                <Link href="/transaksi/baru" className="btn-primary text-sm">
                  Tambah transaksi
                </Link>
              }
            />
          ) : (
            <ul className="divide-y divide-surface-100">
              {recentTx.map((t) => (
                <li key={t.id} className="flex items-center gap-3 py-2.5">
                  <div
                    className="h-9 w-9 rounded-lg grid place-items-center text-white"
                    style={{
                      backgroundColor:
                        t.type === "transfer"
                          ? "#0ea5e9"
                          : t.category_color ?? t.account_color,
                    }}
                  >
                    <DynamicIcon
                      name={t.category_icon ?? (t.type === "transfer" ? "coins" : t.account_icon)}
                      className="h-4 w-4"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">
                      {t.note || t.category_name || (t.type === "transfer" ? "Transfer" : "Transaksi")}
                    </div>
                    <div className="text-xs text-surface-500 truncate">
                      {t.type === "transfer"
                        ? `${t.account_name} → ${t.to_account_name}`
                        : `${t.category_name ?? "Tanpa kategori"} · ${t.account_name}`}
                      {" · "}
                      {formatDate(t.occurred_at)}
                    </div>
                  </div>
                  <div
                    className={`text-sm font-semibold tabular-nums ${
                      t.type === "income"
                        ? "text-emerald-600"
                        : t.type === "expense"
                          ? "text-red-600"
                          : "text-sky-600"
                    }`}
                  >
                    {t.type === "expense" ? "-" : t.type === "income" ? "+" : ""}
                    {formatCurrency(t.amount)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-6">
          <Card
            title="Anggaran Bulan Ini"
            description={`${budgets.length} kategori dianggarkan`}
            actions={
              <Link href="/anggaran" className="text-xs text-brand-700 hover:underline">
                Kelola
              </Link>
            }
          >
            <div className="mb-3 flex items-baseline justify-between">
              <div className="text-sm text-surface-500">Total Terpakai</div>
              <div className="tabular-nums text-sm font-medium">
                {formatCurrency(totalSpent)} /{" "}
                <span className="text-surface-500">{formatCurrency(totalBudget)}</span>
              </div>
            </div>
            <div className="h-2 rounded-full bg-surface-100 overflow-hidden mb-4">
              <div
                className={`h-full ${totalSpent > totalBudget ? "bg-red-500" : "bg-brand-500"}`}
                style={{
                  width: `${Math.min(100, totalBudget ? (totalSpent / totalBudget) * 100 : 0)}%`,
                }}
              />
            </div>
            {budgets.length === 0 ? (
              <Empty
                title="Belum ada anggaran"
                description="Tambahkan anggaran per kategori untuk mengontrol pengeluaran."
                action={
                  <Link href="/anggaran" className="btn-secondary text-xs">
                    Buat anggaran
                  </Link>
                }
              />
            ) : (
              <ul className="space-y-3">
                {budgets.slice(0, 4).map((b) => {
                  const pct = b.amount ? Math.min(100, (b.spent / b.amount) * 100) : 0;
                  const over = b.spent > b.amount;
                  return (
                    <li key={b.id}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium">{b.category_name}</span>
                        <span
                          className={`tabular-nums ${over ? "text-red-600" : "text-surface-500"}`}
                        >
                          {formatCurrency(b.spent)} / {formatCurrency(b.amount)}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-surface-100 overflow-hidden">
                        <div
                          className={`h-full ${over ? "bg-red-500" : "bg-brand-500"}`}
                          style={{ width: `${pct}%`, backgroundColor: over ? undefined : b.category_color }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card
            title="Target Keuangan"
            actions={
              <Link href="/target" className="text-xs text-brand-700 hover:underline">
                Semua
              </Link>
            }
          >
            {goals.length === 0 ? (
              <Empty title="Belum ada target" description="Susun target menabung Anda." />
            ) : (
              <ul className="space-y-3">
                {goals.map((g) => {
                  const pct = g.target_amount
                    ? Math.min(100, (g.saved_amount / g.target_amount) * 100)
                    : 0;
                  return (
                    <li key={g.id}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium flex items-center gap-2">
                          <DynamicIcon
                            name={g.icon}
                            className="h-3.5 w-3.5"
                          />
                          {g.name}
                        </span>
                        <span className="tabular-nums text-surface-500">{pct.toFixed(0)}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-surface-100 overflow-hidden">
                        <div
                          className="h-full"
                          style={{ width: `${pct}%`, backgroundColor: g.color }}
                        />
                      </div>
                      <div className="mt-1 text-[11px] text-surface-500 tabular-nums">
                        {formatCurrency(g.saved_amount)} / {formatCurrency(g.target_amount)}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Distribusi Pemasukan" description={`Sumber pemasukan ${formatMonth(month)}.`}>
          {incomeByCat.length ? (
            <div className="h-56">
              <CategoryDonut data={incomeByCat} />
            </div>
          ) : (
            <Empty title="Belum ada pemasukan" />
          )}
        </Card>

        <Card
          title="Hutang & Piutang"
          actions={
            <Link href="/hutang" className="text-xs text-brand-700 hover:underline">
              Kelola
            </Link>
          }
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-red-50 border border-red-100 p-3">
              <div className="flex items-center gap-2 text-xs text-red-700 font-medium">
                <Handshake className="h-4 w-4" /> Hutang saya
              </div>
              <div className="mt-2 text-lg font-semibold text-red-700 tabular-nums">
                {formatCurrency(debts.hutang)}
              </div>
            </div>
            <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3">
              <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium">
                <Handshake className="h-4 w-4" /> Piutang
              </div>
              <div className="mt-2 text-lg font-semibold text-emerald-700 tabular-nums">
                {formatCurrency(debts.piutang)}
              </div>
            </div>
          </div>
        </Card>

        <Card
          title="Transaksi Berulang"
          description="Jadwal berikutnya"
          actions={
            <Link href="/berulang" className="text-xs text-brand-700 hover:underline">
              Semua
            </Link>
          }
        >
          {recurring.length === 0 ? (
            <Empty title="Belum ada transaksi berulang" icon={<Repeat2 className="h-6 w-6" />} />
          ) : (
            <ul className="divide-y divide-surface-100">
              {recurring.map((r) => (
                <li key={r.id} className="flex items-center gap-3 py-2">
                  <div
                    className={`h-8 w-8 rounded-lg grid place-items-center ${
                      r.type === "income"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    <Repeat2 className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{r.name}</div>
                    <div className="text-xs text-surface-500 truncate">
                      {r.frequency} · {formatDate(r.next_run)}
                    </div>
                  </div>
                  <div
                    className={`text-sm tabular-nums ${
                      r.type === "income" ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {r.type === "income" ? "+" : "-"}
                    {formatCurrency(r.amount)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
