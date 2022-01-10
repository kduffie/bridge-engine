
import { BidInterpretation } from "../bid-interpretation";
import { BiddingAnalyzer } from "../bidding-analyzer";
import { BiddingInterpreterBase } from "../bidding-interpreter";
import * as assert from 'assert';

export class SimpleSuitOpenResponseBidInterpreter extends BiddingInterpreterBase {
  constructor() {
    super('std-simple-suit-open-responses', 'Std: simple suit open responses');
  }

  async interpret(context: BiddingAnalyzer): Promise<BidInterpretation[]> {
    const result: BidInterpretation[] = [];
    if (context.partnership.hasState('opening-suit') && context.partnership.openingBid) {
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
        default:
          throw new Error("Unexpected bid type");
      }
    }
    return result;
  }

  private interpretPass(context: BiddingAnalyzer, interpretations: BidInterpretation[]): void {
    assert(context.rho.lastBid);
    if (context.rho.lastBid.bid.type === 'pass' || context.rho.lastBid.bid.type === 'double') {
      const interpretation = new BidInterpretation(this.id, 'Poor hand', context.hand.estimate);
      interpretation.updateState('offense-passed');
      interpretation.handEstimate.points.addBounds(null, 5);
      interpretations.push(interpretation);
    } else if (context.rho.lastBid.bid.type === 'normal' && context.rho.lastBid.bid.count === 1 && context.rho.lastBid.bid.strain === 'N' || context.rho.lastBid.bid.count >= 2) {
      const interpretation = new BidInterpretation(this.id, 'Insufficient hand to compete over interference', context.hand.estimate);
      interpretation.updateState('offense-passed');
      interpretation.handEstimate.points.addBounds(null, 10);
      interpretations.push(interpretation);
    }
  }

  private interpretBid(context: BiddingAnalyzer, interpretations: BidInterpretation[]): void {
    assert(context.openingBid && context.openingBid.bid.count === 1 && context.bid.type === 'normal');
    switch (context.openingBid.bid.strain) {
      case 'C':
        this.interpretResponsesTo1C(context, interpretations);
        break;
      case 'D':
        this.interpretResponsesTo1D(context, interpretations);
        break;
      case 'H':
        this.interpretResponsesTo1H(context, interpretations);
        break;
      case 'S':
        this.interpretResponsesTo1S(context, interpretations);
        break;
      default:
        throw new Error("Unexpected strain");
    }
  }

  private interpretResponsesTo1C(context: BiddingAnalyzer, interpretations: BidInterpretation[]): void {
    if (context.bid.count === 1 && context.bid.strain === 'D') {
      const interpretation = new BidInterpretation(this.id, '4+ diamonds, no 4-card major', context.hand.estimate);
      interpretation.updateState('offense-logical');
      interpretation.force = 'yes';
      interpretation.handEstimate.points.addBounds(6, null);
      interpretation.handEstimate.addSuitBounds('D', 4, null);
      interpretation.handEstimate.addSuitBounds('H', null, 3);
      interpretation.handEstimate.addSuitBounds('S', null, 3);
      interpretations.push(interpretation);
    } else if (context.bid.count === 1 && context.bid.strain === 'H') {
      const interpretation = new BidInterpretation(this.id, '4+ hearts, hearts longer than spades', context.hand.estimate);
      interpretation.updateState('offense-logical');
      interpretation.force = 'yes';
      interpretation.handEstimate.points.addBounds(6, null);
      interpretation.handEstimate.addSuitBounds('H', 4, null);
      interpretations.push(interpretation);
    } else if (context.bid.count === 1 && context.bid.strain === 'S') {
      const interpretation = new BidInterpretation(this.id, '4+ spades', context.hand.estimate);
      interpretation.updateState('offense-logical');
      interpretation.force = 'yes';
      interpretation.handEstimate.points.addBounds(6, null);
      interpretation.handEstimate.addSuitBounds('H', null, 5);
      interpretation.handEstimate.addSuitBounds('S', 4, null);
      interpretations.push(interpretation);
    } else if (context.bid.count === 1 && context.bid.strain === 'N') {
      const interpretation = new BidInterpretation(this.id, '6-9 points, flat distribution', context.hand.estimate);
      interpretation.updateState('offense-logical');
      interpretation.handEstimate.points.addBounds(6, 12);
      interpretation.handEstimate.addSuitBounds('D', null, 3);
      interpretation.handEstimate.addSuitBounds('H', null, 3);
      interpretation.handEstimate.addSuitBounds('S', null, 3);
      interpretations.push(interpretation);
    } else if (context.bid.count === 2 && context.bid.strain === 'C') {
      const interpretation = new BidInterpretation(this.id, '5+ clubs, 10+ points, forcing', context.hand.estimate);
      interpretation.updateState('offense-logical');
      interpretation.force = 'yes';
      interpretation.handEstimate.points.addBounds(10, null);
      interpretation.handEstimate.addSuitBounds('C', 5, null);
      interpretation.handEstimate.addSuitBounds('H', null, 3);
      interpretation.handEstimate.addSuitBounds('S', null, 3);
      interpretations.push(interpretation);
    } else if (context.bid.count === 2 && context.bid.strain === 'N') {
      const interpretation = new BidInterpretation(this.id, '10-12 points, flat distribution', context.hand.estimate);
      interpretation.updateState('offense-logical');
      interpretation.handEstimate.points.addBounds(10, 12);
      interpretation.handEstimate.enforceNtDistribution();
      interpretation.handEstimate.addSuitBounds('H', null, 3);
      interpretation.handEstimate.addSuitBounds('S', null, 3);
      interpretations.push(interpretation);
    } else if (context.bid.count === 3 && context.bid.strain === 'C') {
      const interpretation = new BidInterpretation(this.id, '6+ clubs, 6-9 points', context.hand.estimate);
      interpretation.updateState('offense-logical');
      interpretation.handEstimate.points.addBounds(6, 9);
      interpretation.handEstimate.addSuitBounds('C', 6, null);
      interpretation.handEstimate.addSuitBounds('H', null, 3);
      interpretation.handEstimate.addSuitBounds('S', null, 3);
      interpretations.push(interpretation);
    } else if (context.bid.count === 3 && context.bid.strain === 'N') {
      const interpretation = new BidInterpretation(this.id, '13+ points, flat distribution', context.hand.estimate);
      interpretation.updateState('offense-logical');
      interpretation.handEstimate.points.addBounds(13, 18);
      interpretation.handEstimate.enforceNtDistribution();
      interpretation.handEstimate.addSuitBounds('H', null, 3);
      interpretation.handEstimate.addSuitBounds('S', null, 3);
      interpretations.push(interpretation);
    }
  }

  private interpretResponsesTo1D(context: BiddingAnalyzer, interpretations: BidInterpretation[]): void {
    if (context.bid.count === 1 && context.bid.strain === 'H') {
      const interpretation = new BidInterpretation(this.id, '4+ hearts, hearts longer than spades', context.hand.estimate);
      interpretation.updateState('offense-logical');
      interpretation.handEstimate.points.addBounds(6, null);
      interpretation.force = 'yes';
      interpretation.handEstimate.addSuitBounds('H', 4, null);
      interpretations.push(interpretation);
    } else if (context.bid.count === 1 && context.bid.strain === 'S') {
      const interpretation = new BidInterpretation(this.id, '4+ spades', context.hand.estimate);
      interpretation.updateState('offense-logical');
      interpretation.handEstimate.points.addBounds(6, null);
      interpretation.force = 'yes';
      interpretation.handEstimate.addSuitBounds('H', null, 5);
      interpretation.handEstimate.addSuitBounds('S', 4, null);
      interpretations.push(interpretation);
    } else if (context.bid.count === 1 && context.bid.strain === 'N') {
      const interpretation = new BidInterpretation(this.id, '6-9 points, flat distribution', context.hand.estimate);
      interpretation.updateState('offense-logical');
      interpretation.handEstimate.points.addBounds(6, 9);
      interpretation.handEstimate.addSuitBounds('D', null, 4);
      interpretation.handEstimate.addSuitBounds('H', null, 3);
      interpretation.handEstimate.addSuitBounds('S', null, 3);
      interpretations.push(interpretation);
    } else if (context.bid.count === 2 && context.bid.strain === 'C') {
      const interpretation = new BidInterpretation(this.id, '2-over-1: no 4-card major', context.hand.estimate);
      interpretation.updateState('offense-logical');
      interpretation.handEstimate.points.addBounds(12, null);
      interpretation.force = 'yes';
      interpretation.handEstimate.addSuitBounds('C', 4, null);
      interpretation.handEstimate.addSuitBounds('H', null, 3);
      interpretation.handEstimate.addSuitBounds('S', null, 3);
      interpretations.push(interpretation);
    } else if (context.bid.count === 2 && context.bid.strain === 'D') {
      const interpretation = new BidInterpretation(this.id, '6-9 points, 4+ diamonds', context.hand.estimate);
      interpretation.updateState('offense-logical');
      interpretation.handEstimate.points.addBounds(6, 9);
      interpretation.handEstimate.addSuitBounds('D', 4, null);
      interpretation.handEstimate.addSuitBounds('H', null, 3);
      interpretation.handEstimate.addSuitBounds('S', null, 3);
      interpretations.push(interpretation);
    } else if (context.bid.count === 2 && context.bid.strain === 'N') {
      const interpretation = new BidInterpretation(this.id, '10-12 points, flat distribution', context.hand.estimate);
      interpretation.updateState('offense-logical');
      interpretation.handEstimate.points.addBounds(10, 12);
      interpretation.handEstimate.enforceNtDistribution();
      interpretation.handEstimate.addSuitBounds('H', null, 3);
      interpretation.handEstimate.addSuitBounds('S', null, 3);
      interpretations.push(interpretation);
    } else if (context.bid.count === 3 && context.bid.strain === 'D') {
      const interpretation = new BidInterpretation(this.id, 'Limit raise in diamonds: 5+ diamonds, 10-12 points', context.hand.estimate);
      interpretation.updateState('offense-logical');
      interpretation.handEstimate.points.addBounds(10, 12);
      interpretation.handEstimate.addSuitBounds('D', 5, null);
      interpretation.handEstimate.addSuitBounds('H', null, 3);
      interpretation.handEstimate.addSuitBounds('S', null, 3);
      interpretations.push(interpretation);
    } else if (context.bid.count === 3 && context.bid.strain === 'N') {
      const interpretation = new BidInterpretation(this.id, '13+ points, flat distribution', context.hand.estimate);
      interpretation.updateState('offense-logical');
      interpretation.handEstimate.points.addBounds(13, 18);
      interpretation.handEstimate.enforceNtDistribution();
      interpretation.handEstimate.addSuitBounds('H', null, 3);
      interpretation.handEstimate.addSuitBounds('S', null, 3);
      interpretations.push(interpretation);
    }
  }

  private interpretResponsesTo1H(context: BiddingAnalyzer, interpretations: BidInterpretation[]): void {
    if (context.bid.strain === 'H') {
      if (context.bid.count === 2) {
        const interpretation = new BidInterpretation(this.id, 'Simple raise: 6-9, 3+ hearts', context.hand.estimate);
        interpretation.updateState('offense-logical');
        interpretation.handEstimate.points.addBounds(6, 9);
        interpretation.handEstimate.addSuitBounds('H', 3, null);
        interpretations.push(interpretation);
      } else if (context.bid.count === 3) {
        const interpretation = new BidInterpretation(this.id, 'Limit raise: 10-11, 3+ hearts', context.hand.estimate);
        interpretation.updateState('offense-logical');
        interpretation.handEstimate.points.addBounds(10, 11);
        interpretation.handEstimate.addSuitBounds('H', 3, null);
        interpretations.push(interpretation);
      } else if (context.bid.count === 4) {
        const interpretation = new BidInterpretation(this.id, 'Jump to game: 10-13, 4+ hearts', context.hand.estimate);
        interpretation.updateState('offense-logical');
        interpretation.handEstimate.points.addBounds(10, 13);
        interpretation.handEstimate.addSuitBounds('H', 4, null);
        interpretations.push(interpretation);
      }
    } else if (context.bid.count === 1 && context.bid.strain === 'S') {
      const interpretation = new BidInterpretation(this.id, '6+ points, 4+ spades', context.hand.estimate);
      interpretation.updateState('offense-logical');
      interpretation.handEstimate.points.addBounds(6, null);
      interpretation.force = 'yes';
      interpretation.handEstimate.addSuitBounds('S', 4, null);
      interpretations.push(interpretation);
    } else if (context.bid.count === 1 && context.bid.strain === 'N') {
      const interpretation = new BidInterpretation(this.id, '6-12 points, 0-2 hearts', context.hand.estimate);
      interpretation.updateState('offense-logical');
      interpretation.handEstimate.points.addBounds(6, 12);
      interpretation.handEstimate.addSuitBounds('H', null, 2);
      interpretations.push(interpretation);
    } else if (context.bid.count === 2 && context.bid.strain === 'C') {
      const interpretation = new BidInterpretation(this.id, '2-over-1, 4+ clubs, 12+ points, game forcing', context.hand.estimate);
      interpretation.updateState('offense-logical');
      interpretation.handEstimate.points.addBounds(12, null);
      interpretation.force = 'game';
      interpretation.handEstimate.addSuitBounds('C', 4, null);
      interpretation.handEstimate.addSuitBounds('H', null, 2);
      interpretation.handEstimate.addSuitBounds('S', null, 3);
      interpretations.push(interpretation);
    } else if (context.bid.count === 2 && context.bid.strain === 'D') {
      const interpretation = new BidInterpretation(this.id, '2-over-1, 4+ diamonds, 12+ points, game forcing', context.hand.estimate);
      interpretation.updateState('offense-logical');
      interpretation.handEstimate.points.addBounds(12, null);
      interpretation.force = 'game';
      interpretation.handEstimate.addSuitBounds('D', 4, null);
      interpretation.handEstimate.addSuitBounds('H', null, 2);
      interpretation.handEstimate.addSuitBounds('S', null, 3);
      interpretations.push(interpretation);
    } else if (context.bid.count === 2 && context.bid.strain === 'N') {
      const interpretation = new BidInterpretation(this.id, 'Jacoby 2NT: 12+ points, 4+ spades', context.hand.estimate);
      interpretation.updateState('offense-logical');
      interpretation.handEstimate.points.addBounds(12, null);
      interpretation.force = 'game';
      interpretation.handEstimate.addSuitBounds('H', 4, null);
      interpretations.push(interpretation);
    } else if (context.bid.count === 4 && context.bid.strain === 'N') {
      const interpretation = new BidInterpretation(this.id, 'RK Blackwood: 3+ hearts, 18+ points', context.hand.estimate);
      interpretation.updateState('offense-logical');
      interpretation.handEstimate.points.addBounds(18, null);
      interpretation.force = 'yes';
      interpretation.handEstimate.addSuitBounds('H', 3, null);
      interpretations.push(interpretation);
    }
  }

  private interpretResponsesTo1S(context: BiddingAnalyzer, interpretations: BidInterpretation[]): void {
    if (context.bid.strain === 'S') {
      if (context.bid.count === 2) {
        const interpretation = new BidInterpretation(this.id, 'Simple raise: 6-9, 3+ spades', context.hand.estimate);
        interpretation.updateState('offense-logical');
        interpretation.handEstimate.points.addBounds(6, 9);
        interpretation.handEstimate.addSuitBounds('S', 3, null);
        interpretations.push(interpretation);
      } else if (context.bid.count === 3) {
        const interpretation = new BidInterpretation(this.id, 'Limit raise: 10-11, 3+ spades', context.hand.estimate);
        interpretation.updateState('offense-logical');
        interpretation.handEstimate.points.addBounds(10, 11);
        interpretation.handEstimate.addSuitBounds('S', 3, null);
        interpretations.push(interpretation);
      } else if (context.bid.count === 4) {
        const interpretation = new BidInterpretation(this.id, 'Jump to game: 10-13, 4+ spades', context.hand.estimate);
        interpretation.updateState('offense-logical');
        interpretation.handEstimate.points.addBounds(10, 13);
        interpretation.handEstimate.addSuitBounds('S', 4, null);
        interpretations.push(interpretation);
      }
    } else if (context.bid.count === 1 && context.bid.strain === 'N') {
      const interpretation = new BidInterpretation(this.id, '6-12 points, 0-2 spades', context.hand.estimate);
      interpretation.updateState('offense-logical');
      interpretation.handEstimate.points.addBounds(6, 12);
      interpretation.handEstimate.addSuitBounds('S', null, 2);
      interpretations.push(interpretation);
    } else if (context.bid.count === 2 && context.bid.strain === 'C') {
      const interpretation = new BidInterpretation(this.id, '2-over-1, 4+ clubs, 12+ points, game forcing', context.hand.estimate);
      interpretation.updateState('offense-logical');
      interpretation.handEstimate.points.addBounds(12, null);
      interpretation.force = 'game';
      interpretation.handEstimate.addSuitBounds('C', 4, null);
      interpretation.handEstimate.addSuitBounds('H', null, 4);
      interpretation.handEstimate.addSuitBounds('S', null, 2);
      interpretations.push(interpretation);
    } else if (context.bid.count === 2 && context.bid.strain === 'D') {
      const interpretation = new BidInterpretation(this.id, '2-over-1, 4+ diamonds, 12+ points, game forcing', context.hand.estimate);
      interpretation.updateState('offense-logical');
      interpretation.handEstimate.points.addBounds(12, null);
      interpretation.force = 'game';
      interpretation.handEstimate.addSuitBounds('D', 4, null);
      interpretation.handEstimate.addSuitBounds('H', null, 4);
      interpretation.handEstimate.addSuitBounds('S', null, 2);
      interpretations.push(interpretation);
    } else if (context.bid.count === 2 && context.bid.strain === 'H') {
      const interpretation = new BidInterpretation(this.id, '2-over-1, 5+ hearts, 12+ points, game forcing', context.hand.estimate);
      interpretation.updateState('offense-logical');
      interpretation.handEstimate.points.addBounds(12, null);
      interpretation.force = 'game';
      interpretation.handEstimate.addSuitBounds('H', 5, null);
      interpretations.push(interpretation);
    } else if (context.bid.count === 2 && context.bid.strain === 'N') {
      const interpretation = new BidInterpretation(this.id, 'Jacoby 2NT: 12+ points, 4+ spades', context.hand.estimate);
      interpretation.updateState('offense-logical');
      interpretation.handEstimate.points.addBounds(12, null);
      interpretation.force = 'game';
      interpretation.handEstimate.addSuitBounds('S', 4, null);
      interpretations.push(interpretation);
    } else if (context.bid.count === 4 && context.bid.strain === 'N') {
      const interpretation = new BidInterpretation(this.id, 'RK Blackwood: 3+ spades, 18+ points', context.hand.estimate);
      interpretation.updateState('offense-logical');
      interpretation.handEstimate.points.addBounds(18, null);
      interpretation.force = 'yes';
      interpretation.handEstimate.addSuitBounds('S', 3, null);
      interpretations.push(interpretation);
    }
  }

  private interpretDouble(context: BiddingAnalyzer, interpretations: BidInterpretation[]): void {
    assert(context.rho.lastBid && context.rho.lastBid.bid.type === 'normal');
    const interpretation = new BidInterpretation(this.id, 'Negative Double', context.hand.estimate);
    interpretation.updateState('negative-double-sequence');
    interpretation.handEstimate.points.addBounds(6, null);
    interpretation.force = 'yes';
    switch (context.rho.lastBid.bid.strain) {
      case 'H':
        interpretation.handEstimate.addSuitBounds('S', 4, 4);
        break;
      case 'S': {
        interpretation.handEstimate.points.addBounds(6, null);
        interpretation.handEstimate.addSuitBounds('H', 4, 4);
        const interpretation2 = new BidInterpretation(this.id, "Negative Double: extra hearts, but limited points", context.hand.estimate);
        interpretation2.updateState('negative-double-sequence');
        interpretation2.force = 'yes';
        interpretation2.handEstimate.points.addBounds(6, 9);
        interpretation2.handEstimate.addSuitBounds('H', 5, null);
        interpretations.push(interpretation2);
        break;
      }
      default:
        break;
    }
    interpretations.push(interpretation);
  }
}
