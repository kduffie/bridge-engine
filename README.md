# bridge-engine
A typescript library for running bridge games using robots or interactively

This package is designed to support anyone building applications for the game of bridge.  

## Getting Started

```typescript
import { BridgeTable } from "bridge-engine";

async run() {
  const table = new BridgeTable();
  table.assignTeam('NS', [
    new BridgePlayer(new BbsBidder(), new BasicCardPlayer()), 
    new BridgePlayer(new BbsBidder(), new BasicCardPlayer())
  ]);
  const board = await table.startBoard();
  await table.playBoard();
  console.log(board.toString());
}
run().then(() => { });
```

In this example, we create a bridge table, assign the North-South team using players built using robot 
implementations for bidding and playing.  Then a new board is started and played.  Finally we dump information about it to the console.

Here is an example of the output:

```
Board 1 VUL:both Dealer:S
  Hands: North: S: K72      H: T93      D: AKQ64    C: J2       (13 14)  
         South: S: QJ6      H: AJ7      D: 732      C: AT65     (12 12)  
         East:  S: A8       H: 864      D: J98      C: 98743     (5  6)  
         West:  S: T9543    H: KQ52     D: T5       C: KQ       (10 12)  
  Contract: 4H by S VUL
  Auction:
       N     E     S     W
                       pass 
      1H   pass   4H   pass 
     pass  pass 
  Tricks:
     W: 5S  N: 2S  E: AS  S: 7H   won by S
     S: 2D  W: 5D  N: AD  E: 9D   won by N
     N: 4D  E: JD  S: 3D  W: TD   won by E
     E: 8C  S: 5C  W: QC  N: 3H   won by N
     N: 9H  E: 6H  S: JH  W: 5H   won by S
     S: AH  W: QH  N: TH  E: 4H   won by S
     S: 7D  W: 4S  N: KD  E: 8D   won by N
     N: 7S  E: 8S  S: QS  W: 9S   won by S
     S: 6C  W: KC  N: 2C  E: 3C   won by W
     W: KH  N: 6D  E: 8H  S: 6S   won by W
     W: 3S  N: KS  E: 9C  S: JS   won by N
     N: QD  E: 7C  S: TC  W: TS   won by N
     N: JC  E: 4C  S: AC  W: 2H   won by W
  Tricks:  Declarer:9  Defense:4
  Score: -100
```

## Development

This package is built on top of Node.js and written entirely in Typescript.  After cloning
the package, you can adapt it to suit your needs.  If you use Node and VSCode, after opening the
package, you should be able to run and debug it without additional work.

## Options

When creating a BridgeTable, you can provide optional options:

```typescript
const options: BridgeTableOptions = {
  assignContract: true,
  randomSeed: 'abc'
};

const table = new BridgeTable(options, myContractAssigner, myRandomGenerator);
```

**assignContract**: Set to TRUE, and the table will skip bidding and determine
the contract based on analyzing pairs of hands and following guidelines based
on combined points, distributions, and suit fits.  You are able to override the
contract assigner by providing an optional alternative when constructing the 
table.

**randomSeed**: This is used by the random number generator.  If not provided,
then each new table will start with different random generation.  Set it to any
string to get a consistent randomization of deal.  Robots also have access to 
this random generator and can decide whether to use it.  You can override the
random number generator by passing in a different implementation in the table
constructor.

## Table Behavior

The table follows all the normal rules of bridge.  It seats default, passive,
robots in all seats.  Then others can be assigned in pairs or individually. 
If assigned individually, the table will ensure that the new player is willing
to adopt the conventions based on the convention card provided by the seated player.

The table randomizes everything when starting a new board:  which player will be dealer,
which team(s) will be vulnerable, and the deal of the cards.  Note that this was
optimized for the analysis of robot behavior over many thousands of hands, so that
we want to avoid any effects of sequential assignment of dealers and/or vulnerability.

The table maintains statistics over a sequence of boards.  You can access these at any time by the
**tableStats** property on the table.

## Players

This engine was designed to support robots, human players, or a combination.

The default players are robotic placeholders.  They follow all of the rules of bidding
and play.  However, when bidding, the default robot will always pass.  And when playing,
an eligible card is selected at random.

The **BridgePlayer** is designed so that different bidding and/or playing implementations
can be provided.  Alternatively, a completely different implementation of **IBridgePlayer**
can be seated.

To support human players, you will need to create a new implementation of **IBridgePlayer**
that prompts the appropriate person for bids and plays.  Note that all of the relevant methods
return Promises, allowing for any scenario.  For example, a simple implementation could
prompt users using STDIO.  Or you could build a web interface or app on top of this.

## Contract Assignment

If you are interested in focusing on the play, and do not want to implement anything with
bidding, you can set the **assignContract** option to true.  In that case, the table will
not ask the players to bid.  Instead, after dealing, it will analyze the hands and come up
with an appropriate contract (or pass out).  Then it will proceed with playing the hand by
asking the robots to play.

The default contract assigner does a reasonable job of choosing an appropriate contract.
However, if you want to study the behavior of players under specific scenarios, you can 
implement your own contract assigner and choose any contract in any scenario.

## Robots

We include some robots that are available that go further than the trivial default implementations.

For playing a hand, the **BasicCardPlayer** follows simple rules, but is consistent with how
many beginning players operate.  When leading, it selects a suit at random, and then plays
the lowest card in that suit.  It plays low in second seat.  In third seat, it plays high
if necessary and sufficient to win the trick.  It will trump (low) if that option is appropriate.
Otherwise, it will play low.  In the fourth seat, it will cover to win the trick (including trump)
if necessary and sufficient.  Otherwise, it will play low.

For bidding a hand, we do not include a full implementation of Standard American bidding.  However,
we include a simple robotic bidder that follows a non-standard system that we call the Beginner
Bidding System (BBS) (see below).  

To use either or both of these implementations in your robotic players, pass them in when 
constructing the player:

```typescript
const player = new BridgePlayer(new BbsBidder(), new BasicCardPlayer());
```

## Bidding Analyzer

For building various tools, including robots, it can be very useful to have something that analyzes
a bidding sequence.  This library includes a full framework for bidding analysis, including 
pluggable bid interpreters so support for different conventions and bidding systems can be
constructed easily.

To use the bidding analyzer:

```typescript
const analyzer = new BiddingAnalyzer('none', 'N', STANDARD_CONVENTION_FACTORIES);
await analyzer.onBid(new BidWithSeatch('N', 'normal', 1, 'C'));
...
console.log(analyzer.toString());
```

You construct a new BiddingAnalyzer for each hand to be analyzed, passing in the vulnerability (none, both, or a specific partnership), the dealer seat (North in this example), and a list of bidding interpreter 
factories.  After that, you provide it with a sequence of bids using its **onBid** method.  The analyzer
instance has several methods and properties that can be reviewed at any point in the process.  For convenience, the **toString** method will provide a readable version of all of the summary information.  For example:

```text
Bidding Analyzer:     Dealer: North     Vulnerability: none
Bids:
     1C by N                 pts:13-21   C:2+   D:0-3  H:0-4  S:0-4  Simple opening bid (std-simple-suit-opens)
   pass by E                 pts:0-12    C:?    D:?    H:?    S:?    No suitable overcall (std-initial-pass)
     1H by S forcing:yes     pts:6+      C:?    D:?    H:4+*  S:?    4+ hearts, hearts longer than spades (std-simple-suit-open-responses)
   pass by W                 pts:0-12    C:?    D:?    H:?    S:?    No suitable bid (std-defense-logical)
     1S by N forcing:yes     pts:13-21   C:2+   D:0-3  H:0-4  S:4*   New suit at 1-level: 4 cards (std-offense-logical)
   pass by E                 pts:0-12    C:?    D:?    H:?    S:?    No suitable bid (std-defense-logical)
     2S by S                 pts:6-8     C:?    D:?    H:4+*  S:4+*  Rebid partner's suit, forcing: fit, minimum (std-offense-logical)
   pass by W                 pts:0-12    C:?    D:?    H:?    S:?    No suitable bid (std-defense-logical)
     4S by N                 pts:18-21   C:2+   D:0-3  H:0-4  S:4*   Game (std-offense-logical)
   pass by E                 pts:0-12    C:?    D:?    H:?    S:?    No suitable bid (std-defense-logical)
   pass by S                 pts:6-8     C:?    D:?    H:4+*  S:4+*  Accept game contract (std-offense-logical)
   pass by W                 pts:0-12    C:?    D:?    H:?    S:?    No suitable bid (std-defense-logical)
Partnership: NS    fits: S                       offense-passed
  North      pts:18-21   C:2+   D:0-3  H:0-4  S:4*  
  South      pts:6-8     C:?    D:?    H:4+*  S:4+* 
Partnership: EW    fits: none                    defense-logical
  East       pts:0-12    C:?    D:?    H:?    S:?   
  West       pts:0-12    C:?    D:?    H:?    S:? 
```

Each bid is listed in order along with an analysis of what that bidder probably intended based on the interpreters available.  Following the bids is an analysis of the state
of each partnership, and each member of that partnership.  (All of this information is, of course, accessible via code.)

The BiddingAnalyzer is a simple framework and most of the intelligence is contained in the bidding interpreter classes.  When you construct the BiddingAnalyzer, you pass in
an array of interpreter factories.  This allows for extensibility.  You can mix and match interpreters that you want to use.  The analyzer will call all interpreters for
every bid, giving each a chance to provide zero, one, or multiple interpretations of that bid.  The analyzer combines these interpretations and then moves on.  If more than
one interpreter provides an interpretation for the same bid, there is no problem as long as subsequent interpretations are not confused by this ambiguity.  The analyzer will
keep these multiple interpretations.  But for the sake of summarization, it will combine interpretations of the same bid by broadening distribution and point ranges as broadly
as is needed.  Likewise, if there are no interpretations of a bid, that is also okay.  The analyzer will simply report that no interpretations are available and the estimate
of that hand will remain unchanged.

To help keep interpreters simple, the bidding analyzer maintains a bidding "state" for each partnership.  After each bid, the state of that partnership is updated based on
the interpretation of that bid.  If there are multiple interpretations, then the partnership may temporarily have two different states until the ambiguity is resolved.
These states are intended to facilitate interpreters into different aspects of bidding.  Typically one interpreter will handle all of the bids related to one state (or a few).  
For example, one of the states is "simple-suit-opens" and another is "stayman".  So you can "plug in" support for a new convention by adding an interpreter that understands
that convention.  An interpreter should, for that reason, only interpret bids that it "understands" and return no interpretations for bids that it does not.

Our intention is that the list of defined is exhaustive for all bidding conventions.  However, anticipating that something will inevitably be missed, there is a special
bidding state called "special".  If a new interpreter handles a convention that involves a sequence of artificial bids and is not one of the named states, it can detect
the beginning of that sequence and update the state to "special".  When the sequence has completed, it will typically reset the state to the appropriate state, such as 
"offense-logical".

For example, a simplified interpreter that handles 2-club opens might look like this:

```typescript
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
    } else if (context.partnership.hasState('opening-2c') && context.bid.count === 2 && context.bid.strain === 'D') {
        const interpretation1 = new BidInterpretation(this.id, `2D: waiting, 0-7 points`, context.hand.estimate);
        interpretation1.updateState('offense-logical');
        interpretation1.handEstimate.points.addBounds(null, 7);
        result.push(interpretation1);

        const interpretation2 = new BidInterpretation(this.id, `2D: waiting, no 5+ card suit`, context.hand.estimate);
        interpretation.updateState('offense-logical');
        interpretation.handEstimate.points.addBounds(8, null);
        interpretation.handEstimate.addSuitBounds('C', null, 4);
        interpretation.handEstimate.addSuitBounds('D', null, 4);
        interpretation.handEstimate.addSuitBounds('H', null, 4);
        interpretation.handEstimate.addSuitBounds('S', null, 4);
        result.push(interpretation);
    } ...
  }
}
```

In this example, we check to see if the partnership is in the "no-bids" state, meaning an opening bid (or overcall) 
has not been made by this partnership, and we check that there has not been an opening bid by anyone.

Then we check to see if the current bid is 2C.  If so, we return an interpretation indicating the point count, and
that this is forcing for 4 bids ("2 round forcing").  The state is updated to "opening-2c", so that this interpreter
can spot the next response that is coming.

The "else" clause will then come into play on the partner's next bid, where the state will be "opening-2c" and the
bid is 2D.  (To complete this interpreter, it should also handle cases involving interference and other bids by partner.)
In this case, two different interpretations of this 2D bid are provided.  In one interpretation, the partner has too 
few points to provide any bid other than 2D.  In the other interpretation, the bidder has sufficient strength (8+ points)
but has no 5-card suit.  

Bridge players will recognize that some partnerships play 2C opens differently -- perhaps always using waiting bids.
That is why each convention card may combine different bid interpreters.  The interpreter factories might include
a different class to handle 2C opens, or perhaps the interpreter could be parameterized to tell it how the partnership
chooses to handle 2C responses.

