// STAGE 4 - SERVER COMPONENT. The page is rendered at build time. Only the banner,
// the chart and the filterable table ship JavaScript.
import Image from 'next/image';
import { makeOrders } from '../lib/data';
import { computeStats, toRow } from '../lib/stats';
import BannerSlot from '../components/BannerSlot';
import ChartSection from '../components/ChartSection';
import OrdersTable from '../components/OrdersTable';

export default function Page() {
  const orders = makeOrders(3000);
  const stats = computeStats(orders);
  const initial = { total: orders.length, rows: orders.slice(0, 50).map(toRow) };

  return (
    <>
      <div className="hero">
        <Image src="/img/hero.jpg" alt="Mountain ridge at dusk" fill priority sizes="100vw" />
        <h1>Summit Gear Co.</h1>
      </div>
      <div className="wrap">
        <BannerSlot />

        <div className="stats">
          <div className="stat"><span>Orders</span><strong>{stats.count}</strong></div>
          <div className="stat"><span>Revenue</span><strong>${Math.round(stats.total).toLocaleString('en-US')}</strong></div>
          <div className="stat"><span>Top region</span><strong>{stats.bestRegion}</strong></div>
        </div>

        <h2>Revenue by month</h2>
        <div className="chart">
          <ChartSection data={stats.monthly} />
        </div>

        <h2>Gear</h2>
        <div className="gallery">
          {Array.from({ length: 24 }, (_, i) => (
            <Image key={i} src={`/img/gear-${i + 1}.jpg`} alt={`Gear ${i + 1}`} width={1600} height={1067} sizes="(max-width: 600px) 50vw, 220px" />
          ))}
        </div>

        <h2>Orders</h2>
        <OrdersTable initial={initial} />
      </div>
    </>
  );
}
