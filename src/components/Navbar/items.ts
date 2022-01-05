import { NavItem } from "./types";

const NAV_ITEMS: Array<NavItem> = [
  {
    label: "Home",
    href: "#/"
  },
  {
    label: "Staking",
    href: "#/staking"
  },
  {
    label: "Lottery",
    href: "#/lottery"
  },
  {
    label: "Resources",
    children: [
      {
        label: "The Jungle Discord",
        subLabel: "SolSteads official Discord server",
        href: "https://discord.gg/tbZe5jyx",
        newTab: true,
      },
    ],
  },
];

export default NAV_ITEMS;
