import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../src/components/Button";
import { Input } from "../../src/components/Input";
import { Icon } from "../../src/components/Icon";
import { colors, radius, spacing, PRESET_COLORS } from "../../src/theme";
import { upsertCategory } from "../../src/lib/queries";

const ICONS = [
  "briefcase", "gift", "laptop", "utensils", "car", "shopping-cart", "zap",
  "home", "heart-pulse", "book-open", "clapperboard", "hand-heart", "piggy-bank",
  "receipt", "tag", "trending-up", "coins", "more-horizontal",
];

export default function NewCategoryScreen() {
  const [name, setName] = useState("");
  const [kind, setKind] = useState<"income" | "expense">("expense");
  const [color, setColor] = useState("#28a668");
  const [icon, setIcon] = useState("tag");

  return (
    <SafeAreaView edges={["bottom"]} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        <Input label="Nama Kategori" value={name} onChangeText={setName} />

        <View>
          <Text style={{ fontSize: 12, fontWeight: "500", color: colors.muted, marginBottom: 6 }}>Jenis</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {(["expense", "income"] as const).map((k) => (
              <Pressable
                key={k}
                onPress={() => setKind(k)}
                style={[
                  styles.pill,
                  { flex: 1, alignItems: "center" },
                  kind === k && {
                    backgroundColor: k === "income" ? colors.success : colors.danger,
                    borderColor: k === "income" ? colors.success : colors.danger,
                  },
                ]}
              >
                <Text style={{ color: kind === k ? "#fff" : colors.text, fontWeight: "700" }}>
                  {k === "income" ? "Pemasukan" : "Pengeluaran"}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View>
          <Text style={{ fontSize: 12, fontWeight: "500", color: colors.muted, marginBottom: 6 }}>Warna</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {PRESET_COLORS.map((c) => (
              <Pressable
                key={c}
                onPress={() => setColor(c)}
                style={{
                  width: 30, height: 30, borderRadius: 15, backgroundColor: c,
                  borderWidth: color === c ? 3 : 0, borderColor: colors.brand[500],
                }}
              />
            ))}
          </View>
        </View>

        <View>
          <Text style={{ fontSize: 12, fontWeight: "500", color: colors.muted, marginBottom: 6 }}>Ikon</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {ICONS.map((n) => (
              <Pressable
                key={n}
                onPress={() => setIcon(n)}
                style={[
                  styles.iconChoice,
                  icon === n && { borderColor: colors.brand[500], backgroundColor: colors.brand[50] },
                ]}
              >
                <Icon name={n} size={18} color={icon === n ? colors.brand[700] : colors.text} />
              </Pressable>
            ))}
          </View>
        </View>

        <Button
          onPress={() => {
            if (!name.trim()) return;
            upsertCategory({ name: name.trim(), kind, color, icon });
            router.back();
          }}
        >
          Tambah Kategori
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 12, paddingVertical: 10, borderRadius: radius.md,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
  },
  iconChoice: {
    width: 42, height: 42, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
    alignItems: "center", justifyContent: "center", backgroundColor: colors.card,
  },
});
