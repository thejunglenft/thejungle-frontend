import * as anchor from "@project-serum/anchor";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

import mainnetMetadata from "./mainnetMetadata.json";
import devnetMetadata from "./devnetMetadata.json";
import { MetadataJson } from "@metaplex/js";

const MAINNET = false;

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
    "BRK9vQaBnXBLCMd4QUaYTFFq5eTZ2yZHA76zwf5nZmtW"
  ),
  lotteryKey: new anchor.web3.PublicKey(
    "7zPZHrsSe2uWjGai7Li9gAqCW1YBg1JZnk3Ym9rT713R"
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
    "BomSWAVr2Ab8CngV2zWbxiBP6fBDPfNM2sFimAUfgvWP"
  ),
  lotteryKey: new anchor.web3.PublicKey(
    "EJBKqVd4CKTbZCqh2RBoQbxEMUTeCRQdasee79Xx9DZP"
  ),
  metadata: mainnetMetadata as any as StaticMetadata[],
};

const constants = MAINNET ? mainnetConstants : devnetConstants;

export default constants;
