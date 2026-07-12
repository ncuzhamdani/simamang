import { PageHeader, Card } from "@/components/ui/section";
import { AccountForm } from "@/components/forms/account-form";
import { createAccountAction } from "@/app/actions/accounts";

export const dynamic = "force-dynamic";

export default function NewAccountPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="Rekening Baru" description="Buat rekening untuk mencatat transaksi." />
      <Card>
        <AccountForm onSubmit={createAccountAction} submitLabel="Buat Rekening" />
      </Card>
    </div>
  );
}
