import * as SQLite from "expo-sqlite";

let dbInstance: SQLite.SQLiteDatabase | null = null;

export function getDb(): SQLite.SQLiteDatabase {
  if (dbInstance) return dbInstance;
  dbInstance = SQLite.openDatabaseSync("simamang.db");
  dbInstance.execSync("PRAGMA journal_mode = WAL;");
  dbInstance.execSync("PRAGMA foreign_keys = ON;");
  migrate(dbInstance);
  seedIfEmpty(dbInstance);
  return dbInstance;
}

function migrate(db: SQLite.SQLiteDatabase) {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS accounts (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      name          TEXT    NOT NULL,
      type          TEXT    NOT NULL,
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
      kind       TEXT    NOT NULL,
      icon       TEXT    NOT NULL DEFAULT 'tag',
      color      TEXT    NOT NULL DEFAULT '#64748b',
      parent_id  INTEGER,
      archived   INTEGER NOT NULL DEFAULT 0,
      created_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      type          TEXT    NOT NULL,
      amount        REAL    NOT NULL,
      account_id    INTEGER NOT NULL,
      to_account_id INTEGER,
      category_id   INTEGER,
      occurred_at   TEXT    NOT NULL,
      note          TEXT,
      tags          TEXT,
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
      month       TEXT    NOT NULL,
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
      created_at     TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS debts (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      kind       TEXT    NOT NULL,
      party      TEXT    NOT NULL,
      amount     REAL    NOT NULL,
      paid       REAL    NOT NULL DEFAULT 0,
      due_date   TEXT,
      note       TEXT,
      settled    INTEGER NOT NULL DEFAULT 0,
      created_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

function seedIfEmpty(db: SQLite.SQLiteDatabase) {
  const row = db.getFirstSync<{ c: number }>("SELECT COUNT(*) AS c FROM accounts");
  if (row && row.c > 0) return;

  db.runSync("INSERT OR REPLACE INTO settings(key,value) VALUES (?,?)", "currency", "IDR");
  db.runSync("INSERT OR REPLACE INTO settings(key,value) VALUES (?,?)", "locale", "id-ID");
  db.runSync("INSERT OR REPLACE INTO settings(key,value) VALUES (?,?)", "profile_name", "Pengguna SiMamang");

  const accountIds: Record<string, number> = {};
  const accSeed: Array<[string, string, number, string, string, string | null]> = [
    ["Dompet Tunai", "cash", 500_000, "#22c55e", "wallet", "Uang tunai harian"],
    ["Bank BCA", "bank", 12_500_000, "#2563eb", "landmark", "Rekening tabungan utama"],
    ["GoPay", "ewallet", 350_000, "#0ea5e9", "smartphone", "E-wallet transportasi"],
    ["Kartu Kredit Visa", "credit", -1_800_000, "#ef4444", "credit-card", "Limit Rp 15jt"],
    ["Reksadana Bibit", "investment", 8_200_000, "#a855f7", "trending-up", "Portofolio pasar uang & saham"],
  ];
  for (const [name, type, opening, color, icon, note] of accSeed) {
    const r = db.runSync(
      "INSERT INTO accounts (name,type,currency,opening_balance,color,icon,note) VALUES (?,?,?,?,?,?,?)",
      name, type, "IDR", opening, color, icon, note,
    );
    accountIds[name] = Number(r.lastInsertRowId);
  }

  const categoryIds: Record<string, number> = {};
  const catSeed: Array<[string, "income" | "expense", string, string]> = [
    ["Gaji", "income", "briefcase", "#16a34a"],
    ["Bonus", "income", "gift", "#22c55e"],
    ["Freelance", "income", "laptop", "#059669"],
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
    ["Lain-lain", "expense", "more-horizontal", "#94a3b8"],
  ];
  for (const [name, kind, icon, color] of catSeed) {
    const r = db.runSync(
      "INSERT INTO categories (name,kind,icon,color) VALUES (?,?,?,?)",
      name, kind, icon, color,
    );
    categoryIds[name] = Number(r.lastInsertRowId);
  }

  const now = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 19).replace("T", " ");
  const daysAgo = (n: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - n);
    return d;
  };
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 9, 0, 0);
  const midOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    Math.min(15, Math.max(2, now.getDate() - 3)),
    10,
    30,
    0,
  );

  const tx: Array<[string, number, number, number | null, number | null, Date, string, string | null]> = [
    ["income",   12_500_000, accountIds["Bank BCA"], null, categoryIds["Gaji"], firstOfMonth, "Gaji bulan ini", "rutin,gaji"],
    ["income",   1_500_000,  accountIds["Bank BCA"], null, categoryIds["Freelance"], midOfMonth, "Proyek website UMKM", "freelance"],
    ["income",   850_000,    accountIds["GoPay"],    null, categoryIds["Bonus"], daysAgo(2), "Bonus kinerja", "bonus"],
    ["income",   8_500_000,  accountIds["Bank BCA"], null, categoryIds["Gaji"], daysAgo(35), "Gaji bulan lalu", "rutin,gaji"],
    ["expense",  45_000,     accountIds["GoPay"],    null, categoryIds["Makanan & Minuman"], daysAgo(1), "Makan siang warteg", "makan"],
    ["expense",  120_000,    accountIds["Bank BCA"], null, categoryIds["Belanja Kebutuhan"], daysAgo(2), "Belanja bulanan pasar", "belanja"],
    ["expense",  1_500_000,  accountIds["Bank BCA"], null, categoryIds["Tagihan & Utilitas"], daysAgo(5), "Listrik, air, internet", "tagihan,rutin"],
    ["expense",  3_500_000,  accountIds["Bank BCA"], null, categoryIds["Rumah & Sewa"], daysAgo(6), "Sewa kos bulanan", "rumah"],
    ["expense",  250_000,    accountIds["GoPay"],    null, categoryIds["Transportasi"], daysAgo(3), "Ojek online mingguan", "transport"],
    ["expense",  89_000,     accountIds["Kartu Kredit Visa"], null, categoryIds["Hiburan"], daysAgo(7), "Langganan streaming", "hiburan,rutin"],
    ["expense",  250_000,    accountIds["Bank BCA"], null, categoryIds["Sosial & Donasi"], daysAgo(10), "Infaq masjid", "sosial"],
    ["transfer", 2_000_000,  accountIds["Bank BCA"], accountIds["Reksadana Bibit"], null, daysAgo(4), "Investasi bulanan", "investasi"],
    ["transfer", 200_000,    accountIds["Bank BCA"], accountIds["GoPay"], null, daysAgo(8), "Top-up e-wallet", "topup"],
    ["expense",  320_000,    accountIds["Kartu Kredit Visa"], null, categoryIds["Kesehatan"], daysAgo(12), "Vitamin & suplemen", "kesehatan"],
    ["expense",  1_100_000,  accountIds["Bank BCA"], null, categoryIds["Pendidikan"], daysAgo(15), "Kursus online", "belajar"],
  ];
  for (const [type, amount, acc, toAcc, cat, when, note, tags] of tx) {
    db.runSync(
      "INSERT INTO transactions (type,amount,account_id,to_account_id,category_id,occurred_at,note,tags) VALUES (?,?,?,?,?,?,?,?)",
      type, amount, acc, toAcc, cat, iso(when), note, tags,
    );
  }

  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const budgets: Array<[number, number, string]> = [
    [categoryIds["Makanan & Minuman"], 2_000_000, "Batas makan luar"],
    [categoryIds["Transportasi"], 800_000, "Termasuk BBM & ojek"],
    [categoryIds["Belanja Kebutuhan"], 1_500_000, "Belanja bulanan"],
    [categoryIds["Hiburan"], 500_000, "Langganan & tontonan"],
    [categoryIds["Tagihan & Utilitas"], 1_800_000, "Rutin"],
    [categoryIds["Rumah & Sewa"], 3_500_000, "Sewa kos"],
  ];
  for (const [catId, amount, note] of budgets) {
    db.runSync(
      "INSERT OR REPLACE INTO budgets (category_id,month,amount,note) VALUES (?,?,?,?)",
      catId, ym, amount, note,
    );
  }

  const inYear = (m: number, d: number) => new Date(now.getFullYear() + (now.getMonth() + m >= 12 ? 1 : 0), (now.getMonth() + m) % 12, d).toISOString().slice(0, 10);
  db.runSync(
    "INSERT INTO goals (name,target_amount,saved_amount,deadline,account_id,color,icon,note) VALUES (?,?,?,?,?,?,?,?)",
    "Dana Darurat 6 Bulan", 36_000_000, 8_200_000, inYear(12, 30), accountIds["Reksadana Bibit"], "#22c55e", "shield", "Setara 6× pengeluaran bulanan",
  );
  db.runSync(
    "INSERT INTO goals (name,target_amount,saved_amount,deadline,account_id,color,icon,note) VALUES (?,?,?,?,?,?,?,?)",
    "Liburan Bali", 8_000_000, 1_200_000, inYear(6, 1), accountIds["Bank BCA"], "#0ea5e9", "plane", "Untuk 5 hari 4 malam",
  );
  db.runSync(
    "INSERT INTO goals (name,target_amount,saved_amount,deadline,account_id,color,icon,note) VALUES (?,?,?,?,?,?,?,?)",
    "DP Motor Baru", 15_000_000, 3_500_000, inYear(10, 15), accountIds["Bank BCA"], "#f59e0b", "bike", "DP 30%",
  );

  db.runSync(
    "INSERT INTO debts (kind,party,amount,paid,due_date,note) VALUES (?,?,?,?,?,?)",
    "hutang", "Andi", 500_000, 200_000, inYear(1, 10), "Pinjam untuk service motor",
  );
  db.runSync(
    "INSERT INTO debts (kind,party,amount,paid,due_date,note) VALUES (?,?,?,?,?,?)",
    "piutang", "Budi", 750_000, 0, inYear(1, 20), "Talangin tiket konser",
  );
  db.runSync(
    "INSERT INTO debts (kind,party,amount,paid,due_date,note) VALUES (?,?,?,?,?,?)",
    "hutang", "Cicilan Laptop", 4_500_000, 1_500_000, inYear(3, 1), "3× cicilan sisa",
  );
}

export function resetDatabase() {
  const db = getDb();
  db.execSync(`
    DELETE FROM transactions;
    DELETE FROM budgets;
    DELETE FROM goals;
    DELETE FROM debts;
    DELETE FROM categories;
    DELETE FROM accounts;
    DELETE FROM settings;
    DELETE FROM sqlite_sequence WHERE name IN ('transactions','budgets','goals','debts','categories','accounts');
  `);
  seedIfEmpty(db);
}
