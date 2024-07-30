// components/TokenUnlocker.tsx

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { getVestingAccounts, VestingAccountInfo, formatUnlockDate, formatAmount, unlockVesting } from '../utils/vestingUtils';
import { formatMint } from '../utils/tokenUtils';

const TokenUnlocker: React.FC = () => {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [vestingAccounts, setVestingAccounts] = useState<VestingAccountInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [claimingAccount, setClaimingAccount] = useState<string | null>(null);
  const [showClaimed, setShowClaimed] = useState(false);

  const filteredAccounts = useMemo(() => {
    return vestingAccounts.filter(account => account.isUnlocked === showClaimed);
  }, [vestingAccounts, showClaimed]);

  const fetchVestingAccounts = useCallback(() => {
    if (!publicKey) return;
    setLoading(true);
    setError(null);
    getVestingAccounts(connection, publicKey)
      .then(accounts => {
        setVestingAccounts(accounts);
        localStorage.setItem('cachedVestingAccounts', JSON.stringify(accounts));
      })
      .catch(err => {
        console.error('Error fetching vesting accounts:', err);
        setError('Failed to fetch vesting accounts. Please try again.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [publicKey, connection]);

  useEffect(() => {
    if (publicKey) {
      const cachedAccounts = localStorage.getItem('cachedVestingAccounts');
      if (cachedAccounts) {
        setVestingAccounts(JSON.parse(cachedAccounts));
      } else {
        fetchVestingAccounts();
      }
    }
  }, [publicKey, fetchVestingAccounts]);

  const handleClaim = async (vestingAccountInfo: VestingAccountInfo) => {
    if (!publicKey || !signTransaction) {
      setError('Wallet not connected');
      return;
    }

    setClaimingAccount(vestingAccountInfo.vestingAccount.toString());
    setError(null);

    try {
      const wallet = {
        publicKey,
        signTransaction: signTransaction as anchor.Wallet['signTransaction'],
      };

      const txId = await unlockVesting(connection, wallet as anchor.Wallet, vestingAccountInfo);
      console.log('Claim transaction successful:', txId);
      
      await fetchVestingAccounts();
    } catch (err) {
      console.error('Error claiming tokens:', err);
      setError('Failed to claim tokens. Please try again.');
    } finally {
      setClaimingAccount(null);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-xl overflow-hidden">
      <div className="p-4 flex justify-between items-center bg-gray-700">
        <div className="flex bg-gray-600 rounded-lg p-1">
          <button
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors duration-200 ${
              !showClaimed ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:text-white'
            }`}
            onClick={() => setShowClaimed(false)}
          >
            Unclaimed
          </button>
          <button
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors duration-200 ${
              showClaimed ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:text-white'
            }`}
            onClick={() => setShowClaimed(true)}
          >
            Claimed
          </button>
        </div>
        <button 
          onClick={fetchVestingAccounts} 
          className="text-gray-400 hover:text-white transition-colors"
          title="Refresh vesting accounts"
        >
          <span className={`text-lg ${loading ? 'animate-spin inline-block' : ''}`}>⟳</span>
        </button>
      </div>
      
      <div className="p-4">
        {loading && <p className="text-center text-gray-400">Loading vesting accounts...</p>}
        
        {error && <p className="text-center text-red-500">{error}</p>}
        
        {!loading && !error && filteredAccounts.length === 0 && (
          <p className="text-center text-gray-400">No {showClaimed ? 'claimed' : 'unclaimed'} vesting accounts found.</p>
        )}
        
        {filteredAccounts.length > 0 && (
          <div className="overflow-x-auto custom-scrollbar max-h-[calc(100vh-300px)]">
            <table className="w-full table-auto">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Token</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Amount</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Unlock Date</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {filteredAccounts.map((account, index) => (
                  <tr key={index}>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">
                      {account.tokenInfo?.symbol || formatMint(account.mintAddress.toString())}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">
                      {formatAmount(account.amount, account.tokenInfo?.decimals || 0)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-300">
                      {formatUnlockDate(account.unlockTimestamp)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      {!showClaimed && account.isClaimable ? (
                        <button
                          onClick={() => handleClaim(account)}
                          disabled={claimingAccount === account.vestingAccount.toString()}
                          className={`px-3 py-1 text-xs font-medium rounded-md shadow-sm ${
                            claimingAccount === account.vestingAccount.toString()
                              ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                              : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                          } transition-colors duration-200`}
                        >
                          {claimingAccount === account.vestingAccount.toString() ? 'Claiming...' : 'Claim'}
                        </button>
                      ) : (
                        <button
                          disabled
                          className="px-3 py-1 text-xs font-medium rounded-md shadow-sm bg-gray-600 text-gray-400 cursor-not-allowed"
                        >
                          {showClaimed ? 'Claimed' : 'Not Claimable'}
                        </button>
                      )}
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

export default TokenUnlocker;