import { isMajor, Strain, Suit, SUITS } from "./common";
import { ValueRange } from "./value-range";
import { sprintf } from 'sprintf-js';

export class HandEstimate {
  private _suits = new Map<Suit, ValueRange>();
  private _stoppers = new Map<Suit, boolean>();
  private _points = new ValueRange();

  constructor() {
    this.reset();
  }

  static combineAlternatives(estimates: HandEstimate[]): HandEstimate {
    const result = new HandEstimate();
    for (const suit of SUITS) {
      const suitValues: ValueRange[] = [];
      estimates.forEach((e) => {
        suitValues.push(e.getSuitCount(suit)!);
        if (e.hasStopper(suit)) {
          result.addStopper(suit);
        }
      });
      result._suits.set(suit, ValueRange.combineAlternatives(suitValues));
    }
    const pointValues: ValueRange[] = [];
    estimates.forEach((e) => {
      pointValues.push(e._points);
    });
    result._points = ValueRange.combineAlternatives(pointValues);
    return result;
  }

  incorporateEstimate(other: HandEstimate) {
    for (const suit of SUITS) {
      const suitValues: ValueRange[] = [];
      suitValues.push(this._suits.get(suit)!);
      suitValues.push(other.getSuitCount(suit)!);
      this._suits.set(suit, ValueRange.combineAlternatives(suitValues));
      if (other.hasStopper(suit)) {
        this._stoppers.set(suit, true);
      }
    }
    const pointValues: ValueRange[] = [];
    pointValues.push(this._points);
    pointValues.push(other._points);
    this._points = ValueRange.combineAlternatives(pointValues);
  }

  getSuitCount(suit: Suit): ValueRange {
    return this._suits.get(suit)!;
  }

  get points(): ValueRange {
    return this._points;
  }

  addStopper(suit: Suit): void {
    this._stoppers.set(suit, true);
  }
  hasStopper(suit: Suit): boolean {
    return this._stoppers.get(suit)!;
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

  addSuitBounds(suit: Suit, from: number | null, to: number | null) {
    const s = this._suits.get(suit)!;
    if (typeof from === 'number') {
      s.from = Math.max(from, s.from || 0);
      if (s.to && s.to < from) {
        s.to = from;
      }
      if (from >= 4) {
        this.addStopper(suit);
      }
    }
    if (typeof to === 'number') {
      s.to = Math.min(to, s.to || Number.MAX_SAFE_INTEGER);
      if (s.from && s.from > to) {
        s.from = to;
      }
    }
  }

  updateFrom(other: HandEstimate) {
    for (const [s, r] of other._suits.entries()) {
      this._suits.get(s)!.updateFrom(r);
    }
    for (const [s, r] of other._stoppers.entries()) {
      this._stoppers.set(s, r);
    }
    this._points.updateFrom(other._points);
  }


  reset(): void {
    for (const suit of SUITS) {
      this._suits.set(suit, new ValueRange());
      this._stoppers.set(suit, false);
    }
    this._points.reset();
  }

  toString(): string {
    const dist: string[] = [];
    for (const suit of SUITS) {
      const d = this._suits.get(suit)!;
      dist.push(sprintf('%-6s', `${suit}: ${d.toString()}${this.hasStopper(suit) ? '*' : ''}`));
    }
    return sprintf('pts: %-5s   %s', this._points.toString(), dist.join('   '));
  }
}
