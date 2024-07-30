"use client";

import React, { useContext, useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { ThemeContext } from "../../contexts/ThemeProvider";
import { Logo } from "../Logo";
import ThemeSwitcherComponent from "./ThemeSwitcher";
import MyMultiButton from "./MyMultiButton";

export default function PrimarySearchAppBar() {
  const { isDark, setIsDark } = useContext(ThemeContext);
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'py-2' : 'py-4'
      }`}
    >
      <Box
        className={`max-w-7xl mx-auto ${
          scrolled
            ? 'bg-white bg-opacity-80 dark:bg-gray-900 dark:bg-opacity-80 backdrop-blur-md shadow-lg'
            : 'bg-transparent'
        } rounded-full transition-all duration-300`}
      >
        <Toolbar className="justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4">
            <Logo isDark={isDark} />
            <Link href="/">
              <motion.span
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-lg font-bold text-gray-800 dark:text-white hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
              >
                Home
              </motion.span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {isHomePage && (
              <Link href="/locker">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-2 px-6 rounded-full shadow-md hover:shadow-lg transition-all duration-200 ease-in-out"
                >
                  Launch App
                </motion.button>
              </Link>
            )}
            <ThemeSwitcherComponent isDark={isDark} setIsDark={setIsDark} />
            <MyMultiButton />
          </div>
        </Toolbar>
      </Box>
    </motion.div>
  );
}