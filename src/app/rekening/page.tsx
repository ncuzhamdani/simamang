import Link from "next/link";
import { Archive, ArchiveRestore, Pencil, Plus } from "lucide-react";
import { PageHeader, Card } from "@/components/ui/section";
import { Empty } from "@/components/ui/empty";
import { DynamicIcon } from "@/components/ui/icon";
import { listAccountsWithBalances } from "@/lib/queries";
import { formatCurrency } from "@/lib/format";
import { toggleArchiveAccountAction } from "@/app/actions/accounts";
import { ConfirmButton } from "@/components/ui/confirm-button";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<string, string> = {
  cash: "Tunai",
  bank: "Bank",
  ewallet: "E-Wallet",
  credit: "Kartu Kredit",
  investment: "Investasi",
  other: "Lain-lain",
};

export default function AccountsPage() {
  const rows = listAccountsWithBalances(true);
  const active = rows.filter((r) => !r.archived);
  const archived = rows.filter((r) => r.archived);
  const total = active.reduce((s, r) => s + r.balance, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rekening"
        description="Kelola semua rekening: tunai, bank, e-wallet, kartu kredit, investasi."
        actions={
          <Link href="/rekening/baru" className="btn-primary">
            <Plus className="h-4 w-4" /> Rekening Baru
          </Link>
        }
      />

      <Card>
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <div className="text-xs text-surface-500 uppercase font-medium">Total Saldo Aktif</div>
            <div
              className={`text-3xl font-semibold tabular-nums mt-1 ${
                total < 0 ? "text-red-600" : ""
              }`}
            >
              {formatCurrency(total)}
            </div>
          </div>
          <div className="text-sm text-surface-500">
            {active.length} rekening aktif · {archived.length} diarsipkan
          </div>
        </div>
        {active.length === 0 ? (
          <Empty
            title="Belum ada rekening"
            description="Tambahkan rekening pertama untuk mulai mencatat."
            action={
              <Link href="/rekening/baru" className="btn-primary">
                <Plus className="h-4 w-4" /> Tambah rekening
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {active.map((a) => (
              <AccountCard key={a.id} a={a} />
            ))}
          </div>
        )}
      </Card>

      {archived.length > 0 && (
        <Card title="Rekening Diarsipkan">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {archived.map((a) => (
              <AccountCard key={a.id} a={a} />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function AccountCard({
  a,
}: {
  a: {
    id: number;
    name: string;
    type: string;
    balance: number;
    opening_balance: number;
    currency: string;
    color: string;
    icon: string;
    archived: number;
    note: string | null;
  };
}) {
  const toggle = async () => {
    "use server";
    await toggleArchiveAccountAction(a.id);
  };
  return (
    <div className="relative rounded-2xl overflow-hidden border border-surface-200 bg-white">
      <div className="p-4 text-white" style={{ backgroundColor: a.color }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-white/20 grid place-items-center">
              <DynamicIcon name={a.icon} className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs uppercase opacity-80">{TYPE_LABEL[a.type] ?? a.type}</div>
              <div className="font-semibold leading-tight">{a.name}</div>
            </div>
          </div>
          <div className="text-xs opacity-90">{a.currency}</div>
        </div>
        <div className="mt-6 text-2xl font-semibold tabular-nums">
          {formatCurrency(a.balance, a.currency)}
        </div>
        <div className="mt-1 text-[11px] opacity-80">
          Saldo awal: {formatCurrency(a.opening_balance, a.currency)}
        </div>
      </div>
      <div className="p-4">
        {a.note && <div className="text-xs text-surface-500 mb-3">{a.note}</div>}
        <div className="flex items-center gap-2">
          <Link
            href={`/rekening/${a.id}`}
            className="btn-secondary text-xs"
          >
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Link>
          <ConfirmButton
            className="btn-ghost text-xs"
            action={toggle}
            confirm={a.archived ? "Aktifkan kembali rekening ini?" : "Arsipkan rekening ini?"}
          >
            {a.archived ? (
              <>
                <ArchiveRestore className="h-3.5 w-3.5" /> Aktifkan
              </>
            ) : (
              <>
                <Archive className="h-3.5 w-3.5" /> Arsip
              </>
            )}
          </ConfirmButton>
        </div>
      </div>
    </div>
  );
}
