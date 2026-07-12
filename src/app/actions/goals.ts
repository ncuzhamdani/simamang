"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/lib/db";

const GoalSchema = z.object({
  name: z.string().trim().min(1).max(80),
  target_amount: z.coerce.number().positive(),
  saved_amount: z.coerce.number().min(0).default(0),
  deadline: z.string().optional().nullable(),
  account_id: z.union([z.coerce.number().int().positive(), z.literal(""), z.null()]).optional(),
  color: z.string().default("#28a668"),
  icon: z.string().default("target"),
  note: z.string().optional().nullable(),
});

function readForm(fd: FormData) {
  const obj: Record<string, unknown> = {};
  fd.forEach((v, k) => (obj[k] = typeof v === "string" ? v : v));
  return obj;
}

export async function createGoalAction(fd: FormData) {
  const p = GoalSchema.parse(readForm(fd));
  getDb()
    .prepare(
      `INSERT INTO goals (name, target_amount, saved_amount, deadline, account_id, color, icon, note)
       VALUES (@name, @target_amount, @saved_amount, @deadline, @account_id, @color, @icon, @note)`,
    )
    .run({
      ...p,
      deadline: p.deadline?.length ? p.deadline : null,
      account_id: p.account_id === "" || p.account_id == null ? null : Number(p.account_id),
      note: p.note?.length ? p.note : null,
    });
  revalidatePath("/", "layout");
}

export async function updateGoalAction(id: number, fd: FormData) {
  const p = GoalSchema.parse(readForm(fd));
  getDb()
    .prepare(
      `UPDATE goals SET name=@name, target_amount=@target_amount, saved_amount=@saved_amount,
         deadline=@deadline, account_id=@account_id, color=@color, icon=@icon, note=@note
       WHERE id=@id`,
    )
    .run({
      ...p,
      deadline: p.deadline?.length ? p.deadline : null,
      account_id: p.account_id === "" || p.account_id == null ? null : Number(p.account_id),
      note: p.note?.length ? p.note : null,
      id,
    });
  revalidatePath("/", "layout");
}

export async function contributeGoalAction(id: number, amount: number) {
  getDb()
    .prepare(
      `UPDATE goals SET saved_amount = saved_amount + ?,
        completed = CASE WHEN saved_amount + ? >= target_amount THEN 1 ELSE 0 END
       WHERE id = ?`,
    )
    .run(amount, amount, id);
  revalidatePath("/", "layout");
}

export async function deleteGoalAction(id: number) {
  getDb().prepare("DELETE FROM goals WHERE id = ?").run(id);
  revalidatePath("/", "layout");
}
