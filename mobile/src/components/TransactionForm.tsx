import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "./Button";
import { Input } from "./Input";
import { Icon } from "./Icon";
import { colors, radius, spacing } from "../theme";
import { listAccounts, listCategories } from "../lib/queries";
import type { Transaction } from "../lib/types";
import { nowIso } from "../lib/format";

interface Values {
  type: "income" | "expense" | "transfer";
  amount: number;
  account_id: number;
  to_account_id?: number | null;
  category_id?: number | null;
  occurred_at: string;
  note: string | null;
  tags: string | null;
}

export function TransactionForm({
  initial,
  onSubmit,
  onDelete,
}: {
  initial?: Transaction;
  onSubmit: (v: Values) => void;
  onDelete?: () => void;
}) {
  const accounts = useMemo(() => listAccounts(true), []);
  const categories = useMemo(() => listCategories(), []);

  const [type, setType] = useState<Values["type"]>(initial?.type ?? "expense");
  const [amount, setAmount] = useState(initial?.amount ? String(initial.amount) : "");
  const [accountId, setAccountId] = useState<number>(initial?.account_id ?? accounts[0]?.id ?? 0);
  const [toAccountId, setToAccountId] = useState<number | null>(initial?.to_account_id ?? null);
  const [categoryId, setCategoryId] = useState<number | null>(initial?.category_id ?? null);
  const [note, setNote] = useState(initial?.note ?? "");
  const [tags, setTags] = useState(initial?.tags ?? "");
  const [error, setError] = useState<string | null>(null);

  const cats = categories.filter((c) => (type === "income" ? c.kind === "income" : c.kind === "expense"));

  const handleSubmit = () => {
    setError(null);
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) {
      setError("Nominal harus lebih dari 0.");
      return;
    }
    if (type === "transfer") {
      if (!toAccountId || toAccountId === accountId) {
        setError("Pilih rekening tujuan yang berbeda.");
        return;
      }
    }
    onSubmit({
      type,
      amount: n,
      account_id: accountId,
      to_account_id: type === "transfer" ? toAccountId : null,
      category_id: type === "transfer" ? null : categoryId,
      occurred_at: initial?.occurred_at ?? nowIso(),
      note: note.trim() || null,
      tags: tags.trim() || null,
    });
  };

  const typeButtons: Array<{ v: Values["type"]; label: string; color: string }> = [
    { v: "expense", label: "Pengeluaran", color: colors.danger },
    { v: "income", label: "Pemasukan", color: colors.success },
    { v: "transfer", label: "Transfer", color: colors.info },
  ];

  return (
    <SafeAreaView edges={["bottom"]} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: 40 }}>
        <View style={{ flexDirection: "row", gap: 6 }}>
          {typeButtons.map((b) => (
            <Pressable
              key={b.v}
              onPress={() => setType(b.v)}
              style={[
                styles.typeBtn,
                { backgroundColor: type === b.v ? b.color : colors.card, borderColor: type === b.v ? b.color : colors.border },
              ]}
            >
              <Text style={{ color: type === b.v ? "#fff" : colors.text, fontWeight: "700" }}>
                {b.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Input
          label="Nominal (Rp)"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
          placeholder="0"
          style={{ fontSize: 22, fontWeight: "700" }}
        />

        <Selector
          label={type === "transfer" ? "Dari Rekening" : "Rekening"}
          items={accounts.map((a) => ({ id: a.id, name: a.name, color: a.color, icon: a.icon }))}
          value={accountId}
          onChange={(id) => setAccountId(id as number)}
        />

        {type === "transfer" ? (
          <Selector
            label="Ke Rekening"
            items={accounts
              .filter((a) => a.id !== accountId)
              .map((a) => ({ id: a.id, name: a.name, color: a.color, icon: a.icon }))}
            value={toAccountId}
            onChange={(id) => setToAccountId(id as number)}
          />
        ) : (
          <Selector
            label="Kategori"
            items={[
              { id: null, name: "Tanpa Kategori", color: colors.surface[400], icon: "tag" },
              ...cats.map((c) => ({ id: c.id, name: c.name, color: c.color, icon: c.icon })),
            ]}
            value={categoryId}
            onChange={(id) => setCategoryId(id as number | null)}
          />
        )}

        <Input label="Catatan" value={note} onChangeText={setNote} placeholder="Deskripsi singkat" />
        <Input label="Tag (pisahkan dengan koma)" value={tags} onChangeText={setTags} placeholder="mis. rutin, urgent" />

        {error && (
          <View style={{ padding: 10, borderRadius: radius.md, backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#fecaca" }}>
            <Text style={{ color: colors.danger, fontSize: 13 }}>{error}</Text>
          </View>
        )}

        <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
          <Button onPress={handleSubmit} style={{ flex: 1 }}>
            {initial ? "Perbarui" : "Simpan"}
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

function Selector<T extends number | null>({
  label,
  items,
  value,
  onChange,
}: {
  label: string;
  items: Array<{ id: T; name: string; color: string; icon: string }>;
  value: T | null;
  onChange: (id: T) => void;
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontSize: 12, fontWeight: "500", color: colors.muted }}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
        {items.map((it) => {
          const active = value === it.id;
          return (
            <Pressable
              key={String(it.id)}
              onPress={() => onChange(it.id)}
              style={[
                styles.selectItem,
                active && { borderColor: it.color, backgroundColor: it.color + "18" },
              ]}
            >
              <View style={{ width: 26, height: 26, borderRadius: 8, backgroundColor: it.color, alignItems: "center", justifyContent: "center" }}>
                <Icon name={it.icon} size={12} color="#fff" />
              </View>
              <Text style={{ fontSize: 13, fontWeight: "600", color: colors.text }}>{it.name}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  typeBtn: {
    flex: 1, paddingVertical: 10, borderRadius: radius.md,
    alignItems: "center", justifyContent: "center", borderWidth: 1,
  },
  selectItem: {
    flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card,
  },
});
