import { BidInterpretation } from "../bid-interpretation";
import { BiddingAnalyzer } from "../bidding-analyzer";
import { BiddingInterpreterBase } from "../bidding-interpreter";

export class SimpleSuitOpenBidInterpreter extends BiddingInterpreterBase {
  constructor() {
    super('std-simple-suit-opens', 'Std: simple suit opens');
  }

  async interpret(context: BiddingAnalyzer): Promise<BidInterpretation[]> {
    const result: BidInterpretation[] = [];
    if (context.partnership.hasState('no-bids') && !context.openingBid) {
      if (context.bid.type === 'normal' && context.bid.count === 1 && context.bid.strain !== 'N') {
        const interpretation = new BidInterpretation(this.id, 'Simple opening bid', context.hand.estimate);
        if (context.isBalancingSeat) {
          interpretation.description = 'Simple opening bid: balancing, maybe light';
          interpretation.handEstimate.points.addBounds(11, 21);
        } else {
          interpretation.handEstimate.points.addBounds(13, 21);
        }
        interpretation.updateState('opening-suit');
        switch (context.bid.strain) {
          case 'C':
            interpretation.handEstimate.addSuitBounds('C', 2, null);
            interpretation.handEstimate.addSuitBounds('D', null, 3);
            interpretation.handEstimate.addSuitBounds('H', null, 4);
            interpretation.handEstimate.addSuitBounds('S', null, 4);
            break;
          case 'D':
            interpretation.handEstimate.addSuitBounds('D', 4, null);
            interpretation.handEstimate.addSuitBounds('H', null, 4);
            interpretation.handEstimate.addSuitBounds('S', null, 4);
            break;
          case 'H':
            interpretation.handEstimate.addSuitBounds('H', 5, null);
            interpretation.handEstimate.addSuitBounds('S', null, 5);
            break;
          case 'S':
            interpretation.handEstimate.addSuitBounds('H', null, 5);
            interpretation.handEstimate.addSuitBounds('S', 5, null);
            break;
          default:
            throw new Error('Unexpected strain');
        }
        result.push(interpretation);
      }
    }
    return result;
  }
}
