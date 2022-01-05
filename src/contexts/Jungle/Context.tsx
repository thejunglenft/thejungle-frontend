import { PublicKey } from "@solana/web3.js";
import { createContext } from "react";

import { ContextValues } from "./types";

const Context = createContext<ContextValues>({
  animals: [],
  stakedAnimals: [],
  getRarityMultiplier: () => 0,
  getPendingStakingRewards: () => 0,
  fetchAnimal: (mint: PublicKey) => new Promise(() => {}),
  fetchUserAccount: () => new Promise(() => {}),
  createAccount: () => new Promise(() => {}),
  stakeAnimal: () => new Promise(() => {}),
  unstakeAnimal: () => new Promise(() => {}),
  claimStakingRewards: () => new Promise(() => {}),
});

export default Context;
