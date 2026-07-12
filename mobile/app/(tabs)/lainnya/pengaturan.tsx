import React, { useState } from "react";
import { Alert, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../../../src/components/Card";
import { Button } from "../../../src/components/Button";
import { Input } from "../../../src/components/Input";
import { colors, spacing } from "../../../src/theme";
import { exportAllJson, getSetting, setSetting } from "../../../src/lib/queries";
import { resetDatabase } from "../../../src/lib/db";

export default function PengaturanScreen() {
  const [profile, setProfile] = useState(getSetting("profile_name", "Pengguna SiMamang"));
  const [currency, setCurrency] = useState(getSetting("currency", "IDR"));

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        <Card title="Profil">
          <Input label="Nama Pengguna" value={profile} onChangeText={setProfile} />
          <Input label="Mata Uang (kode)" value={currency} onChangeText={setCurrency} autoCapitalize="characters" />
          <Button
            onPress={() => {
              setSetting("profile_name", profile);
              setSetting("currency", currency.toUpperCase());
              Alert.alert("Tersimpan", "Pengaturan berhasil disimpan.");
            }}
          >
            Simpan
          </Button>
        </Card>

        <Card title="Backup / Ekspor" description="Bagikan file JSON berisi seluruh data Anda.">
          <Button
            onPress={async () => {
              try {
                const json = exportAllJson();
                await Share.share({ message: json, title: "SiMamang Backup" });
              } catch (e: any) {
                Alert.alert("Gagal", e?.message ?? "Tidak dapat membagikan data.");
              }
            }}
          >
            Bagikan Cadangan (JSON)
          </Button>
        </Card>

        <Card title="Zona Berbahaya" description="Menghapus seluruh data dan mengembalikan data contoh.">
          <Button
            variant="danger"
            onPress={() =>
              Alert.alert(
                "Reset semua data?",
                "Tindakan ini tidak dapat dibatalkan. Ekspor data terlebih dahulu jika perlu.",
                [
                  { text: "Batal", style: "cancel" },
                  {
                    text: "Reset",
                    style: "destructive",
                    onPress: () => {
                      resetDatabase();
                      Alert.alert("Selesai", "Data telah direset ke bawaan.");
                    },
                  },
                ],
              )
            }
          >
            Reset Data
          </Button>
        </Card>

        <View style={styles.about}>
          <Text style={{ fontWeight: "700" }}>SiMamang Mobile</Text>
          <Text style={{ fontSize: 12, color: colors.muted, textAlign: "center", marginTop: 4 }}>
            Versi 1.0.0 · React Native · Expo{"\n"}
            Data 100% tersimpan di perangkat Anda menggunakan SQLite.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  about: { alignItems: "center", paddingVertical: 20 },
});
