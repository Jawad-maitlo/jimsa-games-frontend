import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        arena: {
          bg: "#070917",
          surface: "#0F1226",
          card: "#141833",
          lightBg: "#F3F6FF",
          lightSurface: "#FFFFFF",
          violet: "#7C3AED",
          indigo: "#4F46E5",
        },
      },
      boxShadow: {
        glow: "0 0 30px rgba(124, 58, 237, 0.35)",
        "glow-sm": "0 0 16px rgba(124, 58, 237, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
