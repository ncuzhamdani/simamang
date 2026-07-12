import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Sidebar } from "@/components/shell/sidebar";
import { Topbar } from "@/components/shell/topbar";
import { RegisterSW } from "@/components/shell/register-sw";
import { getSetting } from "@/lib/queries";

export const metadata: Metadata = {
  title: "SiMamang — Aplikasi Pencatatan Keuangan",
  description:
    "Aplikasi pencatatan keuangan pribadi yang detail: transaksi, anggaran, target, hutang-piutang, laporan, dan lainnya.",
  applicationName: "SiMamang",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SiMamang",
  },
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180" },
      { url: "/icons/apple-touch-icon-167.png", sizes: "167x167" },
      { url: "/icons/apple-touch-icon-152.png", sizes: "152x152" },
      { url: "/icons/apple-touch-icon-120.png", sizes: "120x120" },
    ],
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#28a668" },
    { media: "(prefers-color-scheme: dark)", color: "#0f4530" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const profile = getSetting("profile_name", "Pengguna SiMamang");
  return (
    <html lang="id">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SiMamang" />
        <meta name="format-detection" content="telephone=no" />
      </head>
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
        <RegisterSW />
      </body>
    </html>
  );
}
