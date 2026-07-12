"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/lib/db";

const RecurringSchema = z.object({
  name: z.string().trim().min(1).max(80),
  type: z.enum(["income", "expense"]),
  amount: z.coerce.number().positive(),
  account_id: z.coerce.number().int().positive(),
  category_id: z.union([z.coerce.number().int().positive(), z.literal(""), z.null()]).optional(),
  frequency: z.enum(["daily", "weekly", "monthly", "yearly"]),
  day_of_month: z.union([z.coerce.number().int().min(1).max(31), z.literal(""), z.null()]).optional(),
  day_of_week: z.union([z.coerce.number().int().min(0).max(6), z.literal(""), z.null()]).optional(),
  next_run: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  active: z.union([z.literal("on"), z.literal("off"), z.boolean(), z.null()]).optional(),
  note: z.string().optional().nullable(),
});

function readForm(fd: FormData) {
  const obj: Record<string, unknown> = {};
  fd.forEach((v, k) => (obj[k] = typeof v === "string" ? v : v));
  return obj;
}

function normalize(p: z.infer<typeof RecurringSchema>) {
  return {
    ...p,
    category_id: p.category_id === "" || p.category_id == null ? null : Number(p.category_id),
    day_of_month:
      p.day_of_month === "" || p.day_of_month == null ? null : Number(p.day_of_month),
    day_of_week: p.day_of_week === "" || p.day_of_week == null ? null : Number(p.day_of_week),
    active: p.active === "on" || p.active === true ? 1 : 0,
    note: p.note?.length ? p.note : null,
  };
}

export async function createRecurringAction(fd: FormData) {
  const p = normalize(RecurringSchema.parse(readForm(fd)));
  getDb()
    .prepare(
      `INSERT INTO recurring (name, type, amount, account_id, category_id, frequency, day_of_month, day_of_week, next_run, active, note)
       VALUES (@name, @type, @amount, @account_id, @category_id, @frequency, @day_of_month, @day_of_week, @next_run, @active, @note)`,
    )
    .run(p);
  revalidatePath("/", "layout");
}

export async function updateRecurringAction(id: number, fd: FormData) {
  const p = normalize(RecurringSchema.parse(readForm(fd)));
  getDb()
    .prepare(
      `UPDATE recurring SET
         name=@name, type=@type, amount=@amount, account_id=@account_id, category_id=@category_id,
         frequency=@frequency, day_of_month=@day_of_month, day_of_week=@day_of_week,
         next_run=@next_run, active=@active, note=@note
       WHERE id=@id`,
    )
    .run({ ...p, id });
  revalidatePath("/", "layout");
}

export async function runRecurringNowAction(id: number) {
  const db = getDb();
  const rec = db.prepare("SELECT * FROM recurring WHERE id = ?").get(id) as
    | {
        id: number;
        name: string;
        type: "income" | "expense";
        amount: number;
        account_id: number;
        category_id: number | null;
        frequency: string;
        day_of_month: number | null;
        day_of_week: number | null;
        next_run: string;
        note: string | null;
      }
    | undefined;
  if (!rec) return;
  const now = new Date();
  const isoNow = now.toISOString().slice(0, 19).replace("T", " ");
  db.prepare(
    `INSERT INTO transactions (type, amount, account_id, category_id, occurred_at, note, tags)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    rec.type,
    rec.amount,
    rec.account_id,
    rec.category_id,
    isoNow,
    rec.note ?? `Auto: ${rec.name}`,
    "berulang",
  );
  const next = advanceDate(rec.next_run, rec.frequency, rec.day_of_month, rec.day_of_week);
  db.prepare(
    `UPDATE recurring SET last_run = ?, next_run = ? WHERE id = ?`,
  ).run(now.toISOString().slice(0, 10), next, id);
  revalidatePath("/", "layout");
}

export async function deleteRecurringAction(id: number) {
  getDb().prepare("DELETE FROM recurring WHERE id = ?").run(id);
  revalidatePath("/", "layout");
}

function advanceDate(from: string, freq: string, dom: number | null, dow: number | null): string {
  const d = new Date(from);
  switch (freq) {
    case "daily":
      d.setDate(d.getDate() + 1);
      break;
    case "weekly":
      d.setDate(d.getDate() + 7);
      if (dow != null) {
        while (d.getDay() !== dow) d.setDate(d.getDate() + 1);
      }
      break;
    case "monthly":
      d.setMonth(d.getMonth() + 1);
      if (dom != null) d.setDate(Math.min(dom, daysInMonth(d.getFullYear(), d.getMonth())));
      break;
    case "yearly":
      d.setFullYear(d.getFullYear() + 1);
      break;
  }
  return d.toISOString().slice(0, 10);
}

function daysInMonth(y: number, m: number) {
  return new Date(y, m + 1, 0).getDate();
}
