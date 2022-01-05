import React, { useState } from "react";
import {
  Button,
  Flex,
  Heading,
  Container,
  Image,
  Stack,
  Text,
  SkeletonCircle,
} from "@chakra-ui/react";

import { Link } from "react-router-dom";

const Home: React.FC = () => {
  const [currentImage] = useState<string>();

  return (
    <Container maxW={"5xl"}>
      <Stack
        textAlign={"center"}
        align={"center"}
        spacing={{ base: 8, md: 10 }}
        py={{ base: 20, md: 28 }}
      >
        <Heading
          fontWeight={600}
          fontSize={{ base: "3xl", sm: "4xl", md: "6xl" }}
          lineHeight={"110%"}
        >
          Lorem{" "}
          <Text as={"span"} color={"blue.400"}>
            Ipsum
          </Text>
        </Heading>
        <Text color={"gray.500"} maxW={"3xl"}>
          Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
          nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
          sed diam voluptua. At vero eos et accusam et justo duo dolores et ea
          rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem
          ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur
          sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et
          dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam
          et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea
          takimata sanctus est Lorem ipsum dolor sit amet.
        </Text>
        <Stack spacing={6} direction={"row"}>
          <Button
            as={Link}
            to="leaderboard"
            rounded={"full"}
            px={6}
            colorScheme={"blue"}
            bg={"blue.400"}
            _hover={{ bg: "blue.500" }}
          >
            Get started
          </Button>
        </Stack>
        <Flex w={"full"} justify="center">
          {currentImage ? (
            <Image src={currentImage} maxW="300px" rounded="full" />
          ) : (
            <SkeletonCircle size="300px" />
          )}
        </Flex>
      </Stack>
    </Container>
  );
};

export default Home;
