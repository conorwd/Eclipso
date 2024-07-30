"use client";

import React, { useContext } from "react";
import Image from "next/image";
import { ThemeContext } from "../../contexts/ThemeProvider";

const Footer: React.FC = () => {
  const { isDark } = useContext(ThemeContext);

  return React.createElement(
    'footer',
    {
      className: "w-full flex flex-row items-center justify-center gap-8 fixed z-50 bottom-0 left-0 right-0 bg-transparent text-black shadow-xl border-t border-t-0.5 border-t-gray-300 py-4"
    },
    React.createElement(
      'div',
      {
        className: "max-w-md w-full flex flex-row items-center justify-center gap-4 text-black dark:text-white"
      },
      React.createElement('div', null, "Scaffold"),
      React.createElement('div', { className: "divider" }, "powered by"),
      React.createElement(
        'div',
        null,
        React.createElement(
          'a',
          {
            href: "https://builderz.dev",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "flex flex-row items-center justify-center gap-2 text-[4px) font-semibold]"
          },
          React.createElement(Image, {
            src: isDark ? "/images/builderz-white.svg" : "/images/builderz-black.svg",
            height: 20,
            width: 80,
            style: {
              objectFit: "contain",
            },
            alt: "builderz"
          })
        )
      )
    )
  );
};

export default Footer;