import React, { useCallback, useEffect, useState, useMemo } from "react";
import {
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import * as anchor from "@project-serum/anchor";
import { BN, Program } from "@project-serum/anchor";
import { useDisclosure, useToast } from "@chakra-ui/react";

import ConfirmationModal from "../../components/ConfirmationModal";
import Context from "./Context";
import constants from "../../constants";
import { Lottery, LotteryRound, Participation } from ".";
import {
  Lottery as LotteryProgram,
  IDL as LotteryIdl,
} from "../../constants/types/lottery";
import idl from "../../constants/idls/lottery.json";
import useJungle from "hooks/useJungle";
import { useConnectedWallet, useSolana } from "@saberhq/use-solana";
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";

const programID = new PublicKey(idl.metadata.address);

const LotteryProvider: React.FC = ({ children }) => {
  const toast = useToast();
  const { providerMut } = useSolana();
  const wallet = useConnectedWallet();
  const { jungle, userAccount, fetchUserAccount } = useJungle();

  const { isOpen: confirming, onOpen, onClose } = useDisclosure();
  const [lottery, setLottery] = useState<Lottery>();
  const [currentRound, setCurrentRound] = useState<LotteryRound>();
  const [nextPot, setNextPot] = useState<number>();
  const [userParticipations, setUserParticipations] = useState<Participation[]>(
    []
  );

  const provider = useMemo(() => {
    if (!providerMut) return;
    return new anchor.Provider(providerMut.connection, wallet as any, {
      preflightCommitment: "confirmed",
    });
  }, [providerMut, wallet]);

  /**
   * Fetches the lottery
   */
  const fetchLottery = useCallback(async () => {
    if (!provider) return;

    const program = new Program<LotteryProgram>(
      LotteryIdl,
      programID,
      provider
    );

    const [lotteryAddress] = await PublicKey.findProgramAddress(
      [Buffer.from("lottery"), constants.lotteryKey.toBuffer()],
      programID
    );

    const fetchedLottery = await program.account.lottery.fetch(lotteryAddress);

    setLottery({
      key: fetchedLottery.key,
      owner: fetchedLottery.owner,
      escrow: fetchedLottery.escrow,
      mint: fetchedLottery.mint,
      treasury: fetchedLottery.treasury,
      period: fetchedLottery.period,
      lastRound: fetchedLottery.lastRound,
      lastTimestamp: fetchedLottery.lastTimestamp,
      unclaimedPot: fetchedLottery.unclaimedPot,
    });
  }, [provider]);

  useEffect(() => {
    fetchLottery();
  }, [fetchLottery]);

  /**
   * Fetches a specific round
   */
  const fetchRound = useCallback(
    async (index: number) => {
      if (!lottery || !provider) return;

      const program = new Program<LotteryProgram>(
        LotteryIdl,
        programID,
        provider
      );

      const [round] = await PublicKey.findProgramAddress(
        [
          Buffer.from("round"),
          lottery.key.toBuffer(),
          new BN(index).toArrayLike(Buffer, "le", 8),
        ],
        programID
      );

      const fetchedRound = await program.account.lotteryRound.fetch(round);

      return {
        index: fetchedRound.index,
        start: fetchedRound.start,
        spendings: fetchedRound.spendings,
        pot: fetchedRound.pot,
        winner: fetchedRound.winner,
      };
    },
    [provider, lottery]
  );

  /**
   * Fetches the current lottery round
   */
  const fetchCurrentRound = useCallback(async () => {
    if (!lottery) return;
    setCurrentRound(await fetchRound(lottery.lastRound.toNumber()));
  }, [lottery, fetchRound]);

  useEffect(() => {
    fetchCurrentRound();
  }, [fetchCurrentRound]);

  /**
   * Fetches the user participations
   */
  const fetchUserParticipations = useCallback(async () => {
    if (!wallet || !wallet.publicKey || !lottery || !provider) return;

    const program = new Program<LotteryProgram>(
      LotteryIdl,
      programID,
      provider
    );

    [1, 2, 3].filter(
      async (e) =>
        new Promise(async (resolve) => setTimeout(() => resolve(true), 1000))
    );

    try {
      // TODO: User filters to only fetch this player's participations
      const participations = await program.account.lotteryParticipation.all([
        {
          memcmp: {
            bytes: wallet.publicKey.toString(),
            offset: 9, // Discriminator + bump
          },
        },
      ]);
      setUserParticipations(
        participations
          // Filter participations for this lottery only
          .filter((e) => {
            const [participationAddress] = findProgramAddressSync(
              [
                Buffer.from("participation"),
                lottery.key.toBuffer(),
                new BN(e.account.index).toArrayLike(Buffer, "le", 8),
                wallet.publicKey.toBuffer(),
              ],
              programID
            );
            return e.publicKey.equals(participationAddress);
          })
          .map((e) => ({
            player: e.account.player,
            index: e.account.index,
            spendings: e.account.spendings,
          }))
          .filter((e) => e.player.toString() === wallet.publicKey?.toString())
          .sort((a, b) => a.index.toNumber() - b.index.toNumber())
      );
    } catch (err) {
      console.log("Failed fetching owned tokens", err);
    }
  }, [provider, lottery, wallet]);

  useEffect(() => {
    fetchUserParticipations();
  }, [fetchUserParticipations]);

  /**
   * Fetch the amount of SOL currently waiting for the next round
   */
  const fetchNextPot = useCallback(async () => {
    if (!lottery || !provider) return;
    setNextPot(
      ((await provider.connection.getBalance(lottery.escrow)) -
        lottery.unclaimedPot.toNumber()) /
        10 ** 9
    );
  }, [lottery, provider, setNextPot]);

  useEffect(() => {
    fetchNextPot();
  }, [fetchNextPot]);

  /**
   * Create a new round of lottery.
   * This can be called only after the previous round expires
   */
  const newLotteryRound = useCallback(async () => {
    if (!wallet || !wallet.publicKey || !lottery || !provider) return;

    onOpen();

    const program = new Program<LotteryProgram>(
      LotteryIdl,
      programID,
      provider
    );
    const [lotteryAddress] = await PublicKey.findProgramAddress(
      [Buffer.from("lottery", "utf8"), lottery.key.toBuffer()],
      program.programId
    );
    const [escrow] = await PublicKey.findProgramAddress(
      [Buffer.from("escrow", "utf8"), lottery.key.toBuffer()],
      program.programId
    );

    // Checking the number of rounds behind and skip several in one tx
    const roundsToSkip = Math.min(
      16, // Maximum number possible
      Math.floor(
        (Math.round(Date.now() / 1000) - lottery.lastTimestamp.toNumber()) /
          lottery.period.toNumber()
      )
    );

    console.log(
      `${Math.floor(
        (Math.round(Date.now() / 1000) - lottery.lastTimestamp.toNumber()) /
          lottery.period.toNumber()
      )} rounds behind`
    );

    const instructions = [];
    for (let i = 0; i < roundsToSkip - 1; i++) {
      const [round, roundBump] = await PublicKey.findProgramAddress(
        [
          Buffer.from("round", "utf8"),
          lottery.key.toBuffer(),
          lottery.lastRound.add(new BN(i + 1)).toArrayLike(Buffer, "le", 8),
        ],
        programID
      );
      const [previousRound] = await PublicKey.findProgramAddress(
        [
          Buffer.from("round", "utf8"),
          lottery.key.toBuffer(),
          lottery.lastRound.add(new BN(i)).toArrayLike(Buffer, "le", 8),
        ],
        programID
      );
      instructions.push(
        program.instruction.newLotteryRound(roundBump, {
          accounts: {
            lottery: lotteryAddress,
            escrow: escrow,
            lotteryRound: round,
            oldLotteryRound: previousRound,
            payer: wallet.publicKey,
            clock: SYSVAR_CLOCK_PUBKEY,
            rent: SYSVAR_RENT_PUBKEY,
            systemProgram: SystemProgram.programId,
          },
        })
      );
    }

    try {
      const [round, roundBump] = await PublicKey.findProgramAddress(
        [
          Buffer.from("round", "utf8"),
          lottery.key.toBuffer(),
          lottery.lastRound
            .add(new BN(roundsToSkip))
            .toArrayLike(Buffer, "le", 8),
        ],
        programID
      );
      const [previousRound] = await PublicKey.findProgramAddress(
        [
          Buffer.from("round", "utf8"),
          lottery.key.toBuffer(),
          lottery.lastRound
            .add(new BN(roundsToSkip - 1))
            .toArrayLike(Buffer, "le", 8),
        ],
        programID
      );

      await program.rpc.newLotteryRound(roundBump, {
        accounts: {
          lottery: lotteryAddress,
          escrow: escrow,
          lotteryRound: round,
          oldLotteryRound: previousRound,
          payer: wallet.publicKey,
          clock: SYSVAR_CLOCK_PUBKEY,
          rent: SYSVAR_RENT_PUBKEY,
          systemProgram: SystemProgram.programId,
        },
        instructions: instructions,
      });

      toast({
        title: "A new round is starting!",
        description: `Successfully started round #${lottery.lastRound
          .add(new BN(roundsToSkip))
          .toNumber()}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      fetchLottery();
      fetchUserParticipations();
    } catch (err) {
      console.log("Failed new round", err);

      toast({
        title: "Starting a new round failed",
        description: `${err}`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }

    onClose();
  }, [
    lottery,
    provider,
    toast,
    wallet,
    onClose,
    onOpen,
    fetchLottery,
    fetchUserParticipations,
  ]);

  const participate = useCallback(
    async (spendings: BN[]) => {
      if (
        !wallet ||
        !wallet.publicKey ||
        !lottery ||
        !jungle ||
        !userAccount ||
        !provider
      )
        return;

      onOpen();

      const program = new Program<LotteryProgram>(
        LotteryIdl,
        programID,
        provider
      );
      const [lotteryAddress] = await PublicKey.findProgramAddress(
        [Buffer.from("lottery", "utf8"), lottery.key.toBuffer()],
        program.programId
      );

      const [round] = await PublicKey.findProgramAddress(
        [
          Buffer.from("round", "utf8"),
          lottery.key.toBuffer(),
          lottery.lastRound.toArrayLike(Buffer, "le", 8),
        ],
        programID
      );
      const [participation, participationBump] =
        await PublicKey.findProgramAddress(
          [
            Buffer.from("participation", "utf8"),
            lottery.key.toBuffer(),
            lottery.lastRound.toArrayLike(Buffer, "le", 8),
            wallet.publicKey.toBuffer(),
          ],
          programID
        );

      try {
        try {
          // Check if there already is a participation
          await program.account.lotteryParticipation.fetch(participation);

          // If it works, update it, else create it
          await program.rpc.updateParticipation(spendings, {
            accounts: {
              lottery: lotteryAddress,
              lotteryRound: round,
              participation: participation,
              player: wallet.publicKey,
              playerAccount: userAccount.address,
              treasury: jungle.rewardsAccount,
              tokenProgram: TOKEN_PROGRAM_ID,
              clock: SYSVAR_CLOCK_PUBKEY,
              rent: SYSVAR_RENT_PUBKEY,
              systemProgram: SystemProgram.programId,
            },
          });
        } catch (err) {
          await program.rpc.participate(participationBump, spendings, {
            accounts: {
              lottery: lotteryAddress,
              lotteryRound: round,
              participation: participation,
              player: wallet.publicKey,
              playerAccount: userAccount.address,
              treasury: jungle.rewardsAccount,
              tokenProgram: TOKEN_PROGRAM_ID,
              clock: SYSVAR_CLOCK_PUBKEY,
              rent: SYSVAR_RENT_PUBKEY,
              systemProgram: SystemProgram.programId,
            },
          });
        }
        toast({
          title: "Your bet is accepted!",
          description: `Successfully bet round #${
            lottery.lastRound.toNumber() + 1
          }`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        fetchLottery();
        fetchUserAccount();
        fetchUserParticipations();
      } catch (err) {
        console.log("Failed participating", err);

        toast({
          title: "Participation failed",
          description: `${err}`,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }

      onClose();
    },
    [
      lottery,
      provider,
      jungle,
      userAccount,
      toast,
      wallet,
      onClose,
      onOpen,
      fetchLottery,
      fetchUserAccount,
      fetchUserParticipations,
    ]
  );

  const claimParticipation = useCallback(
    async (index: number) => {
      if (
        !wallet ||
        !wallet.publicKey ||
        !lottery ||
        !jungle ||
        !userAccount ||
        !provider
      )
        return;

      onOpen();

      const program = new Program<LotteryProgram>(
        LotteryIdl,
        programID,
        provider
      );
      const [lotteryAddress] = await PublicKey.findProgramAddress(
        [Buffer.from("lottery", "utf8"), lottery.key.toBuffer()],
        program.programId
      );
      const [escrow] = await PublicKey.findProgramAddress(
        [Buffer.from("escrow", "utf8"), lottery.key.toBuffer()],
        program.programId
      );
      const [round] = await PublicKey.findProgramAddress(
        [
          Buffer.from("round", "utf8"),
          lottery.key.toBuffer(),
          new BN(index).toArrayLike(Buffer, "le", 8),
        ],
        programID
      );
      const [participation] = await PublicKey.findProgramAddress(
        [
          Buffer.from("participation", "utf8"),
          lottery.key.toBuffer(),
          new BN(index).toArrayLike(Buffer, "le", 8),
          wallet.publicKey.toBuffer(),
        ],
        programID
      );

      try {
        await program.rpc.claimParticipation({
          accounts: {
            lottery: lotteryAddress,
            escrow: escrow,
            lotteryRound: round,
            participation: participation,
            player: wallet.publicKey,
            clock: SYSVAR_CLOCK_PUBKEY,
            rent: SYSVAR_RENT_PUBKEY,
            systemProgram: SystemProgram.programId,
          },
        });

        toast({
          title: "Claimed participation",
          description: `Successfully claimed round #${index}`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        fetchLottery();
        fetchUserParticipations();
      } catch (err) {
        console.log("Failed claiming", err);

        toast({
          title: "Claiming failed",
          description: `${err}`,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }

      onClose();
    },
    [
      lottery,
      provider,
      jungle,
      userAccount,
      toast,
      wallet,
      onClose,
      onOpen,
      fetchLottery,
      fetchUserParticipations,
    ]
  );

  return (
    <Context.Provider
      value={{
        lottery,
        currentRound,
        nextPot,
        userParticipations,
        fetchRound,
        newLotteryRound,
        participate,
        claimParticipation,
      }}
    >
      {children}
      <ConfirmationModal isOpen={confirming} onClose={onClose} />
    </Context.Provider>
  );
};

export default LotteryProvider;
