import Link from "next/link";
import {
  Apple,
  Smartphone,
  Monitor,
  Download,
  Github,
  Wifi,
  Share,
  Plus,
  Code2,
  Package,
} from "lucide-react";
import { PageHeader, Card } from "@/components/ui/section";
import { InstallButton } from "@/components/downloads/install-button";
import { QrBlock } from "@/components/downloads/qr";

export const dynamic = "force-static";

export const metadata = {
  title: "Unduh — SiMamang",
  description:
    "Cara memasang SiMamang di iPhone, Android, atau desktop, serta unduh aplikasi native iOS/Android.",
};

export default function UnduhPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Unduh & Pasang SiMamang"
        description="Pilih cara yang paling cocok untuk Anda — semua opsi tetap menyimpan data di perangkat Anda sendiri."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card
          title="Web App (PWA)"
          description="Tercepat & tanpa app store."
          actions={<Wifi className="h-4 w-4 text-surface-400" />}
        >
          <p className="text-sm text-surface-600">
            SiMamang adalah <b>Progressive Web App</b>. Anda bisa memasangnya langsung
            dari browser ke home screen — muncul seperti aplikasi asli, bekerja
            offline setelah dimuat, tanpa perlu app store.
          </p>
          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-surface-200 p-3">
              <div className="flex items-center gap-2 font-medium text-sm">
                <Apple className="h-4 w-4" /> iPhone / iPad (Safari)
              </div>
              <ol className="mt-2 text-sm text-surface-600 space-y-1 list-decimal list-inside">
                <li>Buka SiMamang di <b>Safari</b>.</li>
                <li>
                  Ketuk tombol <Share className="inline h-4 w-4 align-text-bottom" /> <b>Bagikan</b>.
                </li>
                <li>
                  Pilih <b>"Tambah ke Layar Utama"</b> (Add to Home Screen).
                </li>
                <li>Ketuk <b>Tambah</b> di kanan atas.</li>
              </ol>
            </div>
            <div className="rounded-xl border border-surface-200 p-3">
              <div className="flex items-center gap-2 font-medium text-sm">
                <Smartphone className="h-4 w-4" /> Android (Chrome)
              </div>
              <ol className="mt-2 text-sm text-surface-600 space-y-1 list-decimal list-inside">
                <li>Buka SiMamang di <b>Chrome</b>.</li>
                <li>
                  Ketuk menu <b>⋮</b> → <b>"Install app"</b> / <b>"Tambahkan ke layar utama"</b>.
                </li>
                <li>Ikon aplikasi akan muncul di home screen.</li>
              </ol>
            </div>
            <div className="rounded-xl border border-surface-200 p-3">
              <div className="flex items-center gap-2 font-medium text-sm">
                <Monitor className="h-4 w-4" /> Desktop (Chrome/Edge)
              </div>
              <p className="mt-2 text-sm text-surface-600">
                Ketuk ikon <Plus className="inline h-4 w-4 align-text-bottom" /> "Install" di
                pojok kanan address bar, atau klik tombol berikut:
              </p>
              <div className="mt-2">
                <InstallButton />
              </div>
            </div>
          </div>
        </Card>

        <Card
          title="Aplikasi iOS Native"
          description="React Native + Expo, data lokal via SQLite."
          actions={<Apple className="h-4 w-4 text-surface-400" />}
        >
          <p className="text-sm text-surface-600">
            Kode sumber aplikasi iOS/Android tersedia di folder{" "}
            <code className="rounded bg-surface-100 px-1.5 py-0.5">mobile/</code>. Aplikasi
            dibangun dengan <b>Expo (React Native)</b> dan bekerja sepenuhnya offline
            dengan SQLite.
          </p>
          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-surface-200 p-3">
              <div className="font-medium text-sm">Cara 1: Uji langsung via Expo Go</div>
              <ol className="mt-2 text-sm text-surface-600 space-y-1 list-decimal list-inside">
                <li>
                  Pasang <b>Expo Go</b> gratis dari App Store / Play Store.
                </li>
                <li>
                  <span className="font-mono">cd mobile && npm install</span>
                </li>
                <li>
                  <span className="font-mono">npx expo start</span>
                </li>
                <li>Pindai QR code yang muncul dengan kamera iPhone / Expo Go Android.</li>
              </ol>
            </div>
            <div className="rounded-xl border border-surface-200 p-3">
              <div className="font-medium text-sm">Cara 2: Build IPA/APK via EAS Build</div>
              <ol className="mt-2 text-sm text-surface-600 space-y-1 list-decimal list-inside">
                <li>
                  <span className="font-mono">npm install -g eas-cli</span>
                </li>
                <li>
                  <span className="font-mono">cd mobile && eas login</span>
                </li>
                <li>
                  iOS: <span className="font-mono">eas build --platform ios --profile preview</span>
                  <br />
                  Android:{" "}
                  <span className="font-mono">eas build --platform android --profile preview</span>
                </li>
                <li>Unduh file .ipa/.apk dari dashboard Expo dan pasang di perangkat.</li>
              </ol>
              <p className="mt-2 text-[11px] text-surface-500">
                Build iOS memerlukan akun Apple Developer. Build Android APK gratis.
              </p>
            </div>
          </div>
        </Card>

        <Card
          title="Kode Sumber"
          description="Fork, self-host, atau modifikasi."
          actions={<Code2 className="h-4 w-4 text-surface-400" />}
        >
          <p className="text-sm text-surface-600">
            Seluruh kode aplikasi web dan mobile bersifat terbuka. Anda dapat
            meng-<i>host</i>-nya sendiri, memodifikasi, dan mendistribusikan sesuai kebutuhan.
          </p>
          <div className="mt-4 space-y-3">
            <a
              href="https://github.com/ncuzhamdani/simamang"
              target="_blank"
              rel="noopener"
              className="btn-secondary w-full justify-center"
            >
              <Github className="h-4 w-4" /> Repositori GitHub
            </a>
            <a
              href="https://github.com/ncuzhamdani/simamang/archive/refs/heads/main.zip"
              className="btn-primary w-full justify-center"
            >
              <Download className="h-4 w-4" /> Unduh ZIP (main)
            </a>
            <a
              href="https://github.com/ncuzhamdani/simamang/releases"
              target="_blank"
              rel="noopener"
              className="btn-secondary w-full justify-center"
            >
              <Package className="h-4 w-4" /> Rilis (release) resmi
            </a>
          </div>
          <div className="mt-4 rounded-xl bg-surface-50 border border-surface-200 p-3 text-xs text-surface-600">
            <div className="font-medium text-surface-700 mb-1">Sekilas teknologi</div>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Web: Next.js 14, Tailwind, better-sqlite3</li>
              <li>Mobile: Expo (React Native), expo-sqlite</li>
              <li>Bahasa: TypeScript · Lisensi: MIT</li>
            </ul>
          </div>
        </Card>
      </div>

      <Card
        title="Instalasi Instan"
        description="Pindai QR untuk membuka SiMamang di ponsel Anda dan langsung 'Add to Home Screen'."
      >
        <QrBlock />
      </Card>

      <Card
        title="FAQ Singkat"
        description="Pertanyaan yang sering muncul seputar instalasi & penyimpanan data."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FAQ
            q="Apakah data saya dikirim ke internet?"
            a="Tidak. Baik PWA maupun aplikasi native menyimpan semua data hanya di perangkat Anda menggunakan SQLite lokal."
          />
          <FAQ
            q="Kalau saya reset browser / uninstall PWA, apakah data hilang?"
            a="Data web app tersimpan di server (mode self-host). Untuk mode PWA offline dengan penyimpanan lokal, gunakan aplikasi native yang punya penyimpanan permanen. Selalu ekspor cadangan dari halaman Pengaturan."
          />
          <FAQ
            q="Bisakah dipakai offline?"
            a="PWA menyimpan aset UI di cache sehingga halaman tetap terbuka tanpa internet. Aplikasi native 100% offline — SQLite jalan di perangkat."
          />
          <FAQ
            q="Apakah gratis?"
            a="Ya, seluruh source code dirilis dengan lisensi MIT. Anda bebas memakai, memodifikasi, dan mendistribusikan."
          />
        </div>
      </Card>

      <div className="text-center text-sm text-surface-500">
        Butuh bantuan?{" "}
        <Link href="/pengaturan" className="text-brand-700 hover:underline">
          Buka Pengaturan
        </Link>{" "}
        untuk ekspor / backup data Anda.
      </div>
    </div>
  );
}

function FAQ({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-xl border border-surface-200 p-4">
      <div className="text-sm font-medium">{q}</div>
      <div className="text-sm text-surface-600 mt-1">{a}</div>
    </div>
  );
}
