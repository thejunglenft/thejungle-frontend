import {
  Box,
  Flex,
  IconButton,
  Stack,
  Collapse,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon, createIcon } from "@chakra-ui/icons";

import DesktopNav from "./DesktopNav";
import MobileNav from "./MobileNav";

import WalletButton from "./WalletButton";

const Logo = createIcon({
  displayName: "Logo",
  viewBox: "0 0 538.27 742.48",
  path: (
    <path
      fill="currentColor"
      d="M741.65,815.19H711.52v-206H704V549.3h10.3V529.38h-2.76L680.24,397.64V360.25l20-.87v4.4l32.15-1.41s-10.35-2.64-8-4.46c5.4-4.25,12-3.54,4.92-3.86-2-.09-11.41-.37-19-.59a6.4,6.4,0,0,0-1.89-2.89c-2.25-1.58-23.64-1-28.16-.91v-4h-1.77v52L647.21,529.38h-2.76V549.3h10.28v41.59h-6.9v18.34h-6.42V590.89h-7.25v18.34h-8.49V590.89H618.4v18.34h-1.23v-72h7.09V523.46h-1.9l-21.57-90.87v-25.8l13.79-.61v3l22.18-1s-7.14-1.81-5.55-3.08c3.73-2.92,8.28-2.44,3.4-2.66-1.39-.06-7.88-.25-13.1-.41a4.29,4.29,0,0,0-1.29-2c-1.57-1.09-16.3-.72-19.43-.63v-2.75h-1.23v35.86l-13.93,58.76-58.09-145-20.77,51.86L464.89,221.63V164.2l30.69-1.35v6.77l49.4-2.17s-15.91-4-12.35-6.85c8.29-6.52,18.43-5.44,7.57-5.92-3.09-.14-17.51-.57-29.14-.91a9.43,9.43,0,0,0-2.93-4.44c-3.45-2.42-36.17-1.61-43.24-1.41v-6.13h-2.72v79.84L419.6,401,397.68,346.3,346,475.44,335.8,432.59v-25.8l13.78-.61v3l22.18-1s-7.14-1.81-5.54-3.08c3.72-2.92,8.28-2.44,3.4-2.66-1.39-.06-7.88-.25-13.1-.41a4.21,4.21,0,0,0-1.29-2c-1.56-1.09-16.31-.72-19.43-.63v-2.75h-1.23v35.86L313,523.46H311.1V537.2h6.82v19.47h.29v52.56h-3.16V590.89H307.8v18.34h-6.41V590.89h-7.26v18.34h-8.5V549.3h10.29V529.38h-2.76L261.9,397.64V360.25l20-.87v4.4L314,362.37s-10.35-2.64-8-4.46c5.39-4.25,12-3.54,4.91-3.86-2-.09-11.4-.37-19-.59a6.23,6.23,0,0,0-1.88-2.89c-2.26-1.58-23.64-1-28.15-.91v-4h-1.78v52L228.87,529.38h-2.78V549.3h10.3v59.93h-10.3v206H203.38v69.08H741.65Z"
      transform="translate(-203.38 -141.79)"
    />
  ),
});

export default function WithSubnavigation() {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Box>
      <Flex
        bg={useColorModeValue("white", "gray.800")}
        color={useColorModeValue("gray.600", "white")}
        minH={"60px"}
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle={"solid"}
        borderColor={useColorModeValue("gray.200", "gray.900")}
        align={"center"}
      >
        <Flex
          flex={{ base: 1, md: "auto" }}
          ml={{ base: -2 }}
          display={{ base: "flex", md: "none" }}
        >
          <IconButton
            onClick={onToggle}
            icon={
              isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />
            }
            variant={"ghost"}
            aria-label={"Toggle Navigation"}
          />
        </Flex>
        <Flex flex={{ base: 1 }} justify={{ base: "center", md: "start" }}>
          <Logo boxSize={8} color={useColorModeValue("gray.600", "white")} />

          <Flex display={{ base: "none", md: "flex" }} ml={10}>
            <DesktopNav />
          </Flex>
        </Flex>

        <Stack
          flex={{ base: 1, md: 0 }}
          justify={"flex-end"}
          direction={"row"}
          spacing={6}
        >
          <WalletButton />
        </Stack>
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <MobileNav />
      </Collapse>
    </Box>
  );
}
