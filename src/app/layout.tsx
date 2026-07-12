import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Sidebar } from "@/components/shell/sidebar";
import { Topbar } from "@/components/shell/topbar";
import { getSetting } from "@/lib/queries";

export const metadata: Metadata = {
  title: "SiMamang — Aplikasi Pencatatan Keuangan",
  description:
    "Aplikasi pencatatan keuangan pribadi yang detail: transaksi, anggaran, target, hutang-piutang, laporan, dan lainnya.",
};

export const viewport: Viewport = {
  themeColor: "#28a668",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const profile = getSetting("profile_name", "Pengguna SiMamang");
  return (
    <html lang="id">
      <body>
        <div className="min-h-screen flex">
          <Sidebar />
          <div className="flex-1 min-w-0 flex flex-col">
            <Topbar profile={profile} />
            <main className="flex-1 min-w-0">
              <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6">
                {children}
              </div>
            </main>
            <footer className="border-t border-surface-200 py-4 text-center text-xs text-surface-500">
              SiMamang · Pencatatan Keuangan Detail · Data disimpan lokal di SQLite
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
