'use client';

import { useEffect, useRef, useState } from 'react';
import type { OrderRow } from '../lib/stats';

type Page = { total: number; rows: OrderRow[] };

export default function OrdersTable({ initial }: { initial: Page }) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState<Page>(initial);
  const first = useRef(true);

  // Filtering happens on the server, so the browser never holds all 3,000 orders.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const controller = new AbortController();
    const t = setTimeout(async () => {
      const res = await fetch(`/api/orders?q=${encodeURIComponent(query)}`, { signal: controller.signal });
      setPage(await res.json());
    }, 200);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [query]);

  async function more() {
    const res = await fetch(`/api/orders?q=${encodeURIComponent(query)}&offset=${page.rows.length}`);
    const next: Page = await res.json();
    setPage({ total: next.total, rows: [...page.rows, ...next.rows] });
  }

  return (
    <>
      <input className="search" placeholder="Filter by customer" value={query} onChange={(e) => setQuery(e.target.value)} />
      <table>
        <thead>
          <tr><th>#</th><th>Customer</th><th>Region</th><th>Date</th><th>Amount</th></tr>
        </thead>
        <tbody>
          {page.rows.map((o) => (
            <tr key={o.id}>
              <td>{o.id}</td><td>{o.customer}</td><td>{o.region}</td><td>{o.date}</td><td>${o.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {page.rows.length < page.total && (
        <button className="more" onClick={more}>Show more ({page.total - page.rows.length} left)</button>
      )}
    </>
  );
}
