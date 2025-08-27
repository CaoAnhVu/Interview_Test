Test_Interview

# Problem 1: Three ways to sum to n

This problem requires implementing three different approaches to calculate the sum from 1 to `n`.

### Implementations

- Located in `check-problem1.js`
- Exports three functions:
  - `sum_to_n_a(n)`
  - `sum_to_n_b(n)`
  - `sum_to_n_c(n)`

### Test Script

- Located in `run-tests.js`
- Runs a set of test cases against all three implementations

### Run Tests

Make sure you have **Node.js v16+** installed.

```bash
cd problem1
npm install   # (no dependencies, just sets up package.json)
npm run test
```

### Problem 2: Fancy Form (Currency Swap)

- Source code is inside `problem2/`:
  - `index.html`, `styles.css`, `app.js`
  - `scripts/gen-token-manifest.js` (for generating token manifest)

#### Features

- Select source and destination tokens, input amount
- Swap direction button ⇄
- Form validation (required fields, numeric input)
- Mocked exchange rate fetching with artificial delay
- Loading state and error handling
- Estimated output amount after swap

### Run the Demo

Make sure you have **Node.js >= 16** installed.

```bash
cd problem2
npm install
npm run tokens   # generate token-manifest.json
npm run dev      # start local dev server

Then open `http://localhost:5173` to use the form.



```

### Problem 3: Messy React - Refactored Solution

##Issues in the Original Code

1. **TypeScript & Type Safety**

   - `getPriority(blockchain: any)` used `any` → lost type safety.
   - `WalletBalance` interface missing the `blockchain` field → runtime errors when accessing `balance.blockchain`.

2. **Logic Errors**

   - Filter condition incorrect: `lhsPriority` undefined.
   - Balances with `amount <= 0` were kept instead of being excluded.

3. **Performance & Inefficiencies**

   - `useMemo` dependencies `[balances, prices]` were incorrect (prices unused in filter/sort) → unnecessary recomputation.
   - `formattedBalances` computed but not used → redundant processing.

4. **React Anti-Patterns**

   - Using array `index` as key in `.map()` → can cause reconciliation issues.
   - Should use unique identifiers (`currency` or `blockchain`) as keys.

5. **Maintainability**
   - `getPriority` implemented as a long `switch-case` → not scalable.
   - `.toFixed()` called without arguments → loses decimal precision.

---

## Improvements in the Refactored Code

- Added `blockchain` field to `WalletBalance` interface.
- Replaced `switch-case` in `getPriority` with `PRIORITY_MAP` object → easy to extend.
- Corrected filter logic:
  - Excludes balances with `amount <= 0`.
  - Removes unsupported blockchains.
- Combined `filter + sort + map` in a single `useMemo` block → better performance.
- Correct `useMemo` dependencies `[balances, prices]`.
- Used `currency` as `key` in `.map()` for uniqueness.
- Improved formatting: `amount.toFixed(2)` → always 2 decimal places.
- Cleaner, type-safe, maintainable code without redundancy.

---

## Files Included

- `WalletPage.tsx` – Main React component that renders wallet balances.
- `WalletRow.tsx` – Child component displaying each wallet row.
- `README.md` – Documentation explaining issues, refactor, and usage.

---

## 🛠 Setup & Run

1. Place `WalletPage.tsx` and `WalletRow.tsx` inside your project directory (e.g., `src/pages` or `src/components`).

2. Import and render `WalletPage` in your main `App` component:

```tsx
import React from 'react';
import WalletPage from './pages/WalletPage';

function App() {
  return <WalletPage />;
}

export default App;
```
