export type Order = {
  id: number;
  customer: string;
  region: 'North' | 'South' | 'East' | 'West';
  amount: number;
  date: string; // ISO
};

function rng(seed: number) {
  let s = seed;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

const FIRST = ['Ava', 'Noah', 'Mia', 'Liam', 'Zoe', 'Ethan', 'Ivy', 'Leo', 'Nora', 'Kai'];
const LAST = ['Reed', 'Shaw', 'Patel', 'Kim', 'Okafor', 'Silva', 'Novak', 'Haas', 'Ito', 'Cole'];
const REGIONS = ['North', 'South', 'East', 'West'] as const;

/** Deterministic fake orders, so every run (and every measurement) sees the same data. */
export function makeOrders(count = 3000): Order[] {
  const rand = rng(42);
  const start = Date.UTC(2025, 0, 1);
  return Array.from({ length: count }, (_, i) => ({
    id: 10000 + i,
    customer: `${FIRST[Math.floor(rand() * 10)]} ${LAST[Math.floor(rand() * 10)]}`,
    region: REGIONS[Math.floor(rand() * 4)],
    amount: Math.round((20 + rand() * 480) * 100) / 100,
    date: new Date(start + Math.floor(rand() * 365) * 86400000).toISOString(),
  }));
}
