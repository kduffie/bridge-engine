import { BidInterpretation } from "../bid-interpretation";
import { BiddingAnalyzer } from "../bidding-analyzer";
import { BiddingInterpreterBase } from "../bidding-interpreter";
import * as assert from 'assert';

export class PreemptOpenBidInterpreter extends BiddingInterpreterBase {
  constructor() {
    super('std-preempt-opens', 'Std: preemptive opens');
  }

  async interpret(context: BiddingAnalyzer): Promise<BidInterpretation[]> {
    const result: BidInterpretation[] = [];
    if (context.partnership.hasState('no-bids') && !context.openingBid) {
      if (context.bid.type === 'normal' && context.bid.count === 2 && ['D', 'H', 'S'].indexOf(context.bid.strain) >= 0) {
        const interpretation = new BidInterpretation(this.id, 'Weak-2 opening bid', context.hand.estimate);
        interpretation.updateState('opening-preempt');
        interpretation.handEstimate.points.addBounds(6, 10);
        assert(context.bid.strain !== 'N');
        interpretation.handEstimate.addSuitBounds(context.bid.strain, 6, 6);
        result.push(interpretation);
      } else if (context.bid.type === 'normal' && context.bid.count === 3 && context.bid.strain !== 'N') {
        const interpretation = new BidInterpretation(this.id, 'Preemptive opening bid', context.hand.estimate);
        interpretation.updateState('opening-preempt');
        interpretation.handEstimate.points.addBounds(6, 10);
        interpretation.handEstimate.addSuitBounds(context.bid.strain, 7, null);
        result.push(interpretation);
      } else if (context.bid.type === 'normal' && context.bid.count === 4 && ['C', 'D'].indexOf(context.bid.strain) >= 0) {
        const interpretation = new BidInterpretation(this.id, 'Preemptive opening bid', context.hand.estimate);
        interpretation.updateState('opening-preempt');
        interpretation.handEstimate.points.addBounds(6, 10);
        assert(context.bid.strain !== 'N');
        interpretation.handEstimate.addSuitBounds(context.bid.strain, 8, null);
        result.push(interpretation);
      }
    }
    return result;
  }
}
