import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  VStack,
  Wrap,
} from "@chakra-ui/react";

import useLottery from "hooks/useLottery";
import { FACTIONS } from "../../constants";
import { BN } from "@project-serum/anchor";
import FactionCard from "components/FactionCard";
import ParticipationCard from "components/ParticipationCard";
import { useConnectedWallet } from "@saberhq/use-solana";

const Lottery: React.FC = () => {
  const wallet = useConnectedWallet();
  const {
    lottery,
    currentRound,
    nextPot,
    userParticipations,
    newLotteryRound,
  } = useLottery();

  const [now, setNow] = useState<number>();

  const formatTime = useCallback(() => {
    if (!currentRound || !lottery || !now) return null;

    let difference;
    if (currentRound.start.toNumber() > now) {
      difference = currentRound.start.sub(new BN(now)).toNumber();
    } else {
      difference = currentRound.start
        .add(lottery.period)
        .sub(new BN(now))
        .toNumber();
    }
    const days = Math.floor(difference / (60 * 60 * 24));
    const hours = Math.floor((difference / (60 * 60)) % 24);
    const minutes = Math.floor((difference / 60) % 60);
    const seconds = Math.floor(difference % 60);

    return `${days < 10 ? "0" + days : days}:${
      hours < 10 ? "0" + hours : hours
    }:${minutes < 10 ? "0" + minutes : minutes}:${
      seconds < 10 ? "0" + seconds : seconds
    }`;
  }, [lottery, currentRound, now]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setNow(Math.round(Date.now() / 1000));
    }, 1000);
    // Clear timeout if the component is unmounted
    return () => clearTimeout(timer);
  });

  const handleNewRound = useCallback(() => {
    newLotteryRound();
  }, [newLotteryRound]);

  return (
    <Flex direction="column" w="100%" align="center" p="10px">
      <Box>
        <Heading textAlign="center" color="white">Lottery</Heading>
        {lottery && currentRound && (
          <Box align="center" color="white">
            <Heading textAlign="center" size="lg">
              Current round {currentRound.index.toNumber()}
            </Heading>
            <Heading textAlign="center" size="md">
              This round's jackpot is worth{" "}
              {currentRound.pot.div(new BN(10 ** 9)).toNumber()} SOL
            </Heading>
            {now &&
            lottery.lastTimestamp.add(lottery.period).toNumber() > now ? (
              <Heading textAlign="center" size="sm">
                Next round starts in {formatTime()} and its pot is currently{" "}
                {nextPot || 0} SOL
              </Heading>
            ) : (
              <Button
                colorScheme="blue"
                m="3"
                onClick={handleNewRound}
                disabled={!wallet}
              >
                Start next round
              </Button>
            )}
          </Box>
        )}
        <Wrap m="2" justify="center">
          {FACTIONS.map((e, i) => (
            <FactionCard key={e.name} faction={i} />
          ))}
        </Wrap>
        {userParticipations.length > 0 && (
          <>
            <Divider my="30px" />
            <Heading textAlign="center" pb="3">
              Your past participations
            </Heading>
            <VStack>
              {userParticipations
                .filter(
                  (e) => e.index.toNumber() !== currentRound?.index.toNumber()
                )
                .map((e) => (
                  <ParticipationCard
                    key={e.index.toNumber()}
                    participation={e}
                  />
                ))}
            </VStack>
          </>
        )}
      </Box>
    </Flex>
  );
};

export default Lottery;
