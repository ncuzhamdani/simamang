import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon } from "../../../src/components/Icon";
import { Card } from "../../../src/components/Card";
import { colors, radius, spacing } from "../../../src/theme";

const ITEMS: Array<{ label: string; hint: string; icon: string; color: string; href: any }> = [
  { label: "Rekening", hint: "Kelola akun & saldo", icon: "wallet", color: "#2563eb", href: "/lainnya/rekening" },
  { label: "Kategori", hint: "Pemasukan & pengeluaran", icon: "tag", color: "#f59e0b", href: "/lainnya/kategori" },
  { label: "Target Keuangan", hint: "Rancang tujuan menabung", icon: "target", color: "#22c55e", href: "/lainnya/target" },
  { label: "Hutang & Piutang", hint: "Catat kewajiban", icon: "handshake", color: "#ef4444", href: "/lainnya/hutang" },
  { label: "Pengaturan", hint: "Profil, mata uang, backup", icon: "settings", color: "#64748b", href: "/lainnya/pengaturan" },
];

export default function LainnyaHome() {
  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        <Card>
          <View style={{ gap: 8 }}>
            {ITEMS.map((it) => (
              <Pressable
                key={it.label}
                onPress={() => router.push(it.href)}
                style={styles.row}
              >
                <View style={[styles.icon, { backgroundColor: it.color }]}>
                  <Icon name={it.icon} size={16} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "600", color: colors.text }}>{it.label}</Text>
                  <Text style={{ fontSize: 12, color: colors.muted }}>{it.hint}</Text>
                </View>
                <Icon name="chevron-right" size={18} color={colors.muted} />
              </Pressable>
            ))}
          </View>
        </Card>

        <View style={{ alignItems: "center", paddingVertical: 20 }}>
          <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: colors.brand[600], alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: 22 }}>Rp</Text>
          </View>
          <Text style={{ fontWeight: "700", marginTop: 8 }}>SiMamang</Text>
          <Text style={{ fontSize: 12, color: colors.muted }}>Aplikasi Pencatatan Keuangan · v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: radius.lg,
  },
  icon: {
    width: 36, height: 36, borderRadius: radius.md,
    alignItems: "center", justifyContent: "center",
  },
});
