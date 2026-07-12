import { PageHeader, Card } from "@/components/ui/section";
import { getSettings } from "@/lib/queries";
import {
  exportAllDataAction,
  resetAllDataAction,
  saveSettingsAction,
} from "@/app/actions/settings";
import { ExportButton } from "@/components/settings/export";
import { ConfirmButton } from "@/components/ui/confirm-button";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  const s = getSettings();

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Pengaturan"
        description="Personalisasi mata uang, profil, dan kelola data Anda."
      />

      <Card title="Profil & Format">
        <form action={saveSettingsAction} className="space-y-4">
          <div>
            <label className="label">Nama Pengguna</label>
            <input
              className="input"
              name="profile_name"
              defaultValue={s.profile_name ?? ""}
              placeholder="mis. Budi"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Mata Uang</label>
              <select className="input" name="currency" defaultValue={s.currency ?? "IDR"}>
                <option value="IDR">IDR — Rupiah</option>
                <option value="USD">USD — US Dollar</option>
                <option value="EUR">EUR — Euro</option>
                <option value="SGD">SGD — Singapore Dollar</option>
                <option value="MYR">MYR — Malaysian Ringgit</option>
                <option value="JPY">JPY — Japanese Yen</option>
              </select>
            </div>
            <div>
              <label className="label">Locale</label>
              <select className="input" name="locale" defaultValue={s.locale ?? "id-ID"}>
                <option value="id-ID">Bahasa Indonesia (id-ID)</option>
                <option value="en-US">English (en-US)</option>
              </select>
            </div>
          </div>
          <button className="btn-primary" type="submit">
            Simpan Pengaturan
          </button>
        </form>
      </Card>

      <Card title="Backup / Ekspor Data" description="Unduh cadangan data sebagai file JSON.">
        <ExportButton exportFn={exportAllDataAction} />
      </Card>

      <Card
        title="Zona Berbahaya"
        description="Hapus seluruh data dan mulai dari nol."
      >
        <ResetForm />
      </Card>
    </div>
  );
}

function ResetForm() {
  const reset = async () => {
    "use server";
    await resetAllDataAction();
  };
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm font-medium">Reset semua data</div>
        <div className="text-xs text-surface-500">
          Akun, transaksi, anggaran, target, hutang-piutang, dan pengaturan akan dihapus. Data
          contoh akan dibuat ulang.
        </div>
      </div>
      <ConfirmButton
        className="btn-danger"
        confirm="Yakin ingin menghapus SEMUA data? Tindakan ini tidak dapat dibatalkan."
        action={reset}
      >
        Reset Data
      </ConfirmButton>
    </div>
  );
}
