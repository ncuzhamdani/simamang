import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../src/components/Button";
import { Input } from "../../src/components/Input";
import { colors, radius, spacing } from "../../src/theme";
import { upsertDebt } from "../../src/lib/queries";

export default function NewDebtScreen() {
  const [kind, setKind] = useState<"hutang" | "piutang">("hutang");
  const [party, setParty] = useState("");
  const [amount, setAmount] = useState("");
  const [paid, setPaid] = useState("0");
  const [dueDate, setDueDate] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <SafeAreaView edges={["bottom"]} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        <View>
          <Text style={{ fontSize: 12, fontWeight: "500", color: colors.muted, marginBottom: 6 }}>Jenis</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {(["hutang", "piutang"] as const).map((k) => (
              <Pressable
                key={k}
                onPress={() => setKind(k)}
                style={[
                  styles.pill,
                  { flex: 1, alignItems: "center" },
                  kind === k && {
                    backgroundColor: k === "hutang" ? colors.danger : colors.success,
                    borderColor: k === "hutang" ? colors.danger : colors.success,
                  },
                ]}
              >
                <Text style={{ color: kind === k ? "#fff" : colors.text, fontWeight: "700" }}>
                  {k === "hutang" ? "Hutang (saya pinjam)" : "Piutang (saya pinjamkan)"}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
        <Input label="Nama Pihak" value={party} onChangeText={setParty} placeholder="mis. Andi" />
        <View style={{ flexDirection: "row", gap: spacing.md }}>
          <Input containerStyle={{ flex: 1 }} label="Nominal" value={amount} onChangeText={setAmount} keyboardType="numeric" />
          <Input containerStyle={{ flex: 1 }} label="Sudah Dibayar" value={paid} onChangeText={setPaid} keyboardType="numeric" />
        </View>
        <Input label="Jatuh Tempo (YYYY-MM-DD)" value={dueDate} onChangeText={setDueDate} placeholder="opsional" />
        <Input label="Catatan" value={note} onChangeText={setNote} />

        {error && (
          <View style={{ padding: 10, borderRadius: radius.md, backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#fecaca" }}>
            <Text style={{ color: colors.danger, fontSize: 13 }}>{error}</Text>
          </View>
        )}
        <Button
          onPress={() => {
            setError(null);
            if (!party.trim()) return setError("Nama pihak wajib diisi.");
            const a = Number(amount);
            const p = Number(paid);
            if (!Number.isFinite(a) || a <= 0) return setError("Nominal harus > 0.");
            if (!Number.isFinite(p) || p < 0) return setError("Nominal terbayar tidak valid.");
            upsertDebt({
              kind,
              party: party.trim(),
              amount: a,
              paid: p,
              due_date: dueDate.trim() || null,
              note: note.trim() || null,
            });
            router.back();
          }}
        >
          Tambah
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
});
