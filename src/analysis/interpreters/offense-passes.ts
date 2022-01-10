
import { BidInterpretation } from "../bid-interpretation";
import { BiddingAnalyzer } from "../bidding-analyzer";
import { BiddingInterpreterBase } from "../bidding-interpreter";
import * as assert from 'assert';
import { isMinor } from "../../common";

export class OffensePassesBidInterpreter extends BiddingInterpreterBase {
  constructor() {
    super('std-offense-passes', 'Std: logical offense after passes');
  }

  async interpret(context: BiddingAnalyzer): Promise<BidInterpretation[]> {
    let result: BidInterpretation[] = [];
    if (context.partnership.hasState('offense-passed') && context.partnership.openingBid) {
      assert(context.lastNormalBid);
      if (context.partnership.hasState('offense-passed') && context.partnership.openingBid && context.partnership.lastBid && context.partnership.lastBid.bid.type === 'pass') {
        const partnerPoints = context.partnerHand.estimate.points.from || 0;
        if (context.lastNormalBid.bid.isSlamBonusApplicable()) {
          const interpretation = new BidInterpretation(this.id, 'Slam reached.', context.hand.estimate);
          result.push(interpretation);
        } else if (context.lastNormalBid.bid.isGameBonusApplicable(context.doubling)) {
          const interpretation = new BidInterpretation(this.id, 'Game reached. Slam unlikely.', context.hand.estimate);
          interpretation.handEstimate.points.addBounds(null, (context.lastNormalBid.bid.strain === 'N' ? 31 : 29) - partnerPoints);
          result.push(interpretation);
        } else {
          const interpretation = new BidInterpretation(this.id, 'Insufficient points for game.  Stopping here.', context.hand.estimate);
          interpretation.handEstimate.points.addBounds(null, (isMinor(context.lastNormalBid.bid.strain) ? 26 : 24) - partnerPoints);
          result.push(interpretation);
        }
        // TODO: consider 4 of a minor, where
        // TODO: consider pass where prior bid presented an option between two suits
      }
    }

    return result;
  }
}
