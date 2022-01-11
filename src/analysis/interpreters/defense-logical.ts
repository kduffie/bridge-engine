import { BidInterpretation } from "../bid-interpretation";
import { BiddingAnalyzer } from "../bidding-analyzer";
import { BiddingInterpreterBase } from "../bidding-interpreter";

export class DefenseLogicalBidInterpreter extends BiddingInterpreterBase {
  constructor() {
    super('std-defense-logical', 'Std: logical defense');
  }

  async interpret(context: BiddingAnalyzer): Promise<BidInterpretation[]> {
    const result: BidInterpretation[] = [];
    if (context.partnership.hasState('defense-logical')) {
      if (context.bid.type === 'pass') {
        const interpretation1 = new BidInterpretation(this.id, 'No suitable bid', context.hand.estimate);
        interpretation1.handEstimate.points.addBounds(null, 12);
        result.push(interpretation1);
      }
      // TODO
    }
    return result;
  }
}
