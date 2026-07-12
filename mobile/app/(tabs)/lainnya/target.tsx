import React, { useCallback, useMemo, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../../../src/components/Card";
import { Empty } from "../../../src/components/Empty";
import { Icon } from "../../../src/components/Icon";
import { Button } from "../../../src/components/Button";
import { ProgressBar } from "../../../src/components/ProgressBar";
import { Chip } from "../../../src/components/Chip";
import { colors, radius, spacing } from "../../../src/theme";
import { formatCurrency, formatDate } from "../../../src/lib/format";
import { contributeGoal, deleteGoal, listGoals } from "../../../src/lib/queries";

export default function TargetScreen() {
  const [tick, setTick] = useState(0);
  useFocusEffect(useCallback(() => { setTick((t) => t + 1); }, []));

  const goals = useMemo(() => listGoals(), [tick]);
  const active = goals.filter((g) => !g.completed);
  const done = goals.filter((g) => g.completed);

  const [contribId, setContribId] = useState<number | null>(null);
  const [contribAmount, setContribAmount] = useState("");

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: 96 }}>
        {active.length === 0 ? (
          <Card>
            <Empty title="Belum ada target aktif" icon="target" description="Rancang target menabung pertama Anda." />
          </Card>
        ) : (
          active.map((g) => {
            const pct = g.target_amount ? Math.min(1, g.saved_amount / g.target_amount) : 0;
            return (
              <View key={g.id} style={styles.card}>
                <View style={[styles.top, { backgroundColor: g.color }]}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.22)", alignItems: "center", justifyContent: "center" }}>
                      <Icon name={g.icon} size={18} color="#fff" />
                    </View>
                    <View>
                      <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>{g.name}</Text>
                      {g.deadline && (
                        <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 11 }}>
                          Deadline · {formatDate(g.deadline)}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
                <View style={{ padding: spacing.lg, gap: 8 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <Text style={{ fontSize: 22, fontWeight: "800", fontVariant: ["tabular-nums"] }}>
                      {formatCurrency(g.saved_amount)}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.muted }}>/ {formatCurrency(g.target_amount)}</Text>
                  </View>
                  <ProgressBar value={pct} color={g.color} />
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ fontSize: 11, color: colors.muted }}>{(pct * 100).toFixed(0)}% tercapai</Text>
                    <Text style={{ fontSize: 11, color: colors.muted, fontVariant: ["tabular-nums"] }}>
                      Sisa {formatCurrency(Math.max(0, g.target_amount - g.saved_amount))}
                    </Text>
                  </View>
                  {g.note ? <Text style={{ fontSize: 12, color: colors.muted }}>{g.note}</Text> : null}
                  <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
                    <Button
                      size="sm"
                      leftIcon={<Icon name="plus" size={12} color="#fff" />}
                      onPress={() => {
                        setContribId(g.id);
                        setContribAmount("");
                      }}
                    >
                      Menabung
                    </Button>
                    <Button size="sm" variant="secondary" onPress={() => router.push(`/target/${g.id}`)}>
                      Edit
                    </Button>
                    <View style={{ flex: 1 }} />
                    <Button
                      size="sm"
                      variant="ghost"
                      onPress={() =>
                        Alert.alert("Hapus target?", g.name, [
                          { text: "Batal", style: "cancel" },
                          {
                            text: "Hapus",
                            style: "destructive",
                            onPress: () => {
                              deleteGoal(g.id);
                              setTick((t) => t + 1);
                            },
                          },
                        ])
                      }
                    >
                      <Text style={{ color: colors.danger, fontWeight: "600" }}>Hapus</Text>
                    </Button>
                  </View>
                </View>
              </View>
            );
          })
        )}

        {done.length > 0 && (
          <Card title="Tercapai">
            {done.map((g) => (
              <View
                key={g.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  paddingVertical: 8,
                }}
              >
                <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: g.color, alignItems: "center", justifyContent: "center" }}>
                  <Icon name={g.icon} size={14} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "600" }}>{g.name}</Text>
                  <Text style={{ fontSize: 11, color: colors.muted }}>
                    Tercapai · {formatCurrency(g.saved_amount)}
                  </Text>
                </View>
                <Chip tone="success">Selesai</Chip>
              </View>
            ))}
          </Card>
        )}
      </ScrollView>

      <Pressable onPress={() => router.push("/target/baru")} style={styles.fab}>
        <Icon name="plus" size={22} color="#fff" />
      </Pressable>

      <Modal
        transparent
        animationType="fade"
        visible={contribId != null}
        onRequestClose={() => setContribId(null)}
      >
        <Pressable style={styles.modalBg} onPress={() => setContribId(null)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={{ fontWeight: "700", marginBottom: 8 }}>Tambah tabungan</Text>
            <TextInput
              keyboardType="numeric"
              placeholder="Nominal"
              placeholderTextColor={colors.surface[400]}
              value={contribAmount}
              onChangeText={setContribAmount}
              style={styles.modalInput}
            />
            <View style={{ flexDirection: "row", gap: 8, justifyContent: "flex-end" }}>
              <Button variant="ghost" size="sm" onPress={() => setContribId(null)}>
                Batal
              </Button>
              <Button
                size="sm"
                onPress={() => {
                  const n = Number(contribAmount);
                  if (!Number.isFinite(n) || n <= 0 || contribId == null) return;
                  contributeGoal(contribId, n);
                  setContribId(null);
                  setContribAmount("");
                  setTick((t) => t + 1);
                }}
              >
                Simpan
              </Button>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  modalBg: { flex: 1, backgroundColor: "rgba(15,23,42,0.35)", alignItems: "center", justifyContent: "center", padding: 20 },
  modalCard: { width: "100%", maxWidth: 380, backgroundColor: "#fff", borderRadius: 16, padding: 16, gap: 10 },
  modalInput: {
    borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: 10, fontSize: 15,
  },
});
