import { BidInterpretation } from "../bid-interpretation";
import { BiddingAnalyzer } from "../bidding-analyzer";
import { BiddingInterpreterBase } from "../bidding-interpreter";

export class InitialPassBidInterpreter extends BiddingInterpreterBase {
  constructor() {
    super('std-initial-pass', 'Std: initial pass');
  }

  async interpret(context: BiddingAnalyzer): Promise<BidInterpretation[]> {
    const result: BidInterpretation[] = [];
    if (context.partnership.hasState('no-bids') && !context.openingBid) {
      if (context.bid.type === 'pass') {
        const interpretation1 = new BidInterpretation(this.id, 'Insufficient points to open', context.hand.estimate);
        if (context.isBalancingSeat) {
          interpretation1.handEstimate.points.addBounds(null, 10);
        } else {
          interpretation1.handEstimate.points.addBounds(null, 12);
        }
        result.push(interpretation1);
        if (context.consecutivePasses < 3) {
          const interpretation2 = new BidInterpretation(this.id, 'Insufficient preemptive value', context.hand.estimate);
          interpretation2.handEstimate.points.addBounds(null, 6);
          interpretation2.handEstimate.addSuitBounds('C', null, 6);
          interpretation2.handEstimate.addSuitBounds('D', null, 5);
          interpretation2.handEstimate.addSuitBounds('H', null, 5);
          interpretation2.handEstimate.addSuitBounds('S', null, 5);
          result.push(interpretation2);
        }
      }
    } else if (context.partnership.hasState('no-bids') && context.openingBid) {
      const interpretation = new BidInterpretation(this.id, 'No suitable overcall', context.hand.estimate);
      interpretation.updateState('defense-logical');
      interpretation.handEstimate.points.addBounds(null, 12);
      // TODO: consider other interpretation with points but no suit
      result.push(interpretation);
    }
    return result;
  }
}
