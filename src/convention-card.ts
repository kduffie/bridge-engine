import { ValueRange } from "./value-range";
export class SimpleConventionCard implements ConventionCard {
  private _approach: OverallApproach;
  constructor(approach: OverallApproach) {
    this._approach = approach;
  }
  get approach(): OverallApproach {
    return this._approach;
  }
}

// see https://web2.acbl.org/documentLibrary/play/ConventionCard.pdf

export interface ConventionCard {
  approach: OverallApproach;
  description?: string;

  general?: {
    twoOverOne?: TwoOverOneConventions[];
    veryLight?: VeryLightConventions[];
    forcingOpening?: ForcingOpeningConvention;
  };
  noTrumpOpeningBids?: {
    oneNT?: ValueRange;
    fiveCardMajorCommon?: boolean;
    systemOnOver?: string;
    twoClub?: NoTrumpTwoClubResponses;
    twoDiamonds?: NoTrumpTwoDiamondResponses;
    twoHearts?: NoTrumpTwoHeartResponses;
    twoSpades?: NoTrumpTwoSpadeResponses;
    twoNT?: NoTrumpTwoNTResponses;
    threeClubs?: string;
    threeDiamonds?: string;
    threeHearts?: string;
    threeSpades?: string;
    fourDiamondsHearts?: NoTrumpFourDiamondHeartResponses;
    smolen?: boolean;
    lebensohl?: LebensohlConvention;
    negativeDouble?: NoTrumpNegativeDoubleConvention;
    other?: string;
    twoNTOpenings?: TwoNoTrumpConvention;
    threeNTOpenings?: ThreeNoTrumpConvention;
    conventionalNTOpenings?: string;
  };
  majorOpening?: {
    expectedMinLengthFirstSecond?: OpeningMajorMinLengthOption[];
    expectedMinLengthThirdFourth?: OpeningMajorMinLengthOption[];
    responses?: {
      doubleRaise?: ResponseRaiseOvercallOption[];
      afterOvercall?: ResponseRaiseOvercallOption[];
      convRaise?: MajorResponseConvRaiseOptions;
      oneNT?: MajorResponseOneNTResponses;
      twoNT?: MajorResponseTwoNTResponses;
      threeNT?: MajorResponseThreeNTResponses;
      drury?: DruryConvention;
    };
  };
  minorOpening?: {
    expectedMinLengthOneClub?: OpeningMinorMinLengthOption[];
    expectedMinLengthOneDiamond?: OpeningMinorMinLengthOption[];
    responses?: {
      doubleRaise?: ResponseRaiseOvercallOption[];
      afterOvercall?: ResponseRaiseOvercallOption[];
      forcingRaise?: MinorOpenForcingRaiseConvention;
      frequentlyBypass4PlusDiamonds?: boolean;
      oneNT_oneClub?: ValueRange;
      twoNT: MinorOpenTwoNTResponses;
      threeNT: ValueRange;
      other?: string;
    };
  };
  twoLevelBids?: {
    twoClubs?: TwoClubOpenings;
    twoDiamonds?: TwoLevelSuitOpenings;
    twoHearts?: TwoLevelSuitOpenings;
    twoSpades?: TwoLevelSuitOpenings;
  };
  otherConvCalls?: {
    options: OtherConvCallOption[];
    description?: string;
  };
  specialDoubles?: {
    afterOvercall?: SpecialDoublesAfterOvercall;
    negative?: SpecialDoublesNegative;
    responsive?: SpecialDoublesResponsive;
    support?: SpecialDoublesSupport;
    cardShowing?: SpecialDoublesCardShowing;
    description?: string;
  };
  simpleOvercall?: {
    oneLevel: ValueRange;
    options?: SimpleOvercallOption[];
    responses?: {
      newSuit?: SimpleOvercallNewSuitResponseOption[];
      jumpRaise?: SimpleOvercallJumpRaiseResponseOption[];
    };
  };
  jumpOvercall?: {
    options: JumpOvercallOption[];
    description?: string;
  };
  openingPreempts?: {
    threeFourBids?: OpeningPreemptOption[];
    conv_Resp?: string;
  };
  directCuebid?: {
    overNatural?: DirectCuebidOption[];
  };
  noTrumpOvercalls?: {
    direct?: NoTrumpOvercallDirectConvention;
    balancing?: NoTrumpOvercallBalancing;
  };
  defenseVsNoTrump?: {
    twoClubs?: string;
    twoDiamonds?: string;
    twoHearts?: string;
    twoSpades?: string;
    double?: string;
    other?: string;
  };
  overOpponentsTakeoutDouble?: {
    newSuitForcing?: OverOpponentTakeoutDoubleNSFOption[];
    jumpShift?: OverOpponentTakeoutDoubleJSOption[];
    rdblImpliesNoFit?: boolean;
    twoNTOverMajors?: OverOpponentTwoNTOption[];
    twoNTOverMinors?: OverOpponentTwoNTOption[];
    other?: string;
  };
  vsOpeningPreemptsDouble?: {
    options: VsOpeningPreemptsDoubleOption[];
    takeoutThru?: string;
    convTakeout?: string;
    lebensohl2NTResponse?: boolean;
    other?: string;
  };
  slamConventions?: {
    options: SlamConventionOption[];
    description?: string;
    vsInterference: SlamVsInterferenceOption[];
    depoLevel?: string;
  };
  leads?: {
    vsSuits?: {
      Xx?: number;
      xxX?: number;
      akx?: number;
      Kqx?: number;
      Qjx?: number;
      Jt9?: number;
      Kqt9?: number;
      xxxX?: number;
      xxxXx?: number;
      T9x?: number;
      kJtx?: number;
      kT9x?: number;
      qT9x?: number;
    };
    vsNt?: {
      Xx?: number;
      Xxx?: number;
      aKjx?: number;
      aJt9?: number;
      Kqjx?: number;
      Qjtx?: number;
      Jt9x?: number;
      Xxxx?: number;
      xxxXx?: number;
      aQjx?: number;
      aT9x?: number;
      kQt9?: number;
      qT9x?: number;
      T9xx?: number;
    };
    lengthLeads?: {
      fourthBest?: LengthLeadOption[];
      thirdFifthBest?: LengthLeadOption[];
      attitudeVsNt?: boolean;
    };
    primarySignalToPartnersLeads?: LeadPrimarySignalOption[];
  };
  defensiveCarding?: {
    standard?: DefensiveCardOption[];
    standardExcept?: string;
    upsideDownCount?: DefensiveCardOption[];
    upsideDownAttitude?: DefensiveCardOption[];
    firstDiscard?: {
      lavinthal?: DefensiveCardOption[];
      oddEven?: DefensiveCardOption[];
      other?: DefensiveCardOption[];
    };
    otherCarding?: {
      smithEcho?: DefensiveCardOption[];
      trumpSuitPrefVsSuits?: boolean;
      fosterEcho?: DefensiveCardOption[];
    };
  };
  specialCarding?: boolean;
}

export type OverallApproach = 'none' | 'bbs' | 'standard-american' | 'precision' | 'other';

export type TwoOverOneConventions = 'game-forcing' | 'game-forcing-except-when-suit-rebid';
export type VeryLightConventions = 'openings' | 'third-hand' | 'overcalls' | 'preempts';

export interface ForcingOpeningConvention {
  cases: ForcingOpeningConventionCases[];
  otherDescription?: string;
}
export type ForcingOpeningConventionCases = '1c' | '2c' | 'natural-2bids' | 'other'

export interface NoTrumpTwoClubResponses {
  options?: NoTrumpTwoClubResponseOptions[];
  description?: string;
}

export type NoTrumpTwoClubResponseOptions = 'stayman' | 'puppet';

export interface NoTrumpTwoDiamondResponses {
  options?: NoTrumpTwoDiamondResponseOptions[];
  description?: string;
}

export type NoTrumpTwoDiamondResponseOptions = 'transfer-to-hearts' | 'forcing-stayman';

export interface NoTrumpTwoHeartResponses {
  options?: NoTrumpTwoHeartOptions[];
  description?: string;
}

export type NoTrumpTwoHeartOptions = 'transfer-to-spades';

export interface NoTrumpTwoSpadeResponses {
  options?: NoTrumpTwoSpadeOptions[];
  description?: string;
}

export type NoTrumpTwoSpadeOptions = 'transfer-to-clubs';

export interface NoTrumpTwoNTResponses {
  description?: string;
}

export interface NoTrumpFourDiamondHeartResponses {
  options?: NoTrumpFourDiamondHeartOption[];
  description?: string;
}

export type NoTrumpFourDiamondHeartOption = 'transfer';

export interface LebensohlConvention {
  enabled: boolean;
  denies?: string;
}

export interface NoTrumpNegativeDoubleConvention {
  enabled: boolean;
  description?: string;
}

export interface TwoNoTrumpConvention {
  points: ValueRange;
  puppetStayman?: boolean;
  transferResponses: TwoNoTrumpTransferResponses;
}

export interface TwoNoTrumpTransferResponses {
  options: TwoNoTrumpTransferOption[];
  threeSpades?: string;
}

export interface ThreeNoTrumpConvention {
  points: ValueRange;
  description?: string;
}
export type TwoNoTrumpTransferOption = 'jacoby' | 'texas';

export type OpeningMajorMinLengthOption = '4' | '5';

export type ResponseRaiseOvercallOption = 'force' | 'inv' | 'weak';

export interface MajorResponseConvRaiseOptions {
  options: MajorResponseConvRaiseOption[];
  other?: string;
}

export type MajorResponseConvRaiseOption = '2nt' | '3nt' | 'splinter' | 'other';

export interface MajorResponseOneNTResponses {
  options: MajorResponseOneNTResponseOption[];
}

export type MajorResponseOneNTResponseOption = 'forcing' | 'semi-forcing';

export interface MajorResponseTwoNTResponses {
  options: MajorResponseTwoNTResponseOption[];
  points?: ValueRange;
}

export type MajorResponseTwoNTResponseOption = 'forcing' | 'inv';

export interface MajorResponseThreeNTResponses {
  points: ValueRange;
}

export interface DruryConvention {
  enabled: boolean;
  options?: DruryOption[];
  other?: string;
}

export type DruryOption = 'reverse' | '2-way' | 'fit' | 'other';

export type OpeningMinorMinLengthOption = '4' | '3' | '0-2' | 'conv';

export interface MinorOpenForcingRaiseConvention {
  options: MinorOpenForcingRaiseOption[];
  other?: string;
}

export type MinorOpenForcingRaiseOption = 'js-in-other-minor' | 'single-raise' | 'other';

export interface MinorOpenTwoNTResponses {
  options?: MinorOpenTwoNTOption[];
  points?: ValueRange;
}

export type MinorOpenTwoNTOption = 'forcing' | 'inv';

export interface TwoClubOpenings {
  points: ValueRange;
  options: TwoClubOpenOption[];
  describe?: string;
  responses?: string;
  rebids?: string;
  twoDiamonds?: TwoClubTwoDiamondResponse;
}

export type TwoClubOpenOption = 'strong' | 'other';

export interface TwoClubTwoDiamondResponse {
  options: TwoClubTwoDiamondOption[];
  description?: string;
}

export type TwoClubTwoDiamondOption = 'neg' | 'waiting';

export interface TwoLevelSuitOpenings {
  points: ValueRange;
  describe?: string;
  responses?: string;
  rebids?: string;
  options?: TwoLevelSuitOpenOption[];
}

export type TwoLevelSuitOpenOption = 'weak' | 'intermediate' | 'strong' | 'conv' | '2nt-force' | 'new-suit-nf';

export interface OtherConvCalls {
  options: OtherConvCallOption[];
  description?: string;
}

export type OtherConvCallOption = 'new-minor-forcing' | '2-way-nmf' | 'weak-jump-shifts-in-comp' | 'weak-jump-shifts-not-in-comp' | '4th-suit-forcing-1rd' | '4th-suit-forcing-game';

export interface SpecialDoublesConvention {
  afterOvercall?: SpecialDoublesAfterOvercall;
  negative?: SpecialDoublesNegative;
  responsive?: SpecialDoublesResponsive;
  support?: SpecialDoublesSupport;
  cardShowing?: SpecialDoublesCardShowing;
  description?: string;
}

export interface SpecialDoublesAfterOvercall {
  options: SpecialDoublesAfterOvercallOption[];
  description?: string;
}

export type SpecialDoublesAfterOvercallOption = 'penalty' | 'other';

export interface SpecialDoublesNegative {
  enabled: boolean;
  thru?: string;
}

export interface SpecialDoublesResponsive {
  enabled: boolean;
  thru?: string;
  maximal?: boolean;
}

export interface SpecialDoublesSupport {
  options?: SpecialDoublesSupportOption[];
  thru?: string;
}

export type SpecialDoublesSupportOption = 'dbl' | 'redbl';

export interface SpecialDoublesCardShowing {
  enabled: boolean;
  minOffshapeTakeout?: boolean;
}


export interface NoTrumpOvercallDirectConvention {
  points: ValueRange;
  options: NoTrumpOvercallDirectOption[];
  description?: string;
}

export type NoTrumpOvercallDirectOption = 'systems-on' | 'conv';

export interface NoTrumpOvercallBalancing {
  points: ValueRange;
  jumpTo2NT: NoTrumpOvercallBalancingOption[];
  description?: string;
}

export type NoTrumpOvercallBalancingOption = 'minors' | '2-lowest' | 'conv';

export type SimpleOvercallOption = 'often-4-cards' | 'very-light-style';

export type SimpleOvercallNewSuitResponseOption = 'forcing' | 'nf-const' | 'nf';

export type SimpleOvercallJumpRaiseResponseOption = 'forcing' | 'inv' | 'weak';

export type JumpOvercallOption = 'strong' | 'intermediate' | 'weak';

export type OpeningPreemptOption = 'sound' | 'light' | 'very-light';

export type DirectCuebidOption = 'minor' | 'major';

export type OverOpponentTakeoutDoubleNSFOption = '1-level' | '2-level';

export type OverOpponentTakeoutDoubleJSOption = 'inv' | 'weak';

export type OverOpponentTwoNTOption = 'limit+' | 'limit' | 'weak';

export type VsOpeningPreemptsDoubleOption = 'takeout' | 'penalty';

export type SlamConventionOption = 'gerber' | 'blackwood' | 'rkc' | '1430';

export type SlamVsInterferenceOption = 'dopi' | 'depo' | 'ropi';

export type LengthLeadOption = 'suits' | 'nt';

export type LeadPrimarySignalOption = 'attitude' | 'count' | 'preference';

export type DefensiveCardOption = 'vs-suits' | 'vs-nt';
