import React, { useCallback, useMemo, useState } from "react";
import {
  Flex,
  Text,
  Button,
  Spacer,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import constants, { FACTIONS } from "../../constants";
import useLottery from "hooks/useLottery";
import { BN } from "@project-serum/anchor";

interface TokenCardProps {
  faction: number;
}

const FactionCard: React.FC<TokenCardProps> = ({ faction }) => {
  const { currentRound, userParticipations, participate } = useLottery();

  const [amount, setAmount] = useState<number>();

  const handleParticipation = useCallback(() => {
    if (!amount) return;

    const spendings = Array(8)
      .fill(0)
      .map(() => new BN(0));
    spendings[faction] = new BN(amount * 10 ** 9);
    participate(spendings);
  }, [amount, faction, participate]);

  const currentParticipation = useMemo(() => {
    return userParticipations.filter(
      (e) => e.index.toNumber() === currentRound?.index.toNumber()
    )[0];
  }, [userParticipations, currentRound]);

  return (
    <Flex
      w="280px"
      h="100%"
      pt="0"
      background="white"
      direction="column"
      alignItems="center"
      justifyContent="center"
      borderWidth="2px"
      rounded="lg"
      shadow="lg"
    >
      <VStack spacing="2" p="2">
        <Heading>{FACTIONS[faction].name}</Heading>
        <FormControl>
          <FormLabel>Amount of ${constants.ticker} to bet</FormLabel>
          <Input
            type="number"
            placeholder="Choose an amount to bet"
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </FormControl>
        <Flex w="100%">
          <Text>Your bets on this faction:</Text>
          <Spacer />
          <Text>
            {currentParticipation
              ? currentParticipation.spendings[faction].toNumber() / 10 ** 9
              : 0}
          </Text>
        </Flex>
        <Flex w="100%">
          <Text>Total bets:</Text>
          <Spacer />
          <Text>
            {currentRound
              ? currentRound.spendings[faction].toNumber() / 10 ** 9
              : 0}
          </Text>
        </Flex>
        <Button isFullWidth colorScheme="green" onClick={handleParticipation}>
          Bet on this faction
        </Button>
      </VStack>
    </Flex>
  );
};

export default FactionCard;
