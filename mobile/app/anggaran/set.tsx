import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../src/components/Button";
import { Input } from "../../src/components/Input";
import { Icon } from "../../src/components/Icon";
import { colors, radius, spacing } from "../../src/theme";
import { formatMonth } from "../../src/lib/format";
import { listCategories, upsertBudget } from "../../src/lib/queries";

export default function SetBudgetScreen() {
  const params = useLocalSearchParams<{ month?: string; category_id?: string; amount?: string; note?: string }>();
  const month = params.month || new Date().toISOString().slice(0, 7);
  const categories = useMemo(() => listCategories("expense"), []);
  const [categoryId, setCategoryId] = useState<number>(
    params.category_id ? Number(params.category_id) : categories[0]?.id ?? 0,
  );
  const [amount, setAmount] = useState(params.amount ?? "");
  const [note, setNote] = useState(params.note ?? "");

  return (
    <SafeAreaView edges={["bottom"]} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        <Text style={{ fontSize: 12, color: colors.muted }}>
          Untuk bulan <Text style={{ fontWeight: "700", color: colors.text }}>{formatMonth(month)}</Text>
        </Text>

        <View>
          <Text style={{ fontSize: 12, fontWeight: "500", color: colors.muted, marginBottom: 6 }}>Kategori</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {categories.map((c) => {
              const active = categoryId === c.id;
              return (
                <Pressable
                  key={c.id}
                  onPress={() => setCategoryId(c.id)}
                  style={[styles.pill, active && { borderColor: c.color, backgroundColor: c.color + "18" }]}
                >
                  <View style={{ width: 20, height: 20, borderRadius: 6, backgroundColor: c.color, alignItems: "center", justifyContent: "center" }}>
                    <Icon name={c.icon} size={11} color="#fff" />
                  </View>
                  <Text style={{ fontSize: 12, fontWeight: "600", color: colors.text }}>{c.name}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <Input label="Batas Anggaran (Rp)" value={amount} onChangeText={setAmount} keyboardType="numeric" />
        <Input label="Catatan" value={note} onChangeText={setNote} />

        <Button
          onPress={() => {
            const n = Number(amount);
            if (!Number.isFinite(n) || n < 0 || !categoryId) return;
            upsertBudget({ category_id: categoryId, month, amount: n, note: note.trim() || null });
            router.back();
          }}
        >
          Simpan / Perbarui
        </Button>
        <Text style={{ fontSize: 11, color: colors.muted, textAlign: "center" }}>
          Jika kategori sudah punya anggaran untuk bulan ini, nominal akan diperbarui.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card,
  },
});
