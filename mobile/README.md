# SiMamang Mobile (iOS & Android)

Versi native dari SiMamang, dibangun dengan **Expo (React Native)** dan **expo-sqlite**.
Aplikasi bekerja 100% offline — semua data tersimpan di perangkat dengan SQLite,
sama seperti versi web.

## Fitur

- Dashboard: kekayaan bersih, KPI bulanan, grafik arus kas 6 bulan, distribusi
  pengeluaran per kategori, daftar rekening, transaksi terbaru, ringkasan
  anggaran, target, hutang/piutang.
- Transaksi: list per hari dengan subtotal, filter tipe & pencarian, CRUD lengkap
  termasuk transfer antar rekening.
- Anggaran per kategori per bulan dengan progress bar.
- Rekening: multi akun (tunai, bank, e-wallet, kartu kredit, investasi).
- Kategori: ikon & warna kustom.
- Target keuangan dengan tombol "Menabung" cepat.
- Hutang & piutang dengan pembayaran bertahap.
- Pengaturan: profil, mata uang, ekspor JSON (share), reset data.

## Prasyarat

- Node.js ≥ 18
- Untuk build IPA/APK produksi: akun Expo & EAS CLI (`npm install -g eas-cli`)

## Menjalankan Development (iOS/Android)

```bash
cd mobile
npm install
npx expo start
```

Kemudian:

- **iOS**: pasang **Expo Go** dari App Store, buka kamera, pindai QR — instan.
- **Android**: pasang **Expo Go** dari Play Store, pindai QR dari dalam aplikasi.
- **Simulator/Emulator**: tekan `i` (iOS Simulator, butuh Xcode di macOS) atau
  `a` (Android Emulator).

## Build Distribusi

Konfigurasi EAS Build sudah disediakan di [`eas.json`](./eas.json).

### Preview / Internal (paling cepat, tanpa App Store)

```bash
# Login sekali saja
eas login
eas whoami

# Android APK yang bisa langsung dipasang
eas build --platform android --profile preview

# iOS untuk simulator (tanpa Developer Account)
eas build --platform ios --profile preview

# Keduanya sekaligus
eas build --platform all --profile preview
```

Hasil build otomatis diunggah ke dashboard Expo dan tautan unduhannya dikirim ke
email/akun Expo Anda.

### Distribusi ke App Store / Play Store

```bash
eas build --platform ios --profile production
eas build --platform android --profile production

eas submit --platform ios
eas submit --platform android
```

Butuh akun Apple Developer ($99/tahun) dan/atau Google Play Console ($25 sekali).

## Skema Data

Sama persis dengan versi web (lihat `/src/lib/db.ts`), sehingga cadangan JSON
kompatibel dua arah. Anda bisa ekspor dari web app → paste ke mobile (fitur
import akan ditambahkan setelah struktur di-freeze).

## Reset Konfigurasi EAS Project ID

`app.json` berisi placeholder `extra.eas.projectId`. Setelah menjalankan
`eas init` pertama kali, ID asli akan otomatis diisi.

## Struktur

```
mobile/
├── app/                         # expo-router (file-based routing)
│   ├── _layout.tsx              # Stack root
│   ├── (tabs)/                  # bottom tabs
│   │   ├── _layout.tsx
│   │   ├── index.tsx            # Dashboard
│   │   ├── transaksi.tsx        # Transaksi list
│   │   ├── anggaran.tsx         # Anggaran
│   │   └── lainnya/             # Rekening/Kategori/Target/Hutang/Pengaturan
│   ├── transaksi/{baru,[id]}.tsx
│   ├── rekening/{baru,[id]}.tsx
│   ├── kategori/baru.tsx
│   ├── target/{baru,[id]}.tsx
│   ├── hutang/baru.tsx
│   └── anggaran/set.tsx
├── src/
│   ├── lib/{db,queries,types,format}.ts
│   ├── components/{Card,Button,Input,Chip,ProgressBar,Empty,Icon,...}.tsx
│   └── theme.ts
├── assets/                      # ikon & splash
├── app.json                     # Expo config
├── eas.json                     # EAS build profiles
└── tsconfig.json
```

## Lisensi

MIT © SiMamang
