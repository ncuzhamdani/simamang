import { PageHeader, Card } from "@/components/ui/section";
import { GoalForm } from "@/components/forms/goal-form";
import { listAccounts } from "@/lib/queries";
import { createGoalAction } from "@/app/actions/goals";

export const dynamic = "force-dynamic";

export default function NewGoalPage() {
  const accounts = listAccounts();
  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="Target Baru" description="Rancang target tabungan Anda." />
      <Card>
        <GoalForm accounts={accounts} onSubmit={createGoalAction} submitLabel="Buat Target" />
      </Card>
    </div>
  );
}
