"use client";

import Link from "next/link";
import { Plus, Search } from "lucide-react";

export function Topbar({ profile }: { profile: string }) {
  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-white/80 border-b border-surface-200">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 h-14 flex items-center gap-3">
        <div className="lg:hidden w-10" />
        <div className="hidden sm:flex items-center gap-2 flex-1 max-w-lg">
          <div className="relative w-full">
            <Search className="h-4 w-4 text-surface-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <form action="/transaksi" method="get">
              <input
                name="q"
                placeholder="Cari catatan, tag, keterangan..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-surface-200 bg-surface-50 text-sm placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:bg-white"
              />
            </form>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/transaksi/baru" className="btn-primary">
            <Plus className="h-4 w-4" /> Transaksi
          </Link>
          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-surface-200 ml-1">
            <div className="h-8 w-8 rounded-full bg-brand-100 text-brand-700 grid place-items-center text-sm font-semibold">
              {profile.slice(0, 1).toUpperCase()}
            </div>
            <div className="text-sm font-medium hidden md:block">{profile}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
