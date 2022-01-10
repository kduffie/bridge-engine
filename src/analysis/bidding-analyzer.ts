import { Doubling, getOpposingPartnership, getPartnerBySeat, getPartnershipBySeat, getSeatFollowing, getSeatName, getSeatPreceding, getSeatsByPartnership, isMajor, Partnership, PARTNERSHIPS, Seat, Strain, Suit, SUITS, Vulnerability } from "../common";
import { BidWithSeat } from "../bid";
import { sprintf } from "sprintf-js";
import { BidInterpretation } from "./bid-interpretation";
import { BidWithInterpretations } from "./bid-with-interpretations";
import { BiddingSeatInfo2 } from "./bidding-seat-info";
import { BiddingPartnershipInfo2 } from "./bidding-partnership-info";
import { BiddingInterpreter } from "./bidding-interpreter";
import * as assert from 'assert';
import { HandEstimate } from "../hand-estimate";

export type BiddingInterpreterFactory = (analyzer: BiddingAnalyzer) => BiddingInterpreter;
export class BiddingAnalyzer {
  private _interpreters: BiddingInterpreter[] = [];
  private _vulnerability: Vulnerability;
  private _dealer: Seat;
  private _nextBidder: Seat;
  private _lastNormalBid: BidWithInterpretations | null = null;
  private _seats = new Map<Seat, BiddingSeatInfo2>();
  private _partnerships = new Map<Partnership, BiddingPartnershipInfo2>();
  private _consecutivePasses = 0;
  private _currentBid: BidWithSeat | null = null;
  private _openingBid: BidWithInterpretations | null = null;
  private _unexpectedBids: BidWithSeat[] = [];
  private _bidsWithInterpretation: BidWithInterpretations[] = [];
  private _doubling: Doubling = 'none';

  constructor(vulnerability: Vulnerability, dealer: Seat, interpreterFactories: BiddingInterpreterFactory[]) {
    this._vulnerability = vulnerability;
    this._nextBidder = this._dealer = dealer;
    for (const partnership of PARTNERSHIPS) {
      const seats = getSeatsByPartnership(partnership);
      const seat1 = new BiddingSeatInfo2(seats[0]);
      this._seats.set(seat1.seat, seat1);
      const seat2 = new BiddingSeatInfo2(seats[1]);
      this._seats.set(seat2.seat, seat2);
      const partnershipInfo = new BiddingPartnershipInfo2(partnership, seat1, seat2);
      this._partnerships.set(partnership, partnershipInfo);
    }
    for (const factory of interpreterFactories) {
      this._interpreters.push(factory(this));
    }
  }

  get vulnerability(): Vulnerability {
    return this._vulnerability;
  }

  get dealer(): Seat {
    return this._dealer;
  }

  get nextBidder(): Seat {
    return this._nextBidder;
  }

  get bid(): BidWithSeat {
    assert(this._currentBid);
    return this._currentBid;
  }

  get doubling(): Doubling {
    return this._doubling;
  }

  get openingBid(): BidWithInterpretations | null {
    return this._openingBid;
  }

  get hand(): BiddingSeatInfo2 {
    assert(this._currentBid);
    return this._seats.get(this._currentBid.by)!;
  }

  get partnerHand(): BiddingSeatInfo2 {
    assert(this._currentBid);
    return this._seats.get(getPartnerBySeat(this._currentBid.by))!;
  }

  get rho(): BiddingSeatInfo2 {
    assert(this._currentBid);
    return this._seats.get(getSeatPreceding(this._currentBid.by))!;
  }

  get lho(): BiddingSeatInfo2 {
    assert(this._currentBid);
    return this._seats.get(getSeatFollowing(this._currentBid.by))!;
  }
  get partnership(): BiddingPartnershipInfo2 {
    assert(this._currentBid);
    return this._partnerships.get(getPartnershipBySeat(this._currentBid.by))!;
  }

  get opponents(): BiddingPartnershipInfo2 {
    assert(this._currentBid);
    return this._partnerships.get(getOpposingPartnership(getPartnershipBySeat(this._currentBid.by)))!;
  }

  get consecutivePasses(): number {
    return this._consecutivePasses;
  }

  get lastNormalBid(): BidWithInterpretations | null {
    return this._lastNormalBid;
  }

  get bidsWithInterpretation(): BidWithInterpretations[] {
    return this._bidsWithInterpretation;
  }

  get isBalancingSeat(): boolean {
    return this._consecutivePasses === 2;
  }

  async onBid(bid: BidWithSeat): Promise<BidInterpretation[]> {
    let result: BidInterpretation[] = [];
    this._currentBid = bid;
    assert(this.bid.by === this._nextBidder, "This bid is not from the proper seat");
    assert(!this._lastNormalBid || this.bid.isLarger(this._lastNormalBid.bid), "This bid is insufficient");
    const bidWithInterpretation = new BidWithInterpretations(bid);
    try {
      for (const interpreter of this._interpreters) {
        const interpretations = await interpreter.interpret(this);
        bidWithInterpretation.addInterpretations(interpretations);
      }
      this.processInterpretations(bidWithInterpretation);
      this._bidsWithInterpretation.push(bidWithInterpretation);
    } finally {
      if (this.openingBid && !this.partnership.openingBid && this.bid.type === 'normal') {
        this.partnership.originalOvercall = bidWithInterpretation;
      }
      if (!this._openingBid && this.bid.type === 'normal') {
        this._openingBid = bidWithInterpretation;
        this.partnership.openingBid = bidWithInterpretation;
        this.hand.openingBid = bidWithInterpretation;
      }
      if (bid.isSlamBonusApplicable()) {
        this.partnership.slamReached = true;
      }
      if (bid.isGameBonusApplicable('none')) {
        this.partnership.gameReached = true;
      }
      this.partnership.lastBid = bidWithInterpretation;
      if (this.bid.type === 'normal') {
        this._lastNormalBid = bidWithInterpretation;
      }
      if (this.bid.type === 'pass') {
        this._consecutivePasses++;
      } else {
        this._consecutivePasses = 0;
      }
      this.hand.lastBid = bidWithInterpretation;
      if (!this.hand.firstBid) {
        this.hand.firstBid = bidWithInterpretation;
      }
      if (bid.type === 'double') {
        this._doubling = 'doubled';
      } else if (bid.type === 'redouble') {
        this._doubling = 'redoubled';
      } else {
        this._doubling = 'none';
      }
      this._nextBidder = getSeatFollowing(this._nextBidder);
    }
    return result;
  }

  private processInterpretations(bidWithInterpretations: BidWithInterpretations): void {
    if (bidWithInterpretations.interpretations.length === 0) {
      this._unexpectedBids.push(bidWithInterpretations.bid);
      this.partnership.states = ['unknown'];
    } else {
      const handEstimates: HandEstimate[] = [];
      let stateAdded = false;
      for (const interpretation of bidWithInterpretations.interpretations) {
        if (interpretation.states.length > 0) {
          stateAdded = true;
        }
      }
      if (stateAdded) {
        this.partnership.clearStates();
      }
      switch (this.partnership.force) {
        case 'yes':
        case 'none':
          this.partnership.force = 'none';
          break;
        case '2-bids':
          this.partnership.force = 'yes';
          break;
        case '3-bids':
          this.partnership.force = '2-bids';
          break;
        case '4-bids':
          this.partnership.force = '4-bids';
          break;
        case 'game':
          break;
        default:
          throw new Error("Unexpected partnership force");
      }
      for (const interpretation of bidWithInterpretations.interpretations) {
        handEstimates.push(interpretation.handEstimate);
        if (interpretation.states.length > 0) {
          this.partnership.addState(...interpretation.states);
        }
        if (interpretation.force) {
          this.partnership.force = interpretation.force;
        }
        if (interpretation.slamInvitation) {
          this.partnership.slamInvitation = true;
        }
      }
      const combinedEstimate = HandEstimate.combineAlternatives(handEstimates);
      this.hand.estimate.updateFrom(combinedEstimate);
    }
  }

  toString(): string {
    const result: string[] = [];
    result.push(`Bidding Analyzer:     Dealer: ${getSeatName(this.dealer)}     Vulnerability: ${this.vulnerability}`);
    if (this._bidsWithInterpretation.length > 0) {
      result.push('Bids:');
      for (const bid of this._bidsWithInterpretation) {
        result.push(bid.toString());
      }
    }
    for (const partnership of PARTNERSHIPS) {
      result.push(`${this._partnerships.get(partnership)!.toString()}`);
    }
    return result.join('\n');
  }
}

export type OpeningPartnershipState = 'n/a' |
  'passed' |
  'passed-out' |
  'passed-overcall' |
  'opened-forcing' |
  'opened-non-forcing' |
  'passed-partner-open' |
  'responded-non-forcing' |
  'responded-forcing' |
  '2d-following' |
  'stayman-request' |
  'stayman-response' |
  'transfer-request' |
  'transfer-response' |
  'transfer-minor-response' |
  'transfer-minor-shift-to-d' |
  'game' |
  'gerber-request' |
  'gerber-response' |
  'rkc-request' |
  'rkc-response' |
  'slam' |
  'penalty-doubled' |
  'doubled-for-reopen' |
  'unknown';

export type PreemptiveOpeningPartnershipState = 'n/a' |
  'passed' |
  'passed-out' |
  'opened-preempt' |
  'responded-forcing' |
  'responded-non-forcing' |
  'game' |
  'penalty-doubled';


export type CompetingPartnershipState = 'n/a' |
  'passed' |
  'passed-out' |
  'overcalled-non-forcing' |
  'takeout-doubled' |
  'responded-non-forcing' |
  'responded-forcing' |
  'game' |
  'penalty-doubled';

export type DefensivePartnershipState = 'n/a' |
  'passed' |
  'passed-out' |
  'overcalled-non-forcing' |
  'responded-non-forcing' |
  'preempted' |
  'increased-preempt' |
  'game' |
  'penalty-doubled';

export type PartnershipState_old = 'no-bids' | 'unknown' | 'special' | OpeningPartnershipState | PreemptiveOpeningPartnershipState | CompetingPartnershipState | DefensivePartnershipState;

export type PartnershipState = 'no-bids' |
  'unknown' |
  'opening-suit' |
  'opening-nt' |
  'opening-2c' |
  'opening-preempt' |
  'opening-suit-response' |
  'opening-nt-response' |
  'opening-2c-response' |
  'opening-preempt-response' |
  'offense-logical' |
  'offence-redouble-sequence' |
  'offense-penalty-doubled' |
  'offense-passed' |
  'negative-double-sequence' |
  'reopening-double-sequence' |
  'stayman-sequence' |
  'jacoby-transfer-sequence' |
  'texas-transfer-sequence' |
  'jacoby-2nt-sequence' |
  'gerber-sequence' |
  'slam-invitation-quantitative' |
  'rkc-sequence' |
  'competitive-opening' |
  'competitive-response' |
  'competitive-takeout-doubled' |
  'defense-opening' |
  'defense-logical' |
  'special'; // special is for other conventions that will handle their own states
