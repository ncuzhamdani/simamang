"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getDb } from "@/lib/db";

const CategorySchema = z.object({
  name: z.string().trim().min(1).max(60),
  kind: z.enum(["income", "expense"]),
  icon: z.string().trim().default("tag"),
  color: z.string().trim().default("#64748b"),
});

function readForm(fd: FormData) {
  const obj: Record<string, unknown> = {};
  fd.forEach((v, k) => (obj[k] = typeof v === "string" ? v : v));
  return obj;
}

export async function createCategoryAction(fd: FormData) {
  const data = CategorySchema.parse(readForm(fd));
  getDb()
    .prepare("INSERT INTO categories (name, kind, icon, color) VALUES (@name, @kind, @icon, @color)")
    .run(data);
  revalidatePath("/", "layout");
}

export async function updateCategoryAction(id: number, fd: FormData) {
  const data = CategorySchema.parse(readForm(fd));
  getDb()
    .prepare("UPDATE categories SET name=@name, kind=@kind, icon=@icon, color=@color WHERE id=@id")
    .run({ ...data, id });
  revalidatePath("/", "layout");
}

export async function toggleArchiveCategoryAction(id: number) {
  getDb().prepare("UPDATE categories SET archived = 1 - archived WHERE id = ?").run(id);
  revalidatePath("/", "layout");
}

export async function deleteCategoryAction(id: number) {
  getDb().prepare("DELETE FROM categories WHERE id = ?").run(id);
  revalidatePath("/", "layout");
}
