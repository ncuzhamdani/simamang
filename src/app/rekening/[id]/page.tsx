import { notFound } from "next/navigation";
import { PageHeader, Card } from "@/components/ui/section";
import { AccountForm } from "@/components/forms/account-form";
import { getAccount } from "@/lib/queries";
import { deleteAccountAction, updateAccountAction } from "@/app/actions/accounts";

export const dynamic = "force-dynamic";

export default function EditAccountPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const acc = getAccount(id);
  if (!acc) notFound();

  const update = async (fd: FormData) => {
    "use server";
    await updateAccountAction(id, fd);
  };
  const del = async () => {
    "use server";
    await deleteAccountAction(id);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="Edit Rekening" description={acc.name} />
      <Card>
        <AccountForm
          initial={acc}
          onSubmit={update}
          onDelete={del}
          submitLabel="Perbarui Rekening"
        />
      </Card>
    </div>
  );
}
