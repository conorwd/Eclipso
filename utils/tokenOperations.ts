// utils/tokenOperations.ts

import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  createBurnCheckedInstruction,
  createCloseAccountInstruction,
  getAssociatedTokenAddress,
  getAccount,
  getMint,
} from '@solana/spl-token';
import { TokenInfo } from './tokenUtils';

export async function burnAndCloseTokenAccount(
  connection: Connection,
  wallet: {
    publicKey: PublicKey;
    signTransaction: (transaction: Transaction) => Promise<Transaction>;
  },
  tokenInfo: TokenInfo
): Promise<string> {
  const mintPubkey = new PublicKey(tokenInfo.mint);
  const tokenProgramId = new PublicKey(tokenInfo.programId);

  const tokenAccount = await getAssociatedTokenAddress(
    mintPubkey,
    wallet.publicKey,
    true,
    tokenProgramId
  );

  const transaction = new Transaction();

  // Fetch the token account info to get the most up-to-date balance
  const tokenAccountInfo = await getAccount(connection, tokenAccount, 'confirmed', tokenProgramId);
  const mintInfo = await getMint(connection, mintPubkey, 'confirmed', tokenProgramId);

  // Only burn if there's a balance
  if (tokenAccountInfo.amount > BigInt(0)) {
    transaction.add(
      createBurnCheckedInstruction(
        tokenAccount,
        mintPubkey,
        wallet.publicKey,
        tokenAccountInfo.amount,
        mintInfo.decimals,
        [],
        tokenProgramId
      )
    );
  }

  // Close the account
  transaction.add(
    createCloseAccountInstruction(
      tokenAccount,
      wallet.publicKey,
      wallet.publicKey,
      [],
      tokenProgramId
    )
  );

  try {
    const latestBlockhash = await connection.getLatestBlockhash();
    transaction.recentBlockhash = latestBlockhash.blockhash;
    transaction.feePayer = wallet.publicKey;

    const signedTransaction = await wallet.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signedTransaction.serialize());
    await connection.confirmTransaction({
      signature,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    });
    return signature;
  } catch (error) {
    console.error('Error burning and closing token account:', error);
    throw error;
  }
}