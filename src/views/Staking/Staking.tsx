import React from "react";
import { Box, Flex, Heading, Wrap } from "@chakra-ui/react";

import useJungle from "../../hooks/useJungle";
import TokenCard from "../../components/TokenCard";

const Staking: React.FC = () => {
  const { animals, jungle, stakedAnimals } = useJungle();
  console.log(jungle)
  return (
    <Flex direction="column" w="100%" align="center" p="10px">
      <Box>
        <Heading textAlign="center">Your animals</Heading>
        {animals.length + stakedAnimals.length > 0 ? (
          <Wrap>
            {stakedAnimals.concat(animals).map((e) => (
              <TokenCard key={e.mint.toString()} token={e} />
            ))}
          </Wrap>
        ) : (
          <Heading p="5">You don't have any animals...</Heading>
        )}
      </Box>
    </Flex>
  );
};

export default Staking;
