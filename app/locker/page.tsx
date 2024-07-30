// app/locker/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import TokenLocker from '../../components/TokenLocker';
import TokenUnlocker from '../../components/TokenUnlocker';

const TokenLockerPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'create' | 'unlock'>('create');
  const { connected } = useWallet();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // or a loading spinner
  }

  return (
    <div className="w-full min-h-screen flex flex-col items-center p-4 pt-16"> {/* Reduced top padding */}
      <div className="w-full max-w-4xl flex flex-col items-center">
        <h1 className="text-3xl font-bold text-center mb-1 text-white">Token Locker</h1> {/* Added header */}
        <p className="text-lg text-center mb-4 text-gray-300">Create a time-based token lock for any token</p> {/* Added subheader */}
        
        <div className="mb-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-300 dark:border-gray-700 p-1">
          <div className="flex">
            <button
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                activeTab === 'create'
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
              onClick={() => setActiveTab('create')}
            >
              Create
            </button>
            <button
              className={`px-3 py-1 rounded-lg ml-2 text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                activeTab === 'unlock'
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
              onClick={() => setActiveTab('unlock')}
            >
              Unlock
            </button>
          </div>
        </div>
        <div className="w-full relative">
          {!connected && (
            <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-md flex justify-center items-center z-10 rounded-lg">
              <div className="text-center">
                <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-200">No wallet connected</h3>
                <p className="mt-1 text-xs text-gray-400">Get started by connecting your wallet.</p> {/* Reduced font size */}
              </div>
            </div>
          )}
          <div className="bg-gray-800 p-4 rounded-lg shadow-lg"> {/* Reduced padding */}
            {activeTab === 'create' ? <TokenLocker /> : <TokenUnlocker />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenLockerPage;