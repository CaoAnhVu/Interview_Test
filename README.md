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
