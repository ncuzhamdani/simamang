"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Tag,
  PiggyBank,
  Target,
  Handshake,
  Repeat2,
  BarChart3,
  Settings,
  Menu,
  X,
  Download,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useState } from "react";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transaksi", label: "Transaksi", icon: ArrowLeftRight },
  { href: "/rekening", label: "Rekening", icon: Wallet },
  { href: "/kategori", label: "Kategori", icon: Tag },
  { href: "/anggaran", label: "Anggaran", icon: PiggyBank },
  { href: "/target", label: "Target Keuangan", icon: Target },
  { href: "/hutang", label: "Hutang & Piutang", icon: Handshake },
  { href: "/berulang", label: "Transaksi Berulang", icon: Repeat2 },
  { href: "/laporan", label: "Laporan", icon: BarChart3 },
  { href: "/unduh", label: "Unduh Aplikasi", icon: Download },
  { href: "/pengaturan", label: "Pengaturan", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-40 rounded-lg bg-white border border-surface-200 p-2 shadow-card"
        aria-label="Buka menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "fixed lg:sticky top-0 z-50 h-screen w-72 bg-white border-r border-surface-200 flex flex-col transition-transform",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex items-center justify-between px-4 pt-5 pb-3">
          <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <div className="h-9 w-9 rounded-xl bg-brand-600 text-white grid place-items-center font-bold">
              Rp
            </div>
            <div className="leading-tight">
              <div className="font-semibold">SiMamang</div>
              <div className="text-[11px] text-surface-500">Pencatatan Keuangan</div>
            </div>
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden rounded-md p-1 hover:bg-surface-100"
            aria-label="Tutup menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-2 px-2 flex-1 overflow-y-auto">
          <ul className="space-y-0.5">
            {NAV.map((n) => {
              const Icon = n.icon;
              const active = isActive(n.href);
              return (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      active
                        ? "bg-brand-50 text-brand-700 font-medium"
                        : "text-surface-700 hover:bg-surface-100",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4",
                        active ? "text-brand-600" : "text-surface-500 group-hover:text-surface-700",
                      )}
                    />
                    <span>{n.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-surface-100 text-[11px] text-surface-500">
          <div className="rounded-lg bg-surface-50 border border-surface-200 p-3">
            <div className="font-medium text-surface-700">Tips</div>
            Klik tombol <span className="kbd">+ Transaksi</span> untuk mencatat cepat pemasukan atau
            pengeluaran.
          </div>
        </div>
      </aside>
    </>
  );
}
