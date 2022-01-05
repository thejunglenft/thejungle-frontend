import {
  VStack,
  Image,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Spinner,
} from "@chakra-ui/react";
import { useWallet } from "@solana/wallet-adapter-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose
}) => {
  const wallet = useWallet();

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent maxW="350px">
        <ModalHeader>Confirming transaction...</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing="8px" my={2}>
            <Image src={wallet.wallet?.icon} w="100%" h="100%" />
            <Spinner size="xl" thickness={"8px"} />
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ConfirmationModal;
