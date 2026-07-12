"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/lib/db";

const DebtSchema = z.object({
  kind: z.enum(["hutang", "piutang"]),
  party: z.string().trim().min(1).max(80),
  amount: z.coerce.number().positive(),
  paid: z.coerce.number().min(0).default(0),
  due_date: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
});

function readForm(fd: FormData) {
  const obj: Record<string, unknown> = {};
  fd.forEach((v, k) => (obj[k] = typeof v === "string" ? v : v));
  return obj;
}

export async function createDebtAction(fd: FormData) {
  const p = DebtSchema.parse(readForm(fd));
  getDb()
    .prepare(
      `INSERT INTO debts (kind, party, amount, paid, due_date, note)
       VALUES (@kind, @party, @amount, @paid, @due_date, @note)`,
    )
    .run({
      ...p,
      due_date: p.due_date?.length ? p.due_date : null,
      note: p.note?.length ? p.note : null,
    });
  revalidatePath("/", "layout");
}

export async function updateDebtAction(id: number, fd: FormData) {
  const p = DebtSchema.parse(readForm(fd));
  getDb()
    .prepare(
      `UPDATE debts SET kind=@kind, party=@party, amount=@amount, paid=@paid,
         due_date=@due_date, note=@note
       WHERE id=@id`,
    )
    .run({
      ...p,
      due_date: p.due_date?.length ? p.due_date : null,
      note: p.note?.length ? p.note : null,
      id,
    });
  revalidatePath("/", "layout");
}

export async function payDebtAction(id: number, amount: number) {
  getDb()
    .prepare(
      `UPDATE debts SET paid = MIN(paid + ?, amount),
        settled = CASE WHEN paid + ? >= amount THEN 1 ELSE 0 END
       WHERE id = ?`,
    )
    .run(amount, amount, id);
  revalidatePath("/", "layout");
}

export async function settleDebtAction(id: number) {
  getDb().prepare("UPDATE debts SET paid = amount, settled = 1 WHERE id = ?").run(id);
  revalidatePath("/", "layout");
}

export async function deleteDebtAction(id: number) {
  getDb().prepare("DELETE FROM debts WHERE id = ?").run(id);
  revalidatePath("/", "layout");
}
