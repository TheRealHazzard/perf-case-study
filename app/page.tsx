'use client';

// STAGE 1 - IMAGES. Responsive, modern-format images; hero preloaded, gallery lazy; no layout shift.
import { useEffect, useState } from 'react';
import Image from 'next/image';
import _ from 'lodash';
import moment from 'moment';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { makeOrders } from '../lib/data';

const orders = makeOrders(3000);

// Runs on every render, formats thousands of dates with moment, groups with lodash.
function computeStats(query: string) {
  const rows = orders.filter((o) => o.customer.toLowerCase().includes(query.toLowerCase()));
  const byMonth = _.groupBy(rows, (o) => moment(o.date).format('YYYY-MM'));
  const monthly = _.orderBy(
    Object.entries(byMonth).map(([month, list]) => ({
      month: moment(month + '-01').format('MMM'),
      key: month,
      revenue: Math.round(_.sumBy(list, 'amount')),
    })),
    'key',
  );
  const total = _.sumBy(rows, 'amount');
  const best = _.maxBy(Object.entries(_.groupBy(rows, 'region')), ([, l]) => _.sumBy(l, 'amount'));
  // simulate a heavier analytics pass
  let checksum = 0;
  for (let i = 0; i < 4_000_000; i++) checksum = (checksum + i * 31) % 1000003;
  return { rows, monthly, total, bestRegion: best?.[0] ?? '-', checksum };
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
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.monthly}>
              <CartesianGrid stroke="#30363d" />
              <XAxis dataKey="month" stroke="#8b949e" />
              <YAxis stroke="#8b949e" />
              <Tooltip />
              <Bar dataKey="revenue" fill="#58a6ff" />
            </BarChart>
          </ResponsiveContainer>
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
                <td>{moment(o.date).format('MMMM Do, YYYY')}</td>
                <td>${o.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
