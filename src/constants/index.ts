import * as anchor from "@project-serum/anchor";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

import mainnetMetadata from "./mainnetMetadata.json";
import devnetMetadata from "./devnetMetadata.json";
import { MetadataJson } from "@metaplex/js";

const MAINNET = true;

export type StaticMetadata = {
  metadata: {
    name: string;
    symbol: string;
    uri: string;
    seller_fee_basis_points: number;
    creators: {
      address: string;
      share: number;
    }[];
  };
  arweave: MetadataJson;
  mint: string;
  rarity: number;
  faction: string;
};

export const COLLECTION_CLAIM_DELAY = new anchor.BN(86400);

export const FACTIONS = [
  { name: "Serengetis" },
  { name: "Amphibians" },
  { name: "Reptiles" },
  { name: "Misfits" },
  { name: "Birds" },
  { name: "Monkeys" },
  { name: "Carnivores" },
  { name: "Extincts" },
];

const devnetConstants = {
  mainnet: MAINNET,
  network: WalletAdapterNetwork.Devnet,
  ticker: "ANIMAL",
  wrappedSol: new anchor.web3.PublicKey(
    "So11111111111111111111111111111111111111112"
  ),
  jungleKey: new anchor.web3.PublicKey(
    "7sL8xCP733dh7TnsqREQi9DzK2xDQjQjodAgEtkz9NKa"
  ),
  lotteryKey: new anchor.web3.PublicKey(
    "EEisFsGbo3BTaLN8JayBeGcCrJkJCxGB16DkCAnP6qWY"
  ),
  metadata: devnetMetadata as any as StaticMetadata[],
};

const mainnetConstants = {
  mainnet: MAINNET,
  network: WalletAdapterNetwork.Mainnet,
  ticker: "ANIMAL",
  wrappedSol: new anchor.web3.PublicKey(
    "So11111111111111111111111111111111111111112"
  ),
  jungleKey: new anchor.web3.PublicKey(
    "5fkaiL886wsZSBPJKG77SxUMsaKFJ4tyLD5bw2jpdMfH"
  ),
  lotteryKey: new anchor.web3.PublicKey(
    "2w6hdN1jfHxF44ksb4ZGnf3NQxujNjbRZc62xwP4RBk2"
  ),
  metadata: mainnetMetadata as any as StaticMetadata[],
};

const constants = MAINNET ? mainnetConstants : devnetConstants;

export default constants;
