import React, { useMemo } from "react";
import { Box, Button, Divider, Flex, Heading, Wrap } from "@chakra-ui/react";
import { BiRefresh } from "react-icons/bi";

import useJungle from "../../hooks/useJungle";
import TokenCard from "../../components/TokenCard";

const Staking: React.FC = () => {
  const { animals, stakedAnimals, refreshAnimals } = useJungle();

  const filteredStakedAnimals = useMemo(() => {
    return stakedAnimals.filter(a => animals.map(e => e.mint).includes(a.mint))
  }, [animals, stakedAnimals])

  return (
    <Flex direction="column" w="100%" align="center" p="10px">
      <Box>
        <Flex justify="center">
          <Box verticalAlign="center">
            <Heading m="8px" verticalAlign="center" color="white">
              Your animals
            </Heading>
          </Box>
          <Button
            align="center"
            m="3"
            leftIcon={<BiRefresh />}
            onClick={refreshAnimals}
          >
            Refresh
          </Button>
        </Flex>
        {animals.length > 0 ? (
          <Wrap justify="center">
            {animals.map((e) => (
              <TokenCard key={e.mint.toString()} token={e} />
            ))}
          </Wrap>
        ) : (
          <Heading p="5" color="white">
            You don't have any animals...
          </Heading>
        )}
      </Box>
      <Divider my="3" />
      <Box>
        <Flex justify="center">
          <Heading m="8px" verticalAlign="center" color="white">
            Your staked animals
          </Heading>
        </Flex>
        {filteredStakedAnimals.length > 0 ? (
          <Wrap justify="center">
            {filteredStakedAnimals.map((e) => (
              <TokenCard key={e.mint.toString()} token={e} stakable />
            ))}
          </Wrap>
        ) : (
          <Heading p="5" color="white">
            You don't have any staked animals...
          </Heading>
        )}
      </Box>
    </Flex>
  );
};

export default Staking;
