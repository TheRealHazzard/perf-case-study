// Runs Lighthouse (mobile preset, simulated throttling) N times against the
// production server and prints/stores the median of each metric.
//   npm run build && npm start      (in one terminal)
//   npm run measure -- <label>      (in another)
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { mkdirSync, writeFileSync } from 'node:fs';

const label = process.argv[2] ?? 'run';
const url = process.env.URL ?? 'http://localhost:4100/';
const RUNS = Number(process.env.RUNS ?? 5);

const median = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
const chrome = await chromeLauncher.launch({
  chromePath: process.env.CHROME_PATH,
  chromeFlags: ['--headless=new', '--no-sandbox'],
});

const samples = [];
for (let i = 0; i < RUNS; i++) {
  const { lhr } = await lighthouse(url, { port: chrome.port, output: 'json', logLevel: 'error', onlyCategories: ['performance'] });
  const a = lhr.audits;
  samples.push({
    score: Math.round(lhr.categories.performance.score * 100),
    fcp: a['first-contentful-paint'].numericValue,
    lcp: a['largest-contentful-paint'].numericValue,
    tbt: a['total-blocking-time'].numericValue,
    cls: a['cumulative-layout-shift'].numericValue,
    si: a['speed-index'].numericValue,
    bytes: a['total-byte-weight'].numericValue,
  });
}
await chrome.kill();

const keys = Object.keys(samples[0]);
const result = { label, runs: RUNS, ...Object.fromEntries(keys.map((k) => [k, median(samples.map((s) => s[k]))])) };
mkdirSync('results', { recursive: true });
writeFileSync(`results/${label}.json`, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
