import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 8px 30px rgb(2 6 23 / 0.12)",
      },
      backgroundImage: {
        "hero-grid": "radial-gradient(circle at 1px 1px, rgb(148 163 184 / 0.18) 1px, transparent 0)",
      },
    },
  },
  plugins: [],
};

export default config;
