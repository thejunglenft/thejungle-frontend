import React from "react";
import { Box, Button, Container, Image, Stack, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";

import hero from "../../assets/the_jungle.png";

const Home: React.FC = () => {
  return (
    <Container maxW={"5xl"}>
      <Stack
        textAlign={"center"}
        align={"center"}
        spacing={{ base: 8, md: 10 }}
      >
        <Image src={hero} />
        <Box background="gray.100" p="3" rounded="xl">
          <Text color={"gray.900"} fontSize={"xl"}>
            The Jungle is a collection of 1,555 pixel animals living on Solana
            blockchain. <br />
            With over 50 unique characters belonging to 8 factions, our aim is
            to bring together the many DAOs in the Solana eco-system through
            co-operation, competition, staking rewards and striving to make a
            positive change in the world.
          </Text>
        </Box>
        <Stack spacing={6} direction={"row"}>
          <Button
            as={Link}
            to="staking"
            rounded={"full"}
            px={6}
            colorScheme={"blue"}
            bg={"blue.400"}
            _hover={{ bg: "blue.500" }}
          >
            Get started staking
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
};

export default Home;
