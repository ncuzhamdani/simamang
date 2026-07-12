"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/lib/db";

const BudgetSchema = z.object({
  category_id: z.coerce.number().int().positive(),
  month: z.string().regex(/^\d{4}-\d{2}$/),
  amount: z.coerce.number().nonnegative(),
  note: z.string().optional().nullable(),
});

function readForm(fd: FormData) {
  const obj: Record<string, unknown> = {};
  fd.forEach((v, k) => (obj[k] = typeof v === "string" ? v : v));
  return obj;
}

export async function upsertBudgetAction(fd: FormData) {
  const data = BudgetSchema.parse(readForm(fd));
  getDb()
    .prepare(
      `INSERT INTO budgets (category_id, month, amount, note)
       VALUES (@category_id, @month, @amount, @note)
       ON CONFLICT(category_id, month) DO UPDATE SET amount = excluded.amount, note = excluded.note`,
    )
    .run({ ...data, note: data.note?.toString().trim() || null });
  revalidatePath("/", "layout");
}

export async function deleteBudgetAction(id: number) {
  getDb().prepare("DELETE FROM budgets WHERE id = ?").run(id);
  revalidatePath("/", "layout");
}
