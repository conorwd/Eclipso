"use client";

// components/BasicList.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { getTokensInWallet, TokenInfo, formatMint, formatTokenAmount } from '../utils/tokenUtils';
import { burnAndCloseTokenAccount } from '../utils/tokenOperations';
import { toast } from 'sonner';
import { PublicKey } from '@solana/web3.js';

const BasicList: React.FC = () => {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokens, setTokens] = useState<TokenInfo[]>([]);

  const fetchTokenBalances = useCallback(async () => {
    if (!publicKey) return;
    setLoading(true);
    setError(null);
    try {
      const tokenBalances = await getTokensInWallet(connection, publicKey);
      setTokens(tokenBalances);
    } catch (err) {
      console.error('Error fetching token balances:', err);
      setError('Failed to fetch token balances. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [publicKey, connection]);

  useEffect(() => {
    fetchTokenBalances();
  }, [fetchTokenBalances]);

  const handleBurnAndClose = async (token: TokenInfo) => {
    if (!publicKey || !signTransaction) {
      toast.error('Wallet not connected');
      return;
    }

    try {
      setLoading(true);
      const signature = await burnAndCloseTokenAccount(
        connection,
        { publicKey, signTransaction },
        token
      );
      toast.success(`Token burned and account closed. Signature: ${signature}`);
      await fetchTokenBalances(); // Refresh the list
    } catch (error) {
      console.error('Error burning and closing token account:', error);
      toast.error('Failed to burn and close token account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-xl overflow-hidden">
      <div className="p-4 flex justify-between items-center bg-gray-700">
        <h2 className="text-xl font-semibold text-white">Token Balances</h2>
        <button 
          onClick={fetchTokenBalances} 
          className="text-gray-400 hover:text-white transition-colors"
          title="Refresh balances"
        >
          <span className={`text-lg ${loading ? 'animate-spin inline-block' : ''}`}>⟳</span>
        </button>
      </div>

      <div className="p-4">
        {loading && <p className="text-center text-gray-400">Loading token balances...</p>}
        
        {error && <p className="text-center text-red-500">{error}</p>}
        
        {!loading && !error && tokens.length === 0 && (
          <p className="text-center text-gray-400">No token accounts found.</p>
        )}
        
        {tokens.length > 0 && (
          <div className="overflow-x-auto custom-scrollbar max-h-[calc(100vh-300px)]">
            <table className="w-full table-auto">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Token</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Balance</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Program</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {tokens.map((token, index) => (
                  <tr key={index}>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">
                      {token.symbol || formatMint(token.mint)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">
                      {formatTokenAmount(token.balance, token.decimals)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">
                      {token.programId === PublicKey.default.toString() ? 'SPL Token' : 'Token-2022'}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleBurnAndClose(token)}
                        disabled={loading}
                        className="px-3 py-1 text-xs font-medium rounded-md shadow-sm bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Burn & Close
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BasicList;