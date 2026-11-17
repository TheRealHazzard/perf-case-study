'use client';

import dynamic from 'next/dynamic';

const RevenueChart = dynamic(() => import('./RevenueChart'), { ssr: false, loading: () => <div style={{ height: '100%' }} /> });

export default function ChartSection({ data }: { data: { month: string; revenue: number }[] }) {
  return <RevenueChart data={data} />;
}
