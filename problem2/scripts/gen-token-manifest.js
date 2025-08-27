#!/usr/bin/env node
/* ESM-friendly version */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '..');
const ICON_DIR = path.join(ROOT, 'icons', 'tokens');
const OUT_FILE = path.join(ROOT, 'token-manifest.json');

function main() {
  if (!fs.existsSync(ICON_DIR)) {
    console.error('Icons directory not found:', ICON_DIR);
    process.exit(1);
  }
  const files = fs.readdirSync(ICON_DIR).filter((f) => f.toLowerCase().endsWith('.svg'));
  const symbols = files.map((f) => path.basename(f, path.extname(f))).map((n) => n.toUpperCase());
  const unique = Array.from(new Set(symbols)).sort();
  fs.writeFileSync(OUT_FILE, JSON.stringify({ symbols: unique }, null, 2));
  console.log(`Wrote ${unique.length} symbols to ${path.relative(ROOT, OUT_FILE)}`);
}

main();
