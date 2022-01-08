import { isMajor, Suit, SUITS, ValueRange } from "./common";

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
      if (r.from < 2) {
        r.from = 2;
      }
      if (isMajor(s)) {
        r.to = 4;
      }
    }
    this.updateBounds(true);
  }

  strengthenSuitBounds(suit: Suit, from: number | null, to: number | null) {
    const s = this._suits.get(suit)!;
    if (typeof from === 'number') {
      s.from = Math.max(from, s.from);
    }
    if (typeof to === 'number') {
      s.to = Math.min(to, s.to);
    }
    this.updateBounds(true);
  }

  private updateBounds(repeat: boolean): void {
    let fromTotal = 0;
    let toTotal = 0;
    for (const r of this._suits.values()) {
      fromTotal += r.from;
      toTotal += r.to;
    }
    for (const r of this._suits.values()) {
      if (r.to > 13 - fromTotal) {
        r.to = 13 - fromTotal;
      }
      if (r.from < 13 - toTotal) {
        r.from = 13 - toTotal;
      }
    }
    if (repeat) {
      this.updateBounds(false);
    }
  }

  reset(): void {
    for (const suit of SUITS) {
      this._suits.set(suit, { from: 0, to: 13 });
    }
  }
}
