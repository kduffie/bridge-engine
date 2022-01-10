
import { BidInterpretation } from "../bid-interpretation";
import { BiddingAnalyzer } from "../bidding-analyzer";
import { BiddingInterpreterBase } from "../bidding-interpreter";
import * as assert from 'assert';
import { getVulnerabilityForPartnership } from "../../common";

export class PreemptOpenResponseBidInterpreter extends BiddingInterpreterBase {
  constructor() {
    super('std-preempt-open-responses', 'Std: preempt open responses');
  }

  async interpret(context: BiddingAnalyzer): Promise<BidInterpretation[]> {
    const result: BidInterpretation[] = [];
    if (context.partnership.hasState('opening-preempt') && context.partnership.openingBid) {
      switch (context.bid.type) {
        case 'pass':
          this.interpretPass(context, result);
          break;
        case 'normal':
          this.interpretBid(context, result);
          break;
        case 'double':
          // Do not handle doubles here
          break;
        default:
          throw new Error("Unexpected bid type");
      }
    }
    return result;
  }

  private interpretPass(context: BiddingAnalyzer, interpretations: BidInterpretation[]): void {
    assert(context.openingBid && context.openingBid.bid.strain !== 'N');
    const vulnerability = getVulnerabilityForPartnership(context.vulnerability, context.partnership.partnership);
    const openingInterpretation = context.openingBid.mergedInterpretation || null;
    const openerSuitCount = openingInterpretation ? openingInterpretation.handEstimate.getSuitCount(context.openingBid.bid.strain).from : null;
    if (openerSuitCount && openerSuitCount >= 6) {
      const interpretation1 = new BidInterpretation(this.id, 'Pass: suit fit but not enough power', context.hand.estimate);
      interpretation1.updateState('offense-passed');
      interpretation1.handEstimate.addSuitBounds(context.openingBid.bid.strain, 8 - openerSuitCount, null);
      interpretation1.handEstimate.points.addBounds(null, vulnerability === 'favorable' ? 9 : 12);
      interpretations.push(interpretation1);

      const interpretation2 = new BidInterpretation(this.id, 'Pass: power but no suit fit', context.hand.estimate);
      interpretation2.updateState('offense-passed');
      interpretation2.handEstimate.points.addBounds(13, null);
      interpretation2.handEstimate.addSuitBounds(context.openingBid.bid.strain, null, 7 - openerSuitCount);
      interpretations.push(interpretation2);
    }
  }

  private interpretBid(context: BiddingAnalyzer, interpretations: BidInterpretation[]): void {
    assert(context.openingBid && context.openingBid.bid.strain !== 'N');
    const openingInterpretation = context.openingBid.mergedInterpretation || null;
    const openerSuitCount = openingInterpretation ? openingInterpretation.handEstimate.getSuitCount(context.openingBid.bid.strain).from : null;
    const vulnerability = getVulnerabilityForPartnership(context.vulnerability, context.partnership.partnership);
    if (openerSuitCount) {
      if (context.bid.strain === context.openingBid.bid.strain) {
        if (context.bid.isGameBonusApplicable(context.doubling)) {
          const interpretation = new BidInterpretation(this.id, 'Jump to game in partners preemptive suit', context.hand.estimate);
          interpretation.updateState('offense-logical');
          interpretation.handEstimate.points.addBounds(15, null);
          interpretation.handEstimate.addSuitBounds(context.openingBid.bid.strain, 8 - openerSuitCount, null);
          interpretations.push(interpretation);
        } else {
          const interpretation = new BidInterpretation(this.id, 'Increase preempt', context.hand.estimate);
          interpretation.updateState('offense-logical');
          interpretation.handEstimate.points.addBounds(vulnerability === 'favorable' ? 10 : 12, null);
          interpretation.handEstimate.addSuitBounds(context.openingBid.bid.strain, 8 - openerSuitCount, null);
          interpretations.push(interpretation);
        }
      } else if (context.bid.strain === 'N') {
        // jump into NT:
        if (context.bid.count === 2) {
          // invitation to game
          const interpretation = new BidInterpretation(this.id, 'Invitation to game in NT over preempt', context.hand.estimate);
          interpretation.updateState('offense-logical');
          interpretation.handEstimate.addSuitBounds(context.openingBid.bid.strain, 2, null);
          interpretation.handEstimate.points.addBounds(12, 14);
          interpretation.handEstimate.enforceNtDistribution();
          interpretations.push(interpretation);
        } else if (context.bid.count === 3) {
          // game
          const interpretation = new BidInterpretation(this.id, 'Choose game in NT over preempt', context.hand.estimate);
          interpretation.updateState('offense-logical');
          interpretation.handEstimate.addSuitBounds(context.openingBid.bid.strain, 2, null);
          interpretation.handEstimate.points.addBounds(15, 25);
          interpretation.handEstimate.enforceNtDistribution();
          interpretations.push(interpretation);
        }
      } else {
        // new suit: strong
        const interpretation = new BidInterpretation(this.id, 'New suit over preempt: strong hand', context.hand.estimate);
        interpretation.updateState('offense-logical');
        interpretation.handEstimate.addSuitBounds(context.openingBid.bid.strain, 2, null);
        interpretation.handEstimate.addSuitBounds(context.bid.strain, 5, null);
        if (!context.bid.isGameBonusApplicable(context.doubling)) {
          interpretation.force = 'yes';
        }
        interpretations.push(interpretation);
      }
    }
  }
}

