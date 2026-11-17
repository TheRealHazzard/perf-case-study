'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';

const RevenueChart = dynamic(() => import('./RevenueChart'), { ssr: false });

/** Loads the chart library only when the chart is about to scroll into view. */
export default function ChartSection({ data }: { data: { month: string; revenue: number }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => entry.isIntersecting && setNear(true), { rootMargin: '300px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return <div ref={ref} style={{ height: '100%' }}>{near && <RevenueChart data={data} />}</div>;
}
