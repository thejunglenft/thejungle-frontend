import { Button, Tag, TagLabel } from "@chakra-ui/react";
import { useDisclosure } from "@chakra-ui/hooks";
import { useWallet } from "@solana/wallet-adapter-react";
import WalletModal from "../../components/WalletModal";
import { useEffect } from "react";
import { shortAddress } from "utils";

import useCollection from "../../hooks/useJungle";
import constants from "../../constants";

const WalletButton: React.FC = () => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { connected, publicKey, disconnect } = useWallet();
  const { userAccount } = useCollection();

  useEffect(() => {
    if (connected) {
      onClose();
    }
  }, [connected, onClose]);

  return (
    <>
      <WalletModal isOpen={isOpen} onClose={onClose} />
      {connected ? (
        <>
          {userAccount && (
            <Tag size="lg" variant="subtle" colorScheme="cyan">
              <TagLabel>
                {(userAccount.amount.toNumber() / 10 ** 9).toFixed(2)} ${constants.ticker}
              </TagLabel>
            </Tag>
          )}
          <Button onClick={disconnect}>
            {shortAddress(publicKey?.toString())}
          </Button>
        </>
      ) : (
        <Button onClick={onOpen}>Connect</Button>
      )}
    </>
  );
};

export default WalletButton;
