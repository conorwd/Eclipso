"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useContext } from "react";
import { ThemeContext } from "../contexts/ThemeProvider";
import dynamic from 'next/dynamic';

const TypeIt = dynamic(() => import('typeit-react'), { ssr: false });

const HomePage: React.FC = () => {
  const { isDark } = useContext(ThemeContext);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  const features = [
    { title: "Wallet Operations", description: "Manage your tokens with ease", link: "/wallet-operations" },
    { title: "Token Locker", description: "Secure your tokens with time-based locks", link: "/locker" },
    { title: "Token Minting", description: "Create your own SPL and Token-2022 coins", link: "/minting" },
    { title: "Token Vesting", description: "Set up vesting schedules for your tokens", link: "#", comingSoon: true },
    { title: "Airdrop Platform", description: "Distribute Tokens to Eclipse Users via our custom Claim Contract", link: "#", comingSoon: true },
    { title: "Launchpad", description: "Launch a Token via our custom Liquidity Bootstrapping Contract (LBP)", link: "#", comingSoon: true },
  ];

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-start px-4 relative overflow-hidden">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12 z-10 mt-20"
      >
        <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
          Welcome to Eclipso
        </h1>
        <TypeIt
          options={{
            strings: ["Your All-in-One Eclipse SVM Hub", "Making Eth on Sol Easy"],
            speed: 50,
            waitUntilVisible: true,
          }}
          className="text-2xl text-gray-600 dark:text-gray-300"
        />
      </motion.div>

      {/* Feature Showcase */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative bg-gray-800 hover:bg-gray-700 transition-colors duration-200 rounded-lg shadow-lg p-6 overflow-hidden"
          >
            <Link href={feature.link} className="block">
              <h2 className="text-2xl font-semibold text-white mb-2">{feature.title}</h2>
              <p className="text-gray-300">{feature.description}</p>
              {feature.comingSoon && (
                <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-bold py-1 px-2 rounded-full transform rotate-12">
                  Coming Soon
                </div>
              )}
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="text-center mb-12 z-10"
      >
        <h2 className="text-3xl font-bold mb-4">Get Started Now</h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
          Connect your wallet and explore the power of Eclipso
        </p>
        <Link href="/wallet-operations" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105">
          Launch App
        </Link>
      </motion.div>

      {/* Background Animation */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
    </div>
  );
};

export default HomePage;