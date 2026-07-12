export function formatCurrency(amount: number, currency = "IDR", locale = "id-ID"): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "IDR" ? 0 : 2,
      minimumFractionDigits: currency === "IDR" ? 0 : 2,
    }).format(amount || 0);
  } catch {
    return `${currency} ${amount.toLocaleString(locale)}`;
  }
}

export function formatCompact(amount: number, currency = "IDR", locale = "id-ID"): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  const symbol = currency === "IDR" ? "Rp" : currency;
  let n = abs;
  let suffix = "";
  if (abs >= 1_000_000_000) {
    n = abs / 1_000_000_000;
    suffix = " M";
  } else if (abs >= 1_000_000) {
    n = abs / 1_000_000;
    suffix = " jt";
  } else if (abs >= 1_000) {
    n = abs / 1_000;
    suffix = " rb";
  }
  const num = n >= 100 ? n.toFixed(0) : n >= 10 ? n.toFixed(1) : n.toFixed(2);
  const cleaned = num.endsWith(".00") ? num.slice(0, -3) : num.endsWith("0") && num.includes(".") ? num.slice(0, -1) : num;
  return `${sign}${symbol} ${cleaned}${suffix}`.replace(/\.(\D|$)/, ",$1");
}

export function formatDate(iso: string, opts?: Intl.DateTimeFormatOptions): string {
  try {
    const d = new Date(iso.includes("T") || iso.includes(" ") ? iso.replace(" ", "T") : iso);
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      ...opts,
    }).format(d);
  } catch {
    return iso;
  }
}

export function formatDateTime(iso: string): string {
  return formatDate(iso, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatMonth(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, (m || 1) - 1, 1);
  return new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(d);
}

export function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function addMonth(ym: string, delta: number): string {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, (m || 1) - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function inputDateTimeValue(iso?: string): string {
  const d = iso ? new Date(iso.replace(" ", "T")) : new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function inputDateValue(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
