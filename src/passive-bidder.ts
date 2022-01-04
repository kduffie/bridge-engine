import { Hand } from "./hand";
import { BidContext, BoardContext, Seat } from "./common";
import { ConventionCard, SimpleConventionCard } from "./convention-card";
import { BridgeBidder } from "./bridge-player";
import { Bid } from "./bid";
import * as assert from 'assert';
import { Contract } from "./contract";

// This is the simplest possible bidding implementation -- passing at every opportunity

export class PassiveBidder implements BridgeBidder {
  private _seat: Seat = 'N';
  private _conventionCard: ConventionCard = new SimpleConventionCard('none');

  get conventionCard(): ConventionCard {
    return this._conventionCard;
  }

  get seat(): Seat {
    return this._seat;
  }

  set seat(value: Seat) {
    this._seat = value;
  }

  acceptConventions(conventionCard: ConventionCard): boolean {
    if (conventionCard.approach === 'none') {
      this._conventionCard = conventionCard;
      return true;
    }
    return false;
  }

  async startBoard(context: BoardContext): Promise<void> {
    // noop
  }

  async bid(context: BidContext, hand: Hand): Promise<Bid> {
    return new Bid('pass');
  }

  async finalizeContract(context: BidContext, contract: Contract | null): Promise<void> {
    // noop
  }

}