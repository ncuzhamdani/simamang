import { Repeat2 } from "lucide-react";
import { PageHeader, Card } from "@/components/ui/section";
import { Empty } from "@/components/ui/empty";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { formatCurrency, formatDate } from "@/lib/format";
import { listAccounts, listCategories, listRecurring } from "@/lib/queries";
import {
  createRecurringAction,
  deleteRecurringAction,
  runRecurringNowAction,
} from "@/app/actions/recurring";
import { RecurringForm } from "@/components/forms/recurring-form";

export const dynamic = "force-dynamic";

const FREQ: Record<string, string> = {
  daily: "Harian",
  weekly: "Mingguan",
  monthly: "Bulanan",
  yearly: "Tahunan",
};

export default function RecurringPage() {
  const list = listRecurring();
  const accounts = listAccounts();
  const categories = listCategories();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transaksi Berulang"
        description="Jadwalkan transaksi rutin seperti gaji, sewa, dan langganan."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Buat Jadwal Baru">
          <RecurringForm
            accounts={accounts}
            categories={categories}
            onSubmit={createRecurringAction}
          />
        </Card>
        <Card
          className="lg:col-span-2"
          title="Jadwal"
          description="Klik 'Jalankan' untuk mencatat transaksi sesuai jadwal."
        >
          {list.length === 0 ? (
            <Empty
              title="Belum ada transaksi berulang"
              icon={<Repeat2 className="h-6 w-6" />}
              description="Gunakan form di kiri untuk membuatnya."
            />
          ) : (
            <ul className="space-y-3">
              {list.map((r) => {
                const cat = categories.find((c) => c.id === r.category_id);
                const acc = accounts.find((a) => a.id === r.account_id);
                const run = async () => {
                  "use server";
                  await runRecurringNowAction(r.id);
                };
                const del = async () => {
                  "use server";
                  await deleteRecurringAction(r.id);
                };
                return (
                  <li key={r.id} className="rounded-lg border border-surface-200 p-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-9 w-9 rounded-lg grid place-items-center ${
                          r.type === "income"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        <Repeat2 className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">{r.name}</span>
                          <span
                            className={
                              r.type === "income" ? "chip-success" : "chip-danger"
                            }
                          >
                            {r.type === "income" ? "Pemasukan" : "Pengeluaran"}
                          </span>
                          {r.active ? (
                            <span className="chip-info">Aktif</span>
                          ) : (
                            <span className="chip-neutral">Nonaktif</span>
                          )}
                        </div>
                        <div className="text-xs text-surface-500">
                          {FREQ[r.frequency]} · Berikutnya {formatDate(r.next_run)}
                          {r.last_run && ` · Terakhir ${formatDate(r.last_run)}`}
                          {acc ? ` · ${acc.name}` : ""}
                          {cat ? ` · ${cat.name}` : ""}
                        </div>
                      </div>
                      <div
                        className={`text-sm font-semibold tabular-nums ${
                          r.type === "income" ? "text-emerald-600" : "text-red-600"
                        }`}
                      >
                        {r.type === "income" ? "+" : "-"}
                        {formatCurrency(r.amount)}
                      </div>
                    </div>
                    <div className="mt-2 flex gap-2 justify-end">
                      <ConfirmButton
                        className="btn-secondary text-xs"
                        action={run}
                        confirm="Catat transaksi ini sekarang dan majukan jadwal berikutnya?"
                      >
                        Jalankan sekarang
                      </ConfirmButton>
                      <ConfirmButton className="btn-danger text-xs" action={del}>
                        Hapus
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
