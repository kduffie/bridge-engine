export class ValueRange {
  private _from: number | null;
  private _to: number | null;

  constructor(from?: number | null, to?: number | null) {
    this._from = typeof from === 'number' ? from : null;
    this._to = typeof to === 'number' ? to : null;
  }

  static combineAlternatives(values: ValueRange[]): ValueRange {
    let from: number | null = null;
    let to: number | null = null;
    for (const v of values) {
      if (typeof v.from === 'number' && (!from || v.from < from)) {
        from = v.from;
      }
      if (typeof v.to === 'number' && (!to || v.to > to)) {
        to = v.to;
      }
    }
    return new ValueRange(from, to);
  }

  get from(): number | null {
    return this._from;
  }

  set from(value: number | null) {
    if (typeof value === 'number' && (!this._from || value > this._from)) {
      this._from = value;
    }
  }

  get to(): number | null {
    return this._to;
  }

  set to(value: number | null) {
    if (typeof value === 'number' && (!this._to || value < this._to)) {
      this._to = value;
    }
  }

  addBounds(from: number | null, to: number | null): void {
    this.from = from;
    this.to = to;
    if (from && !to && typeof this.to === 'number' && from > this.to) {
      this._to = from;
    } else if (to && !from && typeof this.from === 'number' && to < this.from) {
      this.from = to;
    }
  }

  updateFrom(other: ValueRange) {
    this.addBounds(other.from, other.to);
  }

  reset(): void {
    this._from = null;
    this._to = null;
  }

  toString(): string {
    if (this.from === null && this.to === null) {
      return '?';
    }
    if (this.from === null) {
      return `0-${this.to}`;
    }
    if (this.to === null) {
      return `${this.from}+`;
    }
    if (this.from === this.to) {
      return this.from.toString();
    }
    return `${this.from}-${this.to}`;
  }
}
