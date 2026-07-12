import React, { useCallback, useMemo, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "../../../src/components/Card";
import { Chip } from "../../../src/components/Chip";
import { Icon } from "../../../src/components/Icon";
import { Button } from "../../../src/components/Button";
import { Empty } from "../../../src/components/Empty";
import { ProgressBar } from "../../../src/components/ProgressBar";
import { colors, radius, spacing } from "../../../src/theme";
import { formatCurrency, formatDate } from "../../../src/lib/format";
import { deleteDebt, listDebts, payDebt, settleDebt } from "../../../src/lib/queries";

export default function HutangScreen() {
  const [tick, setTick] = useState(0);
  useFocusEffect(useCallback(() => { setTick((t) => t + 1); }, []));

  const debts = useMemo(() => listDebts(), [tick]);
  const totalHutang = debts.filter((d) => d.kind === "hutang" && !d.settled).reduce((s, d) => s + (d.amount - d.paid), 0);
  const totalPiutang = debts.filter((d) => d.kind === "piutang" && !d.settled).reduce((s, d) => s + (d.amount - d.paid), 0);
  const [payId, setPayId] = useState<number | null>(null);
  const [payAmount, setPayAmount] = useState("");

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: 96 }}>
        <View style={{ flexDirection: "row", gap: spacing.md }}>
          <View style={[styles.summary, { backgroundColor: "#fef2f2", borderColor: "#fecaca" }]}>
            <Text style={{ color: "#b91c1c", fontSize: 12, fontWeight: "600" }}>Hutang Aktif</Text>
            <Text style={{ color: "#b91c1c", fontSize: 20, fontWeight: "800", marginTop: 2, fontVariant: ["tabular-nums"] }}>
              {formatCurrency(totalHutang)}
            </Text>
          </View>
          <View style={[styles.summary, { backgroundColor: "#ecfdf5", borderColor: "#a7f3d0" }]}>
            <Text style={{ color: "#047857", fontSize: 12, fontWeight: "600" }}>Piutang Aktif</Text>
            <Text style={{ color: "#047857", fontSize: 20, fontWeight: "800", marginTop: 2, fontVariant: ["tabular-nums"] }}>
              {formatCurrency(totalPiutang)}
            </Text>
          </View>
        </View>

        {debts.length === 0 ? (
          <Card>
            <Empty title="Belum ada catatan" icon="handshake" />
          </Card>
        ) : (
          debts.map((d) => {
            const pct = d.amount ? d.paid / d.amount : 0;
            return (
              <Card key={d.id} style={{ padding: spacing.md }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
                  <View
                    style={[
                      styles.icon,
                      {
                        backgroundColor: d.kind === "hutang" ? "#fef2f2" : "#ecfdf5",
                      },
                    ]}
                  >
                    <Icon
                      name="handshake"
                      size={16}
                      color={d.kind === "hutang" ? "#b91c1c" : "#047857"}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Text style={{ fontWeight: "700" }}>{d.party}</Text>
                      <Chip tone={d.kind === "hutang" ? "danger" : "success"}>{d.kind}</Chip>
                      {d.settled ? <Chip tone="neutral">Lunas</Chip> : null}
                    </View>
                    <Text style={{ fontSize: 11, color: colors.muted }} numberOfLines={1}>
                      {d.due_date ? `Jatuh tempo ${formatDate(d.due_date)}` : "Tanpa jatuh tempo"}
                      {d.note ? ` · ${d.note}` : ""}
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={{ fontWeight: "700", fontVariant: ["tabular-nums"] }}>
                      {formatCurrency(d.paid)} / {formatCurrency(d.amount)}
                    </Text>
                    <Text style={{ fontSize: 11, color: colors.muted }}>
                      Sisa {formatCurrency(Math.max(0, d.amount - d.paid))}
                    </Text>
                  </View>
                </View>
                <View style={{ marginTop: 10 }}>
                  <ProgressBar value={pct} color={d.settled ? colors.success : colors.brand[500]} height={6} />
                </View>
                {!d.settled && (
                  <View style={{ flexDirection: "row", gap: 8, marginTop: 10, justifyContent: "flex-end" }}>
                    <Button
                      size="sm"
                      onPress={() => {
                        setPayId(d.id);
                        setPayAmount("");
                      }}
                    >
                      Bayar
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onPress={() =>
                        Alert.alert("Tandai lunas?", `${d.party} — ${formatCurrency(d.amount - d.paid)}`, [
                          { text: "Batal", style: "cancel" },
                          {
                            text: "Lunas",
                            onPress: () => {
                              settleDebt(d.id);
                              setTick((t) => t + 1);
                            },
                          },
                        ])
                      }
                    >
                      Lunas
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onPress={() =>
                        Alert.alert("Hapus?", d.party, [
                          { text: "Batal", style: "cancel" },
                          {
                            text: "Hapus",
                            style: "destructive",
                            onPress: () => {
                              deleteDebt(d.id);
                              setTick((t) => t + 1);
                            },
                          },
                        ])
                      }
                    >
                      <Text style={{ color: colors.danger, fontWeight: "600" }}>Hapus</Text>
                    </Button>
                  </View>
                )}
              </Card>
            );
          })
        )}
      </ScrollView>

      <Pressable onPress={() => router.push("/hutang/baru")} style={styles.fab}>
        <Icon name="plus" size={22} color="#fff" />
      </Pressable>

      <Modal transparent animationType="fade" visible={payId != null} onRequestClose={() => setPayId(null)}>
        <Pressable style={styles.modalBg} onPress={() => setPayId(null)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={{ fontWeight: "700", marginBottom: 8 }}>Nominal pembayaran</Text>
            <TextInput
              keyboardType="numeric"
              placeholder="Nominal"
              placeholderTextColor={colors.surface[400]}
              value={payAmount}
              onChangeText={setPayAmount}
              style={styles.modalInput}
            />
            <View style={{ flexDirection: "row", gap: 8, justifyContent: "flex-end" }}>
              <Button variant="ghost" size="sm" onPress={() => setPayId(null)}>Batal</Button>
              <Button
                size="sm"
                onPress={() => {
                  const n = Number(payAmount);
                  if (!Number.isFinite(n) || n <= 0 || payId == null) return;
                  payDebt(payId, n);
                  setPayId(null);
                  setPayAmount("");
                  setTick((t) => t + 1);
                }}
              >
                Bayar
              </Button>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  summary: {
    flex: 1, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1,
  },
  icon: { width: 36, height: 36, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
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
