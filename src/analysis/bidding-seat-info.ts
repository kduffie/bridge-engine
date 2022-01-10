import { BidWithSeat } from "../bid";
import { getSeatName, Seat } from "../common";
import { HandEstimate } from "../hand-estimate";
import { sprintf } from "sprintf-js";
import { BidWithInterpretations } from "./bid-with-interpretations";

export class BiddingSeatInfo2 {
  seat: Seat;
  estimate = new HandEstimate();
  openingBid: BidWithInterpretations | null = null;
  firstBid: BidWithInterpretations | null = null;
  lastBid: BidWithInterpretations | null = null;

  constructor(seat: Seat) {
    this.seat = seat;
  }

  toString(): string {
    return sprintf('%-10s %s', getSeatName(this.seat), this.estimate.toString());
  }
}
