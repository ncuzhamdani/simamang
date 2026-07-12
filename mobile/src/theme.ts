export const colors = {
  brand: {
    50: "#eefbf3",
    100: "#d6f5e2",
    200: "#b0e9c8",
    300: "#7ed7a6",
    400: "#4dbf82",
    500: "#28a668",
    600: "#1b8654",
    700: "#166b45",
    800: "#135538",
    900: "#0f4530",
  },
  surface: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
    950: "#020617",
  },
  success: "#16a34a",
  danger: "#ef4444",
  info: "#0ea5e9",
  warning: "#f59e0b",
  bg: "#f8fafc",
  card: "#ffffff",
  border: "#e2e8f0",
  text: "#0f172a",
  muted: "#64748b",
} as const;

export const radius = { sm: 8, md: 12, lg: 16, xl: 20, "2xl": 24, full: 999 };
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, "2xl": 24, "3xl": 32 };
export const shadow = {
  card: {
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
};

export const ACCOUNT_TYPE_LABEL: Record<string, string> = {
  cash: "Tunai",
  bank: "Bank",
  ewallet: "E-Wallet",
  credit: "Kartu Kredit",
  investment: "Investasi",
  other: "Lain-lain",
};

export const PRESET_COLORS = [
  "#28a668", "#22c55e", "#0ea5e9", "#2563eb", "#8b5cf6",
  "#ec4899", "#f97316", "#f59e0b", "#eab308", "#ef4444",
  "#14b8a6", "#64748b",
];
