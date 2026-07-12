"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/lib/db";

const AccountSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi").max(60),
  type: z.enum(["cash", "bank", "ewallet", "credit", "investment", "other"]),
  currency: z.string().trim().min(3).max(6).default("IDR"),
  opening_balance: z.coerce.number().default(0),
  color: z.string().trim().default("#28a668"),
  icon: z.string().trim().default("wallet"),
  note: z.string().trim().optional().nullable(),
});

function readForm(fd: FormData) {
  const obj: Record<string, unknown> = {};
  fd.forEach((v, k) => (obj[k] = typeof v === "string" ? v : v));
  return obj;
}

function revalidateAll() {
  revalidatePath("/", "layout");
}

export async function createAccountAction(fd: FormData) {
  const data = AccountSchema.parse(readForm(fd));
  getDb()
    .prepare(
      `INSERT INTO accounts (name, type, currency, opening_balance, color, icon, note)
       VALUES (@name, @type, @currency, @opening_balance, @color, @icon, @note)`,
    )
    .run({ ...data, note: data.note?.length ? data.note : null });
  revalidateAll();
}

export async function updateAccountAction(id: number, fd: FormData) {
  const data = AccountSchema.parse(readForm(fd));
  getDb()
    .prepare(
      `UPDATE accounts SET name=@name, type=@type, currency=@currency,
        opening_balance=@opening_balance, color=@color, icon=@icon, note=@note
       WHERE id=@id`,
    )
    .run({ ...data, note: data.note?.length ? data.note : null, id });
  revalidateAll();
}

export async function toggleArchiveAccountAction(id: number) {
  getDb()
    .prepare("UPDATE accounts SET archived = 1 - archived WHERE id = ?")
    .run(id);
  revalidateAll();
}

export async function deleteAccountAction(id: number) {
  getDb().prepare("DELETE FROM accounts WHERE id = ?").run(id);
  revalidateAll();
}
