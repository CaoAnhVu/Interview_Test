'use strict';

export function sum_to_n_a(n) {
  if (!Number.isFinite(n)) return NaN;
  if (n <= 0) return 0;
  let sum = 0;
  for (let i = 1; i <= n; i++) sum += i;
  return sum;
}

export function sum_to_n_b(n) {
  if (!Number.isFinite(n)) return NaN;
  if (n <= 0) return 0;
  return n % 2 === 0 ? (n / 2) * (n + 1) : ((n + 1) / 2) * n;
}

export function sum_to_n_c(n) {
  if (!Number.isFinite(n)) return NaN;
  if (n <= 0) return 0;
  if (n === 1) return 1;
  return n + sum_to_n_c(n - 1);
}
