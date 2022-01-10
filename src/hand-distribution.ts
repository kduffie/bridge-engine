import { isMajor, Suit, SUITS } from "./common";
import { sprintf } from 'sprintf-js';
import { ValueRange } from "./value-range";

export class HandDistribution {
  private _suits = new Map<Suit, ValueRange>();

  constructor() {
    this.reset();
  }

  getSuitDistribution(suit: Suit): ValueRange {
    return this._suits.get(suit)!;
  }

  enforceNtDistribution(): void {
    for (const [s, r] of this._suits.entries()) {
      if (!r.from || r.from < 2) {
        r.from = 2;
      }
      if (isMajor(s)) {
        r.to = 4;
      }
    }
  }

  strengthenSuitBounds(suit: Suit, from: number | null, to: number | null) {
    const s = this._suits.get(suit)!;
    if (typeof from === 'number') {
      s.from = Math.max(from, s.from || 0);
    }
    if (typeof to === 'number') {
      s.to = Math.min(to, s.to || Number.MAX_SAFE_INTEGER);
    }
  }

  reset(): void {
    for (const suit of SUITS) {
      this._suits.set(suit, new ValueRange());
    }
  }

  toString(): string {
    const result: string[] = [];
    for (const suit of SUITS) {
      const d = this._suits.get(suit)!;
      result.push(sprintf('%-10s', `${suit}: ${d.toString()}`));
    }
    return result.join('  ');
  }
}
