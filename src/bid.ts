import { BidType, CARD_RANKS, MAX_CONTRACT_SIZE, Seat, Strain, STRAINS } from "./common";
import * as assert from 'assert';

export const BID_PATTERN = /^(pass)|(dbl)|rdbl?|([1-7](c|d|h|s|nt?))$/i;
export class Bid {
  private _type: BidType;
  private _count?: number;
  private _strain?: Strain;
  private _description: string | null;

  constructor(_type: BidType, count?: number, strain?: Strain, description?: string | null) {
    this._type = _type;
    if (_type === 'normal') {
      assert(count && count > 0 && count <= MAX_CONTRACT_SIZE);
      assert(strain);
      this._count = count;
      this._strain = strain;
    } else {
      assert(!count && !strain, 'Count and strain not appropriate for this type of bid');
    }
    this._description = description || null;
  }

  static parse(value: string): Bid {
    if (BID_PATTERN.test(value)) {
      switch (value) {
        case 'pass':
          return new Bid('pass');
        case 'dbl':
          return new Bid('double');
        case 'rdb':
        case 'rdbl':
          return new Bid('redouble');
        default: {
          const count = Number(value.charAt(0));
          switch (value.toLowerCase().charAt(1)) {
            case 'c':
              return new Bid('normal', count, 'C');
            case 'd':
              return new Bid('normal', count, 'D');
            case 'h':
              return new Bid('normal', count, 'H');
            case 's':
              return new Bid('normal', count, 'S');
            case 'n':
              return new Bid('normal', count, 'N');
            default:
              throw new Error(`Unhandled bid ${value}`);
          }
        }
      }
    } else {
      throw new Error(`Unrecognized bid ${value}`);
    }
  }

  static createSufficient(other: Bid, strain: Strain, description?: string | null): Bid | null {
    assert(other.type === 'normal');
    let sufficientLevel = other.count;
    if (STRAINS.indexOf(other.strain) >= STRAINS.indexOf(strain)) {
      sufficientLevel++;
    }
    if (sufficientLevel > 7) {
      return null;
    }
    return new Bid('normal', sufficientLevel, strain, description);
  }

  is(count: number, strain: Strain): boolean {
    if (this.type === 'normal') {
      return this.count === count && this.strain === strain;
    }
    return false;
  }

  get type(): BidType {
    return this._type;
  }
  get count(): number {
    assert(this._type === 'normal');
    return this._count!;
  }

  get strain(): Strain {
    assert(this._type === 'normal');
    return this._strain!;
  }

  get description(): string | null {
    return this._description;
  }

  isLarger(bid: Bid | null): boolean {
    if (!bid) {
      return true;
    }
    if (bid.type !== 'normal' && this.type === 'normal') {
      return true;
    }
    if (this.type !== 'normal') {
      return false;
    }
    return this.count > bid.count || this.count === bid.count && STRAINS.indexOf(this.strain) > STRAINS.indexOf(bid.strain);
  }

  isGameBonusApplicable(): boolean {
    if (this.type === 'normal') {
      switch (this.strain) {
        case 'C':
        case 'D':
          return this.count >= 5;
        case 'H':
        case 'S':
          return this.count >= 4;
        case 'N':
          return this.count >= 3;
        default:
          throw new Error("Unhandled strain");
      }
    } else {
      return false;
    }
  }


  isEqual(bid: Bid): boolean {
    return this.type === bid.type && this.count === bid.count && this.strain === bid.strain;
  }

  toString(): string {
    switch (this.type) {
      case 'pass':
      case 'double':
      case 'redouble':
        return this.type;
      case 'normal':
        return `${this.count}${this.strain}`;
      default:
        throw new Error("Unhandled type");
    }
  }
}

export class BidWithSeat extends Bid {
  private _by: Seat;
  constructor(by: Seat, _type: BidType, count?: number, strain?: Strain) {
    super(_type, count, strain);
    this._by = by;
  }

  get by(): Seat {
    return this._by;
  }

  toString(includeBy?: boolean): string {
    if (includeBy) {
      return `${super.toString()} by ${this.by}`;
    }
    return super.toString();
  }
}
