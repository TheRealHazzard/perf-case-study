import type { Order } from './data';

const monthKey = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', timeZone: 'UTC' });
const monthName = new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' });
export const longDate = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

export function computeStats(rows: Order[]) {
  const months = new Map<string, number>();
  const regions = new Map<string, number>();
  let total = 0;
  for (const o of rows) {
    const key = monthKey.format(new Date(o.date));
    months.set(key, (months.get(key) ?? 0) + o.amount);
    regions.set(o.region, (regions.get(o.region) ?? 0) + o.amount);
    total += o.amount;
  }
  const monthly = [...months.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, revenue]) => ({ month: monthName.format(new Date(key + '-01T00:00:00Z')), revenue: Math.round(revenue) }));
  const bestRegion = [...regions.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '-';
  return { count: rows.length, total, monthly, bestRegion };
}

export type OrderRow = { id: number; customer: string; region: string; date: string; amount: string };

export function toRow(o: Order): OrderRow {
  return { id: o.id, customer: o.customer, region: o.region, date: longDate.format(new Date(o.date)), amount: o.amount.toFixed(2) };
}
