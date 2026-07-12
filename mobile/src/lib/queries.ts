import { getDb } from "./db";
import type {
  Account,
  AccountWithBalance,
  Budget,
  BudgetExpanded,
  Category,
  Debt,
  Goal,
  Transaction,
  TransactionExpanded,
} from "./types";

export function getSetting(key: string, fallback = ""): string {
  const row = getDb().getFirstSync<{ value: string }>(
    "SELECT value FROM settings WHERE key = ?",
    key,
  );
  return row?.value ?? fallback;
}

export function setSetting(key: string, value: string) {
  getDb().runSync(
    `INSERT INTO settings(key,value) VALUES (?,?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    key, value,
  );
}

/* ---- Accounts ---- */

export function listAccounts(includeArchived = false): Account[] {
  const q = includeArchived
    ? "SELECT * FROM accounts ORDER BY archived, id"
    : "SELECT * FROM accounts WHERE archived = 0 ORDER BY id";
  return getDb().getAllSync<Account>(q);
}

export function getAccount(id: number): Account | null {
  return getDb().getFirstSync<Account>("SELECT * FROM accounts WHERE id = ?", id) ?? null;
}

export function listAccountsWithBalances(includeArchived = false): AccountWithBalance[] {
  const db = getDb();
  const accounts = listAccounts(includeArchived);
  return accounts.map((a) => {
    const income = db.getFirstSync<{ s: number }>(
      "SELECT COALESCE(SUM(amount),0) AS s FROM transactions WHERE account_id = ? AND type = 'income'",
      a.id,
    )!.s;
    const expense = db.getFirstSync<{ s: number }>(
      "SELECT COALESCE(SUM(amount),0) AS s FROM transactions WHERE account_id = ? AND type = 'expense'",
      a.id,
    )!.s;
    const outgoing = db.getFirstSync<{ s: number }>(
      "SELECT COALESCE(SUM(amount),0) AS s FROM transactions WHERE account_id = ? AND type = 'transfer'",
      a.id,
    )!.s;
    const incoming = db.getFirstSync<{ s: number }>(
      "SELECT COALESCE(SUM(amount),0) AS s FROM transactions WHERE to_account_id = ? AND type = 'transfer'",
      a.id,
    )!.s;
    return { ...a, balance: a.opening_balance + income - expense - outgoing + incoming };
  });
}

export function upsertAccount(input: {
  id?: number;
  name: string;
  type: string;
  currency?: string;
  opening_balance?: number;
  color?: string;
  icon?: string;
  note?: string | null;
}) {
  const {
    id,
    name,
    type,
    currency = "IDR",
    opening_balance = 0,
    color = "#28a668",
    icon = "wallet",
    note = null,
  } = input;
  if (id) {
    getDb().runSync(
      `UPDATE accounts SET name=?, type=?, currency=?, opening_balance=?, color=?, icon=?, note=?
       WHERE id=?`,
      name, type, currency, opening_balance, color, icon, note, id,
    );
    return id;
  }
  const r = getDb().runSync(
    `INSERT INTO accounts (name,type,currency,opening_balance,color,icon,note)
     VALUES (?,?,?,?,?,?,?)`,
    name, type, currency, opening_balance, color, icon, note,
  );
  return Number(r.lastInsertRowId);
}

export function toggleArchiveAccount(id: number) {
  getDb().runSync("UPDATE accounts SET archived = 1 - archived WHERE id = ?", id);
}

export function deleteAccount(id: number) {
  getDb().runSync("DELETE FROM accounts WHERE id = ?", id);
}

/* ---- Categories ---- */

export function listCategories(kind?: "income" | "expense"): Category[] {
  const db = getDb();
  return kind
    ? db.getAllSync<Category>(
        "SELECT * FROM categories WHERE kind = ? AND archived = 0 ORDER BY name",
        kind,
      )
    : db.getAllSync<Category>(
        "SELECT * FROM categories WHERE archived = 0 ORDER BY kind, name",
      );
}

export function upsertCategory(input: {
  id?: number;
  name: string;
  kind: "income" | "expense";
  icon?: string;
  color?: string;
}) {
  const { id, name, kind, icon = "tag", color = "#64748b" } = input;
  if (id) {
    getDb().runSync(
      "UPDATE categories SET name=?, kind=?, icon=?, color=? WHERE id=?",
      name, kind, icon, color, id,
    );
    return id;
  }
  const r = getDb().runSync(
    "INSERT INTO categories (name,kind,icon,color) VALUES (?,?,?,?)",
    name, kind, icon, color,
  );
  return Number(r.lastInsertRowId);
}

export function deleteCategory(id: number) {
  getDb().runSync("DELETE FROM categories WHERE id = ?", id);
}

/* ---- Transactions ---- */

export interface TxFilters {
  month?: string;
  type?: "income" | "expense" | "transfer" | "all";
  accountId?: number;
  categoryId?: number;
  q?: string;
  limit?: number;
}

export function listTransactions(filters: TxFilters = {}): TransactionExpanded[] {
  const db = getDb();
  const wheres: string[] = [];
  const params: any[] = [];
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
  return db.getAllSync<TransactionExpanded>(
    `SELECT t.*,
      a.name  AS account_name, a.color AS account_color, a.icon AS account_icon,
      ta.name AS to_account_name,
      c.name  AS category_name, c.color AS category_color, c.icon AS category_icon
    FROM transactions t
    LEFT JOIN accounts   a  ON a.id = t.account_id
    LEFT JOIN accounts   ta ON ta.id = t.to_account_id
    LEFT JOIN categories c  ON c.id = t.category_id
    ${whereSql}
    ORDER BY t.occurred_at DESC, t.id DESC
    ${limitSql}`,
    ...params,
  );
}

export function getTransaction(id: number): Transaction | null {
  return getDb().getFirstSync<Transaction>("SELECT * FROM transactions WHERE id = ?", id) ?? null;
}

export function upsertTransaction(input: {
  id?: number;
  type: "income" | "expense" | "transfer";
  amount: number;
  account_id: number;
  to_account_id?: number | null;
  category_id?: number | null;
  occurred_at: string;
  note?: string | null;
  tags?: string | null;
}) {
  const {
    id,
    type,
    amount,
    account_id,
    to_account_id = null,
    category_id = null,
    occurred_at,
    note = null,
    tags = null,
  } = input;
  const to = type === "transfer" ? to_account_id : null;
  const cat = type === "transfer" ? null : category_id;
  if (id) {
    getDb().runSync(
      `UPDATE transactions SET type=?, amount=?, account_id=?, to_account_id=?, category_id=?,
        occurred_at=?, note=?, tags=? WHERE id=?`,
      type, amount, account_id, to, cat, occurred_at, note, tags, id,
    );
    return id;
  }
  const r = getDb().runSync(
    `INSERT INTO transactions (type,amount,account_id,to_account_id,category_id,occurred_at,note,tags)
     VALUES (?,?,?,?,?,?,?,?)`,
    type, amount, account_id, to, cat, occurred_at, note, tags,
  );
  return Number(r.lastInsertRowId);
}

export function deleteTransaction(id: number) {
  getDb().runSync("DELETE FROM transactions WHERE id = ?", id);
}

/* ---- Budgets ---- */

export function listBudgetsForMonth(month: string): BudgetExpanded[] {
  const db = getDb();
  const rows = db.getAllSync<Budget & { category_name: string; category_color: string; category_icon: string }>(
    `SELECT b.*, c.name AS category_name, c.color AS category_color, c.icon AS category_icon
     FROM budgets b JOIN categories c ON c.id = b.category_id
     WHERE b.month = ? ORDER BY c.name`,
    month,
  );
  return rows.map((b) => {
    const spent = db.getFirstSync<{ s: number }>(
      `SELECT COALESCE(SUM(amount),0) AS s FROM transactions
       WHERE type = 'expense' AND category_id = ? AND substr(occurred_at,1,7) = ?`,
      b.category_id, month,
    )!.s;
    return { ...b, spent };
  });
}

export function upsertBudget(input: {
  id?: number;
  category_id: number;
  month: string;
  amount: number;
  note?: string | null;
}) {
  const { category_id, month, amount, note = null } = input;
  getDb().runSync(
    `INSERT INTO budgets (category_id,month,amount,note) VALUES (?,?,?,?)
     ON CONFLICT(category_id,month) DO UPDATE SET amount = excluded.amount, note = excluded.note`,
    category_id, month, amount, note,
  );
}

export function deleteBudget(id: number) {
  getDb().runSync("DELETE FROM budgets WHERE id = ?", id);
}

/* ---- Goals ---- */

export function listGoals(): Goal[] {
  return getDb().getAllSync<Goal>(
    "SELECT * FROM goals ORDER BY completed, deadline IS NULL, deadline",
  );
}

export function upsertGoal(input: {
  id?: number;
  name: string;
  target_amount: number;
  saved_amount?: number;
  deadline?: string | null;
  account_id?: number | null;
  color?: string;
  icon?: string;
  note?: string | null;
}) {
  const {
    id,
    name,
    target_amount,
    saved_amount = 0,
    deadline = null,
    account_id = null,
    color = "#28a668",
    icon = "target",
    note = null,
  } = input;
  if (id) {
    getDb().runSync(
      `UPDATE goals SET name=?, target_amount=?, saved_amount=?, deadline=?, account_id=?,
        color=?, icon=?, note=? WHERE id=?`,
      name, target_amount, saved_amount, deadline, account_id, color, icon, note, id,
    );
    return id;
  }
  const r = getDb().runSync(
    `INSERT INTO goals (name,target_amount,saved_amount,deadline,account_id,color,icon,note)
     VALUES (?,?,?,?,?,?,?,?)`,
    name, target_amount, saved_amount, deadline, account_id, color, icon, note,
  );
  return Number(r.lastInsertRowId);
}

export function contributeGoal(id: number, amount: number) {
  getDb().runSync(
    `UPDATE goals SET saved_amount = saved_amount + ?,
      completed = CASE WHEN saved_amount + ? >= target_amount THEN 1 ELSE 0 END
     WHERE id = ?`,
    amount, amount, id,
  );
}

export function deleteGoal(id: number) {
  getDb().runSync("DELETE FROM goals WHERE id = ?", id);
}

/* ---- Debts ---- */

export function listDebts(): Debt[] {
  return getDb().getAllSync<Debt>(
    "SELECT * FROM debts ORDER BY settled, due_date IS NULL, due_date",
  );
}

export function upsertDebt(input: {
  id?: number;
  kind: "hutang" | "piutang";
  party: string;
  amount: number;
  paid?: number;
  due_date?: string | null;
  note?: string | null;
}) {
  const { id, kind, party, amount, paid = 0, due_date = null, note = null } = input;
  if (id) {
    getDb().runSync(
      `UPDATE debts SET kind=?, party=?, amount=?, paid=?, due_date=?, note=? WHERE id=?`,
      kind, party, amount, paid, due_date, note, id,
    );
    return id;
  }
  const r = getDb().runSync(
    `INSERT INTO debts (kind,party,amount,paid,due_date,note) VALUES (?,?,?,?,?,?)`,
    kind, party, amount, paid, due_date, note,
  );
  return Number(r.lastInsertRowId);
}

export function payDebt(id: number, amount: number) {
  getDb().runSync(
    `UPDATE debts SET paid = MIN(paid + ?, amount),
      settled = CASE WHEN paid + ? >= amount THEN 1 ELSE 0 END
     WHERE id = ?`,
    amount, amount, id,
  );
}

export function settleDebt(id: number) {
  getDb().runSync("UPDATE debts SET paid = amount, settled = 1 WHERE id = ?", id);
}

export function deleteDebt(id: number) {
  getDb().runSync("DELETE FROM debts WHERE id = ?", id);
}

/* ---- Aggregates ---- */

export interface MonthlyTotals {
  income: number;
  expense: number;
  net: number;
  txCount: number;
}

export function monthlyTotals(month: string): MonthlyTotals {
  const db = getDb();
  const income = db.getFirstSync<{ s: number }>(
    `SELECT COALESCE(SUM(amount),0) AS s FROM transactions WHERE type='income' AND substr(occurred_at,1,7)=?`,
    month,
  )!.s;
  const expense = db.getFirstSync<{ s: number }>(
    `SELECT COALESCE(SUM(amount),0) AS s FROM transactions WHERE type='expense' AND substr(occurred_at,1,7)=?`,
    month,
  )!.s;
  const txCount = db.getFirstSync<{ c: number }>(
    `SELECT COUNT(*) AS c FROM transactions WHERE substr(occurred_at,1,7)=?`,
    month,
  )!.c;
  return { income, expense, net: income - expense, txCount };
}

export interface CategoryBreakdown {
  category_id: number | null;
  category_name: string;
  category_color: string;
  category_icon: string;
  total: number;
}

export function expenseByCategory(month: string): CategoryBreakdown[] {
  return getDb().getAllSync<CategoryBreakdown>(
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
    month,
  );
}

export interface MonthlySeriesPoint {
  month: string;
  income: number;
  expense: number;
  net: number;
}

export function monthlySeries(months = 6): MonthlySeriesPoint[] {
  const db = getDb();
  const rows = db.getAllSync<{ month: string; income: number; expense: number }>(
    `SELECT substr(occurred_at,1,7) AS month,
            SUM(CASE WHEN type='income'  THEN amount ELSE 0 END) AS income,
            SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) AS expense
     FROM transactions
     GROUP BY month`,
  );
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
  return listAccountsWithBalances().reduce((s, a) => s + a.balance, 0);
}

export function outstandingDebtsSummary(): { hutang: number; piutang: number } {
  const db = getDb();
  const hutang = db.getFirstSync<{ s: number }>(
    "SELECT COALESCE(SUM(amount - paid),0) AS s FROM debts WHERE kind='hutang' AND settled=0",
  )!.s;
  const piutang = db.getFirstSync<{ s: number }>(
    "SELECT COALESCE(SUM(amount - paid),0) AS s FROM debts WHERE kind='piutang' AND settled=0",
  )!.s;
  return { hutang, piutang };
}

export function exportAllJson(): string {
  const db = getDb();
  const dump = {
    exported_at: new Date().toISOString(),
    settings: db.getAllSync("SELECT * FROM settings"),
    accounts: db.getAllSync("SELECT * FROM accounts"),
    categories: db.getAllSync("SELECT * FROM categories"),
    transactions: db.getAllSync("SELECT * FROM transactions"),
    budgets: db.getAllSync("SELECT * FROM budgets"),
    goals: db.getAllSync("SELECT * FROM goals"),
    debts: db.getAllSync("SELECT * FROM debts"),
  };
  return JSON.stringify(dump, null, 2);
}
