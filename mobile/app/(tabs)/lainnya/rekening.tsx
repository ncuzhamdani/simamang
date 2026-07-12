import React, { useCallback, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../../../src/components/Card";
import { Icon } from "../../../src/components/Icon";
import { Button } from "../../../src/components/Button";
import { Empty } from "../../../src/components/Empty";
import { colors, radius, spacing, ACCOUNT_TYPE_LABEL } from "../../../src/theme";
import { formatCurrency } from "../../../src/lib/format";
import { deleteAccount, listAccountsWithBalances, toggleArchiveAccount, totalNetWorth } from "../../../src/lib/queries";

export default function RekeningScreen() {
  const [tick, setTick] = useState(0);
  useFocusEffect(useCallback(() => { setTick((t) => t + 1); }, []));

  const rows = useMemo(() => listAccountsWithBalances(true), [tick]);
  const active = rows.filter((r) => !r.archived);
  const archived = rows.filter((r) => r.archived);
  const total = active.reduce((s, r) => s + r.balance, 0);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: 96 }}>
        <View style={styles.hero}>
          <Text style={{ color: colors.brand[100], fontSize: 12, fontWeight: "600" }}>Total Saldo Aktif</Text>
          <Text style={{ color: "#fff", fontSize: 28, fontWeight: "800", marginTop: 4, fontVariant: ["tabular-nums"] }}>
            {formatCurrency(total)}
          </Text>
          <Text style={{ color: colors.brand[100], fontSize: 12, marginTop: 4 }}>
            {active.length} rekening aktif · {archived.length} diarsipkan
          </Text>
        </View>

        {active.length === 0 ? (
          <Card>
            <Empty title="Belum ada rekening" icon="wallet" description="Tambahkan rekening pertama Anda." />
          </Card>
        ) : (
          active.map((a) => (
            <AccountCard key={a.id} a={a} onChange={() => setTick((t) => t + 1)} />
          ))
        )}

        {archived.length > 0 && (
          <Card title="Diarsipkan">
            {archived.map((a) => (
              <View key={a.id} style={{ marginTop: 8 }}>
                <AccountCard a={a} onChange={() => setTick((t) => t + 1)} />
              </View>
            ))}
          </Card>
        )}
      </ScrollView>

      <Pressable onPress={() => router.push("/rekening/baru")} style={styles.fab}>
        <Icon name="plus" size={22} color="#fff" />
      </Pressable>
    </SafeAreaView>
  );
}

function AccountCard({ a, onChange }: { a: any; onChange: () => void }) {
  return (
    <View style={styles.card}>
      <View style={[styles.top, { backgroundColor: a.color }]}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.22)", alignItems: "center", justifyContent: "center" }}>
            <Icon name={a.icon} size={16} color="#fff" />
          </View>
          <View>
            <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 10, fontWeight: "700", textTransform: "uppercase" }}>
              {ACCOUNT_TYPE_LABEL[a.type] ?? a.type}
            </Text>
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>{a.name}</Text>
          </View>
        </View>
        <Text style={{ color: "#fff", marginTop: 12, fontSize: 22, fontWeight: "800", fontVariant: ["tabular-nums"] }}>
          {formatCurrency(a.balance, a.currency)}
        </Text>
        <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 11, marginTop: 2 }}>
          Saldo awal {formatCurrency(a.opening_balance, a.currency)}
        </Text>
      </View>
      <View style={{ padding: spacing.md, flexDirection: "row", gap: 8 }}>
        <Button variant="secondary" size="sm" onPress={() => router.push(`/rekening/${a.id}`)} leftIcon={<Icon name="settings" size={12} color={colors.text} />}>
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onPress={() => {
            toggleArchiveAccount(a.id);
            onChange();
          }}
        >
          {a.archived ? "Aktifkan" : "Arsipkan"}
        </Button>
        <View style={{ flex: 1 }} />
        <Button
          variant="ghost"
          size="sm"
          onPress={() =>
            Alert.alert(
              "Hapus rekening?",
              "Rekening dan seluruh transaksinya akan dihapus permanen.",
              [
                { text: "Batal", style: "cancel" },
                {
                  text: "Hapus",
                  style: "destructive",
                  onPress: () => {
                    deleteAccount(a.id);
                    onChange();
                  },
                },
              ],
            )
          }
        >
          <Text style={{ color: colors.danger, fontWeight: "600" }}>Hapus</Text>
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    padding: spacing.lg,
    borderRadius: radius["2xl"],
    backgroundColor: colors.brand[600],
  },
  card: {
    borderRadius: radius["2xl"],
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    overflow: "hidden",
  },
  top: { padding: spacing.lg },
  fab: {
    position: "absolute", right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.brand[600], alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 6,
  },
});
