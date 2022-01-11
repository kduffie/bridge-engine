import { BidWithSeat } from "../bid";
import { BidInterpretation } from "./bid-interpretation";
import { sprintf } from "sprintf-js";
import { HandEstimate } from "../hand-estimate";

export class BidWithInterpretations {
  private _interpretations: BidInterpretation[] = [];
  private _bid: BidWithSeat;
  constructor(bid: BidWithSeat) {
    this._bid = bid;
  }

  get bid(): BidWithSeat {
    return this._bid;
  }

  get interpretations(): BidInterpretation[] {
    return this._interpretations;
  }

  addInterpretations(interpretations: BidInterpretation[]): void {
    if (interpretations.length > 0) {
      this._interpretations.push(...interpretations);
    }
  }

  get mergedInterpretation(): BidInterpretation | null {
    if (this.interpretations.length === 0) {
      return null;
    } else if (this.interpretations.length === 1) {
      return this.interpretations[0];
    }
    return BidWithInterpretations.combineAlternatives(this._interpretations);
  }

  static combineAlternatives(interpretations: BidInterpretation[]): BidInterpretation {
    const result = new BidInterpretation('merged', 'Merged interpretation', null);
    // hand, states, slamInvitation, forcing
    const handEstimates: HandEstimate[] = [];
    interpretations.forEach((e) => {
      handEstimates.push(e.handEstimate);
      result.addStates(e.states);
      if (e.slamInvitation) {
        result.slamInvitation = true;
      }
      if (e.force) {
        result.force = e.force;
      }
    });
    result.handEstimate = HandEstimate.combineAlternatives(handEstimates);
    return result;
  }

  toString(): string {
    if (this._interpretations.length === 0) {
      return sprintf('  %10s  %-10s', this._bid.toString(true), '?');
    }
    const result: string[] = [];
    result.push(sprintf(' %10s %-10s', this._bid.toString(true), this._interpretations[0].toString()));
    for (let i = 1; i < this._interpretations.length; i++) {
      result.push(sprintf(' %10s %-10s', 'OR:', this._interpretations[i].toString()));
    }
    return result.join('\n');
  }
}
