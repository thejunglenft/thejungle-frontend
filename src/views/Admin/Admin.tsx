import React, { useCallback, useState } from "react";
import {
  Button,
  Container,
  Input,
} from "@chakra-ui/react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import useLottery from "hooks/useLottery";
import { SystemProgram, Transaction } from "@solana/web3.js";

const Admin: React.FC = () => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const { lottery } = useLottery();
  const [amount, setAmount] = useState<number>(0);

  const handleSend = useCallback(() => {
    if (!lottery || !wallet.publicKey) return;
    wallet.sendTransaction(
      new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: lottery.escrow,
          lamports: amount,
        })
      ),
      connection
    );
  }, [connection, wallet, lottery, amount]);

  const handleChange = useCallback((n: number) => {
    setAmount(n * 10**9)
  }, [setAmount]);

  return (
    <Container maxW={"5xl"}>
      <Input type="number" onChange={e => handleChange(Number(e.target.value))}/>
      <Button onClick={handleSend} disabled={amount === 0}>
        Send SOL
      </Button>
    </Container>
  );
};

export default Admin;
