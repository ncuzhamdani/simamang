import Link from "next/link";
import { Plus, Target } from "lucide-react";
import { PageHeader, Card } from "@/components/ui/section";
import { DynamicIcon } from "@/components/ui/icon";
import { Empty } from "@/components/ui/empty";
import { formatCurrency, formatDate } from "@/lib/format";
import { listGoals } from "@/lib/queries";
import { ContributeGoalButton } from "@/components/goals/contribute";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { deleteGoalAction } from "@/app/actions/goals";

export const dynamic = "force-dynamic";

export default function GoalsPage() {
  const goals = listGoals();
  const active = goals.filter((g) => !g.completed);
  const done = goals.filter((g) => g.completed);
  const totalTarget = active.reduce((s, g) => s + g.target_amount, 0);
  const totalSaved = active.reduce((s, g) => s + g.saved_amount, 0);
  const overallPct = totalTarget ? Math.min(100, (totalSaved / totalTarget) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Target Keuangan"
        description="Susun target menabung dan lacak progres pencapaiannya."
        actions={
          <Link href="/target/baru" className="btn-primary">
            <Plus className="h-4 w-4" /> Target Baru
          </Link>
        }
      />

      <Card
        title="Progres Keseluruhan"
        description={`${active.length} target aktif`}
      >
        <div className="flex items-baseline justify-between mb-3">
          <div className="text-sm text-surface-500">Total tabungan target aktif</div>
          <div className="tabular-nums text-sm font-medium">
            {formatCurrency(totalSaved)} /{" "}
            <span className="text-surface-500">{formatCurrency(totalTarget)}</span>
          </div>
        </div>
        <div className="h-2 rounded-full bg-surface-100 overflow-hidden">
          <div className="h-full bg-brand-500" style={{ width: `${overallPct}%` }} />
        </div>
      </Card>

      {active.length === 0 ? (
        <Empty
          title="Belum ada target aktif"
          icon={<Target className="h-6 w-6" />}
          description="Ayo susun target menabung pertama Anda!"
          action={
            <Link href="/target/baru" className="btn-primary">
              Buat target
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {active.map((g) => (
            <GoalCard key={g.id} g={g} />
          ))}
        </div>
      )}

      {done.length > 0 && (
        <Card title="Tercapai" description={`${done.length} target selesai`}>
          <ul className="divide-y divide-surface-100">
            {done.map((g) => (
              <li key={g.id} className="flex items-center gap-3 py-3">
                <div
                  className="h-9 w-9 rounded-lg text-white grid place-items-center"
                  style={{ backgroundColor: g.color }}
                >
                  <DynamicIcon name={g.icon} className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{g.name}</div>
                  <div className="text-xs text-surface-500">
                    Tercapai · {formatCurrency(g.saved_amount)}
                  </div>
                </div>
                <span className="chip-success">Selesai</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function GoalCard({ g }: { g: ReturnType<typeof listGoals>[number] }) {
  const pct = g.target_amount ? Math.min(100, (g.saved_amount / g.target_amount) * 100) : 0;
  const remaining = Math.max(0, g.target_amount - g.saved_amount);
  const del = async () => {
    "use server";
    await deleteGoalAction(g.id);
  };
  return (
    <div className="card p-0 overflow-hidden">
      <div className="p-5 text-white" style={{ backgroundColor: g.color }}>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-white/20 grid place-items-center">
            <DynamicIcon name={g.icon} className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold text-lg leading-tight">{g.name}</div>
            {g.deadline && (
              <div className="text-xs opacity-90">Deadline · {formatDate(g.deadline)}</div>
            )}
          </div>
        </div>
      </div>
      <div className="p-5 space-y-3">
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-semibold tabular-nums">{formatCurrency(g.saved_amount)}</div>
          <div className="text-xs text-surface-500 tabular-nums">/ {formatCurrency(g.target_amount)}</div>
        </div>
        <div className="h-2 rounded-full bg-surface-100 overflow-hidden">
          <div className="h-full" style={{ width: `${pct}%`, backgroundColor: g.color }} />
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-surface-500">{pct.toFixed(0)}% tercapai</span>
          <span className="text-surface-500 tabular-nums">Sisa {formatCurrency(remaining)}</span>
        </div>
        {g.note && <div className="text-xs text-surface-500 pt-1">{g.note}</div>}
        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-2">
            <ContributeGoalButton id={g.id} />
            <Link href={`/target/${g.id}`} className="btn-secondary text-xs">
              Edit
            </Link>
          </div>
          <ConfirmButton className="btn-ghost text-xs" action={del}>
            Hapus
          </ConfirmButton>
        </div>
      </div>
    </div>
  );
}
