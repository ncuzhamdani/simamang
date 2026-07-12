import React, { useCallback, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View, Pressable, RefreshControl } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, G, Path } from "react-native-svg";
import { Card } from "../../src/components/Card";
import { Icon } from "../../src/components/Icon";
import { ProgressBar } from "../../src/components/ProgressBar";
import { Empty } from "../../src/components/Empty";
import { Button } from "../../src/components/Button";
import { colors, radius, spacing } from "../../src/theme";
import { currentMonth, formatCompact, formatCurrency, formatDate, formatMonth } from "../../src/lib/format";
import {
  expenseByCategory,
  listAccountsWithBalances,
  listBudgetsForMonth,
  listGoals,
  listTransactions,
  monthlySeries,
  monthlyTotals,
  outstandingDebtsSummary,
  totalNetWorth,
  type CategoryBreakdown,
  type MonthlySeriesPoint,
} from "../../src/lib/queries";
import type { AccountWithBalance, BudgetExpanded, Goal, TransactionExpanded } from "../../src/lib/types";

export default function DashboardScreen() {
  const [tick, setTick] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  useFocusEffect(useCallback(() => { setTick((t) => t + 1); }, []));

  const month = currentMonth();
  const data = useMemo(() => {
    return {
      totals: monthlyTotals(month),
      accounts: listAccountsWithBalances(),
      netWorth: totalNetWorth(),
      expByCat: expenseByCategory(month).slice(0, 6),
      cashflow: monthlySeries(6),
      recentTx: listTransactions({ limit: 6 }),
      budgets: listBudgetsForMonth(month),
      goals: listGoals().slice(0, 3),
      debts: outstandingDebtsSummary(),
    };
  }, [month, tick]);

  const savingsRate = data.totals.income > 0
    ? Math.round(((data.totals.income - data.totals.expense) / data.totals.income) * 100)
    : 0;

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg, paddingBottom: 96 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {
            setRefreshing(true);
            setTimeout(() => { setTick((t) => t + 1); setRefreshing(false); }, 300);
          }} />
        }
      >
        <HeroBalance netWorth={data.netWorth} month={month} onAdd={() => router.push("/transaksi/baru")} />
        <KpiRow totals={data.totals} savingsRate={savingsRate} />
        <CashflowCard data={data.cashflow} />
        <CategoryBreakdownCard month={month} data={data.expByCat} />
        <AccountsCard accounts={data.accounts} />
        <RecentTxCard rows={data.recentTx} />
        <BudgetsCard budgets={data.budgets} />
        <GoalsCard goals={data.goals} />
        <DebtsCard summary={data.debts} />
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function HeroBalance({ netWorth, month, onAdd }: { netWorth: number; month: string; onAdd: () => void }) {
  return (
    <View style={styles.hero}>
      <View style={{ flex: 1 }}>
        <Text style={styles.heroLabel}>Kekayaan Bersih</Text>
        <Text style={styles.heroValue}>{formatCurrency(netWorth)}</Text>
        <Text style={styles.heroSub}>Ringkasan bulan {formatMonth(month)}</Text>
      </View>
      <Pressable onPress={onAdd} style={styles.heroBtn}>
        <Icon name="plus" size={22} color="#fff" />
      </Pressable>
    </View>
  );
}

function KpiRow({ totals, savingsRate }: { totals: ReturnType<typeof monthlyTotals>; savingsRate: number }) {
  return (
    <View style={{ flexDirection: "row", gap: spacing.md }}>
      <Kpi label="Pemasukan" value={totals.income} tone={colors.success} icon="trending-up" />
      <Kpi label="Pengeluaran" value={totals.expense} tone={colors.danger} icon="trending-down" />
      <Kpi label="Menabung" value={`${savingsRate}%`} tone={colors.brand[600]} icon="piggy-bank" raw />
    </View>
  );
}

function Kpi({ label, value, tone, icon, raw }: { label: string; value: number | string; tone: string; icon: string; raw?: boolean }) {
  return (
    <View style={[styles.kpi]}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={styles.kpiLabel}>{label}</Text>
        <Icon name={icon} size={14} color={tone} />
      </View>
      <Text style={[styles.kpiValue, { color: tone }]}>
        {raw ? String(value) : formatCompact(Number(value))}
      </Text>
    </View>
  );
}

function CashflowCard({ data }: { data: MonthlySeriesPoint[] }) {
  const max = Math.max(1, ...data.flatMap((d) => [d.income, d.expense]));
  const W = 320, H = 140, PAD = 12;
  const stepX = (W - PAD * 2) / Math.max(1, data.length - 1);
  const y = (v: number) => H - PAD - (v / max) * (H - PAD * 2);
  const linePath = (key: "income" | "expense") => {
    return data.map((d, i) => {
      const cmd = i === 0 ? "M" : "L";
      const x = PAD + i * stepX;
      return `${cmd}${x},${y(d[key])}`;
    }).join(" ");
  };
  return (
    <Card title="Arus Kas 6 Bulan" description="Pemasukan vs pengeluaran">
      <View style={{ height: H, alignItems: "center" }}>
        <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
          {[0.25, 0.5, 0.75].map((f) => (
            <Path key={f} d={`M${PAD},${H - PAD - (H - PAD * 2) * f} L${W - PAD},${H - PAD - (H - PAD * 2) * f}`} stroke={colors.surface[200]} strokeWidth={1} strokeDasharray="3,4" />
          ))}
          <Path d={linePath("income")} stroke={colors.success} strokeWidth={2.5} fill="none" />
          <Path d={linePath("expense")} stroke={colors.danger} strokeWidth={2.5} fill="none" />
          {data.map((d, i) => (
            <G key={i}>
              <Circle cx={PAD + i * stepX} cy={y(d.income)} r={3} fill={colors.success} />
              <Circle cx={PAD + i * stepX} cy={y(d.expense)} r={3} fill={colors.danger} />
            </G>
          ))}
        </Svg>
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6 }}>
        {data.map((d, i) => (
          <Text key={i} style={{ fontSize: 10, color: colors.muted, flex: 1, textAlign: "center" }}>
            {formatMonth(d.month).split(" ")[0].slice(0, 3)}
          </Text>
        ))}
      </View>
      <View style={{ flexDirection: "row", gap: 12, marginTop: 8, justifyContent: "center" }}>
        <LegendDot color={colors.success} label="Pemasukan" />
        <LegendDot color={colors.danger} label="Pengeluaran" />
      </View>
    </Card>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
      <Text style={{ fontSize: 11, color: colors.muted }}>{label}</Text>
    </View>
  );
}

function CategoryBreakdownCard({ month, data }: { month: string; data: CategoryBreakdown[] }) {
  if (data.length === 0) {
    return (
      <Card title="Distribusi Pengeluaran" description={`Bulan ${formatMonth(month)}`}>
        <Empty title="Belum ada pengeluaran" icon="tag" />
      </Card>
    );
  }
  const total = data.reduce((s, d) => s + d.total, 0);
  return (
    <Card title="Distribusi Pengeluaran" description={`Total ${formatCurrency(total)}`}>
      <View style={{ gap: spacing.md }}>
        {data.map((c) => {
          const pct = total ? (c.total / total) : 0;
          return (
            <View key={c.category_id ?? c.category_name}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <View style={[styles.iconBox, { backgroundColor: c.category_color }]}>
                  <Icon name={c.category_icon} size={14} color="#fff" />
                </View>
                <Text style={{ flex: 1, fontWeight: "500", color: colors.text }}>{c.category_name}</Text>
                <Text style={{ fontWeight: "600", color: colors.text, fontVariant: ["tabular-nums"] }}>
                  {formatCurrency(c.total)}
                </Text>
              </View>
              <ProgressBar value={pct} color={c.category_color} height={6} />
              <Text style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>{(pct * 100).toFixed(1)}%</Text>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

function AccountsCard({ accounts }: { accounts: AccountWithBalance[] }) {
  return (
    <Card
      title="Rekening"
      description={`${accounts.length} rekening aktif`}
      action={
        <Pressable onPress={() => router.push("/lainnya/rekening")}>
          <Text style={{ color: colors.brand[700], fontWeight: "600", fontSize: 12 }}>Kelola</Text>
        </Pressable>
      }
    >
      <View style={{ gap: 8 }}>
        {accounts.map((a) => (
          <View key={a.id} style={styles.row}>
            <View style={[styles.iconBox, { backgroundColor: a.color }]}>
              <Icon name={a.icon} size={14} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "600", color: colors.text }}>{a.name}</Text>
              <Text style={{ fontSize: 12, color: colors.muted }}>{a.type}</Text>
            </View>
            <Text style={{ fontWeight: "600", color: a.balance < 0 ? colors.danger : colors.text, fontVariant: ["tabular-nums"] }}>
              {formatCurrency(a.balance, a.currency)}
            </Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

function RecentTxCard({ rows }: { rows: TransactionExpanded[] }) {
  return (
    <Card
      title="Transaksi Terbaru"
      action={
        <Pressable onPress={() => router.push("/transaksi")}>
          <Text style={{ color: colors.brand[700], fontWeight: "600", fontSize: 12 }}>Semua</Text>
        </Pressable>
      }
    >
      {rows.length === 0 ? (
        <Empty title="Belum ada transaksi" icon="list" />
      ) : (
        <View style={{ gap: 8 }}>
          {rows.map((t) => {
            const color = t.type === "transfer" ? colors.info : t.category_color ?? t.account_color;
            const amountColor = t.type === "income" ? colors.success : t.type === "expense" ? colors.danger : colors.info;
            const sign = t.type === "expense" ? "-" : t.type === "income" ? "+" : "";
            return (
              <Pressable key={t.id} onPress={() => router.push(`/transaksi/${t.id}`)} style={styles.row}>
                <View style={[styles.iconBox, { backgroundColor: color }]}>
                  <Icon
                    name={
                      t.type === "transfer" ? "repeat" :
                      t.type === "income" ? "arrow-down-left" : "arrow-up-right"
                    }
                    size={14}
                    color="#fff"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={1} style={{ fontWeight: "600", color: colors.text }}>
                    {t.note || t.category_name || (t.type === "transfer" ? "Transfer" : "Transaksi")}
                  </Text>
                  <Text numberOfLines={1} style={{ fontSize: 11, color: colors.muted }}>
                    {t.type === "transfer" ? `${t.account_name} → ${t.to_account_name}` : `${t.category_name ?? "Tanpa kategori"} · ${t.account_name}`}
                    {"  ·  "}{formatDate(t.occurred_at)}
                  </Text>
                </View>
                <Text style={{ fontWeight: "700", color: amountColor, fontVariant: ["tabular-nums"] }}>
                  {sign}{formatCurrency(t.amount)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </Card>
  );
}

function BudgetsCard({ budgets }: { budgets: BudgetExpanded[] }) {
  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  return (
    <Card
      title="Anggaran Bulan Ini"
      description={`${budgets.length} kategori`}
      action={
        <Pressable onPress={() => router.push("/anggaran")}>
          <Text style={{ color: colors.brand[700], fontWeight: "600", fontSize: 12 }}>Kelola</Text>
        </Pressable>
      }
    >
      {budgets.length === 0 ? (
        <Empty title="Belum ada anggaran" icon="piggy-bank" />
      ) : (
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
            <Text style={{ fontSize: 12, color: colors.muted }}>Total Terpakai</Text>
            <Text style={{ fontSize: 12, fontWeight: "600" }}>
              {formatCurrency(totalSpent)} <Text style={{ color: colors.muted }}>/ {formatCurrency(totalBudget)}</Text>
            </Text>
          </View>
          <ProgressBar
            value={totalBudget ? totalSpent / totalBudget : 0}
            color={totalSpent > totalBudget ? colors.danger : colors.brand[500]}
          />
          {budgets.slice(0, 4).map((b) => {
            const pct = b.amount ? b.spent / b.amount : 0;
            const over = b.spent > b.amount;
            return (
              <View key={b.id} style={{ marginTop: 8 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontSize: 12, fontWeight: "500", color: colors.text }}>{b.category_name}</Text>
                  <Text style={{ fontSize: 11, color: over ? colors.danger : colors.muted, fontVariant: ["tabular-nums"] }}>
                    {formatCurrency(b.spent)} / {formatCurrency(b.amount)}
                  </Text>
                </View>
                <ProgressBar value={pct} color={over ? colors.danger : b.category_color} height={5} />
              </View>
            );
          })}
        </View>
      )}
    </Card>
  );
}

function GoalsCard({ goals }: { goals: Goal[] }) {
  return (
    <Card
      title="Target Keuangan"
      action={
        <Pressable onPress={() => router.push("/lainnya/target")}>
          <Text style={{ color: colors.brand[700], fontWeight: "600", fontSize: 12 }}>Semua</Text>
        </Pressable>
      }
    >
      {goals.length === 0 ? (
        <Empty title="Belum ada target" icon="target" />
      ) : (
        <View style={{ gap: spacing.md }}>
          {goals.map((g) => {
            const pct = g.target_amount ? Math.min(1, g.saved_amount / g.target_amount) : 0;
            return (
              <View key={g.id}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <View style={[styles.iconBox, { backgroundColor: g.color }]}>
                    <Icon name={g.icon} size={14} color="#fff" />
                  </View>
                  <Text style={{ flex: 1, fontWeight: "600", color: colors.text }}>{g.name}</Text>
                  <Text style={{ fontSize: 11, color: colors.muted }}>{(pct * 100).toFixed(0)}%</Text>
                </View>
                <ProgressBar value={pct} color={g.color} />
                <Text style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
                  {formatCurrency(g.saved_amount)} / {formatCurrency(g.target_amount)}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </Card>
  );
}

function DebtsCard({ summary }: { summary: { hutang: number; piutang: number } }) {
  return (
    <Card
      title="Hutang & Piutang"
      action={
        <Pressable onPress={() => router.push("/lainnya/hutang")}>
          <Text style={{ color: colors.brand[700], fontWeight: "600", fontSize: 12 }}>Kelola</Text>
        </Pressable>
      }
    >
      <View style={{ flexDirection: "row", gap: spacing.md }}>
        <View style={[styles.summaryBox, { backgroundColor: "#fef2f2", borderColor: "#fecaca" }]}>
          <Text style={{ fontSize: 11, color: "#b91c1c", fontWeight: "600" }}>Hutang saya</Text>
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#b91c1c", marginTop: 4, fontVariant: ["tabular-nums"] }}>
            {formatCurrency(summary.hutang)}
          </Text>
        </View>
        <View style={[styles.summaryBox, { backgroundColor: "#ecfdf5", borderColor: "#a7f3d0" }]}>
          <Text style={{ fontSize: 11, color: "#047857", fontWeight: "600" }}>Piutang</Text>
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#047857", marginTop: 4, fontVariant: ["tabular-nums"] }}>
            {formatCurrency(summary.piutang)}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: radius["2xl"],
    padding: spacing.lg,
    backgroundColor: colors.brand[600],
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  heroLabel: { color: colors.brand[100], fontSize: 12, fontWeight: "600" },
  heroValue: { color: "#fff", fontSize: 30, fontWeight: "800", marginTop: 4, letterSpacing: -0.5 },
  heroSub: { color: colors.brand[100], fontSize: 12, marginTop: 4 },
  heroBtn: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center", justifyContent: "center",
  },
  kpi: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: 4,
  },
  kpiLabel: { fontSize: 11, color: colors.muted, fontWeight: "600" },
  kpiValue: { fontSize: 18, fontWeight: "800", fontVariant: ["tabular-nums"] },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: 6,
  },
  iconBox: {
    width: 32, height: 32, borderRadius: radius.md,
    alignItems: "center", justifyContent: "center",
  },
  summaryBox: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
  },
});
