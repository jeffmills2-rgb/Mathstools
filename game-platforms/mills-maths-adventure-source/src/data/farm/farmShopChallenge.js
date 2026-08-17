/**
 * THE FARM SHOP (F13) — PERCENTAGES CAPSTONE. Run the market stall for a day:
 * price stock with a % MARKUP, apply a rainy-day % DISCOUNT, add 10% GST at the
 * till, and read the PROFIT/LOSS as a % of cost. Plus unitary-method RESTOCKS
 * ("12 melons are 30% of the crop — how many total?") and quick "what % is X of
 * Y?" rounds.
 *
 * A "market day" is a CONNECTED CHAIN: cost → markup → rainy discount → +GST →
 * profit%. Consecutive rounds share the product and carry the correct running
 * price forward, so each step builds on the last (a hybrid set also mixes in
 * standalone markup/discount, restock and "% of another" rounds).
 *
 * All money is held in INTEGER CENTS so no float dust ever reaches a price or a
 * grade. GST is the Australian 10%. Every chain is DERIVED (not hand-typed) and
 * the checks prove markup/discount/GST/profit all land on exact cents.
 */

export const SHOP_ROUNDS_PER_SET = 15;
export const SHOP_ROUND_POINTS = 25;
export const GST_RATE = 10; // percent (Australia)

const PRODUCTS = [
  { name: "pumpkins", emoji: "🎃" }, { name: "melons", emoji: "🍈" },
  { name: "apples", emoji: "🍎" }, { name: "tomatoes", emoji: "🍅" },
  { name: "carrots", emoji: "🥕" }, { name: "corn", emoji: "🌽" },
  { name: "strawberries", emoji: "🍓" }, { name: "potatoes", emoji: "🥔" },
  { name: "pears", emoji: "🍐" }, { name: "honey jars", emoji: "🍯" },
];

// ---- money helpers (integer cents in, strings out) ----
export function fmtMoney(cents) {
  const sign = cents < 0 ? "-" : "";
  const v = Math.abs(cents);
  return `${sign}$${Math.floor(v / 100)}.${String(v % 100).padStart(2, "0")}`;
}
export function fmtPct(n) {
  return `${n}%`;
}

function pick(list, rand) {
  return list[Math.floor(rand() * list.length)];
}

// ---- chain math (all rounding is a no-op for the curated combos; the checks
//      assert every intermediate is an exact whole number of cents) ----
function markupCents(costC, m) { return Math.round((costC * (100 + m)) / 100); }
function discountCents(markedC, d) { return Math.round((markedC * (100 - d)) / 100); }
function gstCents(saleC) { return Math.round((saleC * (100 + GST_RATE)) / 100); }

/** Build one market-day chain from a (cost $, markup %, discount %) combo. */
export function buildChain(costD, m, d) {
  const costC = costD * 100;
  const markedC = markupCents(costC, m);
  const saleC = discountCents(markedC, d);
  const gstC = gstCents(saleC);
  const profitC = saleC - costC;
  const profitPct = Math.round((profitC / costC) * 1000) / 10; // 1 dp
  return { costC, m, markedC, d, saleC, gstC, profitC, profitPct, loss: profitC < 0 };
}

// Curated (cost, markup, discount) combos — chosen so markup, discount and GST
// are all exact cents and profit% is a clean value. Mix of profit and loss.
const CHAIN_COMBOS = [
  [10, 50, 20], // → $15 → $12, GST $13.20, profit $2 = 20%
  [8, 25, 10], //  → $10 → $9,  GST $9.90,  profit $1 = 12.5%
  [12, 50, 25], // → $18 → $13.50, GST $14.85, profit $1.50 = 12.5%
  [5, 100, 20], // → $10 → $8,  GST $8.80,  profit $3 = 60%
  [6, 50, 10], //  → $9  → $8.10, GST $8.91, profit $2.10 = 35%
  [25, 20, 10], // → $30 → $27, GST $29.70, profit $2 = 8%
  [8, 50, 25], //  → $12 → $9,  GST $9.90,  profit $1 = 12.5%
  [15, 20, 25], // → $18 → $13.50, GST $14.85, LOSS $1.50 = -10%
  [10, 20, 25], // → $12 → $9,  GST $9.90,  LOSS $1 = -10%
  [20, 25, 20], // → $25 → $20, GST $22.00, break-even 0%
];
const CHAINS = CHAIN_COMBOS.map(([c, m, d]) => buildChain(c, m, d));
const PROFIT_CHAINS = CHAINS.filter((c) => !c.loss && c.profitC > 0);
const LOSS_CHAINS = CHAINS.filter((c) => c.loss);

// Unitary restock combos as (whole, pct) → part = whole*pct/100 (all integers).
const RESTOCK_COMBOS = [
  [40, 30], [60, 25], [60, 15], [90, 20], [60, 35],
  [50, 16], [110, 30], [70, 20], [60, 45], [80, 25],
];

// "What % is a of b?" combos as (a, b) → pct = a/b*100 (all whole percents).
const PERCENTOF_COMBOS = [
  [12, 48], [15, 60], [9, 36], [20, 50], [18, 24],
  [7, 20], [13, 20], [24, 60], [30, 40], [9, 30],
];

// ---- round builders ----
function chainRounds(chain, product, chainId, rand) {
  const { costC, m, markedC, d, saleC, gstC, profitC, profitPct } = chain;
  const P = `${product.emoji} ${product.name}`;
  return [
    {
      kind: "markup", product, chainId, chainStep: 1, chainSteps: 4,
      given: { costStr: fmtMoney(costC), markupPct: m },
      prompt: `Buy ${P} at ${fmtMoney(costC)} each. Mark them up ${m}%. What is the SELL price?`,
      answer: markedC / 100, answerUnit: "$", answerStr: fmtMoney(markedC), tolerance: 0.005,
      reason: `${fmtMoney(costC)} + ${m}% of ${fmtMoney(costC)} = ${fmtMoney(markedC)}.`,
    },
    {
      kind: "discount", product, chainId, chainStep: 2, chainSteps: 4,
      given: { markedStr: fmtMoney(markedC), discountPct: d },
      prompt: `Rainy day! Take ${d}% OFF the ${fmtMoney(markedC)} ${product.name}. What is the new price?`,
      answer: saleC / 100, answerUnit: "$", answerStr: fmtMoney(saleC), tolerance: 0.005,
      reason: `${fmtMoney(markedC)} − ${d}% = ${fmtMoney(saleC)}.`,
    },
    {
      kind: "gst", product, chainId, chainStep: 3, chainSteps: 4,
      given: { saleStr: fmtMoney(saleC), gstRate: GST_RATE },
      prompt: `At the till, add ${GST_RATE}% GST to the ${fmtMoney(saleC)} price. What does the customer pay?`,
      answer: gstC / 100, answerUnit: "$", answerStr: fmtMoney(gstC), tolerance: 0.005,
      reason: `${fmtMoney(saleC)} + ${GST_RATE}% GST = ${fmtMoney(gstC)}.`,
    },
    {
      kind: "profit", product, chainId, chainStep: 4, chainSteps: 4,
      given: { costStr: fmtMoney(costC), saleStr: fmtMoney(saleC) },
      prompt: `You paid ${fmtMoney(costC)} and sold for ${fmtMoney(saleC)} (before GST). Profit as a % of cost? (a loss is negative)`,
      answer: profitPct, answerUnit: "%", answerStr: `${profitPct}%`, tolerance: 0.1,
      reason: `${fmtMoney(saleC)} − ${fmtMoney(costC)} = ${fmtMoney(profitC)}, and ${fmtMoney(profitC)} is ${profitPct}% of ${fmtMoney(costC)}.`,
    },
  ];
}

function markupRound(rand) {
  const chain = pick(CHAINS, rand);
  const product = pick(PRODUCTS, rand);
  return {
    kind: "markup", product, chainId: null, chainStep: 0, chainSteps: 0,
    given: { costStr: fmtMoney(chain.costC), markupPct: chain.m },
    prompt: `${product.emoji} ${product.name} cost ${fmtMoney(chain.costC)}. Mark up ${chain.m}%. Sell price?`,
    answer: chain.markedC / 100, answerUnit: "$", answerStr: fmtMoney(chain.markedC), tolerance: 0.005,
    reason: `${fmtMoney(chain.costC)} + ${chain.m}% = ${fmtMoney(chain.markedC)}.`,
  };
}

function discountRound(rand) {
  const chain = pick(CHAINS, rand);
  const product = pick(PRODUCTS, rand);
  return {
    kind: "discount", product, chainId: null, chainStep: 0, chainSteps: 0,
    given: { markedStr: fmtMoney(chain.markedC), discountPct: chain.d },
    prompt: `${product.emoji} ${product.name} marked at ${fmtMoney(chain.markedC)}. Take ${chain.d}% OFF. New price?`,
    answer: chain.saleC / 100, answerUnit: "$", answerStr: fmtMoney(chain.saleC), tolerance: 0.005,
    reason: `${fmtMoney(chain.markedC)} − ${chain.d}% = ${fmtMoney(chain.saleC)}.`,
  };
}

function restockRound(rand) {
  const [whole, pct] = pick(RESTOCK_COMBOS, rand);
  const part = (whole * pct) / 100;
  const product = pick(PRODUCTS, rand);
  return {
    kind: "restock", product, chainId: null, chainStep: 0, chainSteps: 0,
    given: { part, pct },
    prompt: `Restock! These ${part} ${product.name} are ${pct}% of the whole crop. How many ${product.name} in the FULL crop?`,
    answer: whole, answerUnit: "items", answerStr: `${whole}`, tolerance: 0.5,
    reason: `${pct}% is ${part}, so 100% = ${part} ÷ ${pct} × 100 = ${whole}.`,
  };
}

function percentOfRound(rand) {
  const [a, b] = pick(PERCENTOF_COMBOS, rand);
  const pct = Math.round((a / b) * 100);
  const product = pick(PRODUCTS, rand);
  return {
    kind: "percentof", product, chainId: null, chainStep: 0, chainSteps: 0,
    given: { a, b },
    prompt: `You sold ${a} of the ${b} ${product.name}. What PERCENT did you sell?`,
    answer: pct, answerUnit: "%", answerStr: `${pct}%`, tolerance: 0.1,
    reason: `${a} out of ${b} = ${a} ÷ ${b} × 100 = ${pct}%.`,
  };
}

/**
 * A market-day SET — 15 rounds (hybrid): two "% of another" warm-ups, a
 * standalone markup + discount, a full 4-step tycoon CHAIN, two unitary
 * restocks, a second full CHAIN, and a final restock. At least one chain is a
 * LOSS so the profit/loss report always appears.
 */
export function generateShopSet(rand = Math.random) {
  const chainA = pick(CHAINS, rand);
  // chainB differs from chainA and guarantees ≥1 loss across the two chains.
  let chainB;
  if (chainA.loss) {
    do { chainB = pick(PROFIT_CHAINS, rand); } while (chainB === chainA);
  } else {
    do { chainB = pick(LOSS_CHAINS, rand); } while (chainB === chainA);
  }
  const prodA = pick(PRODUCTS, rand);
  let prodB;
  do { prodB = pick(PRODUCTS, rand); } while (prodB === prodA);

  const rounds = [
    percentOfRound(rand),
    percentOfRound(rand),
    markupRound(rand),
    discountRound(rand),
    ...chainRounds(chainA, prodA, "A", rand),
    restockRound(rand),
    restockRound(rand),
    ...chainRounds(chainB, prodB, "B", rand),
    restockRound(rand),
  ];
  return rounds.map((r, i) => ({ ...r, roundIndex: i, stage: Math.floor(i / 3) }));
}

/** Parse a typed answer: strips $, %, commas, spaces. Returns a Number or NaN. */
export function parseShopInput(raw) {
  if (raw == null) return NaN;
  const cleaned = String(raw).replace(/[$%,\s]/g, "");
  if (cleaned === "" || cleaned === "-" || cleaned === "." || cleaned === "-.") return NaN;
  return Number(cleaned);
}

/** Grade a typed answer against the round. Pure. */
export function gradeShop(round, raw) {
  const val = parseShopInput(raw);
  if (Number.isNaN(val)) return { correct: false, points: 0, valid: false };
  const correct = Math.abs(val - round.answer) <= round.tolerance;
  return { correct, points: correct ? SHOP_ROUND_POINTS : 0, valid: true };
}
