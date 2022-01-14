import React, { useCallback } from "react";
import { Route, HashRouter as Router, Routes } from "react-router-dom";
import { ChakraProvider, useToast } from "@chakra-ui/react";
import { WalletAdapterNetwork, WalletError } from "@solana/wallet-adapter-base";
import { WalletKitProvider } from "@gokiprotocol/walletkit";

import Navbar from "./components/Navbar";
import Home from "./views/Home";
import { JungleProvider } from "contexts/Jungle";
import Staking from "views/Staking";
import constants from "./constants";
// import { clusterApiUrl } from "@solana/web3.js";
import Lottery from "views/Lottery";
import { LotteryProvider } from "contexts/Lottery";
import Admin from "views/Admin";

const WalletProviders: React.FC = ({ children }) => {
  const network = constants.mainnet
    ? WalletAdapterNetwork.Mainnet
    : WalletAdapterNetwork.Devnet;

  // const devnetEnpoint = useMemo(() => clusterApiUrl(network), [network]);
  // const endpoint = constants.mainnet
  //   ? "https://connect.runnode.com/?apikey=" +
  //     process.env.REACT_APP_RUN_NODE_API_KEY
  //   : devnetEnpoint;
  const endpoint = "https://ssc-dao.genesysgo.net";
  const toast = useToast();

  const onError = useCallback(
    (error: WalletError) =>
      toast({
        title: "Error",
        description: error.message
          ? `${error.name}: ${error.message}`
          : error.name,
        status: "error",
        duration: 5000,
        isClosable: true,
      }),
    [toast]
  );

  return (
    <WalletKitProvider
      app={{
        name: "The Jungle",
      }}
      networkConfigs={{
        "mainnet-beta": { name: "Mainnet Beta", endpoint: endpoint },
      }}
      defaultNetwork={network}
      commitment="confirmed"
      onError={(e) => onError(new WalletError(e.message, e))}
    >
      {children}
    </WalletKitProvider>
  );
};

const Providers: React.FC = ({ children }) => {
  return (
    <ChakraProvider>
      <WalletProviders>
        <JungleProvider>
          <LotteryProvider>{children}</LotteryProvider>
        </JungleProvider>
      </WalletProviders>
    </ChakraProvider>
  );
};

function App() {
  return (
    <Providers>
      <Router>
        <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/staking" element={<Staking />} />
            <Route path="/lottery" element={<Lottery />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
      </Router>
    </Providers>
  );
}

export default App;
