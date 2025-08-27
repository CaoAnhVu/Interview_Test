'use strict';

// Token universe
const COMMON_FIATS = ['USD', 'EUR', 'JPY', 'GBP', 'AUD'];
// Icon alias mapping when symbol and file name differ
const ICON_ALIASES = {
  EVMOS: 'EVMOS',
  EUR: 'eur',
  JPY: 'jpy',
  GBT: 'gbt',
  AUT: 'aut',
  EEUR: 'EEUR',
  EUROC: 'EUROC',
};
let AVAILABLE_TOKENS = [
  { symbol: 'USD', name: 'USD', type: 'fiat' },
  { symbol: 'EUR', name: 'EUR', type: 'fiat' },
  { symbol: 'JPY', name: 'JPY', type: 'fiat' },
  { symbol: 'GBP', name: 'GBP', type: 'fiat' },
  { symbol: 'AUD', name: 'AUD', type: 'fiat' },
];
let ICON_SYMBOLS = new Set();

// Mock API: deterministic pseudo-rates generated from symbols
async function fetchRate(from, to) {
  // Simulate latency
  await new Promise((r) => setTimeout(r, 650));
  if (from === to) return 1;
  // Deterministic numeric seed from chars
  const seed = [...(from + to)].reduce((a, c) => a + c.charCodeAt(0), 0);
  // Map to 0.2..3.5 range
  const rate = 0.2 + (seed % 330) / 100;
  return Number(rate.toFixed(4));
}

// Switcheo public price feed (bonus requirement 4-5)
const SWITCHEO_PRICE_URL = 'https://interview.switcheo.com/prices.json';
let switcheoCache = { map: null, ts: 0 };

async function getSwitcheoPrices() {
  const now = Date.now();
  if (switcheoCache.map && now - switcheoCache.ts < 60_000) return switcheoCache.map;
  const res = await fetch(SWITCHEO_PRICE_URL);
  const arr = await res.json();
  const map = Object.create(null);
  for (const item of arr) {
    if (!item || !item.currency) continue;
    const sym = String(item.currency).toUpperCase();
    const price = Number(item.price);
    if (Number.isFinite(price)) map[sym] = price;
  }
  // Ensure USD baseline if missing
  if (map.USD == null) map.USD = 1;
  switcheoCache = { map, ts: now };
  return map;
}

const els = {
  form: document.getElementById('swapForm'),
  from: document.getElementById('fromToken'),
  to: document.getElementById('toToken'),
  amount: document.getElementById('amount'),
  hint: document.getElementById('rateHint'),
  status: document.getElementById('status'),
  resultBig: document.getElementById('resultBig'),
  submit: document.getElementById('submitBtn'),
  swap: document.getElementById('swapBtn'),
  optionTemplate: document.getElementById('optionTemplate'),
  fromIcon: document.getElementById('fromIcon'),
  toIcon: document.getElementById('toIcon'),
  fromSearch: document.getElementById('fromSearch'),
  toSearch: document.getElementById('toSearch'),
  themeToggle: document.getElementById('themeToggle'),
};

function fillOptions(select, filter = '') {
  select.innerHTML = '';
  const q = filter.trim().toLowerCase();
  for (const t of AVAILABLE_TOKENS) {
    if (q && !`${t.symbol} ${t.name}`.toLowerCase().includes(q)) continue;
    const opt = document.createElement('option');
    opt.value = t.symbol;
    opt.textContent = `${t.symbol} — ${t.name}`;
    select.appendChild(opt);
  }
}

function getLocalIconPath(symbol) {
  return `icons/tokens/${symbol}.svg`;
}

function tryIconCandidates(imgEl, symbol) {
  const base = ICON_ALIASES[symbol] || symbol;
  const candidates = [
    `icons/tokens/${base}.svg`,
    `icons/tokens/${base.toLowerCase()}.svg`,
    `icons/tokens/${symbol}.svg`,
    `icons/tokens/${symbol.toLowerCase()}.svg`,
    `icons/tokens/${base}.png`,
    `icons/tokens/${base.toLowerCase()}.png`,
    `icons/tokens/${symbol}.png`,
    `icons/tokens/${symbol.toLowerCase()}.png`,
  ];
  let i = 0;
  const next = () => {
    if (i >= candidates.length) {
      imgEl.style.visibility = 'hidden';
      return;
    }
    const src = candidates[i++];
    imgEl.onerror = next;
    imgEl.onload = () => {
      imgEl.style.visibility = 'visible';
    };
    imgEl.src = src;
  };
  next();
}

function updateIcons() {
  const f = AVAILABLE_TOKENS.find((x) => x.symbol === els.from.value);
  const t = AVAILABLE_TOKENS.find((x) => x.symbol === els.to.value);
  if (f) tryIconCandidates(els.fromIcon, f.symbol);
  if (t) tryIconCandidates(els.toIcon, t.symbol);
}

function setLoading(isLoading) {
  els.submit.disabled = isLoading;
  els.status.textContent = isLoading ? 'Đang tải tỷ giá…' : '';
}

async function refreshRateHint() {
  const from = els.from.value;
  const to = els.to.value;
  if (!from || !to) return;
  try {
    setLoading(true);
    const rate = await getLiveRateOrMock(from, to);
    els.hint.textContent = `1 ${from} ≈ ${rate} ${to}`;
  } catch (e) {
    els.status.classList.add('error');
    els.status.textContent = 'Không lấy được tỷ giá. Vui lòng thử lại!';
  } finally {
    setLoading(false);
  }
}

function validate() {
  const errors = [];
  const from = els.from.value;
  const to = els.to.value;
  const amount = Number(els.amount.value);
  if (!from) errors.push('Chưa chọn token nguồn');
  if (!to) errors.push('Chưa chọn token đích');
  if (from && to && from === to) errors.push('Token nguồn và đích không được trùng nhau');
  if (!Number.isFinite(amount) || amount <= 0) errors.push('Số lượng phải là số > 0');
  return errors;
}

function renderErrors(errors) {
  if (errors.length) {
    els.status.classList.add('error');
    els.status.textContent = errors.join(' · ');
  } else {
    els.status.classList.remove('error');
    els.status.textContent = '';
  }
}

async function onSubmit(ev) {
  ev.preventDefault();
  const errs = validate();
  renderErrors(errs);
  if (errs.length) return;
  try {
    setLoading(true);
    const rate = await getLiveRateOrMock(els.from.value, els.to.value);
    const amount = Number(els.amount.value);
    const { gross, fee, net } = applyFee(amount * rate);
    els.status.classList.remove('error');
    els.status.textContent = `Ước tính: nhận ${formatNum(net)} ${els.to.value} (phí ${formatNum(fee)})`;
    if (els.resultBig) {
      els.resultBig.innerHTML = `${formatNum(net)} ${els.to.value} <span class="sub">(từ ${formatNum(amount)} ${els.from.value} → ${formatNum(rate)} ${els.to.value}/${els.from.value})</span>`;
    }
    pushHistory({ time: Date.now(), from: els.from.value, to: els.to.value, amount, rate, fee, net });
  } catch (e) {
    els.status.classList.add('error');
    els.status.textContent = 'Có lỗi khi thực hiện swap. Vui lòng thử lại!';
    if (els.resultBig) els.resultBig.textContent = '';
  } finally {
    setLoading(false);
  }
}

function onSwap() {
  const tmp = els.from.value;
  els.from.value = els.to.value;
  els.to.value = tmp;
  updateIcons();
  refreshRateHint();
}

async function init() {
  // build AVAILABLE_TOKENS from price feed + common fiats
  try {
    const map = await getSwitcheoPrices();
    const allSymbols = Object.keys(map);
    const cryptoSymbols = allSymbols.filter((s) => !COMMON_FIATS.includes(s));
    AVAILABLE_TOKENS = [...COMMON_FIATS.map((s) => ({ symbol: s, name: s, type: 'fiat' })), ...cryptoSymbols.map((s) => ({ symbol: s, name: s, type: 'crypto' }))];
  } catch {}
  // Merge token-manifest.json if present to include every local icon
  try {
    const res = await fetch('token-manifest.json');
    if (res.ok) {
      const manifest = await res.json();
      ICON_SYMBOLS = new Set((manifest.symbols || []).map((s) => s.toUpperCase()));
      const set = new Set(AVAILABLE_TOKENS.map((t) => t.symbol));
      (manifest.symbols || []).forEach((s) => {
        if (!set.has(s)) {
          AVAILABLE_TOKENS.push({ symbol: s, name: s, type: COMMON_FIATS.includes(s) ? 'fiat' : 'crypto' });
          set.add(s);
        }
      });
    }
  } catch {}
  // remove tokens without local icon if a manifest is present
  if (ICON_SYMBOLS.size) {
    const hasLocalIcon = (sym) => {
      const base = (ICON_ALIASES[sym] || sym).toUpperCase();
      return ICON_SYMBOLS.has(base) || ICON_SYMBOLS.has(base.toLowerCase());
    };
    AVAILABLE_TOKENS = AVAILABLE_TOKENS.filter((t) => hasLocalIcon(t.symbol));
  }
  fillOptions(els.from);
  fillOptions(els.to);
  els.from.value = 'USD';
  els.to.value = 'EUR';
  updateIcons();
  await refreshRateHint();

  els.form.addEventListener('submit', onSubmit);
  els.swap.addEventListener('click', onSwap);
  els.from.addEventListener('change', () => {
    updateIcons();
    refreshRateHint();
  });
  els.to.addEventListener('change', () => {
    updateIcons();
    refreshRateHint();
  });
  if (els.fromSearch) els.fromSearch.addEventListener('input', () => fillOptions(els.from, els.fromSearch.value));
  if (els.toSearch) els.toSearch.addEventListener('input', () => fillOptions(els.to, els.toSearch.value));
  if (els.themeToggle) {
    els.themeToggle.addEventListener('change', () => setTheme(els.themeToggle.checked ? 'light' : 'dark'));
    const saved = localStorage.getItem('theme_pref');
    if (saved) setTheme(saved);
  }
  renderHistory();
}

document.addEventListener('DOMContentLoaded', init);

// ---------------- Formatting, fee, history, live rates ----------------

function formatNum(n, maximumFractionDigits = 6) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits }).format(n);
}

function applyFee(gross) {
  const feeRate = 0.003; // 0.3%
  const fee = gross * feeRate;
  const net = gross - fee;
  return { gross, fee, net };
}

function setTheme(mode) {
  const root = document.body;
  if (mode === 'light') {
    root.classList.add('light');
    els.themeToggle.checked = true;
  } else {
    root.classList.remove('light');
    els.themeToggle.checked = false;
  }
  localStorage.setItem('theme_pref', mode);
}

const HISTORY_KEY = 'swap_history_v1';
function pushHistory(entry) {
  const arr = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  arr.unshift(entry);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(arr.slice(0, 20)));
  renderHistory();
}

function renderHistory() {
  const container = document.getElementById('history');
  const arr = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  if (!arr.length) {
    container.innerHTML = '';
    return;
  }
  const items = arr
    .map((e) => {
      const date = new Date(e.time);
      const when = date.toLocaleTimeString();
      const pair = `${e.from}→${e.to}`;
      return `<li><span>${when} · ${pair}</span><span>${formatNum(e.amount)} → ${formatNum(e.net)}</span></li>`;
    })
    .join('');
  container.innerHTML = `<h3>Lịch sử</h3><ul>${items}</ul>`;
}

async function getLiveRateOrMock(from, to) {
  try {
    const live = await getLiveRate(from, to);
    if (Number.isFinite(live)) return Number(live.toFixed(6));
    return await fetchRate(from, to);
  } catch {
    return await fetchRate(from, to);
  }
}

async function getLiveRate(from, to) {
  if (from === to) return 1;
  const [usdFrom, usdTo] = await Promise.all([getUsdValue(from), getUsdValue(to)]);
  if (!Number.isFinite(usdFrom) || !Number.isFinite(usdTo)) throw new Error('Missing price');
  return usdFrom / usdTo;
}

async function getUsdValue(symbol) {
  const up = symbol.toUpperCase();
  if (up === 'USD') return 1;
  try {
    const map = await getSwitcheoPrices();
    const p = map[up];
    if (Number.isFinite(p)) return p;
  } catch {}
  if (COMMON_FIATS.includes(up)) {
    const res = await fetch(`https://api.exchangerate.host/convert?from=${up}&to=USD`);
    const data = await res.json();
    if (data && Number.isFinite(data.result)) return data.result;
  }
  throw new Error('No USD price');
}
