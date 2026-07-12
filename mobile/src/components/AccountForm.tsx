import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "./Button";
import { Input } from "./Input";
import { Icon } from "./Icon";
import { colors, radius, spacing, PRESET_COLORS, ACCOUNT_TYPE_LABEL } from "../theme";
import type { Account } from "../lib/types";

const TYPES: Array<Account["type"]> = ["cash", "bank", "ewallet", "credit", "investment", "other"];
const ICONS = ["wallet", "landmark", "smartphone", "credit-card", "trending-up", "coins", "piggy-bank", "briefcase"];

export function AccountForm({
  initial,
  onSubmit,
  onDelete,
}: {
  initial?: Account;
  onSubmit: (v: {
    name: string;
    type: Account["type"];
    currency: string;
    opening_balance: number;
    color: string;
    icon: string;
    note: string | null;
  }) => void;
  onDelete?: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [type, setType] = useState<Account["type"]>(initial?.type ?? "bank");
  const [currency, setCurrency] = useState(initial?.currency ?? "IDR");
  const [opening, setOpening] = useState(initial ? String(initial.opening_balance) : "0");
  const [color, setColor] = useState(initial?.color ?? "#28a668");
  const [icon, setIcon] = useState(initial?.icon ?? "wallet");
  const [note, setNote] = useState(initial?.note ?? "");
  const [error, setError] = useState<string | null>(null);

  return (
    <SafeAreaView edges={["bottom"]} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        <Input label="Nama Rekening" value={name} onChangeText={setName} placeholder="mis. Bank BCA" />

        <View>
          <Text style={{ fontSize: 12, fontWeight: "500", color: colors.muted, marginBottom: 6 }}>Tipe</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {TYPES.map((t) => (
              <Pressable
                key={t}
                onPress={() => setType(t)}
                style={[
                  styles.pill,
                  type === t && { backgroundColor: colors.brand[600], borderColor: colors.brand[600] },
                ]}
              >
                <Text style={{ color: type === t ? "#fff" : colors.text, fontSize: 12, fontWeight: "600" }}>
                  {ACCOUNT_TYPE_LABEL[t]}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={{ flexDirection: "row", gap: spacing.md }}>
          <Input containerStyle={{ flex: 1 }} label="Mata Uang" value={currency} onChangeText={setCurrency} autoCapitalize="characters" />
          <Input containerStyle={{ flex: 2 }} label="Saldo Awal" value={opening} onChangeText={setOpening} keyboardType="numeric" />
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

        <Input label="Catatan (opsional)" value={note} onChangeText={setNote} multiline />

        {error && (
          <View style={{ padding: 10, borderRadius: radius.md, backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#fecaca" }}>
            <Text style={{ color: colors.danger, fontSize: 13 }}>{error}</Text>
          </View>
        )}

        <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
          <Button
            onPress={() => {
              setError(null);
              if (!name.trim()) return setError("Nama rekening wajib diisi.");
              const n = Number(opening);
              if (!Number.isFinite(n)) return setError("Saldo awal tidak valid.");
              onSubmit({
                name: name.trim(),
                type,
                currency: (currency || "IDR").toUpperCase(),
                opening_balance: n,
                color,
                icon,
                note: note.trim() || null,
              });
            }}
            style={{ flex: 1 }}
          >
            {initial ? "Perbarui" : "Buat"}
          </Button>
          {onDelete && (
            <Button variant="danger" onPress={onDelete}>
              <Icon name="trash" size={14} color="#fff" />
            </Button>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.full,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
  },
  iconChoice: {
    width: 42, height: 42, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
    alignItems: "center", justifyContent: "center", backgroundColor: colors.card,
  },
});
