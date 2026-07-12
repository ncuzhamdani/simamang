import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, Filter, Pencil, Plus, Repeat2 } from "lucide-react";
import { PageHeader, Card } from "@/components/ui/section";
import { Empty } from "@/components/ui/empty";
import { DynamicIcon } from "@/components/ui/icon";
import { addMonth, currentMonth, formatCurrency, formatDate, formatMonth } from "@/lib/format";
import {
  listAccounts,
  listCategories,
  listTransactions,
  monthlyTotals,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

interface SP {
  month?: string;
  type?: "income" | "expense" | "transfer" | "all";
  accountId?: string;
  categoryId?: string;
  q?: string;
}

export default function TransactionsPage({ searchParams }: { searchParams: SP }) {
  const month = searchParams.month || currentMonth();
  const type = (searchParams.type as SP["type"]) || "all";
  const accountId = searchParams.accountId ? Number(searchParams.accountId) : undefined;
  const categoryId = searchParams.categoryId ? Number(searchParams.categoryId) : undefined;
  const q = searchParams.q ?? "";

  const accounts = listAccounts(true);
  const categories = listCategories();
  const rows = listTransactions({ month, type, accountId, categoryId, q });
  const totals = monthlyTotals(month);

  const groups = rows.reduce<Record<string, typeof rows>>((acc, t) => {
    const day = t.occurred_at.slice(0, 10);
    (acc[day] ||= []).push(t);
    return acc;
  }, {});
  const days = Object.keys(groups).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transaksi"
        description="Semua catatan pemasukan, pengeluaran, dan transfer antar rekening Anda."
        actions={
          <>
            <Link href={`/transaksi?month=${addMonth(month, -1)}`} className="btn-secondary">
              ← {formatMonth(addMonth(month, -1))}
            </Link>
            <Link href={`/transaksi?month=${addMonth(month, 1)}`} className="btn-secondary">
              {formatMonth(addMonth(month, 1))} →
            </Link>
            <Link href="/transaksi/baru" className="btn-primary">
              <Plus className="h-4 w-4" /> Tambah
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card card-pad">
          <div className="text-xs text-surface-500 font-medium uppercase">Pemasukan</div>
          <div className="mt-2 text-xl font-semibold text-emerald-600 tabular-nums">
            {formatCurrency(totals.income)}
          </div>
        </div>
        <div className="card card-pad">
          <div className="text-xs text-surface-500 font-medium uppercase">Pengeluaran</div>
          <div className="mt-2 text-xl font-semibold text-red-600 tabular-nums">
            {formatCurrency(totals.expense)}
          </div>
        </div>
        <div className="card card-pad">
          <div className="text-xs text-surface-500 font-medium uppercase">Selisih</div>
          <div
            className={`mt-2 text-xl font-semibold tabular-nums ${
              totals.net >= 0 ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {formatCurrency(totals.net)}
          </div>
        </div>
        <div className="card card-pad">
          <div className="text-xs text-surface-500 font-medium uppercase">Jumlah</div>
          <div className="mt-2 text-xl font-semibold tabular-nums">{totals.txCount}</div>
        </div>
      </div>

      <Card
        title="Filter"
        description={`Bulan ${formatMonth(month)}`}
        actions={<Filter className="h-4 w-4 text-surface-400" />}
      >
        <form className="grid grid-cols-2 md:grid-cols-6 gap-3" action="/transaksi" method="get">
          <div>
            <label className="label">Bulan</label>
            <input type="month" name="month" defaultValue={month} className="input" />
          </div>
          <div>
            <label className="label">Tipe</label>
            <select name="type" defaultValue={type} className="input">
              <option value="all">Semua</option>
              <option value="income">Pemasukan</option>
              <option value="expense">Pengeluaran</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>
          <div>
            <label className="label">Rekening</label>
            <select name="accountId" defaultValue={accountId ?? ""} className="input">
              <option value="">Semua</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Kategori</label>
            <select name="categoryId" defaultValue={categoryId ?? ""} className="input">
              <option value="">Semua</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.kind === "income" ? "in" : "out"})
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="label">Cari catatan / tag</label>
            <input name="q" defaultValue={q} className="input" placeholder="misal: gaji, kopi" />
          </div>
          <div className="col-span-2 md:col-span-6 flex justify-end gap-2">
            <Link href="/transaksi" className="btn-ghost">
              Reset
            </Link>
            <button className="btn-primary" type="submit">
              Terapkan filter
            </button>
          </div>
        </form>
      </Card>

      {rows.length === 0 ? (
        <Empty
          title="Tidak ada transaksi"
          description="Coba ganti filter atau tambahkan transaksi baru."
          action={
            <Link href="/transaksi/baru" className="btn-primary">
              <Plus className="h-4 w-4" /> Tambah transaksi
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {days.map((day) => {
            const list = groups[day];
            const dayIn = list.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
            const dayOut = list.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
            return (
              <div key={day} className="card">
                <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-surface-100">
                  <div>
                    <div className="text-sm font-medium">{formatDate(day)}</div>
                    <div className="text-xs text-surface-500">{list.length} transaksi</div>
                  </div>
                  <div className="text-xs tabular-nums flex items-center gap-3">
                    <span className="text-emerald-600">+{formatCurrency(dayIn)}</span>
                    <span className="text-red-600">-{formatCurrency(dayOut)}</span>
                  </div>
                </div>
                <ul className="divide-y divide-surface-100">
                  {list.map((t) => (
                    <li key={t.id} className="flex items-center gap-3 px-4 sm:px-5 py-3">
                      <div
                        className="h-9 w-9 rounded-lg grid place-items-center text-white shrink-0"
                        style={{
                          backgroundColor:
                            t.type === "transfer"
                              ? "#0ea5e9"
                              : t.category_color ?? t.account_color,
                        }}
                      >
                        {t.type === "transfer" ? (
                          <Repeat2 className="h-4 w-4" />
                        ) : t.type === "income" ? (
                          <ArrowDownLeft className="h-4 w-4" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium truncate">
                            {t.note || t.category_name || (t.type === "transfer" ? "Transfer" : "Transaksi")}
                          </span>
                          {t.tags?.split(",").map(
                            (tag) =>
                              tag.trim() && (
                                <span key={tag} className="chip-neutral">
                                  #{tag.trim()}
                                </span>
                              ),
                          )}
                        </div>
                        <div className="text-xs text-surface-500 flex items-center gap-2 mt-0.5">
                          <span className="inline-flex items-center gap-1">
                            <DynamicIcon
                              name={t.account_icon}
                              className="h-3 w-3"
                            />
                            {t.account_name}
                          </span>
                          {t.type === "transfer" && t.to_account_name && (
                            <span>→ {t.to_account_name}</span>
                          )}
                          {t.type !== "transfer" && t.category_name && (
                            <span className="inline-flex items-center gap-1">
                              · <DynamicIcon name={t.category_icon ?? "tag"} className="h-3 w-3" />
                              {t.category_name}
                            </span>
                          )}
                          <span>· {t.occurred_at.slice(11, 16)}</span>
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
                      <Link
                        href={`/transaksi/${t.id}`}
                        className="ml-2 rounded-md p-1.5 text-surface-500 hover:text-surface-800 hover:bg-surface-100"
                        aria-label="Ubah"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
