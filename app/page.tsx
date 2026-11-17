'use client';

// STAGE 2 - BUNDLE. moment and lodash removed, the chart library is loaded on demand.
import { useEffect, useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { makeOrders } from '../lib/data';

const RevenueChart = dynamic(() => import('../components/RevenueChart'), {
  ssr: false,
  loading: () => <div style={{ height: '100%' }} />,
});

const orders = makeOrders(3000);
const monthKey = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', timeZone: 'UTC' });
const monthName = new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' });
const longDate = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

// Runs on every render (fixed in stage 3).
function computeStats(query: string) {
  const q = query.toLowerCase();
  const rows = orders.filter((o) => o.customer.toLowerCase().includes(q));
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
  // simulate a heavier analytics pass
  let checksum = 0;
  for (let i = 0; i < 4_000_000; i++) checksum = (checksum + i * 31) % 1000003;
  return { rows, monthly, total, bestRegion, checksum };
}

export default function Page() {
  const [query, setQuery] = useState('');
  const [banner, setBanner] = useState(false);
  const stats = computeStats(query);

  useEffect(() => {
    const t = setTimeout(() => setBanner(true), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <div className="hero">
        <Image src="/img/hero.jpg" alt="Mountain ridge at dusk" fill priority sizes="100vw" />
        <h1>Summit Gear Co.</h1>
      </div>
      <div className="wrap">
        <div className="banner-slot">{banner && <div className="banner">Free shipping on orders over $150 this week.</div>}</div>

        <div className="stats">
          <div className="stat"><span>Orders</span><strong>{stats.rows.length}</strong></div>
          <div className="stat"><span>Revenue</span><strong>${Math.round(stats.total).toLocaleString()}</strong></div>
          <div className="stat"><span>Top region</span><strong>{stats.bestRegion}</strong></div>
        </div>

        <h2>Revenue by month</h2>
        <div className="chart">
          <RevenueChart data={stats.monthly} />
        </div>

        <h2>Gear</h2>
        <div className="gallery">
          {Array.from({ length: 24 }, (_, i) => (
            <Image key={i} src={`/img/gear-${i + 1}.jpg`} alt={`Gear ${i + 1}`} width={1600} height={1067} sizes="(max-width: 600px) 50vw, 220px" />
          ))}
        </div>

        <h2>Orders</h2>
        <input className="search" placeholder="Filter by customer" value={query} onChange={(e) => setQuery(e.target.value)} />
        <table>
          <thead>
            <tr><th>#</th><th>Customer</th><th>Region</th><th>Date</th><th>Amount</th></tr>
          </thead>
          <tbody>
            {stats.rows.slice(0, 1500).map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.customer}</td>
                <td>{o.region}</td>
                <td>{longDate.format(new Date(o.date))}</td>
                <td>${o.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
