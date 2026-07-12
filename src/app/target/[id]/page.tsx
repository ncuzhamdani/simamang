import { notFound } from "next/navigation";
import { PageHeader, Card } from "@/components/ui/section";
import { GoalForm } from "@/components/forms/goal-form";
import { getDb } from "@/lib/db";
import { listAccounts } from "@/lib/queries";
import { updateGoalAction } from "@/app/actions/goals";
import type { Goal } from "@/lib/types";

export const dynamic = "force-dynamic";

export default function EditGoalPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const g = getDb().prepare("SELECT * FROM goals WHERE id = ?").get(id) as Goal | undefined;
  if (!g) notFound();
  const accounts = listAccounts(true);

  const update = async (fd: FormData) => {
    "use server";
    await updateGoalAction(id, fd);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="Edit Target" description={g.name} />
      <Card>
        <GoalForm accounts={accounts} initial={g} onSubmit={update} submitLabel="Perbarui" />
      </Card>
    </div>
  );
}
