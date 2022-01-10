import { HandEstimate } from "../hand-estimate";
import { sprintf } from "sprintf-js";
import { PartnershipState } from "./bidding-analyzer";

export type ForceType = 'no' | 'yes' | '2-bids' | '3-bids' | '4-bids' | 'game';

export class BidInterpretation {
  private _interpreter: string;
  private _description: string;
  private _hand = new HandEstimate();
  private _states: PartnershipState[] = [];
  private _slamInvitation = false;
  private _forcing: ForceType | null = null;

  constructor(interpreter: string, description: string, priorEstimate: HandEstimate | null) {
    this._interpreter = interpreter;
    this._description = description;
    if (priorEstimate) {
      this._hand.incorporateEstimate(priorEstimate);
    }
  }

  updateState(newState: PartnershipState): void {
    if (this._states.indexOf(newState) < 0) {
      this._states.push(newState);
    }
  }

  get handEstimate(): HandEstimate {
    return this._hand;
  }

  set handEstimate(value: HandEstimate) {
    this._hand = value;
  }

  get description(): string {
    return this._description;
  }

  set description(value: string) {
    this._description = value;
  }

  get states(): PartnershipState[] {
    return this._states;
  }

  set states(value: PartnershipState[]) {
    this._states = value;
  }

  get force(): ForceType | null {
    return this._forcing;
  }

  set force(value: ForceType | null) {
    this._forcing = value;
  }

  get slamInvitation(): boolean {
    return this._slamInvitation;
  }

  set slamInvitation(value: boolean) {
    this._slamInvitation = value;
  }

  addStates(values: PartnershipState[]): void {
    for (const value of values) {
      if (this._states.indexOf(value) < 0) {
        this._states.push(value);
      }
    }
  }

  toString(): string {
    return sprintf('%-30s  forcing:%-6s %-25s %s', this._interpreter, this._forcing || 'no', this._hand.toString(), this._description);
  }
}
