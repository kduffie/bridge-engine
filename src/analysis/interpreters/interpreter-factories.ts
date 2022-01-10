import { BiddingInterpreterFactory } from "../bidding-analyzer";
import { InitialPassBidInterpreter } from "./initial-pass";
import { NTOpenResponseBidInterpreter } from "./nt-open-responses";
import { NTOpenBidInterpreter } from "./nt-opens";
import { OffenseLogicalBidInterpreter } from "./offense-logical";
import { OffensePassesBidInterpreter } from "./offense-passes";
import { PreemptOpenResponseBidInterpreter } from "./preempt-open-responses";
import { PreemptOpenBidInterpreter } from "./preempt-opens";
import { SimpleSuitOpenResponseBidInterpreter } from "./simple-suit-open-responses";
import { SimpleSuitOpenBidInterpreter } from "./simple-suit-opens";
import { TwoClubOpenBidInterpreter } from "./two-club-opens";

export const NATURAL_OFFENSE_FACTORIES: BiddingInterpreterFactory[] = [
  () => new InitialPassBidInterpreter(),
  () => new SimpleSuitOpenBidInterpreter(),
  () => new NTOpenBidInterpreter(),
  () => new TwoClubOpenBidInterpreter(),
  () => new PreemptOpenBidInterpreter(),
  () => new SimpleSuitOpenResponseBidInterpreter(),
  () => new NTOpenResponseBidInterpreter(),
  () => new PreemptOpenResponseBidInterpreter(),
  () => new OffenseLogicalBidInterpreter(),
  () => new OffensePassesBidInterpreter(),
];

export const NATURAL_DEFENSE_FACTORIES: BiddingInterpreterFactory[] = [
  // TODO
];

export const OFFENSE_OVER_INTEFERENCE_FACTORIES: BiddingInterpreterFactory[] = [
  // TODO
];

export const STANDARD_CONVENTION_FACTORIES: BiddingInterpreterFactory[] = [
  // TODO
];

export const SPECIAL_BID_FACTORIES: BiddingInterpreterFactory[] = [
  // TODO, such as double-jump shift to show partner's suit plus invitation to game in either that or another suit
];

export const STANDARD_INTERPRETER_FACTORIES = [...NATURAL_OFFENSE_FACTORIES, ...NATURAL_DEFENSE_FACTORIES, ...OFFENSE_OVER_INTEFERENCE_FACTORIES, ...STANDARD_CONVENTION_FACTORIES];

export const ALL_INTERPRETER_FACTORIES = [...STANDARD_INTERPRETER_FACTORIES, ...SPECIAL_BID_FACTORIES];
