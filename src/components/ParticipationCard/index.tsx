import React, { useCallback, useEffect, useState } from "react";
import { Flex, Text, Button, Spacer, VStack, Heading } from "@chakra-ui/react";
import useLottery from "hooks/useLottery";
import { LotteryRound, Participation } from "contexts/Lottery";
import { BN } from "@project-serum/anchor";
import constants, { FACTIONS } from "../../constants";

interface TokenCardProps {
  participation: Participation;
}

const ParticipationCard: React.FC<TokenCardProps> = ({ participation }) => {
  const { fetchRound, claimParticipation } = useLottery();

  const [round, setRound] = useState<LotteryRound>();

  const fetchCorrespondingRound = useCallback(async () => {
    const r = await fetchRound(participation.index.toNumber());
    if (r) setRound(r);
  }, [participation.index, fetchRound]);

  useEffect(() => {
    fetchCorrespondingRound();
  }, [fetchCorrespondingRound]);

  const handleParticipation = useCallback(
    (index: number) => {
      claimParticipation(index);
    },
    [claimParticipation]
  );

  return (
    <Flex
      w="100%"
      h="100%"
      p="5"
      direction="row"
      alignItems="center"
      justifyContent="center"
      borderWidth="2px"
      rounded="lg"
      shadow="lg"
      background="white"
    >
      <Heading>Round #{participation.index.toNumber()}</Heading>
      <Spacer />
      <VStack align="start">
        <Text>
          You spent{" "}
          {participation.spendings.reduce((a, b) => a.add(b)).toNumber() /
            10 ** 9}{" "}
          ${constants.ticker} on this round
        </Text>
        {round && (
          <>
            <Text>
              The winners were <b>{FACTIONS[round.winner - 1].name}</b>, you
              spent{" "}
              {participation.spendings[round.winner - 1].toNumber() / 10 ** 9} $
              {constants.ticker} on them.
            </Text>
            <Text>The pot was {round.pot.toString()} SOL</Text>
            <Text>
              You earned{" "}
              {round.spendings[round.winner - 1].gt(new BN(0))
                ? participation.spendings[round.winner - 1]
                    .mul(round.pot)
                    .div(round.spendings[round.winner - 1])
                    .toNumber() /
                  10 ** 9
                : 0}{" "}
              SOL (
              {round.spendings[round.winner - 1].gt(new BN(0))
                ? participation.spendings[round.winner - 1]
                    .mul(new BN(10000))
                    .div(round.spendings[round.winner - 1])
                    .toNumber() / 100
                : 0}
              % of the pot)
            </Text>
          </>
        )}
      </VStack>
      <Spacer />
      <Button
        colorScheme="blue"
        onClick={() => handleParticipation(participation.index.toNumber())}
      >
        Claim participation
      </Button>
    </Flex>
  );
};

export default ParticipationCard;
