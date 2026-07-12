import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

declare global {
  // eslint-disable-next-line no-var
  var __simamang_db__: Database.Database | undefined;
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "simamang.db");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function getDb(): Database.Database {
  if (globalThis.__simamang_db__) return globalThis.__simamang_db__;
  ensureDataDir();
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  applyMigrations(db);
  seedIfEmpty(db);
  globalThis.__simamang_db__ = db;
  return db;
}

function applyMigrations(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS accounts (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      name          TEXT    NOT NULL,
      type          TEXT    NOT NULL, -- cash | bank | ewallet | credit | investment | other
      currency      TEXT    NOT NULL DEFAULT 'IDR',
      opening_balance REAL  NOT NULL DEFAULT 0,
      color         TEXT    NOT NULL DEFAULT '#28a668',
      icon          TEXT    NOT NULL DEFAULT 'wallet',
      note          TEXT,
      archived      INTEGER NOT NULL DEFAULT 0,
      created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS categories (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT    NOT NULL,
      kind       TEXT    NOT NULL, -- income | expense
      icon       TEXT    NOT NULL DEFAULT 'tag',
      color      TEXT    NOT NULL DEFAULT '#64748b',
      parent_id  INTEGER,
      archived   INTEGER NOT NULL DEFAULT 0,
      created_at TEXT    NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      type          TEXT    NOT NULL, -- income | expense | transfer
      amount        REAL    NOT NULL, -- always positive
      account_id    INTEGER NOT NULL,
      to_account_id INTEGER,          -- for transfers
      category_id   INTEGER,          -- null for transfers
      occurred_at   TEXT    NOT NULL, -- ISO datetime
      note          TEXT,
      tags          TEXT,             -- comma-separated
      created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
      FOREIGN KEY (to_account_id) REFERENCES accounts(id) ON DELETE SET NULL,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_tx_occurred ON transactions(occurred_at);
    CREATE INDEX IF NOT EXISTS idx_tx_account  ON transactions(account_id);
    CREATE INDEX IF NOT EXISTS idx_tx_category ON transactions(category_id);

    CREATE TABLE IF NOT EXISTS budgets (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      month       TEXT    NOT NULL, -- 'YYYY-MM'
      amount      REAL    NOT NULL,
      note        TEXT,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      UNIQUE(category_id, month),
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS goals (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      name           TEXT    NOT NULL,
      target_amount  REAL    NOT NULL,
      saved_amount   REAL    NOT NULL DEFAULT 0,
      deadline       TEXT,
      account_id     INTEGER,
      color          TEXT    NOT NULL DEFAULT '#28a668',
      icon           TEXT    NOT NULL DEFAULT 'target',
      note           TEXT,
      completed      INTEGER NOT NULL DEFAULT 0,
      created_at     TEXT    NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS debts (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      kind       TEXT    NOT NULL, -- hutang (I owe) | piutang (owed to me)
      party      TEXT    NOT NULL, -- who
      amount     REAL    NOT NULL,
      paid       REAL    NOT NULL DEFAULT 0,
      due_date   TEXT,
      note       TEXT,
      settled    INTEGER NOT NULL DEFAULT 0,
      created_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS recurring (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      name          TEXT    NOT NULL,
      type          TEXT    NOT NULL, -- income | expense
      amount        REAL    NOT NULL,
      account_id    INTEGER NOT NULL,
      category_id   INTEGER,
      frequency     TEXT    NOT NULL, -- daily | weekly | monthly | yearly
      day_of_month  INTEGER,          -- 1..31 for monthly/yearly
      day_of_week   INTEGER,          -- 0..6 for weekly
      next_run      TEXT    NOT NULL, -- 'YYYY-MM-DD'
      last_run      TEXT,
      active        INTEGER NOT NULL DEFAULT 1,
      note          TEXT,
      created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    );
  `);
}

function seedIfEmpty(db: Database.Database) {
  const accCount = db.prepare("SELECT COUNT(*) AS c FROM accounts").get() as { c: number };
  if (accCount.c > 0) return;

  db.prepare("INSERT OR REPLACE INTO settings(key, value) VALUES (?, ?)").run("currency", "IDR");
  db.prepare("INSERT OR REPLACE INTO settings(key, value) VALUES (?, ?)").run("locale", "id-ID");
  db.prepare("INSERT OR REPLACE INTO settings(key, value) VALUES (?, ?)").run("theme", "system");
  db.prepare("INSERT OR REPLACE INTO settings(key, value) VALUES (?, ?)").run(
    "profile_name",
    "Pengguna SiMamang",
  );

  const insertAccount = db.prepare(`
    INSERT INTO accounts (name, type, currency, opening_balance, color, icon, note)
    VALUES (@name, @type, @currency, @opening_balance, @color, @icon, @note)
  `);
  const accountSeeds: Array<{
    name: string;
    type: string;
    currency: string;
    opening_balance: number;
    color: string;
    icon: string;
    note: string | null;
  }> = [
    { name: "Dompet Tunai", type: "cash", currency: "IDR", opening_balance: 500_000, color: "#22c55e", icon: "wallet", note: "Uang tunai harian" },
    { name: "Bank BCA", type: "bank", currency: "IDR", opening_balance: 12_500_000, color: "#2563eb", icon: "landmark", note: "Rekening tabungan utama" },
    { name: "GoPay", type: "ewallet", currency: "IDR", opening_balance: 350_000, color: "#0ea5e9", icon: "smartphone", note: "E-wallet transportasi" },
    { name: "Kartu Kredit Visa", type: "credit", currency: "IDR", opening_balance: -1_800_000, color: "#ef4444", icon: "credit-card", note: "Limit Rp 15jt" },
    { name: "Reksadana Bibit", type: "investment", currency: "IDR", opening_balance: 8_200_000, color: "#a855f7", icon: "trending-up", note: "Portofolio pasar uang & saham" },
  ];
  const accountIds: Record<string, number> = {};
  const insertAccMany = db.transaction((rows: typeof accountSeeds) => {
    for (const r of rows) {
      const info = insertAccount.run(r);
      accountIds[r.name] = Number(info.lastInsertRowid);
    }
  });
  insertAccMany(accountSeeds);

  const insertCategory = db.prepare(`
    INSERT INTO categories (name, kind, icon, color) VALUES (?, ?, ?, ?)
  `);
  const categoryIds: Record<string, number> = {};
  const catSeeds: Array<[string, "income" | "expense", string, string]> = [
    ["Gaji", "income", "briefcase", "#16a34a"],
    ["Bonus", "income", "gift", "#22c55e"],
    ["Freelance", "income", "laptop", "#059669"],
    ["Hadiah", "income", "gift", "#84cc16"],
    ["Investasi", "income", "trending-up", "#0d9488"],
    ["Makanan & Minuman", "expense", "utensils", "#f97316"],
    ["Transportasi", "expense", "car", "#0ea5e9"],
    ["Belanja Kebutuhan", "expense", "shopping-cart", "#f59e0b"],
    ["Tagihan & Utilitas", "expense", "zap", "#eab308"],
    ["Rumah & Sewa", "expense", "home", "#ef4444"],
    ["Kesehatan", "expense", "heart-pulse", "#e11d48"],
    ["Pendidikan", "expense", "book-open", "#8b5cf6"],
    ["Hiburan", "expense", "clapperboard", "#ec4899"],
    ["Sosial & Donasi", "expense", "hand-heart", "#14b8a6"],
    ["Tabungan & Investasi", "expense", "piggy-bank", "#22c55e"],
    ["Pajak & Biaya", "expense", "receipt", "#64748b"],
    ["Lain-lain", "expense", "more-horizontal", "#94a3b8"],
  ];
  const insertCatMany = db.transaction((rows: typeof catSeeds) => {
    for (const [name, kind, icon, color] of rows) {
      const info = insertCategory.run(name, kind, icon, color);
      categoryIds[name] = Number(info.lastInsertRowid);
    }
  });
  insertCatMany(catSeeds);

  const now = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 19).replace("T", " ");
  const daysAgo = (n: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - n);
    return d;
  };

  const insertTx = db.prepare(`
    INSERT INTO transactions (type, amount, account_id, to_account_id, category_id, occurred_at, note, tags)
    VALUES (@type, @amount, @account_id, @to_account_id, @category_id, @occurred_at, @note, @tags)
  `);
  const daysIntoMonth = now.getDate();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 9, 0, 0);
  const midOfMonth = new Date(now.getFullYear(), now.getMonth(), Math.min(15, Math.max(2, daysIntoMonth - 3)), 10, 30, 0);
  const txSeeds = [
    { type: "income",   amount: 12_500_000, account_id: accountIds["Bank BCA"], to_account_id: null, category_id: categoryIds["Gaji"], occurred_at: iso(firstOfMonth), note: "Gaji bulan ini", tags: "rutin,gaji" },
    { type: "income",   amount: 1_500_000,  account_id: accountIds["Bank BCA"], to_account_id: null, category_id: categoryIds["Freelance"], occurred_at: iso(midOfMonth), note: "Proyek website UMKM", tags: "freelance" },
    { type: "income",   amount: 850_000,    account_id: accountIds["GoPay"],    to_account_id: null, category_id: categoryIds["Bonus"], occurred_at: iso(daysAgo(2)), note: "Bonus kinerja", tags: "bonus" },
    { type: "income",   amount: 8_500_000,  account_id: accountIds["Bank BCA"], to_account_id: null, category_id: categoryIds["Gaji"], occurred_at: iso(daysAgo(35)), note: "Gaji bulan lalu", tags: "rutin,gaji" },
    { type: "expense",  amount: 45_000,     account_id: accountIds["GoPay"],     to_account_id: null, category_id: categoryIds["Makanan & Minuman"], occurred_at: iso(daysAgo(1)),  note: "Makan siang warteg", tags: "makan" },
    { type: "expense",  amount: 120_000,    account_id: accountIds["Bank BCA"],  to_account_id: null, category_id: categoryIds["Belanja Kebutuhan"], occurred_at: iso(daysAgo(2)),  note: "Belanja bulanan pasar", tags: "belanja" },
    { type: "expense",  amount: 1_500_000,  account_id: accountIds["Bank BCA"],  to_account_id: null, category_id: categoryIds["Tagihan & Utilitas"], occurred_at: iso(daysAgo(5)),  note: "Listrik, air, internet", tags: "tagihan,rutin" },
    { type: "expense",  amount: 3_500_000,  account_id: accountIds["Bank BCA"],  to_account_id: null, category_id: categoryIds["Rumah & Sewa"], occurred_at: iso(daysAgo(6)),  note: "Sewa kos bulanan", tags: "rumah" },
    { type: "expense",  amount: 250_000,    account_id: accountIds["GoPay"],     to_account_id: null, category_id: categoryIds["Transportasi"], occurred_at: iso(daysAgo(3)),  note: "Ojek online mingguan", tags: "transport" },
    { type: "expense",  amount: 89_000,     account_id: accountIds["Kartu Kredit Visa"], to_account_id: null, category_id: categoryIds["Hiburan"], occurred_at: iso(daysAgo(7)),  note: "Langganan streaming", tags: "hiburan,rutin" },
    { type: "expense",  amount: 250_000,    account_id: accountIds["Bank BCA"],  to_account_id: null, category_id: categoryIds["Sosial & Donasi"], occurred_at: iso(daysAgo(10)), note: "Infaq masjid", tags: "sosial" },
    { type: "transfer", amount: 2_000_000,  account_id: accountIds["Bank BCA"],  to_account_id: accountIds["Reksadana Bibit"], category_id: null, occurred_at: iso(daysAgo(4)), note: "Investasi bulanan", tags: "investasi" },
    { type: "transfer", amount: 200_000,    account_id: accountIds["Bank BCA"],  to_account_id: accountIds["GoPay"], category_id: null, occurred_at: iso(daysAgo(8)), note: "Top-up e-wallet", tags: "topup" },
    { type: "expense",  amount: 320_000,    account_id: accountIds["Kartu Kredit Visa"], to_account_id: null, category_id: categoryIds["Kesehatan"], occurred_at: iso(daysAgo(12)), note: "Vitamin & suplemen", tags: "kesehatan" },
    { type: "expense",  amount: 1_100_000,  account_id: accountIds["Bank BCA"],  to_account_id: null, category_id: categoryIds["Pendidikan"], occurred_at: iso(daysAgo(15)), note: "Kursus online", tags: "belajar" },
  ];
  const insertTxMany = db.transaction((rows: typeof txSeeds) => {
    for (const r of rows) insertTx.run(r);
  });
  insertTxMany(txSeeds);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const insertBudget = db.prepare(`
    INSERT OR REPLACE INTO budgets (category_id, month, amount, note) VALUES (?, ?, ?, ?)
  `);
  insertBudget.run(categoryIds["Makanan & Minuman"], currentMonth, 2_000_000, "Batas makan luar");
  insertBudget.run(categoryIds["Transportasi"], currentMonth, 800_000, "Termasuk BBM & ojek");
  insertBudget.run(categoryIds["Belanja Kebutuhan"], currentMonth, 1_500_000, "Belanja bulanan");
  insertBudget.run(categoryIds["Hiburan"], currentMonth, 500_000, "Langganan & tontonan");
  insertBudget.run(categoryIds["Tagihan & Utilitas"], currentMonth, 1_800_000, "Rutin");
  insertBudget.run(categoryIds["Rumah & Sewa"], currentMonth, 3_500_000, "Sewa kos");

  db.prepare(`
    INSERT INTO goals (name, target_amount, saved_amount, deadline, account_id, color, icon, note)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    "Dana Darurat 6 Bulan",
    36_000_000,
    8_200_000,
    new Date(now.getFullYear() + 1, 5, 30).toISOString().slice(0, 10),
    accountIds["Reksadana Bibit"],
    "#22c55e",
    "shield",
    "Setara 6× pengeluaran bulanan",
  );
  db.prepare(`
    INSERT INTO goals (name, target_amount, saved_amount, deadline, account_id, color, icon, note)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    "Liburan Bali",
    8_000_000,
    1_200_000,
    new Date(now.getFullYear(), now.getMonth() + 6, 1).toISOString().slice(0, 10),
    accountIds["Bank BCA"],
    "#0ea5e9",
    "plane",
    "Untuk 5 hari 4 malam",
  );
  db.prepare(`
    INSERT INTO goals (name, target_amount, saved_amount, deadline, account_id, color, icon, note)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    "DP Motor Baru",
    15_000_000,
    3_500_000,
    new Date(now.getFullYear(), now.getMonth() + 10, 15).toISOString().slice(0, 10),
    accountIds["Bank BCA"],
    "#f59e0b",
    "bike",
    "DP 30%",
  );

  const insertDebt = db.prepare(`
    INSERT INTO debts (kind, party, amount, paid, due_date, note) VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertDebt.run("hutang", "Andi", 500_000, 200_000, new Date(now.getFullYear(), now.getMonth() + 1, 10).toISOString().slice(0, 10), "Pinjam untuk service motor");
  insertDebt.run("piutang", "Budi", 750_000, 0, new Date(now.getFullYear(), now.getMonth() + 1, 20).toISOString().slice(0, 10), "Talangin tiket konser");
  insertDebt.run("hutang", "Cicilan Laptop", 4_500_000, 1_500_000, new Date(now.getFullYear(), now.getMonth() + 3, 1).toISOString().slice(0, 10), "3× cicilan sisa");

  const insertRec = db.prepare(`
    INSERT INTO recurring (name, type, amount, account_id, category_id, frequency, day_of_month, day_of_week, next_run, active, note)
    VALUES (@name, @type, @amount, @account_id, @category_id, @frequency, @day_of_month, @day_of_week, @next_run, @active, @note)
  `);
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().slice(0, 10);
  const twoWeeks = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14).toISOString().slice(0, 10);
  insertRec.run({
    name: "Gaji Bulanan",
    type: "income",
    amount: 12_500_000,
    account_id: accountIds["Bank BCA"],
    category_id: categoryIds["Gaji"],
    frequency: "monthly",
    day_of_month: 28,
    day_of_week: null,
    next_run: nextMonth,
    active: 1,
    note: "Transfer otomatis dari kantor",
  });
  insertRec.run({
    name: "Sewa Kos",
    type: "expense",
    amount: 3_500_000,
    account_id: accountIds["Bank BCA"],
    category_id: categoryIds["Rumah & Sewa"],
    frequency: "monthly",
    day_of_month: 5,
    day_of_week: null,
    next_run: nextMonth,
    active: 1,
    note: "Transfer ke pemilik kos",
  });
  insertRec.run({
    name: "Langganan Streaming",
    type: "expense",
    amount: 89_000,
    account_id: accountIds["Kartu Kredit Visa"],
    category_id: categoryIds["Hiburan"],
    frequency: "monthly",
    day_of_month: 15,
    day_of_week: null,
    next_run: nextMonth,
    active: 1,
    note: "Auto-charge kartu",
  });
  insertRec.run({
    name: "Belanja Mingguan",
    type: "expense",
    amount: 300_000,
    account_id: accountIds["Bank BCA"],
    category_id: categoryIds["Belanja Kebutuhan"],
    frequency: "weekly",
    day_of_month: null,
    day_of_week: 6,
    next_run: twoWeeks,
    active: 1,
    note: "Sabtu pasar mingguan",
  });
}
