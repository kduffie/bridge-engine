import { Bid, BidWithSeat } from "./bid";
import { Card } from "./card";
import { Contract } from "./contract";
import { Trick } from "./trick";
import * as shuffle from 'shuffle-array';
import { assert } from "console";
import { Auction } from "./auction";
import { Hand } from "./hand";
import { RandomGenerator } from "./random-generator";


export type Seat = 'N' | 'E' | 'S' | 'W';
export const SEATS: Seat[] = ['N', 'E', 'S', 'W'];

export type Partnership = 'NS' | 'EW';
export const PARTNERSHIPS: Partnership[] = ['NS', 'EW'];
export type Vulnerability = Partnership | 'none' | 'both';
export const VULNERABILITIES: Vulnerability[] = ['NS', 'EW', 'none', 'both'];

export type CardRank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K' | 'A';
export const CARD_RANKS: CardRank[] = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
export type Suit = 'C' | 'D' | 'H' | 'S';
export const SUITS: Suit[] = ['C', 'D', 'H', 'S'];
export const SUITS_REVERSE: Suit[] = ['S', 'H', 'D', 'C'];
export type Strain = Suit | 'N';
export const STRAINS: Strain[] = ['C', 'D', 'H', 'S', 'N'];

export const CARDS_PER_HAND = 13;
export const MAX_CONTRACT_SIZE = 7;
export const TRICKS_PER_BOARD = 13;

export type BidType = 'pass' | 'normal' | 'double' | 'redouble';
export type Doubling = 'none' | 'doubled' | 'redoubled';
export type SlamType = 'none' | 'small' | 'grand';

export function getPartnerBySeat(seat: Seat): Seat {
  switch (seat) {
    case 'N':
      return 'S';
    case 'E':
      return 'W';
    case 'S':
      return 'N';
    case 'W':
      return 'E';
    default:
      throw new Error(`Unexpected seat ${seat}`);
  }
}

export function getSeatFollowing(seat: Seat): Seat {
  switch (seat) {
    case 'N':
      return 'E';
    case 'E':
      return 'S';
    case 'S':
      return 'W';
    case 'W':
      return 'N';
    default:
      throw new Error(`Unexpected seat ${seat}`);
  }
}

export function getSeatPreceding(seat: Seat): Seat {
  switch (seat) {
    case 'N':
      return 'W';
    case 'E':
      return 'N';
    case 'S':
      return 'E';
    case 'W':
      return 'S';
    default:
      throw new Error(`Unexpected seat ${seat}`);
  }
}

export function isMajor(strain: Strain): boolean {
  switch (strain) {
    case 'H':
    case 'S':
      return true;
    default:
      return false;
  }
}

export function isMinor(strain: Strain): boolean {
  switch (strain) {
    case 'C':
    case 'D':
      return true;
    default:
      return false;
  }
}

export function getPartnershipBySeat(seat: Seat): Partnership {
  switch (seat) {
    case 'N':
    case 'S':
      return 'NS';
    case 'E':
    case 'W':
      return 'EW';
    default:
      throw new Error(`Unexpected seat ${seat}`);
  }
}

export function getOpposingPartnership(partnership: Partnership): Partnership {
  switch (partnership) {
    case 'NS':
      return 'EW';
    case 'EW':
      return 'NS';
    default:
      throw new Error("Unexpected partnership");
  }
}

export function getSeatName(seat: Seat): string {
  switch (seat) {
    case 'N':
      return 'North';
    case 'E':
      return 'East';
    case 'S':
      return 'South';
    case 'W':
      return 'West';
    default:
      throw new Error("Unexpected seat");
  }
}

export function getSeatsByPartnership(partnership: Partnership): Seat[] {
  switch (partnership) {
    case 'NS':
      return ['N', 'S'];
    case 'EW':
      return ['E', 'W'];
    default:
      throw new Error("Unexpected partnership");
  }
}

export function getCardsInSuit(cards: Card[], suit: Suit): Card[] {
  const result: Card[] = [];
  for (const c of cards) {
    if (c.suit === suit) {
      result.push(c);
    }
  }
  result.sort((a, b) => CARD_RANKS.indexOf(b.rank) - CARD_RANKS.indexOf(a.rank));
  return result;
}

export interface BoardContext {
  boardId: string;
  vulnerability: Vulnerability;
  dealer: Seat;
  hands: Map<Seat, Hand>;
  status: BoardStatus;
  randomGenerator: RandomGenerator;
  toString(): string;
}

export type BoardStatus = 'created' | 'bidding' | 'play' | 'complete';

export interface FinalBoardContext extends BoardContext {
  bids: BidWithSeat[];
  contract: Contract | null;
  passedOut: boolean;
  tricks: Trick[];
  defenseTricks: number;
  declarerTricks: number;
  declarerScore: number;
}

export interface BidContext {
  board: BoardContext;
  auction: Auction;
  vulnerability: Vulnerability;
  isSeatFirstBidBefore(seat1: Seat, seat2: Seat): boolean;
}

export interface PlayContext {
  board: BoardContext;
  playContract: Contract;
  defenseTricks: number;
  declarerTricks: number;
  completedTricks: Trick[];
  playCurrentTrick: Trick;
  randomGenerator: RandomGenerator;
}

export function randomlySelect<T>(candidates: T[] | Set<T>, randomGenerator: RandomGenerator): T {
  if (!Array.isArray(candidates)) {
    candidates = Array.from(candidates);
  }
  assert(candidates.length > 0);
  const result = shuffle.pick(candidates, { rng: () => randomGenerator.random });
  return Array.isArray(result) ? result[0] : result;
}

export function union<T>(set1: Set<T>, set2: Set<T>): Set<T> {
  const result = new Set<T>();
  for (const value of set1) {
    result.add(value);
  }
  for (const value of set2) {
    result.add(value);
  }
  return result;
}

export class Range {
  min: number;
  max: number;

  constructor(min: number, max: number) {
    this.min = min;
    this.max = max;
  }
}

export function sortCards(cards: Card[]): void {
  cards.sort((a, b) => {
    if (a.suit === b.suit) {
      return CARD_RANKS.indexOf(b.rank) - CARD_RANKS.indexOf(a.rank);
    }
    return SUITS.indexOf(b.suit) - SUITS.indexOf(a.suit);
  });
}

export function cardsInclude(cards: Card[], card: Card): Card | null {
  for (const c of cards) {
    if (c.isEqual(card)) {
      return c;
    }
  }
  return null;
}

export function isHigherRank(rank1: CardRank, rank2: CardRank): boolean {
  return CARD_RANKS.indexOf(rank1) > CARD_RANKS.indexOf(rank2);
}

export function isHigherStrain(strain1: Strain, strain2: Strain): boolean {
  return STRAINS.indexOf(strain1) > STRAINS.indexOf(strain2);
}

export function getStrainName(strain: Strain): string {
  switch (strain) {
    case 'N':
      return 'NT';
    case 'S':
      return 'spades';
    case 'H':
      return 'hearts';
    case 'D':
      return 'diamonds';
    case 'C':
      return 'clubs';
    default:
      throw new Error("Unexpected strain");
  }
}

export function getStrainsOtherThan(...except: Strain[]): Strain[] {
  const result: Strain[] = [];
  for (const strain of STRAINS) {
    if (!except || except.indexOf(strain) < 0) {
      result.push(strain);
    }
  }
  return result;
}

export function getVulnerabilityForPartnership(vulnerability: Vulnerability, partnership: Partnership): RelativeVulnerability {
  switch (vulnerability) {
    case 'EW':
      return partnership === 'EW' ? 'unfavorable' : 'favorable';
    case 'NS':
      return partnership === 'NS' ? 'unfavorable' : 'favorable';
    case 'both':
      return 'neutral-vulnerable';
    case 'none':
      return 'neutral-non-vulnerable';
    default:
      throw new Error("Unexpected vulnerability");
  }
}

export type RelativeVulnerability = 'neutral-vulnerable' | 'neutral-non-vulnerable' | 'favorable' | 'unfavorable';

