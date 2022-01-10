import { sprintf } from "sprintf-js";
import { BidWithSeat } from "../bid";
import { isMajor, Partnership, Seat, Strain, Suit, SUITS } from "../common";
import { ForceType } from "./bid-interpretation";
import { BidWithInterpretations } from "./bid-with-interpretations";
import { PartnershipState } from "./bidding-analyzer";
import { BiddingSeatInfo2 } from "./bidding-seat-info";

export class BiddingPartnershipInfo2 {
  partnership: Partnership;
  lastBid: BidWithInterpretations | null = null;
  force: ForceType = 'none';
  slamInvitation = false;
  private _majors: Strain[] = [];
  gameReached = false;
  slamReached = false;
  seats = new Map<Seat, BiddingSeatInfo2>();
  states: PartnershipState[] = [];
  openingBid: BidWithInterpretations | null = null;
  originalOvercall: BidWithInterpretations | null = null;

  constructor(partnership: Partnership, seat1: BiddingSeatInfo2, seat2: BiddingSeatInfo2) {
    this.partnership = partnership;
    this.seats.set(seat1.seat, seat1);
    this.seats.set(seat2.seat, seat2);
    this.states.push('no-bids');
  }

  clearStates(): void {
    this.states = [];
  }

  addState(...newState: PartnershipState[]): void {
    for (const state of newState) {
      if (state && this.states.indexOf(state) < 0) {
        this.states.push(state);
      }
    }
  }

  hasState(state: PartnershipState): boolean {
    return this.states.indexOf(state) >= 0;
  }

  get majors(): Strain[] {
    return Array.from(this._majors);
  }

  get fits(): Suit[] {
    let result: Suit[] = [];
    for (const suit of SUITS) {
      let count = 0;
      for (const s of this.seats.values()) {
        count += s.estimate.getSuitCount(suit)!.from || 0;
      }
      if (count >= 8) {
        result.push(suit);
      }
    }
    result.reverse();
    return result;
  }

  hasStopper(suit: Suit): boolean {
    for (const seat of this.seats.values()) {
      if (seat.estimate.hasStopper(suit)) {
        return true;
      }
    }
    return false;
  }

  toString(): string {
    const result: string[] = [];
    const fits = this.fits;
    result.push(sprintf('Partnership: %-5s fits: %-6s forcing: %-7s %s', this.partnership, fits.length > 0 ? fits.join(',') : 'none', this.force || 'no', this.states.join('|')));
    for (const s of this.seats.values()) {
      result.push(`  ${s.toString()}`);
    }
    return result.join('\n');
  }
}
