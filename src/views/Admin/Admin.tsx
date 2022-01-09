import React, { useCallback, useState } from "react";
import { Button, Container, Input } from "@chakra-ui/react";
import useLottery from "hooks/useLottery";
import { SystemProgram, Transaction } from "@solana/web3.js";
import { useConnectedWallet, useSolana } from "@saberhq/use-solana";
import { web3 } from "@project-serum/anchor";

const Admin: React.FC = () => {
  const { connection } = useSolana();
  const wallet = useConnectedWallet();
  const { lottery } = useLottery();
  const [amount, setAmount] = useState<number>(0);

  const handleSend = useCallback(async () => {
    if (!lottery || !wallet) return;
    const signed = await wallet.signTransaction(
      new Transaction({
        recentBlockhash: (await connection.getRecentBlockhash()).blockhash,
        feePayer: wallet.publicKey,
      }).add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: lottery.escrow,
          lamports: amount,
        })
      )
    );
    await web3.sendAndConfirmRawTransaction(
      connection,
      signed.serialize()
    );
  }, [connection, wallet, lottery, amount]);

  const handleChange = useCallback(
    (n: number) => {
      setAmount(n * 10 ** 9);
    },
    [setAmount]
  );

  return (
    <Container maxW={"5xl"}>
      <Input
        type="number"
        onChange={(e) => handleChange(Number(e.target.value))}
      />
      <Button onClick={handleSend} disabled={amount === 0}>
        Send SOL
      </Button>
    </Container>
  );
};

export default Admin;
