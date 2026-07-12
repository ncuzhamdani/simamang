# SiMamang — Aplikasi Pencatatan Keuangan Pribadi

**SiMamang** (Sistem Manajemen Anggaran) adalah aplikasi web pencatatan keuangan pribadi yang
sangat detail, dibangun dengan Next.js 14, TypeScript, Tailwind CSS, dan SQLite lokal
(`better-sqlite3`). Semua data disimpan di dalam file `data/simamang.db` — tidak butuh
server database eksternal, tidak butuh cloud.

## Fitur Utama

- **Dashboard** — Ringkasan kekayaan bersih, arus kas, pemasukan, pengeluaran, rasio menabung,
  distribusi kategori, aktivitas harian, jadwal transaksi berulang, hutang & piutang, serta
  progres target keuangan bulan berjalan.
- **Transaksi** — Catat pemasukan, pengeluaran, dan transfer antar rekening dengan
  kategori, tag, catatan, dan filter berdasar bulan/tipe/kategori/rekening/pencarian.
- **Rekening** — Kelola banyak rekening (tunai, bank, e-wallet, kartu kredit, investasi)
  lengkap dengan warna, ikon, saldo awal, dan arsip.
- **Kategori** — Daftar kategori pemasukan & pengeluaran yang bisa dikustomisasi warna dan
  ikonnya.
- **Anggaran** — Tetapkan batas pengeluaran per kategori per bulan, pantau progresnya
  dengan progress bar dan peringatan bila melewati batas.
- **Target Keuangan** — Rancang goal menabung (dana darurat, liburan, DP kendaraan, dll)
  dengan target nominal, deadline, dan tombol "menabung" untuk update cepat.
- **Hutang & Piutang** — Catat siapa berhutang kepada siapa, jatuh tempo, bayar cicilan,
  dan tandai lunas.
- **Transaksi Berulang** — Jadwalkan transaksi rutin (harian/mingguan/bulanan/tahunan) dan
  jalankan sekali klik untuk mencatat instance transaksinya.
- **Laporan** — Perbandingan 12 bulan (income/expense/net), pola harian, distribusi
  kategori pemasukan & pengeluaran dengan persentase rinci.
- **Pengaturan** — Nama profil, mata uang, locale, ekspor seluruh data ke JSON, reset
  data.

## Teknologi

| Layer            | Teknologi                                  |
| ---------------- | ------------------------------------------ |
| Framework        | Next.js 14 (App Router) + React 18         |
| Bahasa           | TypeScript                                 |
| Styling          | Tailwind CSS 3                             |
| Ikon             | lucide-react                               |
| Chart            | recharts                                   |
| Database         | SQLite (better-sqlite3, WAL mode)          |
| Validasi         | zod                                        |

## Menjalankan Aplikasi

Prasyarat: Node.js ≥ 18.18 dan build tools untuk kompilasi `better-sqlite3`.

```bash
npm install
npm run dev
# buka http://localhost:3000
```

Build produksi:

```bash
npm run build
npm start
```

Saat pertama kali dijalankan, database `data/simamang.db` akan dibuat otomatis dan diisi
data contoh (beberapa rekening, kategori, transaksi 1 bulan terakhir, anggaran, target,
hutang & piutang, serta jadwal transaksi berulang) sehingga aplikasi langsung terasa "hidup".

Untuk memulai dari nol, buka menu **Pengaturan → Zona Berbahaya → Reset Data** (atau hapus
file `data/simamang.db*`).

## Struktur Direktori

```
src/
├── app/
│   ├── page.tsx                    # Dashboard
│   ├── transaksi/                  # Halaman transaksi (list, tambah, edit)
│   ├── rekening/                   # Halaman rekening
│   ├── kategori/                   # Halaman kategori
│   ├── anggaran/                   # Halaman anggaran
│   ├── target/                     # Halaman target keuangan
│   ├── hutang/                     # Halaman hutang & piutang
│   ├── berulang/                   # Transaksi berulang
│   ├── laporan/                    # Laporan
│   ├── pengaturan/                 # Pengaturan aplikasi
│   ├── actions/                    # Server actions (CRUD)
│   ├── globals.css                 # Tailwind + tema
│   └── layout.tsx                  # Layout global + Sidebar/Topbar
├── components/
│   ├── shell/                      # Sidebar & topbar
│   ├── ui/                         # Section, Stat, Empty, Icon, ConfirmButton
│   ├── forms/                      # Form-form CRUD
│   ├── charts.tsx                  # Chart-chart Recharts
│   ├── goals/                      # Widget goal contribution
│   ├── debts/                      # Widget bayar hutang
│   └── settings/                   # Widget ekspor data
└── lib/
    ├── db.ts                       # Koneksi SQLite + migrasi + seeding
    ├── queries.ts                  # Query & agregasi baca database
    ├── types.ts                    # Tipe data domain
    ├── format.ts                   # Format tanggal & mata uang (IDR default)
    └── cn.ts                       # Utilitas className
```

## Penyimpanan Data

File database SQLite (`data/simamang.db`) beserta file WAL/SHM otomatis diabaikan Git.
Anda bisa menyalinnya untuk mem-backup manual, atau gunakan tombol **Unduh JSON** di halaman
Pengaturan untuk cadangan yang lebih portable.

## Lisensi

MIT © SiMamang
