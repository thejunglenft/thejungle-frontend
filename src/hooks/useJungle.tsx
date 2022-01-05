import { useContext } from "react";

import { JungleContext } from "../contexts/Jungle";

const useJungle = () => {
  return {
    ...useContext(JungleContext),
  };
};

export default useJungle;
