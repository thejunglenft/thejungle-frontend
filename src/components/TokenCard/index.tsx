import React, { useCallback, useEffect, useState } from "react";
import {
  Flex,
  Box,
  Image,
  Text,
  HStack,
  Button,
  Spacer,
} from "@chakra-ui/react";
import { Animal } from "contexts/Jungle";
import useJungle from "hooks/useJungle";

interface TokenCardProps {
  token: Animal;
  stakable?: boolean;
}

const TokenCard: React.FC<TokenCardProps> = ({ token, stakable }) => {
  const {
    getRarityMultiplier,
    getPendingStakingRewards,
    fetchAnimal,
    stakeAnimal,
    unstakeAnimal,
    claimStakingRewards,
  } = useJungle();

  const [augmentedAnimal, setAugmentedAnimal] = useState<Animal>();
  const [stakingPeriod, setStakingPeriod] = useState<Date>(new Date());

  const fetchAnimalStats = useCallback(async () => {
    setAugmentedAnimal(await fetchAnimal(token.mint));
  }, [token, fetchAnimal]);

  useEffect(() => {
    if (!token.lastClaim) fetchAnimalStats();
  }, [token, fetchAnimalStats]);

  useEffect(() => {
    const interval = setInterval(() => setStakingPeriod(new Date()), 500);
    return () => clearInterval(interval);
  }, [setStakingPeriod]);

  const handleStake = useCallback(async () => {
    if (!augmentedAnimal) return;
    await stakeAnimal(augmentedAnimal);
  }, [augmentedAnimal, stakeAnimal]);

  const handleUnstake = useCallback(async () => {
    if (!augmentedAnimal) return;
    await unstakeAnimal(augmentedAnimal);
  }, [augmentedAnimal, unstakeAnimal]);

  const handleClaim = useCallback(async () => {
    if (!augmentedAnimal) return;
    await claimStakingRewards(augmentedAnimal);
    fetchAnimalStats();
  }, [augmentedAnimal, claimStakingRewards, fetchAnimalStats]);

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
      <Image
        src={token.metadata.image}
        rounded="lg"
        w="280px"
        maxH="400px"
        top="0"
      />
      <Text fontSize="2xl" fontWeight="bold" w="280px" textAlign="center">
        {token.metadata.name}
      </Text>
      <Box p="3" w="100%">
        <Flex w="100%">
          <Text>Rarity multiplier:</Text>
          <Spacer />
          <Text>{getRarityMultiplier(token)}</Text>
        </Flex>
        {augmentedAnimal?.lastClaim && (
          <Flex w="100%">
            <Text>Pending rewards:</Text>
            <Spacer />
            <Text>
              {getPendingStakingRewards(augmentedAnimal, stakingPeriod).toFixed(
                5
              )}
            </Text>
          </Flex>
        )}
        {augmentedAnimal?.lastClaim && stakable ? (
          <HStack>
            <Button isFullWidth colorScheme="blue" onClick={handleUnstake}>
              Unstake
            </Button>
            <Button isFullWidth colorScheme="green" onClick={handleClaim}>
              Claim
            </Button>
          </HStack>
        ) : (
          <Button isFullWidth colorScheme="green" onClick={handleStake}>
            Stake
          </Button>
        )}
      </Box>
    </Flex>
  );
};

export default TokenCard;
