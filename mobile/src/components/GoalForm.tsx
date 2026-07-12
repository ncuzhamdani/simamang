import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "./Button";
import { Input } from "./Input";
import { Icon } from "./Icon";
import { colors, radius, spacing, PRESET_COLORS } from "../theme";
import type { Goal } from "../lib/types";

const ICONS = ["target", "shield", "plane", "bike", "home", "briefcase", "gift", "piggy-bank", "trending-up"];

export function GoalForm({
  initial,
  onSubmit,
}: {
  initial?: Goal;
  onSubmit: (v: {
    name: string;
    target_amount: number;
    saved_amount: number;
    deadline?: string | null;
    color: string;
    icon: string;
    note: string | null;
  }) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [target, setTarget] = useState(initial ? String(initial.target_amount) : "");
  const [saved, setSaved] = useState(initial ? String(initial.saved_amount) : "0");
  const [deadline, setDeadline] = useState(initial?.deadline ?? "");
  const [color, setColor] = useState(initial?.color ?? "#28a668");
  const [icon, setIcon] = useState(initial?.icon ?? "target");
  const [note, setNote] = useState(initial?.note ?? "");
  const [error, setError] = useState<string | null>(null);

  return (
    <SafeAreaView edges={["bottom"]} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        <Input label="Nama Target" value={name} onChangeText={setName} placeholder="mis. Liburan Bali" />
        <View style={{ flexDirection: "row", gap: spacing.md }}>
          <Input containerStyle={{ flex: 1 }} label="Target" value={target} onChangeText={setTarget} keyboardType="numeric" placeholder="0" />
          <Input containerStyle={{ flex: 1 }} label="Sudah Terkumpul" value={saved} onChangeText={setSaved} keyboardType="numeric" placeholder="0" />
        </View>
        <Input label="Deadline (YYYY-MM-DD)" value={deadline} onChangeText={setDeadline} placeholder="2026-12-31" />

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

        <Input label="Catatan" value={note} onChangeText={setNote} multiline />

        {error && (
          <View style={{ padding: 10, borderRadius: radius.md, backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#fecaca" }}>
            <Text style={{ color: colors.danger, fontSize: 13 }}>{error}</Text>
          </View>
        )}

        <Button
          onPress={() => {
            setError(null);
            if (!name.trim()) return setError("Nama target wajib diisi.");
            const t = Number(target);
            const s = Number(saved);
            if (!Number.isFinite(t) || t <= 0) return setError("Target nominal harus > 0.");
            if (!Number.isFinite(s) || s < 0) return setError("Nominal terkumpul tidak valid.");
            onSubmit({
              name: name.trim(),
              target_amount: t,
              saved_amount: s,
              deadline: deadline.trim() || null,
              color,
              icon,
              note: note.trim() || null,
            });
          }}
        >
          {initial ? "Perbarui" : "Buat Target"}
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  iconChoice: {
    width: 42, height: 42, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
    alignItems: "center", justifyContent: "center", backgroundColor: colors.card,
  },
});
