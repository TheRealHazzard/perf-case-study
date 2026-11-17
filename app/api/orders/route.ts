import { makeOrders } from '../../../lib/data';
import { toRow } from '../../../lib/stats';

const orders = makeOrders(3000);
const PAGE = 50;

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') ?? '').toLowerCase();
  const offset = Number(searchParams.get('offset') ?? 0);
  const matches = orders.filter((o) => o.customer.toLowerCase().includes(q));
  return Response.json({ total: matches.length, rows: matches.slice(offset, offset + PAGE).map(toRow) });
}
