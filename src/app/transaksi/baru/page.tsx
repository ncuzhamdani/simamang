import { PageHeader, Card } from "@/components/ui/section";
import { TransactionForm } from "@/components/forms/transaction-form";
import { listAccounts, listCategories } from "@/lib/queries";
import { createTransactionAction } from "@/app/actions/transactions";

export const dynamic = "force-dynamic";

export default function NewTransactionPage() {
  const accounts = listAccounts();
  const categories = listCategories();
  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Tambah Transaksi"
        description="Catat pemasukan, pengeluaran, atau transfer antar rekening."
      />
      <Card>
        <TransactionForm
          accounts={accounts}
          categories={categories}
          onSubmit={createTransactionAction}
          submitLabel="Simpan Transaksi"
        />
      </Card>
    </div>
  );
}
