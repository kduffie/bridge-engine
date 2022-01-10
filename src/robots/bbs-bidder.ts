import { Hand } from "../hand";
import { BidContext, BoardContext, getPartnerBySeat, getSeatPreceding, Seat, STRAINS, SUITS } from "../common";
import { ConventionCard, SimpleConventionCard } from "../convention-card";
import { BridgeBidder } from "../bridge-player";
import { Bid, BidWithSeat } from "../bid";
import * as assert from 'assert';
import { Contract } from "../contract";

// Beginning Bidding System (BBS):  designed to be as simple as possible, while generating credible conventions
// that usually come close to what Standard American bidding would produce with the same hands.

// The bidding system works like this:
// Opening Bids:
//    - with flat distribution, based on HCP, bid 1NT, 2NT, or 3NT
//    - with a 5+ card suit, based on total points, bid 1, 2, or 3 of your suit
//    - otherwise, with 13+ total points, bid longest minor suit
// Initial Responses:
//    - in response to NT, with sufficient combined HCP, bid 3NT, or with a 6+ card suit, bid 3 of that suit, otherwise pass
//    - in response to a major with a fit, and sufficient combined total points, bid game
//    - in response to a major without a fit, and sufficient combined HCP, bid 3NT
//    - in response to a minor holding a 5+ card major and sufficient combined total points, bid 3 of the major
//    - in response to a minor without a 5+ card major but sufficient combined HCP, bid 3NT
//    - otherwise pass
// Subsequent Response:
//    - after NT followed by 3 of a major, if you have 2+ cards in that suit, bid game in that suit
//    - after NT followed by 3 of a minor, if you have 3+ cards in that suit, bid 3NT
//    - after minor suit open followed by 3 of a major, if you have 3+ cards in that major, bid game in that suit, otherwise 3NT
//
// Overcalls:
//    For all bids (including opening), if there is interference, proceed with bid from above unless it is insufficient, in which case you will pass
//
// Requiring fewer than 200 lines of code, this bidding system does remarkably well at choosing reasonable contracts

export class BbsBidder implements BridgeBidder {
  private _mseat: Seat = 'N';
  private _conventionCard: ConventionCard = new SimpleConventionCard('bbs');

  get conventionCard(): ConventionCard {
    return this._conventionCard;
  }

  get seat(): Seat {
    return this._mseat;
  }

  set seat(value: Seat) {
    this._mseat = value;
  }

  acceptConventions(conventionCard: ConventionCard): boolean {
    if (conventionCard.approach === 'bbs') {
      this._conventionCard = conventionCard;
      return true;
    }
    return false;
  }

  async startBoard(context: BoardContext): Promise<void> {
    // noop
  }

  async onBidFromLHO(context: BidContext, bid: BidWithSeat): Promise<void> {
  }
  async onBidFromPartner(context: BidContext, bid: BidWithSeat): Promise<void> {
  }
  async onBidFromRHO(context: BidContext, bid: BidWithSeat): Promise<void> {
  }

  async bid(context: BidContext, hand: Hand): Promise<Bid> {
    let result: Bid | null = null;
    const myBids = context.auction.getBidsBySeat(this.seat, true);
    const partnerBids = context.auction.getBidsBySeat(getPartnerBySeat(this.seat), false);
    if (myBids.length === 0 && (partnerBids.length === 0 || partnerBids.length === 1 && partnerBids[0].type === 'pass')) {
      // First opportunity to bid when partner has not yet bid, or has passed
      result = this.getOpeningBid(context, hand);
    } else if ((myBids.length === 0 || myBids.length === 1 && myBids[0].type === 'pass') && partnerBids.length === 1 && partnerBids[0].type === 'normal') {
      // I haven't bid or passed, so partner's non-pass will be treated as an effective opening bid.  I will respond.
      result = this.getFirstResponse(context, hand, partnerBids[0]);
    } else if (myBids.length === 1 && myBids[0].type === 'normal' && partnerBids.length > 0 && partnerBids[partnerBids.length - 1].type === 'normal') {
      // I offered an "opening" bid and my partner has responded, so I will check for possible additional bid
      result = this.getSubsequentResponse(context, hand, partnerBids.length > 0 ? partnerBids[partnerBids.length - 1] : null, myBids[0]);
    }
    if (result && result.isLarger(context.auction.lastNormalBid)) {
      return result;
    }
    return new Bid('pass');
  }

  async finalizeContract(context: BidContext, contract: Contract | null): Promise<void> {
    // noop
  }

  private getOpeningBid(context: BidContext, hand: Hand): Bid {
    const bestMajor = hand.allCards.getBestMajorSuit('prefer-higher');
    const bestMinor = hand.allCards.getBestMinorSuit('prefer-lower');
    const bestSuit = hand.allCards.getBestSuit();
    if (hand.allCards.highCardPoints >= 23 && hand.allCards.hasNtDistribution() && hand.allCards.getWellStoppedSuits().size === 4) {
      return new Bid('normal', 3, 'N');
    } else if (hand.allCards.totalPoints >= 25 && bestMajor.length >= 7) {
      return new Bid('normal', 4, bestMajor.suit);
    } else if (hand.allCards.totalPoints >= 27 && bestMinor.length >= 8) {
      return new Bid('normal', 5, bestMinor.suit);
    } else if (hand.allCards.highCardPoints >= 19 && hand.allCards.hasNtDistribution()) {
      return new Bid('normal', 2, 'N');
    } else if (hand.allCards.highCardPoints >= 14 && hand.allCards.hasNtDistribution()) {
      return new Bid('normal', 1, 'N');
    } else if (hand.allCards.totalPoints >= 13 && bestSuit.length >= 5) {
      const preferredSuit = bestMajor.length >= 5 ? bestMajor : bestMinor;
      if (hand.allCards.totalPoints >= 19) {
        return new Bid('normal', 3, preferredSuit.suit);
      } else if (hand.allCards.totalPoints >= 16) {
        return new Bid('normal', 2, preferredSuit.suit);
      }
      return new Bid('normal', 1, preferredSuit.suit);
    } else if (hand.allCards.totalPoints >= 13) {
      return new Bid('normal', 1, bestSuit.suit);
    }
    return new Bid('pass');
  }

  private getFirstResponse(context: BidContext, hand: Hand, opening: BidWithSeat): Bid {
    if (opening.isGameBonusApplicable(context.auction.currentContract?.doubling || 'none')) {
      return new Bid('pass');
    }
    switch (opening.strain) {
      case 'N':
        return this.getFirstResponseToNT(context, hand, opening);
      case 'H':
      case 'S':
        return this.getFirstResponseToMajor(context, hand, opening);
      case 'C':
      case 'D':
        return this.getFirstResponseToMinor(context, hand, opening);
      default:
        throw new Error('Unexpected strain');
    }
  }

  private getFirstResponseToNT(context: BidContext, hand: Hand, opening: BidWithSeat): Bid {
    const partnerMinHCP = opening.count === 2 ? 19 : 14;
    const combined = partnerMinHCP + hand.allCards.highCardPoints;
    if (combined >= 24) {
      return new Bid('normal', 3, 'N');
    }
    const bestSuit = hand.allCards.getBestSuit();
    if (bestSuit.length >= 6) {
      return new Bid('normal', 3, bestSuit.suit);
    }
    return new Bid('pass');
  }

  private getFirstResponseToMajor(context: BidContext, hand: Hand, opening: BidWithSeat): Bid {
    assert(opening.strain !== 'N');
    const mySuit = hand.allCards.getSuit(opening.strain);
    const partnerMinTotal = opening.count === 3 ? 19 : opening.count === 2 ? 16 : 13;
    const combinedPoints = partnerMinTotal + hand.allCards.totalPoints;
    const combinedHCP = partnerMinTotal + hand.allCards.highCardPoints;
    if (mySuit.length >= 3 && combinedPoints >= 24) {
      return new Bid('normal', 4, opening.strain);
    } else if (combinedHCP >= 24 && hand.allCards.hasNtDistribution) {
      return new Bid('normal', 3, 'N');
    }
    return new Bid('pass');
  }

  private getFirstResponseToMinor(context: BidContext, hand: Hand, opening: BidWithSeat): Bid {
    assert(opening.strain !== 'N');
    const partnerMinTotal = opening.count === 3 ? 19 : opening.count === 2 ? 16 : 13;
    const combined = partnerMinTotal + hand.allCards.totalPoints;
    if (combined >= 24) {
      const bestMajor = hand.allCards.getBestMajorSuit('prefer-lower');
      if (bestMajor.length >= 5) {
        return new Bid('normal', 3, bestMajor.suit);
      }
      return new Bid('normal', 3, 'N');
    }
    return new Bid('pass');
  }


  private getSubsequentResponse(context: BidContext, hand: Hand, partnersResponse: BidWithSeat | null, myOpening: BidWithSeat): Bid {
    if (!partnersResponse) {
      return new Bid('pass');
    }
    switch (myOpening.strain) {
      case 'N':
        return this.getSubsequentResponseInNT(context, hand, partnersResponse, myOpening);
      case 'C':
      case 'D':
        return this.getSubsequentResponseInMinor(context, hand, partnersResponse, myOpening);
      default:
        break;
    }
    return new Bid('pass');
  }

  private getSubsequentResponseInNT(context: BidContext, hand: Hand, partnersResponse: BidWithSeat, myOpening: BidWithSeat): Bid {
    const mySuit = partnersResponse.strain !== 'N' ? hand.allCards.getSuit(partnersResponse.strain) : [];
    switch (partnersResponse.strain) {
      case 'H':
      case 'S':
        if (mySuit.length >= 2) {
          return new Bid('normal', 4, partnersResponse.strain);
        }
        break;
      case 'C':
      case 'D':
        if (mySuit.length >= 3) {
          return new Bid('normal', 3, 'N');
        }
        break;
      default:
        throw new Error("Unexpected strain");
    }
    return new Bid('pass');
  }

  private getSubsequentResponseInMinor(context: BidContext, hand: Hand, partnersResponse: BidWithSeat, myOpening: BidWithSeat): Bid {
    const mySuit = partnersResponse.strain !== 'N' ? hand.allCards.getSuit(partnersResponse.strain) : [];
    switch (partnersResponse.strain) {
      case 'H':
      case 'S':
        if (mySuit.length >= 3) {
          return new Bid('normal', 4, partnersResponse.strain);
        }
        return new Bid('normal', 3, 'N');
      default:
        break;
    }
    return new Bid('pass');
  }
}
