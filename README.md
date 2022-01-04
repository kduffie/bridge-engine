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

## Beginner Bidding System


This simplified system was designed for humans that are just 
starting to play bridge.  Bid selection is essentially mechanical, and therefore also allows for
a very simple robotic implementation which is provided.  After analyzing many hands, this system
does a surprisingly good job of arriving at a reasonable contract, especially since this implementation
contains fewer than 200 lines of Typescript.

The bidding system works like this:

### Opening Bids:  
 - with flat distribution, based on HCP, bid 1NT, 2NT, or 3NT
 - with a 5+ card suit, based on total points, bid 1, 2, or 3 of your suit
 - otherwise, with 13+ total points, bid longest minor suit
### Initial Responses:
- in response to NT, with sufficient combined HCP, bid 3NT, or with a 6+ card suit, bid 3 of that suit, otherwise pass
- in response to a major with a fit, and sufficient combined total points, bid game
- in response to a major without a fit, and sufficient combined HCP, bid 3NT
- in response to a minor holding a 5+ card major and sufficient combined total points, bid 3 of the major
- in response to a minor without a 5+ card major but sufficient combined HCP, bid 3NT
- otherwise pass
### Subsequent Response:
- after NT followed by 3 of a major, if you have 2+ cards in that suit, bid game in that suit
- after NT followed by 3 of a minor, if you have 3+ cards in that suit, bid 3NT
- after minor suit open followed by 3 of a major, if you have 3+ cards in that major, bid game in that suit, otherwise 3NT
### Overcalls:
- For all bids (including opening), if there is interference, proceed with bid from above unless it is insufficient, in which case you will pass


