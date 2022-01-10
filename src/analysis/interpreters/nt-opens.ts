import { BidInterpretation } from "../bid-interpretation";
import { BiddingAnalyzer } from "../bidding-analyzer";
import { BiddingInterpreterBase } from "../bidding-interpreter";

export class NTOpenBidInterpreter extends BiddingInterpreterBase {
  constructor() {
    super('std-nt-opens', 'Std: NT opens');
  }

  async interpret(context: BiddingAnalyzer): Promise<BidInterpretation[]> {
    const result: BidInterpretation[] = [];
    if (context.partnership.hasState('no-bids') && !context.openingBid) {
      if (context.bid.type === 'normal' && context.bid.strain === 'N') {
        const interpretation = new BidInterpretation(this.id, `${context.bid.count}NT opening bid`, context.hand.estimate);
        interpretation.updateState('opening-nt');
        interpretation.handEstimate.enforceNtDistribution();
        switch (context.bid.count) {
          case 1:
            interpretation.handEstimate.points.addBounds(15, 17);
            break;
          case 2:
            interpretation.handEstimate.points.addBounds(20, 21);
            break;
          case 3:
            interpretation.handEstimate.points.addBounds(24, 27);
            interpretation.updateState('offense-logical');
            break;
          case 4:
            interpretation.handEstimate.points.addBounds(28, 31);
            interpretation.slamInvitation = true;
            interpretation.updateState('slam-invitation-quantitative');
            break;
          case 5:
            interpretation.handEstimate.points.addBounds(32, null);
            interpretation.slamInvitation = true;
            interpretation.updateState('slam-invitation-quantitative');
            break;
          case 6:
            interpretation.handEstimate.points.addBounds(34, null);
            interpretation.updateState('offense-logical');
            break;
          case 7:
            interpretation.handEstimate.points.addBounds(37, null);
            interpretation.updateState('offense-logical');
            break;
          default:
            throw new Error("Unexpected bid count");
        }
        result.push(interpretation);
      }
    }
    return result;
  }
}
