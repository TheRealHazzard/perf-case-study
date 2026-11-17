'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function RevenueChart({ data }: { data: { month: string; revenue: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid stroke="#30363d" />
        <XAxis dataKey="month" stroke="#8b949e" />
        <YAxis stroke="#8b949e" />
        <Tooltip />
        <Bar dataKey="revenue" fill="#58a6ff" />
      </BarChart>
    </ResponsiveContainer>
  );
}
