import { notFound } from "next/navigation";
import { PageHeader, Card } from "@/components/ui/section";
import { TransactionForm } from "@/components/forms/transaction-form";
import {
  deleteTransactionAction,
  updateTransactionAction,
} from "@/app/actions/transactions";
import { getTransaction, listAccounts, listCategories } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default function EditTransactionPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const tx = getTransaction(id);
  if (!tx) notFound();
  const accounts = listAccounts(true);
  const categories = listCategories();

  const update = async (fd: FormData) => {
    "use server";
    await updateTransactionAction(id, fd);
  };
  const del = async () => {
    "use server";
    await deleteTransactionAction(id);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Edit Transaksi"
        description={`ID #${id} · Terakhir dicatat ${tx.created_at}`}
      />
      <Card>
        <TransactionForm
          accounts={accounts}
          categories={categories}
          initial={tx}
          onSubmit={update}
          onDelete={del}
          submitLabel="Perbarui Transaksi"
        />
      </Card>
    </div>
  );
}
