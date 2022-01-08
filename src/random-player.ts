import { Hand } from "./hand";
import { FinalBoardContext, PlayContext, randomlySelect, Seat } from "./common";
import { BridgeCardPlayer } from "./bridge-player";
import { Card } from "./card";
import * as assert from 'assert';

// This is the simplest possible robotic player.  When playing, it will randomly select from among eligible cards.
// When leading, it will randomly select an available suit, and then randomly select from among cards in that suit.

export class RandomPlayer implements BridgeCardPlayer {
  private _mseat: Seat = 'N';

  get seat(): Seat {
    return this._mseat;
  }
  set seat(value: Seat) {
    this._mseat = value;
  }

  async startPlay(context: PlayContext): Promise<void> {
    // noop
  }

  async play(context: PlayContext, hand: Hand, dummy: Hand | null): Promise<Card> {
    let eligible = hand.getEligibleToPlay(context.playCurrentTrick.getLeadSuit());
    if (eligible.length === 0) {
      eligible = hand.unplayed;
    }
    return randomlySelect(eligible.cards, context.randomGenerator);
  }
  async playFromDummy(context: PlayContext, dummy: Hand, hand: Hand): Promise<Card> {
    let eligible = dummy.getEligibleToPlay(context.playCurrentTrick.getLeadSuit());
    if (eligible.length === 0) {
      eligible = hand.unplayed;
    }
    return randomlySelect(eligible.cards, context.randomGenerator);
  }

  async finishPlay(context: FinalBoardContext): Promise<void> {
    // noop
  }
}
