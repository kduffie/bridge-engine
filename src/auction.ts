import { Bid, BidWithSeat } from "./bid";
import { getPartnerBySeat, Seat, SEATS, Vulnerability } from "./common";
import { Contract } from "./contract";
// eslint-disable-next-line no-undef
const pad = require('utils-pad-string');

export class Auction {
  private _bids: BidWithSeat[];
  private _vulnerability: Vulnerability;

  constructor(vulnerability: Vulnerability, bids: BidWithSeat[]) {
    this._vulnerability = vulnerability;
    this._bids = bids;
  }
  get bids(): BidWithSeat[] {
    return [...this._bids];
  }

  get vulnerability(): Vulnerability {
    return this._vulnerability;
  }

  getOpeningBid(): BidWithSeat | null {
    for (const b of this.bids) {
      if (b.type === 'normal') {
        return b;
      }
    }
    return null;
  }

  getBidsBySeat(seat: Seat, normalOnly: boolean): BidWithSeat[] {
    const result: BidWithSeat[] = [];
    for (const b of this.bids) {
      if (b.by === seat && (!normalOnly || b.type === 'normal')) {
        result.push(b);
      }
    }
    return result;
  }

  getFirstBidBySeat(seat: Seat): BidWithSeat | null {
    for (const b of this.bids) {
      if (b.by === seat) {
        return b;
      }
    }
    return null;
  }

  getLastBid(): BidWithSeat | null {
    if (this.bids.length > 0) {
      return this.bids[this.bids.length - 1];
    }
    return null;
  }

  getPartnerBids(mySeat: Seat, normalOnly: boolean): BidWithSeat[] {
    const partnerSeat = getPartnerBySeat(mySeat);
    return this.getBidsBySeat(partnerSeat, normalOnly);
  }

  get lastBid(): BidWithSeat | null {
    if (this.bids.length === 0) {
      return null;
    }
    return this.bids[this.bids.length - 1];
  }

  get lastNormalBid(): BidWithSeat | null {
    for (let i = 0; i < this._bids.length; i++) {
      if (this._bids[this._bids.length - 1 - i].type === 'normal') {
        return this._bids[this._bids.length - 1 - i];
      }
    }
    return null;
  }

  isGameBonusApplicable(): boolean {
    const lastBid = this.lastNormalBid;
    if (lastBid) {
      switch (lastBid.strain) {
        case 'C':
        case 'D':
          return lastBid.count >= 5;
        case 'H':
        case 'S':
          return lastBid.count >= 4;
        case 'N':
          return lastBid.count >= 3;
        default:
          throw new Error("Unhandled strain");
      }
    } else {
      return false;
    }
  }

  get numberOfPasses(): number {
    let count = 0;
    for (let i = 0; i < this._bids.length; i++) {
      if (this._bids[this._bids.length - 1 - i].type === 'pass') {
        count++;
      } else {
        return count;
      }
    }
    return count;
  }

  get openingBid(): BidWithSeat | null {
    for (const bid of this._bids) {
      if (bid.type === 'normal') {
        return bid;
      }
    }
    return null;
  }

  get currentContract(): Contract | null {
    const last = this.lastNormalBid;
    if (!last) {
      return null;
    }
    let isVulnerable = false;
    switch (this.vulnerability) {
      case 'NS':
        if (last.by === 'N' || last.by === 'S') {
          isVulnerable = true;
        }
        break;
      case 'EW':
        if (last.by === 'E' || last.by === 'W') {
          isVulnerable = true;
        }
        break;
      case 'both':
        isVulnerable = true;
        break;
      case 'none':
        break;
      default:
        throw new Error("Unhandled vulnerability");
    }
    for (let i = 0; i < this.bids.length; i++) {
      if (this._bids[this.bids.length - 1 - i].type === 'double') {
        return new Contract(last.by, last.count, last.strain, isVulnerable, 'doubled');
      } else if (this._bids[this.bids.length - 1 - i].type === 'redouble') {
        return new Contract(last.by, last.count, last.strain, isVulnerable, 'redoubled');
      } else if (this._bids[this.bids.length - 1 - i].type === 'normal') {
        return new Contract(last.by, last.count, last.strain, isVulnerable, 'none');
      }
    }
    return null;
  }

  toString(): string {
    if (this._bids.length === 0) {
      return 'No bids';
    }
    const rows: string[] = [];
    rows.push(`       N     E     S     W`);
    let column = SEATS.indexOf(this._bids[0].by);
    let row = '    ';
    for (let i = 0; i < column; i++) {
      row += pad(' ', 6);
    }
    for (const bid of this._bids) {
      row += this.center(bid.toString(false), 6);
      if (column >= 3) {
        rows.push(row);
        row = '    ';
        column = 0;
      } else {
        column++;
      }
    }
    if (column > 0) {
      rows.push(row);
    }
    return rows.join('\n');
  }

  center(value: string, width: number): string {
    let result = value;
    let left = true;
    while (result.length < width) {
      result = left ? ` ${result}` : `${result} `;
      left = !left;
    }
    return result;
  }
}
