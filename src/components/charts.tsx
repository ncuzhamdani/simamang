"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCompact, formatCurrency, formatMonth } from "@/lib/format";

const AXIS = { fontSize: 11, fill: "#64748b" } as const;

interface CashflowPoint {
  month: string;
  income: number;
  expense: number;
  net: number;
}

export function CashflowChart({ data }: { data: CashflowPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="in" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#16a34a" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#16a34a" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="out" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis
          dataKey="month"
          tick={AXIS}
          tickFormatter={(m) => formatMonth(m).split(" ")[0].slice(0, 3)}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={AXIS}
          tickFormatter={(v) => formatCompact(Number(v))}
          axisLine={false}
          tickLine={false}
          width={70}
        />
        <Tooltip
          formatter={(v: number, name: string) => [formatCurrency(Number(v)), labelize(name)]}
          labelFormatter={(l) => formatMonth(String(l))}
          contentStyle={tooltipStyle}
        />
        <Legend formatter={labelize} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
        <Area
          type="monotone"
          dataKey="income"
          stroke="#16a34a"
          fill="url(#in)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="expense"
          stroke="#ef4444"
          fill="url(#out)"
          strokeWidth={2}
        />
        <Line type="monotone" dataKey="net" stroke="#0ea5e9" dot={false} strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function DailyBarChart({
  data,
}: {
  data: { day: string; income: number; expense: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis
          dataKey="day"
          tick={AXIS}
          tickFormatter={(d) => String(d).slice(-2)}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={AXIS}
          tickFormatter={(v) => formatCompact(Number(v))}
          axisLine={false}
          tickLine={false}
          width={70}
        />
        <Tooltip
          formatter={(v: number, name: string) => [formatCurrency(Number(v)), labelize(name)]}
          labelFormatter={(l) => l}
          contentStyle={tooltipStyle}
        />
        <Legend formatter={labelize} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="income" fill="#16a34a" radius={[3, 3, 0, 0]} />
        <Bar dataKey="expense" fill="#ef4444" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface DonutDatum {
  category_id: number | null;
  category_name: string;
  category_color: string;
  total: number;
}

export function CategoryDonut({ data }: { data: DonutDatum[] }) {
  const trimmed = [...data].slice(0, 8);
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={trimmed}
          dataKey="total"
          nameKey="category_name"
          innerRadius="55%"
          outerRadius="85%"
          paddingAngle={2}
          strokeWidth={0}
        >
          {trimmed.map((d) => (
            <Cell key={d.category_id ?? d.category_name} fill={d.category_color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(v: number, name: string) => [formatCurrency(Number(v)), name]}
          contentStyle={tooltipStyle}
        />
        <Legend
          iconType="circle"
          wrapperStyle={{ fontSize: 12 }}
          formatter={(v) => String(v).slice(0, 22)}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function MonthlyBarChart({
  data,
}: {
  data: { month: string; income: number; expense: number; net: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis
          dataKey="month"
          tick={AXIS}
          tickFormatter={(m) => formatMonth(m).split(" ")[0].slice(0, 3)}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={AXIS}
          tickFormatter={(v) => formatCompact(Number(v))}
          axisLine={false}
          tickLine={false}
          width={70}
        />
        <Tooltip
          formatter={(v: number, name: string) => [formatCurrency(Number(v)), labelize(name)]}
          labelFormatter={(l) => formatMonth(String(l))}
          contentStyle={tooltipStyle}
        />
        <Legend formatter={labelize} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="income" fill="#16a34a" radius={[3, 3, 0, 0]} />
        <Bar dataKey="expense" fill="#ef4444" radius={[3, 3, 0, 0]} />
        <Bar dataKey="net" fill="#0ea5e9" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

const tooltipStyle: React.CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: 10,
  padding: "8px 10px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  background: "white",
  fontSize: 12,
};

function labelize(name: string) {
  const map: Record<string, string> = {
    income: "Pemasukan",
    expense: "Pengeluaran",
    net: "Selisih",
  };
  return map[name] ?? name;
}
