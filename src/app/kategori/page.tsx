import { PageHeader, Card } from "@/components/ui/section";
import { DynamicIcon } from "@/components/ui/icon";
import { Empty } from "@/components/ui/empty";
import { listCategories } from "@/lib/queries";
import {
  createCategoryAction,
  deleteCategoryAction,
  toggleArchiveCategoryAction,
} from "@/app/actions/categories";
import { CategoryForm } from "@/components/forms/category-form";
import { ConfirmButton } from "@/components/ui/confirm-button";

export const dynamic = "force-dynamic";

export default function CategoriesPage() {
  const all = listCategories();
  const income = all.filter((c) => c.kind === "income");
  const expense = all.filter((c) => c.kind === "expense");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kategori"
        description="Atur kategori pemasukan & pengeluaran. Kategori yang detail membantu analisis lebih tajam."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card
          title="Tambah Kategori Baru"
          description="Berikan nama, ikon, dan warna."
          className="lg:col-span-1"
        >
          <CategoryForm onSubmit={createCategoryAction} submitLabel="Tambah" />
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Card title="Pemasukan" description={`${income.length} kategori`}>
            <CategoryList kind="income" items={income} />
          </Card>
          <Card title="Pengeluaran" description={`${expense.length} kategori`}>
            <CategoryList kind="expense" items={expense} />
          </Card>
        </div>
      </div>
    </div>
  );
}

function CategoryList({
  items,
  kind,
}: {
  items: ReturnType<typeof listCategories>;
  kind: "income" | "expense";
}) {
  if (items.length === 0) {
    return (
      <Empty
        title={`Belum ada kategori ${kind === "income" ? "pemasukan" : "pengeluaran"}`}
        description="Gunakan form di kiri untuk menambahkannya."
      />
    );
  }
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {items.map((c) => {
        const toggle = async () => {
          "use server";
          await toggleArchiveCategoryAction(c.id);
        };
        const del = async () => {
          "use server";
          await deleteCategoryAction(c.id);
        };
        return (
          <li
            key={c.id}
            className="flex items-center gap-3 rounded-lg border border-surface-200 px-3 py-2"
          >
            <div
              className="h-9 w-9 rounded-lg text-white grid place-items-center"
              style={{ backgroundColor: c.color }}
            >
              <DynamicIcon name={c.icon} className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{c.name}</div>
              <div className="text-[11px] text-surface-500 capitalize">{c.kind}</div>
            </div>
            <ConfirmButton
              className="btn-ghost text-xs"
              action={toggle}
              confirm="Arsipkan kategori ini?"
            >
              Arsip
            </ConfirmButton>
            <ConfirmButton
              className="btn-danger text-xs"
              action={del}
              confirm="Hapus kategori? Transaksi terkait akan kehilangan referensi kategori."
            >
              Hapus
            </ConfirmButton>
          </li>
        );
      })}
    </ul>
  );
}
