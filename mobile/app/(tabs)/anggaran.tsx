import React, { useCallback, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../../src/components/Card";
import { Empty } from "../../src/components/Empty";
import { Icon } from "../../src/components/Icon";
import { ProgressBar } from "../../src/components/ProgressBar";
import { Button } from "../../src/components/Button";
import { colors, radius, spacing } from "../../src/theme";
import { addMonth, currentMonth, formatCurrency, formatMonth } from "../../src/lib/format";
import { deleteBudget, listBudgetsForMonth } from "../../src/lib/queries";

export default function AnggaranScreen() {
  const [month, setMonth] = useState(currentMonth());
  const [tick, setTick] = useState(0);
  useFocusEffect(useCallback(() => { setTick((t) => t + 1); }, []));

  const budgets = useMemo(() => listBudgetsForMonth(month), [month, tick]);
  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const remaining = totalBudget - totalSpent;

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
          <Summary label="Anggaran" value={totalBudget} color={colors.text} />
          <Summary label="Terpakai" value={totalSpent} color={colors.danger} />
          <Summary
            label="Sisa"
            value={remaining}
            color={remaining < 0 ? colors.danger : colors.success}
          />
        </View>

        {budgets.length === 0 ? (
          <Card>
            <Empty
              title="Belum ada anggaran"
              description="Atur batas pengeluaran per kategori untuk bulan ini."
              icon="piggy-bank"
              action={
                <View style={{ marginTop: 12 }}>
                  <Button
                    onPress={() => router.push({ pathname: "/anggaran/set", params: { month } })}
                    leftIcon={<Icon name="plus" size={14} color="#fff" />}
                  >
                    Buat Anggaran
                  </Button>
                </View>
              }
            />
          </Card>
        ) : (
          budgets.map((b) => {
            const pct = b.amount ? b.spent / b.amount : 0;
            const over = b.spent > b.amount;
            return (
              <Card key={b.id} style={{ padding: spacing.md }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
                  <View style={[styles.iconBox, { backgroundColor: b.category_color }]}>
                    <Icon name={b.category_icon} size={16} color="#fff" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: "600" }}>{b.category_name}</Text>
                    {b.note ? (
                      <Text style={{ fontSize: 11, color: colors.muted }} numberOfLines={1}>
                        {b.note}
                      </Text>
                    ) : null}
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={{ fontWeight: "700", fontVariant: ["tabular-nums"] }}>
                      {formatCurrency(b.spent)}
                    </Text>
                    <Text style={{ fontSize: 11, color: over ? colors.danger : colors.muted }}>
                      / {formatCurrency(b.amount)}
                    </Text>
                  </View>
                </View>
                <View style={{ marginTop: spacing.md }}>
                  <ProgressBar value={pct} color={over ? colors.danger : b.category_color} />
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6 }}>
                    <Text style={{ fontSize: 11, color: colors.muted }}>{(pct * 100).toFixed(0)}%</Text>
                    <Text style={{ fontSize: 11, color: over ? colors.danger : colors.muted }}>
                      {over
                        ? `Lebih ${formatCurrency(b.spent - b.amount)}`
                        : `Sisa ${formatCurrency(b.amount - b.spent)}`}
                    </Text>
                  </View>
                </View>
                <View style={{ flexDirection: "row", gap: 8, marginTop: spacing.md, justifyContent: "flex-end" }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onPress={() =>
                      router.push({
                        pathname: "/anggaran/set",
                        params: { month, category_id: String(b.category_id), amount: String(b.amount), note: b.note ?? "" },
                      })
                    }
                  >
                    Ubah
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onPress={() =>
                      Alert.alert("Hapus anggaran?", `Kategori ${b.category_name} akan dihapus.`, [
                        { text: "Batal", style: "cancel" },
                        {
                          text: "Hapus",
                          style: "destructive",
                          onPress: () => {
                            deleteBudget(b.id);
                            setTick((t) => t + 1);
                          },
                        },
                      ])
                    }
                  >
                    Hapus
                  </Button>
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>

      <Pressable onPress={() => router.push({ pathname: "/anggaran/set", params: { month } })} style={styles.fab}>
        <Icon name="plus" size={22} color="#fff" />
      </Pressable>
    </SafeAreaView>
  );
}

function Summary({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.summary}>
      <Text style={{ fontSize: 11, color: colors.muted, fontWeight: "600" }}>{label}</Text>
      <Text style={{ fontSize: 14, fontWeight: "700", color, fontVariant: ["tabular-nums"] }}>
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
  summary: {
    flex: 1, backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border, gap: 2,
  },
  iconBox: {
    width: 40, height: 40, borderRadius: radius.md,
    alignItems: "center", justifyContent: "center",
  },
  fab: {
    position: "absolute", right: 20, bottom: 90, width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.brand[600], alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 6,
  },
});
