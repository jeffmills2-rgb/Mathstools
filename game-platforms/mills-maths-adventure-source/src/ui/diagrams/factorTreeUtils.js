/**
 * Pure helpers for the factor-tree diagram (Phase 3E) — no React, so the
 * system checks can import and verify tree consistency headlessly.
 */

// The split chain for n, e.g. 72 → [[2,36],[2,18],[2,9],[3,3]] (the final
// quotient is prime). Each step splits off the smallest prime factor.
export function factorChain(n) {
  const chain = [];
  let x = Math.max(2, Math.floor(n));
  const smallestPrime = (v) => {
    for (let p = 2; p * p <= v; p++) if (v % p === 0) return p;
    return v;
  };
  while (true) {
    const p = smallestPrime(x);
    if (p === x) break; // x itself is prime — chain ends
    chain.push([p, x / p]);
    x = x / p;
  }
  return chain;
}
