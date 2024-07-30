// components/Logo.tsx
"use client";
import React from "react";
import Link from "next/link";

export const Logo = ({ isDark }: { isDark: boolean }) => {
  return (
    <Link href="/" passHref>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 60" width="240" height="60" className="mx-auto mb-6 cursor-pointer">
      <defs>
        <linearGradient id="moonGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7B3FE4" /> {/* Ethereum color */}
          <stop offset="100%" stopColor="#00FFA3" /> {/* Solana color */}
        </linearGradient>
        <clipPath id="craterClip">
          <circle cx="20" cy="20" r="3" />
          <circle cx="28" cy="30" r="4" />
          <circle cx="35" cy="18" r="2.5" />
        </clipPath>
      </defs>
      <g>
        {/* Moon */}
        <circle cx="30" cy="30" r="25" fill="url(#moonGradient)" />
        <circle cx="30" cy="30" r="25" fill={isDark ? "#1F2937" : "#F3F4F6"} clipPath="url(#craterClip)" />
        
        {/* Bridge arc */}
        <path d="M5,30 Q30,0 55,30" stroke="#00FFA3" strokeWidth="2" fill="none" />
        
        {/* Ethereum symbol */}
        <polygon points="12,30 18,24 18,36" fill="#7B3FE4" />
        
        {/* Solana symbol */}
        <circle cx="48" cy="30" r="3" fill="#00FFA3" />
        <circle cx="54" cy="30" r="3" fill="#00FFA3" />
        
        {/* Eclipse effect */}
        <circle cx="40" cy="30" r="23" fill={isDark ? "#1F2937" : "#F3F4F6"} />

        <text x="70" y="38" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="bold" fill={isDark ? "#F3F4F6" : "#1F2937"}>
          Eclipso
        </text>
      </g>
    </svg>
    </Link>
  );
};