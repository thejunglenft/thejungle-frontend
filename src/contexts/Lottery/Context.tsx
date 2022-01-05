import { createContext } from "react";

import { ContextValues } from "./types";

const Context = createContext<ContextValues>({
  userParticipations: [],
  fetchRound: () => new Promise(() => {}),
  newLotteryRound: () => new Promise(() => {}),
  participate: () => new Promise(() => {}),
  claimParticipation: () => new Promise(() => {}),
});

export default Context;
