import React, { useCallback, useMemo } from "react";
import { Route, HashRouter as Router, Routes } from "react-router-dom";
import { ChakraProvider, useToast } from "@chakra-ui/react";
import { WalletAdapterNetwork, WalletError } from "@solana/wallet-adapter-base";
import { WalletKitProvider } from "@gokiprotocol/walletkit";
import { ModalStep } from "@gokiprotocol/walletkit/dist/cjs/components/WalletSelectorModal";
import { WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  getLedgerWallet,
  getPhantomWallet,
  getSlopeWallet,
  getSolflareWallet,
  getSolletExtensionWallet,
  getSolletWallet,
  getTorusWallet,
} from "@solana/wallet-adapter-wallets";

import Navbar from "./components/Navbar";
import Home from "./views/Home";
import { JungleProvider } from "contexts/Jungle";
import Staking from "views/Staking";
import constants from "./constants";
import { clusterApiUrl } from "@solana/web3.js";
import Lottery from "views/Lottery";
import { LotteryProvider } from "contexts/Lottery";
import Admin from "views/Admin";

const WalletProviders: React.FC = ({ children }) => {
  const network = constants.mainnet
    ? WalletAdapterNetwork.Mainnet
    : WalletAdapterNetwork.Devnet;

  const devnetEnpoint = useMemo(() => clusterApiUrl(network), [network]);
  // const endpoint = constants.mainnet
  //   ? "https://connect.runnode.com/?apikey=" +
  //     process.env.REACT_APP_RUN_NODE_API_KEY
  //   : devnetEnpoint;
  const endpoint = devnetEnpoint
  const toast = useToast();

  const wallets = useMemo(
    () => [
      getPhantomWallet(),
      getSlopeWallet(),
      getSolflareWallet(),
      getTorusWallet({
        options: { clientId: "Get a client ID @ https://developer.tor.us" },
      }),
      getLedgerWallet(),
      getSolletWallet({ network }),
      getSolletExtensionWallet({ network }),
    ],
    [network]
  );

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
      initialStep={ModalStep.Select}
      defaultNetwork={network}
      networkConfigs={{
        "mainnet-beta": { name: "RunNode", endpoint: endpoint }
      }}
      commitment="confirmed"
    >
      <WalletProvider wallets={wallets} onError={onError}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
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
