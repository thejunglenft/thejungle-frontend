import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Image,
  VStack,
} from "@chakra-ui/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletName } from "@solana/wallet-adapter-wallets";
import { useCallback } from "react";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const wallet = useWallet();

  const handleChooseWallet = useCallback(
    (walletName: WalletName) => {
      wallet.select(walletName);
      wallet.adapter?.connect()
    },
    [wallet]
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Connect a wallet</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing="8px" my={2}>
            {wallet.wallets.map((wallet) => (
              <Button
                key={wallet.name}
                width="100%"
                py={2}
                leftIcon={
                  <Image src={wallet.icon} alt={wallet.name} width={8} />
                }
                onClick={() => handleChooseWallet(wallet.name)}
              >
                {wallet.name}
              </Button>
            ))}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default WalletModal;
