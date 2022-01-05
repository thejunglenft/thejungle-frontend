import { PublicKey } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import { AccountInfo as TokenAccount } from "@solana/spl-token";
import { MetadataJson } from "@metaplex/js";

export interface Jungle {
  key: PublicKey;
  owner: PublicKey;
  escrow: PublicKey;
  mint: PublicKey;
  rewardsAccount: PublicKey;
  animalsStaked: anchor.BN;
  maximumRarity: anchor.BN;
  maximumRarityMultiplier: anchor.BN;
  baseWeeklyEmissions: anchor.BN;
  root: number[];
}

export interface Animal {
  mint: PublicKey;
  metadata: MetadataJson;
  rarity: number;
  faction: string;
  lastClaim?: Date;
}

export interface ContextValues {
  jungle?: Jungle;
  animals: Animal[];
  stakedAnimals: Animal[];
  userAccount?: TokenAccount;
  getRarityMultiplier: (animal: Animal) => number | undefined;
  getPendingStakingRewards: (animal: Animal, since: Date) => number;
  fetchAnimal: (mint: PublicKey) => Promise<Animal | undefined>;
  fetchUserAccount: () => Promise<void>;
  createAccount: () => Promise<void>;
  stakeAnimal: (animal: Animal) => Promise<void>;
  unstakeAnimal: (animal: Animal) => Promise<void>;
  claimStakingRewards: (animal: Animal) => Promise<void>;
}
