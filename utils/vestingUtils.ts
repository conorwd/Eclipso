// utils/vestingUtils.ts

import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import idl from '../idl/idl.json';
import { getTokenInfo, formatTokenAmount } from './tokenUtils';

const PROGRAM_ID = new PublicKey('32PQqCRLgmuuoKS3Rna1kdDeB6NgAEtK82Bd9115CH4R');

export interface VestingAccountInfo {
  vestingAccount: PublicKey;
  beneficiary: PublicKey;
  mintAddress: PublicKey;
  unlockTimestamp: string;
  amount: string;
  isUnlocked: boolean;
  isClaimable: boolean;
  tokenInfo?: {
    symbol: string;
    decimals: number;
    programId: string;
  };
}

export async function getVestingAccounts(connection: Connection, beneficiary: PublicKey): Promise<VestingAccountInfo[]> {
  const provider = new anchor.AnchorProvider(
    connection,
    {} as anchor.Wallet,
    { commitment: 'confirmed' }
  );
  const program = new anchor.Program(idl as anchor.Idl, PROGRAM_ID, provider);

  const vestingAccounts = await program.account.vestingAccount.all([
    {
      memcmp: {
        offset: 8 + 1,
        bytes: beneficiary.toBase58(),
      },
    },
  ]);

  const currentTimestamp = Math.floor(Date.now() / 1000);

  const accountsWithTokenInfo = await Promise.all(vestingAccounts.map(async (account) => {
    const accountData = account.account as any;
    const tokenInfo = await getTokenInfo(connection, accountData.mintAddress.toString(), accountData.mintAddress);
    const unlockTimestamp = accountData.unlockTimestamp.toNumber();
    const isClaimable = !accountData.isUnlocked && unlockTimestamp <= currentTimestamp;

    return {
      vestingAccount: account.publicKey,
      beneficiary: accountData.beneficiary,
      mintAddress: accountData.mintAddress,
      unlockTimestamp: new Date(unlockTimestamp * 1000).toISOString(),
      amount: accountData.amount.toString(),
      isUnlocked: accountData.isUnlocked,
      isClaimable,
      tokenInfo: {
        symbol: tokenInfo.symbol,
        decimals: tokenInfo.decimals,
        programId: tokenInfo.programId,
      },
    };
  }));

  return accountsWithTokenInfo;
}

export async function unlockVesting(
  connection: Connection,
  wallet: anchor.Wallet,
  vestingAccountInfo: VestingAccountInfo
) {
  const provider = new anchor.AnchorProvider(connection, wallet, {
    commitment: 'confirmed',
  });
  const program = new anchor.Program(idl as anchor.Idl, PROGRAM_ID, provider);

  try {
    const unlockTimestamp = new anchor.BN(new Date(vestingAccountInfo.unlockTimestamp).getTime() / 1000);

    const [vestingAccount] = PublicKey.findProgramAddressSync(
      [
        vestingAccountInfo.beneficiary.toBuffer(),
        unlockTimestamp.toArrayLike(Buffer, 'le', 8)
      ],
      program.programId
    );

    if (!vestingAccount.equals(vestingAccountInfo.vestingAccount)) {
      throw new Error('Recreated vesting account PDA does not match the provided pubkey');
    }

    const tokenProgramId = new PublicKey(vestingAccountInfo.tokenInfo?.programId || TOKEN_PROGRAM_ID.toString());
    const vestingToken = await getAssociatedTokenAddress(vestingAccountInfo.mintAddress, vestingAccount, true, tokenProgramId);
    const beneficiaryToken = await getAssociatedTokenAddress(vestingAccountInfo.mintAddress, vestingAccountInfo.beneficiary, false, tokenProgramId);

    const tx = await program.methods
      .unlock()
      .accounts({
        vestingAccount: vestingAccount,
        mint: vestingAccountInfo.mintAddress,
        vestingToken: vestingToken,
        beneficiaryToken: beneficiaryToken,
        beneficiary: vestingAccountInfo.beneficiary,
        tokenProgram: tokenProgramId,
      })
      .transaction();

    const latestBlockhash = await connection.getLatestBlockhash();
    tx.recentBlockhash = latestBlockhash.blockhash;
    tx.feePayer = wallet.publicKey;

    const signedTx = await wallet.signTransaction(tx);
    const txId = await connection.sendRawTransaction(signedTx.serialize());

    await connection.confirmTransaction({
      signature: txId,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    });

    return txId;
  } catch (error) {
    console.error('Unlock vesting failed:', error);
    throw error;
  }
}

export function formatUnlockDate(timestamp: string): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatAmount(amount: string, decimals: number): string {
  return formatTokenAmount(amount, decimals);
}