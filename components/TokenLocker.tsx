// components/TokenLocker.tsx
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useWallet, useConnection, useAnchorWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID, getAssociatedTokenAddress, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';
import * as anchor from '@coral-xyz/anchor';
import idl from '../idl/idl.json';
import { getTokensInWallet, TokenInfo, formatTokenAmount } from '../utils/tokenUtils';
import SuccessModal from './SuccessModal';

const PROGRAM_ID = new PublicKey('32PQqCRLgmuuoKS3Rna1kdDeB6NgAEtK82Bd9115CH4R');

const TokenLocker: React.FC = () => {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [selectedToken, setSelectedToken] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [unlockDate, setUnlockDate] = useState('');
  const [beneficiaryAddress, setBeneficiaryAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{
    tokenMint: string;
    amount: string;
    beneficiary: string;
    unlockDate: string;
    txId: string;
  } | null>(null);

  const program = useMemo(() => {
    if (!anchorWallet) return null;
    const provider = new anchor.AnchorProvider(
      connection,
      anchorWallet,
      { commitment: 'confirmed' }
    );
    return new anchor.Program(idl as anchor.Idl, PROGRAM_ID, provider);
  }, [connection, anchorWallet]);

  const fetchTokens = useCallback(async () => {
    if (publicKey) {
      try {
        const userTokens = await getTokensInWallet(connection, publicKey);
        setTokens(userTokens);
        if (userTokens.length > 0) {
          setSelectedToken(userTokens[0].mint);
        }
      } catch (error) {
        console.error('Error fetching tokens:', error);
        setError('Error fetching tokens from wallet');
      }
    }
  }, [publicKey, connection]);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  const selectedTokenInfo = useMemo(() => {
    return tokens.find(token => token.mint === selectedToken);
  }, [tokens, selectedToken]);

  const initializeVesting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey || !program || !selectedToken) {
      setError('Wallet not connected, program not initialized, or no token selected');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const mintPubkey = new PublicKey(selectedToken);
      const beneficiaryPubkey = new PublicKey(beneficiaryAddress);
      const unlockTimestamp = new anchor.BN(Math.floor(new Date(unlockDate).getTime() / 1000));
      const amountBN = new anchor.BN(parseFloat(amount) * Math.pow(10, selectedTokenInfo?.decimals || 9));

      const [vestingAccount] = PublicKey.findProgramAddressSync(
        [beneficiaryPubkey.toBuffer(), unlockTimestamp.toArrayLike(Buffer, 'le', 8)],
        program.programId
      );

      const tokenProgramId = selectedTokenInfo?.programId === TOKEN_2022_PROGRAM_ID.toString()
        ? TOKEN_2022_PROGRAM_ID
        : TOKEN_PROGRAM_ID;

      const vestingToken = await getAssociatedTokenAddress(mintPubkey, vestingAccount, true, tokenProgramId);
      const sourceTokenAccount = await getAssociatedTokenAddress(mintPubkey, publicKey, false, tokenProgramId);

      const tx = await program.methods
        .initialize(unlockTimestamp, amountBN)
        .accounts({
          vestingAccount: vestingAccount,
          mint: mintPubkey,
          vestingToken: vestingToken,
          beneficiary: beneficiaryPubkey,
          sourceToken: sourceTokenAccount,
          payer: publicKey,
          systemProgram: SystemProgram.programId,
          tokenProgram: tokenProgramId,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .transaction();

      const latestBlockhash = await connection.getLatestBlockhash();
      tx.recentBlockhash = latestBlockhash.blockhash;
      tx.feePayer = publicKey;

      const txId = await sendTransaction(tx, connection);
      
      const confirmation = await connection.confirmTransaction({
        signature: txId,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
      });

      if (confirmation.value.err) {
        throw new Error('Transaction failed to confirm');
      }

      setSuccessInfo({
        tokenMint: selectedToken,
        amount: amount,
        beneficiary: beneficiaryAddress,
        unlockDate: new Date(unlockDate).toLocaleString(),
        txId: txId,
      });
      setSuccessModalOpen(true);
    } catch (error) {
      console.error('Error initializing vesting:', error);
      if (error instanceof Error) {
        setError(`Error: ${error.message}`);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-xl overflow-hidden">
      <form onSubmit={initializeVesting} className="p-6 space-y-6">
        <div>
          <label htmlFor="tokenSelect" className="block text-sm font-medium text-gray-300 mb-2">
            Select Token
          </label>
          <div className="relative">
            <select
              id="tokenSelect"
              value={selectedToken}
              onChange={(e) => setSelectedToken(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-600 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm appearance-none"
              required
            >
              <option value="">Select a token</option>
              {tokens.map((token) => (
                <option key={token.mint} value={token.mint}>
                  {token.symbol}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <svg className="h-4 w-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
        </div>
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">
            Amount
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-grow rounded-l-md border-gray-600 bg-gray-700 text-white focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 sm:text-sm"
              required
            />
            <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-600 bg-gray-600 text-gray-300 text-sm">
              Balance: {selectedTokenInfo ? formatTokenAmount(selectedTokenInfo.balance, selectedTokenInfo.decimals) : '0'}
            </span>
          </div>
        </div>
        <div>
          <label htmlFor="unlockDate" className="block text-sm font-medium text-gray-300 mb-2">
            Unlock Date
          </label>
          <input
            type="datetime-local"
            id="unlockDate"
            value={unlockDate}
            onChange={(e) => setUnlockDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 sm:text-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="beneficiaryAddress" className="block text-sm font-medium text-gray-300 mb-2">
            Beneficiary Wallet Address
          </label>
          <input
            type="text"
            id="beneficiaryAddress"
            value={beneficiaryAddress}
            onChange={(e) => setBeneficiaryAddress(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 sm:text-sm"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Creating Lock...' : 'Create Lock'}
        </button>
        </form>
      {error && (
        <div className="mt-4 p-4 bg-red-900 rounded-b-lg">
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}
      {successInfo && (
        <SuccessModal
          isOpen={successModalOpen}
          onClose={() => setSuccessModalOpen(false)}
          tokenMint={successInfo.tokenMint}
          amount={successInfo.amount}
          beneficiary={successInfo.beneficiary}
          unlockDate={successInfo.unlockDate}
          txId={successInfo.txId}
        />
      )}
    </div>
  );
};

export default TokenLocker;