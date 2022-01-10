import { BidWithSeat } from "../bid";
import { BiddingAnalyzer } from "./bidding-analyzer";
import * as console from 'console';
import { ALL_INTERPRETER_FACTORIES } from "./interpreters/interpreter-factories";

async function sample1() {
  const analyzer = new BiddingAnalyzer('none', 'N', ALL_INTERPRETER_FACTORIES);
  await analyzer.onBid(new BidWithSeat('N', 'normal', 1, 'C'));
  await analyzer.onBid(new BidWithSeat('E', 'pass'));
  await analyzer.onBid(new BidWithSeat('S', 'normal', 1, 'S'));
  await analyzer.onBid(new BidWithSeat('W', 'pass'));
  await analyzer.onBid(new BidWithSeat('N', 'normal', 2, 'S'));
  await analyzer.onBid(new BidWithSeat('E', 'pass'));
  await analyzer.onBid(new BidWithSeat('S', 'normal', 4, 'S'));
  await analyzer.onBid(new BidWithSeat('W', 'pass'));
  await analyzer.onBid(new BidWithSeat('N', 'pass'));
  await analyzer.onBid(new BidWithSeat('E', 'pass'));
  console.log(analyzer.toString());
}

sample1().then(() => { });
