import { getDb } from "./db";
import type {
  Account,
  AccountWithBalance,
  Budget,
  BudgetExpanded,
  Category,
  Debt,
  Goal,
  Recurring,
  Transaction,
  TransactionExpanded,
} from "./types";

/* ---------- SETTINGS ---------- */

export function getSetting(key: string, fallback = ""): string {
  const row = getDb().prepare("SELECT value FROM settings WHERE key = ?").get(key) as
    | { value: string }
    | undefined;
  return row?.value ?? fallback;
}

export function setSetting(key: string, value: string) {
  getDb().prepare(
    `INSERT INTO settings(key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
  ).run(key, value);
}

export function getSettings(): Record<string, string> {
  const rows = getDb().prepare("SELECT key, value FROM settings").all() as {
    key: string;
    value: string;
  }[];
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

/* ---------- ACCOUNTS ---------- */

export function listAccounts(includeArchived = false): Account[] {
  const q = includeArchived
    ? "SELECT * FROM accounts ORDER BY archived, id"
    : "SELECT * FROM accounts WHERE archived = 0 ORDER BY id";
  return getDb().prepare(q).all() as Account[];
}

export function getAccount(id: number): Account | null {
  return (getDb().prepare("SELECT * FROM accounts WHERE id = ?").get(id) as Account) ?? null;
}

export function listAccountsWithBalances(includeArchived = false): AccountWithBalance[] {
  const accounts = listAccounts(includeArchived);
  const db = getDb();
  return accounts.map((a) => {
    const income = (db
      .prepare("SELECT COALESCE(SUM(amount),0) AS s FROM transactions WHERE account_id = ? AND type = 'income'")
      .get(a.id) as { s: number }).s;
    const expense = (db
      .prepare("SELECT COALESCE(SUM(amount),0) AS s FROM transactions WHERE account_id = ? AND type = 'expense'")
      .get(a.id) as { s: number }).s;
    const outgoing = (db
      .prepare("SELECT COALESCE(SUM(amount),0) AS s FROM transactions WHERE account_id = ? AND type = 'transfer'")
      .get(a.id) as { s: number }).s;
    const incoming = (db
      .prepare("SELECT COALESCE(SUM(amount),0) AS s FROM transactions WHERE to_account_id = ? AND type = 'transfer'")
      .get(a.id) as { s: number }).s;
    return {
      ...a,
      balance: a.opening_balance + income - expense - outgoing + incoming,
    };
  });
}

/* ---------- CATEGORIES ---------- */

export function listCategories(kind?: "income" | "expense"): Category[] {
  const db = getDb();
  return (kind
    ? (db.prepare("SELECT * FROM categories WHERE kind = ? AND archived = 0 ORDER BY name").all(kind) as Category[])
    : (db.prepare("SELECT * FROM categories WHERE archived = 0 ORDER BY kind, name").all() as Category[]));
}

export function getCategory(id: number): Category | null {
  return (getDb().prepare("SELECT * FROM categories WHERE id = ?").get(id) as Category) ?? null;
}

/* ---------- TRANSACTIONS ---------- */

export interface TxFilters {
  month?: string; // YYYY-MM
  type?: "income" | "expense" | "transfer" | "all";
  accountId?: number;
  categoryId?: number;
  q?: string;
  limit?: number;
}

export function listTransactions(filters: TxFilters = {}): TransactionExpanded[] {
  const db = getDb();
  const wheres: string[] = [];
  const params: unknown[] = [];
  if (filters.month) {
    wheres.push("substr(t.occurred_at, 1, 7) = ?");
    params.push(filters.month);
  }
  if (filters.type && filters.type !== "all") {
    wheres.push("t.type = ?");
    params.push(filters.type);
  }
  if (filters.accountId) {
    wheres.push("(t.account_id = ? OR t.to_account_id = ?)");
    params.push(filters.accountId, filters.accountId);
  }
  if (filters.categoryId) {
    wheres.push("t.category_id = ?");
    params.push(filters.categoryId);
  }
  if (filters.q) {
    wheres.push("(COALESCE(t.note,'') LIKE ? OR COALESCE(t.tags,'') LIKE ?)");
    const like = `%${filters.q}%`;
    params.push(like, like);
  }
  const whereSql = wheres.length ? `WHERE ${wheres.join(" AND ")}` : "";
  const limitSql = filters.limit ? `LIMIT ${Number(filters.limit)}` : "";

  const rows = db
    .prepare(
      `SELECT t.*,
        a.name  AS account_name, a.color AS account_color, a.icon AS account_icon,
        ta.name AS to_account_name, ta.color AS to_account_color,
        c.name  AS category_name, c.color AS category_color, c.icon AS category_icon, c.kind AS category_kind
      FROM transactions t
      LEFT JOIN accounts   a  ON a.id = t.account_id
      LEFT JOIN accounts   ta ON ta.id = t.to_account_id
      LEFT JOIN categories c  ON c.id = t.category_id
      ${whereSql}
      ORDER BY t.occurred_at DESC, t.id DESC
      ${limitSql}`,
    )
    .all(...params);
  return rows as TransactionExpanded[];
}

export function getTransaction(id: number): Transaction | null {
  return (getDb().prepare("SELECT * FROM transactions WHERE id = ?").get(id) as Transaction) ?? null;
}

/* ---------- BUDGETS ---------- */

export function listBudgetsForMonth(month: string): BudgetExpanded[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT b.*, c.name AS category_name, c.color AS category_color, c.icon AS category_icon
       FROM budgets b
       JOIN categories c ON c.id = b.category_id
       WHERE b.month = ?
       ORDER BY c.name`,
    )
    .all(month) as (Budget & { category_name: string; category_color: string; category_icon: string })[];
  return rows.map((b) => {
    const spent = (db
      .prepare(
        `SELECT COALESCE(SUM(amount),0) AS s FROM transactions
         WHERE type = 'expense' AND category_id = ? AND substr(occurred_at,1,7) = ?`,
      )
      .get(b.category_id, month) as { s: number }).s;
    return { ...b, spent };
  });
}

/* ---------- GOALS ---------- */

export function listGoals(): Goal[] {
  return getDb().prepare("SELECT * FROM goals ORDER BY completed, deadline IS NULL, deadline").all() as Goal[];
}

/* ---------- DEBTS ---------- */

export function listDebts(): Debt[] {
  return getDb().prepare("SELECT * FROM debts ORDER BY settled, due_date IS NULL, due_date").all() as Debt[];
}

/* ---------- RECURRING ---------- */

export function listRecurring(): Recurring[] {
  return getDb().prepare("SELECT * FROM recurring ORDER BY active DESC, next_run").all() as Recurring[];
}

/* ---------- AGGREGATES ---------- */

export interface MonthlyTotals {
  income: number;
  expense: number;
  net: number;
  transfers: number;
  txCount: number;
}

export function monthlyTotals(month: string): MonthlyTotals {
  const db = getDb();
  const income = (db
    .prepare(
      `SELECT COALESCE(SUM(amount),0) AS s FROM transactions
       WHERE type = 'income' AND substr(occurred_at,1,7) = ?`,
    )
    .get(month) as { s: number }).s;
  const expense = (db
    .prepare(
      `SELECT COALESCE(SUM(amount),0) AS s FROM transactions
       WHERE type = 'expense' AND substr(occurred_at,1,7) = ?`,
    )
    .get(month) as { s: number }).s;
  const transfers = (db
    .prepare(
      `SELECT COALESCE(SUM(amount),0) AS s FROM transactions
       WHERE type = 'transfer' AND substr(occurred_at,1,7) = ?`,
    )
    .get(month) as { s: number }).s;
  const txCount = (db
    .prepare(
      `SELECT COUNT(*) AS c FROM transactions
       WHERE substr(occurred_at,1,7) = ?`,
    )
    .get(month) as { c: number }).c;
  return { income, expense, net: income - expense, transfers, txCount };
}

export interface CategoryBreakdown {
  category_id: number | null;
  category_name: string;
  category_color: string;
  category_icon: string;
  total: number;
}

export function expenseByCategory(month: string): CategoryBreakdown[] {
  return getDb()
    .prepare(
      `SELECT
         COALESCE(c.id, -1) AS category_id,
         COALESCE(c.name, 'Tanpa Kategori') AS category_name,
         COALESCE(c.color, '#94a3b8') AS category_color,
         COALESCE(c.icon, 'tag') AS category_icon,
         SUM(t.amount) AS total
       FROM transactions t
       LEFT JOIN categories c ON c.id = t.category_id
       WHERE t.type = 'expense' AND substr(t.occurred_at,1,7) = ?
       GROUP BY category_id
       ORDER BY total DESC`,
    )
    .all(month) as CategoryBreakdown[];
}

export function incomeByCategory(month: string): CategoryBreakdown[] {
  return getDb()
    .prepare(
      `SELECT
         COALESCE(c.id, -1) AS category_id,
         COALESCE(c.name, 'Tanpa Kategori') AS category_name,
         COALESCE(c.color, '#94a3b8') AS category_color,
         COALESCE(c.icon, 'tag') AS category_icon,
         SUM(t.amount) AS total
       FROM transactions t
       LEFT JOIN categories c ON c.id = t.category_id
       WHERE t.type = 'income' AND substr(t.occurred_at,1,7) = ?
       GROUP BY category_id
       ORDER BY total DESC`,
    )
    .all(month) as CategoryBreakdown[];
}

export interface DailySeries {
  day: string; // YYYY-MM-DD
  income: number;
  expense: number;
}

export function dailySeries(month: string): DailySeries[] {
  const rows = getDb()
    .prepare(
      `SELECT substr(occurred_at,1,10) AS day,
              SUM(CASE WHEN type='income'  THEN amount ELSE 0 END) AS income,
              SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) AS expense
       FROM transactions
       WHERE substr(occurred_at,1,7) = ?
       GROUP BY day
       ORDER BY day`,
    )
    .all(month) as DailySeries[];
  return rows;
}

export interface MonthlySeriesPoint {
  month: string; // YYYY-MM
  income: number;
  expense: number;
  net: number;
}

export function monthlySeries(months = 12): MonthlySeriesPoint[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT substr(occurred_at,1,7) AS month,
              SUM(CASE WHEN type='income'  THEN amount ELSE 0 END) AS income,
              SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) AS expense
       FROM transactions
       GROUP BY month
       ORDER BY month`,
    )
    .all() as { month: string; income: number; expense: number }[];
  const map = new Map(rows.map((r) => [r.month, r]));
  const out: MonthlySeriesPoint[] = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const r = map.get(key);
    out.push({
      month: key,
      income: r?.income ?? 0,
      expense: r?.expense ?? 0,
      net: (r?.income ?? 0) - (r?.expense ?? 0),
    });
  }
  return out;
}

export function totalNetWorth(): number {
  return listAccountsWithBalances().reduce((sum, a) => sum + a.balance, 0);
}

export function upcomingRecurring(limit = 5): Recurring[] {
  return getDb()
    .prepare("SELECT * FROM recurring WHERE active = 1 ORDER BY next_run ASC LIMIT ?")
    .all(limit) as Recurring[];
}

export function outstandingDebtsSummary(): { hutang: number; piutang: number } {
  const db = getDb();
  const hutang = (db
    .prepare("SELECT COALESCE(SUM(amount - paid),0) AS s FROM debts WHERE kind='hutang' AND settled = 0")
    .get() as { s: number }).s;
  const piutang = (db
    .prepare("SELECT COALESCE(SUM(amount - paid),0) AS s FROM debts WHERE kind='piutang' AND settled = 0")
    .get() as { s: number }).s;
  return { hutang, piutang };
}
