import React, { useCallback, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../../../src/components/Card";
import { Icon } from "../../../src/components/Icon";
import { Empty } from "../../../src/components/Empty";
import { colors, radius, spacing } from "../../../src/theme";
import { deleteCategory, listCategories } from "../../../src/lib/queries";

export default function KategoriScreen() {
  const [tick, setTick] = useState(0);
  useFocusEffect(useCallback(() => { setTick((t) => t + 1); }, []));
  const all = useMemo(() => listCategories(), [tick]);
  const income = all.filter((c) => c.kind === "income");
  const expense = all.filter((c) => c.kind === "expense");

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: 96 }}>
        <Card title="Pemasukan" description={`${income.length} kategori`}>
          <List items={income} onChange={() => setTick((t) => t + 1)} />
        </Card>
        <Card title="Pengeluaran" description={`${expense.length} kategori`}>
          <List items={expense} onChange={() => setTick((t) => t + 1)} />
        </Card>
      </ScrollView>

      <Pressable onPress={() => router.push("/kategori/baru")} style={styles.fab}>
        <Icon name="plus" size={22} color="#fff" />
      </Pressable>
    </SafeAreaView>
  );
}

function List({ items, onChange }: { items: ReturnType<typeof listCategories>; onChange: () => void }) {
  if (items.length === 0) return <Empty title="Belum ada kategori" icon="tag" />;
  return (
    <View style={{ gap: 6 }}>
      {items.map((c) => (
        <View key={c.id} style={styles.row}>
          <View style={[styles.iconBox, { backgroundColor: c.color }]}>
            <Icon name={c.icon} size={14} color="#fff" />
          </View>
          <Text style={{ flex: 1, fontWeight: "500", color: colors.text }}>{c.name}</Text>
          <Pressable
            onPress={() =>
              Alert.alert("Hapus kategori?", `Kategori ${c.name} akan dihapus.`, [
                { text: "Batal", style: "cancel" },
                {
                  text: "Hapus",
                  style: "destructive",
                  onPress: () => {
                    deleteCategory(c.id);
                    onChange();
                  },
                },
              ])
            }
          >
            <Icon name="trash" size={16} color={colors.muted} />
          </Pressable>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row", alignItems: "center", gap: spacing.md,
    paddingVertical: 8, paddingHorizontal: 10, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
  },
  iconBox: {
    width: 32, height: 32, borderRadius: radius.md,
    alignItems: "center", justifyContent: "center",
  },
  fab: {
    position: "absolute", right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.brand[600], alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 6,
  },
});
