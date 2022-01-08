import { Bid, BidWithSeat } from "./bid";
import { Card } from "./card";
import { BidContext, BoardContext, FinalBoardContext, PlayContext, randomlySelect, Seat } from "./common";
import { Contract } from "./contract";
import { ConventionCard, SimpleConventionCard } from "./convention-card";
import { Hand } from "./hand";

export interface BridgeBidder {
  seat: Seat;
  conventionCard: ConventionCard;
  acceptConventions(conventionCard: ConventionCard): boolean;
  startBoard: (context: BoardContext) => Promise<void>;
  onBidFromLHO: (context: BidContext, bid: BidWithSeat) => Promise<void>;
  onBidFromPartner: (context: BidContext, bid: BidWithSeat) => Promise<void>;
  onBidFromRHO: (context: BidContext, bid: BidWithSeat) => Promise<void>;
  bid: (context: BidContext, hand: Hand) => Promise<Bid>;
  finalizeContract: (context: BidContext, contract: Contract | null) => Promise<void>;
}

export interface BridgeCardPlayer {
  seat: Seat;
  startPlay: (context: PlayContext) => Promise<void>;
  play: (context: PlayContext, hand: Hand, dummy: Hand | null) => Promise<Card>;
  playFromDummy(context: PlayContext, dummy: Hand, hand: Hand): Promise<Card>;
  finishPlay: (context: FinalBoardContext) => Promise<void>;
}

export interface IBridgePlayer extends BridgeBidder, BridgeCardPlayer {
  seat: Seat;
}

export class BridgePlayerBase implements IBridgePlayer {
  protected _seat: Seat = 'N';
  protected _conventionCard = new SimpleConventionCard('none');

  get seat(): Seat {
    return this._seat;
  }

  set seat(value: Seat) {
    this._seat = value;
  }

  async startBoard(context: BoardContext): Promise<void> {
    // available for derived implementation
  }

  async onBidFromLHO(context: BidContext, bid: BidWithSeat): Promise<void> {
    // available for derived implementation
  }
  async onBidFromPartner(context: BidContext, bid: BidWithSeat): Promise<void> {
    // available for derived implementation
  }
  async onBidFromRHO(context: BidContext, bid: BidWithSeat): Promise<void> {
    // available for derived implementation
  }

  async bid(context: BidContext, hand: Hand): Promise<Bid> {
    return new Bid('pass');
  }

  async finalizeContract(context: BidContext, contract: Contract | null): Promise<void> {
    // available for derived implementation
  }

  async startPlay(context: PlayContext): Promise<void> {
    // available for derived implementation
  }

  async playFromDummy(context: PlayContext, dummy: Hand, hand: Hand): Promise<Card> {
    let cards = dummy.getEligibleToPlay(context.playCurrentTrick.getLeadSuit()).cards;
    return randomlySelect(cards, context.randomGenerator);
  }

  async play(context: PlayContext, hand: Hand, dummy: Hand | null): Promise<Card> {
    let cards = hand.getEligibleToPlay(context.playCurrentTrick.getLeadSuit()).cards;
    return randomlySelect(cards, context.randomGenerator);
  }

  async finishPlay(context: FinalBoardContext): Promise<void> {
    // available for derived implementation
  }

  get conventionCard(): ConventionCard {
    return this._conventionCard;
  }

  acceptConventions(conventionCard: ConventionCard): boolean {
    return conventionCard.approach === 'none';
  }
}

export class BridgePlayer extends BridgePlayerBase {
  private _bidder: BridgeBidder;
  private _player: BridgeCardPlayer;

  constructor(bidder: BridgeBidder, player: BridgeCardPlayer) {
    super();
    this._bidder = bidder;
    this._player = player;
  }

  get seat(): Seat {
    return super.seat;
  }

  set seat(value: Seat) {
    super.seat = value;
    this._bidder.seat = value;
    this._player.seat = value;
  }

  get conventionCard(): ConventionCard {
    return this._bidder.conventionCard;
  }

  async onBidFromLHO(context: BidContext, bid: BidWithSeat): Promise<void> {
    return this._bidder.onBidFromLHO(context, bid);
  }
  async onBidFromPartner(context: BidContext, bid: BidWithSeat): Promise<void> {
    return this._bidder.onBidFromPartner(context, bid);
  }
  async onBidFromRHO(context: BidContext, bid: BidWithSeat): Promise<void> {
    return this._bidder.onBidFromRHO(context, bid);
  }

  async bid(context: BidContext, hand: Hand): Promise<Bid> {
    return this._bidder.bid(context, hand);
  }

  async playFromDummy(context: PlayContext, dummy: Hand, hand: Hand): Promise<Card> {
    return this._player.playFromDummy(context, dummy, hand);
  }

  async play(context: PlayContext, hand: Hand, dummy: Hand | null): Promise<Card> {
    return this._player.play(context, hand, dummy);
  }
}
