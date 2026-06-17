import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: "#B8860B",
          light: "#D4A017",
        },
        navy: {
          DEFAULT: "#1B2A4A",
          dark: "#1A2744",
        },
        cream: "#F5EFE0",
        "warm-white": "#FAF7F2",
      },
      fontFamily: {
        display: ["var(--font-cinzel)", "serif"],
        body: ["var(--font-lato)", "sans-serif"],
        ui: ["var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
      },
      letterSpacing: {
        label: "0.2em",
      },
      animation: {
        "bounce-slow": "bounce-slow 2s ease-in-out infinite",
        "fade-in": "fade-in 0.8s ease-out forwards",
      },
      keyframes: {
        "bounce-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(8px)" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
