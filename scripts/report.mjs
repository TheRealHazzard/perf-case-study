// Turns results/*.json into docs/results.svg and a markdown table.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const stages = [
  ['0-baseline', 'Baseline'],
  ['1-images', 'Images'],
  ['2-bundle', 'Bundle'],
  ['3-render', 'Render'],
  ['4-server', 'Server'],
  ['5-polish', 'Polish'],
];
const data = stages.map(([id, name]) => ({ name, ...JSON.parse(readFileSync(`results/${id}.json`, 'utf8')) }));

const s = (ms) => (ms / 1000).toFixed(1) + ' s';
const mb = (b) => (b / 1048576).toFixed(1) + ' MB';
const table = [
  '| Stage | Score | LCP | TBT | CLS | Page weight |',
  '|---|---|---|---|---|---|',
  ...data.map((d) => `| ${d.name} | ${d.score} | ${s(d.lcp)} | ${Math.round(d.tbt)} ms | ${d.cls.toFixed(2)} | ${mb(d.bytes)} |`),
].join('\n');
writeFileSync('results/table.md', table + '\n');

// bar chart of the performance score per stage
const W = 760, H = 300, pad = { l: 44, r: 20, t: 24, b: 44 };
const bw = (W - pad.l - pad.r) / data.length;
const y = (v) => pad.t + (H - pad.t - pad.b) * (1 - v / 100);
const color = (v) => (v >= 90 ? '#3fb950' : v >= 50 ? '#d29922' : '#f85149');
let svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Lighthouse performance score by stage">`;
svg += `<rect width="${W}" height="${H}" rx="12" fill="#0d1117"/>`;
for (const g of [0, 50, 90, 100]) {
  svg += `<line x1="${pad.l}" x2="${W - pad.r}" y1="${y(g)}" y2="${y(g)}" stroke="#21262d"/><text x="${pad.l - 8}" y="${y(g) + 4}" fill="#8b949e" font-size="11" text-anchor="end" font-family="Segoe UI, sans-serif">${g}</text>`;
}
data.forEach((d, i) => {
  const x = pad.l + i * bw + bw * 0.2, w = bw * 0.6;
  svg += `<rect x="${x}" y="${y(d.score)}" width="${w}" height="${y(0) - y(d.score)}" rx="5" fill="${color(d.score)}"/>`;
  svg += `<text x="${x + w / 2}" y="${y(d.score) - 6}" fill="#e6edf3" font-size="13" font-weight="700" text-anchor="middle" font-family="Segoe UI, sans-serif">${d.score}</text>`;
  svg += `<text x="${x + w / 2}" y="${H - 18}" fill="#8b949e" font-size="12" text-anchor="middle" font-family="Segoe UI, sans-serif">${d.name}</text>`;
});
svg += '</svg>';
mkdirSync('docs', { recursive: true });
writeFileSync('docs/results.svg', svg);
console.log(table);
