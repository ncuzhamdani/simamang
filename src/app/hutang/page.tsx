import { Handshake } from "lucide-react";
import { PageHeader, Card } from "@/components/ui/section";
import { Empty } from "@/components/ui/empty";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { listDebts } from "@/lib/queries";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  createDebtAction,
  deleteDebtAction,
  settleDebtAction,
} from "@/app/actions/debts";
import { DebtForm } from "@/components/forms/debt-form";
import { DebtPayButton } from "@/components/debts/pay";

export const dynamic = "force-dynamic";

export default function DebtsPage() {
  const debts = listDebts();
  const hutang = debts.filter((d) => d.kind === "hutang");
  const piutang = debts.filter((d) => d.kind === "piutang");
  const totalHutang = hutang.filter((d) => !d.settled).reduce((s, d) => s + (d.amount - d.paid), 0);
  const totalPiutang = piutang.filter((d) => !d.settled).reduce((s, d) => s + (d.amount - d.paid), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hutang & Piutang"
        description="Catat siapa berhutang kepada siapa, kapan jatuh tempo, berapa yang sudah dibayar."
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card card-pad">
          <div className="text-xs text-surface-500 uppercase font-medium">Hutang Aktif</div>
          <div className="mt-2 text-2xl font-semibold text-red-600 tabular-nums">
            {formatCurrency(totalHutang)}
          </div>
        </div>
        <div className="card card-pad">
          <div className="text-xs text-surface-500 uppercase font-medium">Piutang Aktif</div>
          <div className="mt-2 text-2xl font-semibold text-emerald-600 tabular-nums">
            {formatCurrency(totalPiutang)}
          </div>
        </div>
        <div className="card card-pad">
          <div className="text-xs text-surface-500 uppercase font-medium">Jumlah Hutang</div>
          <div className="mt-2 text-2xl font-semibold tabular-nums">{hutang.length}</div>
        </div>
        <div className="card card-pad">
          <div className="text-xs text-surface-500 uppercase font-medium">Jumlah Piutang</div>
          <div className="mt-2 text-2xl font-semibold tabular-nums">{piutang.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Tambah Hutang / Piutang" description="Catat kewajiban baru">
          <DebtForm onSubmit={createDebtAction} />
        </Card>
        <Card className="lg:col-span-2" title="Daftar" description="Kelola dan lacak pembayaran">
          {debts.length === 0 ? (
            <Empty
              title="Belum ada catatan"
              icon={<Handshake className="h-6 w-6" />}
              description="Gunakan form di kiri untuk menambahkan."
            />
          ) : (
            <ul className="space-y-3">
              {debts.map((d) => {
                const pct = d.amount ? Math.min(100, (d.paid / d.amount) * 100) : 0;
                const settle = async () => {
                  "use server";
                  await settleDebtAction(d.id);
                };
                const del = async () => {
                  "use server";
                  await deleteDebtAction(d.id);
                };
                return (
                  <li key={d.id} className="rounded-lg border border-surface-200 p-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-9 w-9 rounded-lg grid place-items-center ${
                          d.kind === "hutang"
                            ? "bg-red-50 text-red-600"
                            : "bg-emerald-50 text-emerald-600"
                        }`}
                      >
                        <Handshake className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">{d.party}</span>
                          <span
                            className={
                              d.kind === "hutang" ? "chip-danger" : "chip-success"
                            }
                          >
                            {d.kind}
                          </span>
                          {d.settled ? <span className="chip-neutral">Lunas</span> : null}
                        </div>
                        <div className="text-xs text-surface-500">
                          {d.due_date ? `Jatuh tempo ${formatDate(d.due_date)}` : "Tanpa jatuh tempo"}
                          {d.note ? ` · ${d.note}` : ""}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold tabular-nums">
                          {formatCurrency(d.paid)} / {formatCurrency(d.amount)}
                        </div>
                        <div className="text-xs text-surface-500">
                          Sisa {formatCurrency(Math.max(0, d.amount - d.paid))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-surface-100 overflow-hidden">
                      <div
                        className={d.settled ? "bg-emerald-500" : "bg-brand-500"}
                        style={{ width: `${pct}%`, height: "100%" }}
                      />
                    </div>
                    <div className="mt-2 flex items-center gap-2 justify-end">
                      {!d.settled && (
                        <>
                          <DebtPayButton id={d.id} />
                          <ConfirmButton
                            className="btn-secondary text-xs"
                            action={settle}
                            confirm="Tandai lunas keseluruhan?"
                          >
                            Tandai Lunas
                          </ConfirmButton>
                        </>
                      )}
                      <ConfirmButton className="btn-ghost text-xs" action={del}>
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
