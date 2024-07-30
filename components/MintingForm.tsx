// components/MintingForm.tsx
import React, { useState, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Keypair, Transaction, PublicKey } from '@solana/web3.js';
import { createToken2022WithMetadata, MintParams, TokenMetadata, createMintTokensTransaction } from '../utils/MintingUtils';
import { toast } from 'sonner';

const MintingForm: React.FC = () => {
  const { connection } = useConnection();
  const wallet = useWallet();

  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokenDescription, setTokenDescription] = useState('');
  const [tokenImage, setTokenImage] = useState('');
  const [decimals, setDecimals] = useState(9);
  const [loading, setLoading] = useState(false);
  const [mintAddress, setMintAddress] = useState('');

  const [mintAmount, setMintAmount] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');

  const handleMint = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet.publicKey || !wallet.signTransaction) {
      toast.error('Please connect your wallet');
      return;
    }

    setLoading(true);
    try {
      const mintKeypair = Keypair.generate();
      console.log("Generated mint keypair:", mintKeypair.publicKey.toBase58());
      
      const metadata: TokenMetadata = {
        name: tokenName,
        symbol: tokenSymbol,
        uri: JSON.stringify({
          name: tokenName,
          symbol: tokenSymbol,
          description: tokenDescription,
          image: tokenImage,
        }),
      };

      const mintParams: MintParams = {
        connection,
        payer: wallet.publicKey,
        mintKeypair,
        decimals,
        mintAuthority: wallet.publicKey,
        freezeAuthority: null,
        metadata,
      };

      const transaction = await createToken2022WithMetadata(mintParams);

      const latestBlockhash = await connection.getLatestBlockhash();
      transaction.recentBlockhash = latestBlockhash.blockhash;
      transaction.feePayer = wallet.publicKey;

      transaction.partialSign(mintKeypair);
      const signedTransaction = await wallet.signTransaction(transaction);

      const signature = await connection.sendRawTransaction(signedTransaction.serialize());

      await connection.confirmTransaction({
        signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      });

      setMintAddress(mintKeypair.publicKey.toBase58());
      toast.success(`Token minted successfully! Signature: ${signature}`);
    } catch (error) {
      console.error('Error minting token:', error);
      if (error instanceof Error) {
        toast.error(`Error minting token: ${error.message}`);
      } else {
        toast.error('An unknown error occurred while minting the token');
      }
    } finally {
      setLoading(false);
    }
  }, [connection, wallet, tokenName, tokenSymbol, tokenDescription, tokenImage, decimals]);

  const handleMintTokens = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet.publicKey || !wallet.signTransaction || !mintAddress) {
      toast.error('Please connect your wallet and create a token first');
      return;
    }

    setLoading(true);
    try {
      const mintPubkey = new PublicKey(mintAddress);
      const destinationPubkey = new PublicKey(destinationAddress);
      const amount = parseFloat(mintAmount);

      const transaction = await createMintTokensTransaction({
        connection,
        payer: wallet.publicKey,
        mint: mintPubkey,
        destination: destinationPubkey,
        mintAuthority: wallet.publicKey,
        amount,
        decimals,
      });

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

      toast.success(`Tokens minted successfully! Signature: ${signature}`);
    } catch (error) {
      console.error('Error minting tokens:', error);
      if (error instanceof Error) {
        toast.error(`Error minting tokens: ${error.message}`);
      } else {
        toast.error('An unknown error occurred while minting tokens');
      }
    } finally {
      setLoading(false);
    }
  }, [connection, wallet, mintAddress, destinationAddress, mintAmount, decimals]);

  return (
    <div className="w-full max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-xl overflow-hidden">
      <div className="p-4 bg-gray-700">
        <h2 className="text-xl font-semibold text-white">
          {!mintAddress ? 'Create Token' : 'Mint Tokens'}
        </h2>
      </div>
      <div className="p-4">
        {!mintAddress ? (
          <form onSubmit={handleMint} className="space-y-4">
            <div>
              <label htmlFor="tokenName" className="block text-sm font-medium text-gray-300">Token Name</label>
              <input
                type="text"
                id="tokenName"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label htmlFor="tokenSymbol" className="block text-sm font-medium text-gray-300">Token Symbol</label>
              <input
                type="text"
                id="tokenSymbol"
                value={tokenSymbol}
                onChange={(e) => setTokenSymbol(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label htmlFor="tokenDescription" className="block text-sm font-medium text-gray-300">Token Description</label>
              <textarea
                id="tokenDescription"
                value={tokenDescription}
                onChange={(e) => setTokenDescription(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label htmlFor="tokenImage" className="block text-sm font-medium text-gray-300">Token Image URL</label>
              <input
                type="url"
                id="tokenImage"
                value={tokenImage}
                onChange={(e) => setTokenImage(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label htmlFor="decimals" className="block text-sm font-medium text-gray-300">Decimals</label>
              <input
                type="number"
                id="decimals"
                value={decimals}
                onChange={(e) => setDecimals(Number(e.target.value))}
                min="0"
                max="9"
                required
                className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !wallet.publicKey}
              className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                (loading || !wallet.publicKey) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Creating Token...' : 'Create Token'}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-white">Token Info</h3>
              <p className="text-sm text-gray-300">Mint Address: {mintAddress}</p>
            </div>
            <form onSubmit={handleMintTokens} className="space-y-4">
              <div>
                <label htmlFor="destinationAddress" className="block text-sm font-medium text-gray-300">Destination Address</label>
                <input
                  type="text"
                  id="destinationAddress"
                  value={destinationAddress}
                  onChange={(e) => setDestinationAddress(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label htmlFor="mintAmount" className="block text-sm font-medium text-gray-300">Amount to Mint</label>
                <input
                  type="number"
                  id="mintAmount"
                  value={mintAmount}
                  onChange={(e) => setMintAmount(e.target.value)}
                  required
                  min="0"
                  step="any"
                  className="mt-1 block w-full rounded-md border-gray-600 bg-gray-700 text-white shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !wallet.publicKey}
                className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  (loading || !wallet.publicKey) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Minting Tokens...' : 'Mint Tokens'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default MintingForm;