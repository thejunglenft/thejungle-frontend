import { useContext } from "react";

import { LotteryContext } from "../contexts/Lottery";

const useLottery = () => {
  return {
    ...useContext(LotteryContext),
  };
};

export default useLottery;
