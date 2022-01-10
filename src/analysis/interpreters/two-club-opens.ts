import { BidInterpretation } from "../bid-interpretation";
import { BiddingAnalyzer } from "../bidding-analyzer";
import { BiddingInterpreterBase } from "../bidding-interpreter";
import * as assert from 'assert';

export class TwoClubOpenBidInterpreter extends BiddingInterpreterBase {
  constructor() {
    super('std-2c-opens', 'Std: 2c opens');
  }

  async interpret(context: BiddingAnalyzer): Promise<BidInterpretation[]> {
    const result: BidInterpretation[] = [];
    if (context.partnership.hasState('no-bids') && !context.openingBid) {
      if (context.bid.type === 'normal' && context.bid.count === 2 && context.bid.strain === 'C') {
        const interpretation = new BidInterpretation(this.id, `2C open: 22+ HCP or 9 tricks`, context.hand.estimate);
        interpretation.updateState('opening-2c');
        interpretation.force = '4-bids';
        interpretation.handEstimate.points.addBounds(22, null);
        result.push(interpretation);
      }
    } else if (context.partnership.hasState('opening-2c')) {
      if (context.bid.type === 'normal' && context.bid.count === 2 && context.bid.strain === 'D' || context.bid.type === 'pass' && context.rho.lastBid && context.rho.lastBid.bid.type !== 'pass') {
        const interpretation1 = new BidInterpretation(this.id, 'Waiting: less than 8 points and/or 5+card suit', context.hand.estimate);
        interpretation1.updateState('opening-2c-response');
        interpretation1.force = '4-bids';
        interpretation1.handEstimate.points.addBounds(null, 7);
        result.push(interpretation1);
        const interpretation2 = new BidInterpretation(this.id, '2D waiting: no 5+-card suit', context.hand.estimate);
        interpretation2.updateState('opening-2c-response');
        interpretation2.handEstimate.addSuitBounds('C', null, 4);
        interpretation2.handEstimate.addSuitBounds('D', null, 4);
        interpretation2.handEstimate.addSuitBounds('D', null, 4);
        interpretation2.handEstimate.addSuitBounds('D', null, 4);
        result.push(interpretation2);
      } else if (context.bid.count === 2 && ['H', 'S'].indexOf(context.bid.strain) >= 0) {
        assert(context.bid.strain !== 'N');
        const interpretation3 = new BidInterpretation(this.id, '2C response: 5+ card suit and 8+ points', context.hand.estimate);
        interpretation3.updateState('offense-logical');
        interpretation3.force = '3-bids';
        interpretation3.handEstimate.points.addBounds(8, null);
        interpretation3.handEstimate.addSuitBounds(context.bid.strain, 5, null);
        result.push(interpretation3);
      } else if (context.bid.count === 3 && ['C', 'D'].indexOf(context.bid.strain) >= 0) {
        assert(context.bid.strain !== 'N');
        const interpretation4 = new BidInterpretation(this.id, '2C response: 5+ card suit and 8+ points', context.hand.estimate);
        interpretation4.updateState('offense-logical');
        interpretation4.force = '3-bids';
        interpretation4.handEstimate.points.addBounds(8, null);
        interpretation4.handEstimate.addSuitBounds(context.bid.strain, 5, null);
        result.push(interpretation4);
      } else if (context.rho.lastBid && context.rho.lastBid.bid.type !== 'pass' && context.bid.type === 'pass') {
        const interpretation = new BidInterpretation(this.id, '2C response: pass - following after interference', context.hand.estimate);
        interpretation.updateState('opening-2c-response');
        interpretation.force = '4-bids';
        interpretation.handEstimate.points.addBounds(null, 7);
        result.push(interpretation);
      }
    } else if (context.partnership.hasState('opening-2c-response')) {
      if (context.bid.type === 'normal' && (context.bid.count === 2 && ['H', 'S'].indexOf(context.bid.strain) >= 0 || context.bid.count === 3 && ['C', 'D'].indexOf(context.bid.strain) >= 0)) {
        assert(context.bid.strain !== 'N');
        const interpretation = new BidInterpretation(this.id, 'Best suit of 2C opener', context.hand.estimate);
        interpretation.updateState('offense-logical');
        interpretation.force = '3-bids';
        interpretation.handEstimate.addSuitBounds(context.bid.strain, 5, null);
        result.push(interpretation);
      } else if (context.bid.type === 'normal' && context.bid.count === 2 && context.bid.strain === 'N') {
        const interpretation = new BidInterpretation(this.id, 'Opener has NT distribution with fewer than 25 HCP', context.hand.estimate);
        interpretation.updateState('offense-logical');
        interpretation.force = '3-bids';
        interpretation.handEstimate.points.addBounds(null, 24);
        result.push(interpretation);
      } else if (context.bid.type === 'normal' && context.bid.count === 3 && context.bid.strain === 'N') {
        const interpretation = new BidInterpretation(this.id, 'Opener has NT distribution with at least game in hand', context.hand.estimate);
        interpretation.updateState('offense-logical');
        interpretation.force = 'none';
        interpretation.slamInvitation = true;
        interpretation.handEstimate.points.addBounds(25, null);
        result.push(interpretation);
      }
    }
    return result;
  }
}
