// components/SuccessModal.tsx
import React from 'react';
import { EXPLORER_URL } from '../utils/config';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenMint: string;
  amount: string;
  beneficiary: string;
  unlockDate: string;
  txId: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  tokenMint,
  amount,
  beneficiary,
  unlockDate,
  txId,
}: SuccessModalProps): React.ReactElement | null => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 m-4 max-w-sm w-full shadow-xl">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Token Lock Created Successfully</h2>
        <div className="mb-4 space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-300"><strong>Token Mint:</strong> {tokenMint}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300"><strong>Amount:</strong> {amount}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300"><strong>Beneficiary:</strong> {beneficiary}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300"><strong>Unlock Date:</strong> {unlockDate}</p>
        </div>
        <a
          href={`${EXPLORER_URL}${txId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mb-4 transition duration-150 ease-in-out"
        >
          View Transaction
        </a>
        <button
          onClick={onClose}
          className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;
