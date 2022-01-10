import { BidInterpretation } from "./bid-interpretation";
import { BiddingAnalyzer } from "./bidding-analyzer";

export interface BiddingInterpreter {
  id: string;
  name: string;
  interpret(context: BiddingAnalyzer): Promise<BidInterpretation[]>;
}

export abstract class BiddingInterpreterBase {
  private _id: string;
  private _name: string;
  constructor(id: string, name: string) {
    this._id = id;
    this._name = name;
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  abstract interpret(context: BiddingAnalyzer): Promise<BidInterpretation[]>;
}
