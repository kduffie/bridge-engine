
import { BidInterpretation } from "../bid-interpretation";
import { BiddingAnalyzer } from "../bidding-analyzer";
import { BiddingInterpreterBase } from "../bidding-interpreter";
import * as assert from 'assert';

export class NTOpenResponseBidInterpreter extends BiddingInterpreterBase {
  constructor() {
    super('std-nt-open-responses', 'Std: NT open responses');
  }

  async interpret(context: BiddingAnalyzer): Promise<BidInterpretation[]> {
    const result: BidInterpretation[] = [];
    if (context.partnership.hasState('opening-nt') && context.partnership.openingBid) {
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
    assert(context.openingBid);
    if (context.openingBid.bid.count === 1) {
      switch (context.bid.strain) {
        case 'C':
          this.interpretCResponseTo1NT(context, interpretations);
          break;
        case 'D':
          this.interpretDResponseTo1NT(context, interpretations);
          break;
        case 'H':
          this.interpretHResponseTo1NT(context, interpretations);
          break;
        case 'S':
          this.interpret2SResponse(context, interpretations);
          break;
        case 'N':
          this.interpretNTResponseTo1NT(context, interpretations);
          break;
        default:
          throw new Error("Unexpected strain");
      }
    } else if (context.openingBid.bid.count === 2) {
      switch (context.bid.strain) {
        case 'C':
          this.interpretCResponseTo2NT(context, interpretations);
          break;
        case 'D':
          this.interpretDResponseTo2NT(context, interpretations);
          break;
        case 'H':
          this.interpretHResponseTo2NT(context, interpretations);
          break;
        case 'S':
          // no natural interpretation
          break;
        case 'N':
          this.interpretNTResponseTo2NT(context, interpretations);
          break;
        default:
          throw new Error("Unexpected strain");
      }
    }
  }


  private interpretCResponseTo1NT(context: BiddingAnalyzer, interpretations: BidInterpretation[]): void {
    if (context.bid.count === 2) {
      const interpretation = new BidInterpretation(this.id, 'Stayman: requesting a 4-card major', context.hand.estimate);
      interpretation.updateState('stayman-sequence');
      interpretation.force = 'yes';
      interpretation.handEstimate.points.addBounds(8, null);
      interpretation.handEstimate.addSuitBounds('H', null, 4);
      interpretation.handEstimate.addSuitBounds('S', null, 4);
      interpretations.push(interpretation);
    } else if (context.bid.count === 4) {
      const interpretation = new BidInterpretation(this.id, 'Gerber: requesting count of aces', context.hand.estimate);
      interpretation.updateState('gerber-sequence');
      interpretation.force = 'yes';
      interpretation.handEstimate.points.addBounds(13, null);
      interpretations.push(interpretation);
    }
  }

  private interpretDResponseTo1NT(context: BiddingAnalyzer, interpretations: BidInterpretation[]): void {
    if (context.bid.count === 2) {
      const interpretation = new BidInterpretation(this.id, 'Jacoby transfer: to hearts', context.hand.estimate);
      interpretation.updateState('jacoby-transfer-sequence');
      interpretation.force = 'yes';
      interpretation.handEstimate.points.addBounds(6, null);
      interpretation.handEstimate.addSuitBounds('H', 5, null);
      interpretations.push(interpretation);
    } else if (context.bid.count === 4) {
      const interpretation = new BidInterpretation(this.id, 'Texas transfer: to game in hearts', context.hand.estimate);
      interpretation.updateState('texas-transfer-sequence');
      interpretation.force = 'yes';
      interpretation.handEstimate.points.addBounds(9, 14);
      interpretation.handEstimate.addSuitBounds('H', 6, null);
      interpretations.push(interpretation);
    }
  }

  private interpretHResponseTo1NT(context: BiddingAnalyzer, interpretations: BidInterpretation[]): void {
    if (context.bid.count === 2) {
      const interpretation = new BidInterpretation(this.id, 'Jacoby transfer: to spades', context.hand.estimate);
      interpretation.updateState('jacoby-transfer-sequence');
      interpretation.force = 'yes';
      interpretation.handEstimate.points.addBounds(6, null);
      interpretation.handEstimate.addSuitBounds('S', 5, null);
      interpretations.push(interpretation);
    } else if (context.bid.count === 4) {
      const interpretation = new BidInterpretation(this.id, 'Texas transfer: to game in spades', context.hand.estimate);
      interpretation.updateState('texas-transfer-sequence');
      interpretation.force = 'yes';
      interpretation.handEstimate.points.addBounds(9, 14);
      interpretation.handEstimate.addSuitBounds('S', 6, null);
      interpretations.push(interpretation);
    }
  }

  private interpret2SResponse(context: BiddingAnalyzer, interpretations: BidInterpretation[]): void {
    const interpretation = new BidInterpretation(this.id, 'Jacoby transfer: to clubs', context.hand.estimate);
    interpretation.updateState('jacoby-transfer-sequence');
    interpretation.force = 'yes';
    interpretation.handEstimate.points.addBounds(6, null);
    interpretation.handEstimate.addSuitBounds('H', null, 3);
    interpretation.handEstimate.addSuitBounds('S', null, 3);
    interpretations.push(interpretation);
  }

  private interpretNTResponseTo1NT(context: BiddingAnalyzer, interpretations: BidInterpretation[]): void {
    const interpretation = new BidInterpretation(this.id, 'Raise in NT', context.hand.estimate);
    interpretation.updateState('offense-logical');
    interpretation.handEstimate.addSuitBounds('H', null, 3);
    interpretation.handEstimate.addSuitBounds('S', null, 3);
    switch (context.bid.count) {
      case 2:
        interpretation.description = 'Invitation to game in NT';
        interpretation.handEstimate.points.addBounds(8, 9);
        break;
      case 3:
        interpretation.description = 'Game in NT';
        interpretation.handEstimate.points.addBounds(10, 14);
        break;
      case 4:
        interpretation.description = 'Quantitative invitation to small slam in NT';
        interpretation.handEstimate.points.addBounds(15, 16);
        interpretation.slamInvitation = true;
        break;
      case 5:
        interpretation.description = 'Quantitative invitation to grand slam in NT';
        interpretation.handEstimate.points.addBounds(19, 20);
        interpretation.slamInvitation = true;
        break;
      case 6:
        interpretation.description = 'Slam in NT';
        interpretation.handEstimate.points.addBounds(17, 18);
        break;
      case 7:
        interpretation.description = 'Grand slam in NT';
        interpretation.handEstimate.points.addBounds(21, null);
        break;
      default:
        throw new Error("Unexpected bid count");
    }
    interpretations.push(interpretation);
  }

  private interpretCResponseTo2NT(context: BiddingAnalyzer, interpretations: BidInterpretation[]): void {
    if (context.bid.count === 3) {
      const interpretation = new BidInterpretation(this.id, 'Stayman: requesting a 4-card major', context.hand.estimate);
      interpretation.updateState('stayman-sequence');
      interpretation.force = 'yes';
      interpretation.handEstimate.points.addBounds(5, null);
      interpretation.handEstimate.addSuitBounds('H', null, 4);
      interpretation.handEstimate.addSuitBounds('S', null, 4);
      interpretations.push(interpretation);
    } else if (context.bid.count === 4) {
      const interpretation = new BidInterpretation(this.id, 'Gerber: requesting count of aces', context.hand.estimate);
      interpretation.updateState('gerber-sequence');
      interpretation.force = 'yes';
      interpretation.handEstimate.points.addBounds(13, null);
      interpretations.push(interpretation);
    }
  }

  private interpretDResponseTo2NT(context: BiddingAnalyzer, interpretations: BidInterpretation[]): void {
    if (context.bid.count === 3) {
      const interpretation = new BidInterpretation(this.id, 'Jacoby transfer: to hearts', context.hand.estimate);
      interpretation.updateState('jacoby-transfer-sequence');
      interpretation.force = 'yes';
      interpretation.handEstimate.points.addBounds(5, null);
      interpretation.handEstimate.addSuitBounds('H', 5, null);
      interpretations.push(interpretation);
    } else if (context.bid.count === 4) {
      const interpretation = new BidInterpretation(this.id, 'Texas transfer: to game in hearts', context.hand.estimate);
      interpretation.updateState('texas-transfer-sequence');
      interpretation.force = 'yes';
      interpretation.handEstimate.points.addBounds(5, 10);
      interpretation.handEstimate.addSuitBounds('H', 6, null);
      interpretations.push(interpretation);
    }
  }

  private interpretHResponseTo2NT(context: BiddingAnalyzer, interpretations: BidInterpretation[]): void {
    if (context.bid.count === 3) {
      const interpretation = new BidInterpretation(this.id, 'Jacoby transfer: to spades', context.hand.estimate);
      interpretation.updateState('jacoby-transfer-sequence');
      interpretation.force = 'yes';
      interpretation.handEstimate.points.addBounds(5, null);
      interpretation.handEstimate.addSuitBounds('S', 5, null);
      interpretations.push(interpretation);
    } else if (context.bid.count === 4) {
      const interpretation = new BidInterpretation(this.id, 'Texas transfer: to game in spades', context.hand.estimate);
      interpretation.updateState('texas-transfer-sequence');
      interpretation.force = 'yes';
      interpretation.handEstimate.points.addBounds(5, 10);
      interpretation.handEstimate.addSuitBounds('S', 6, null);
      interpretations.push(interpretation);
    }
  }


  private interpretNTResponseTo2NT(context: BiddingAnalyzer, interpretations: BidInterpretation[]): void {
    const interpretation = new BidInterpretation(this.id, 'Raise in NT', context.hand.estimate);
    interpretation.updateState('offense-logical');
    interpretation.handEstimate.addSuitBounds('H', null, 3);
    interpretation.handEstimate.addSuitBounds('S', null, 3);
    switch (context.bid.count) {
      case 3:
        interpretation.description = 'Game in NT';
        interpretation.handEstimate.points.addBounds(4, 8);
        break;
      case 4:
        interpretation.description = 'Quantitative invitation to slam in NT';
        interpretation.handEstimate.points.addBounds(9, 10);
        interpretation.slamInvitation = true;
        break;
      case 5:
        interpretation.description = 'Quantitative invitation to grand slam in NT';
        interpretation.handEstimate.points.addBounds(13, 14);
        interpretation.slamInvitation = true;
        break;
      case 6:
        interpretation.description = 'Slam in NT';
        interpretation.handEstimate.points.addBounds(11, 12);
        break;
      case 7:
        interpretation.description = 'Grand slam in NT';
        interpretation.handEstimate.points.addBounds(15, null);
        break;
      default:
        throw new Error("Unexpected bid count");
    }
    interpretations.push(interpretation);
  }
}
