"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { setSetting } from "@/lib/queries";

export async function saveSettingsAction(fd: FormData) {
  const currency = (fd.get("currency") as string) || "IDR";
  const locale = (fd.get("locale") as string) || "id-ID";
  const profile = (fd.get("profile_name") as string) || "";
  setSetting("currency", currency);
  setSetting("locale", locale);
  setSetting("profile_name", profile);
  revalidatePath("/", "layout");
}

export async function resetAllDataAction() {
  const db = getDb();
  db.exec(`
    DELETE FROM transactions;
    DELETE FROM budgets;
    DELETE FROM goals;
    DELETE FROM debts;
    DELETE FROM recurring;
    DELETE FROM categories;
    DELETE FROM accounts;
    DELETE FROM settings;
    DELETE FROM sqlite_sequence WHERE name IN ('transactions','budgets','goals','debts','recurring','categories','accounts');
  `);
  // Force re-seed on next boot
  if (globalThis.__simamang_db__) {
    globalThis.__simamang_db__.close();
    globalThis.__simamang_db__ = undefined;
  }
  revalidatePath("/", "layout");
}

export async function exportAllDataAction(): Promise<string> {
  const db = getDb();
  const dump = {
    exported_at: new Date().toISOString(),
    settings: db.prepare("SELECT * FROM settings").all(),
    accounts: db.prepare("SELECT * FROM accounts").all(),
    categories: db.prepare("SELECT * FROM categories").all(),
    transactions: db.prepare("SELECT * FROM transactions").all(),
    budgets: db.prepare("SELECT * FROM budgets").all(),
    goals: db.prepare("SELECT * FROM goals").all(),
    debts: db.prepare("SELECT * FROM debts").all(),
    recurring: db.prepare("SELECT * FROM recurring").all(),
  };
  return JSON.stringify(dump, null, 2);
}
