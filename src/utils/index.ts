import * as anchor from "@project-serum/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

export const shortAddress = (address: string | undefined): string => {
  if (!address) return "???";
  return (
    address.substring(0, 4) +
    "..." +
    address.substring(address.length - 4, address.length)
  );
};

export const findTokenAddress = async (
  walletAddress: anchor.web3.PublicKey,
  tokenMintAddress: anchor.web3.PublicKey
): Promise<anchor.web3.PublicKey> => {
  return (
    await anchor.web3.PublicKey.findProgramAddress(
      [
        walletAddress.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        tokenMintAddress.toBuffer(),
      ],
      TOKEN_PROGRAM_ID
    )
  )[0];
};

export const findAssociatedTokenAddress = async (
  walletAddress: anchor.web3.PublicKey,
  tokenMintAddress: anchor.web3.PublicKey
): Promise<anchor.web3.PublicKey> => {
  return (
    await anchor.web3.PublicKey.findProgramAddress(
      [
        walletAddress.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        tokenMintAddress.toBuffer(),
      ],
      ASSOCIATED_TOKEN_PROGRAM_ID
    )
  )[0];
};

export const factionToNumber = (faction: string) => {
  switch (faction) {
    case "Sarengti":
      return 1;
    case "Amphibian":
      return 2;
    case "Reptile":
      return 3;
    case "Misfit":
      return 4;
    case "Bird":
      return 5;
    case "Monkey":
      return 6;
    case "Carnivore":
      return 7;
    case "Mythic":
      return 8;
    default:
      throw new Error("unknown faction")
  }
};

export const buildLeaves = (
  data: { mint: anchor.web3.PublicKey; rarity: number; faction: number }[]
) => {
  const leaves: Array<Buffer> = [];
  for (let idx = 0; idx < data.length; ++idx) {
    const animal = data[idx];
    leaves.push(
      Buffer.from([
        ...animal.mint.toBuffer(),
        ...new anchor.BN(animal.rarity).toArray("le", 8),
        ...new anchor.BN(animal.faction).toArray("le", 8),
      ])
    );
  }

  return leaves;
};