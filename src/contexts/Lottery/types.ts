import { PublicKey } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";

export interface Lottery {
  key: PublicKey;
  owner: PublicKey;
  escrow: PublicKey;
  mint: PublicKey;
  treasury: PublicKey;
  period: anchor.BN;
  lastRound: anchor.BN;
  lastTimestamp: anchor.BN;
  unclaimedPot: anchor.BN;
}

export interface LotteryRound {
  index: anchor.BN;
  start: anchor.BN;
  spendings: anchor.BN[];
  pot: anchor.BN;
  winner: number;
}

export interface Participation {
  player: PublicKey;
  index: anchor.BN;
  spendings: anchor.BN[];
}

export interface ContextValues {
  lottery?: Lottery;
  currentRound?: LotteryRound;
  nextPot?: number;
  userParticipations: Participation[];
  fetchRound: (index: number) => Promise<LotteryRound | undefined>;
  newLotteryRound: () => Promise<void>;
  participate: (spendings: anchor.BN[]) => Promise<void>;
  claimParticipation: (index: number) => Promise<void>;
}
