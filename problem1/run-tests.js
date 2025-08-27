'use strict';

import { sum_to_n_a, sum_to_n_b, sum_to_n_c } from './check-problem1.js';

function runCase(n) {
  const expected = n % 2 === 0 ? (n / 2) * (n + 1) : ((n + 1) / 2) * n;
  const results = [sum_to_n_a(n), sum_to_n_b(n), sum_to_n_c(n)];
  const pass = results.every((v) => v === expected);
  return { n, expected, results, pass };
}

const inputs = [0, 1, 2, 5, 10, 1000];
const report = inputs.map(runCase);

let allPass = report.every((r) => r.pass);

console.log('Cases:');
for (const r of report) {
  console.log(`n=${r.n} -> expected=${r.expected} results=${r.results.join(',')} pass=${r.pass}`);
}

if (!allPass) {
  console.error('\nSome cases failed.');
  process.exit(1);
}

console.log('\nAll cases passed.');
