import React, { useCallback, useEffect, useState, useMemo } from "react";
import { useSolana } from "@saberhq/use-solana";
import { createTokenAccount } from "@saberhq/token-utils";
import { useConnectedWallet } from "@gokiprotocol/walletkit";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  AccountInfo as TokenAccount,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  Token,
} from "@solana/spl-token";
import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { useDisclosure, useToast } from "@chakra-ui/react";

import { buildLeaves, factionToNumber } from "../../utils";
import ConfirmationModal from "../../components/ConfirmationModal";
import Context from "./Context";
import constants from "../../constants";
import { Animal, Jungle } from ".";
import {
  Jungle as JungleProgram,
  IDL as JundleIdl,
} from "../../constants/types/jungle";
import idl from "../../constants/idls/jungle.json";
import { MerkleTree } from "../../utils/merkleTree";

const programID = new PublicKey(idl.metadata.address);

const JungleProvider: React.FC = ({ children }) => {
  const toast = useToast();
  const { connection, providerMut } = useSolana();
  const wallet = useConnectedWallet();

  const { isOpen: confirming, onOpen, onClose } = useDisclosure();
  const [userAccount, setUserAccount] = useState<TokenAccount>();
  const [jungle, setJungle] = useState<Jungle>();
  const [animals, setAnimals] = useState<Animal[]>();
  const [stakedAnimals, setStakedAnimals] = useState<Animal[]>();

  const provider = useMemo(() => {
    if (!providerMut) return;
    return new anchor.Provider(providerMut?.connection, wallet as any, {
      preflightCommitment: "confirmed",
    });
  }, [providerMut, wallet]);

  const tree = useMemo(() => {
    const leaves = buildLeaves(
      constants.metadata.map((e, i) => ({
        mint: new PublicKey(e.mint),
        rarity: e.rarity,
        faction: factionToNumber(e.faction),
      }))
    );
    return new MerkleTree(leaves);
  }, []);

  /**
   * Fetches the animals owned by the user
   */
  const fetchAnimals = useCallback(async () => {
    if (!connection || !wallet) return;

    try {
      const owned = await Metadata.findDataByOwner(
        connection,
        wallet.publicKey
      );
      const collectionMints = constants.metadata.map((e) => e.mint);
      setAnimals(
        owned
          .map((e) => e.mint)
          .filter((e) => collectionMints.includes(e))
          .map((e) => {
            const metadataItem = constants.metadata.filter(
              (f) => f.mint === e
            )[0];
            return {
              mint: new PublicKey(e),
              metadata: metadataItem.arweave,
              rarity: metadataItem.rarity,
              faction: metadataItem.faction,
            };
          })
          .sort((a, b) => {
            const na = Number(a.metadata.name.split("#")[1]);
            const nb = Number(b.metadata.name.split("#")[1]);
            return na - nb;
          })
      );
    } catch (err) {
      console.log("Failed fetching owned tokens", err);
    }
  }, [wallet, connection]);

  useEffect(() => {
    if (!animals) fetchAnimals();
  }, [fetchAnimals, animals]);

  /**
   * Fetches the animals staked by the user
   */
  const fetchStakedAnimals = useCallback(async () => {
    if (!connection || !wallet) return;

    const program = new anchor.Program(idl as anchor.Idl, programID, provider);

    try {
      const staked = await program.account.animal.all([
        {
          memcmp: {
            offset: 42, // Bumps + mint
            bytes: wallet.publicKey?.toString(),
          },
        },
      ]);
      const collectionMints = constants.metadata.map((e) => e.mint);
      setStakedAnimals(
        staked
          .map((e) => e.account.mint.toString())
          .filter((e) => collectionMints.includes(e))
          .map((e) => {
            const metadataItem = constants.metadata.filter(
              (f) => f.mint === e
            )[0];
            return {
              mint: new PublicKey(e),
              metadata: metadataItem.arweave,
              rarity: metadataItem.rarity,
              faction: metadataItem.faction,
            };
          })
          .sort((a, b) => {
            const na = Number(a.metadata.name.split("#")[1]);
            const nb = Number(b.metadata.name.split("#")[1]);
            return na - nb;
          })
      );
    } catch (err) {
      console.log("Failed fetching owned tokens", err);
    }
  }, [provider, wallet, connection]);

  useEffect(() => {
    if (!stakedAnimals) fetchStakedAnimals();
  }, [stakedAnimals, fetchStakedAnimals]);

  /**
   * Fetches the jungle
   */
  const fetchJungle = useCallback(async () => {
    if (!provider) return;
    const program = new Program<JungleProgram>(JundleIdl, programID, provider);

    const [jungleAddress] = await PublicKey.findProgramAddress(
      [Buffer.from("jungle"), constants.jungleKey.toBuffer()],
      programID
    );

    const fetchedJungle = await program.account.jungle.fetch(jungleAddress);

    setJungle({
      key: fetchedJungle.key,
      owner: fetchedJungle.owner,
      escrow: fetchedJungle.escrow,
      mint: fetchedJungle.mint,
      rewardsAccount: fetchedJungle.rewardsAccount,
      animalsStaked: fetchedJungle.animalsStaked,
      maximumRarity: fetchedJungle.maximumRarity,
      maximumRarityMultiplier: fetchedJungle.maximumRarityMultiplier,
      baseWeeklyEmissions: fetchedJungle.baseWeeklyEmissions,
      root: fetchedJungle.root,
    });
  }, [provider]);

  useEffect(() => {
    fetchJungle();
  }, [fetchJungle]);

  const getRarityMultiplier = useCallback(
    (animal: Animal) => {
      if (!jungle) return;

      return (
        ((Math.min(jungle.maximumRarity.toNumber(), animal.rarity) /
          jungle.maximumRarity.toNumber()) *
          (jungle.maximumRarityMultiplier.toNumber() - 10000) +
          10000) /
        10000
      );
    },
    [jungle]
  );

  const getPendingStakingRewards = useCallback(
    (animal: Animal, end: Date) => {
      const animalMultiplier = getRarityMultiplier(animal) || 1;
      if (!jungle || !animal.lastClaim || end < animal.lastClaim) return 0;

      const elapsed = (end.valueOf() - animal.lastClaim.valueOf()) / 1000;
      const emissionsPerSecond = jungle.baseWeeklyEmissions
        .div(new anchor.BN(604800))
        .toNumber();

      console.log(elapsed, emissionsPerSecond, animalMultiplier);

      return (elapsed * emissionsPerSecond * animalMultiplier) / 10 ** 9;
    },
    [jungle, getRarityMultiplier]
  );

  /**
   * Fetches a staking account
   */
  const fetchAnimal = useCallback(
    async (mint: PublicKey) => {
      if (!connection) return;

      const program = new anchor.Program(
        idl as anchor.Idl,
        programID,
        provider
      );

      const [animalAddress] = await PublicKey.findProgramAddress(
        [Buffer.from("animal"), mint.toBuffer()],
        programID
      );

      const metadataItem = constants.metadata.filter(
        (e) => e.mint === mint.toString()
      )[0];
      try {
        const fetchedAnimal = await program.account.animal.fetch(animalAddress);

        return {
          mint: mint,
          metadata: metadataItem.arweave,
          rarity: fetchedAnimal.rarity.toString(),
          faction: metadataItem.faction,
          lastClaim: new Date(fetchedAnimal.lastClaim.toNumber() * 1000),
        };
      } catch (err) {
        return {
          mint: mint,
          metadata: metadataItem.arweave,
          rarity: metadataItem.rarity,
          faction: metadataItem.faction,
        };
      }
    },
    [connection, provider]
  );

  /**
   * Fetches the staking rewards account
   */
  const fetchUserAccount = useCallback(async () => {
    if (!jungle || !connection || !wallet || !wallet.publicKey) return;

    try {
      const associatedAddress = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        jungle.mint,
        wallet.publicKey
      );
      const token = new Token(
        connection,
        jungle.mint,
        TOKEN_PROGRAM_ID,
        wallet as any
      );
      setUserAccount(await token.getAccountInfo(associatedAddress));
    } catch (err) {
      console.log("User has no account yet");
    }
  }, [connection, jungle, wallet]);

  useEffect(() => {
    fetchUserAccount();
  }, [fetchUserAccount]);

  const createAccount = useCallback(async () => {
    if (
      !wallet ||
      !wallet.publicKey ||
      !wallet.signTransaction ||
      !jungle ||
      !providerMut
    )
      return;

    onOpen();

    try {
      await createTokenAccount({
        provider: providerMut,
        mint: jungle.mint,
        owner: wallet.publicKey,
        payer: wallet.publicKey,
      });
      toast({
        title: "Account creation successful",
        description: `Successfully created an account`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      fetchUserAccount();
    } catch (err) {
      console.log(err);

      toast({
        title: "Account creation failed",
        description: `Failed to created an account`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      onClose();
    }
  }, [jungle, providerMut, toast, wallet, onClose, onOpen, fetchUserAccount]);

  const stakeAnimal = useCallback(
    async (animal: Animal) => {
      if (!wallet || !jungle || !provider) return;

      onOpen();

      const program = new Program<JungleProgram>(
        JundleIdl,
        programID,
        provider
      );
      const [jungleAddress] = await PublicKey.findProgramAddress(
        [Buffer.from("jungle", "utf8"), jungle.key.toBuffer()],
        program.programId
      );
      const [animalAddress, animalBump] = await PublicKey.findProgramAddress(
        [Buffer.from("animal", "utf8"), animal.mint.toBuffer()],
        program.programId
      );
      const [deposit, depositBump] = await PublicKey.findProgramAddress(
        [Buffer.from("deposit", "utf8"), animal.mint.toBuffer()],
        program.programId
      );

      const bumps = {
        animal: animalBump,
        deposit: depositBump,
      };

      const stakerAccount = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        animal.mint,
        wallet.publicKey
      );

      const instructions: TransactionInstruction[] = [];
      
      try {
        new Token(
          provider.connection,
          animal.mint,
          TOKEN_PROGRAM_ID,
          Keypair.generate()
        ).getAccountInfo(stakerAccount);
      } catch (err) {
        instructions.push(
          Token.createAssociatedTokenAccountInstruction(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            animal.mint,
            stakerAccount,
            wallet.publicKey,
            wallet.publicKey
          )
        );
      }

      const indexStaked = constants.metadata.findIndex(
        (e) => e.mint === animal.mint.toString()
      );

      try {
        await program.rpc.stakeAnimal(
          bumps,
          tree.getProofArray(indexStaked),
          new anchor.BN(animal.rarity),
          new anchor.BN(factionToNumber(animal.faction)),
          {
            accounts: {
              jungle: jungleAddress,
              escrow: jungle.escrow,
              animal: animalAddress,
              staker: wallet.publicKey,
              mint: animal.mint,
              stakerAccount: stakerAccount,
              depositAccount: deposit,
              tokenProgram: TOKEN_PROGRAM_ID,
              clock: SYSVAR_CLOCK_PUBKEY,
              rent: SYSVAR_RENT_PUBKEY,
              systemProgram: SystemProgram.programId,
            },
            instructions: instructions,
          }
        );

        toast({
          title: "Staking successful",
          description: `Successfully staked "${animal.metadata.name}"`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        fetchAnimals();
        fetchStakedAnimals();
      } catch (err) {
        console.log("Failed staking animal", err);

        toast({
          title: "Staking failed",
          description: `${err}`,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }

      onClose();
    },
    [
      jungle,
      provider,
      tree,
      toast,
      wallet,
      onClose,
      onOpen,
      fetchAnimals,
      fetchStakedAnimals,
    ]
  );

  /**
   * Unstakes an animal.
   * It also creates all used account if they do not exist and claims rewards
   */
  const unstakeAnimal = useCallback(
    async (animal: Animal) => {
      if (!wallet || !jungle || !provider) return;

      onOpen();

      const program = new Program<JungleProgram>(
        JundleIdl,
        programID,
        provider
      );
      const [jungleAddress] = await PublicKey.findProgramAddress(
        [Buffer.from("jungle", "utf8"), jungle.key.toBuffer()],
        program.programId
      );
      const [rewardsAccount] = await PublicKey.findProgramAddress(
        [
          Buffer.from("rewards", "utf8"),
          jungle.key.toBuffer(),
          jungle.mint.toBuffer(),
        ],
        program.programId
      );
      const [animalAddress] = await PublicKey.findProgramAddress(
        [Buffer.from("animal", "utf8"), animal.mint.toBuffer()],
        program.programId
      );
      const [deposit] = await PublicKey.findProgramAddress(
        [Buffer.from("deposit", "utf8"), animal.mint.toBuffer()],
        program.programId
      );

      const rewardsStakerAccount = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        jungle.mint,
        wallet.publicKey
      );
      const animalStakerAccount = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        animal.mint,
        wallet.publicKey
      );

      const instructions: TransactionInstruction[] = [];

      if (!userAccount)
        instructions.push(
          Token.createAssociatedTokenAccountInstruction(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            jungle.mint,
            rewardsStakerAccount,
            wallet.publicKey,
            wallet.publicKey
          )
        );

      try {
        new Token(
          provider.connection,
          animal.mint,
          TOKEN_PROGRAM_ID,
          Keypair.generate()
        ).getAccountInfo(animalStakerAccount);
      } catch (err) {
        instructions.push(
          Token.createAssociatedTokenAccountInstruction(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            animal.mint,
            animalStakerAccount,
            wallet.publicKey,
            wallet.publicKey
          )
        );
      }

      instructions.push(
        program.instruction.claimStaking({
          accounts: {
            jungle: jungleAddress,
            escrow: jungle.escrow,
            animal: animalAddress,
            staker: wallet.publicKey,
            mint: jungle.mint,
            stakerAccount: rewardsStakerAccount,
            rewardsAccount: rewardsAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
            clock: SYSVAR_CLOCK_PUBKEY,
            rent: SYSVAR_RENT_PUBKEY,
            systemProgram: SystemProgram.programId,
          },
        })
      );

      try {
        await program.rpc.unstakeAnimal({
          accounts: {
            jungle: jungleAddress,
            escrow: jungle.escrow,
            animal: animalAddress,
            staker: wallet.publicKey,
            mint: animal.mint,
            stakerAccount: animalStakerAccount,
            depositAccount: deposit,
            tokenProgram: TOKEN_PROGRAM_ID,
          },
          instructions: instructions,
        });

        toast({
          title: "Unstaking successful",
          description: `Successfully unstaked "${animal.metadata.name}"`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        fetchAnimals();
        fetchStakedAnimals();
        fetchUserAccount();
      } catch (err) {
        console.log("Failed unstaking animal", err);

        toast({
          title: "Unstaking failed",
          description: `${err}`,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }

      onClose();
    },
    [
      jungle,
      provider,
      toast,
      userAccount,
      wallet,
      onClose,
      onOpen,
      fetchAnimals,
      fetchStakedAnimals,
      fetchUserAccount,
    ]
  );

  const claimStakingRewards = useCallback(
    async (animal: Animal) => {
      if (!wallet || !wallet.publicKey || !jungle) return;

      onOpen();

      const program = new Program<JungleProgram>(
        JundleIdl,
        programID,
        provider
      );
      const [jungleAddress] = await PublicKey.findProgramAddress(
        [Buffer.from("jungle", "utf8"), jungle.key.toBuffer()],
        program.programId
      );
      const [rewardsAccount] = await PublicKey.findProgramAddress(
        [
          Buffer.from("rewards", "utf8"),
          jungle.key.toBuffer(),
          jungle.mint.toBuffer(),
        ],
        program.programId
      );
      const [animalAddress] = await PublicKey.findProgramAddress(
        [Buffer.from("animal", "utf8"), animal.mint.toBuffer()],
        program.programId
      );

      const stakerAccount = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        jungle.mint,
        wallet.publicKey
      );

      try {
        // Create an reward account if the user does not have one
        const instructions = userAccount
          ? []
          : [
              Token.createAssociatedTokenAccountInstruction(
                ASSOCIATED_TOKEN_PROGRAM_ID,
                TOKEN_PROGRAM_ID,
                jungle.mint,
                stakerAccount,
                wallet.publicKey,
                wallet.publicKey
              ),
            ];

        await program.rpc.claimStaking({
          accounts: {
            jungle: jungleAddress,
            escrow: jungle.escrow,
            animal: animalAddress,
            staker: wallet.publicKey,
            mint: jungle.mint,
            stakerAccount: stakerAccount,
            rewardsAccount: rewardsAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
            clock: SYSVAR_CLOCK_PUBKEY,
            rent: SYSVAR_RENT_PUBKEY,
            systemProgram: SystemProgram.programId,
          },
          instructions: instructions,
        });

        toast({
          title: "Claiming successful",
          description: `Successfully claimed staking rewards for "${animal.metadata.name}"`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        fetchAnimals();
        fetchStakedAnimals();
        fetchUserAccount();
      } catch (err) {
        console.log("Failed claiming rewards", err);

        toast({
          title: "Claiming staking rewards failed",
          description: `${err}`,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }

      onClose();
    },
    [
      jungle,
      provider,
      toast,
      userAccount,
      wallet,
      onClose,
      onOpen,
      fetchAnimals,
      fetchStakedAnimals,
      fetchUserAccount,
    ]
  );

  const refreshAnimals = useCallback(async () => {
    setAnimals([]);
    setStakedAnimals([]);
    await fetchJungle();
    await fetchAnimals();
    await fetchStakedAnimals();
  }, [
    fetchJungle,
    fetchStakedAnimals,
    fetchAnimals,
    setAnimals,
    setStakedAnimals,
  ]);

  return (
    <Context.Provider
      value={{
        jungle,
        animals: animals || [],
        stakedAnimals: stakedAnimals || [],
        userAccount,
        getRarityMultiplier,
        getPendingStakingRewards,
        fetchAnimal,
        refreshAnimals,
        fetchUserAccount,
        createAccount,
        stakeAnimal,
        unstakeAnimal,
        claimStakingRewards,
      }}
    >
      {children}
      <ConfirmationModal isOpen={confirming} onClose={onClose} />
    </Context.Provider>
  );
};

export default JungleProvider;
