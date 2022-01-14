import React from "react";
import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  Link,
  Text,
  Wrap,
} from "@chakra-ui/react";
import { BiRefresh } from "react-icons/bi";

import useJungle from "../../hooks/useJungle";
import TokenCard from "../../components/TokenCard";

const Staking: React.FC = () => {
  const { animals, stakedAnimals, refreshAnimals } = useJungle();

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
        <Flex
          justify="center"
          background="blue.100"
          border="2px"
          borderColor="blue.200"
          rounded="lg"
          m="2"
          p="2"
        >
          <Text mr="1">Can't stake an animal? Migrate it using</Text>
          <Link href="https://raydium.io/migrate/" target="_blank">
            <b>Raydium's migration tool</b>
          </Link>
        </Flex>
        {animals.filter((e) => !e.lastClaim).length > 0 ? (
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
        {stakedAnimals.length > 0 ? (
          <Wrap justify="center">
            {stakedAnimals.map((e) => (
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
