"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/lib/db";

const BaseTx = z.object({
  type: z.enum(["income", "expense", "transfer"]),
  amount: z.coerce.number().positive("Nominal harus lebih dari 0"),
  account_id: z.coerce.number().int().positive(),
  to_account_id: z.union([z.coerce.number().int().positive(), z.literal(""), z.null()]).optional(),
  category_id: z.union([z.coerce.number().int().positive(), z.literal(""), z.null()]).optional(),
  occurred_at: z.string().min(1),
  note: z.string().optional().nullable(),
  tags: z.string().optional().nullable(),
});

function readForm(fd: FormData): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  fd.forEach((v, k) => (obj[k] = typeof v === "string" ? v : v));
  return obj;
}

function normalize(input: z.infer<typeof BaseTx>) {
  const isTransfer = input.type === "transfer";
  const to =
    input.to_account_id === "" || input.to_account_id == null ? null : Number(input.to_account_id);
  const cat =
    input.category_id === "" || input.category_id == null ? null : Number(input.category_id);
  if (isTransfer) {
    if (!to || to === input.account_id) {
      throw new Error("Transfer harus memilih rekening tujuan yang berbeda.");
    }
  }
  const occurred = input.occurred_at.length === 16 ? `${input.occurred_at}:00` : input.occurred_at;
  return {
    type: input.type,
    amount: input.amount,
    account_id: input.account_id,
    to_account_id: isTransfer ? to : null,
    category_id: isTransfer ? null : cat,
    occurred_at: occurred.replace("T", " "),
    note: input.note?.toString().trim() || null,
    tags: input.tags?.toString().trim() || null,
  };
}

export async function createTransactionAction(fd: FormData) {
  const parsed = BaseTx.parse(readForm(fd));
  const data = normalize(parsed);
  getDb()
    .prepare(
      `INSERT INTO transactions (type, amount, account_id, to_account_id, category_id, occurred_at, note, tags)
       VALUES (@type, @amount, @account_id, @to_account_id, @category_id, @occurred_at, @note, @tags)`,
    )
    .run(data);
  revalidatePath("/", "layout");
}

export async function updateTransactionAction(id: number, fd: FormData) {
  const parsed = BaseTx.parse(readForm(fd));
  const data = normalize(parsed);
  getDb()
    .prepare(
      `UPDATE transactions SET
         type=@type, amount=@amount, account_id=@account_id, to_account_id=@to_account_id,
         category_id=@category_id, occurred_at=@occurred_at, note=@note, tags=@tags
       WHERE id=@id`,
    )
    .run({ ...data, id });
  revalidatePath("/", "layout");
}

export async function deleteTransactionAction(id: number) {
  getDb().prepare("DELETE FROM transactions WHERE id = ?").run(id);
  revalidatePath("/", "layout");
}
