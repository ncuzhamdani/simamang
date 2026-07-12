import React, { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../../src/components/Card";
import { Icon } from "../../src/components/Icon";
import { Empty } from "../../src/components/Empty";
import { Button } from "../../src/components/Button";
import { colors, radius, spacing } from "../../src/theme";
import { addMonth, currentMonth, formatCurrency, formatDate, formatMonth } from "../../src/lib/format";
import { listTransactions, monthlyTotals } from "../../src/lib/queries";
import type { TransactionExpanded } from "../../src/lib/types";

type Filter = "all" | "income" | "expense" | "transfer";

export default function TransaksiScreen() {
  const [month, setMonth] = useState(currentMonth());
  const [type, setType] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [tick, setTick] = useState(0);
  useFocusEffect(useCallback(() => { setTick((t) => t + 1); }, []));

  const rows = useMemo(
    () => listTransactions({ month, type, q: q || undefined }),
    [month, type, q, tick],
  );
  const totals = useMemo(() => monthlyTotals(month), [month, tick]);

  const groups = rows.reduce<Record<string, TransactionExpanded[]>>((acc, t) => {
    const day = t.occurred_at.slice(0, 10);
    (acc[day] ||= []).push(t);
    return acc;
  }, {});
  const days = Object.keys(groups).sort((a, b) => b.localeCompare(a));

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: 96 }}>
        <View style={styles.monthBar}>
          <Pressable onPress={() => setMonth(addMonth(month, -1))} style={styles.monthBtn}>
            <Icon name="chevron-left" size={18} color={colors.text} />
          </Pressable>
          <Text style={styles.monthText}>{formatMonth(month)}</Text>
          <Pressable onPress={() => setMonth(addMonth(month, 1))} style={styles.monthBtn}>
            <Icon name="chevron-right" size={18} color={colors.text} />
          </Pressable>
        </View>

        <View style={{ flexDirection: "row", gap: spacing.sm }}>
          <SummaryPill label="Masuk" value={totals.income} color={colors.success} />
          <SummaryPill label="Keluar" value={totals.expense} color={colors.danger} />
          <SummaryPill
            label="Selisih"
            value={totals.net}
            color={totals.net >= 0 ? colors.success : colors.danger}
          />
        </View>

        <View style={styles.searchBar}>
          <Icon name="search" size={16} color={colors.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari catatan / tag…"
            placeholderTextColor={colors.surface[400]}
            value={q}
            onChangeText={setQ}
          />
        </View>

        <View style={{ flexDirection: "row", gap: 6 }}>
          {(["all", "income", "expense", "transfer"] as Filter[]).map((f) => (
            <Pressable
              key={f}
              onPress={() => setType(f)}
              style={[styles.pill, type === f && styles.pillActive]}
            >
              <Text style={[styles.pillText, type === f && { color: "#fff" }]}>
                {f === "all" ? "Semua" : f === "income" ? "Masuk" : f === "expense" ? "Keluar" : "Transfer"}
              </Text>
            </Pressable>
          ))}
        </View>

        {rows.length === 0 ? (
          <Card>
            <Empty
              title="Tidak ada transaksi"
              description="Ubah filter, atau catat transaksi baru."
              icon="list"
              action={
                <View style={{ marginTop: 12 }}>
                  <Button onPress={() => router.push("/transaksi/baru")} leftIcon={<Icon name="plus" size={14} color="#fff" />}>
                    Tambah Transaksi
                  </Button>
                </View>
              }
            />
          </Card>
        ) : (
          days.map((day) => {
            const list = groups[day];
            const dayIn = list.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
            const dayOut = list.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
            return (
              <Card key={day} style={{ padding: 0, overflow: "hidden" }}>
                <View style={styles.dayHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: "600" }}>{formatDate(day)}</Text>
                    <Text style={{ fontSize: 11, color: colors.muted }}>{list.length} transaksi</Text>
                  </View>
                  <Text style={{ fontSize: 11, color: colors.success, fontWeight: "600", marginRight: 8 }}>
                    +{formatCurrency(dayIn)}
                  </Text>
                  <Text style={{ fontSize: 11, color: colors.danger, fontWeight: "600" }}>
                    -{formatCurrency(dayOut)}
                  </Text>
                </View>
                {list.map((t, idx) => (
                  <Pressable
                    key={t.id}
                    onPress={() => router.push(`/transaksi/${t.id}`)}
                    style={[styles.txRow, idx > 0 && { borderTopWidth: 1, borderTopColor: colors.surface[100] }]}
                  >
                    <View
                      style={[
                        styles.iconBox,
                        {
                          backgroundColor:
                            t.type === "transfer"
                              ? colors.info
                              : t.category_color ?? t.account_color,
                        },
                      ]}
                    >
                      <Icon
                        name={
                          t.type === "transfer" ? "repeat" :
                          t.type === "income" ? "arrow-down-left" : "arrow-up-right"
                        }
                        size={14}
                        color="#fff"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text numberOfLines={1} style={{ fontWeight: "600", color: colors.text }}>
                        {t.note || t.category_name || (t.type === "transfer" ? "Transfer" : "Transaksi")}
                      </Text>
                      <Text numberOfLines={1} style={{ fontSize: 11, color: colors.muted }}>
                        {t.type === "transfer"
                          ? `${t.account_name} → ${t.to_account_name}`
                          : `${t.category_name ?? "Tanpa kategori"} · ${t.account_name}`}
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontWeight: "700",
                        color:
                          t.type === "income"
                            ? colors.success
                            : t.type === "expense"
                              ? colors.danger
                              : colors.info,
                        fontVariant: ["tabular-nums"],
                      }}
                    >
                      {t.type === "expense" ? "-" : t.type === "income" ? "+" : ""}
                      {formatCurrency(t.amount)}
                    </Text>
                  </Pressable>
                ))}
              </Card>
            );
          })
        )}
      </ScrollView>

      <Pressable onPress={() => router.push("/transaksi/baru")} style={styles.fab}>
        <Icon name="plus" size={22} color="#fff" />
      </Pressable>
    </SafeAreaView>
  );
}

function SummaryPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.summaryPill}>
      <Text style={{ fontSize: 11, color: colors.muted, fontWeight: "600" }}>{label}</Text>
      <Text style={{ fontSize: 15, fontWeight: "700", color, fontVariant: ["tabular-nums"] }}>
        {formatCurrency(value)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  monthBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    padding: spacing.md, backgroundColor: colors.card, borderRadius: radius.xl,
    borderWidth: 1, borderColor: colors.border,
  },
  monthBtn: {
    width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center",
    backgroundColor: colors.surface[100],
  },
  monthText: { fontSize: 15, fontWeight: "700" },
  summaryPill: {
    flex: 1, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border, gap: 2,
  },
  searchBar: {
    flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12,
    backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border,
  },
  searchInput: { flex: 1, height: 40, color: colors.text, fontSize: 14 },
  pill: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
  },
  pillActive: { backgroundColor: colors.brand[600], borderColor: colors.brand[600] },
  pillText: { fontSize: 12, fontWeight: "600", color: colors.text },
  dayHeader: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: spacing.lg, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: colors.surface[100],
  },
  txRow: {
    flexDirection: "row", alignItems: "center", gap: spacing.md,
    paddingHorizontal: spacing.lg, paddingVertical: 10,
  },
  iconBox: {
    width: 34, height: 34, borderRadius: radius.md,
    alignItems: "center", justifyContent: "center",
  },
  fab: {
    position: "absolute", right: 20, bottom: 90, width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.brand[600], alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 6,
  },
});
