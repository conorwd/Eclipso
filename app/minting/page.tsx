// app/minting/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import MintingForm from '../../components/MintingForm';
import SplMint from '../../components/SplMint';

const MintingPage: React.FC = () => {
  const { connected } = useWallet();
  const [isClient, setIsClient] = useState(false);
  const [activeView, setActiveView] = useState<'token2022' | 'spl'>('token2022');

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // or a loading spinner
  }

  return (
    <div className="w-full min-h-screen flex flex-col items-center p-4 pt-16"> {/* Reduced top padding */}
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-1 text-white">Eclipso Token Minting</h1> {/* Reduced font size and margin */}
        <p className="text-lg text-center mb-4 text-gray-300">Create new tokens on Eclipse SVM</p> {/* Reduced font size and margin */}
        
        <div className="flex justify-center mb-4"> {/* Reduced margin */}
          <div className="bg-gray-700 p-1 rounded-lg">
            <button
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                activeView === 'token2022'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
              onClick={() => setActiveView('token2022')}
            >
              Mint Token-2022
            </button>
            <button
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                activeView === 'spl'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
              onClick={() => setActiveView('spl')}
            >
              Mint SPL Token
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
                <p className="mt-1 text-xs text-gray-400">Connect your wallet to start minting tokens.</p> {/* Reduced font size */}
              </div>
            </div>
          )}
          <div className="bg-gray-800 p-4 rounded-lg shadow-lg"> {/* Reduced padding */}
            {activeView === 'token2022' ? <MintingForm /> : <SplMint />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MintingPage;