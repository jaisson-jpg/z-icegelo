import { prisma } from "./prisma";

export type ChartPoint = { label: string; total: number; count: number };

export async function getSalesStats() {
  const orders = await prisma.order.findMany({
    where: { status: "CONFIRMED", confirmedAt: { not: null } },
    select: { total: true, confirmedAt: true },
  });

  const weekly = new Map<string, ChartPoint>();
  const monthly = new Map<string, ChartPoint>();
  const yearly = new Map<string, ChartPoint>();

  const now = new Date();

  for (let i = 7; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    const key = getWeekKey(d);
    weekly.set(key, { label: formatWeekLabel(d), total: 0, count: 0 });
  }

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthly.set(key, {
      label: d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
      total: 0,
      count: 0,
    });
  }

  for (const o of orders) {
    if (!o.confirmedAt) continue;
    const d = o.confirmedAt;
    const wk = getWeekKey(d);
    const mo = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const yr = String(d.getFullYear());

    if (weekly.has(wk)) {
      const p = weekly.get(wk)!;
      p.total += o.total;
      p.count += 1;
    }
    if (monthly.has(mo)) {
      const p = monthly.get(mo)!;
      p.total += o.total;
      p.count += 1;
    }
    if (!yearly.has(yr)) {
      yearly.set(yr, { label: yr, total: 0, count: 0 });
    }
    const yp = yearly.get(yr)!;
    yp.total += o.total;
    yp.count += 1;
  }

  return {
    weekly: Array.from(weekly.values()),
    monthly: Array.from(monthly.values()),
    yearly: Array.from(yearly.values()).sort((a, b) => a.label.localeCompare(b.label)),
    totalRevenue: orders.reduce((s, o) => s + o.total, 0),
    totalOrders: orders.length,
  };
}

function getWeekKey(d: Date) {
  const start = new Date(d);
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1);
  start.setDate(diff);
  return start.toISOString().slice(0, 10);
}

function formatWeekLabel(d: Date) {
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}
