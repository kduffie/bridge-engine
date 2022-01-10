
import { BidInterpretation } from "../bid-interpretation";
import { BiddingAnalyzer } from "../bidding-analyzer";
import { BiddingInterpreterBase } from "../bidding-interpreter";
import * as assert from 'assert';
import { getPartnershipBySeat, isMinor } from "../../common";
import { Bid } from "../../bid";

export class OffenseLogicalBidInterpreter extends BiddingInterpreterBase {
  constructor() {
    super('std-offense-logical', 'Std: logical offense');
  }

  async interpret(context: BiddingAnalyzer): Promise<BidInterpretation[]> {
    const result: BidInterpretation[] = [];
    if (context.partnership.hasState('offense-logical') && context.partnership.openingBid) {
      switch (context.bid.type) {
        case 'pass':
          this.interpretPass(context, result);
          break;
        case 'normal':
          this.interpretBid(context, result);
          break;
        case 'double':
          this.interpretDouble(context, result);
          break;
        case 'redouble':
          this.interpretRedouble(context, result);
          break;
        default:
          // Passes are handled elsewhere
          break;
      }
    }
    return result;
  }

  private interpretPass(context: BiddingAnalyzer, interpretations: BidInterpretation[]): void {
    // Interference
    assert(context.rho.lastBid);
    assert(context.lastNormalBid);
    if (context.partnership.partnership === getPartnershipBySeat(context.lastNormalBid.bid.by)) {
      if (context.lastNormalBid.bid.isSlamBonusApplicable()) {
        const interpretation = new BidInterpretation(this.id, 'No need to modify slam contract', context.hand.estimate);
        interpretation.updateState('offense-passed');
        interpretations.push(interpretation);
      }
      if (context.partnership.slamInvitation) {
        const interpretation = new BidInterpretation(this.id, 'Reject slam invitation', context.hand.estimate);
        interpretation.updateState('offense-passed');
        if (context.lastNormalBid.bid.count === 4) {
          interpretation.handEstimate.points.addBounds(null, (context.lastNormalBid.bid.strain === 'N' ? 31 : 29) - (context.partnerHand.estimate.points.from || 0));
        } else {
          interpretation.handEstimate.points.addBounds(null, (context.lastNormalBid.bid.strain === 'N' ? 36 : 34) - (context.partnerHand.estimate.points.from || 0));
        }
        interpretations.push(interpretation);
      } else if (context.lastNormalBid.bid.isGameBonusApplicable(context.doubling)) {
        const interpretation = new BidInterpretation(this.id, 'Accept game contract', context.hand.estimate);
        interpretation.updateState('offense-passed');
        interpretation.handEstimate.points.addBounds(null, (context.lastNormalBid.bid.strain === 'N' ? 31 : 29) - (context.partnerHand.estimate.points.from || 0));
        interpretations.push(interpretation);
      } else {
        const interpretation = new BidInterpretation(this.id, 'Non-forcing and no chance for game', context.hand.estimate);
        interpretation.updateState('offense-passed');
        interpretation.handEstimate.points.addBounds(null, 24 - (context.partnerHand.estimate.points.to || 0));
        interpretations.push(interpretation);
      }
    }
    if (context.rho.lastBid.bid.type !== 'pass') {
      const interpretation = new BidInterpretation(this.id, 'After interference, with no additional information to share', context.hand.estimate);
      // Consider other information that could have been shared
      interpretations.push(interpretation);
    }
    // TODO: consider opponents takeout double
  }

  private interpretBid(context: BiddingAnalyzer, interpretations: BidInterpretation[]): void {
    if (context.bid.isSlamBonusApplicable()) {
      this.interpretSlamBid(context, interpretations);
    } else if (context.partnership.slamInvitation) {
      this.interpretSlamInvitation(context, interpretations);
    } else if (context.bid.isGameBonusApplicable(context.doubling)) {
      this.interpretGameBid(context, interpretations);
    } else if (context.bid.strain === 'N') {
      this.interpretNTBid(context, interpretations);
    } else if (this.isRebidSuit(context)) {
      this.interpretRebidSuitBid(context, interpretations);
    } else if (this.isPartnersSuit(context)) {
      this.interpretPartnerSuitBid(context, interpretations);
    } else {
      this.interpretNewSuitBid(context, interpretations);
    }
  }

  private isRebidSuit(context: BiddingAnalyzer): boolean {
    assert(context.bid.strain !== 'N');
    return (context.hand.estimate.getSuitCount(context.bid.strain).from || 0) >= 2;
  }

  private isPartnersSuit(context: BiddingAnalyzer): boolean {
    assert(context.bid.strain !== 'N');
    return (context.partnerHand.estimate.getSuitCount(context.bid.strain).from || 0) >= 4;
  }

  private interpretSlamBid(context: BiddingAnalyzer, interpretations: BidInterpretation[]): void {
    const partnerPoints = context.partnerHand.estimate.points.from || 0;
    const interpretation = new BidInterpretation(this.id, 'Slam bid', context.hand.estimate);
    interpretation.force = 'no';
    if (context.bid.strain !== 'N') {
      interpretation.handEstimate.addSuitBounds(context.bid.strain, 8 - (context.partnerHand.estimate.getSuitCount(context.bid.strain).from || 0), null);
    }
    interpretation.handEstimate.points.addBounds((context.bid.strain === 'N' ? 32 : 30) - partnerPoints, null);
    interpretations.push(interpretation);
  }

  private interpretSlamInvitation(context: BiddingAnalyzer, interpretations: BidInterpretation[]): void {
    if (context.partnership.force === 'no') {
      const partnerPoints = context.partnerHand.estimate.points.from || 0;
      const interpretation = new BidInterpretation(this.id, 'Slam invitation', context.hand.estimate);
      interpretation.force = 'no';
      if (context.bid.strain !== 'N') {
        interpretation.handEstimate.addSuitBounds(context.bid.strain, 8 - (context.partnerHand.estimate.getSuitCount(context.bid.strain).from || 0), null);
      }
      interpretation.handEstimate.points.addBounds((context.bid.strain === 'N' ? 29 : 27) - partnerPoints, (context.bid.strain === 'N' ? 31 : 29) - partnerPoints);
      interpretations.push(interpretation);
    }
  }

  private interpretGameBid(context: BiddingAnalyzer, interpretations: BidInterpretation[]): void {
    // TODO: check for jump to game, suggesting fewer points
    const partnerPoints = context.partnerHand.estimate.points.from || 0;
    const interpretation = new BidInterpretation(this.id, 'Game', context.hand.estimate);
    interpretation.force = 'no';
    if (context.bid.strain !== 'N') {
      interpretation.handEstimate.addSuitBounds(context.bid.strain, 8 - (context.partnerHand.estimate.getSuitCount(context.bid.strain).from || 0), null);
    }
    interpretation.handEstimate.points.addBounds((isMinor(context.bid.strain) ? 26 : 24) - partnerPoints, (context.bid.strain === 'N' ? 31 : 29) - partnerPoints);
    interpretations.push(interpretation);
  }

  private interpretNTBid(context: BiddingAnalyzer, interpretations: BidInterpretation[]): void {
    const partnerPoints = context.partnerHand.estimate.points.from || 0;
    if (context.partnership.force === 'no') {
      // non-forcing suggesting that a NT bid is invitational to game
      const interpretation = new BidInterpretation(this.id, 'Invitation to game', context.hand.estimate);
      interpretation.handEstimate.points.addBounds(25 - partnerPoints, null);
      if ((context.partnerHand.estimate.getSuitCount('H').from || 0) >= 4 && (context.hand.estimate.getSuitCount('H').from || 0) < 4) {
        interpretation.handEstimate.addSuitBounds('H', null, 7 - (context.partnerHand.estimate.getSuitCount('H').from || 0));
      }
      if ((context.partnerHand.estimate.getSuitCount('S').from || 0) >= 4 && (context.hand.estimate.getSuitCount('S').from || 0) < 4) {
        interpretation.handEstimate.addSuitBounds('S', null, 7 - (context.partnerHand.estimate.getSuitCount('S').from || 0));
      }
      interpretations.push(interpretation);
    } else {
      // forcing suggests a minimum hand without suit support
      const interpretation = new BidInterpretation(this.id, 'Minimum hand, no suit fit', context.hand.estimate);
      interpretation.handEstimate.points.addBounds(null, 24 - (context.partnerHand.estimate.points.from || 0));
      if ((context.partnerHand.estimate.getSuitCount('H').from || 0) >= 4 && (context.hand.estimate.getSuitCount('H').from || 0) < 4) {
        interpretation.handEstimate.addSuitBounds('H', null, 7 - (context.partnerHand.estimate.getSuitCount('H').from || 0));
      }
      if ((context.partnerHand.estimate.getSuitCount('S').from || 0) >= 4 && (context.hand.estimate.getSuitCount('S').from || 0) < 4) {
        interpretation.handEstimate.addSuitBounds('S', null, 7 - (context.partnerHand.estimate.getSuitCount('S').from || 0));
      }
      interpretations.push(interpretation);
    }
  }

  private interpretNewSuitBid(context: BiddingAnalyzer, interpretations: BidInterpretation[]): void {
    assert(context.lastNormalBid);
    const sufficient = Bid.createSufficient(context.lastNormalBid.bid, context.bid.strain);
    if (sufficient && context.bid.count === sufficient.count) {
      assert(context.bid.strain !== 'N');
      const interpretation = new BidInterpretation(this.id, context.bid.count === 1 ? 'New suit at 1-level: 4 cards' : 'New suit: 4+ cards, extra values', context.hand.estimate);
      interpretation.force = 'yes'; // TODO: fourth-suit forcing
      if (context.bid.count >= 2) {
        interpretation.handEstimate.points.addBounds((context.hand.estimate.points.from || 0) + 2, null);
      }
      interpretation.handEstimate.addSuitBounds(context.bid.strain, 4, 5);
      interpretations.push(interpretation);
    }
    // TODO: consider jump switches
  }

  private interpretRebidSuitBid(context: BiddingAnalyzer, interpretations: BidInterpretation[]): void {
    assert(context.bid.strain !== 'N');
    assert(context.lastNormalBid);
    const sufficient = Bid.createSufficient(context.lastNormalBid.bid, context.bid.strain);
    if (sufficient && context.bid.count === sufficient.count) {
      if (context.partnership.force === 'no') {
        const interpretation = new BidInterpretation(this.id, 'Rebid suit, non-forcing: extra length', context.hand.estimate);
        interpretation.handEstimate.points.addBounds((context.hand.estimate.points.from || 0) + 2, (context.hand.estimate.points.from || 0) + 5);
        if (context.bid.count <= 3) {
          const cards = context.hand.estimate.getSuitCount(context.bid.strain).from || 2;
          interpretation.handEstimate.addSuitBounds(context.bid.strain, cards + 1, null);
        }
        interpretations.push(interpretation);
      } else {
        const interpretation = new BidInterpretation(this.id, 'Rebid suit, forcing: minimum hand', context.hand.estimate);
        interpretation.handEstimate.points.addBounds(null, (context.hand.estimate.points.from || 0) + 2);
        interpretations.push(interpretation);
      }
    }
    // TODO: consider jumps suggesting invitations
  }

  private interpretPartnerSuitBid(context: BiddingAnalyzer, interpretations: BidInterpretation[]): void {
    assert(context.bid.strain !== 'N');
    assert(context.lastNormalBid);
    const sufficient = Bid.createSufficient(context.lastNormalBid.bid, context.bid.strain);
    if (sufficient && context.bid.count === sufficient.count) {
      if (context.partnership.force === 'no') {
        const interpretation = new BidInterpretation(this.id, 'Bid partner\'s suit, non-forcing: fit', context.hand.estimate);
        interpretation.handEstimate.points.addBounds((context.hand.estimate.points.from || 0) + 2, (context.hand.estimate.points.from || 0) + 5);
        const cards = context.partnerHand.estimate.getSuitCount(context.bid.strain).from || 4;
        interpretation.handEstimate.addSuitBounds(context.bid.strain, 8 - cards, null);
        interpretations.push(interpretation);
      } else {
        const interpretation = new BidInterpretation(this.id, 'Rebid partner\'s suit, forcing: fit, minimum', context.hand.estimate);
        interpretation.handEstimate.points.addBounds(null, (context.hand.estimate.points.from || 0) + 2);
        const cards = context.partnerHand.estimate.getSuitCount(context.bid.strain).from || 4;
        interpretation.handEstimate.addSuitBounds(context.bid.strain, 8 - cards, null);
        interpretations.push(interpretation);
      }
    }
    // TODO: consider jump in partner's suit
  }


  private interpretDouble(context: BiddingAnalyzer, interpretations: BidInterpretation[]): void {
    // 10+ points handled elsewhere
    assert(context.lastNormalBid);
    if (context.partnership.openingBid && context.consecutivePasses === 2 && context.lastNormalBid.bid.count <= 3 && (context.lastNormalBid.bid.count < 3 || context.lastNormalBid.bid.strain !== 'N')) {
      const interpretation = new BidInterpretation(this.id, 'Reopening double: partner should bid again', context.hand.estimate);
      interpretation.force = 'yes';
      interpretations.push(interpretation);
    } else {
      const interpretation = new BidInterpretation(this.id, 'Penalty double', context.hand.estimate);
      interpretations.push(interpretation);
    }
  }

  private interpretRedouble(context: BiddingAnalyzer, interpretations: BidInterpretation[]): void {
    // TODO
  }
}
