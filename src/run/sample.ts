import { PassiveBidder } from "../passive-bidder";
import { RandomPlayer } from "../random-player";
import { BridgeTable } from "../bridge-table";
import { BasicCardPlayer } from "../robots/basic-player";
import { BbsBidder } from "../robots/bbs-bidder";
import { BridgePlayer } from "../bridge-player";
import * as console from 'console';

// This sample shows how to create a bridge table, assign players, run 24 boards, then display stats

async function run() {
  const table = new BridgeTable({ assignContract: false, randomSeed: '13' });
  table.assignTeam('NS', [
    new BridgePlayer(new BbsBidder(), new BasicCardPlayer()),
    new BridgePlayer(new BbsBidder(), new BasicCardPlayer())
  ]);
  for (let i = 0; i < 24; i++) {
    const board = await table.startBoard();
    await table.playBoard();
    console.log(board.toString());
  }
  console.log('\n\nSummary\n');
  console.log(table.tableStats.toString());
}

run().then(() => { });
